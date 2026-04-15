const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

const CSV_HEADERS = [
  'id', 'created_at', 'action_type', 'entity_type', 'entity_id',
  'status', 'api_route', 'user_id', 'ip_address', 'error_message',
];

/**
 * GET /api/logs
 * Fetches system logs with filtering — for Admin Dashboard (paginated)
 */
router.get('/', async (req, res) => {
  const { action, status, userId, search, limit = 100 } = req.query;

  try {
    let query = supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (action) query = query.eq('action_type', action);
    if (status) query = query.eq('status', status);
    if (userId) query = query.eq('user_id', userId);
    if (search) {
      query = query.or(`error_message.ilike.%${search}%,api_route.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/logs/export?format=csv|json
 * Full export (no limit) — server-side CSV/JSON streaming
 */
router.get('/export', async (req, res) => {
  const { format = 'json', action, status, search } = req.query;

  try {
    let query = supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (action) query = query.eq('action_type', action);
    if (status) query = query.eq('status', status);
    if (search) {
      query = query.or(`error_message.ilike.%${search}%,api_route.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    const dateStr = new Date().toISOString().split('T')[0];

    if (format === 'csv') {
      const escape = (val) => {
        if (val === null || val === undefined) return '';
        const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"` : str;
      };

      const csvRows = [
        CSV_HEADERS.join(','),
        ...data.map(row => CSV_HEADERS.map(h => escape(row[h])).join(',')),
      ];

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="freshmart_logs_${dateStr}.csv"`);
      res.send(csvRows.join('\n'));
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="freshmart_logs_${dateStr}.json"`);
      res.json(data);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
