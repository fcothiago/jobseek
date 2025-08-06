const [Platform,platformSchema] = require('../models/platformModel');
exports.addPlatform = async (data) => {
	try{
		const platformData = {
			name:data.name,
			lastUpdate:data.lastupdate
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
exports.updatePlatformById = async (id,data) => {
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
exports.updatePlatformByName = async (name,data) => {
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
exports.deletePlatformByName = async (name) => {
	try{
		const platform = await Platform.findOneAndDelete({name:name});
		return platform ? platform : null;
	}
	catch(err){
		console.error(err);
		return null;
	}
};
exports.deletePlatformById = async (id) => {
	try{
		const platform = await Platform.findByIdAndDelete(id);
		return platform ? platform : null;
	}
	catch(err){
		console.error(err);
		return null;
	}
};
