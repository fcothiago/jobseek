const puppeteer = require('puppeteer');
const axios = require('axios').default;
const cheerio = require('cheerio');
const xml2js = require('xml2js');
const mongoose = require('mongoose');
const platformController = require('../controllers/platformController');
const companyController = require('../controllers/companyController');
const jobController = require('../controllers/jobController');
const utils = require('./utils');
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
		});
		result.push(comp_);
	}
	return result;
};
const extractJobs = async (url) => {
	const subdomain = url.replace('https://','').replace('.inhire.app/vagas','')
	const {data:jobs} = await axios.get('https://api.inhire.app/job-posts/public/pages',{
		headers:{
			'X-Tenant' : subdomain
		}
	});
	return jobs ? jobs['jobsPage'].filter( job => job.status === 'published'  ).map(job => { 
		return {
			title:job.displayName,
			location:job.location,
			keywords:[job.workplaceType],
			url:`${url}${job.jobId}`
		};		
	}) : [] ;
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
		try
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
				const jobs = await extractJobs(jobsUrl);
				await updateJobs(jobs,comp);
			}
			console.log(`finished job extraction for ${comp.name} in inhire`);
		}
		catch
		{
			console.log(`Failed to extract jobs from ${comp.name} in inhire`);
		}
		utils.delay(60000);
	}
};
const workflow = async () => {
	console.log('connected');
	const platform = await checkDB().then( result => result);
	if(!platform.lastUpdate)
	{
		const search = await searchCompanies();
		const companies = await updateCompanies(search,platform);
		await searchForJobs(companies); 
	}
	await mongoose.disconnect();
};
mongoose.connect(process.env.MONGO_URI).then( () => {
	workflow().then( result => console.log('done for inhire'));
});
