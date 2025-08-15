const puppeteer = require('puppeteer');
const axios = require('axios').default;
const cheerio = require('cheerio');
const xml2js = require('xml2js');
const mongoose = require('mongoose');
const platformController = require('../controllers/platformController');
const companyController = require('../controllers/companyController');
const jobController = require('../controllers/jobController');
const checkDB = async () => {
	let plat = await platformController.getPlatformByName('solidjobs');
	if(!plat)
		plat = await platformController.addPlatform({
			name:'solid'
		});
	return plat;
};
const searchCompanies = async () => {
	console.log('Updating companies in Solidjobs ');	
};
const updateCompanies = async (companies,platform) => {

};
const extractJobs = async (url) => {

};
const updateJobs = async (jobs,company) => {
	for(const data of jobs)
	{
		let job = await jobController.getJobByUrl(data.url);
		job = job ? job :  await jobController.addJob({
			...data,
			companyId:company._id,
			foundDate:new Date()
		});
	}
};
const searchForJobs = async (companies) => {
	for(const comp of companies)
	{
		
	}
};
const workflow = async () => {
	console.log('connected');
	const platform = await checkDB().then( result => result);
	if(!platform.lastUpdate)
	{
		const search = await searchCompanies();
		const companies = await updateCompanies(search,platform);
		const jobs = await searchForJobs(companies); 
	}
	await mongoose.disconnect();
};
mongoose.connect(process.env.MONGO_URI).then( () => {
	workflow().then( result => console.log('done for inhire'));
});
