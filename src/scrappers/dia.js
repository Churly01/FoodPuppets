const puppeteer = require('puppeteer');
const { insertProducts } = require('../../supabaseClient.js');

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
    debugger;
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

const storeImage = async (image_blob) => {
  console.log(image_blob);
};

const scrapProduct = async (page, name, url) => {
  await page.goto(url);
  await page.waitForFunction(() => document.querySelectorAll('li').length);
  const raw_macros = await page.evaluate(() => Array.from(document.querySelectorAll("li.nutritional-values__items")).map(e => e.innerText.replace(/\n/g, ' ')));
  const macros = handleMacros(raw_macros);

  const image_src = await page.evaluate(() => document.querySelector("img[data-test-id='product-image']").src);
  // "/product_images/273810/273810_ISO_0_ES.jpg?imwidth=392"
  const id = `dia-image_src.match(/product_images\/(\d+)\//)[1]`;
  await fetch(image_src).then(res => res.blob()).then(storeImage);
  debugger;
  const brand = name.match(/\b[A-Z\s\W]+\b/g)[0];
  const price = await page.evaluate(() => document.querySelector("p.buy-box__active-price").innerText.split('€')[0]);
  const price_per_kg = await page.evaluate(() => document.querySelector("p.buy-box__price-per-unit").innerText.match(/(\d+,\d+)/)[1]);
  return {
    name,
    image_src,
    macronutrients: macros,
    url,
    price: price?.replace(',', '.') ?? 0,
    price_per_kg: price_per_kg?.replace(',', '.') ?? 0,
    brand
  };
}

const scrapPage = async page => {

  await autoScroll(page);
  debugger;
  const products = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll("li[data-test-id='product-card-list-item']"));
    return Object.fromEntries(elements.map(e => [e?.innerText?.split('\n')[0], e?.querySelector('a')?.href]));
  });
  // Access to each HREF from the products and obtain information
  const result = [];
  for (const [product_name, url] of Object.entries(products)) {
    const res = await scrapProduct(page, product_name, url);
    result.push(res);
  }
  return result;
};

//scrapDia().catch(console.error);

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


const test = async () => {
  const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const url = "https://www.dia.es/charcuteria-y-quesos/jamon-cocido-lacon-fiambres-y-mortadela/p/263497?analytics_list_id=L2001&analytics_list_name=charcuteria_y_quesos_jamon_cocido_lacon_fiambres_y_mortadela&index=1";
  page.setDefaultNavigationTimeout(0); // Disable timeout
  const test_res = await scrapProduct(page, "Pechuga de pavo en finas lonchas Elpozo sobre 115 g", url);
  return test_res;
}

test()
  .then(console.log)
  .catch(console.error);


module.exports = {
  scrapDia
};
