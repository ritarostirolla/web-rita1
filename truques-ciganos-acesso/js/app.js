(function () {
  var bar = document.getElementById('progress-bar');
  var btnPrint = document.getElementById('btn-print');

  function updateProgress() {
    if (!bar) return;
    var doc = document.documentElement;
    var scrollTop = doc.scrollTop || document.body.scrollTop;
    var height = doc.scrollHeight - doc.clientHeight;
    var pct = height > 0 ? (scrollTop / height) * 100 : 0;
    bar.style.width = pct + '%';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  if (btnPrint) {
    btnPrint.addEventListener('click', function () {
      window.print();
    });
  }

  var vipSource = document.querySelector('.cover .vip-cta');
  if (vipSource) {
    document.querySelectorAll('.chapter .page-nav').forEach(function (nav) {
      var clone = vipSource.cloneNode(true);
      clone.classList.add('vip-cta--chapter');
      nav.parentNode.insertBefore(clone, nav);
    });
  }
})();
