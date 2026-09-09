(function () {
  function el(h) { var d = document.createElement('div'); d.innerHTML = h.trim(); return d.firstChild; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  var UI = {
    mount: function (opts) {
      opts = opts || {};
      var st = Hours.status();
      document.body.insertBefore(el(
        '<header class="hd"><div class="wrap hd-in">' +
          '<a class="shop" href="index.html"><b>' + esc(SHOP.name) + '</b>' +
            '<span class="status"><span class="dot ' + (st.open ? 'on' : 'off') + '"></span>' + esc(st.text) + '</span>' +
          '</a>' +
          '<a class="hd-cart" href="cart.html" aria-label="查看訂單">訂單 <span class="b" id="cartN">0</span></a>' +
        '</div></header>'), document.body.firstChild);

      document.body.appendChild(el(
        '<footer><div class="wrap">' + esc(SHOP.name) + '　' + esc(SHOP.addr) + '<br>' +
        esc(Hours.hoursText()) + '　電話 ' + esc(SHOP.tel) + '<br>' +
        '示範網站 · 不會產生真實訂單 · 餐點照片來自 Pexels</div></footer>'));

      document.body.appendChild(el('<div class="scrim" id="scrim"></div>'));
      document.body.appendChild(el('<div class="toast" id="toast" role="status" aria-live="polite"></div>'));

      if (!opts.noBar) {
        document.body.appendChild(el(
          '<div class="bar" id="bar"><div class="bar-in">' +
            '<span class="sum" id="barSum"></span>' +
            '<a class="btn" href="cart.html" id="barBtn">看訂單</a>' +
          '</div></div>'));
      }

      document.getElementById('scrim').addEventListener('click', UI.closeSheet);
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { UI.closeSheet(); return; }
        if (e.key !== 'Tab') return;
        var s = document.getElementById('sheet');
        if (!s || !s.classList.contains('on')) return;
        var f = [].slice.call(s.querySelectorAll('button,input,textarea,a[href]'))
          .filter(function (x) { return !x.disabled && x.offsetParent !== null; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      });

      Order.onChange(UI.sync);
      window.addEventListener('xk:sync', UI.sync);
      UI.sync();
    },

    sync: function () {
      var n = Order.count(), t = Order.totals();
      var b = document.getElementById('cartN');
      if (b) b.textContent = n;
      var bar = document.getElementById('bar');
      if (bar) {
        bar.classList.toggle('on', n > 0);
        var s = document.getElementById('barSum');
        if (s) s.innerHTML = n + ' 項餐點<b class="num">' + money(t.subtotal) + '</b>';
      }
    },

    toast: function (m) {
      var t = document.getElementById('toast');
      t.textContent = m; t.classList.add('on');
      clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('on'); }, 2000);
    },

    // ---------- 客製面板 ----------
    openSheet: function (id, trigger) {
      var m = SHOP.find(id);
      if (!m) return;
      UI._picks = {};
      UI._qty = 1;
      UI._item = m;
      UI._back = trigger || document.activeElement;

      var old = document.getElementById('sheet');
      if (old) old.remove();

      var body =
        '<div class="sheet-hd"><img src="img/' + m.img + '" alt="' + esc(m.name) + '" width="520" height="520">' +
          '<button class="sheet-x" id="sheetX" aria-label="關閉">✕</button></div>' +
        '<div class="sheet-body">' +
          '<h3>' + esc(m.name) + '</h3>' +
          '<p class="ds">' + esc(m.desc) + '</p>' +
          m.groups.map(function (g) {
            // 單選群組用 radiogroup，讀螢幕才聽得出「共 N 項之 M」與所屬群組名
            var one = g.type === 'one', nm = 'gn_' + g.id, rq = 'gr_' + g.id;
            return '<div class="grp" data-grp="' + g.id + '">' +
              '<div class="grp-hd"><b id="' + nm + '">' + esc(g.name) + '</b>' +
                (one ? '<span class="req" id="' + rq + '">必選</span>'
                     : '<span class="opt-many" id="' + rq + '">可複選，不加也可以</span>') +
              '</div><div class="opts" role="' + (one ? 'radiogroup' : 'group') +
                '" aria-labelledby="' + nm + ' ' + rq + '">' +
              g.options.map(function (o, i) {
                return '<button class="opt" data-type="' + g.type + '" data-g="' + g.id + '" data-i="' + i + '"' +
                  (one ? ' role="radio" aria-checked="false"' : ' aria-pressed="false"') + '>' +
                  '<span class="box"></span><span class="lb">' + esc(o.v) + '</span>' +
                  (o.d ? '<span class="dd">' + (o.d > 0 ? '+' : '−') + money(Math.abs(o.d)).replace('NT$', '') + '</span>' : '') +
                '</button>';
              }).join('') + '</div></div>';
          }).join('') +
          '<div class="grp"><div class="grp-hd"><b>備註</b><span class="opt-many">選填</span></div>' +
            '<textarea class="note-in" id="note" rows="2" maxlength="60" placeholder="例如：不要香菜、麵煮軟一點"></textarea>' +
            '<div class="cnt"><span id="noteN">0</span> / 60</div></div>' +
        '</div>' +
        '<div class="sheet-ft">' +
          '<div class="qty"><button id="qd" aria-label="減少數量" disabled>−</button>' +
            '<span id="qv" aria-live="polite">1</span>' +
            '<button id="qi" aria-label="增加數量">＋</button></div>' +
          '<button class="cta" id="cta"><span id="ctaTx">加入訂單</span><span class="amt" id="ctaAmt"></span></button>' +
        '</div>';

      var sheet = el('<aside class="sheet" id="sheet" role="dialog" aria-modal="true" aria-label="' + esc(m.name) + ' 客製選項">' + body + '</aside>');
      document.body.appendChild(sheet);

      sheet.querySelectorAll('.opt').forEach(function (b) {
        b.onclick = function () { UI._toggle(b); };
      });
      document.getElementById('qd').onclick = function () { UI._setQty(UI._qty - 1); };
      document.getElementById('qi').onclick = function () { UI._setQty(UI._qty + 1); };
      document.getElementById('sheetX').onclick = UI.closeSheet;
      var note = document.getElementById('note');
      note.oninput = function () { document.getElementById('noteN').textContent = note.value.length; };
      document.getElementById('cta').onclick = UI._add;

      UI._refresh();
      document.getElementById('scrim').classList.add('on');
      requestAnimationFrame(function () {
        sheet.classList.add('on');
        document.getElementById('sheetX').focus();
      });
    },

    closeSheet: function () {
      var s = document.getElementById('sheet');
      if (!s || !s.classList.contains('on')) return;
      s.classList.remove('on');
      document.getElementById('scrim').classList.remove('on');
      if (UI._back && document.contains(UI._back)) UI._back.focus();
      UI._back = null;
      setTimeout(function () { if (s && !s.classList.contains('on')) s.remove(); }, 300);
    },

    // 只改動到的那幾顆按鈕與金額，不整塊重繪，焦點才不會被彈掉
    _toggle: function (b) {
      var gid = b.dataset.g, i = +b.dataset.i;
      var g = UI._item.groups.filter(function (x) { return x.id === gid; })[0];
      var v = g.options[i].v;
      var cur = UI._picks[gid] || [];

      if (g.type === 'one') {
        UI._picks[gid] = [v];
        document.querySelectorAll('.opt[data-g="' + gid + '"]').forEach(function (o) {
          o.setAttribute('aria-checked', String(+o.dataset.i === i));
        });
      } else {
        var at = cur.indexOf(v);
        if (at >= 0) cur.splice(at, 1); else cur.push(v);
        UI._picks[gid] = cur;
        b.setAttribute('aria-pressed', String(at < 0));
      }
      UI._refresh();
    },

    _setQty: function (q) {
      q = Math.max(1, Math.min(20, q));
      if (q === UI._qty) {
        if (q === 20) UI.toast('一次最多 20 份，要更多請直接打電話給我們');
        return;
      }
      UI._qty = q;
      document.getElementById('qv').textContent = q;
      document.getElementById('qd').disabled = (q <= 1);
      document.getElementById('qi').disabled = (q >= 20);
      UI._refresh();
    },

    _refresh: function () {
      var m = UI._item;
      var missing = m.groups.filter(function (g) {
        return g.type === 'one' && !(UI._picks[g.id] || []).length;
      });
      var unit = Order.unitPrice({ id: m.id, picks: UI._picks });
      var cta = document.getElementById('cta');
      var tx = document.getElementById('ctaTx');
      var amt = document.getElementById('ctaAmt');

      if (missing.length) {
        cta.disabled = true;
        tx.textContent = '請先選' + missing[0].name;
        amt.textContent = '';
      } else {
        cta.disabled = false;
        tx.textContent = '加入訂單';
        amt.textContent = money(unit * UI._qty);
      }
    },

    _add: function () {
      var m = UI._item;
      var note = (document.getElementById('note').value || '').trim();
      Order.add(m.id, UI._picks, note, UI._qty);
      UI.closeSheet();
      UI.toast('已加入 ' + m.name + ' ×' + UI._qty);
    },

    dishHTML: function (m, shut) {
      return '<button class="dish" data-dish="' + m.id + '"' + (shut ? ' disabled' : '') + '>' +
        '<span><span class="nm">' + esc(m.name) + (m.tag ? '<span class="tag">' + esc(m.tag) + '</span>' : '') + '</span>' +
        '<span class="ds">' + esc(m.desc) + '</span>' +
        '<span class="pr num">' + money(m.price) + (m.groups.some(function (g) { return g.options.some(function (o) { return o.d > 0; }); }) ? ' 起' : '') + '</span></span>' +
        '<span class="th"><img src="img/' + m.img + '" alt="' + esc(m.name) + '" width="520" height="520" loading="lazy">' +
        (shut ? '' : '<span class="plus" aria-hidden="true">＋</span>') + '</span>' +
      '</button>';
    }
  };

  window.UI = UI;
  window.esc = esc;
})();
