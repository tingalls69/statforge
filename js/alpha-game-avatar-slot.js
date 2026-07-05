(() => {
  'use strict';

  function connect() {
    document.querySelectorAll('.combat-player-card:not(.game-player)').forEach(card => {
      card.classList.add('game-player');
    });
  }

  new MutationObserver(connect).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
  window.addEventListener('load', connect);
  connect();
})();
