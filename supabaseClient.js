import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const insertProducts = async (products) => {
  supabase
    .from('products')
    .insert(e)
    .then(console.log)
    .catch(console.error);
}

module.exports = {
  supabase,
  insertProducts
};
