const supabase = require('./supabase');

async function clearProducts() {
  console.log('Clearing all dummy products from Supabase...');
  try {
    const { error } = await supabase.from('products').delete().gt('id', -1);
    if (error) {
      console.error('❌ Failed to delete products:', error.message);
    } else {
      console.log('✅ Successfully removed all dummy products from the database!');
    }
  } catch(e) {
    console.error('Fatal error:', e);
  }
}

clearProducts();
