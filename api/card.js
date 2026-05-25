export const config = { runtime: 'edge' };

export default function handler(req) {
  const { searchParams } = new URL(req.url);

  const type  = searchParams.get('type')  || 'common';
  const title = searchParams.get('title') || '';
  const body  = searchParams.get('body')  || '';

  const ogImageUrl = `https://masl.ph/api/og?type=${encodeURIComponent(type)}&title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Philippines Trail Running & Hiking Calendar</title>
  <meta name="description" content="Finding your next trail race or hike in the Philippines just got easier. Races, hike schedules, and events from across the islands, in one place.">

  <meta property="og:type"        content="website">
  <meta property="og:url"         content="https://masl.ph/">
  <meta property="og:title"       content="Philippine Trail Running and Hiking Calendar 2026">
  <meta property="og:description" content="Finding your next trail race or hike in the Philippines just got easier. Races, hike schedules, and events from across the islands, in one place.">
  <meta property="og:image"       content="${ogImageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name"   content="MASL.PH">

  <meta name="twitter:card"        content="summary_large_image">
  <meta name="twitter:title"       content="Philippine Trail Running and Hiking Calendar 2026">
  <meta name="twitter:description" content="Finding your next trail race or hike in the Philippines just got easier. Races, hike schedules, and events from across the islands, in one place.">
  <meta name="twitter:image"       content="${ogImageUrl}">

  <!-- Immediately redirect the human visitor back to the main site -->
  <meta http-equiv="refresh" content="0;url=https://masl.ph/">
  <script>window.location.replace('https://masl.ph/');</script>
</head>
<body></body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
