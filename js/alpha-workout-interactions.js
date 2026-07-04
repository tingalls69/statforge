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

  function saveAndExit() {
    const saveButton = document.getElementById('save-exit-workout');
    if (saveButton) {
      saveButton.click();
      return;
    }

    const root = document.getElementById('modal-root');
    if (root) root.innerHTML = '';
    document.body.classList.remove('no-scroll');
  }

  document.addEventListener('click', event => {
    const expandButton = event.target.closest?.('.workout-runner [data-expand-exercise]');
    if (expandButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      toggleExercise(expandButton);
      return;
    }

    const backButton = event.target.closest?.('.workout-runner #close-workout');
    if (!backButton) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    saveAndExit();
  }, true);
})();
