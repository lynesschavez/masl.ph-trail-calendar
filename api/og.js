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

  // ══════════════════════════════════════════════════════════════
  // SHARED ADAPTIVE ENGINE
  //
  // All three tiers (common, rare, ultra-rare) use this same
  // geometry-aware engine instead of step-table font lookups.
  //
  // Pipeline:
  //   1. Model estimated rendered height from font size + line count
  //   2. Binary-search for the largest font size that fits a pixel budget
  //   3. Jointly solve title + body sizing so they sum to ≤ available height
  //   4. Redistribute leftover pixels as natural gap — no magic numbers
  // ══════════════════════════════════════════════════════════════

  // Average rendered char width as a fraction of font size.
  // Tuned for @vercel/og's default serif (Georgia-like):
  //   • Display/headline serif: ~0.54× (wide letterforms, tracking)
  //   • Italic body serif:      ~0.50× (slightly compressed)
  function urCharsPerLine(fontSize, maxWidth, isItalic) {
    const avgRatio = isItalic ? 0.50 : 0.54;
    return Math.max(1, Math.floor(maxWidth / (fontSize * avgRatio)));
  }

  function urEstimateLines(text, fontSize, maxWidth, isItalic) {
    if (!text || !text.length) return 0;
    return Math.ceil(text.length / urCharsPerLine(fontSize, maxWidth, isItalic));
  }

  function urEstimateH(text, fontSize, lineHeight, maxWidth, isItalic) {
    return urEstimateLines(text, fontSize, maxWidth, isItalic) * fontSize * lineHeight;
  }

  // Returns the largest integer font size where the text block fits within
  // pixelBudget. Falls back to minFs if even the minimum overflows.
  function urFitFs(text, lineHeight, maxWidth, pixelBudget, minFs, maxFs, isItalic) {
    if (!text || !text.length) return minFs;
    let lo = minFs, hi = maxFs, best = minFs;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (urEstimateH(text, mid, lineHeight, maxWidth, isItalic) <= pixelBudget) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return best;
  }

  // Line-height tightens for large display sizes to prevent runaway block height.
  function urLineHeight(fs) {
    if (fs >= 72) return 1.00;
    if (fs >= 56) return 1.04;
    if (fs >= 40) return 1.08;
    return 1.14;
  }

  // Letter-spacing loosens for small sizes, compresses for large.
  function urLetterSpacing(fs) {
    if (fs >= 80) return '4px';
    if (fs >= 64) return '3px';
    if (fs >= 48) return '2px';
    if (fs >= 36) return '1px';
    return '0px';
  }

  // ══════════════════════════════════════════════════════════════
  // COMMON — adaptive sizing
  //
  // Card:   1200 × 630px, padding: 64px 72px
  // Inner:  1056px wide × 502px tall
  // Layout: [title] [2px rule] [body]
  // gap: 22px between each child → reserve: 2px rule + 22 + 22 = 46px
  // ══════════════════════════════════════════════════════════════
  const CM_PAD_V       = 64;
  const CM_PAD_H       = 72;
  const CM_INNER_H     = 630 - CM_PAD_V * 2;          // 502px
  const CM_INNER_W     = 1200 - CM_PAD_H * 2;         // 1056px
  const CM_DIVIDER_RES = 46;                           // 2px rule + both 22px gaps
  const CM_BUDGET_H    = CM_INNER_H - CM_DIVIDER_RES; // 456px
  const CM_TITLE_LH    = 1.02;
  const CM_BODY_LH     = 1.55;
  const cmHasBody      = body.trim().length > 0;

  let cmTitleFs, cmBodyFs;

  if (!cmHasBody) {
    cmTitleFs = urFitFs(title, CM_TITLE_LH, CM_INNER_W, CM_BUDGET_H, 22, 92, false);
    cmBodyFs  = 0;
  } else {
    const cmGapReserve  = 16;
    const cmTitleBudget = Math.floor((CM_BUDGET_H - cmGapReserve) * 0.60);
    const cmBodyBudget  = CM_BUDGET_H - cmGapReserve - cmTitleBudget;

    cmTitleFs = urFitFs(title, CM_TITLE_LH, CM_INNER_W, cmTitleBudget, 22, 92, false);
    cmBodyFs  = urFitFs(body,  CM_BODY_LH,  CM_INNER_W, cmBodyBudget,  13, 26, false);

    // If title has surplus (short heading), try upsizing body one step
    const titleActualH = urEstimateH(title, cmTitleFs, CM_TITLE_LH, CM_INNER_W, false);
    const cmSurplus    = cmTitleBudget - titleActualH;
    if (cmSurplus > CM_BODY_LH * (cmBodyFs + 1)) {
      cmBodyFs = urFitFs(body, CM_BODY_LH, CM_INNER_W, cmBodyBudget + cmSurplus, 13, 26, false);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // RARE — adaptive sizing
  //
  // Card:    1200 × 630px
  // Top bar: 62px
  // Content: padding 20px top + 20px bottom → 528px usable
  // Content children (flex column, gap: 12px):
  //   [kicker ~13px] [headline-block] [divider ~4px] [body]
  //   3 inter-child gaps × 12px = 36px
  // Fixed overhead: 13 + 4 + 36 = 53px → budget = 475px
  //
  // HEADLINE BLOCK — column layout (badge stacked above headline):
  //   [BREAKING: badge]
  //   [8px gap]
  //   [headline text]
  //
  // Both children share the same left edge naturally — no nudge needed.
  // The badge height must be included in the binary search for raHfs.
  // ══════════════════════════════════════════════════════════════
  const RA_TOP_BAR_H  = 62;
  const RA_PAD_V      = 20;
  const RA_PAD_LEFT   = 84;
  const RA_PAD_RIGHT  = 64;
  const RA_INNER_W    = 1200 - RA_PAD_LEFT - RA_PAD_RIGHT;   // 1052px
  const RA_CONTENT_H  = 630 - RA_TOP_BAR_H - RA_PAD_V * 2;  // 528px
  const RA_FIXED_H    = 13 + 4 + 12 * 3;                     // kicker + divider + 3 gaps = 53px
  const RA_BUDGET_H   = RA_CONTENT_H - RA_FIXED_H;           // 475px
  const RA_TITLE_LH   = 1.05;
  const RA_BODY_LH    = 1.55;
  const RA_BADGE_GAP  = 8;                                    // gap between badge and headline

  // Combined height of the headline block: badge + gap + headline text
  function raHeadlineBlockH(fs) {
    const badgeH    = Math.round(fs * 0.28) + 10;  // badge font size + 5px×2 vertical padding
    const headlineH = urEstimateH(rareTitle, fs, RA_TITLE_LH, RA_INNER_W, false);
    return badgeH + RA_BADGE_GAP + headlineH;
  }

  let raHfs, raBodyFs;
  {
    const raGapReserve  = 16;
    const raTitleBudget = Math.floor((RA_BUDGET_H - raGapReserve) * 0.60);
    const raBodyBudget  = RA_BUDGET_H - raGapReserve - raTitleBudget;

    // Binary search for the largest headline font size whose block fits the budget
    let lo = 22, hi = 54, best = 22;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (raHeadlineBlockH(mid) <= raTitleBudget) { best = mid; lo = mid + 1; }
      else hi = mid - 1;
    }
    raHfs    = best;
    raBodyFs = urFitFs(rareBody, RA_BODY_LH, 920, raBodyBudget, 13, 26, false);

    // Try upsizing body if headline block has surplus
    const headlineActualH = raHeadlineBlockH(raHfs);
    const raSurplus       = raTitleBudget - headlineActualH;
    if (raSurplus > RA_BODY_LH * (raBodyFs + 1)) {
      raBodyFs = urFitFs(rareBody, RA_BODY_LH, 920, raBodyBudget + raSurplus, 13, 26, false);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // ULTRA-RARE — Geometry-aware adaptive layout engine
  //
  // Uses the shared engine functions above.
  // Jointly solves title + body sizing so they always sum to ≤ available height.
  // Redistributes leftover pixels as natural gap.
  // ══════════════════════════════════════════════════════════════

  // Safe text values — guard against empty / whitespace-only input
  const safeTitle = title.trim() || '\u2726';  // ✦ star glyph fallback if empty
  const safeBody  = body.trim();               // body is optional; empty string is valid

  // ── Card geometry ─────────────────────────────────────────
  const UR_CARD_H   = 630;
  const UR_PAD_V    = 48;
  const UR_PAD_H    = 80;
  const UR_INNER_H  = UR_CARD_H - UR_PAD_V * 2;
  const UR_INNER_W  = 1200 - UR_PAD_H * 2;
  const UR_BODY_W   = Math.round(UR_INNER_W * 0.87);
  const UR_LABEL_H  = 28;
  const UR_LABEL_GAP = 28;
  const UR_BUDGET_H = UR_INNER_H - UR_LABEL_H - UR_LABEL_GAP;

  const UR_TITLE_LH  = 1.05;
  const UR_BODY_LH   = 1.58;
  const hasBody      = safeBody.length > 0;

  let urTitleFs, urBodyFs, urGapPx;

  if (!hasBody) {
    urTitleFs = urFitFs(safeTitle, UR_TITLE_LH, UR_INNER_W, UR_BUDGET_H, 24, 96, false);
    urBodyFs  = 0;
    urGapPx   = 0;
  } else {
    const GAP_RESERVE  = 18;
    const titleBudget1 = Math.floor((UR_BUDGET_H - GAP_RESERVE) * 0.60);
    const bodyBudget1  = UR_BUDGET_H - GAP_RESERVE - titleBudget1;

    const titleFs1 = urFitFs(safeTitle, UR_TITLE_LH, UR_INNER_W, titleBudget1, 22, 92, false);
    const bodyFs1  = urFitFs(safeBody,  UR_BODY_LH,  UR_BODY_W,  bodyBudget1,  13, 26, true);

    const titleH1 = urEstimateH(safeTitle, titleFs1, UR_TITLE_LH, UR_INNER_W, false);
    const bodyH1  = urEstimateH(safeBody,  bodyFs1,  UR_BODY_LH,  UR_BODY_W,  true);
    const used1   = titleH1 + bodyH1 + GAP_RESERVE;
    const surplus = UR_BUDGET_H - used1;

    let urBodyFsFinal = bodyFs1;
    if (surplus > UR_BODY_LH * (bodyFs1 + 1)) {
      const extraBodyBudget = bodyBudget1 + surplus;
      urBodyFsFinal = urFitFs(safeBody, UR_BODY_LH, UR_BODY_W, extraBodyBudget, 13, 26, true);
    }

    urTitleFs = titleFs1;
    urBodyFs  = urBodyFsFinal;

    const finalTitleH = urEstimateH(safeTitle, urTitleFs, UR_TITLE_LH, UR_INNER_W, false);
    const finalBodyH  = urEstimateH(safeBody,  urBodyFs,  UR_BODY_LH,  UR_BODY_W,  true);
    const leftover    = UR_BUDGET_H - finalTitleH - finalBodyH;
    urGapPx = Math.min(36, Math.max(10, Math.floor(leftover * 0.42)));
  }

  const urTitleLH = urLineHeight(urTitleFs);
  const urTitleLS = urLetterSpacing(urTitleFs);

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
                  padding: `${CM_PAD_V}px ${CM_PAD_H}px`,
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
                        color: '#111', lineHeight: CM_TITLE_LH,
                        maxWidth: `${CM_INNER_W}px`,
                        fontFamily: 'monospace', display: 'flex', flexWrap: 'wrap',
                        wordBreak: 'break-word', overflowWrap: 'break-word',
                      },
                      children: title
                    }
                  },
                  { type: 'div', props: { style: { width: '100%', height: '2px', background: '#111', display: 'flex' } } },
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: `${cmBodyFs}px`, color: '#333',
                        lineHeight: CM_BODY_LH, maxWidth: `${CM_INNER_W}px`,
                        fontFamily: 'monospace', display: 'flex', flexWrap: 'wrap',
                        wordBreak: 'break-word', overflowWrap: 'break-word',
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

            // Left red edge accent
            { type: 'div', props: { style: { position: 'absolute', top: 0, left: 0, width: '8px', height: '630px', background: '#D0021B', display: 'flex' } } },

            // Top bar
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex', alignItems: 'center',
                  background: '#D0021B',
                  padding: '0 40px 0 28px',
                  height: `${RA_TOP_BAR_H}px`, width: '1200px',
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

            // Content column
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'center',
                  padding: `${RA_PAD_V}px ${RA_PAD_RIGHT}px ${RA_PAD_V}px ${RA_PAD_LEFT}px`,
                  flex: 1,
                  gap: '12px',
                  overflow: 'hidden',
                },
                children: [

                  // ── Kicker label ─────────────────────────────────────
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

                  // ── Headline block — column layout ───────────────────
                  // Badge stacked above headline text: both share the same
                  // left edge naturally. No nudge, no flexWrap ambiguity.
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: `${RA_BADGE_GAP}px`,
                        maxWidth: `${RA_INNER_W}px`,
                        overflow: 'hidden',
                        flexShrink: 0,
                      },
                      children: [

                        // BREAKING: badge
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

                        // Headline text
                        {
                          type: 'div',
                          props: {
                            style: {
                              fontSize: `${raHfs}px`, fontWeight: 'bold',
                              color: '#ffffff',
                              lineHeight: raHfs >= 46 ? 1.02 : 1.08,
                              display: 'flex', flexWrap: 'wrap',
                              textTransform: 'uppercase',
                              wordBreak: 'break-word',
                              overflowWrap: 'break-word',
                            },
                            children: rareTitle
                          }
                        },

                      ]
                    }
                  },

                  // ── Red accent divider ───────────────────────────────
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

                  // ── Body blurb ───────────────────────────────────────
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: `${raBodyFs}px`,
                        color: 'rgba(255,255,255,0.88)',
                        lineHeight: RA_BODY_LH, maxWidth: '920px',
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

                // ── Top label (fixed, always visible) ────────────────────
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

                // ── Main content block ────────────────────────────────────
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex', flexDirection: 'column',
                      gap: `${urGapPx}px`,
                      overflow: 'hidden',
                      maxHeight: `${UR_BUDGET_H}px`,
                    },
                    children: [

                      // Headline
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: `${urTitleFs}px`,
                            fontWeight: 'bold',
                            color: '#ffffff',
                            lineHeight: urTitleLH,
                            maxWidth: `${UR_INNER_W}px`,
                            fontFamily: 'serif',
                            display: 'flex', flexWrap: 'wrap',
                            letterSpacing: urTitleLS,
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            overflow: 'hidden',
                          },
                          children: safeTitle
                        }
                      },

                      // Body — only rendered when non-empty
                      ...(hasBody ? [{
                        type: 'div',
                        props: {
                          style: {
                            fontSize: `${urBodyFs}px`,
                            color: 'rgba(255,255,255,0.88)',
                            lineHeight: UR_BODY_LH,
                            maxWidth: `${UR_BODY_W}px`,
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

                // ── Bottom anchor ─────────────────────────────────────────
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
