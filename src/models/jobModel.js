const mongoose = require('mongoose');
const jobSchema = new mongoose.Schema({
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
	url : {
		type:String,
		required:true,
	}
});
const Job = mongoose.model('Job',jobSchema);
module.exports = [Job,jobSchema];
