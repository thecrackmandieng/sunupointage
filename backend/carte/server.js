require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

// Configuration du port
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connectée'))
  .catch((err) => {
    console.error('Erreur de connexion MongoDB:', err);
    process.exit(1); // Arrêter le serveur si la connexion échoue
  });

// Modèles Mongoose
const User = mongoose.model(
  'User',
  new mongoose.Schema(
    {
      nom: { type: String, required: true },
      prenom: { type: String, required: true },
      email: { type: String, unique: true, required: true },
      password: { type: String, required: true },
      rfidUID: { type: String, unique: true },
      api_token: { type: String },
      role: { type: String, enum: ['admin', 'vigile', 'user'], default: 'user' },
    },
    { collection: 'utilisateurs' }
  )
);

const Pointage = mongoose.model(
  'Pointage',
  new mongoose.Schema(
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
      nom: { type: String },
      prenom: { type: String },
      rfidUID: { type: String, required: true },
      status: { type: String, enum: ['AUTHORIZED', 'DENIED'], required: true },
      date: { type: String, required: true },
      firstTime: { type: String },
      secondTime: { type: String, default: null },
      createdAt: { type: Date, default: Date.now },
    }
  )
);

// Communication avec Arduino via USB
const port = new SerialPort({ path: '/dev/ttyUSB0', baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

// Middleware JWT
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(403).json({ message: 'Token manquant' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide', error });
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user.role || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès interdit. Vous devez être admin.' });
  }
  next();
};

// Gestion des données reçues de l'Arduino
parser.on('data', async (data) => {
  const rawUID = data.trim();
  const uid = rawUID.replace(/^Carte détectée :\s*/, '').toUpperCase();
  console.log(`UID nettoyé reçu : ${uid}`);

  try {
    const user = await User.findOne({ rfidUID: uid });
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = now.toTimeString().split(' ')[0]; // HH:mm:ss

    if (user) {
      console.log(`Accès autorisé pour : ${user.nom} ${user.prenom}`);

      // Création ou mise à jour d'un pointage
      const existingPointage = await Pointage.findOne({ userId: user._id, date });
      if (existingPointage) {
        existingPointage.secondTime = time;
        await existingPointage.save();
        io.emit('rfid', {
          status: 'AUTHORIZED',
          user,
          pointage: existingPointage,
        });
      } else {
        const newPointage = new Pointage({
          userId: user._id,
          nom: user.nom,
          prenom: user.prenom,
          rfidUID: uid,
          status: 'AUTHORIZED',
          date,
          firstTime: time,
        });
        await newPointage.save();
        io.emit('rfid', {
          status: 'AUTHORIZED',
          user,
          pointage: newPointage,
        });
      }
    } else {
      console.log('UID non reconnu, accès refusé.');
      io.emit('rfid', { status: 'DENIED', uid });
    }
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'UID:', error);
    io.emit('rfid', { status: 'ERROR', message: 'Erreur serveur' });
  }
});

// Endpoints
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }
    const user = await User.findOne({ email });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.api_token = token;
    await user.save();

    res.json({ message: 'Connexion réussie', api_token: token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
});

app.get('/admin/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs', error });
  }
});

app.post('/api/servo/set-angle', (req, res) => {
  const { angle } = req.body;
  if (angle === 90) {
    console.log('Servo déplacé à 90°');
    res.json({ message: 'Servo déplacé à 90°' });
  } else if (angle === 0) {
    console.log('Servo déplacé à 0°');
    res.json({ message: 'Servo déplacé à 0°' });
  } else {
    res.status(400).json({ error: 'Commande inconnue reçue' });
  }
});

// Démarrage du serveur
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
