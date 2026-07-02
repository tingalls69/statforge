(() => {
  const state = () => window.SFStore.get();
  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));

  function addReturningUserImport() {
    const begin = document.getElementById('begin-ascent');
    if (!begin || document.getElementById('returning-user-import')) return;
    const wrapper = document.createElement('div');
    wrapper.id = 'returning-user-import';
    wrapper.innerHTML = `<button class="btn ghost full" id="returning-user-button" style="margin-top:10px">Returning User — Import Save</button><input type="file" id="returning-user-file" accept="application/json" hidden><div class="alpha-note" style="text-align:center">Restore an exported save without repeating onboarding.</div>`;
    begin.insertAdjacentElement('afterend', wrapper);
    wrapper.querySelector('#returning-user-button').onclick = () => wrapper.querySelector('#returning-user-file').click();
    wrapper.querySelector('#returning-user-file').onchange = async event => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        await window.SFStore.importSave(file);
        location.reload();
      } catch (error) {
        alert(error.message || 'That save could not be imported.');
      }
    };
  }

  function addAvoidancePicker() {
    const textarea = document.querySelector('textarea[data-setup="avoidedExercises"]');
    if (!textarea || document.getElementById('exercise-avoidance-picker')) return;
    const field = textarea.closest('.field');
    const selected = new Set(state().onboarding.questlineSetup.avoidedExerciseIds || []);
    field.innerHTML = `<label>Exercises to avoid</label><div id="exercise-avoidance-picker"><input id="avoidance-search" class="exercise-search" type="search" placeholder="Search exercises"><div class="exercise-toggle-list">${Object.entries(window.SF_DATA.exercises).sort((a, b) => a[1].name.localeCompare(b[1].name)).map(([id, exercise]) => `<label class="exercise-toggle" data-exercise-name="${escapeHtml(exercise.name.toLowerCase())}"><input type="checkbox" value="${id}" ${selected.has(id) ? 'checked' : ''}><span><strong>${escapeHtml(exercise.name)}</strong><small>${escapeHtml((exercise.muscles || []).join(' · '))}</small></span></label>`).join('')}</div><div class="alpha-note">Selected exercises will be excluded from generated sessions. The plan will substitute another movement from the same training category when possible.</div></div>`;
    field.querySelectorAll('.exercise-toggle input').forEach(input => input.onchange = () => {
      input.checked ? selected.add(input.value) : selected.delete(input.value);
      window.SFStore.update(saved => {
        saved.onboarding.questlineSetup.avoidedExerciseIds = [...selected];
        return saved;
      });
    });
    field.querySelector('#avoidance-search').oninput = event => {
      const query = event.target.value.trim().toLowerCase();
      field.querySelectorAll('.exercise-toggle').forEach(row => {
        row.hidden = query && !row.dataset.exerciseName.includes(query);
      });
    };
  }

  const observer = new MutationObserver(() => {
    addReturningUserImport();
    addAvoidancePicker();
  });
  observer.observe(document.getElementById('app'), { childList: true, subtree: true });
  addReturningUserImport();
  addAvoidancePicker();
})();
