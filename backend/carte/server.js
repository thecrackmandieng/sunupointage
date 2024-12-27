require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Base de données MongoDB connectée'))
  .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Modèle utilisateur
const User = mongoose.model('User ', new mongoose.Schema({
  nom: String,
  prenom: String,
  email: { type: String, unique: true }, // Assurez-vous que l'email est unique
  password: String,
  api_token: String, // Pour stocker le token API
  rfidUID: String, // UID de la carte RFID
  created_at: { type: Date, default: Date.now }, // Date de création
  updated_at: { type: Date, default: Date.now } // Date de mise à jour
}), 'utilisateurs'); // Spécifiez le nom de la collection ici

// Middleware d'authentification
function authenticateToken(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).send('Accès refusé');

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send('Token invalide');
    req.user = user;
    next();
  });
}

// Communication avec Arduino via USB
const port = new SerialPort({ path: '/dev/ttyUSB0', baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

// Stocker les clients connectés pour les SSE
let clients = [];

// Route pour les Server-Sent Events
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Ajouter le client à la liste
  clients.push(res);

  // Supprimer le client lorsque la connexion est fermée
  req.on('close', () => {
    clients = clients.filter(client => client !== res);
  });
});

// Gestion des données reçues depuis l'Arduino
parser.on('data', async (data) => {
  // Nettoyer l'UID reçu pour enlever le préfixe
  const uid = data.trim().replace('Carte détectée : ', '');
  console.log(`UID reçu : ${uid}`); // Afficher l'UID reçu

  try {
    // Rechercher l'utilisateur dans la base de données avec l'UID nettoyé
    const user = await User.findOne({ rfidUID: uid });
    if (user) {
      console.log(`Accès autorisé pour : ${user.nom} ${user.prenom}`);
      // Émettre un événement vers tous les clients connectés
      clients.forEach(client => client.write(`data: ${JSON.stringify({ status: 'AUTHORIZED', uid })}\n\n`));
      
      // Générer un token JWT pour l'utilisateur
      const apiToken = jwt.sign({ id: user._id, nom: user.nom }, process.env.JWT_SECRET, { expiresIn: '1h' });
      user.api_token = apiToken; // Mettre à jour le token API
      await user.save(); // Sauvegarder l'utilisateur avec le nouveau token
    } else {
      console.log('Accès refusé : UID non reconnu');
      // Émettre un événement de refus
      clients.forEach(client => client.write(`data: ${JSON.stringify({ status: 'DENIED', uid })}\n\n`));
    }
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'UID:', error);
    clients.forEach(client => client.write(`data: ${JSON.stringify({ status: 'ERROR', message: 'Erreur lors de la vérification de l\'UID' })}\n\n`));
  }
});
// Routes de l'application
app.post('/login', async (req, res) => {
  const { email, password, rfidUID } = req.body;

  try {
    let user;

    // Connexion via RFID
    if (rfidUID) {
      user = await User.findOne({ rfidUID });
      if (!user) return res.status(400).send('Carte RFID non reconnue');

    } else {
      // Connexion via email et mot de passe
      user = await User.findOne({ email });
      if (!user) return res.status(400).send('Identifiants incorrects');

      // Vérification du mot de passe
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).send('Identifiants incorrects');
    }

    // Générer un nouveau token API
    const apiToken = jwt.sign({ id: user._id, nom: user.nom }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.api_token = apiToken; // Mettre à jour le token API
    await user.save(); // Sauvegarder l'utilisateur avec le nouveau token

    res.json({ api_token: user.api_token });
  } catch (error) {
    res.status(500).send('Erreur du serveur');
  }
});

app.post('/register', async (req, res) => {
  const { nom, prenom, email, password, rfidUID } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).send('L\'email est déjà enregistré');

    const newUser  = new User({ nom, prenom, email, password, rfidUID });
    await newUser .save();

    res.send('Utilisateur enregistré avec succès');
  } catch (error) {
    res.status(500).send('Erreur du serveur');
  }
});

app.get('/dashboard', authenticateToken, (req, res) => {
  res.send(`Bienvenue ${req.user.name}, ceci est votre tableau de bord`);
});

// Démarrage du serveur
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));