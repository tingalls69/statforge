(() => {
  'use strict';

  const base = globalThis.SFAvatarFigure;
  if (!base) return;

  function bodyOnlySvg() {
    const source = base.renderSvg();
    const start = source.indexOf('<image href=');
    if (start < 0) return source;
    const end = source.indexOf('/>', start);
    if (end < 0) return source;
    return source.slice(0, start) + source.slice(end + 2);
  }

  function bodyOnlyDataUri() {
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(bodyOnlySvg())}`;
  }

  globalThis.SFAvatarFigure = Object.freeze({
    version: 3,
    figureKey: base.figureKey,
    currentVisual: base.currentVisual,
    currentIdentity: base.currentIdentity,
    renderSvg: bodyOnlySvg,
    renderDataUri: bodyOnlyDataUri
  });

  window.dispatchEvent(new CustomEvent('sf-avatar-figure-ready'));
})();
