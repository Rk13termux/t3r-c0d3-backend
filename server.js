const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));

const scripts = {
  wifi_attack: {
    filename: 'wifi_attack.py',
    pro: false
  },
  port_scan: {
    filename: 'port_scan.py',
    pro: true
  }
};

const users = {
  'free_user_token': { type: 'free' },
  'pro_user_token': { type: 'pro' }
};

app.get('/api/script', (req, res) => {
  const { id, token } = req.query;

  if (!id || !token) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }

  const user = users[token];
  const script = scripts[id];

  if (!user) {
    return res.status(403).json({ error: 'Usuario no autorizado' });
  }

  if (!script) {
    return res.status(404).json({ error: 'Script no encontrado' });
  }

  if (script.pro && user.type !== 'pro') {
    return res.status(401).json({ error: 'Acceso solo para usuarios PRO' });
  }

  const scriptUrl = `${req.protocol}://${req.get('host')}/scripts/${script.filename}`;
  return res.json({ download_url: scriptUrl });
});

app.get('/', (req, res) => {
  res.send('Backend para descarga de scripts .py está activo');
});

app.listen(PORT, () => {
  console.log(`Servidor activo en puerto ${PORT}`);
});