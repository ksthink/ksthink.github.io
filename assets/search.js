(function () {
  var panel = document.getElementById('search');
  var field = document.getElementById('nav-search');
  var toggle = document.getElementById('search-toggle');
  if (!panel || !field || !toggle) return;

  var input = document.getElementById('search-input');
  var status = document.getElementById('search-status');
  var list = document.getElementById('search-results');
  var indexUrl = panel.getAttribute('data-index') || '/search.json';

  var posts = null;
  var loading = null;
  var timer = null;

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function load() {
    if (posts) return Promise.resolve(posts);
    if (loading) return loading;
    loading = fetch(indexUrl)
      .then(function (res) { return res.json(); })
      .then(function (data) { posts = data; return posts; })
      .catch(function () {
        loading = null;
        status.textContent = '검색 색인을 불러오지 못했습니다.';
        return [];
      });
    return loading;
  }

  function excerpt(content, terms) {
    var lower = content.toLowerCase();
    var at = -1;
    for (var i = 0; i < terms.length; i++) {
      var found = lower.indexOf(terms[i]);
      if (found !== -1 && (at === -1 || found < at)) at = found;
    }
    if (at === -1) return escapeHtml(content.slice(0, 160)) + (content.length > 160 ? '…' : '');
    var start = Math.max(0, at - 60);
    var slice = content.slice(start, start + 200);
    return (start > 0 ? '…' : '') + highlight(slice, terms) +
      (start + 200 < content.length ? '…' : '');
  }

  function highlight(text, terms) {
    var escaped = escapeHtml(text);
    terms.forEach(function (term) {
      var safe = escapeHtml(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      escaped = escaped.replace(new RegExp(safe, 'gi'), function (m) {
        return '<mark>' + m + '</mark>';
      });
    });
    return escaped;
  }

  function render(query) {
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    list.innerHTML = '';

    if (!terms.length) {
      status.textContent = '';
      panel.classList.remove('is-open');
      return;
    }

    panel.classList.add('is-open');

    var hits = posts.filter(function (post) {
      var haystack = (post.title + ' ' + post.content).toLowerCase();
      return terms.every(function (term) { return haystack.indexOf(term) !== -1; });
    });

    status.textContent = hits.length
      ? hits.length + '개의 글을 찾았습니다.'
      : '"' + query + '"에 대한 검색 결과가 없습니다.';

    hits.forEach(function (post) {
      var li = document.createElement('li');
      li.innerHTML =
        '<a href="' + escapeHtml(post.url) + '">' +
          '<time class="search-result-time">' + escapeHtml(post.date) + '</time>' +
          '<span class="search-result-title">' + highlight(post.title, terms) + '</span>' +
          '<p class="search-result-excerpt">' + excerpt(post.content, terms) + '</p>' +
        '</a>';
      list.appendChild(li);
    });
  }

  function search() {
    var query = input.value.trim();
    if (!query) {
      render('');
      return;
    }
    load().then(function () { render(query); });
  }

  function open() {
    field.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', '검색 닫기');
    load();
    input.focus();
  }

  function close() {
    field.classList.remove('is-open');
    panel.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', '검색 열기');
    input.value = '';
    list.innerHTML = '';
    status.textContent = '';
    toggle.focus();
  }

  toggle.addEventListener('click', function () {
    if (field.classList.contains('is-open')) close(); else open();
  });

  input.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(search, 150);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && field.classList.contains('is-open')) close();
  });
})();
