const puppeteer = require('puppeteer');

const run = async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://www.dia.es/charcuteria-y-quesos/jamon-cocido-lacon-fiambres-y-mortadela/c/L2001');
    
    // Make screen bigger
    await page.setViewport({ width: 1920, height: 1080});
    
    // Wait for the page to be fully loaded
    await autoScroll(page);

    const products = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll("li[data-test-id='product-card-list-item']"))
              .map(e => e.querySelector('p'));
        return elements.map(e => e?.innerText);
    });
    console.log(products);
};

run().catch(console.error);


// Auto scroll, needed to load all the products
async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight - window.innerHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}
