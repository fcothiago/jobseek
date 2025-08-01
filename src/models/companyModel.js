const mongoose = require('mongoose');
const [Job,jobSchema] = require('./jobModel');
const companySchema = new mongoose.Schema({
	name:{
		type:String,
		require:true,
		unique:true
	},
	lastupdate:{
		type:Date,
		required:true
	},
	jobs:{
		type:[jobSchema],
		required:true
	}
});
const Company = mongoose.model('Company',companySchema);
module.exports = [Company,companySchema];
