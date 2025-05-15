const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

const DATA_FILE = path.join(__dirname, 'messages.json');
const PASSWORD = "Dev Bunny";

app.use(express.json());

if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');

// Serve main form
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Dev Bunny - Submit Message</title>
  <style>
    body {
      background-color: #0077ff;
      font-family: Arial, sans-serif;
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    .container {
      background-color: rgba(0, 0, 0, 0.6);
      padding: 30px;
      border-radius: 10px;
      text-align: center;
      width: 90%;
      max-width: 400px;
    }
    textarea {
      width: 100%;
      height: 100px;
      padding: 10px;
      border-radius: 5px;
      border: none;
      resize: none;
    }
    button {
      margin-top: 10px;
      padding: 10px 20px;
      background-color: limegreen;
      border: none;
      border-radius: 5px;
      color: white;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Leave a Message</h1>
    <textarea id="message" placeholder="Type your message here..."></textarea>
    <button onclick="submitMessage()">Submit</button>
  </div>

  <script>
    function submitMessage() {
      const message = document.getElementById('message').value.trim();
      if (!message) return alert("Please enter a message.");

      fetch('/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      })
      .then(res => res.json())
      .then(data => alert(data.message))
      .catch(err => alert("Error submitting message"));
    }
  </script>
</body>
</html>`);
});

// Serve inbox page
app.get('/inbox', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Dev Bunny Inbox</title>
  <style>
    body {
      background-color: #111;
      color: #fff;
      font-family: Arial, sans-serif;
      padding: 20px;
    }
    #login, #messages {
      max-width: 600px;
      margin: auto;
    }
    .msg {
      background: #222;
      padding: 10px;
      margin: 10px 0;
      border-left: 4px solid limegreen;
    }
  </style>
</head>
<body>
  <div id="login">
    <h2>Enter Password</h2>
    <input type="password" id="password" placeholder="Password" />
    <button onclick="login()">Login</button>
  </div>

  <div id="messages" style="display:none;">
    <h2>Submitted Messages</h2>
    <div id="msg-list"></div>
  </div>

  <script>
    function login() {
      const pw = document.getElementById('password').value;
      fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          document.getElementById('login').style.display = 'none';
          document.getElementById('messages').style.display = 'block';
          fetchMessages();
        } else {
          alert("Wrong password.");
        }
      });
    }

    function fetchMessages() {
      fetch('/messages')
        .then(res => res.json())
        .then(data => {
          const list = document.getElementById('msg-list');
          list.innerHTML = '';
          data.forEach((msg, i) => {
            const div = document.createElement('div');
            div.className = 'msg';
            div.innerText = msg.message + '\n' + new Date(msg.time).toLocaleString();
            list.appendChild(div);
          });
        });
    }
  </script>
</body>
</html>`);
});

// Handle message submission
app.post('/submit', (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: 'Message is required' });

  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  data.push({ message, time: new Date().toISOString() });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

  res.json({ message: 'Message submitted!' });
});

// Handle login
app.post('/login', (req, res) => {
  const { password } = req.body;
  res.json({ success: password === PASSWORD });
});

// Get messages
app.get('/messages', (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
