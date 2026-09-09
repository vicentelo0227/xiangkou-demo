// 營業時間與可取餐時段。全部依使用者裝置的當下時間計算。
(function () {
  var DAY = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
  var STEP = 10;            // 取餐時段間隔（分）
  var LAST_ORDER = 15;      // 指定時段最晚可選到打烊前幾分鐘

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

  // 今天之後第一個有營業的日子，slots() 與 label() 共用同一套判斷才不會標成不同天
  function nextOpenDay(d) {
    var t = new Date(d.getTime());
    for (var i = 1; i <= 7; i++) {
      t.setDate(t.getDate() + 1);
      if (windows(t).length) return { label: i === 1 ? '明天' : DAY[t.getDay()], date: t, open: windows(t)[0] };
    }
    return null;
  }

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
          // 剩餘時間不夠備餐就等於停止接單，否則會答應一個做不完的單
          var left = w[1] - n, taking = left >= SHOP.prepMinutes;
          return {
            open: taking,
            text: taking ? '現在營業中' : '準備打烊了',
            sub: taking ? (fmt(w[1]) + ' 休息' + (left <= 45 ? '，剩 ' + left + ' 分鐘' : ''))
                        : ('' + fmt(w[1]) + ' 休息，已停止接單')
          };
        }
        if (n < w[0]) return { open: false, text: '還沒開', sub: fmt(w[0]) + ' 開始營業' };
      }
      return { open: false, text: '今天賣完了', sub: Hours.nextOpenText(d) };
    },

    nextOpenText: function (d) {
      var nx = nextOpenDay(d || new Date());
      return nx ? nx.label + ' ' + fmt(nx.open[0]) + ' 再開' : '請洽門市';
    },

    // 可以選的取餐時間。營業中會多一個「盡快」。
    slots: function (d) {
      d = d || new Date();
      var out = [];
      var n = nowMins(d);
      var earliest = Math.ceil((n + SHOP.prepMinutes) / STEP) * STEP;
      var ws = windows(d);

      // 備餐時間必須塞得進目前這個營業時段，否則「盡快」會算出打烊後的取餐時間
      var fits = ws.some(function (w) { return n >= w[0] && n < w[1] && n + SHOP.prepMinutes <= w[1]; });
      if (fits && Hours.status(d).open) {
        out.push({ v: 'asap', label: '盡快', sub: '約 ' + SHOP.prepMinutes + ' 分鐘後' });
      }
      ws.forEach(function (w) {
        for (var m = Math.max(earliest, w[0]); m <= w[1] - LAST_ORDER; m += STEP) {
          out.push({ v: 'today:' + fmt(m), label: fmt(m), sub: '今天' });
        }
      });

      if (out.length < 2) {                       // 今天沒得選了，給下一個營業日的前幾個時段
        var nx = nextOpenDay(d);
        if (nx) {
          for (var mm = nx.open[0]; mm <= Math.min(nx.open[0] + 50, nx.open[1] - LAST_ORDER); mm += STEP) {
            out.push({ v: 'next:' + fmt(mm), label: fmt(mm), sub: nx.label });
          }
        }
      }
      return out;
    },

    plus: function (hhmm, add) { return fmt(mins(hhmm) + (add || 0)); },

    // 'next:' 的實際日子要重算，隔天公休時下一個營業日可能是後天。offset 給外送加路程
    label: function (v, d, offset) {
      if (!v) return '';
      offset = offset || 0;
      if (v === 'asap') return '盡快（約 ' + (SHOP.prepMinutes + offset) + ' 分鐘後）';
      var p = v.split(':');
      var when = '今天';
      if (p[0] !== 'today') {
        var nx = nextOpenDay(d || new Date());
        when = nx ? nx.label : '下次營業日';
      }
      return when + ' ' + fmt(mins(p.slice(1).join(':')) + offset);
    },

    hoursText: function () {
      var s = SHOP.hours.slots.map(function (x) { return x[0] + '–' + x[1]; }).join('　');
      var off = SHOP.hours.closedDays.map(function (i) { return DAY[i]; }).join('、');
      return s + (off ? '　' + off + '公休' : '');
    }
  };

  window.Hours = Hours;
})();
