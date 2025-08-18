const axios = require('axios').default;
const cheerio = require('cheerio');
exports.googleQuery = async (query,pages) => {
	let result = [];
	const baseUrl = `https://www.googleapis.com/customsearch/v1`;
	for(let page = 0; page < pages ; pages++)
	{
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
			console.error(`Request to Google API returned code ${e.response}`);
			break;
		}
		
	}
	return result;
};
const extractLinksFromDDG = (html) => {
	let result = [];
	const $ = cheerio.load(html);
	const regex = /^https:\/\/vagas\.solides\.com\.br\.app\/vagas/;
	$('a.result__url').each( (i,el) => {
		const href = $(el).attr('href');
		if(regex.test(href))
			result.push(href);
	});
	return result;
};
exports.duckDuckGoQuery = async (query,pages) => {
	let result = [];
	const baseUrl = `https://html.duckduckgo.com/html/`;
	const body = { b:"", q:query };
	for(let page = 0; page < pages ; pages++)
	{
		try{	
			const {data:html} = await axios.post(baseUrl,
				page === 0 ? body  : {...body , s:page*10}
			);
			const links = extractLinksFromDDG(html);
			result.concat(links);
			if(links.length < 10)
				break;
		}
		catch(e){
			console.error(`Request to DuckDuckGo returned code ${e.response.status}`);
			break;
		}
	}
	return result;
};
