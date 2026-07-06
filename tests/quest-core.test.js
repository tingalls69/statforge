'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../js/alpha-quest-core.js');

const FOCUSES = [
  'Strength',
  'Movement & Fitness',
  'Life & Routines',
  'Nutrition',
  'Sleep & Recovery',
  'Focus & Productivity',
  'Mental Wellness',
  'Creative Development'
];

function planFor(focus, days = 3) {
  const weeks = Array.from({ length: 8 }, (_, weekIndex) => ({
    weekNumber: weekIndex + 1,
    phaseId: ['baseline', 'repeat', 'stabilize', 'review', 'progress', 'apply', 'independent', 'capstone'][weekIndex],
    sessions: Array.from({ length: days }, (_, sessionIndex) => ({
      id: `${focus.toLowerCase().replace(/\W+/g, '-')}-w${weekIndex + 1}-s${sessionIndex + 1}`,
      title: `${focus} ${weekIndex + 1}.${sessionIndex + 1}`,
      items: [{ id: `i-${weekIndex}-${sessionIndex}`, name: 'Do the task', prescription: 'Complete one clear action.' }]
    }))
  }));
  return {
    id: `plan-${focus}`,
    focus,
    daysPerWeek: days,
    weeks,
    week1: weeks[0].sessions
  };
}

function stateFor(plan, count, status = 'full') {
  return {
    primaryQuestline: plan,
    questHistory: Array.from({ length: count }, (_, index) => ({
      id: `q-${index + 1}`,
      questlineId: plan.id,
      sessionId: plan.weeks[Math.floor(index / plan.daysPerWeek)].sessions[index % plan.daysPerWeek].id,
      date: `2026-07-${String(index + 1).padStart(2, '0')}`,
      completedAt: `2026-07-${String(index + 1).padStart(2, '0')}T12:00:00Z`,
      status
    }))
  };
}

test('all eight Primary categories satisfy the eight-week plan contract', () => {
  for (const focus of FOCUSES) {
    assert.deepEqual(core.validatePlan(planFor(focus, 3)), [], focus);
  }
});

for (const days of [1, 3, 5]) {
  test(`${days}-day plans select the correct week and session`, () => {
    const plan = planFor('Nutrition', days);
    const completed = days + Math.min(1, days - 1);
    const state = stateFor(plan, completed);
    const progress = core.getProgress(state, plan, new Date('2026-08-20T12:00:00'));
    assert.equal(progress.currentWeekIndex, 1);
    assert.equal(progress.currentSessionIndex, completed % days);
    assert.equal(progress.currentSession.id, plan.weeks[1].sessions[completed % days].id);
  });
}

test('a same-day minimum at a week boundary retains the completed session for upgrade', () => {
  const plan = planFor('Nutrition', 3);
  const state = stateFor(plan, 2);
  state.questHistory.push({
    id: 'minimum-boundary',
    questlineId: plan.id,
    sessionId: plan.weeks[0].sessions[2].id,
    date: '2026-07-06',
    completedAt: '2026-07-06T12:00:00Z',
    status: 'minimum'
  });

  const progress = core.getProgress(state, plan, new Date('2026-07-06T16:00:00'));
  assert.equal(progress.currentWeekIndex, 0);
  assert.equal(progress.currentSessionIndex, 2);
  assert.equal(progress.currentSession.id, plan.weeks[0].sessions[2].id);
});

test('the next day advances after the final session of a completion block', () => {
  const plan = planFor('Nutrition', 3);
  const state = stateFor(plan, 3);
  const progress = core.getProgress(state, plan, new Date('2026-07-20T12:00:00'));
  assert.equal(progress.currentWeekIndex, 1);
  assert.equal(progress.currentSessionIndex, 0);
  assert.equal(progress.currentSession.id, plan.weeks[1].sessions[0].id);
});

test('withProgress maintains the legacy week1 field without losing the true Week 1 preview', () => {
  const plan = planFor('Focus & Productivity', 3);
  const state = stateFor(plan, 4);
  const next = core.withProgress(state, plan, new Date('2026-08-20T12:00:00'));
  assert.equal(next.currentWeekIndex, 1);
  assert.equal(next.activeSessionId, plan.weeks[1].sessions[1].id);
  assert.deepEqual(next.week1.map(session => session.id), plan.weeks[1].sessions.map(session => session.id));
  assert.deepEqual(plan.weeks[0].sessions.map(session => session.id), plan.week1.map(session => session.id));
});
