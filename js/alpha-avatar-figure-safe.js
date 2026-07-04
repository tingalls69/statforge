(() => {
  'use strict';

  const base = globalThis.SFAvatarFigure;
  if (!base) return;

  function bodyOnlySvg() {
    return base.renderSvg().replace(
      /<image href="[^"]*" x="112" y="24" width="136" height="136" preserveAspectRatio="xMidYMid meet"\/>/,
      ''
    );
  }

  function bodyOnlyDataUri() {
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(bodyOnlySvg())}`;
  }

  globalThis.SFAvatarFigure = Object.freeze({
    version: 2,
    figureKey: base.figureKey,
    currentVisual: base.currentVisual,
    currentIdentity: base.currentIdentity,
    renderSvg: bodyOnlySvg,
    renderDataUri: bodyOnlyDataUri
  });

  window.dispatchEvent(new CustomEvent('sf-avatar-figure-ready'));
})();
