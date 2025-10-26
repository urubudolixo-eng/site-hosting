const express = require('express');
const multer = require('multer');
const unzipper = require('unzipper');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });
const port = process.env.PORT || 3000;

app.use(express.static('public')); // Serve frontend
app.use(express.json());

// Rota pra upload ZIP e hospedar
app.post('/host', upload.single('zipFile'), (req, res) => {
  const customUrl = req.body.customUrl || 'site-padrao';
  const zipPath = req.file.path;
  const extractPath = path.join(__dirname, 'hosted', customUrl);

  fs.mkdirSync(extractPath, { recursive: true });
  fs.createReadStream(zipPath)
    .pipe(unzipper.Extract({ path: extractPath }))
    .on('close', () => {
      fs.unlinkSync(zipPath); // Limpa ZIP
      res.json({ message: 'Site hospedado!', url: `/${customUrl}` });
    })
    .on('error', (err) => res.status(500).json({ error: 'Erro ao extrair ZIP' }));
});

// Serve sites hospedados em /custom-url
app.use('/', express.static(path.join(__dirname, 'hosted')));

app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
