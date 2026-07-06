'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadStore(saved) {
  const memory = new Map();
  if (saved) memory.set('statforge_state_v2', JSON.stringify(saved));
  const events = [];
  const sandbox = {
    console,
    Blob,
    URL,
    setTimeout,
    localStorage: {
      getItem(key) { return memory.has(key) ? memory.get(key) : null; },
      setItem(key, value) { memory.set(key, String(value)); }
    },
    CustomEvent: class CustomEvent {
      constructor(type, options = {}) { this.type = type; this.detail = options.detail; }
    },
    document: { createElement() { return { click() {} }; } },
    window: {
      SF_DATA: { xpThresholds: [0, 300, 900] },
      dispatchEvent(event) { events.push(event); }
    }
  };
  sandbox.window.window = sandbox.window;
  sandbox.window.localStorage = sandbox.localStorage;
  sandbox.window.CustomEvent = sandbox.CustomEvent;
  const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'storage.js'), 'utf8');
  vm.runInNewContext(source, sandbox, { filename: 'storage.js' });
  return { store: sandbox.window.SFStore, memory, events };
}

test('schema 6 saves migrate to schema 7 without losing progress', () => {
  const original = {
    version: 6,
    createdAt: '2026-01-01T00:00:00Z',
    profile: { name: 'Test Hero', baselineComplete: true, programStartDate: '2026-01-01' },
    onboarding: {
      completed: true,
      improvementAreas: ['Nutrition'],
      primaryFocus: 'Nutrition',
      questlineSetup: { daysPerWeek: 3, exactDays: [] },
      characterDraft: {}
    },
    rlaStats: { strength: 5, vitality: { score: 7, growth: 40 }, discipline: 5, focus: 5, insight: 5 },
    questHistory: [{ id: 'q1', questlineId: 'p1', date: '2026-01-02', status: 'full', xp: 40 }],
    primaryQuestline: { id: 'p1', focus: 'Nutrition' },
    xp: 640,
    level: 2,
    settings: { accent: '#25d9c7' }
  };

  const { store } = loadStore(original);
  const migrated = store.get();
  assert.equal(migrated.version, 7);
  assert.equal(migrated.xp, 640);
  assert.equal(migrated.questHistory.length, 1);
  assert.equal(migrated.rlaStats.vitality.score, 7);
  assert.equal(JSON.stringify(migrated.onboarding.lifeTrackSelections), '{}');
  assert.equal(JSON.stringify(migrated.onboarding.coachingProfile.contexts), '{}');
  assert.equal(JSON.stringify(migrated.onboarding.questlineSetup.avoidedExerciseIds), '[]');
  assert.equal(JSON.stringify(migrated.questlineArchive), '[]');
  assert.equal(migrated.settings.pendingQuestPreferences, null);
});

test('schema 7 defaults formally contain coaching and queued-preference fields', () => {
  const { store } = loadStore(null);
  const state = store.defaultState();
  assert.equal(store.SCHEMA_VERSION, 7);
  assert.equal(state.onboarding.coachingProfile.confidence, 5);
  assert.equal(JSON.stringify(state.onboarding.lifeTrackSelections), '{}');
  assert.equal(JSON.stringify(state.onboarding.questlineSetup.avoidedExerciseIds), '[]');
  assert.equal(state.settings.pendingQuestPreferences, null);
});
