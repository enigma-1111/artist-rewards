(function () {
  if (typeof ARTISTS === "undefined") return;
  var SHOW = 30;
  var FACE = {
    cryptopunksnfts: "https://www.larvalabs.com/public/images/cryptopunks/punk5822.png",
    larvalabs: "https://www.larvalabs.com/public/images/cryptopunks/punk7804.png",
    artblocks_io: "https://avatars.githubusercontent.com/u/78487324?s=128",
    Snowfro: "https://artblocks-mainnet.s3.amazonaws.com/0.png",
    tylerxhobbs: "https://pbs.twimg.com/profile_images/1349165550627336192/PzaCVkHu.jpg",
    beeple: "https://pbs.twimg.com/profile_images/264316321/beeple_headshot_beat_up.jpg",
    muratpak: "https://pbs.twimg.com/profile_images/1499888704718000128/5yERu3hS.jpg",
    XCOPYART: "https://pbs.twimg.com/profile_images/2006037095962247168/JxhvwKeJ.jpg",
    fewocious: "https://pbs.twimg.com/profile_images/1343456700431433730/f0PoNaVj.jpg",
    refikanadol: "https://pbs.twimg.com/profile_images/1338317562224889856/p_8fmTKN.jpg",
    punk6529: "https://pbs.twimg.com/profile_images/1784231403325943808/PBDWE07Y.jpg",
    jackbutcher: "https://pbs.twimg.com/profile_images/2094875295740243968/XWoHVEOq.png",
    yugalabs: "https://pbs.twimg.com/profile_images/1399966612405592065/irAtrWtO.jpg",
    sofiacrespo: "https://pbs.twimg.com/profile_images/1594754408767700993/OmW_Ospn.jpg",
    hackatao: "https://pbs.twimg.com/profile_images/1546409729500512258/9_qZIVNH.jpg",
    ClaireSilver12: "https://pbs.twimg.com/profile_images/1608981076566843394/b6kK3iA8.png",
    grantyun: "https://pbs.twimg.com/profile_images/2022329863584329728/NJgt6JkX.jpg",
    BoredApeYC: "https://pbs.twimg.com/profile_images/1399966612405592065/irAtrWtO.jpg",
    pudgypenguins: "https://pbs.twimg.com/profile_images/1848765927451492364/VysuN6mu.jpg",
    AzukiOfficial: "https://pbs.twimg.com/profile_images/1948071599187591168/y-2jJoZB.jpg",
    dmitricherniak: "https://artblocks-mainnet.s3.amazonaws.com/13000000.png",
    mattdesl: "https://artblocks-mainnet.s3.amazonaws.com/15900000.png"
  };
  window.ART_FACE = FACE;
  function uniqueArtists() {
    var seen = {};
    return ARTISTS.filter(function (row) {
      var k = row[1].toLowerCase();
      if (seen[k]) return false;
      seen[k] = 1;
      return true;
    });
  }
  function withPhoto(row) { return !!FACE[row[1]]; }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function isBlankAvatar(img) {
    if (!img || !img.naturalWidth) return true;
    if (img.naturalWidth < 24 || img.naturalHeight < 24) return true;
    try {
      var c = document.createElement("canvas");
      c.width = 8; c.height = 8;
      var ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0, 8, 8);
      var d = ctx.getImageData(0, 0, 8, 8).data;
      var colors = {};
      for (var i = 0; i < d.length; i += 4) {
        if (d[i + 3] < 20) continue;
        var key = (d[i] >> 4) + "," + (d[i + 1] >> 4) + "," + (d[i + 2] >> 4);
        colors[key] = 1;
      }
      return Object.keys(colors).length <= 2;
    } catch (e) { return false; }
  }
  var pool = [];
  var used = {};
  var SHOW = 30;
  function dropTile(el) {
    var btn = el.closest ? el.closest(".face") : el.parentNode;
    if (btn && btn.parentNode && btn.parentNode.id === "faces") {
      btn.parentNode.removeChild(btn);
      fillOne();
    }
  }
  window.avErr = function (el) { dropTile(el); };
  window.avOk = function (el) { if (isBlankAvatar(el)) dropTile(el); };
  function tile(handle, name) {
    var src = FACE[handle];
    if (!src) return "";
    return '<img data-h="' + handle + '" src="' + src + '" alt="' + name + '" onerror="window.avErr(this)" onload="window.avOk(this)">';
  }
  function setRecv(handle, name) {
    var rf = document.getElementById("recvFace");
    var src = FACE[handle];
    if (rf) {
      rf.innerHTML = src
        ? '<img src="' + src + '" alt="' + name + '" onerror="this.style.display=\'none\'">'
        : '<div class="ph">AR</div>';
    }
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
    var html = tile(row[1], row[0]);
    if (!html) return null;
    var el = document.createElement("button");
    el.className = "face";
    el.type = "button";
    el.dataset.handle = row[1];
    el.title = row[0];
    el.innerHTML = html;
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
      if (used[k] || !FACE[row[1]]) continue;
      used[k] = 1;
      var btn = makeBtn(row);
      if (btn) box.appendChild(btn);
      return;
    }
  }
  window.paintFaces = function () {
    var box = document.getElementById("faces");
    if (!box) return;
    used = {};
    var photos = uniqueArtists().filter(withPhoto);
    pool = shuffle(photos);
    box.innerHTML = "";
    var want = Math.min(SHOW, photos.length);
    while (box.querySelectorAll(".face").length < want && pool.length) fillOne();
    var meta = document.getElementById("faceMeta");
    if (meta) meta.textContent = box.querySelectorAll(".face").length + " with photos · " + uniqueArtists().length + " searchable · shuffle";
  };
  function paintCollections() {
    var box = document.getElementById("collections");
    if (!box || typeof COLLECTIONS === "undefined") return;
    var list = COLLECTIONS.filter(function (c) { return c.img; });
    box.innerHTML = list.map(function (c) {
      return (
        '<button class="tile" type="button" data-handle="' + c.handle + '" data-name="' + c.name + '">' +
          '<img src="' + c.img + '" alt="' + c.name + '" onerror="this.parentNode.style.display=\'none\'">' +
          '<div class="meta"><strong>' + c.name + "</strong><small>" + (c.chain || "culture map") + "</small></div>" +
        "</button>"
      );
    }).join("");
    box.querySelectorAll(".tile").forEach(function (el) {
      el.addEventListener("click", function () {
        if (typeof openConfirm === "function") openConfirm({ name: el.dataset.name, handle: el.dataset.handle, address: "" });
      });
    });
  }
  var shuffleBtn = document.getElementById("shuffleFaces");
  if (shuffleBtn) shuffleBtn.addEventListener("click", function () { window.paintFaces(); });
  window.paintFaces();
  paintCollections();
})();
