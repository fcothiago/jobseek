require('dotenv').config();
const mongoose = require('mongoose');
const platformController = require('./controllers/platformController');
const companyController = require('./controllers/companyController');
const jobController = require('./controllers/jobController');
mongoose.connect(process.env.MONGO_URI).then( () => {
	console.log('Connected to MongoDB')
	companyController.getCompanyById(new mongoose.Types.ObjectId('689385c264e26cab7e7b684b')).then( async comp => {
		const id = comp._id;
		const d = new Date();
		const job = await jobController.addJob({
			companyId:comp._id,
			title:'DEV JR com 30 anos de experiencia',
			publicationDate: d,
			foundDate: d,
			url:'www.google.com',
			keywords:['java','python','node']
		});
		console.log(job);
		console.log(comp.jobs);
	}).catch( err => console.error(err));
});

