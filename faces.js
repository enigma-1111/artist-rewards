(function () {
  if (typeof ARTISTS === "undefined") return;
  var SHOW = 30;
  var LOCAL = window.ART_LOCAL || {};
  var FACE = {
    cryptopunksnfts: "https://www.larvalabs.com/public/images/cryptopunks/punk5822.png",
    larvalabs: "https://www.larvalabs.com/public/images/cryptopunks/punk7804.png",
    artblocks_io: "https://avatars.githubusercontent.com/u/78487324?s=128",
    Snowfro: "https://artblocks-mainnet.s3.amazonaws.com/0.png",
    dmitricherniak: "https://artblocks-mainnet.s3.amazonaws.com/13000000.png",
    mattdesl: "https://artblocks-mainnet.s3.amazonaws.com/15900000.png",
    tylerxhobbs: "https://artblocks-mainnet.s3.amazonaws.com/78000000.png"
  };
  window.ART_FACE = FACE;

  var STILLS = [
    { name: "CryptoPunks", chain: "Ethereum", handle: "larvalabs", img: "https://www.larvalabs.com/public/images/cryptopunks/punk7804.png" },
    { name: "Chromie Squiggle", chain: "Art Blocks", handle: "Snowfro", img: "https://artblocks-mainnet.s3.amazonaws.com/0.png" },
    { name: "Fidenza", chain: "Art Blocks", handle: "tylerxhobbs", img: "https://artblocks-mainnet.s3.amazonaws.com/78000027.png" },
    { name: "Ringers", chain: "Art Blocks", handle: "dmitricherniak", img: "https://artblocks-mainnet.s3.amazonaws.com/13000000.png" },
    { name: "Subscapes", chain: "Art Blocks", handle: "mattdesl", img: "https://artblocks-mainnet.s3.amazonaws.com/15900000.png" },
    { name: "Art Blocks", chain: "Ethereum", handle: "artblocks_io", img: "https://avatars.githubusercontent.com/u/78487324?s=256" },
    { name: "XCOPY", chain: "Ethereum", handle: "XCOPYART", img: LOCAL.XCOPYART || "" },
    { name: "Checks VV", chain: "Ethereum", handle: "jackbutcher", img: LOCAL.jackbutcher || "" },
    { name: "Yuga", chain: "Ethereum", handle: "yugalabs", img: LOCAL.yugalabs || "" },
    { name: "Beeple", chain: "Ethereum", handle: "beeple", img: LOCAL.beeple || "" },
    { name: "Pak", chain: "Ethereum", handle: "muratpak", img: LOCAL.muratpak || "" },
    { name: "FEWOCiOUS", chain: "Ethereum", handle: "fewocious", img: LOCAL.fewocious || "" }
  ];

  function portrait(handle) {
    if (LOCAL[handle]) return LOCAL[handle];
    if (FACE[handle]) return FACE[handle];
    var keys = Object.keys(LOCAL);
    var i;
    for (i = 0; i < keys.length; i++) {
      if (keys[i].toLowerCase() === String(handle).toLowerCase()) return LOCAL[keys[i]];
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
      if (typeof ARTISTS !== "undefined") {
        ARTISTS.forEach(function (row) {
          if (String(row[1]).toLowerCase() === h.toLowerCase()) found = row;
        });
      }
      add(found || [h, h]);
    });
    if (typeof ARTISTS !== "undefined") ARTISTS.forEach(add);
    Object.keys(FACE).forEach(function (h) { add([h, h]); });
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
    if (btn && btn.parentNode && btn.parentNode.id === "faces") {
      btn.parentNode.removeChild(btn);
      fillOne();
      meta();
    }
  }

  window.avErr = function (el) {
    dropTile(el);
  };
  window.avOk = function (el) {
    if (!el || !el.naturalWidth || el.naturalWidth < 24) {
      dropTile(el);
      return;
    }
    el.setAttribute("data-ok", "1");
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
      el.classList.add("on");
      setRecv(el.dataset.handle, el.title);
      if (typeof openConfirm === "function") openConfirm({ name: el.title, handle: el.dataset.handle, address: "" });
    });
  }

  function makeBtn(row) {
    var src = portrait(row[1]);
    if (!src) return null;
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
    el.textContent = box.querySelectorAll(".face").length + " on screen · " + book.length + " with photos · shuffle";
  }

  window.paintFaces = function () {
    var box = document.getElementById("faces");
    if (!box) return;
    used = {};
    book = uniqueImaged();
    pool = shuffle(book);
    box.innerHTML = "";
    var guard = 0;
    while (box.querySelectorAll(".face").length < SHOW && pool.length && guard < 90) {
      fillOne();
      guard++;
    }
    meta();
  };

  function paintCollections() {
    var box = document.getElementById("collections");
    if (!box) return;
    var fb = "https://www.larvalabs.com/public/images/cryptopunks/punk5822.png";
    var list = STILLS.filter(function (c) { return c.img; });
    box.innerHTML = list.map(function (c) {
      return (
        '<button class="tile" type="button" data-handle="' + c.handle + '" data-name="' + c.name + '">' +
          '<img src="' + c.img + '" alt="' + c.name + '" data-fb="' + fb + '" onerror="this.onerror=null;this.src=this.getAttribute(\'data-fb\')">' +
          '<div class="meta"><strong>' + c.name + "</strong><small>" + (c.chain || "culture map") + "</small></div>" +
        "</button>"
      );
    }).join("");
    box.querySelectorAll(".tile").forEach(function (el) {
      el.addEventListener("click", function () {
        if (typeof openConfirm === "function") {
          openConfirm({ name: el.dataset.name, handle: el.dataset.handle, address: "" });
        }
      });
    });
  }

  var shuffleBtn = document.getElementById("shuffleFaces");
  if (shuffleBtn) shuffleBtn.addEventListener("click", function () { window.paintFaces(); });
  window.paintFaces();
  paintCollections();
})();
