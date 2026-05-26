import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function handler(req) {
  const { searchParams } = new URL(req.url);
  const type  = searchParams.get('type')  || 'common';
  const title = searchParams.get('title') || 'MASL.PH';
  const body  = searchParams.get('body')  || 'Philippine Trail Race & Hike Calendar';

  // ── Rare-tier: breaking-news fallback content ─────────────
  const rareTitle = title === 'MASL.PH'
    ? 'RACE REGISTRATION NOW OPEN — LIMITED SLOTS REMAIN'
    : title;
  const rareBody  = body === 'Philippine Trail Race & Hike Calendar'
    ? 'Organizers confirm slots are filling fast. Runners urged to register immediately. Full route details and cutoff times now posted on the official event page.'
    : body;

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
  const rareHfs   = headingSize(rareTitle.length, 54);
  const rareBodyFs = bodySize(rareBody.length);
  // ── Ultra-Rare adaptive scaling (finer-grained, edge-case-safe) ────────────

  // 10-step title scaling instead of the shared 5-step headingSize()
  function ultraTitleSize(len) {
    if (len === 0)  return 48;  // empty string fallback
    if (len <= 8)   return 92;
    if (len <= 15)  return 84;
    if (len <= 22)  return 76;
    if (len <= 30)  return 68;
    if (len <= 40)  return 58;
    if (len <= 55)  return 48;
    if (len <= 75)  return 40;
    if (len <= 100) return 34;
    if (len <= 130) return 28;
    return 24;
  }

  // Letter-spacing shrinks as title grows (avoids horizontal blowout)
  function ultraLetterSpacing(len) {
    if (len <= 10) return '8px';
    if (len <= 20) return '6px';
    if (len <= 35) return '4px';
    if (len <= 55) return '2px';
    return '1px';
  }

  // Body font sizing separate from shared bodySize() — wider range
  function ultraBodySize(len) {
    if (len === 0)  return 20;
    if (len <= 80)  return 24;
    if (len <= 150) return 22;
    if (len <= 250) return 20;
    if (len <= 350) return 18;
    if (len <= 500) return 16;
    if (len <= 650) return 14;
    return 13;
  }

  // Gap between title and body shrinks when combined content is heavy
  function ultraContentGap(titleLen, bodyLen) {
    const combined = titleLen + bodyLen;
    if (combined <= 100) return '28px';
    if (combined <= 200) return '22px';
    if (combined <= 350) return '16px';
    return '10px';
  }

  // Safe text values — guard against empty strings and whitespace-only input
  const safeTitle   = title.trim() || '\u2726';  // fallback to ✦ star glyph if empty
  const safeBody    = body.trim();               // intentionally allow empty (body is optional)

  const ultraHfs    = ultraTitleSize(safeTitle.length);
  const ultraLs     = ultraLetterSpacing(safeTitle.length);
  const ultraBodyFs = ultraBodySize(safeBody.length);
  const ultraGap    = ultraContentGap(safeTitle.length, safeBody.length);

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
                  // tightened vertical padding so headline + body never clip
                  padding: '20px 64px 20px 84px',
                  flex: 1,
                  gap: '12px',
                  overflow: 'hidden',  // safety — nothing bleeds outside card bounds
                },
                children: [

                  // ── Kicker label ───────────────────────────────────────
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: '13px', letterSpacing: '4px',
                        color: '#D0021B', display: 'flex',
                        fontWeight: 'bold', flexShrink: 0,
                      },
                      children: 'DEVELOPING STORY · TRAIL ALERT'
                    }
                  },

                  // ── Headline block ─────────────────────────────────────
                  // Row layout: badge + headline share the same flex row so
                  // their left edges are structurally locked — no column drift.
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex', flexDirection: 'row',
                        alignItems: 'flex-start',   // badge top-aligns with first line of text
                        flexWrap: 'wrap',           // wraps naturally on narrow titles
                        gap: '12px',
                        maxWidth: '1060px',
                        overflow: 'hidden',
                      },
                      children: [
                        // BREAKING badge — vertically centred against the headline cap-height
                        // via marginTop nudge so the red box optical centre matches the text
                        {
                          type: 'div',
                          props: {
                            style: {
                              fontSize: `${Math.round(rareHfs * 0.28)}px`,
                              fontWeight: 'bold',
                              color: '#ffffff', background: '#D0021B',
                              padding: '5px 11px',
                              letterSpacing: '2.5px',
                              display: 'flex', flexShrink: 0,
                              // nudge top so the badge cap-height aligns with headline cap-height
                              marginTop: `${Math.round(rareHfs * 0.08)}px`,
                              lineHeight: 1,
                            },
                            children: 'BREAKING:'
                          }
                        },
                        // Headline — all-caps, punchy, adaptive size; sits flush left with badge
                        {
                          type: 'div',
                          props: {
                            style: {
                              fontSize: `${rareHfs}px`, fontWeight: 'bold',
                              color: '#ffffff',
                              lineHeight: rareHfs >= 46 ? 1.02 : 1.08,
                              display: 'flex', flexWrap: 'wrap',
                              textTransform: 'uppercase',
                              flex: 1,                       // fills remaining row width
                              minWidth: '0',                 // allows flex child to shrink/wrap
                              wordBreak: 'break-word',
                              overflowWrap: 'break-word',
                            },
                            children: rareTitle
                          }
                        },
                      ]
                    }
                  },

                  // ── Red accent divider ─────────────────────────────────
                  {
                    type: 'div',
                    props: {
                      style: {
                        width: '48px', height: '2px',
                        background: '#D0021B',
                        display: 'flex', flexShrink: 0,
                        marginTop: '2px',
                      }
                    }
                  },

                  // ── Body blurb ─────────────────────────────────────────
                  // Short sentences, active voice, factual — no overflow
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: `${rareBodyFs}px`,
                        color: 'rgba(255,255,255,0.88)',
                        lineHeight: 1.55, maxWidth: '920px',
                        display: 'flex', flexWrap: 'wrap',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        overflow: 'hidden',
                      },
                      children: rareBody
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
                    style: { display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 },
                    children: [
                      { type: 'div', props: { style: { fontSize: '15px', color: '#9B72CF', display: 'flex' }, children: '\u2726' } },
                      { type: 'div', props: { style: { fontSize: '13px', letterSpacing: '4.5px', color: '#9B72CF', fontFamily: 'sans-serif', display: 'flex' }, children: 'YOUR COSMIC READING' } },
                    ]
                  }
                },

                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex', flexDirection: 'column',
                      gap: ultraGap,
                      overflow: 'hidden',
                      maxHeight: '460px',
                    },
                    children: [

                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: `${ultraHfs}px`,
                            fontWeight: 'bold',
                            color: '#ffffff',
                            lineHeight: ultraHfs >= 68 ? 1.0 : 1.08,
                            maxWidth: '1040px',
                            fontFamily: 'serif',
                            display: 'flex', flexWrap: 'wrap',
                            letterSpacing: ultraLs,
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            overflow: 'hidden',
                          },
                          children: safeTitle
                        }
                      },

                      ...(safeBody ? [{
                        type: 'div',
                        props: {
                          style: {
                            fontSize: `${ultraBodyFs}px`,
                            color: '#ffffff',
                            lineHeight: ultraBodyFs >= 20 ? 1.65 : 1.5,
                            maxWidth: '900px',
                            fontFamily: 'serif',
                            fontStyle: 'italic',
                            display: 'flex', flexWrap: 'wrap',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            overflow: 'hidden',
                          },
                          children: safeBody
                        }
                      }] : []),

                    ]
                  }
                },

                { type: 'div', props: { style: { display: 'flex', height: '1px', flexShrink: 0 } } },

              ]
            }
          },

        ]
      }
    },
    { width: 1200, height: 630 }
  );
}
