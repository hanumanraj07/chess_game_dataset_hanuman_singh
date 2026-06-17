require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Match = require('../models/Match');
const Player = require('../models/Player');
const Opening = require('../models/Opening');

async function backupData() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/chess_analytics';
    console.log(`Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('Connected successfully to MongoDB.');

    const backupDir = path.join(__dirname, '../../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFolder = path.join(backupDir, `backup_${timestamp}`);
    fs.mkdirSync(backupFolder);

    console.log('Starting data export...');

    // Backup Matches
    const matches = await Match.find({}).lean();
    fs.writeFileSync(path.join(backupFolder, 'matches.json'), JSON.stringify(matches, null, 2));
    console.log(`Backed up ${matches.length} matches.`);

    // Backup Players
    const players = await Player.find({}).lean();
    fs.writeFileSync(path.join(backupFolder, 'players.json'), JSON.stringify(players, null, 2));
    console.log(`Backed up ${players.length} players.`);

    // Backup Openings
    const openings = await Opening.find({}).lean();
    fs.writeFileSync(path.join(backupFolder, 'openings.json'), JSON.stringify(openings, null, 2));
    console.log(`Backed up ${openings.length} openings.`);

    console.log(`Backup completed successfully at: ${backupFolder}`);
    process.exit(0);
  } catch (error) {
    console.error('Backup failed:', error);
    process.exit(1);
  }
}

backupData();
