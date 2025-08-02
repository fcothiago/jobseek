const mongoose = require('mongoose');
const [company,companySchema] = require('./companyModel');
const platformSchema = new mongoose.Schema({
	name:{
		type:String,
		required:true,
		unique:true
	},
	lastUpdate:{
		type:Date,
		required:true
	},
	companies:[{
		type:mongoose.Schema.Types.ObjectId,
		ref:'Company',
		required:true
	}]
});
const Platform = mongoose.model('Platform',platformSchema);
module.exports = [Platform,platformSchema];
