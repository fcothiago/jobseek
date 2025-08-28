const puppeteer = require('puppeteer');
const axios = require('axios').default;
const cheerio = require('cheerio');
const xml2js = require('xml2js');
const mongoose = require('mongoose');
const platformController = require('../controllers/platformController');
const companyController = require('../controllers/companyController');
const jobController = require('../controllers/jobController');
const utils = require('./utils');
const queryUrl = 'site:vagas.solides.com.br';
const apiUrl = 'https://apigw.solides.com.br/jobs/v3/home/vacancy';
const checkDB = async () => {
	let plat = await platformController.getPlatformByName('solides');
	if(!plat)
		plat = await platformController.addPlatform({
			name:'solides'
		});
	return plat;
};
const searchCompanies = async () => {
	const regex = /^https:\/\/.*\.vagas\.solides\.com\.br/;
	const google = await utils.googleQuery(queryUrl,2,2);
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
const extractKeywords = (item) => {
	const state = item.state.name;
	const city = item.city.name;
	const type = item.jobType;
	const seniority = item.seniority.map(item => item.name);
	const contract = item.recruitmentContractType.map(item => item.name);
	const benefits = item.benefits.map(item => item.name);
	const education = item.education.map(item => item.name);
	const occupationAreas = item.occupationAreas.map(item => item.name);
	const hardSkills = item.hardSkills.map(item => item.name);
	return [seniority,contract,benefits,education,occupationAreas,hardSkills].reduce( (acc,item) => {
		return acc.concat(item);
	},[state,city,type]);
};
const extractJobs = async (comp) => {
	let totalPages=0;
	let currentPage=1;
	let result = [];
	do{
                const response = await axios.get(apiUrl,{
			params:{
				page:currentPage,
				slug:comp.name
			}
		});
		totalPages = response.data.data.totalPages;
		currentPage = response.data.data.currentPage;
		const jobs = response.data.data.data.map( item => {
			return {
				title:item.title,
				url:item.redirectLink,
				foundDate:new Date(),
				keywords:extractKeywords(item)
			}
		});
		result = result.concat(Array(jobs));	
		if(!totalPages || !currentPage)
			break;	
	}while(currentPage < totalPages);	
	return result;
};
const searchForJobs = async (companies) => {
	for(const comp of companies)
	{
		const jobs = await extractJobs(comp);
		await updateJobs(job,comp);
		break;
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
