const mongoose = require('mongoose');
const [Company,companySchema] = require('../models/companyModel');
const [Job,jobSchema] = require('../models/jobModel');
exports.addJob = async (data) => {
        try{
                const job = await Job.create([{
			companyId:data.companyId,
                        title:data.title,
			keywords:data.keyword,
			foundDate:data.foundDate,
			publicationDate:data.publicationDate,
			url:data.url
                }]); 
		return job;
        }catch(err){
                console.error(err);
        }
};
exports.getJobByTitle = async (title) => {
        try{
                return await Job.findAll({title:title});
        }catch(err){
                console.error(err);
        }
};
exports.getJobById = async (id) => {
        try{
                return await Job.findById(id);
        }catch(err){
                console.error(err);
        }
};
exports.getJobByUrl = async (url) => {
        try{
                return await Job.findOne({url:url});
        }catch(err){
                console.error(err);
        }
};
exports.updateCompanyById = async (id,data) => {
        try{
                const job = await Job.findByIdAndUpdate(id,data,{
                        new:true,
                        runValidators:true,
                        upsert:false
                });
                return job;
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
