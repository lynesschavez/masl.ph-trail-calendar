export default function handler(req, res) {
  const { type, title, body } = req.query;

  const ogImageUrl = `https://masl.ph/api/og?type=${encodeURIComponent(type || '')}&title=${encodeURIComponent(title || '')}&body=${encodeURIComponent(body || '')}`;

  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html>
<head>
  <meta property="og:title"       content="${(title || 'MASL.PH').replace(/"/g, '&quot;')}" />
  <meta property="og:description" content="${(body  || 'Philippine Trail Race & Hike Calendar').replace(/"/g, '&quot;')}" />
  <meta property="og:image"       content="${ogImageUrl}" />
  <meta property="og:url"         content="https://masl.ph" />
  <meta property="og:type"        content="website" />
  <meta name="twitter:card"       content="summary_large_image" />
  <meta http-equiv="refresh"      content="0; url=https://masl.ph" />
</head>
<body>Redirecting...</body>
</html>`);
}
