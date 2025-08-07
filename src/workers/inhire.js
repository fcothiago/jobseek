const { workerData, parentPort } = require('worker_threads');
const mongoose = require('mongoose');
const platformController = require('../controllers/platformController');
const companyController = require('../controllers/companyController');
const jobController = require('../controllers/jobController');
const siteMap = 'https://www.inhire.com.br/page-sitemap.xml';
const checkDB = async () => {
	let plat = await platformController.getPlatformByName('inhire');
	if(!plat)
		plat = await platformController.addPlatform({
			name:'inhire',
			lastUpdate: new Date()
		});
	return plat;
};
mongoose.connect(workerData.uri).then( async () => {
	console.log('connected');
	const platform = await checkDB();
	console.log(platform);
	await mongoose.disconnect();
});
