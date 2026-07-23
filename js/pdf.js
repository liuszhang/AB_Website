function showToast(msg, done) {
  var toast = document.getElementById('pdfToast');
  var spinner = document.getElementById('toastSpinner');
  var icon = document.getElementById('toastIcon');
  var text = document.getElementById('toastMsg');
  text.textContent = msg;
  if (done) {
    spinner.style.display = 'none';
    icon.style.display = '';
    icon.textContent = '\u2705';
  } else {
    spinner.style.display = '';
    icon.style.display = 'none';
  }
  toast.classList.add('show');
}
function hideToast() {
  document.getElementById('pdfToast').classList.remove('show');
}

function downloadPDF() {
  var btn = document.querySelector('.fab-pdf');
  btn.style.display = 'none';
  showToast('正在生成 PDF...');

  var pages = document.querySelectorAll('.page');
  var total = pages.length;
  var PAGE_W = 780;
  var PAGE_H = 1060;
  var pdf = new jspdf.jsPDF({ unit: 'px', format: [PAGE_W, PAGE_H], orientation: 'portrait' });

  // Temporarily ensure all pages render at full width
  var savedOverflow = [];
  pages.forEach(function(page) {
    savedOverflow.push(page.style.overflow);
    page.style.overflow = 'visible';
  });

  // Fix gradient text: html2canvas doesn't support background-clip: text,
  // so we apply solid colors via inline style (highest specificity)
  var cyanEls = document.querySelectorAll('.dc-hero-title .cyan');
  var savedCyan = [];
  cyanEls.forEach(function(el) {
    savedCyan.push({ bg: el.style.background, tfc: el.style.webkitTextFillColor, c: el.style.color });
    el.style.background = 'none';
    el.style.color = '#00d4ff';
    el.style.webkitTextFillColor = '#00d4ff';
  });

  var h1Els = document.querySelectorAll('.cp-hero h1');
  var savedH1 = [];
  h1Els.forEach(function(el) {
    savedH1.push({ bg: el.style.background, tfc: el.style.webkitTextFillColor, c: el.style.color });
    el.style.background = 'none';
    el.style.color = '#1a1a2e';
    el.style.webkitTextFillColor = '#1a1a2e';
  });

  var tasks = [];
  pages.forEach(function(page, i) {
    tasks.push(function() {
      showToast('正在渲染第 ' + (i + 1) + ' / ' + total + ' 页...');
      return html2canvas(page, {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        backgroundColor: null,
        width: PAGE_W,
        height: PAGE_H,
        windowWidth: Math.max(PAGE_W, document.documentElement.scrollWidth),
        windowHeight: Math.max(PAGE_H, document.documentElement.scrollHeight),
        scrollX: 0,
        scrollY: 0
      }).then(function(canvas) {
        var imgData = canvas.toDataURL('image/jpeg', 0.95);
        if (i > 0) pdf.addPage([PAGE_W, PAGE_H], 'portrait');
        pdf.addImage(imgData, 'JPEG', 0, 0, PAGE_W, PAGE_H);
      });
    });
  });

  tasks.reduce(function(p, fn) { return p.then(fn); }, Promise.resolve())
    .then(function() {
      // Restore all styles
      cyanEls.forEach(function(el, i) {
        el.style.background = savedCyan[i].bg;
        el.style.color = savedCyan[i].c;
        el.style.webkitTextFillColor = savedCyan[i].tfc;
      });
      h1Els.forEach(function(el, i) {
        el.style.background = savedH1[i].bg;
        el.style.color = savedH1[i].c;
        el.style.webkitTextFillColor = savedH1[i].tfc;
      });
      pages.forEach(function(page, i) {
        page.style.overflow = savedOverflow[i] || '';
      });
      showToast('PDF 生成完成，正在下载...', true);
      pdf.save('寸金平台-产品手册.pdf');
      setTimeout(function() {
        hideToast();
        btn.style.display = '';
      }, 2000);
    });
}
