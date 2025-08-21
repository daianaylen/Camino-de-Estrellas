// ===== Comentarios con localStorage =====
(function() {
  const lsKey = 'cde_comments_v1';

  const form = document.getElementById('comment-form');
  const list = document.getElementById('comment-list');
  if (!form || !list) return;

  function loadComments() {
    try {
      return JSON.parse(localStorage.getItem(lsKey)) || [];
    } catch(e) {
      return [];
    }
  }

  function saveComments(arr) {
    localStorage.setItem(lsKey, JSON.stringify(arr));
  }

  function fmtDate(ts) {
    const d = new Date(ts);
    // dd/mm/yyyy hh:mm
    const pad = n => String(n).padStart(2,'0');
    return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function render() {
    const comments = loadComments();
    list.innerHTML = '';
    comments.forEach(c => {
      const el = document.createElement('div');
      el.className = 'comment-item';
      el.innerHTML = `
        <div class="comment-meta">
          <strong>${c.name || 'Anónimo'}</strong>
          ${c.city ? `<span class="dot">•</span><span>${c.city}</span>` : ''}
          <span class="dot">•</span><span>${fmtDate(c.ts)}</span>
        </div>
        <div class="comment-text">${escapeHtml(c.text).replace(/\n/g,'<br>')}</div>
      `;
      list.prepend(el);
    });
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, m => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
    }[m]));
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('c-name').value.trim();
    const city = document.getElementById('c-city').value.trim();
    const text = document.getElementById('c-text').value.trim();

    if (!text) return;

    const comments = loadComments();
    comments.push({ name, city, text, ts: Date.now() });
    saveComments(comments);

    // limpiar y render
    form.reset();
    render();
  });

  render();
})();
