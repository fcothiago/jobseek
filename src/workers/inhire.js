const puppeteer = require('puppeteer');
const axios = require('axios').default;
const cheerio = require('cheerio');
const xml2js = require('xml2js');
const mongoose = require('mongoose');
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
	return urls.filter(url => regex.test(url)).map(url => {
		const name = url.replace(regex,'').replace('/','');
		return {
			name:name,
			url:url
		};
	});
};
const updateCompanies = async (companies,platform) => {
	const result = [];
	for(const comp of companies)
	{
		let comp_ = await companyController.getCompaniesByName(comp.name,platform._id);
		comp_  = comp_.length ? comp_[0] : await companyController.addCompany({
			name:comp.name,
			url:comp.url.toString(),
			platformId:platform._id
		})
		result.push(comp_);
	}
	return result;
};
const extractJobsLinks = async (url,page) => {
	await page.goto(url, { waitUntil: 'networkidle0' });
	const regex = /.*\/vagas\/.*/;
	const links = await page.$$eval('a', anchors => anchors.map(a => a.href))
	return links.filter( link => { 
		regex.test(link);
	}).map(link => `${url}${link}`);
};
const searchForJobs = async (companies,page) => {
	for(const comp of companies)
	{
		const { data: html } = await axios.get(comp.url);
		const $ = cheerio.load(html);
		const regex = /^https:\/\/.*inhire\.app\/vagas/;
		let jobsUrl;
		$('a').each( (i,el) => {
			const href = $(el).attr('href');
			if(regex.test(href))
			{
				jobsUrl = href;
				return false;
			}
		});
		if(jobsUrl)
		{
			const jobs = await extractJobsLinks(jobsUrl,page);
			jobs.forEach(item => {
				console.log(item);
			});
		}
		break;
	}
};
const workflow = async () => {
	console.log('connected');
	const platform = await checkDB().then( result => result);
	const browser = await puppeteer.launch({
		headless: false,
		executablePath:process.env.CHROMIUM_PATH
	});
	const page = await browser.newPage();
	if(!platform.lastUpdate)
	{
		const search = await searchCompanies();
		const companies = await updateCompanies(search,platform);
		const jobs = await searchForJobs(companies,page); 
	}
	//await browser.close();
	await mongoose.disconnect();
};
mongoose.connect(process.env.MONGO_URI).then( () => {
	workflow().then( result => console.log('done for inhire'));
});
