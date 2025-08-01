require('dotenv').config();
const mongoose = require('mongoose');
const platform = require('./models/platform');
mongoose.connect(process.env.MONGO_URI).then( () => console.log('Connected to MongoDB') );
