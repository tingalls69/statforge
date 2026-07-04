(() => {
  'use strict';

  function toggleExercise(button) {
    const card = button.closest('.workout-exercise-card');
    const body = card?.querySelector('.exercise-body');
    if (!card || !body) return;

    const nextExpanded = button.getAttribute('aria-expanded') !== 'true';
    const topBefore = button.getBoundingClientRect().top;

    button.setAttribute('aria-expanded', String(nextExpanded));
    card.classList.toggle('expanded', nextExpanded);
    body.hidden = !nextExpanded;

    const chevron = button.querySelector('.exercise-chevron');
    if (chevron) chevron.textContent = nextExpanded ? '⌃' : '⌄';

    requestAnimationFrame(() => {
      const topAfter = button.getBoundingClientRect().top;
      const offset = topAfter - topBefore;
      if (Math.abs(offset) < 1) return;
      const runner = button.closest('.workout-runner');
      if (runner) runner.scrollTop += offset;
      else window.scrollBy(0, offset);
    });
  }

  document.addEventListener('click', event => {
    const button = event.target.closest?.('.workout-runner [data-expand-exercise]');
    if (!button) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    toggleExercise(button);
  }, true);
})();
