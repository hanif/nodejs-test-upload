const express = require('express');
const app = express();
const path = require('path');
const formidable = require('formidable');
const fs = require('fs');
const config = require('./config.json');
const colors = require('colors');

app.post('/test', (req, res) => {
  const form = new formidable.IncomingForm();
  const targetFile = `${Date.now()}.dat`;

  form.multiples = true;
  form.uploadDir = __dirname;

  form.on('file', (field, file) => {
    fs.rename(file.path, path.join(form.uploadDir, targetFile));
  });

  form.on('error', (err) => {
    res.end(`error: ${err}`.red);
  });

  form.on('end', () => {
    res.end(`${targetFile} uploaded.`);
  });

  form.parse(req);
});

app.get('/test', (req, res) => {
  const rand = Math.random();
  res.end(`random: ${rand}`);
});

const server = app.listen(config.port, () => {
  console.log(`Server listening on port ${config.port}`);
});
