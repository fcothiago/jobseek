const axios = require('axios').default;
const xml2js = require('xml2js');
const mongoose = require('mongoose');
const puppeteer = require('puppeteer');
const platformController = require('../controllers/platformController');
const companyController = require('../controllers/companyController');
const jobController = require('../controllers/jobController');
const siteMap = 'https://www.inhire.com.br/page-sitemap.xml';
const checkDB = async () => {
	let plat = await platformController.getPlatformByName('inhire');
	if(!plat)
		plat = await platformController.addPlatform({
			name:'inhire'
		});
	return plat;
};
const searchCompanies = async () => {
	console.log('Updating companies in inhire.app ');
	const xml = await axios.get(siteMap);
	const parser = new xml2js.Parser();
	const result = await parser.parseStringPromise(xml.data);
	let urls = result.urlset.url.map(item => item.loc[0]);
	const regex = /^https:\/\/www\.inhire\.com\.br\/carreiras[\/-]*/;
	return urls.filter(item => regex.test(item)).map(item => {
		const name = item.replace(regex,'').replace('/','');
		return {
			name:name,
			url:url
		};
	});
};
const updateCompanies = (companies,platform) => {
	return await companies.map( async comp => {

	});
};
mongoose.connect(process.env.MONGO_URI).then( async () => {
	console.log('connected');
	const platform = await checkDB();
	const browser = await puppeteer.launch({
		headless: true, 
		executablePath:process.env.CHROMIUM_PATH
	});
	const page = await browser.newPage();
	if(!platform.lastUpdate)
	{
		const search = await searchCompanies();

	}
	await mongoose.disconnect();
	await browser.close();
});
