require('dotenv').config();
const mongoose = require('mongoose');
const platformController = require('./controllers/platformController');
const companyController = require('./controllers/companyController');
mongoose.connect(process.env.MONGO_URI).then( () => {
	console.log('Connected to MongoDB')
	platformController.getPlatformByName('plataformaTeste').then( async plat => {
		const id = plat._id;
		const d = new Date();
		const comp = await companyController.addCompany({
			platformId:id,
			name:'Acne Comp',
			lastUpdate: d
		});
		console.log(comp);
	}).catch( err => console.error(err));
});

