const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Proxy all requests to Supabase
app.use('/supabase', createProxyMiddleware({
  target: 'https://vylywbbvrsyccsarrtfk.supabase.co',
  changeOrigin: true,
  pathRewrite: {
    '^/supabase': '', // remove /supabase from the path
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔄 Proxying: ${req.method} ${req.url} → ${proxyReq.path}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`✅ Response: ${proxyRes.statusCode} for ${req.url}`);
  },
  onError: (err, req, res) => {
    console.error(`❌ Proxy error: ${err.message}`);
    res.status(500).json({ error: 'Proxy error' });
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Proxy server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying /supabase/* → https://vylywbbvrsyccsarrtfk.supabase.co/*`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
