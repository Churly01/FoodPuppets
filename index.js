require('dotenv').config();

const { scrapDia } = require('./src/scrappers/dia.js');
const { supabase } = require('./supabaseClient.js');

const test = [
  {
    name: 'Salami extra NUESTRA ALACENA BANDEJA 200 GR',
    macronutrients: {
      saturated_fat: '15',
      fat: '40',
      cho: '1',
      protein: '18',
      salt: '3.4'
    },
    url: 'https://www.dia.es/charcuteria-y-quesos/lomo-chorizo-fuet-salchichon/p/274141?analytics_list_id=L2005&analytics_list_name=charcuteria_y_quesos_lomo_chorizo_fuet_salchichon&index=8',
    price: '1.69',
    price_per_kg: '8.45',
    brand: ' ',
    category: 'Charcutería y quesos',
    subcategory: 'Lomo, chorizo, fuet, salchichón'
  },
  {
    name: 'Espetec extra NUESTRA ALACENA BOLSA 170 GR',
    macronutrients: {
      saturated_fat: '13',
      fat: '37',
      cho: '3',
      protein: '28.5',
      salt: '5'
    },
    url: 'https://www.dia.es/charcuteria-y-quesos/lomo-chorizo-fuet-salchichon/p/274137?analytics_list_id=L2005&analytics_list_name=charcuteria_y_quesos_lomo_chorizo_fuet_salchichon&index=9',
    price: '2.19',
    price_per_kg: '12.88',
    brand: ' ',
    category: 'Charcutería y quesos',
    subcategory: 'Lomo, chorizo, fuet, salchichón'
  },
  {
    name: 'Chorizo y salchichón extra NUESTRA ALACENA pack 2 unidades BANDEJA 200 GR',
    macronutrients: {
      saturated_fat: '6.8',
      fat: '19.5',
      cho: '1',
      protein: '19',
      salt: '3.5'
    },
    url: 'https://www.dia.es/charcuteria-y-quesos/lomo-chorizo-fuet-salchichon/p/273991?analytics_list_id=L2005&analytics_list_name=charcuteria_y_quesos_lomo_chorizo_fuet_salchichon&index=10',
    price: '2.45',
    price_per_kg: '12.25',
    brand: ' ',
    category: 'Charcutería y quesos',
    subcategory: 'Lomo, chorizo, fuet, salchichón'
  }
];



// scrapDia().then((data) => {
//   data.forEach(e => {
//     supabase
//       .from('products')
//       .insert(e)
//       .then(console.log)
//       .catch(console.error);
//   });
// });
