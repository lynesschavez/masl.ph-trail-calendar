import { ImageResponse } from '@vercel/og';

export default function handler(req) {
  const { searchParams } = new URL(req.url);

  const type  = searchParams.get('type')  || 'common';
  const title = searchParams.get('title') || 'MASL.PH';
  const body  = searchParams.get('body')  || 'Philippine Trail Race & Hike Calendar';

  const bodyShort = body.length > 160 ? body.slice(0, 157) + '…' : body;
  const accentColor = type === 'ultra-rare' ? '#C9A227' : '#D0021B';

  return new ImageResponse(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px', height: '630px',
          background: '#002FA7',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px 88px',
          fontFamily: 'sans-serif',
          position: 'relative',
        },
        children: [
          { type: 'div', props: { style: { position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: accentColor, display: 'flex' } } },
          { type: 'div', props: { style: { fontSize: '22px', letter
