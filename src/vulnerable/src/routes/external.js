const express = require('express');
const axios = require('axios');
const { authenticate } = require('../middleware');

const router = express.Router();

// A10: SSRF (Server-Side Request Forgery) — the server fetches arbitrary URLs
// provided by the client with no validation or allowlist.
//
// This can be exploited to:
//   - Access internal services (e.g., http://169.254.169.254/latest/meta-data/)
//   - Scan internal network ports
//   - Access localhost services
//   - Fetch files via file:// protocol (if not blocked by axios)
router.get('/fetch-external-record', authenticate, async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL requerida' });
  }

  // No URL validation, no allowlist, no scheme restriction
  // The server will fetch ANY URL the client provides
  try {
    const response = await axios.get(url, {
      // Follows redirects, no timeout, accepts any status
      maxRedirects: 5,
      timeout: 10000,
      // No restriction on internal IPs, localhost, or metadata endpoints
    });

    res.json({
      url,
      status: response.status,
      headers: response.headers,
      data: response.data,
    });
  } catch (err) {
    res.status(502).json({
      error: 'Error al obtener el recurso externo',
      details: err.message,
      requestedUrl: url,
    });
  }
});

module.exports = router;
