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
  function update() {
    // The section being read is the last heading above the top 30% of the viewport.
    var line = window.innerHeight * 0.3;
    var active = -1;
    for (var i = 0; i < headings.length; i++) {
      if (headings[i].getBoundingClientRect().top <= line) active = i;
      else break;
    }
    // At the bottom of the page, the final sections may never reach the line.
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      active = headings.length - 1;
    }
    if (active === current) return;
    if (current >= 0) links[current].classList.remove('active');
    if (active >= 0) links[active].classList.add('active');
    current = active;
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; update(); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
