const puppeteer = require('puppeteer');

async function run() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
  
    await page.goto('https://www.bbc.co.uk/news/technology');

    // Extract the headlines
    const headlines = await page.evaluate(() => {
        let titles = Array.from(document.querySelectorAll('.gs-c-promo-heading__title'));
        return titles.map(title => title.innerText);
    });

    console.log(headlines);
  
    await browser.close();
}

run().catch(console.error);
