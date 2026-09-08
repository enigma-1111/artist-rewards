(function () {
  if (typeof ARTISTS === "undefined") return;
  var SHOW = 30;
  var LOCAL = window.ART_LOCAL || {};
  function ab(id) { return "https://artblocks-mainnet.s3.amazonaws.com/" + id + ".png"; }
  function punk(n) { return "https://www.larvalabs.com/public/images/cryptopunks/punk" + n + ".png"; }

  var FACE = {
    nft_art: ab(2000000),
    beeple: ab(2000001),
    muratpak: ab(2000002),
    XCOPYART: ab(5000000),
    fewocious: ab(5000001),
    refikanadol: ab(5000002),
    tylerxhobbs: ab(36000000),
    Snowfro: ab(0),
    ClaireSilver12: ab(6000000),
    sofiacrespo: ab(16000000),
    grantyun: ab(16000001),
    hackatao: ab(14000000),
    mad_dog_jones: ab(14000001),
    deekaymotion: ab(21000000),
    jackbutcher: ab(24000000),
    punk6529: punk(6529),
    frankdegods: ab(25000000),
    LucaNetz: ab(30000000),
    TakashiMurakami: ab(38000000),
    zancan: ab(38000001),
    williammapan: ab(20000000),
    emilyxie_: ab(21000001),
    monicarizzolli: ab(24000001),
    dmitricherniak: ab(13000000),
    larvalabs: punk(7804),
    cryptopunksnfts: punk(5822),
    dhof: ab(25000001),
    justinaversano: ab(30000001),
    coldie: ab(33000000),
    loish: ab(36000001),
    artblocks_io: "https://avatars.githubusercontent.com/u/78487324?s=128",
    mattdesl: ab(38000002),
    yugalabs: ab(40000000),
    ixshells: ab(41000000),
    piterpasma: ab(2000003),
    manoloide: ab(5000003),
    kjetilgolid: ab(16000002),
    jeffdavis: ab(14000002),
    gremplin: punk(4156),
    pplpleasr1: ab(21000002)
  };
  window.ART_FACE = FACE;

  var STILLS = [
    { name: "Chromie Squiggle", handle: "Snowfro", img: ab(0) },
    { name: "Construction 0", handle: "artblocks_io", img: ab(2000000) },
    { name: "Construction 1", handle: "artblocks_io", img: ab(2000001) },
    { name: "Construction 2", handle: "artblocks_io", img: ab(2000002) },
    { name: "Construction 3", handle: "artblocks_io", img: ab(2000003) },
    { name: "Ringers", handle: "dmitricherniak", img: ab(13000000) },
    { name: "CryptoPunks", handle: "larvalabs", img: punk(7804) },
    { name: "Punk 5822", handle: "cryptopunksnfts", img: punk(5822) },
    { name: "Art Blocks", handle: "artblocks_io", img: "https://avatars.githubusercontent.com/u/78487324?s=128" },
    { name: "Edifice", handle: "artblocks_io", img: ab(14000000) },
    { name: "Edifice 1", handle: "artblocks_io", img: ab(14000001) },
    { name: "Algobots", handle: "artblocks_io", img: ab(16000000) },
    { name: "Algobots 1", handle: "artblocks_io", img: ab(16000001) },
    { name: "Aerial View", handle: "artblocks_io", img: ab(20000000) },
    { name: "Gazettes", handle: "artblocks_io", img: ab(21000000) },
    { name: "Gazettes 1", handle: "emilyxie_", img: ab(21000001) },
    { name: "Pigments", handle: "artblocks_io", img: ab(24000000) },
    { name: "Pigments 1", handle: "artblocks_io", img: ab(24000001) },
    { name: "Memories of Pulse", handle: "artblocks_io", img: ab(25000000) },
    { name: "Automatism", handle: "artblocks_io", img: ab(30000000) },
    { name: "Screens", handle: "artblocks_io", img: ab(33000000) },
    { name: "Rhythm", handle: "tylerxhobbs", img: ab(36000000) },
    { name: "Rhythm 1", handle: "loish", img: ab(36000001) },
    { name: "Color Study", handle: "jeffdavis", img: ab(38000000) },
    { name: "Color Study 1", handle: "mattdesl", img: ab(38000001) },
    { name: "Luce", handle: "artblocks_io", img: ab(41000000) },
    { name: "Dynamic Slices", handle: "artblocks_io", img: ab(5000000) },
    { name: "Dynamic Slices 1", handle: "artblocks_io", img: ab(5000001) },
    { name: "Punk 4156", handle: "gremplin", img: punk(4156) },
    { name: "Construction 4", handle: "artblocks_io", img: ab(2000004) }
  ];

  function portrait(handle) {
    if (LOCAL[handle]) return LOCAL[handle];
    if (FACE[handle]) return FACE[handle];
    var keys = Object.keys(LOCAL);
    var i;
    for (i = 0; i < keys.length; i++) {
      if (keys[i].toLowerCase() === String(handle).toLowerCase()) return LOCAL[keys[i]];
    }
    var fk = Object.keys(FACE);
    for (i = 0; i < fk.length; i++) {
      if (fk[i].toLowerCase() === String(handle).toLowerCase()) return FACE[fk[i]];
    }
    return "";
  }

  function uniqueImaged() {
    var seen = {};
    var out = [];
    function add(row) {
      var handle = String(row[1] || "");
      var k = handle.toLowerCase();
      if (!k || seen[k]) return;
      if (!portrait(handle)) return;
      seen[k] = 1;
      out.push([row[0], handle]);
    }
    Object.keys(LOCAL).forEach(function (h) {
      var found = null;
      ARTISTS.forEach(function (row) {
        if (String(row[1]).toLowerCase() === h.toLowerCase()) found = row;
      });
      add(found || [h, h]);
    });
    ARTISTS.forEach(add);
    Object.keys(FACE).forEach(function (h) {
      var found = null;
      ARTISTS.forEach(function (row) {
        if (String(row[1]).toLowerCase() === h.toLowerCase()) found = row;
      });
      add(found || [h, h]);
    });
    return out;
  }

  function shuffle(arr) {
    var a = arr.slice();
    var i, j, t;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  var pool = [];
  var used = {};
  var book = [];

  function dropTile(el) {
    var btn = el.closest ? el.closest(".face") : el.parentNode;
    if (!btn || !btn.parentNode) return;
    if (btn.parentNode.id !== "faces") return;
    btn.parentNode.removeChild(btn);
    fillOne();
    meta();
  }

  window.avErr = function (el) { dropTile(el); };
  window.avOk = function (el) {
    if (!el || !el.naturalWidth || el.naturalWidth < 16) dropTile(el);
    else el.setAttribute("data-ok", "1");
  };

  function tile(handle, name) {
    var src = portrait(handle);
    if (!src) return "";
    return '<img data-h="' + handle + '" src="' + src + '" alt="' + name + '" onerror="window.avErr(this)" onload="window.avOk(this)">';
  }

  function setRecv(handle, name) {
    var rf = document.getElementById("recvFace");
    var html = tile(handle, name);
    if (rf) rf.innerHTML = html || '<div class="ph">AR</div>';
    var rn = document.getElementById("recvName");
    if (rn) rn.textContent = "@" + handle;
    var rm = document.getElementById("recvMeta");
    if (rm) rm.textContent = name + " · confirm, then copy the Bankr prompt";
  }

  function bind(el) {
    el.addEventListener("click", function () {
      var box = document.getElementById("faces");
      if (box) box.querySelectorAll(".face").forEach(function (x) { x.classList.remove("on"); });
      document.querySelectorAll("#collections .face").forEach(function (x) { x.classList.remove("on"); });
      el.classList.add("on");
      setRecv(el.dataset.handle, el.title);
      if (typeof openConfirm === "function") openConfirm({ name: el.title, handle: el.dataset.handle, address: "" });
    });
  }

  function makeBtn(row) {
    if (!portrait(row[1])) return null;
    var el = document.createElement("button");
    el.className = "face";
    el.type = "button";
    el.dataset.handle = row[1];
    el.title = row[0];
    el.innerHTML = tile(row[1], row[0]);
    bind(el);
    return el;
  }

  function fillOne() {
    var box = document.getElementById("faces");
    if (!box) return;
    if (box.querySelectorAll(".face").length >= SHOW) return;
    while (pool.length) {
      var row = pool.pop();
      var k = row[1].toLowerCase();
      if (used[k]) continue;
      used[k] = 1;
      var el = makeBtn(row);
      if (!el) continue;
      box.appendChild(el);
      return;
    }
  }

  function meta() {
    var el = document.getElementById("faceMeta");
    var box = document.getElementById("faces");
    if (!el || !box) return;
    el.textContent = box.querySelectorAll(".face").length + " on screen · " + book.length + " with stills · shuffle";
  }

  window.paintFaces = function () {
    var box = document.getElementById("faces");
    if (!box) return;
    used = {};
    book = uniqueImaged();
    pool = shuffle(book);
    box.innerHTML = "";
    var guard = 0;
    while (box.querySelectorAll(".face").length < SHOW && pool.length && guard < 80) {
      fillOne();
      guard++;
    }
    meta();
  };

  function paintCollections() {
    var box = document.getElementById("collections");
    if (!box) return;
    box.className = "faces";
    var list = STILLS.filter(function (c) { return c.img; }).slice(0, 30);
    box.innerHTML = "";
    list.forEach(function (c) {
      var el = document.createElement("button");
      el.className = "face";
      el.type = "button";
      el.dataset.handle = c.handle;
      el.title = c.name;
      el.innerHTML = '<img src="' + c.img + '" alt="' + c.name + '" onerror="this.parentNode.style.display=\'none\'">';
      bind(el);
      box.appendChild(el);
    });
  }

  var shuffleBtn = document.getElementById("shuffleFaces");
  if (shuffleBtn) shuffleBtn.addEventListener("click", function () { window.paintFaces(); });
  window.paintFaces();
  paintCollections();
})();
