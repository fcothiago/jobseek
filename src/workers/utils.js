const axios = require('axios').default;
exports.googleQuery = async (query,pages) => {
	let result = [];
	const baseUrl = `https://www.googleapis.com/customsearch/v1`;
	for(let page = 0; page < pages ; pages++)
	{
		const url = ``;
		try{
			const response = await axios.get(baseUrl,{
				params:{
					key:process.env.GOOGLE_SEARCH_API_KEY,
					cx:process.env.GOOGLE_SEARCH_API_CX,
					num:10,
					startIndex:page*10+1,
					q:query
				}
			});
			const links = response.data.items.map(item => item.link);
			result.concat(links);
			if(links.length < 10)
				break;
		}
		catch(e){
			conso
			break;
		}
		
	}
	return result;
};
