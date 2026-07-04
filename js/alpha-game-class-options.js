(() => {
  'use strict';

  const game = globalThis.SFGame;
  const engine = game?.engine;
  if (!engine?.actions || !engine?.bonuses) return;

  const originalActions = engine.actions.bind(engine);
  const originalBonuses = engine.bonuses.bind(engine);

  function flattenMenus(items, menuIds, filter = () => true) {
    return items.flatMap(item => {
      if (!menuIds.has(item.id) || !Array.isArray(item.options)) return [item];
      return item.options
        .filter(filter)
        .map(option => ({
          ...option,
          disabled: Boolean(item.disabled || option.disabled)
        }));
    });
  }

  engine.actions = () => {
    const items = originalActions();
    const battle = engine.get();
    if (!battle || battle.className !== 'Paladin') return items;

    return flattenMenus(items, new Set(['paladinSpells', 'commandMenu']));
  };

  engine.bonuses = () => {
    const items = originalBonuses();
    const battle = engine.get();
    if (!battle) return items;

    if (battle.className === 'Fighter') {
      return flattenMenus(
        items,
        new Set(['fighterFocus']),
        option => option.id !== 'actionSurge' || battle.level >= 5
      ).map(option => option.id === 'secondWind'
        ? { ...option, disabled: Boolean(option.disabled || battle.turnState.bonusUsed) }
        : option);
    }

    if (battle.className === 'Paladin') {
      return flattenMenus(items, new Set(['divinePower']));
    }

    return items;
  };
})();
