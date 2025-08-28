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
	const regex = /^https:\/\/.*\.jobs\.recrut\.ai/;
	const dataPath = "company/public-jobs/*/*/*/*/*/";
	const basePath = comp.url.match(regex)[0];
	const response = await axios.get(`${basePath}/${dataPath}`);
	const html = response.data.html;
	const $ = cheerio.load(html);
	const result = [];
	$('tbody').each( (i,el) => {
		$(el).find('tr').each( (i,el) =>{
			const job = $(el).find('td')[0];
			const title = $(job).text();
			const url = `${basePath}/${$(job).attr('href')}`;
			const keywords = [];
			$(el).find('td').each( (i,el) => {
				const text = $(el).text();
				if(text)
					keywords.push(text);
			});	
			result.push({
				title:title,
				url:url,
				foundDate:new Date(),
				keywords:keywords
			});
		});
	});
	return result;
};
const searchForJobs = async (companies) => {
	for(const comp of companies)
	{
		try{
			const jobs = await extractJobs(comp)
			await updateJobs(jobs,comp);
		}catch(e){
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
		const companies = [(await companyController.getCompaniesByName('itrecruiter',platform._id))[0]];
		await searchForJobs(companies); 
	}
	await mongoose.disconnect();
};
mongoose.connect(process.env.MONGO_URI).then( () => {
	workflow().then( result => console.log('done for inhire'));
});
