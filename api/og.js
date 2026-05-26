import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function handler(req) {
  const { searchParams } = new URL(req.url);
  const type  = searchParams.get('type')  || 'common';
  const title = searchParams.get('title') || 'MASL.PH';
  const body  = searchParams.get('body')  || 'Philippine Trail Race & Hike Calendar';

  // ── Font scaling based on character count ─────────────────
  function headingSize(len, base) {
    if (len <= 20)  return base;
    if (len <= 35)  return base - 8;
    if (len <= 55)  return base - 16;
    if (len <= 80)  return base - 24;
    return base - 32;
  }

  function bodySize(len) {
    if (len <= 150) return 22;
    if (len <= 250) return 20;
    if (len <= 350) return 18;
    if (len <= 500) return 16;
    if (len <= 650) return 14;
    return 13;
  }

  const bodyFs    = bodySize(body.length);
  const commonHfs = headingSize(title.length, 58);
  const rareHfs   = headingSize(title.length, 54);
  const ultraHfs  = headingSize(title.length, 92);

  // ─────────────────────────────────────────────────────────
  // COMMON — Brutalist Mono
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
                  justifyContent: 'center',
                  padding: '64px 72px',
                  width: '1200px', height: '630px',
                  position: 'relative',
                  gap: '22px',
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: `${commonHfs}px`, fontWeight: 'bold',
                        color: '#111', lineHeight: 1.02,
                        maxWidth: '1060px',
                        fontFamily: 'monospace', display: 'flex', flexWrap: 'wrap',
                      },
                      children: title
                    }
                  },
                  { type: 'div', props: { style: { width: '100%', height: '2px', background: '#111', display: 'flex' } } },
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: `${bodyFs}px`, color: '#333',
                        lineHeight: 1.55, maxWidth: '1060px',
                        fontFamily: 'monospace', display: 'flex', flexWrap: 'wrap',
                      },
                      children: body
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

            { type: 'div', props: { style: { position: 'absolute', top: 0, left: 0, width: '8px', height: '630px', background: '#D0021B', display: 'flex' } } },

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
                  { type: 'div', props: { style: { width: '13px', height: '13px', borderRadius: '50%', background: 'white', display: 'flex', flexShrink: 0, marginRight: '14px' } } },
                  { type: 'div', props: { style: { fontSize: '22px', fontWeight: 'bold', color: 'white', letterSpacing: '3px', display: 'flex', flex: 1 }, children: 'BREAKING NEWS' } },
                  { type: 'div', props: { style: { width: '1px', height: '26px', background: 'rgba(255,255,255,0.35)', margin: '0 20px', display: 'flex' } } },
                  { type: 'div', props: { style: { fontSize: '14px', color: 'rgba(255,255,255,0.88)', letterSpacing: '2.5px', display: 'flex' }, children: 'LIVE · PHILIPPINES' } },
                ]
              }
            },

            {
              type: 'div',
              props: {
                style: {
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'center',
                  padding: '28px 64px 28px 84px', // ✅ tightened vertical padding for more text room
                  flex: 1,
                  gap: '14px', // ✅ reduced gap so content breathes but doesn't clip
                },
                children: [
                  // ✅ UPDATED: more urgent, breaking-news-style category label
                  {
                    type: 'div',
                    props: {
                      style: { fontSize: '13px', letterSpacing: '4px', color: '#D0021B', display: 'flex', fontWeight: 'bold' },
                      children: 'DEVELOPING STORY · TRAIL ALERT'
                    }
                  },
                  // ✅ UPDATED: headline now shows "BREAKING:" prefix badge + dynamic title
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex', flexWrap: 'wrap', alignItems: 'baseline',
                        gap: '14px', maxWidth: '1060px',
                      },
                      children: [
                        {
                          type: 'div',
                          props: {
                            style: {
                              fontSize: `${rareHfs * 0.52}px`, fontWeight: 'bold',
                              color: '#D0021B',
                              background: '#D0021B',
                              color: '#ffffff',
                              padding: '4px 10px',
                              letterSpacing: '2px',
                              display: 'flex',
                              flexShrink: 0,
                            },
                            children: 'BREAKING:'
                          }
                        },
                        {
                          type: 'div',
                          props: {
                            style: {
                              fontSize: `${rareHfs}px`, fontWeight: 'bold',
                              color: '#ffffff', lineHeight: 1.05,
                              display: 'flex', flexWrap: 'wrap',
                              textTransform: 'uppercase',
                            },
                            children: title
                          }
                        },
                      ]
                    }
                  },
                  // ✅ UPDATED: body text opacity raised from 0.60 → 0.85 for better readability
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: `${bodyFs}px`, color: 'rgba(255,255,255,0.85)',
                        lineHeight: 1.6, maxWidth: '1060px',
                        display: 'flex', flexWrap: 'wrap',
                      },
                      children: body
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
    <circle cx="702" cy="262" r="1.8" fill="white" opacity="0.60"/>
    <circle cx="976" cy="288" r="1.2" fill="white" opacity="0.38"/>
    <circle cx="198" cy="408" r="1.6" fill="white" opacity="0.52"/>
    <circle cx="748" cy="388" r="1.8" fill="white" opacity="0.58"/>
    <circle cx="998" cy="418" r="1.2" fill="white" opacity="0.42"/>
    <circle cx="78"  cy="518" r="1.4" fill="white" opacity="0.46"/>
    <circle cx="618" cy="508" r="1.6" fill="white" opacity="0.52"/>
    <circle cx="878" cy="552" r="1.8" fill="white" opacity="0.62"/>
    <circle cx="238" cy="88"  r="1.0" fill="white" opacity="0.42"/>
    <circle cx="758" cy="128" r="1.4" fill="white" opacity="0.48"/>
    <circle cx="828" cy="228" r="1.6" fill="white" opacity="0.54"/>
  </svg>`;
  const starsSrc = `data:image/svg+xml;base64,${btoa(starsSvg)}`;

  function ring(size, opacity) {
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
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
        },
        children: [

          { type: 'img', props: { src: starsSrc, style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '630px' } } },
          { type: 'div', props: { style: { position: 'absolute', bottom: '-150px', left: '-80px', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(90,40,180,0.22)', display: 'flex' } } },
          { type: 'div', props: { style: { position: 'absolute', top: '-100px', right: '100px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(120,50,210,0.14)', display: 'flex' } } },

          ring(800, 0.07),
          ring(580, 0.09),
          ring(370, 0.11),
          ring(190, 0.13),

          { type: 'div', props: { style: { position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'rgba(160,100,230,0.60)', display: 'flex' } } },

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

                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', flexDirection: 'column', gap: '26px' },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: `${ultraHfs}px`, fontWeight: 'bold',
                            color: '#ffffff', lineHeight: 1.0,
                            maxWidth: '860px',
                            fontFamily: 'serif', display: 'flex', flexWrap: 'wrap',
                            letterSpacing: '8px',
                          },
                          children: title
                        }
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: `${bodyFs}px`,
                            color: '#ffffff', // ✅ CHANGED: was rgba(220,200,255,0.72) — now solid white
                            lineHeight: 1.65,
                            maxWidth: '780px',
                            fontFamily: 'serif',
                            fontStyle: 'italic',
                            display: 'flex', flexWrap: 'wrap',
                          },
                          children: body
                        }
                      },
                    ]
                  }
                },

                // ✅ REMOVED: bottom row with 'MASL.PH' and '✦ The Stars Said Share This ✦'

              ]
            }
          },

        ]
      }
    },
    { width: 1200, height: 630 }
  );
}
