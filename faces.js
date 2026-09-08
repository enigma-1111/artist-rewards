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
  var EXTRA = [
    ["Sartoshi","sartoshi_nft"],["Milady","MiladyMaker"],["Remilia","remiliaofficial"],
    ["mfers","mfers"],["Goblintown","goblintownnft"],["Nouns","nounsdao"],
    ["Doodles","doodles"],["Moonbirds","moonbirds"],["PROOF","PROOF_XYZ"],
    ["Matt Kane","mattkane"],["Rafael Rozendaal","newrafael"],["Mario Klingemann","quasimondo"],
    ["Robbie Barrat","robbiebarrat"],["Anna Ridler","annaridler"],["Memo Akten","memotv"],
    ["Sougwen Chung","sougwen"],["Zach Lieberman","zachlieberman"],["Lauren Lee McCarthy","laurmccarthy"],
    ["Kim Asendorf","kimasendorf"],["Leander Herzog","leanderherzog"],["Harm van den Dorpel","harmvandendorpel"],
    ["Jonas Lund","jonaslund"],["Kevin Abosch","kevinabosch"],["Alotta Money","AlottaMoney"],
    ["Giant Swan","giantswan"],["Vinnie Hager","vinniehager"],["Victor Mosquera","victormosquera"],
    ["Chad Knight","chadknight"],["Vincent Schwenk","vincentschwenk"],["Maya Man","mayaontheinternet"],
    ["Everest Pipkin","everestpipkin"],["Ian Cheng","iancheng"],["Auriea Harvey","auriea"],
    ["teamLab","teamLab_net"],["Quayola","quayola"],["David OReilly","davidoreilly"],
    ["Caleb Wood","calebwood"],["Ivona Tau","ivonatau"],["Felipe Pantone","felipepantone"],
    ["Zach Gage","zachgage"],["Bennett Foddy","bennettfoddy"],["Lu Yang","luyangart"],
    ["fxhash","fx_hash"],["Feral File","feralfile"],["Manifold","manifoldxyz"],
    ["SuperRare","SuperRare"],["Foundation","foundation"],["Zora","ourZORA"],
    ["DeGods","DeGodsNFT"],["Mad Lads","MadLadsNFT"],["NodeMonkes","NodeMonkes"],
    ["ThankYouX","thankyoux"],["Punk4156","punk4156"],["ArtOnBlockchain","ArtOnBlockchain"],
    ["Shvembldr","shvembldr"],["Beervangeer","beervangeer"],["Alexis Andre","alexis_andre"],
    ["Stefano Contiero","stefanocontiero"],["Aaron Penne","aaronpenne"],["Jeff G Davis","jeffgdavis"],
    ["Anna Lucia","annalucia"],["Licia He","licahe"]
  ];
  function unavatar(h) { return "https://unavatar.io/twitter/" + encodeURIComponent(h) + "?fallback=false"; }
  function sources(handle) {
    var list = [];
    if (FACE[handle]) list.push(FACE[handle]);
    list.push("/img/faces/" + handle + ".jpg");
    list.push(unavatar(handle));
    return list;
  }
  function uniqueArtists() {
    var seen = {}, out = [];
    ARTISTS.concat(EXTRA).forEach(function (row) {
      var k = String(row[1] || "").toLowerCase();
      if (!k || seen[k]) return;
      seen[k] = 1; out.push(row);
    });
    return out;
  }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function isBlankAvatar(img) {
    if (!img || !img.naturalWidth || img.naturalWidth < 32) return true;
    try {
      var c = document.createElement("canvas"); c.width = 8; c.height = 8;
      var ctx = c.getContext("2d"); ctx.drawImage(img, 0, 0, 8, 8);
      var d = ctx.getImageData(0, 0, 8, 8).data, colors = {}, i;
      for (i = 0; i < d.length; i += 4) {
        if (d[i + 3] < 20) continue;
        colors[(d[i] >> 5) + "," + (d[i + 1] >> 5) + "," + (d[i + 2] >> 5)] = 1;
      }
      return Object.keys(colors).length <= 2;
    } catch (e) { return false; }
  }
  var pool = [], used = {}, book = [];
  function dropTile(el) {
    var btn = el.closest ? el.closest(".face") : el.parentNode;
    if (btn && btn.parentNode && btn.parentNode.id === "faces") {
      btn.parentNode.removeChild(btn); fillOne(); meta();
    }
  }
  window.avErr = function (el) {
    var h = el.getAttribute("data-h") || "";
    var n = +(el.getAttribute("data-n") || 0);
    var list = sources(h);
    if (n + 1 < list.length) { el.setAttribute("data-n", String(n + 1)); el.src = list[n + 1]; return; }
    dropTile(el);
  };
  window.avOk = function (el) { if (isBlankAvatar(el)) window.avErr(el); };
  function tile(handle, name) {
    var list = sources(handle);
    return '<img data-h="' + handle + '" data-n="0" src="' + list[0] + '" alt="' + name + '" onerror="window.avErr(this)" onload="window.avOk(this)">';
  }
  function setRecv(handle, name) {
    var rf = document.getElementById("recvFace");
    if (rf) rf.innerHTML = tile(handle, name);
    var rn = document.getElementById("recvName"); if (rn) rn.textContent = "@" + handle;
    var rm = document.getElementById("recvMeta"); if (rm) rm.textContent = name + " · confirm, then copy the Bankr prompt";
  }
  function bind(el) {
    el.addEventListener("click", function () {
      var box = document.getElementById("faces");
      if (box) box.querySelectorAll(".face").forEach(function (x) { x.classList.remove("on"); });
      el.classList.add("on"); setRecv(el.dataset.handle, el.title);
      if (typeof openConfirm === "function") openConfirm({ name: el.title, handle: el.dataset.handle, address: "" });
    });
  }
  function makeBtn(row) {
    var el = document.createElement("button");
    el.className = "face"; el.type = "button"; el.dataset.handle = row[1]; el.title = row[0];
    el.innerHTML = tile(row[1], row[0]); bind(el); return el;
  }
  function fillOne() {
    var box = document.getElementById("faces"); if (!box) return;
    if (box.querySelectorAll(".face").length >= SHOW) return;
    while (pool.length) {
      var row = pool.pop(); var k = row[1].toLowerCase();
      if (used[k]) continue; used[k] = 1; box.appendChild(makeBtn(row)); return;
    }
  }
  function meta() {
    var el = document.getElementById("faceMeta"); var box = document.getElementById("faces");
    if (el && box) el.textContent = box.querySelectorAll(".face").length + " on screen · " + book.length + " in the book · shuffle";
  }
  window.paintFaces = function () {
    var box = document.getElementById("faces"); if (!box) return;
    used = {}; book = uniqueArtists(); pool = shuffle(book); box.innerHTML = "";
    var g = 0;
    while (box.querySelectorAll(".face").length < SHOW && pool.length && g < 90) { fillOne(); g++; }
    meta();
  };
  function paintCollections() {
    var box = document.getElementById("collections"); if (!box) return;
    var list = (typeof COLLECTIONS !== "undefined" ? COLLECTIONS : []).filter(function (c) { return c.img; });
    box.innerHTML = list.map(function (c) {
      return '<button class="tile" type="button" data-handle="' + c.handle + '" data-name="' + c.name + '">' +
        '<img src="' + c.img + '" alt="' + c.name + '" onerror="this.parentNode.remove()">' +
        '<div class="meta"><strong>' + c.name + '</strong><small>' + (c.chain || '') + '</small></div></button>';
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
