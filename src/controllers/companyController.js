const mongoose = require('mongoose');
const [Platform,platformSchema] = require('../models/platformModel');
const [Company,companySchema] = require('../models/companyModel');
exports.addCompany = async (data) => {
	try{
		const company = await Company.create([{
			name:data.name,
			lastUpdate:data.lastUpdate,
			platformId:data.platformId
		}]);
		return company;
	}catch(err){
		console.error(err);
	}
};
exports.getCompaniesByName = async (name) => {
	try{
		return await Company.findAll({name:name});
	}catch(err){
		console.error(err);
	}
};
exports.getCompanyById = async (id) => {
	try{
		return await Company.findById(id);
	}catch(err){
		console.error(err);
	}
};
exports.updateCompanyById = async (id,data) => {
	try{
		const company = await Company.findByIdAndUpdate(id,data,{
			new:true,
			runValidators:true,
			upsert:false
		});
		return company;
	}catch(err){
		console.error(err);
	}
};
exports.deleteCompanyById = async (id) => {
	try{
		return await Company.findByIdAndDelete(id);
	}catch(err){
		console.error(err);
	}
};
