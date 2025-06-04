import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import dotenv from 'dotenv';
import session from 'express-session';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB is connected'))
    .catch(err => console.error('❌ MongoDB error', err));

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    secret: String,
    currency: Number,
    isAdmin: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);

const algorithm = 'aes-256-cbc';
const key = crypto.scryptSync('secret-key', 'salt', 32);
const iv = Buffer.alloc(16, 0);

function encrypt(text) {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    return Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]).toString('base64');
}

function decrypt(encrypted) {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    return Buffer.concat([decipher.update(Buffer.from(encrypted, 'base64')), decipher.final()]).toString('utf8');
}

function isAuthenticated(req, res, next) {
    if (req.session.user) return next();
    return res.status(401).json({ message: 'Not authenticated' });
}

function isAdmin(req, res, next) {
    const user = req.session.user;
    if (!user) return res.status(401).json({ message: 'Not authenticated' });
    if (!user.isAdmin) return res.status(403).json({ message: 'Admin access only' });
    next();
}

(async () => {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
        const hashed = await bcrypt.hash('admin', 10);
        const encrypted = encrypt('chiken');
        await User.create({
            username: 'admin',
            password: hashed,
            secret: encrypted,
            currency: 0,
            isAdmin: true
        });
        console.log('👑 User admin created');
    }
})();

app.post('/register', async (req, res) => {
    const { username, password, secret } = req.body;
    const userExists = await User.findOne({ username });
    if (userExists) return res.status(400).json({ message: 'The user already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const encrypted = encrypt(secret);
    const currency = Math.floor(Math.random() * 1000) + 1;

    await User.create({ username, password: hashed, secret: encrypted, currency });
    res.json({ message: '✅ User registered' });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'No login or password specified' });

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Incorrect password' });

    req.session.user = {
        username: user.username,
        isAdmin: user.isAdmin
    };

    res.json({ message: 'Successful entry' });
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ message: 'Logout failed' });
        res.json({ message: 'Logged out' });
    });
});

app.post('/restore', async (req, res) => {
    const { username, password, secret } = req.body;
    if (!username || !password || !secret) {
        return res.status(400).json({ message: 'It is necessary to specify login, new password and secret phrase' });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const decryptedSecret = decrypt(user.secret);
    if (decryptedSecret !== secret) {
        return res.status(401).json({ message: 'Wrong secret phrase' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password successfully updated' });
});

app.post('/admin/update-currency', isAdmin, async (req, res) => {
    const { targetUser, amount } = req.body;

    const target = await User.findOne({ username: targetUser });
    if (!target) return res.status(404).json({ message: 'User not found' });

    target.currency = Number(amount);
    await target.save();

    res.json({ message: '💰 Currency updated' });
});

app.post('/admin/users', isAdmin, async (req, res) => {
    const users = await User.find({}, '-password -secret');
    res.json({ users });
});

app.post('/decrypt', isAuthenticated, (req, res) => {
    const { encrypted } = req.body;
    try {
        const result = decrypt(encrypted);
        res.json({ decrypted: result });
    } catch (err) {
        res.status(400).json({ message: 'Transcription error' });
    }
});

app.get('/whoami', (req, res) => {
    res.json(req.session.user || { message: 'Not logged in' });
});

app.get('/admin/export', isAdmin, async (req, res) => {
    try {
        const users = await User.find({});
        const exportPath = path.join(__dirname, 'backup', `users-backup-${Date.now()}.json`);
        await fs.ensureDir(path.dirname(exportPath));
        await fs.writeJson(exportPath, users, { spaces: 2 });

        res.json({ message: '📦 Backup complete', path: exportPath });
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ message: 'Export failed' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});
