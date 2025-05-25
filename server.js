const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));

app.get('/', (req, res) => {
  res.send('Backend para descarga de scripts .py está activo');
});

app.get('/api/script', (req, res) => {
  const { id, token } = req.query;
  if (token !== 'free_user_token') {
    return res.status(403).json({ error: 'Token inválido' });
  }
  const file = `${id}.py`;
  const url = `${req.protocol}://${req.get('host')}/scripts/${file}`;
  return res.json({ download_url: url });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});