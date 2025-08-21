const mongoose = require('mongoose');
const jobSchema = new mongoose.Schema({
	companyId : {
		type:mongoose.Schema.Types.ObjectId,
		ref:'Company',
                required:true
	},
	title : {
		type:String,
		required:true,
	},
	keywords : {
		type:[String],
		required:false
	},
	foundDate : {
		type:Date,
		required:true
	},
	publicationDate : {
		type:Date,
		required:false
	},
	location:{
		type:String,
		required:false
	},
	url : {
		type:String,
		required:true,
		unique:true
	}
});
const Job = mongoose.model('Job',jobSchema);
module.exports = [Job,jobSchema];
