const axios = require('axios').default;
const cheerio = require('cheerio');
function delay(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}
exports.delay = (ms) => delay(ms);
exports.googleQuery = async (query,pages,num=10) => {
	let result = [];
	const baseUrl = `https://www.googleapis.com/customsearch/v1`;
	for(let page = 0; page < pages ; page++)
	{
		try{
			const response = await axios.get(baseUrl,{
				params:{
					key:process.env.GOOGLE_SEARCH_API_KEY,
					cx:process.env.GOOGLE_SEARCH_API_CX,
					num:num,
					startIndex:page*num+1,
					q:query
				}
			});
			const links = response.data.items.map(item => item.link);
			result = result.concat(links);
			if(links.length < num)
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
	$('.result__url').each( (i,el) => {
		const href = $(el).attr('href');
		result.push(href);
	});
	return result;
};
exports.duckDuckGoQuery = async (query,pages) => {
	let result = [];
	const baseUrl = `https://html.duckduckgo.com/html/`;
	const body = { b:"", q:query };
	for(let page = 0; page < pages ; page++)
	{
		try{	
			const data = page == 0 ? {...body} : {...body , s:page*10};
			const {data:html} = await axios.post(baseUrl, data,{
				headers:{
					'User-Agent':'PostmanRuntime/7.45.0',
					'Content-Type': 'application/x-www-form-urlencoded',
					'Host':'html.duckduckgo.com'
				}
			});
			const links = extractLinksFromDDG(html);
			result = result.concat(links);
			if(links.length < 10)
				break;
			await delay(process.env.DDG_QUERY_DELAY_MS);
		}
		catch(e){
			console.error(`Request to DuckDuckGo returned code ${e.response.status}`);
			break;
		}
	}
	return result;
};
