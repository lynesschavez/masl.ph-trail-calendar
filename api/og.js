import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function handler(req) {
  const { searchParams } = new URL(req.url);

  const type  = searchParams.get('type')  || 'common';
  const title = searchParams.get('title') || 'MASL.PH';
  const body  = searchParams.get('body')  || 'Philippine Trail Race & Hike Calendar';

  const bodyShort = body.length > 130 ? body.slice(0, 127) + '…' : body;
  const accent    = type === 'ultra-rare' ? '#C9A227' : '#D0021B';

  // Logo: white outer shape, blue cutouts — renders cleanly on blue bg
  const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 674.82 556.57"><polygon fill="white" points="395.65 0 318.46 77.19 259.58 18.15 0 277.72 279.06 556.57 356.24 479.39 415.12 538.43 674.82 278.73 395.65 0"/><polygon fill="#002FA7" points="395.65 104.13 516.08 224.56 591.66 224.56 395.65 28.56 337.05 87.16 374.83 124.94 395.65 104.13"/><polygon fill="#002FA7" points="279.06 452.44 158.62 332.02 83.04 332.02 279.06 528.01 337.65 469.42 299.87 431.63 279.06 452.44"/><polygon fill="#002FA7" points="619.63 251.81 619.1 251.28 130.54 251.32 259.32 122.54 361.34 224.56 436.92 224.56 259.56 46.73 28.35 277.95 55.6 305.29 544.16 305.25 415.38 434.03 313.37 332.02 237.78 332.02 415.14 509.84 646.36 278.62 619.63 251.81"/></svg>`;
  const logoSrc = `data:image/svg+xml;base64,${btoa(logoSvg)}`;

  // Mountain silhouette layers
  const mountainSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 220" preserveAspectRatio="none"><polygon fill="white" fill-opacity="0.06" points="0,220 0,160 160,68 300,138 460,28 620,118 790,18 950,86 1080,48 1200,66 1200,220"/><polygon fill="white" fill-opacity="0.035" points="0,220 0,185 200,128 380,172 560,92 750,152 940,72 1100,125 1200,98 1200,220"/></svg>`;
  const mountainSrc = `data:image/svg+xml;base64,${btoa(mountainSvg)}`;

  // Topo ring helper — centered vertically at 315px (half of 630)
  function ring(size, opacity) {
    return {
      type: 'div',
      props: {
        style: {
          position: 'absolute',
          right:  `${-(size * 0.32)}px`,
          top:    `${315 - size / 2}px`,
          width:  `${size}px`,
          height: `${size}px`,
          border: `1.5px solid rgba(255,255,255,${opacity})`,
          borderRadius: '50%',
          display: 'flex',
        }
      }
    };
  }

  return new ImageResponse(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px', height: '630px',
          background: '#002FA7',
          display: 'flex', flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'sans-serif',
        },
        children: [

          // ── Accent bars ───────────────────────────────────────
          { type: 'div', props: { style: { position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: accent, display: 'flex' } } },
          { type: 'div', props: { style: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '8px', background: accent, display: 'flex' } } },

          // ── Topo rings (right side) ───────────────────────────
          ring(860, 0.04),
          ring(640, 0.05),
          ring(440, 0.065),
          ring(260, 0.07),
          ring(110, 0.065),

          // ── Mountain silhouette (bottom) ──────────────────────
          {
            type: 'img',
            props: {
              src: mountainSrc,
              style: { position: 'absolute', bottom: '8px', left: 0, width: '1200px', height: '220px' }
            }
          },

          // ── Main content ──────────────────────────────────────
          {
            type: 'div',
            props: {
              style: {
                display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '38px 88px 46px 88px',
                height: '630px',
                position: 'relative',
              },
              children: [

                // Top row: logo + wordmark
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', alignItems: 'center', gap: '14px' },
                    children: [
                      { type: 'img', props: { src: logoSrc, style: { width: '38px', height: '31px' } } },
                      { type: 'div', props: { style: { width: '1.5px', height: '26px', background: 'rgba(255,255,255,0.22)', display: 'flex' } } },
                      { type: 'div', props: { style: { fontSize: '17px', letterSpacing: '5px', color: 'rgba(255,255,255,0.45)', display: 'flex' }, children: 'MASL.PH' } },
                    ]
                  }
                },

                // Middle: eyebrow + divider + headline + body
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', flexDirection: 'column' },
                    children: [

                      // Eyebrow
                      {
                        type: 'div',
                        props: {
                          style: { fontSize: '13px', letterSpacing: '3.5px', color: accent, marginBottom: '16px', display: 'flex' },
                          children: 'UNIFIED TRAIL CALENDAR · PHILIPPINES'
                        }
                      },

                      // Red divider
                      { type: 'div', props: { style: { width: '48px', height: '3px', background: accent, marginBottom: '22px', display: 'flex' } } },

                      // Headline
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '54px', fontWeight: 'bold',
                            color: '#ffffff', lineHeight: 1.06,
                            maxWidth: '800px',
                            marginBottom: '18px',
                            display: 'flex', flexWrap: 'wrap',
                          },
                          children: title
                        }
                      },

                      // Body
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '22px',
                            color: 'rgba(255,255,255,0.62)',
                            lineHeight: 1.42,
                            maxWidth: '760px',
                            display: 'flex', flexWrap: 'wrap',
                          },
                          children: bodyShort
                        }
                      },
                    ]
                  }
                },

                // Bottom: URL badge
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', alignItems: 'center' },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            background: 'rgba(255,255,255,0.10)',
                            border: '1px solid rgba(255,255,255,0.18)',
                            borderRadius: '20px',
                            padding: '6px 20px',
                            fontSize: '13px',
                            letterSpacing: '2.5px',
                            color: 'rgba(255,255,255,0.65)',
                            display: 'flex',
                          },
                          children: 'MASL.PH'
                        }
                      }
                    ]
                  }
                },

              ]
            }
          },

        ]
      }
    },
    { width: 1200, height: 630 }
  );
}
