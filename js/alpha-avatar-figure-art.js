(() => {
  'use strict';

  const SIZE = { width: 360, height: 480 };
  const COLOR_PRESETS = {
    Teal: ['#3f7868', '#244a42'], Blue: ['#466c8c', '#263f59'], Purple: ['#6a557f', '#3c304b'],
    Red: ['#8a4d49', '#512d2f'], Green: ['#526f45', '#30442c'], Gold: ['#a88742', '#604d28'],
    Black: ['#34363a', '#1d2024'], White: ['#d7d1c1', '#807b70'], Brown: ['#765843', '#443326'], Rose: ['#94616e', '#563b46']
  };
  const SHAPES = {
    Lean: { shoulder: 43, waist: 28, hip: 35 },
    Average: { shoulder: 50, waist: 35, hip: 41 },
    Broad: { shoulder: 61, waist: 42, hip: 46 },
    Stocky: { shoulder: 57, waist: 48, hip: 53 }
  };
  const HEIGHTS = { Short: -18, Average: 0, Tall: 18 };

  const xml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char]));
  const clean = value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const state = () => globalThis.SFStore?.get?.() || {};

  function currentVisual() {
    const save = state();
    return save.character?.visual || save.onboarding?.characterDraft || {};
  }

  function currentIdentity() {
    const save = state();
    const className = save.character?.class || save.gameCombat?.selectedClass || save.onboarding?.selectedGameClass || save.onboarding?.selectedClass || 'Fighter';
    const build = save.character?.build || save.character?.featurePackage || save.gameCombat?.selectedBuild || save.onboarding?.selectedBuild || save.onboarding?.selectedPackage || 'Vanguard';
    return { className: className === 'Cleric' ? 'Paladin' : className, build };
  }

  function figureKey() {
    const visual = currentVisual();
    const identity = currentIdentity();
    return JSON.stringify({
      lorelei: visual.lorelei,
      height: visual.height,
      bodyShape: visual.bodyShape,
      presentation: visual.presentation,
      pose: visual.pose,
      outfit: visual.outfit,
      outfitColor: visual.outfitColor,
      background: visual.background,
      figure: visual.figure,
      className: identity.className,
      build: identity.build
    });
  }

  function headUri() {
    const config = globalThis.SFLoreleiConfig;
    const engine = globalThis.SFLoreleiEngine;
    if (!config || !engine) return '';
    const options = { ...config.options(currentVisual()) };
    delete options.backgroundColor;
    options.seed = 'ascendry-full-figure';
    options.scale = 96;
    options.translateY = 2;
    return engine.renderDataUri(options);
  }

  function scene(name) {
    if (name === 'Training Yard') {
      return `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#8fa5a2"/><stop offset="1" stop-color="#d1b98b"/></linearGradient><linearGradient id="yard" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#485648"/><stop offset="1" stop-color="#202d28"/></linearGradient></defs>
      <rect width="360" height="480" fill="url(#sky)"/><circle cx="288" cy="72" r="38" fill="#e8d39a" opacity=".42"/>
      <path d="M0 173h360v307H0z" fill="url(#yard)"/><path d="M0 188h360v42H0z" fill="#6b6d61"/><path d="M0 188h360M0 209h360" stroke="#8b8879" opacity=".55"/>
      <g stroke="#4c4030" stroke-width="8" stroke-linecap="round"><path d="M34 197v110M75 197v110M34 234h41"/><path d="M292 201v103M329 201v103M292 235h37"/></g>
      <g transform="translate(291 91)"><circle cx="19" cy="37" r="30" fill="#d5c49a" stroke="#665a43" stroke-width="5"/><circle cx="19" cy="37" r="18" fill="#98534b"/><circle cx="19" cy="37" r="7" fill="#d7b45d"/><path d="M19 67v54" stroke="#5b4933" stroke-width="7"/></g>
      <path d="M0 405Q90 378 181 409T360 398V480H0z" fill="#17231f" opacity=".68"/>`;
    }
    if (name === 'Quiet Study') {
      return `<defs><linearGradient id="study" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#2f2927"/><stop offset="1" stop-color="#111a18"/></linearGradient><radialGradient id="candle"><stop stop-color="#f4d38a" stop-opacity=".48"/><stop offset="1" stop-color="#f4d38a" stop-opacity="0"/></radialGradient></defs>
      <rect width="360" height="480" fill="url(#study)"/><rect x="22" y="42" width="94" height="274" rx="7" fill="#241b18" stroke="#755942" stroke-width="4"/><path d="M31 104h76M31 169h76M31 234h76" stroke="#755942" stroke-width="5"/>
      <g fill="#765445"><rect x="36" y="67" width="13" height="34"/><rect x="53" y="58" width="17" height="43"/><rect x="74" y="70" width="10" height="31"/><rect x="87" y="62" width="14" height="39"/><rect x="36" y="130" width="18" height="36"/><rect x="58" y="141" width="11" height="25"/><rect x="73" y="125" width="15" height="41"/><rect x="91" y="136" width="10" height="30"/></g>
      <rect x="254" y="47" width="82" height="112" rx="5" fill="#47606a" stroke="#a58b64" stroke-width="5"/><path d="M295 51v104M258 103h74" stroke="#c3b287" stroke-width="3" opacity=".65"/><circle cx="298" cy="102" r="65" fill="url(#candle)"/>
      <path d="M0 360h360v120H0z" fill="#15110f"/><path d="M18 382h324" stroke="#6d4a33" stroke-width="18"/><g transform="translate(298 333)"><path d="M0 42h17" stroke="#a6875a" stroke-width="4"/><path d="M9 41V4" stroke="#d9c28d" stroke-width="7"/><path d="M9 0c-8 9-6 17 0 19 7-5 8-12 0-19z" fill="#f0c56f"/></g>`;
    }
    return `<defs><linearGradient id="hall" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#28352f"/><stop offset="1" stop-color="#101916"/></linearGradient><radialGradient id="fire"><stop stop-color="#e7ad5e" stop-opacity=".6"/><stop offset="1" stop-color="#e7ad5e" stop-opacity="0"/></radialGradient></defs>
    <rect width="360" height="480" fill="url(#hall)"/><path d="M0 0h360v480H0z" fill="none" stroke="#1b2722" stroke-width="24"/><path d="M45 0v480M315 0v480" stroke="#4a3a2b" stroke-width="18" opacity=".65"/>
    <path d="M126 0h108v126l-54-27-54 27z" fill="#365d4f" stroke="#c09b4e" stroke-width="4"/><path d="M180 29l11 22 24 4-18 17 4 24-21-11-21 11 4-24-18-17 24-4z" fill="#c09b4e" opacity=".8"/>
    <g transform="translate(25 263)"><rect width="88" height="112" rx="8" fill="#211b18" stroke="#6f5540" stroke-width="6"/><path d="M13 93h62V45Q44 16 13 45z" fill="#3a2920"/><path d="M23 90Q44 45 65 90z" fill="#c5683f"/><path d="M30 91Q44 57 58 91z" fill="#e8b15f"/></g><circle cx="70" cy="320" r="102" fill="url(#fire)"/>
    <path d="M0 393Q83 376 176 404T360 389V480H0z" fill="#0c1412"/>`;
  }

  function weaponSword(x, y, rotation = 0, scale = 1) {
    return `<g transform="translate(${x} ${y}) rotate(${rotation}) scale(${scale})"><path d="M0 0l6 0 2 106-5 15-5-15z" fill="#bcc3bd" stroke="#343b39" stroke-width="3"/><path d="M-13 5h31" stroke="#c09b4e" stroke-width="7"/><path d="M2 9v22" stroke="#60442f" stroke-width="8"/><circle cx="2" cy="34" r="5" fill="#c09b4e"/></g>`;
  }
  function weaponAxe(x, y, rotation = 0) { return `<g transform="translate(${x} ${y}) rotate(${rotation})"><path d="M0 0v142" stroke="#654b36" stroke-width="9"/><path d="M-7 2q-34 4-42 37 29 8 50-10z" fill="#9da6a2" stroke="#343b39" stroke-width="4"/><path d="M7 2q29 3 37 28-24 8-43-4z" fill="#7c8582" stroke="#343b39" stroke-width="4"/></g>`; }
  function weaponBow(x, y, rotation = 0) { return `<g transform="translate(${x} ${y}) rotate(${rotation})"><path d="M0 0q-48 70 0 145" fill="none" stroke="#8b5e36" stroke-width="8"/><path d="M0 0v145" stroke="#d5c79c" stroke-width="2"/><path d="M-2 72l-29 0" stroke="#c09b4e" stroke-width="3"/><path d="M-33 72l10-5v10z" fill="#c09b4e"/></g>`; }
  function weaponStaff(x, y, rotation = 0, crystal = '#5fa8c6') { return `<g transform="translate(${x} ${y}) rotate(${rotation})"><path d="M0 13v142" stroke="#654b36" stroke-width="10"/><path d="M0 17q-28-18-22-43M0 17q28-18 22-43" fill="none" stroke="#654b36" stroke-width="8"/><path d="M0-38l14 18-14 18-14-18z" fill="${crystal}" stroke="#d7e3db" stroke-width="3"/></g>`; }
  function shield(x, y, tone = '#526f45', rotation = 0) { return `<g transform="translate(${x} ${y}) rotate(${rotation})"><path d="M0 0q38 4 52 18-3 67-52 87-49-20-52-87Q-38 4 0 0z" fill="${tone}" stroke="#c09b4e" stroke-width="6"/><path d="M0 14v72M-34 31h68" stroke="#c09b4e" stroke-width="5" opacity=".8"/></g>`; }
  function quiver(x, y, rotation = 0) { return `<g transform="translate(${x} ${y}) rotate(${rotation})"><path d="M0 17h30l-7 104H7z" fill="#694a34" stroke="#33271f" stroke-width="4"/><g stroke="#b79a65" stroke-width="3"><path d="M7 18l-9-36M16 18l1-40M25 18l11-34"/></g><path d="M-4-18l5-8 3 9M13-22l5-8 3 9M32-16l5-8 3 9" fill="#8f6e3f"/></g>`; }
  function hammer(x, y, rotation = 0) { return `<g transform="translate(${x} ${y}) rotate(${rotation})"><path d="M0 6v132" stroke="#654b36" stroke-width="9"/><path d="M-30-7h61v33h-61z" fill="#9aa19e" stroke="#343b39" stroke-width="4"/><path d="M-18-1h36" stroke="#c09b4e" stroke-width="5"/></g>`; }

  function rearGear(className, build) {
    const normalized = clean(build);
    if (className === 'Fighter' && normalized.includes('breaker')) return weaponAxe(116, 146, -34);
    if (className === 'Fighter' && normalized.includes('twin')) return weaponSword(116, 139, -32, .9) + weaponSword(238, 139, 32, .9);
    if (className === 'Rogue' && normalized.includes('deadeye')) return quiver(117, 137, -18) + weaponBow(235, 145, 18);
    if (className === 'Rogue' && normalized.includes('relic')) return `<path d="M118 230q-20 28-12 82h38l7-79z" fill="#6b4b36" stroke="#34261e" stroke-width="5"/><g fill="#b28a49"><circle cx="116" cy="269" r="5"/><circle cx="130" cy="285" r="4"/></g>`;
    if (className === 'Wizard') return weaponStaff(229, 144, 18, normalized.includes('frost') ? '#9ed5e6' : normalized.includes('ember') ? '#d86d42' : '#9674c7');
    if (className === 'Ranger') return quiver(112, 136, -18) + (normalized.includes('wild') ? weaponStaff(235, 151, 20, '#72a56b') : weaponBow(236, 145, 18));
    if (className === 'Paladin' && normalized.includes('radiant')) return weaponSword(231, 135, 28, 1.16);
    if (className === 'Paladin' && normalized.includes('justicar')) return hammer(230, 148, 25);
    if (className === 'Paladin') return weaponSword(231, 143, 25, .96);
    return weaponSword(232, 145, 26, .9);
  }

  function frontGear(className, build, colors) {
    const normalized = clean(build);
    if (className === 'Fighter' && normalized.includes('vanguard')) return shield(113, 253, colors.secondary, -7) + weaponSword(247, 228, 9, .73);
    if (className === 'Rogue' && normalized.includes('shadow')) return `<g transform="translate(237 282) rotate(24)"><path d="M0 0l5 0 1 58-4 13-4-13z" fill="#b9c0bb" stroke="#303633" stroke-width="3"/><path d="M-8 5h20" stroke="#b28a49" stroke-width="5"/></g>`;
    if (className === 'Rogue' && normalized.includes('relic')) return `<g transform="translate(240 280)"><path d="M0 0h43v20H0z" fill="#4c3a2c" stroke="#b28a49" stroke-width="4"/><path d="M10 20v19M31 20v19" stroke="#6d4c31" stroke-width="6"/></g>`;
    if (className === 'Wizard') return `<g transform="translate(246 245)"><circle r="22" fill="${normalized.includes('frost') ? '#8bd4e9' : normalized.includes('ember') ? '#dc7045' : '#9875ce'}" opacity=".28"/><circle r="10" fill="${normalized.includes('frost') ? '#bceaf4' : normalized.includes('ember') ? '#ffd08b' : '#d7c1ff'}"/><path d="M-27 0h54M0-27v54" stroke="#f4e8ca" stroke-width="2" opacity=".7"/></g>`;
    if (className === 'Ranger' && normalized.includes('wild')) return shield(112, 258, '#446b48', -5) + `<path d="M89 232q-20 38 5 77" fill="none" stroke="#78a564" stroke-width="7"/>`;
    if (className === 'Paladin' && (normalized.includes('dawn') || normalized.includes('justicar'))) return shield(111, 253, '#806b3d', -7);
    if (className === 'Paladin') return `<g transform="translate(246 250)"><circle r="21" fill="#e8c46b" opacity=".22"/><path d="M0-19v38M-19 0h38" stroke="#e9d08c" stroke-width="6"/></g>`;
    return '';
  }

  function bodyAndOutfit(visual) {
    const shape = { ...(SHAPES[visual.bodyShape] || SHAPES.Average) };
    if (visual.presentation === 'Masculine') { shape.shoulder *= 1.04; shape.hip *= .97; }
    if (visual.presentation === 'Feminine') { shape.shoulder *= .96; shape.hip *= 1.05; }
    const delta = HEIGHTS[visual.height] ?? 0;
    const top = 149;
    const waistY = 236 + delta * .15;
    const hipY = 292 + delta * .28;
    const kneeY = 360 + delta * .62;
    const footY = 443 + delta;
    const center = 180;
    const primary = COLOR_PRESETS[visual.outfitColor]?.[0] || COLOR_PRESETS.Teal[0];
    const secondary = COLOR_PRESETS[visual.outfitColor]?.[1] || COLOR_PRESETS.Teal[1];
    const skin = visual.lorelei?.skinColor || '#d8a47f';
    const leather = '#62462f';
    const outline = '#171d1b';
    const pose = visual.pose || 'Neutral';
    const leftShoulder = center - shape.shoulder;
    const rightShoulder = center + shape.shoulder;
    let leftArm = `<path d="M${leftShoulder + 4} ${top + 13}Q${leftShoulder - 19} ${top + 75} ${leftShoulder - 7} ${hipY + 4}" fill="none" stroke="${primary}" stroke-width="25" stroke-linecap="round"/><circle cx="${leftShoulder - 7}" cy="${hipY + 8}" r="11" fill="${skin}" stroke="${outline}" stroke-width="3"/>`;
    let rightArm = `<path d="M${rightShoulder - 4} ${top + 13}Q${rightShoulder + 19} ${top + 75} ${rightShoulder + 7} ${hipY + 4}" fill="none" stroke="${primary}" stroke-width="25" stroke-linecap="round"/><circle cx="${rightShoulder + 7}" cy="${hipY + 8}" r="11" fill="${skin}" stroke="${outline}" stroke-width="3"/>`;
    if (pose === 'Confident') {
      leftArm = `<path d="M${leftShoulder + 3} ${top + 13}Q${leftShoulder - 22} ${top + 58} ${center - shape.waist - 5} ${waistY + 18}" fill="none" stroke="${primary}" stroke-width="25" stroke-linecap="round"/><circle cx="${center - shape.waist - 3}" cy="${waistY + 18}" r="11" fill="${skin}" stroke="${outline}" stroke-width="3"/>`;
    } else if (pose === 'Relaxed') {
      rightArm = `<path d="M${rightShoulder - 3} ${top + 13}Q${rightShoulder + 12} ${top + 58} ${center + 17} ${waistY + 27}" fill="none" stroke="${primary}" stroke-width="25" stroke-linecap="round"/><circle cx="${center + 15}" cy="${waistY + 27}" r="11" fill="${skin}" stroke="${outline}" stroke-width="3"/>`;
    }
    const legs = `<path d="M${center - shape.hip + 12} ${hipY - 2}L${center - 29} ${kneeY}l-10 ${footY - kneeY}" fill="none" stroke="#332f2b" stroke-width="29" stroke-linecap="round"/><path d="M${center + shape.hip - 12} ${hipY - 2}L${center + 29} ${kneeY}l10 ${footY - kneeY}" fill="none" stroke="#332f2b" stroke-width="29" stroke-linecap="round"/><path d="M${center - 42} ${footY}h35" stroke="#1c201f" stroke-width="19" stroke-linecap="round"/><path d="M${center + 7} ${footY}h35" stroke="#1c201f" stroke-width="19" stroke-linecap="round"/>`;
    const torsoPath = `M${leftShoulder} ${top + 8}Q${center} ${top - 10} ${rightShoulder} ${top + 8}L${center + shape.waist} ${waistY}L${center + shape.hip} ${hipY}Q${center} ${hipY + 15} ${center - shape.hip} ${hipY}L${center - shape.waist} ${waistY}Z`;
    let outfit = '';
    if (visual.outfit === 'Tunic') {
      outfit = `<path d="${torsoPath}" fill="${primary}" stroke="${outline}" stroke-width="5"/><path d="M${center - 17} ${top + 4}l17 25 17-25" fill="none" stroke="${secondary}" stroke-width="8"/><path d="M${center - shape.waist - 5} ${waistY}h${shape.waist * 2 + 10}" stroke="${leather}" stroke-width="13"/><rect x="${center - 10}" y="${waistY - 8}" width="20" height="16" rx="3" fill="#b58b45"/><path d="M${center - 29} ${waistY + 9}l-7 74h31l5-72 5 72h31l-7-74z" fill="${secondary}" stroke="${outline}" stroke-width="4"/>`;
    } else if (visual.outfit === 'Apprentice') {
      outfit = `<path d="${torsoPath}" fill="${secondary}" stroke="${outline}" stroke-width="5"/><path d="M${leftShoulder + 10} ${top + 11}Q${center} ${top + 24} ${rightShoulder - 10} ${top + 11}L${center + 19} ${hipY + 83}H${center - 19}Z" fill="${primary}" stroke="${outline}" stroke-width="4"/><path d="M${center - shape.waist - 3} ${waistY}h${shape.waist * 2 + 6}" stroke="${leather}" stroke-width="11"/><path d="M${center} ${top + 23}v${hipY - top + 55}" stroke="#c6a75c" stroke-width="4"/><rect x="${center + 27}" y="${waistY + 9}" width="25" height="34" rx="4" fill="#4e3728" stroke="#b18b4b" stroke-width="3"/>`;
    } else {
      outfit = `<path d="${torsoPath}" fill="${primary}" stroke="${outline}" stroke-width="5"/><path d="M${leftShoulder - 2} ${top + 4}Q${center} ${top + 36} ${rightShoulder + 2} ${top + 4}l-11 45q-40-24-78 0z" fill="${secondary}" stroke="${outline}" stroke-width="4"/><path d="M${center - shape.waist - 4} ${waistY}h${shape.waist * 2 + 8}" stroke="${leather}" stroke-width="12"/><path d="M${center - 34} ${top + 31}L${center + 30} ${waistY + 67}" stroke="#76553a" stroke-width="8"/><path d="M${center + 34} ${waistY + 62}q30 8 26 50h-44q-5-35 18-50z" fill="#62452f" stroke="${outline}" stroke-width="4"/>`;
    }
    return { svg: `${legs}${leftArm}${rightArm}${outfit}`, colors: { primary, secondary, skin, leather } };
  }

  function renderSvg() {
    const visual = currentVisual();
    const identity = currentIdentity();
    const body = bodyAndOutfit(visual);
    const head = headUri();
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE.width}" height="${SIZE.height}" viewBox="0 0 ${SIZE.width} ${SIZE.height}" role="img" aria-label="${xml(visual.name || 'Ascendry hero')}">${scene(visual.background || 'Guild Hall')}<ellipse cx="180" cy="449" rx="78" ry="18" fill="#020605" opacity=".45"/>${rearGear(identity.className, identity.build)}<g>${body.svg}</g>${head ? `<image href="${xml(head)}" x="112" y="24" width="136" height="136" preserveAspectRatio="xMidYMid meet"/>` : ''}<path d="M151 147q29 19 58 0" fill="none" stroke="${body.colors.secondary}" stroke-width="12" stroke-linecap="round"/>${frontGear(identity.className, identity.build, body.colors)}<g transform="translate(18 438)"><rect width="324" height="27" rx="13.5" fill="#07110f" opacity=".82" stroke="#b38f48" stroke-opacity=".45"/><text x="14" y="18" fill="#d7c58e" font-size="10" font-family="system-ui,sans-serif" font-weight="800">${xml(identity.className.toUpperCase())} · ${xml(String(identity.build).toUpperCase())}</text></g></svg>`;
  }

  function renderDataUri() {
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(renderSvg())}`;
  }

  globalThis.SFAvatarFigure = Object.freeze({ version: 1, figureKey, renderSvg, renderDataUri, currentVisual, currentIdentity });
  window.dispatchEvent(new CustomEvent('sf-avatar-figure-ready'));
})();
