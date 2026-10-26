// Builds the side TOC from the post's h2/h3 and highlights the section being read.
(function () {
  var toc = document.querySelector('.toc');
  var headings = Array.prototype.filter.call(
    document.querySelectorAll('.post h2, .post h3'),
    // The hand-written "## 목차" section duplicates this nav.
    function (h) { return h.textContent.trim() !== '목차'; }
  );
  if (!toc || headings.length < 2) return;

  var list = document.createElement('ul');
  var links = headings.map(function (h, i) {
    if (!h.id) h.id = 'section-' + (i + 1);
    var li = document.createElement('li');
    li.className = 'toc-' + h.tagName.toLowerCase();
    var a = document.createElement('a');
    a.href = '#' + encodeURIComponent(h.id);
    a.textContent = h.textContent;
    li.appendChild(a);
    list.appendChild(li);
    return a;
  });
  toc.appendChild(list);
  toc.hidden = false;

  var current = -1;
  function setActive(i) {
    if (i === current) return;
    if (current >= 0) links[current].classList.remove('active');
    if (i >= 0) links[i].classList.add('active');
    current = i;
  }

  // After a TOC jump, keep the chosen item lit even if a short section lets the
  // next heading into view or the page bottoms out; any user scroll releases it.
  var locked = false;
  function lock(i) { locked = true; setActive(i); }
  ['wheel', 'touchmove', 'keydown', 'mousedown'].forEach(function (type) {
    window.addEventListener(type, function () { locked = false; }, { passive: true });
  });
  function lockToHash() {
    var target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    var i = headings.indexOf(target);
    if (i >= 0) lock(i);
    return i >= 0;
  }
  // hashchange covers in-body links too (e.g. a hand-written 목차); click covers
  // re-clicking the current item, which changes no hash.
  window.addEventListener('hashchange', lockToHash);
  toc.addEventListener('click', function (e) {
    var i = links.indexOf(e.target.closest('a'));
    if (i >= 0) lock(i);
  });

  function update() {
    if (locked) return;
    // The section being read is the last heading that has scrolled near the top.
    var line = 100;
    var active = -1;
    for (var i = 0; i < headings.length; i++) {
      if (headings[i].getBoundingClientRect().top <= line) active = i;
      else break;
    }
    // At the bottom of the page, the final sections may never reach the line.
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      active = headings.length - 1;
    }
    setActive(active);
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; update(); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  if (!lockToHash()) update();
})();
