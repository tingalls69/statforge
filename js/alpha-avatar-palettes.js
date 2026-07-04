(() => {
  'use strict';

  const defaults = {
    headVariant: 'variant01', eyesVariant: 'variant04', eyebrowsVariant: 'variant05', noseVariant: 'variant02', mouthVariant: 'happy04', hairVariant: 'variant12',
    beardVariant: 'variant01', glassesVariant: 'variant01', earringsVariant: 'variant01', beardEnabled: false, glassesEnabled: false, earringsEnabled: false,
    frecklesEnabled: false, hairAccessoriesEnabled: false, skinColor: '#d8a47f', hairColor: '#4b2e23', eyebrowsColor: '#4b2e23', eyesColor: '#47647a',
    glassesColor: '#292624', earringsColor: '#c49b45', backgroundColor: '#17362d'
  };
  const palettes = {
    skinColor: [['Porcelain','#f6e5d7'],['Fair','#ebccb4'],['Warm','#d8a47f'],['Golden','#c58b62'],['Tan','#ad704d'],['Brown','#87513a'],['Deep','#663b2d'],['Rich','#482a23']],
    hairColor: [['Black','#171411'],['Dark Brown','#3b251b'],['Brown','#69442d'],['Light Brown','#9a6b45'],['Blonde','#d6b36a'],['Auburn','#8c3d28'],['Red','#b84b35'],['Gray','#777777'],['White','#d9d5ca'],['Blue','#304f73'],['Purple','#634576'],['Green','#365f4b']],
    eyesColor: [['Dark Brown','#3f2b22'],['Brown','#6b4937'],['Hazel','#7b6a39'],['Green','#456c50'],['Blue','#476f94'],['Gray','#68757b'],['Violet','#655077']],
    metal: [['Black','#292624'],['Brown','#604536'],['Silver','#8e9497'],['Gold','#c49b45'],['Copper','#a45e43']],
    backgroundColor: [['Forest','#17362d'],['Moss','#3e4e2d'],['Midnight','#182536'],['Slate','#35434a'],['Wine','#4d2834'],['Plum','#3f3049'],['Parchment','#8f7b5d'],['Ash','#555350']]
  };

  globalThis.SFLoreleiData = Object.freeze({ defaults, palettes });
})();
