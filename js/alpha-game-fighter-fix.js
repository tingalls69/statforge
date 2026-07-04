(() => {
  'use strict';

  const game = globalThis.SFGame;
  const engine = game?.engine;
  if (!engine?.bonuses) return;

  const originalBonuses = engine.bonuses.bind(engine);

  engine.bonuses = () => {
    const items = originalBonuses();
    const battle = engine.get();
    if (!battle || battle.className !== 'Fighter') return items;

    return items.flatMap(item => {
      if (item.id !== 'fighterFocus' || !Array.isArray(item.options)) return [item];
      return item.options
        .filter(option => option.id !== 'actionSurge' || battle.level >= 5)
        .map(option => ({
          ...option,
          disabled: option.id === 'secondWind'
            ? Boolean(option.disabled || battle.turnState.bonusUsed)
            : Boolean(option.disabled)
        }));
    });
  };
})();
