const mongoose = require('mongoose');
const [Job,jobSchema] = require('./jobModel');
const companySchema = new mongoose.Schema({
	name:{
		type:String,
		require:true,
		unique:true
	},
	lastUpdate:{
		type:Date,
		required:true
	},
	platformId:{
		type:mongoose.Schema.Types.ObjectId,
		ref:'Platform',
		required:true
	}
});
const Company = mongoose.model('Company',companySchema);
module.exports = [Company,companySchema];
