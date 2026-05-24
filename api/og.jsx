import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function handler(req) {
  const { searchParams } = new URL(req.url);

  const type  = searchParams.get('type')  || 'common';
  const title = searchParams.get('title') || 'MASL.PH';
  const body  = searchParams.get('body')  || 'Philippine Trail Race & Hike Calendar';

  const bodyShort = body.length > 160 ? body.slice(0, 157) + '…' : body;

  const accentColor =
    type === 'ultra-rare' ? '#C9A227' :
    type === 'rare'       ? '#D0021B' :
                            '#D0021B';

  return new ImageResponse(
    (
      <div style={{
        width: '1200px', height: '630px',
        background: '#002FA7',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px 88px',
        fontFamily: 'sans-serif',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: '6px', background: accentColor,
          display: 'flex',
        }} />
        <div style={{
          fontSize: '22px', letterSpacing: '6px',
          color: 'rgba(255,255,255,0.45)',
          marginBottom: '28px', display: 'flex',
        }}>
          MASL.PH
        </div>
        <div style={{
          width: '56px', height: '4px',
          background: accentColor,
          marginBottom: '28px', display: 'flex',
        }} />
        <div style={{
          fontSize: '58px', fontWeight: 'bold',
          color: '#ffffff', lineHeight: 1.05,
          marginBottom: '24px',
          maxWidth: '960px', display: 'flex',
          flexWrap: 'wrap',
        }}>
          {title}
        </div>
        <div style={{
          fontSize: '26px', color: 'rgba(255,255,255,0.72)',
          lineHeight: 1.45, maxWidth: '900px', display: 'flex',
          flexWrap: 'wrap',
        }}>
          {bodyShort}
        </div>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '8px', background: accentColor, display: 'flex',
        }} />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
