(() => {
  const input = document.getElementById('q');
  const results = document.getElementById('sr');
  if (!input || !results) return;

  const baseMeta = document.querySelector('meta[name="wiki-base"]');
  const BASE = (baseMeta && baseMeta.content) || '/shadow-wiki/';
  let searchPromise = null;

  const esc = (value) => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const closeResults = () => {
    results.classList.remove('open');
  };

  const openResults = () => {
    results.classList.add('open');
  };

  const loadSearch = async () => {
    if (!searchPromise) {
      searchPromise = fetch(BASE + 'search.json')
        .then((response) => (response.ok ? response.json() : []))
        .catch(() => []);
    }
    return searchPromise;
  };

  const render = (rows) => {
    if (!rows.length) {
      results.innerHTML = '<div class="empty">No matches</div>';
      openResults();
      return;
    }
    results.innerHTML = rows
      .map((row) =>
        '<a href="' + esc(row.url) + '">' +
          '<span>' + esc(row.title) + '</span>' +
          '<span class="cat">' + esc(row.cat) + '</span>' +
        '</a>'
      )
      .join('');
    openResults();
  };

  // 'input' fires on every value change — typing, paste, AND the native search clear button —
  // so a cleared field always closes the dropdown (keyup alone missed the clear button).
  input.addEventListener('input', async () => {
    const query = input.value.trim().toLowerCase();
    if (!query) {
      results.innerHTML = '';
      closeResults();
      return;
    }
    const rows = await loadSearch();
    // The field may have been cleared/changed while the fetch was in flight — if so, drop this
    // stale result rather than reopening the dropdown for a query that is no longer in the box.
    if (input.value.trim().toLowerCase() !== query) return;
    const matches = rows
      .filter((row) => String(row.title || '').toLowerCase().includes(query))
      .slice(0, 12);
    render(matches);
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      input.value = '';
      results.innerHTML = '';
      closeResults();
    }
  });

  document.addEventListener('click', (event) => {
    if (event.target !== input && !results.contains(event.target)) {
      closeResults();
    }
  });
})();
