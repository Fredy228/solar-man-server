const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const path = require('path');
const sendEmailRouter = require('./routes/sendEmailRoute');
const usersRouter = require('./routes/usersRoute');
const portfolioRouter = require('./routes/portfolioRoute');

const app = express();

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short';

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());
app.use(express.static('build'));
app.use(express.static('static'));

app.use('/api/phone-send', sendEmailRouter);
app.use('/api/admin', usersRouter);
app.use('/api/admin/portfolio', portfolioRouter);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

app.listen(3001, () => {
  console.log('Server started on port 5000');
});
