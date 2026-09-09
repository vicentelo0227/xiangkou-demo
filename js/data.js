// 菜單。type: one = 必選一項，many = 可複選；d = 加價
window.SHOP = {
  name: '巷口麵舖',
  addr: '台北市大安區和平東路二段 32 巷 5 號',
  tel: '02-2733-0000',
  // 週一公休，其餘 11:00–14:00 與 17:00–20:30
  hours: { closedDays: [1], slots: [['11:00', '14:00'], ['17:00', '20:30']] },
  prepMinutes: 20,          // 最快幾分鐘後可取餐
  delivery: { fee: 60, min: 300, freeOver: 500, minutes: 20 },   // minutes = 路程，外送時段顯示的是送達時間

  cats: [
    { id: 'noodle', name: '麵食' },
    { id: 'rice', name: '飯類' },
    { id: 'side', name: '小菜' },
    { id: 'drink', name: '飲料' }
  ],

  items: [
    {
      id: 'beef', cat: 'noodle', name: '紅燒牛肉麵', price: 180, img: 'beef.jpg',
      desc: '牛腩燉三小時，湯頭當天熬當天賣，不加味精。', tag: '招牌',
      groups: [
        { id: 'noodle', name: '麵體', type: 'one', options: [{ v: '細麵', d: 0 }, { v: '寬麵', d: 0 }, { v: '米粉', d: 10 }] },
        { id: 'spice', name: '辣度', type: 'one', options: [{ v: '不辣', d: 0 }, { v: '小辣', d: 0 }, { v: '大辣', d: 0 }] },
        { id: 'add', name: '加點', type: 'many', options: [{ v: '加滷蛋', d: 15 }, { v: '加麵', d: 20 }, { v: '加酸菜', d: 10 }, { v: '加牛肉', d: 60 }] }
      ]
    },
    {
      id: 'sesame', cat: 'noodle', name: '麻醬麵', price: 70, img: 'sesame.jpg',
      desc: '芝麻醬自己磨，濃到要拌久一點。',
      groups: [
        { id: 'noodle', name: '麵體', type: 'one', options: [{ v: '細麵', d: 0 }, { v: '寬麵', d: 0 }] },
        { id: 'spice', name: '辣度', type: 'one', options: [{ v: '不辣', d: 0 }, { v: '小辣', d: 0 }, { v: '大辣', d: 0 }] },
        { id: 'add', name: '加點', type: 'many', options: [{ v: '加滷蛋', d: 15 }, { v: '加麵', d: 20 }, { v: '加花生粉', d: 5 }] }
      ]
    },
    {
      id: 'zhajiang', cat: 'noodle', name: '炸醬乾麵', price: 75, img: 'zhajiang.jpg',
      desc: '肉燥炒得偏乾，拌開才會香。',
      groups: [
        { id: 'noodle', name: '麵體', type: 'one', options: [{ v: '細麵', d: 0 }, { v: '寬麵', d: 0 }] },
        { id: 'spice', name: '辣度', type: 'one', options: [{ v: '不辣', d: 0 }, { v: '小辣', d: 0 }, { v: '大辣', d: 0 }] },
        { id: 'add', name: '加點', type: 'many', options: [{ v: '加滷蛋', d: 15 }, { v: '加麵', d: 20 }, { v: '加小黃瓜', d: 10 }] }
      ]
    },
    {
      id: 'wonton', cat: 'noodle', name: '餛飩湯麵', price: 90, img: 'wonton.jpg',
      desc: '手工包的，一碗六顆。',
      groups: [
        { id: 'noodle', name: '麵體', type: 'one', options: [{ v: '細麵', d: 0 }, { v: '寬麵', d: 0 }, { v: '不要麵（只要餛飩湯）', d: -15 }] },
        { id: 'add', name: '加點', type: 'many', options: [{ v: '加餛飩三顆', d: 35 }, { v: '加滷蛋', d: 15 }] }
      ]
    },
    {
      id: 'porkrice', cat: 'rice', name: '滷肉飯', price: 45, img: 'porkrice.jpg',
      desc: '三層肉手切，滷汁每天回鍋。', tag: '招牌',
      groups: [
        { id: 'size', name: '份量', type: 'one', options: [{ v: '小碗', d: 0 }, { v: '大碗', d: 20 }] },
        { id: 'add', name: '加點', type: 'many', options: [{ v: '加滷蛋', d: 15 }, { v: '加豆干', d: 20 }, { v: '多一點滷汁', d: 0 }] }
      ]
    },
    {
      id: 'chickenrice', cat: 'rice', name: '雞肉飯', price: 55, img: 'chickenrice.jpg',
      desc: '雞胸手撕，淋雞油和醬油膏。',
      groups: [
        { id: 'size', name: '份量', type: 'one', options: [{ v: '小碗', d: 0 }, { v: '大碗', d: 20 }] },
        { id: 'add', name: '加點', type: 'many', options: [{ v: '加滷蛋', d: 15 }, { v: '加雞肉', d: 30 }] }
      ]
    },
    {
      id: 'dumpling', cat: 'side', name: '手工水餃（十顆）', price: 80, img: 'dumpling.jpg',
      desc: '高麗豬肉，皮是早上現桿的。',
      groups: [
        { id: 'sauce', name: '沾醬', type: 'many', options: [{ v: '醬油', d: 0 }, { v: '辣椒', d: 0 }, { v: '蒜泥', d: 5 }, { v: '烏醋', d: 0 }] }
      ]
    },
    {
      id: 'greens', cat: 'side', name: '燙青菜', price: 45, img: 'greens.jpg',
      desc: '看當天菜市場有什麼，通常是空心菜或地瓜葉。',
      groups: [
        { id: 'sauce', name: '醬料', type: 'one', options: [{ v: '醬油膏', d: 0 }, { v: '蒜蓉', d: 0 }, { v: '肉燥', d: 10 }, { v: '不加', d: 0 }] }
      ]
    },
    {
      id: 'braised', cat: 'side', name: '滷味拼盤', price: 90, img: 'braised.jpg',
      desc: '海帶、豆干、滷蛋、米血各兩份。',
      groups: [
        { id: 'spice', name: '要不要辣', type: 'one', options: [{ v: '不加辣', d: 0 }, { v: '加辣椒', d: 0 }] },
        { id: 'add', name: '加點', type: 'many', options: [{ v: '加滷蛋', d: 15 }, { v: '加豆干', d: 20 }, { v: '加米血', d: 20 }] }
      ]
    },
    {
      id: 'tea', cat: 'drink', name: '古早味紅茶', price: 30, img: 'tea.jpg',
      desc: '每天早上煮一桶，賣完就沒有。',
      groups: [
        { id: 'size', name: '大小', type: 'one', options: [{ v: '中杯', d: 0 }, { v: '大杯', d: 10 }] },
        { id: 'ice', name: '冰塊', type: 'one', options: [{ v: '正常冰', d: 0 }, { v: '少冰', d: 0 }, { v: '去冰', d: 0 }, { v: '熱的', d: 0 }] },
        { id: 'sugar', name: '甜度', type: 'one', options: [{ v: '全糖', d: 0 }, { v: '半糖', d: 0 }, { v: '微糖', d: 0 }, { v: '無糖', d: 0 }] }
      ]
    },
    {
      id: 'soymilk', cat: 'drink', name: '現磨豆漿', price: 35, img: 'soymilk.jpg',
      desc: '非基改黃豆，當天磨。',
      groups: [
        { id: 'size', name: '大小', type: 'one', options: [{ v: '中杯', d: 0 }, { v: '大杯', d: 10 }] },
        { id: 'ice', name: '溫度', type: 'one', options: [{ v: '冰的', d: 0 }, { v: '常溫', d: 0 }, { v: '熱的', d: 0 }] },
        { id: 'sugar', name: '甜度', type: 'one', options: [{ v: '有糖', d: 0 }, { v: '無糖', d: 0 }] }
      ]
    }
  ]
};

window.SHOP.find = function (id) {
  return window.SHOP.items.filter(function (i) { return i.id === id; })[0] || null;
};
window.SHOP.cat = function (id) {
  return window.SHOP.cats.filter(function (c) { return c.id === id; })[0] || null;
};
// 每個必選群組都要選到才能加入訂單
window.SHOP.required = function (item) {
  return item.groups.filter(function (g) { return g.type === 'one'; });
};
