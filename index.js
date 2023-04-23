const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const https = require('https');

const options = {
  cert: fs.readFileSync(
    '../../etc/letsencrypt/live/solarman.pro/fullchain.pem'
  ),
  key: fs.readFileSync('../../etc/letsencrypt/live/solarman.pro/privkey.pem'),
};

const sendEmailRouter = require('./routes/sendEmailRoute');

const app = express();

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short';

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());
app.use(express.static('build'));

app.use('/api/phone-send', sendEmailRouter);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

https.createServer(options, app).listen(443, () => {
  console.log('Server started on port 443');
});
