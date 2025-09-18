const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for all origins
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// Custom logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// In-memory storage for URLs
const urls = new Map(); // shortcode -> { originalUrl, expiry, createdAt, clicks: [] }

// Helper function to generate a unique shortcode
function generateShortcode() {
  return Math.random().toString(36).substring(2, 8);
}

// Helper function to validate URL
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// POST /shorturls - Create a short URL
app.post('/shorturls', (req, res) => {
  const { url, validity = 30, shortcode } = req.body;

  // Validate URL
  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid or missing URL' });
  }

  let code = shortcode;
  if (!code) {
    // Generate unique shortcode
    do {
      code = generateShortcode();
    } while (urls.has(code));
  } else {
    // Check if shortcode is unique
    if (urls.has(code)) {
      return res.status(400).json({ error: 'Shortcode already exists' });
    }
  }

  // Calculate expiry
  const expiry = new Date(Date.now() + validity * 60 * 1000);

  // Store the URL data
  urls.set(code, {
    originalUrl: url,
    expiry,
    createdAt: new Date(),
    clicks: []
  });

  // Response
  res.json({
    shortLink: `http://localhost:5001/${code}`,
    expiry: expiry.toISOString()
  });
});

// GET /shorturls/:shortcode - Get stats for a shortcode
app.get('/shorturls/:shortcode', (req, res) => {
  const code = req.params.shortcode;
  const data = urls.get(code);

  if (!data) {
    return res.status(404).json({ error: 'Shortcode not found' });
  }

  res.json({
    originalUrl: data.originalUrl,
    createdAt: data.createdAt.toISOString(),
    expiry: data.expiry.toISOString(),
    clicks: data.clicks.length,
    clickDetails: data.clicks
  });
});

// GET /shorturls - List all short URLs (for stats page)
app.get('/shorturls', (req, res) => {
  const list = Array.from(urls.entries()).map(([code, data]) => ({
    shortcode: code,
    originalUrl: data.originalUrl,
    expiry: data.expiry.toISOString(),
    clicks: data.clicks.length
  }));
  res.json(list);
});

// GET /:shortcode - Redirect to original URL
app.get('/:shortcode', (req, res) => {
  const code = req.params.shortcode;
  const data = urls.get(code);

  if (!data) {
    return res.status(404).json({ error: 'Shortcode not found' });
  }

  if (new Date() > data.expiry) {
    return res.status(410).json({ error: 'Link has expired' });
  }

  // Log the click
  const click = {
    timestamp: new Date().toISOString(),
    referrer: req.get('Referrer') || '',
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent') || ''
  };
  data.clicks.push(click);

  // Redirect
  res.redirect(data.originalUrl);
});

// Start the server on port 5001
app.listen(5001, () => {
  console.log('URL Shortener backend running on port 5001');
});
