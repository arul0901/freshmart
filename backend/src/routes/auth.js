const express = require('express');
const router = express.Router();

const users = [
  { id: 1, name: 'Admin', email: 'admin@freshmart.in', password: 'admin123', role: 'admin' }
];

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser, token: `fm_token_${user.id}` });
});

router.post('/signup', (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing required fields' });
  const newUser = { id: users.length + 1, name, email, phone, password, role: 'customer' };
  users.push(newUser);
  const { password: _, ...safeUser } = newUser;
  res.status(201).json({ success: true, user: safeUser, token: `fm_token_${newUser.id}` });
});

module.exports = router;
