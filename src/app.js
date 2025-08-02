require('dotenv').config();
const mongoose = require('mongoose');
const platform = require('./models/platformModel');
const platformController = require('./controllers/platformController');
mongoose.connect(process.env.MONGO_URI).then( () => {
	console.log('Connected to MongoDB')
	let plat;
	platformController.getPlatformByName('plataformaTeste').then( e => console.log(e)).catch( err => console.error(err));
	console.log(plat)
});

