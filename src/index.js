require('../src/models/User');
require('../src/models/Message');
require('../src/models/Quiz.js');

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const driverRoutes = require('./routes/driverRoutes');
const messageRoutes = require('./routes/messageRoutes');
const mediaBucketRoutes = require('./routes/mediaBucketRoutes');
const quizRoutes = require('./routes/quizRoutes');
const requireAuth = require('./middlewares/requireAuth');
require('dotenv').config();


const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(authRoutes);
app.use(driverRoutes);
app.use(messageRoutes);
app.use(mediaBucketRoutes);
app.use(quizRoutes);

app.get('/', requireAuth, (req, res) => {
    res.send('Welcome to Adverts 247 Rest API');
});

app.listen(PORT, () => {
    console.log(`Localhost is listening on port ${PORT}`);
})

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})

mongoose.connection.on('connected', () => {
    console.log('Successfully connected to mongo instance')
});

mongoose.connection.on('error', (err) => {
    console.log(err);
})

