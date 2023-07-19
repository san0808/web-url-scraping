const { chromium } = require('playwright');
const axios = require('axios');
require('dotenv').config();

const PROXYCURL_API_KEY = process.env.PROXYCURL_API_KEY;

async function fetchProfileInfo(url) {
  const response = await axios.get(`https://api.proxycurl.com/v1/scrape`, {
    params: {
      url,
      api_key: PROXYCURL_API_KEY,
      scrape_type: 'linkedin',
    },
  });
  
  return response.data;
}
async function performSearch(prompt, numPages = 20) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const searchResults = [];

  for (let pageIdx = 1; pageIdx <= numPages; pageIdx++) {
    const pageUrl = `https://www.google.com/search?q=${encodeURIComponent(prompt)}&start=${(pageIdx - 1) * 10}`;
    await page.goto(pageUrl);
    await page.waitForLoadState('networkidle');

    const pageSearchResults = await page.$$eval('div.g a', (links) => links.map((link) => link.href));
    searchResults.push(...pageSearchResults);
  }

  await browser.close();
 //return searchResults;
 const profileInfoList = [];
 for (const url of searchResults) {
   try {
     const profileInfo = await fetchProfileInfo(url);
     profileInfoList.push(profileInfo);
   } catch (error) {
     console.error(`Error fetching profile info for ${url}: ${error.message}`);
   }
 }

 return profileInfoList;
}

module.exports = { performSearch };


// const { webkit } = require('playwright'); // Use 'webkit' instead of 'chromium' for regular browser

// async function performSearch(prompt) {
//   const browser = await webkit.launch({ headless: false }); // Launch regular browser
//   const context = await browser.newContext();
//   const page = await context.newPage();

//   await page.goto(`https://www.google.com/search?q=${encodeURIComponent(prompt)}`);
//   await page.waitForLoadState('networkidle');

//   const searchResults = await page.$$eval('div.g a', (links) =>
//     links.map((link) => link.href)
//   );

//   // You might want to keep the browser open to see the search results in the regular browser.
//   // Uncomment the following line to keep the browser open.
//   // await page.waitForTimeout(0);

//   await browser.close();
//   return searchResults;
// }

// module.exports = { performSearch };
