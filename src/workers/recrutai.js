const puppeteer = require('puppeteer');
const axios = require('axios').default;
const cheerio = require('cheerio');
const xml2js = require('xml2js');
const mongoose = require('mongoose');
const platformController = require('../controllers/platformController');
const companyController = require('../controllers/companyController');
const jobController = require('../controllers/jobController');
const utils = require('./utils');
const queryUrl = 'site:jobs.recrut.ai';
const checkDB = async () => {
	let plat = await platformController.getPlatformByName('recrutai');
	if(!plat)
		plat = await platformController.addPlatform({
			name:'recrutai'
		});
	return plat;
};
const searchCompanies = async () => {
	const regex = /^https:\/\/.*\.jobs\.recrut\.ai/;
	const google = await utils.googleQuery(queryUrl,8,2);
	const ddg = await utils.duckDuckGoQuery(queryUrl,2);
	const result = google.concat(ddg);
	return [...new Set(result)].filter(item => regex.test(item)).map( item => {
		const name = item.replace('https://','').split('.')[0];
		return {
			url:item,
			name:name
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
                });
                result.push(comp_);
        }
        return result;
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
const extractJobs = async (comp) => {
	const basePath = "company/public-jobs/*/*/*/*/*/";
	const response = await axios.get(`${comp.url}/${basePath}`);
	const html = response.data.html;
	const $ = cheerio.load(html);
	const result = [];
	$('div').first().find('div').each( (i,el) => {
		const keywords = [$(el).text()];
		console.log(keywords);
		//keywords = [...,$(el).find('b').map( item => item.text];
		console.log($(el).attr('href'));
	});
	return result;
};
const searchForJobs = async (companies) => {
	for(const comp of companies)
	{
		try{
			const jobs = await extractJobs(comp)
			for(const job of jobs)
				await updateJobs(job,comp);
			if(jobs.length > 0)
				break;
		}catch{
			console.log(`Failed to extract jobs from ${comp.name}`);	
		}
	}
};
const workflow = async () => {
	console.log('connected');
	const platform = await checkDB().then( result => result);
	if(!platform.lastUpdate)
	{
		const search = await searchCompanies();
		const companies = await updateCompanies(search,platform)
		await searchForJobs(companies); 
	}
	await mongoose.disconnect();
};
mongoose.connect(process.env.MONGO_URI).then( () => {
	workflow().then( result => console.log('done for inhire'));
});
