const [Platform,platformSchema] = require('../models/platformModel');
exports.addPlatform = async (name,lastupdate) => {
	try{
		const platformData = {
			name:name,
			lastUpdate:lastupdate,
			companies:[]
		};
		return await Platform.create(platformData);
	}
	catch(err){
		console.error(err);
		return null;
	}
};
exports.getPlatformById = async (id) => {
	try{
		return await Platform.findById(id);
	}catch(err){
		console.error(err);
		return null;
	}
}; 
exports.getPlatformByName = async (name) => {
	try{
		return await Platform.findOne({name:name});
	}catch(err){
		console.error(err);
		return null;
	}
};
exports.updatetPlatformById = async (id,data) => {
	try{
		const platform = await Platform.findByIdAndUpdate(id,data,{
			new:true,
			runValidators:true,
			upsert:false
		});
		return platform ? platform : null;
	}
	catch(err){
		console.error(err);
		return null;
	}
}; 
exports.updatetPlatformByName = async (name,data) => {
	try{
		const platform = await Platform.findOneAndUpdate({name:name},data,{
			new:true,
			runValidators:true,
			upsert:false
		});
		return platform ? platform : null;
	}
	catch(err){
		console.error(err);
		return null;
	}
}; 
