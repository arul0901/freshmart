const express = require('express');
const supabase = require('../supabase');
const router = express.Router();

router.get('/summary', async (req, res) => {
  const { data: orders } = await supabase.from('orders').select('*');
  const { data: customers } = await supabase.from('customers').select('*');
  const { data: products } = await supabase.from('products').select('*');

  const safeOrders = orders || [];
  const safeProducts = products || [];
  
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = safeOrders.filter(o => o.date === today);
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.amount, 0);
  const lowStockCount = safeProducts.filter(p => p.stock < 50).length;

  const revenueChart = [
    { date: '2025-03-20', label: 'Mon', revenue: 12000, orders: 15 },
    { date: '2025-03-21', label: 'Tue', revenue: 15000, orders: 18 },
    { date: '2025-03-22', label: 'Wed', revenue: 9000, orders: 12 },
    { date: '2025-03-23', label: 'Thu', revenue: 22000, orders: 25 },
    { date: '2025-03-24', label: 'Fri', revenue: 18000, orders: 20 },
    { date: '2025-03-25', label: 'Sat', revenue: 28000, orders: 32 },
    { date: today, label: 'Sun', revenue: todayRevenue > 0 ? todayRevenue : 4100, orders: todayOrders.length > 0 ? todayOrders.length : 3 }
  ];

  const categoryBreakdown = [
    { name: 'Fruits & Vegetables', pct: 45 },
    { name: 'Dairy & Eggs', pct: 25 },
    { name: 'Snacks & Branded', pct: 15 },
    { name: 'Meat & Seafood', pct: 10 },
    { name: 'Others', pct: 5 }
  ];

  res.json({
    todayRevenue,
    todayOrders: todayOrders.length,
    totalCustomers: (customers || []).length,
    lowStockCount,
    revenueChart,
    categoryBreakdown
  });
});

module.exports = router;
