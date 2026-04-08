const fs = require('fs');
const path = require('path');
const supabase = require('./supabase');

async function seed() {
  console.log('Starting Supabase data seed...');
  let hasErrors = false;

  try {
    // 1. Products
    const productsPath = path.join(__dirname, 'data/products.json');
    if (fs.existsSync(productsPath)) {
      const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
      const { error } = await supabase.from('products').upsert(products);
      if (error) { console.error('❌ Error seeding products:', error); hasErrors = true; }
      else console.log(`✅ Seeded ${products.length} products successfully.`);
    }

    // 2. Orders
    const ordersPath = path.join(__dirname, 'data/orders.json');
    if (fs.existsSync(ordersPath)) {
      const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
      orders.forEach(o => { o.products = JSON.stringify(o.products); });
      const { error } = await supabase.from('orders').upsert(orders);
      if (error) { console.error('❌ Error seeding orders:', error); hasErrors = true; }
      else console.log(`✅ Seeded ${orders.length} orders successfully.`);
    }

    // 3. Customers
    const customersPath = path.join(__dirname, 'data/customers.json');
    if (fs.existsSync(customersPath)) {
      const customers = JSON.parse(fs.readFileSync(customersPath, 'utf8'));
      const { error } = await supabase.from('customers').upsert(customers);
      if (error) { console.error('❌ Error seeding customers:', error); hasErrors = true; }
      else console.log(`✅ Seeded ${customers.length} customers successfully.`);
    }

    // 4. Coupons
    const couponsPath = path.join(__dirname, 'data/coupons.json');
    if (fs.existsSync(couponsPath)) {
      const coupons = JSON.parse(fs.readFileSync(couponsPath, 'utf8'));
      const { error } = await supabase.from('coupons').upsert(coupons);
      if (error) { console.error('❌ Error seeding coupons:', error); hasErrors = true; }
      else console.log(`✅ Seeded ${coupons.length} coupons successfully.`);
    }

    if (!hasErrors) console.log('\n🎉 All local data has been successfully pushed to your Supabase project!');
    else console.log('\n⚠️ Completed with some errors. Please check the logs above. Make sure the SQL tables have been created.');
    
  } catch(e) {
    console.error('Fatal error during seeding:', e);
  }
}

seed();
