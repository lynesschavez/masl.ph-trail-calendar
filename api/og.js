import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function handler(req) {
  const { searchParams } = new URL(req.url);
  const type  = searchParams.get('type')  || 'common';
  const title = searchParams.get('title') || 'MASL.PH';
  const body  = searchParams.get('body')  || 'Philippine Trail Race & Hike Calendar';

  // ── Rare-tier fallback content ─────────────────────────────
  const rareTitle = title === 'MASL.PH'
    ? 'RACE REGISTRATION NOW OPEN — LIMITED SLOTS REMAIN'
    : title;
  const rareBody = body === 'Philippine Trail Race & Hike Calendar'
    ? 'Organizers confirm slots are filling fast. Runners urged to register immediately. Full route details and cutoff times now posted on the official event page.'
    : body;

  // ══════════════════════════════════════════════════════════════
  // ADAPTIVE ENGINE
  //
  // Two primitives + one solver used by all three tiers.
  //
  // estimateH  — how tall will this text block be at a given font size?
  // fitFs      — what is the largest font size that fits within a pixel budget?
  // solveLayout — jointly solve title + body for a given card geometry.
  // ══════════════════════════════════════════════════════════════

  function estimateH(text, fontSize, lineHeight, maxWidth, isItalic = false) {
    if (!text) return 0;
    const charsPerLine = Math.max(1, Math.floor(maxWidth / (fontSize * (isItalic ? 0.50 : 0.54))));
    return Math.ceil(text.length / charsPerLine) * fontSize * lineHeight;
  }

  function fitFs(text, lineHeight, maxWidth, budget, minFs, maxFs, isItalic = false) {
    if (!text) return minFs;
    let lo = minFs, hi = maxFs, best = minFs;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (estimateH(text, mid, lineHeight, maxWidth, isItalic) <= budget) { best = mid; lo = mid + 1; }
      else hi = mid - 1;
    }
    return best;
  }

  // Finds the largest titleFs and bodyFs that jointly fit within budgetH.
  //
  // titleOverheadFn(fs) → extra pixels above the title text at a given font
  // size. Defaults to zero. Used by the rare tier to account for the badge
  // (BREAKING: label) that sits above the headline in the column layout.
  function solveLayout({
    title, body,
    innerW, budgetH,
    titleLH, bodyLH,
    bodyW,
    titleMaxFs = 92, bodyMaxFs = 26,
    titleIsItalic = false, bodyIsItalic = false,
    titleOverheadFn = () => 0,
  }) {
    bodyW = bodyW || innerW;
    const hasBody = body && body.trim().length > 0;

    const GAP_RESERVE = 16;
    const titleBudget = Math.floor((budgetH - GAP_RESERVE) * 0.60);
    const bodyBudget  = budgetH - GAP_RESERVE - titleBudget;

    // Binary-search for titleFs, incorporating any per-font-size overhead
    let titleFs = 22;
    {
      let lo = 22, hi = hasBody ? titleMaxFs : titleMaxFs, best = 22;
      const cap = hasBody ? titleBudget : budgetH;
      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (titleOverheadFn(mid) + estimateH(title, mid, titleLH, innerW, titleIsItalic) <= cap) {
          best = mid; lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }
      titleFs = best;
    }

    if (!hasBody) return { titleFs, bodyFs: 0, gapPx: 0 };

    // Body: fit within its budget, then absorb any surplus from a short title
    const titleActualH = titleOverheadFn(titleFs) + estimateH(title, titleFs, titleLH, innerW, titleIsItalic);
    const surplus      = Math.max(0, titleBudget - titleActualH);
    const bodyFs       = fitFs(body, bodyLH, bodyW, bodyBudget + surplus, 13, bodyMaxFs, bodyIsItalic);

    // Natural gap: distribute remaining space rather than using fixed padding
    const usedH  = titleActualH + estimateH(body, bodyFs, bodyLH, bodyW, bodyIsItalic);
    const gapPx  = Math.min(36, Math.max(10, Math.floor((budgetH - usedH) * 0.42)));

    return { titleFs, bodyFs, gapPx };
  }

  // ── Per-tier geometry constants and solve ─────────────────
  //
  // Each card's budgetH is the usable vertical space after subtracting
  // every fixed element (padding, bars, rules, labels) from the 630px height.

  // COMMON — 1200×630, padding 64px top/bottom 72px left/right
  // Fixed overhead: 2px rule + 22px gap above + 22px gap below = 46px
  const { titleFs: cmTitleFs, bodyFs: cmBodyFs } = solveLayout({
    title, body,
    innerW: 1056, budgetH: 456,
    titleLH: 1.02, bodyLH: 1.55,
  });

  // RARE — 1200×630, 62px top bar, 20px top/bottom content padding
  // Fixed overhead: kicker 13px + divider 4px + 3 gaps × 12px = 53px
  // Badge overhead per font size: round(fs × 0.28) + 10px height + 8px gap
  const { titleFs: raHfs, bodyFs: raBodyFs } = solveLayout({
    title: rareTitle, body: rareBody,
    innerW: 1052, budgetH: 475,
    titleLH: 1.05, bodyLH: 1.55,
    bodyW: 920,
    titleMaxFs: 54,
    titleOverheadFn: (fs) => Math.round(fs * 0.28) + 18,
  });

  // ULTRA-RARE — 1200×630, 48px top/bottom padding 80px left/right
  // Fixed overhead: 28px label + 28px label gap = 56px
  const safeTitle = title.trim() || '\u2726';
  const safeBody  = body.trim();
  const { titleFs: urTitleFs, bodyFs: urBodyFs, gapPx: urGapPx } = solveLayout({
    title: safeTitle, body: safeBody,
    innerW: 1040, budgetH: 478,
    titleLH: 1.05, bodyLH: 1.58,
    bodyW: Math.round(1040 * 0.87),
    bodyIsItalic: true,
  });

  // Derived style values for ultra-rare headline
  const urTitleLH = urTitleFs >= 72 ? 1.00 : urTitleFs >= 56 ? 1.04 : urTitleFs >= 40 ? 1.08 : 1.14;
  const urTitleLS = urTitleFs >= 80 ? '4px' : urTitleFs >= 64 ? '3px' : urTitleFs >= 48 ? '2px' : urTitleFs >= 36 ? '1px' : '0px';

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
                        fontSize: `${cmTitleFs}px`, fontWeight: 'bold',
                        color: '#111', lineHeight: 1.02,
                        maxWidth: '1056px',
                        fontFamily: 'monospace', display: 'flex', flexWrap: 'wrap',
                        wordBreak: 'break-word', overflowWrap: 'break-word',
                      },
                      children: title,
                    }
                  },
                  { type: 'div', props: { style: { width: '100%', height: '2px', background: '#111', display: 'flex' } } },
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: `${cmBodyFs}px`, color: '#333',
                        lineHeight: 1.55, maxWidth: '1056px',
                        fontFamily: 'monospace', display: 'flex', flexWrap: 'wrap',
                        wordBreak: 'break-word', overflowWrap: 'break-word',
                      },
                      children: body,
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
                  padding: '20px 64px 20px 84px',
                  flex: 1,
                  gap: '12px',
                  overflow: 'hidden',
                },
                children: [

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

                  // Headline block — badge stacked above headline (column layout)
                  // Both share the same left edge naturally; no nudge required.
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '8px',
                        maxWidth: '1052px',
                        overflow: 'hidden',
                        flexShrink: 0,
                      },
                      children: [
                        {
                          type: 'div',
                          props: {
                            style: {
                              fontSize: `${Math.round(raHfs * 0.28)}px`,
                              fontWeight: 'bold',
                              color: '#ffffff', background: '#D0021B',
                              padding: '5px 11px',
                              letterSpacing: '2.5px',
                              display: 'flex', flexShrink: 0,
                              lineHeight: 1,
                            },
                            children: 'BREAKING:'
                          }
                        },
                        {
                          type: 'div',
                          props: {
                            style: {
                              fontSize: `${raHfs}px`, fontWeight: 'bold',
                              color: '#ffffff',
                              lineHeight: raHfs >= 46 ? 1.02 : 1.08,
                              display: 'flex', flexWrap: 'wrap',
                              textTransform: 'uppercase',
                              wordBreak: 'break-word', overflowWrap: 'break-word',
                            },
                            children: rareTitle
                          }
                        },
                      ]
                    }
                  },

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

                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: `${raBodyFs}px`,
                        color: 'rgba(255,255,255,0.88)',
                        lineHeight: 1.55, maxWidth: '920px',
                        display: 'flex', flexWrap: 'wrap',
                        wordBreak: 'break-word', overflowWrap: 'break-word',
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
                      gap: `${urGapPx}px`,
                      overflow: 'hidden',
                      maxHeight: '478px',
                    },
                    children: [

                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: `${urTitleFs}px`,
                            fontWeight: 'bold',
                            color: '#ffffff',
                            lineHeight: urTitleLH,
                            maxWidth: '1040px',
                            fontFamily: 'serif',
                            display: 'flex', flexWrap: 'wrap',
                            letterSpacing: urTitleLS,
                            wordBreak: 'break-word', overflowWrap: 'break-word',
                            overflow: 'hidden',
                          },
                          children: safeTitle
                        }
                      },

                      ...(safeBody.length > 0 ? [{
                        type: 'div',
                        props: {
                          style: {
                            fontSize: `${urBodyFs}px`,
                            color: 'rgba(255,255,255,0.88)',
                            lineHeight: 1.58,
                            maxWidth: `${Math.round(1040 * 0.87)}px`,
                            fontFamily: 'serif',
                            fontStyle: 'italic',
                            display: 'flex', flexWrap: 'wrap',
                            wordBreak: 'break-word', overflowWrap: 'break-word',
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
