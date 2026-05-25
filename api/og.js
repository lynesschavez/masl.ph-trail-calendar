import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function handler(req) {
  const { searchParams } = new URL(req.url);
  const type      = searchParams.get('type')  || 'common';
  const title     = searchParams.get('title') || 'MASL.PH';
  const body      = searchParams.get('body')  || 'Philippine Trail Race & Hike Calendar';
  const bodyShort = body.length > 400 ? body.slice(0, 397) + '…' : body;

  const today   = new Date();
  const dateStr = `${String(today.getDate()).padStart(2,'0')}.${String(today.getMonth()+1).padStart(2,'0')}.${today.getFullYear()}`;

  // ─────────────────────────────────────────────────────────
  // COMMON — Twitter / Brutalist Mono
  // ─────────────────────────────────────────────────────────
  if (type === 'common') {
    const gridSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><pattern id="g" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1.1" fill="#111" opacity="0.10"/></pattern></defs><rect width="1200" height="630" fill="url(#g)"/></svg>`;
    const gridSrc = `data:image/svg+xml;base64,${btoa(gridSvg)}`;

    return new ImageResponse(
      {
        type: 'div',
        props: {
          style: {
            width: '1200px', height: '630px',
            background: '#EDE8DF',
            display: 'flex',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: 'monospace',
            border: '10px solid #111',
          },
          children: [
            { type: 'img', props: { src: gridSrc, style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '630px' } } },
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '36px 60px',
                  width: '1200px', height: '630px',
                  position: 'relative',
                },
                children: [

                  // Top row
                  {
                    type: 'div',
                    props: {
                      style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
                      children: [
                        {
                          type: 'div',
                          props: {
                            style: { background: '#111', color: '#EDE8DF', fontSize: '14px', letterSpacing: '2px', padding: '7px 16px', display: 'flex', fontFamily: 'monospace' },
                            children: '@MASL_PH · TWEET'
                          }
                        },
                        {
                          type: 'div',
                          props: {
                            style: { fontSize: '13px', color: '#888', letterSpacing: '1px', fontFamily: 'monospace', display: 'flex' },
                            children: `NO. 0001 · ${dateStr}`
                          }
                        },
                      ]
                    }
                  },

                  // Middle
                  {
                    type: 'div',
                    props: {
                      style: { display: 'flex', flexDirection: 'column' },
                      children: [
                        {
                          type: 'div',
                          props: {
                            style: { fontSize: '14px', color: '#888', fontFamily: 'monospace', marginBottom: '16px', display: 'flex' },
                            children: '// 001'
                          }
                        },
                        {
                          type: 'div',
                          props: {
                            style: {
                              fontSize: '50px', fontWeight: 'bold',
                              color: '#111', lineHeight: 1.05,
                              maxWidth: '1050px', marginBottom: '18px',
                              fontFamily: 'monospace', display: 'flex', flexWrap: 'wrap',
                            },
                            children: title
                          }
                        },
                        { type: 'div', props: { style: { width: '100%', height: '2px', background: '#111', marginBottom: '20px', display: 'flex' } } },
                        {
                          type: 'div',
                          props: {
                            style: {
                              fontSize: '18px', color: '#333',
                              lineHeight: 1.55, maxWidth: '960px',
                              fontFamily: 'monospace', display: 'flex', flexWrap: 'wrap',
                            },
                            children: bodyShort
                          }
                        },
                      ]
                    }
                  },

                  // Bottom row
                  {
                    type: 'div',
                    props: {
                      style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
                      children: [
                        {
                          type: 'div',
                          props: {
                            style: { fontSize: '13px', color: '#888', fontFamily: 'monospace', display: 'flex' },
                            children: 'MASL.PH · @masl_ph'
                          }
                        },
                        {
                          type: 'div',
                          props: {
                            style: { display: 'flex', gap: '10px' },
                            children: [
                              { type: 'div', props: { style: { fontSize: '13px', color: '#888', fontFamily: 'monospace', display: 'flex', border: '1px solid #bbb', padding: '5px 14px' }, children: '[ 2.4K ]' } },
                              { type: 'div', props: { style: { fontSize: '13px', color: '#888', fontFamily: 'monospace', display: 'flex', border: '1px solid #bbb', padding: '5px 14px' }, children: '[ 8.1K ]' } },
                              { type: 'div', props: { style: { fontSize: '13px', color: '#D0021B', fontFamily: 'monospace', display: 'flex', border: '1px solid #D0021B', padding: '5px 14px', fontWeight: 'bold' }, children: '[ 41.2K ]' } },
                            ]
                          }
                        },
                      ]
                    }
                  },

                ]
              }
            }
          ]
        }
      },
      { width: 1200, height: 630 }
    );
  }

  // ─────────────────────────────────────────────────────────
  // RARE — Television Broadcast Alert
  // ─────────────────────────────────────────────────────────
  if (type === 'rare') {
    return new ImageResponse(
      {
        type: 'div',
        props: {
          style: {
            width: '1200px', height: '630px',
            background: '#111111',
            display: 'flex', flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: 'sans-serif',
          },
          children: [

            // Left red stripe
            { type: 'div', props: { style: { position: 'absolute', top: 0, left: 0, width: '8px', height: '630px', background: '#D0021B', display: 'flex' } } },

            // Top breaking news bar
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex', alignItems: 'center',
                  background: '#D0021B',
                  padding: '0 40px 0 28px',
                  height: '62px', width: '1200px',
                  flexShrink: 0,
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: { display: 'flex', alignItems: 'center', gap: '12px', flex: 1 },
                      children: [
                        { type: 'div', props: { style: { width: '13px', height: '13px', borderRadius: '50%', background: 'white', display: 'flex', flexShrink: 0 } } },
                        { type: 'div', props: { style: { fontSize: '22px', fontWeight: 'bold', color: 'white', letterSpacing: '3px', display: 'flex' }, children: 'BREAKING NEWS' } },
                        { type: 'div', props: { style: { width: '1px', height: '26px', background: 'rgba(255,255,255,0.35)', margin: '0 20px', display: 'flex' } } },
                        { type: 'div', props: { style: { fontSize: '14px', color: 'rgba(255,255,255,0.88)', letterSpacing: '2.5px', display: 'flex' }, children: 'LIVE · PHILIPPINES' } },
                      ]
                    }
                  },
                  { type: 'div', props: { style: { fontSize: '18px', fontWeight: 'bold', color: 'white', letterSpacing: '3px', display: 'flex' }, children: 'BUNDOK TV' } },
                ]
              }
            },

            // Main content
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'center',
                  padding: '44px 64px 44px 84px',
                  flex: 1,
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: { fontSize: '13px', letterSpacing: '4px', color: '#D0021B', marginBottom: '18px', display: 'flex', fontWeight: 'bold' },
                      children: 'TRAIL INCIDENT REPORT'
                    }
                  },
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: '52px', fontWeight: 'bold',
                        color: '#ffffff', lineHeight: 1.0,
                        maxWidth: '1060px', marginBottom: '26px',
                        display: 'flex', flexWrap: 'wrap',
                        textTransform: 'uppercase',
                      },
                      children: title
                    }
                  },
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: '19px', color: 'rgba(255,255,255,0.60)',
                        lineHeight: 1.55, maxWidth: '920px',
                        display: 'flex', flexWrap: 'wrap',
                      },
                      children: bodyShort
                    }
                  },
                ]
              }
            },

            // Bottom bar
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex', alignItems: 'center',
                  padding: '0 40px 0 84px',
                  height: '42px',
                  background: 'rgba(255,255,255,0.04)',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  flexShrink: 0,
                },
                children: [
                  { type: 'div', props: { style: { fontSize: '12px', letterSpacing: '3px', color: 'rgba(255,255,255,0.28)', display: 'flex' }, children: 'MASL.PH' } }
                ]
              }
            },

          ]
        }
      },
      { width: 1200, height: 630 }
    );
  }

  // ─────────────────────────────────────────────────────────
  // ULTRA-RARE — Mystical Dark Cosmos
  // ─────────────────────────────────────────────────────────
  const starsSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <circle cx="112" cy="44"  r="1.8" fill="white" opacity="0.65"/>
    <circle cx="340" cy="72"  r="1.2" fill="white" opacity="0.45"/>
    <circle cx="578" cy="22"  r="1.5" fill="white" opacity="0.55"/>
    <circle cx="820" cy="65"  r="1.0" fill="white" opacity="0.35"/>
    <circle cx="1048" cy="33" r="2.0" fill="white" opacity="0.60"/>
    <circle cx="1148" cy="88" r="1.2" fill="white" opacity="0.40"/>
    <circle cx="62"  cy="178" r="1.4" fill="white" opacity="0.50"/>
    <circle cx="276" cy="155" r="1.0" fill="white" opacity="0.30"/>
    <circle cx="648" cy="198" r="1.6" fill="white" opacity="0.55"/>
    <circle cx="902" cy="142" r="1.2" fill="white" opacity="0.40"/>
    <circle cx="1098" cy="176" r="1.8" fill="white" opacity="0.50"/>
    <circle cx="148" cy="278" r="1.0" fill="white" opacity="0.35"/>
    <circle cx="418" cy="308" r="1.4" fill="white" opacity="0.45"/>
    <circle cx="702" cy="262" r="1.8" fill="white" opacity="0.60"/>
    <circle cx="976" cy="288" r="1.2" fill="white" opacity="0.38"/>
    <circle cx="1082" cy="318" r="1.5" fill="white" opacity="0.48"/>
    <circle cx="198" cy="408" r="1.6" fill="white" opacity="0.52"/>
    <circle cx="498" cy="442" r="1.0" fill="white" opacity="0.32"/>
    <circle cx="748" cy="388" r="1.8" fill="white" opacity="0.58"/>
    <circle cx="998" cy="418" r="1.2" fill="white" opacity="0.42"/>
    <circle cx="78"  cy="518" r="1.4" fill="white" opacity="0.46"/>
    <circle cx="358" cy="542" r="1.0" fill="white" opacity="0.30"/>
    <circle cx="618" cy="508" r="1.6" fill="white" opacity="0.52"/>
    <circle cx="878" cy="552" r="1.8" fill="white" opacity="0.62"/>
    <circle cx="1138" cy="528" r="1.2" fill="white" opacity="0.38"/>
    <circle cx="238" cy="88"  r="1.0" fill="white" opacity="0.42"/>
    <circle cx="758" cy="128" r="1.4" fill="white" opacity="0.48"/>
    <circle cx="448" cy="168" r="1.2" fill="white" opacity="0.36"/>
    <circle cx="828" cy="228" r="1.6" fill="white" opacity="0.54"/>
    <circle cx="524" cy="338" r="1.0" fill="white" opacity="0.28"/>
  </svg>`;
  const starsSrc = `data:image/svg+xml;base64,${btoa(starsSvg)}`;

  function cosmosRing(size, opacity) {
    return {
      type: 'div',
      props: {
        style: {
          position: 'absolute',
          right: `${-(size * 0.30)}px`,
          top: `${315 - size / 2}px`,
          width: `${size}px`,
          height: `${size}px`,
          border: `1px solid rgba(160,100,230,${opacity})`,
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
          background: '#0D0B1E',
          display: 'flex', flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'serif',
        },
        children: [

          // Stars
          { type: 'img', props: { src: starsSrc, style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '630px' } } },

          // Purple glow bottom-left
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                bottom: '-120px', left: '-60px',
                width: '480px', height: '480px',
                borderRadius: '50%',
                background: 'rgba(90,50,170,0.20)',
                display: 'flex',
              }
            }
          },

          // Purple glow top-right
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '-80px', right: '-80px',
                width: '320px', height: '320px',
                borderRadius: '50%',
                background: 'rgba(120,60,200,0.12)',
                display: 'flex',
              }
            }
          },

          // Constellation rings
          cosmosRing(820, 0.06),
          cosmosRing(600, 0.08),
          cosmosRing(400, 0.10),
          cosmosRing(210, 0.12),

          // Top purple accent line
          { type: 'div', props: { style: { position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'rgba(160,100,230,0.55)', display: 'flex' } } },

          // Main content
          {
            type: 'div',
            props: {
              style: {
                display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '48px 80px',
                height: '630px',
                position: 'relative',
              },
              children: [

                // Top eyebrow
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', alignItems: 'center', gap: '10px' },
                    children: [
                      { type: 'div', props: { style: { fontSize: '15px', color: '#9B72CF', display: 'flex' }, children: '\u2726' } },
                      { type: 'div', props: { style: { fontSize: '13px', letterSpacing: '4.5px', color: '#9B72CF', fontFamily: 'sans-serif', display: 'flex' }, children: 'YOUR COSMIC READING' } },
                    ]
                  }
                },

                // Middle: headline + body
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', flexDirection: 'column' },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '88px', fontWeight: 'bold',
                            color: '#ffffff', lineHeight: 1.0,
                            maxWidth: '860px', marginBottom: '30px',
                            fontFamily: 'serif', display: 'flex', flexWrap: 'wrap',
                            letterSpacing: '6px',
                          },
                          children: title
                        }
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '20px',
                            color: 'rgba(255,255,255,0.70)',
                            lineHeight: 1.60,
                            maxWidth: '800px',
                            fontFamily: 'serif',
                            fontStyle: 'italic',
                            display: 'flex', flexWrap: 'wrap',
                          },
                          children: bodyShort
                        }
                      },
                    ]
                  }
                },

                // Bottom
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
                    children: [
                      { type: 'div', props: { style: { fontSize: '13px', letterSpacing: '3.5px', color: '#7B5EA7', fontFamily: 'sans-serif', display: 'flex' }, children: 'MASL.PH' } },
                      { type: 'div', props: { style: { fontSize: '13px', color: 'rgba(155,114,207,0.55)', fontFamily: 'serif', fontStyle: 'italic', display: 'flex' }, children: '\u2726 The Stars Said Share This \u2726' } },
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
