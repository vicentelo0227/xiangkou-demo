// 訂單狀態。純前端，全部存在瀏覽器裡。
(function () {
  var KEY = 'xiangkou-order-v1';
  var listeners = [];
  var state = { items: [], mode: 'pickup', slot: null, order: null };

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var o = JSON.parse(raw);
      return (o && Array.isArray(o.items)) ? o : null;
    } catch (e) { return null; }
  }
  function write() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* 存不了就只活在這次瀏覽 */ }
  }

  // 載入時就把下架品項清掉、數量夾回範圍，畫面索引才會永遠對得上內部陣列
  function clean(list) {
    return (Array.isArray(list) ? list : []).filter(function (it) {
      return it && typeof it === 'object' && !!SHOP.find(it.id);
    }).map(function (it) {
      var q = Math.round(Number(it.qty));
      return {
        id: it.id,
        picks: (it.picks && typeof it.picks === 'object') ? it.picks : {},
        note: typeof it.note === 'string' ? it.note.slice(0, 60) : '',
        qty: Math.max(1, Math.min(20, isFinite(q) ? q : 1))
      };
    });
  }

  var loaded = read();
  if (loaded) {
    state.items = clean(loaded.items);
    state.mode = loaded.mode || 'pickup';
    state.slot = loaded.slot || null;
    state.order = loaded.order || null;
  }

  function keyOf(it) { return it.id + '|' + JSON.stringify(it.picks) + '|' + it.note; }

  // 單價 = 基本價 + 所有被選中選項的加價
  function unitPrice(it) {
    var m = SHOP.find(it.id);
    if (!m) return 0;
    var sum = m.price;
    m.groups.forEach(function (g) {
      var chosen = it.picks[g.id] || [];
      g.options.forEach(function (o) {
        if (chosen.indexOf(o.v) >= 0) sum += o.d;
      });
    });
    return sum;
  }

  // 把選項攤平成一行字，購物車與訂單都用這個顯示
  function describe(it) {
    var m = SHOP.find(it.id);
    if (!m) return '';
    var out = [];
    m.groups.forEach(function (g) {
      (it.picks[g.id] || []).forEach(function (v) { out.push(v); });
    });
    return out.join('・');
  }

  function notify() { listeners.forEach(function (f) { try { f(); } catch (e) {} }); }
  function emit() { write(); notify(); }

  window.addEventListener('storage', function (e) {
    if (e.key && e.key !== KEY) return;
    var o = read();
    state.items = clean(o && o.items);
    state.mode = (o && o.mode) || 'pickup';
    state.slot = (o && o.slot) || null;
    state.order = (o && o.order) || null;
    notify();
    window.dispatchEvent(new CustomEvent('xk:sync'));
  });

  var Order = {
    onChange: function (fn) { listeners.push(fn); return fn; },
    items: function () { return state.items.slice(); },
    count: function () { return state.items.reduce(function (n, it) { return n + it.qty; }, 0); },
    unitPrice: unitPrice,
    describe: describe,

    add: function (id, picks, note, qty) {
      var it = {
        id: id, picks: picks || {}, note: (note || '').slice(0, 60),
        qty: Math.max(1, Math.min(20, qty || 1))
      };
      var hit = state.items.filter(function (x) { return keyOf(x) === keyOf(it); })[0];
      if (hit) hit.qty = Math.min(20, hit.qty + it.qty);
      else state.items.push(it);
      emit();
      return it;
    },

    setQty: function (i, q) {
      var it = state.items[i];
      if (!it) return;
      q = Math.max(0, Math.min(20, q));
      if (q === 0) state.items.splice(i, 1); else it.qty = q;
      emit();
    },
    remove: function (i) { state.items.splice(i, 1); emit(); },

    mode: function (v) {
      if (v === undefined) return state.mode;
      if (['dinein', 'pickup', 'delivery'].indexOf(v) >= 0) { state.mode = v; emit(); }
      return state.mode;
    },
    slot: function (v) {
      if (v === undefined) return state.slot;
      state.slot = v || null; emit(); return state.slot;
    },

    totals: function () {
      var subtotal = state.items.reduce(function (n, it) { return n + unitPrice(it) * it.qty; }, 0);
      var d = SHOP.delivery;
      var fee = 0;
      if (state.mode === 'delivery') fee = subtotal >= d.freeOver ? 0 : d.fee;
      return {
        subtotal: subtotal, fee: fee, total: subtotal + fee,
        // 外送有低消，沒到不能送出
        shortOf: (state.mode === 'delivery') ? Math.max(0, d.min - subtotal) : 0,
        toFreeFee: (state.mode === 'delivery') ? Math.max(0, d.freeOver - subtotal) : 0
      };
    },

    place: function (form) {
      var t = Order.totals();
      state.order = {
        no: String(Math.floor(Math.random() * 90) + 10),   // 兩位數取餐號，跟店裡叫號一樣
        at: new Date().toISOString(),
        mode: state.mode, slot: state.slot,
        items: state.items.map(function (it) {
          return { name: SHOP.find(it.id).name, opts: describe(it), note: it.note, qty: it.qty, price: unitPrice(it) };
        }),
        totals: t, form: form
      };
      state.items = [];
      emit();
      return state.order;
    },
    last: function () { return state.order; },
    reset: function () { state.items = []; state.order = null; state.slot = null; emit(); }
  };

  window.Order = Order;
  window.money = function (n) { return 'NT$' + Number(n).toLocaleString('en-US'); };
})();
