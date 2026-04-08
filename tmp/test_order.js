const axios = require('axios');

async function testOrder() {
  try {
    const res = await axios.post('http://localhost:3001/api/orders', {
      customer: 'Test User',
      email: 'test@example.com',
      items: 1,
      amount: 100,
      slot: '7-9AM',
      products: [1]
    });
    console.log('✅ Success:', res.data);
  } catch (err) {
    if (err.response) {
      console.error('❌ Error:', err.response.status, err.response.data);
    } else {
      console.error('❌ Error:', err.message);
    }
  }
}

testOrder();
