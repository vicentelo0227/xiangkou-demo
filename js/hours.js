// 營業時間與可取餐時段。全部依使用者裝置的當下時間計算。
(function () {
  var DAY = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
  var STEP = 10;            // 取餐時段間隔（分）
  var LAST_ORDER = 15;      // 打烊前幾分鐘停止接單

  function mins(hhmm) { var p = hhmm.split(':'); return (+p[0]) * 60 + (+p[1]); }
  function fmt(m) {
    m = ((m % 1440) + 1440) % 1440;
    var h = Math.floor(m / 60), mm = m % 60;
    return (h < 10 ? '0' : '') + h + ':' + (mm < 10 ? '0' : '') + mm;
  }
  function windows(date) {
    if (SHOP.hours.closedDays.indexOf(date.getDay()) >= 0) return [];
    return SHOP.hours.slots.map(function (s) { return [mins(s[0]), mins(s[1])]; });
  }
  function nowMins(d) { return d.getHours() * 60 + d.getMinutes(); }

  var Hours = {
    isOpen: function (d) {
      d = d || new Date();
      var n = nowMins(d);
      return windows(d).some(function (w) { return n >= w[0] && n < w[1]; });
    },

    // 一句話說明現在的狀態，放在頁首
    status: function (d) {
      d = d || new Date();
      var n = nowMins(d), ws = windows(d);
      if (!ws.length) return { open: false, text: '今天公休', sub: Hours.nextOpenText(d) };
      for (var i = 0; i < ws.length; i++) {
        var w = ws[i];
        if (n >= w[0] && n < w[1]) {
          var left = w[1] - n;
          return {
            open: left > LAST_ORDER,
            text: left > LAST_ORDER ? '現在營業中' : '準備打烊了',
            sub: left > LAST_ORDER ? (fmt(w[1]) + ' 休息' + (left <= 45 ? '，剩 ' + left + ' 分鐘' : ''))
                                   : ('' + fmt(w[1]) + ' 休息，已停止接單')
          };
        }
        if (n < w[0]) return { open: false, text: '還沒開', sub: fmt(w[0]) + ' 開始營業' };
      }
      return { open: false, text: '今天賣完了', sub: Hours.nextOpenText(d) };
    },

    nextOpenText: function (d) {
      var t = new Date(d.getTime());
      for (var i = 1; i <= 7; i++) {
        t.setDate(t.getDate() + 1);
        var ws = windows(t);
        if (ws.length) {
          var label = (i === 1) ? '明天' : DAY[t.getDay()];
          return label + ' ' + fmt(ws[0][0]) + ' 再開';
        }
      }
      return '';
    },

    // 可以選的取餐時間。營業中會多一個「盡快」。
    slots: function (d) {
      d = d || new Date();
      var out = [];
      var n = nowMins(d);
      var earliest = Math.ceil((n + SHOP.prepMinutes) / STEP) * STEP;
      var ws = windows(d);

      if (Hours.isOpen(d) && Hours.status(d).open) {
        out.push({ v: 'asap', label: '盡快', sub: '約 ' + SHOP.prepMinutes + ' 分鐘後' });
      }
      ws.forEach(function (w) {
        for (var m = Math.max(earliest, w[0]); m <= w[1] - LAST_ORDER; m += STEP) {
          out.push({ v: 'today:' + fmt(m), label: fmt(m), sub: '今天' });
        }
      });

      if (out.length < 2) {                       // 今天沒得選了，給隔天的前幾個時段
        var t = new Date(d.getTime());
        for (var i = 1; i <= 7; i++) {
          t.setDate(t.getDate() + 1);
          var nw = windows(t);
          if (!nw.length) continue;
          var label = (i === 1) ? '明天' : DAY[t.getDay()];
          for (var mm = nw[0][0]; mm <= Math.min(nw[0][0] + 50, nw[0][1] - LAST_ORDER); mm += STEP) {
            out.push({ v: 'next:' + fmt(mm), label: fmt(mm), sub: label });
          }
          break;
        }
      }
      return out;
    },

    label: function (v) {
      if (!v) return '';
      if (v === 'asap') return '盡快（約 ' + SHOP.prepMinutes + ' 分鐘後）';
      var p = v.split(':');
      var when = p[0] === 'today' ? '今天' : '隔天';
      return when + ' ' + p.slice(1).join(':');
    },

    hoursText: function () {
      var s = SHOP.hours.slots.map(function (x) { return x[0] + '–' + x[1]; }).join('　');
      var off = SHOP.hours.closedDays.map(function (i) { return DAY[i]; }).join('、');
      return s + (off ? '　' + off + '公休' : '');
    }
  };

  window.Hours = Hours;
})();
