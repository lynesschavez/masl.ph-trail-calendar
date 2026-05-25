export default function handler(req, res) {
  const { type, title, body } = req.query;
  const ogImageUrl = `https://www.masl.ph/api/og?type=${encodeURIComponent(type || '')}&title=${encodeURIComponent(title || '')}&body=${encodeURIComponent(body || '')}`;
  const shareUrl  = `https://www.masl.ph/api/share?type=${encodeURIComponent(type || '')}&title=${encodeURIComponent(title || '')}&body=${encodeURIComponent(body || '')}`;
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html>
<head>
  <meta property="og:title"       content="Memories Above Sea Level Ph - Trail Calendar 2026" />
  <meta property="og:description" content="Finding your next trail race or hike in the Philippines just got easier. Races, hike schedules, and events from across the islands, in one place." />
  <meta property="og:image"       content="${ogImageUrl}" />
  <meta property="og:url"         content="${shareUrl}" />
  <meta property="og:type"        content="website" />
  <meta name="twitter:card"       content="summary_large_image" />
  <meta name="twitter:title"      content="Memories Above Sea Level Ph - Trail Calendar 2026" />
  <meta name="twitter:description" content="Finding your next trail race or hike in the Philippines just got easier. Races, hike schedules, and events from across the islands, in one place." />
  <meta name="twitter:image"      content="${ogImageUrl}" />
</head>
<body>
  <script>window.location.href = 'https://masl.ph';</script>
</body>
</html>`);
}
