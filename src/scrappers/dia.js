const puppeteer = require('puppeteer');

const scrapDia = async () => {
  let products = [];
  const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0); // Disable timeout
  await page.goto('https://www.dia.es/charcuteria-y-quesos/jamon-cocido-lacon-fiambres-y-mortadela/c/L2001');

  // Make screen bigger
  await page.setViewport({ width: 1920, height: 1080 });
  await autoScroll(page);
  const categories = await getCategoriesAndSubcategories(page);
  for (const [category, subcategories] of Object.entries(categories)) {

    for (const [subcategory, url] of Object.entries(subcategories)) {
      await page.goto(url);
      await autoScroll(page);
      const category_pages = await getPages(page);
      if(category_pages.length === 0) {
        const res = (await scrapPage(page)).map(e => ({ ...e, category, subcategory }));
        products.push(...res);
      }
      for (const category_page of category_pages) {
        await page.goto(category_page);
        const res = (await scrapPage(page)).map(e => ({ ...e, category, subcategory }));
        products.push(...res);
      }
      console.log(products);
    }
  }
};

const getPages = async (page) => {
  await autoScroll(page);
  const pages = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll("a[data-test-id='pagination-number']"));
    return elements.map(e => e?.href);
  });
  return pages;
};

const getCategoriesAndSubcategories = async page => {
  const categories = await page.evaluate(() => {
    const cats = Array.from(document.querySelectorAll("li[data-test-id='categories-list-element']"));
    return Object.fromEntries(cats.map(e => [e?.innerText?.split('\n')[0], e?.querySelector('a')?.href]));
  });
  const res = {};
  for (const [category, url] of Object.entries(categories)) {
    await page.goto(url);
    await page.waitForFunction(() => document.querySelectorAll("div[data-test-id='sub-category-item']").length);
    const subcategories = await page.evaluate(() => {
      const subcats = Array.from(document.querySelectorAll("div[data-test-id='sub-category-item']"));
      return Object.fromEntries(subcats.map(e => [e?.innerText?.split('\n')[0], e?.querySelector('a')?.href]));
    });
    res[category] = subcategories;
  }
  return res;
};

const scrapPage = async page => {

  await autoScroll(page);

  const products = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll("li[data-test-id='product-card-list-item']"));
    return Object.fromEntries(elements.map(e => [e?.innerText?.split('\n')[0], e?.querySelector('a')?.href]));
  });
  // Access to each HREF from the products and obtain information
  const result = [];
  for (const [key, value] of Object.entries(products)) {
    await page.goto(value);
    await page.waitForFunction(() => document.querySelectorAll('li').length);
    const raw_macros = await page.evaluate(() => Array.from(document.querySelectorAll("li.nutritional-values__items")).map(e => e.innerText.replace(/\n/g, ' ')));
    const macros = handleMacros(raw_macros);

    const brand = key.match(/\b[A-Z\s\W]+\b/g)[0];

    const price = await page.evaluate(() => document.querySelector("p.buy-box__active-price").innerText.split('€')[0]);
    const price_per_kg = await page.evaluate(() => document.querySelector("p.buy-box__price-per-unit").innerText.match(/(\d+,\d+)/)[1]);
    result.push({
      name: key,
      macronutrients: macros,
      url: value,
      price: price?.replace(',', '.') ?? 0,
      price_per_kg: price_per_kg?.replace(',', '.') ?? 0,
      brand
    });
  }
  return result;
};

scrapDia().catch(console.error);

function handleMacros(macros) {
  const result = {};
  macros.forEach(macro => {
    if (macro.includes('Grasas')) {
      const grasa_total = macro.match(/Grasas\s+(\d+(,\d+)?)g/)?.[1];
      const grasa_saturada = macro.match(/saturadas\s+(\d+(,\d+)?)g/)?.[1];
      result.saturated_fat = grasa_saturada?.replace(',', '.');
      result.fat = grasa_total?.replace(',', '.') ?? 0;
    }
    else if (macro.includes('Hidratos')) {
      const hidratos_totales = macro.match(/Hidratos .*\s+(\d+(,\d+)?)g/)?.[1];
      result.cho = hidratos_totales?.replace(',', '.') ?? 0;
    }
    else if (macro.includes('Proteínas')) {
      const proteinas = macro.match(/Proteínas\s+(\d+(,\d+)?)g/)?.[1];
      result.protein = proteinas?.replace(',', '.') ?? 0;
    }
    else if (macro.includes('Sal')) {
      const sal = macro.match(/Sal\s+(\d+(,\d+)?)g/)?.[1];
      console.log('salt', sal);
      result.salt = sal?.replace(',', '.') ?? 0;
    }
  });
  return result;
};

// Auto scroll, needed to load all the products
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {

          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

module.exports = {
  scrapDia
};
