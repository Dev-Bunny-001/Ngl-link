const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

const DATA_FILE = path.join(__dirname, 'database', 'names.json');

app.use(express.json());
app.use(express.static('public'));

// Ensure names.json exists
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');

// Handle submission
app.post('/submit', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Name is required' });

  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  data.push({ name, time: new Date().toISOString() });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

  res.json({ message: 'Name submitted successfully!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
