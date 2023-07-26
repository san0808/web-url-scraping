const { chromium } = require('playwright');
const fs = require('fs');

async function performSearch(prompt, numPages = 1) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const searchResults = [];

  for (let pageIdx = 1; pageIdx <= numPages; pageIdx++) {
    const pageUrl = `https://www.google.com/search?q=${encodeURIComponent(prompt)}&start=${(pageIdx - 1) * 10}`;
    await page.goto(pageUrl);
    await page.waitForLoadState('networkidle');

    const pageSearchResults = await page.$$eval('div.g', (results) => {
      return results.map((result) => {
        const titleElement = result.querySelector('h3');
        const snippetElements = result.querySelectorAll('div.VwiC3b.yXK7lf.MUxGbd.yDYNvb.lyLwlc.lEBKkf'); 
        const urlElement = result.querySelector('a');

        const title = titleElement ? titleElement.innerText : '';
        const snippet = Array.from(snippetElements).map((el) => el.innerText).join(' '); 
        const url = urlElement ? urlElement.href : '';

        return { title, snippet, url };
      });
    });

    searchResults.push(...pageSearchResults);
  }

  await browser.close();

  let jsonData = {};
  if (fs.existsSync('test.json')) {
    const rawData = fs.readFileSync('test.json');
    jsonData = JSON.parse(rawData);
  }

  const promptKey = `prompt-${Object.keys(jsonData).length + 1}`;
  const resultsKey = `results-${Object.keys(jsonData).length + 1}`;
  jsonData[promptKey] = prompt;
  jsonData[resultsKey] = searchResults;

  fs.writeFileSync('test.json', JSON.stringify(jsonData, null, 2));

  return searchResults;
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
