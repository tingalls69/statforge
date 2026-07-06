'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function buildPlan() {
  const phases = ['baseline', 'repeat', 'stabilize', 'review', 'progress', 'apply', 'independent', 'capstone'];
  const weeks = phases.map((phaseId, weekIndex) => ({
    weekNumber: weekIndex + 1,
    phaseId,
    phaseLabel: phaseId,
    sessions: [{
      id: `nutrition-w${weekIndex + 1}-s1`,
      weekNumber: weekIndex + 1,
      phaseId,
      phaseLabel: phaseId,
      items: [
        { id: `i-${weekIndex}-1`, name: 'Action', prescription: 'Old copy' },
        { id: `i-${weekIndex}-2`, name: 'Context', prescription: 'Old copy' },
        { id: `i-${weekIndex}-3`, name: 'Setup', prescription: 'Old copy' },
        { id: `i-${weekIndex}-4`, name: 'Note', prescription: 'Old copy' }
      ]
    }]
  }));
  return {
    id: 'nutrition-plan',
    focus: 'Nutrition',
    track: { id: 'balanced-meals' },
    availableTracks: [{ id: 'balanced-meals', name: 'Old', goal: 'Old' }],
    weeks,
    week1: weeks[0].sessions,
    coaching: { tier: 'Developing', context: 'Full kitchen' }
  };
}

function loadModule(plan) {
  let current = { primaryQuestline: plan };
  const store = {
    get: () => current,
    update(fn) { current = fn(current) || current; return current; }
  };
  const sandbox = {
    console,
    queueMicrotask: fn => fn(),
    window: {
      SFStore: store,
      SF_LIFE_QUESTS: {
        tracks: { Nutrition: [{ id: 'balanced-meals', name: 'Old', goal: 'Old' }] }
      },
      addEventListener() {}
    }
  };
  const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'alpha-nutrition-plain-language.js'), 'utf8');
  vm.runInNewContext(source, sandbox, { filename: 'alpha-nutrition-plain-language.js' });
  return { api: sandbox.window.SF_NUTRITION_PLAIN_LANGUAGE, getState: () => current };
}

test('Nutrition plans store example metadata on the session and quest item', () => {
  const { api } = loadModule(buildPlan());
  const plan = api.plainPlan(buildPlan());
  const session = plan.weeks[0].sessions[0];
  assert.equal(plan.exampleMetadataVersion, 1);
  assert.ok(session.questExampleTerms.some(term => term.key === 'protein'));
  assert.ok(session.questExampleTerms.some(term => term.key === 'filling-side'));
  assert.ok(session.items[0].exampleTerms.some(term => term.key === 'protein'));
  assert.ok(session.items[0].exampleTerms.some(term => term.key === 'vegetable'));
});

test('Nutrition plain-language transformation is idempotent', () => {
  const { api } = loadModule(buildPlan());
  const once = api.plainPlan(buildPlan());
  const twice = api.plainPlan(once);
  assert.deepEqual(JSON.parse(JSON.stringify(twice)), JSON.parse(JSON.stringify(once)));
});
