
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const signupUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword, role });
        await user.save();

        const token = jwt.sign( { id: user._id, name: user.name, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token, role: user.role });
    } catch (error) {
        res.status(500).json({ error: 'Signup failed' });
    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, name: user.name, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, role: user.role });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};

const getUserProfile = async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    res.json({ message: `Welcome, ${user.role}!`, user });
  });
};

module.exports = {
    signupUser,
    loginUser,
    getUserProfile
};