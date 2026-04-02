/**
 * Vercel Serverless Function — прокси к Bitrix24 REST API
 * Файл: api/proxy.js
 */
export default async function handler(req, res) {
  // CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  const hook = req.query.hook || '';
  if (!hook) {
    return res.status(400).json({ error: 'Параметр hook обязателен' });
  }

  // URL: /api/tasks.task.list → method = tasks.task.list
  const urlParts = req.url.split('/api/')[1]?.split('?')[0] || '';
  const method = urlParts; // например "tasks.task.list"

  const apiUrl = hook + '/' + method + '.json';

  try {
    const bitrixRes = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: req.method === 'POST' ? JSON.stringify(req.body) : undefined,
    });

    const data = await bitrixRes.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(bitrixRes.status).json(data);
  } catch (e) {
    return res.status(502).json({ error: 'Ошибка: ' + e.message });
  }
}
