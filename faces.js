(function () {
  if (typeof ARTISTS === "undefined") return;
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
    AzukiOfficial: "https://pbs.twimg.com/profile_images/1948071599187591168/y-2jJoZB.jpg"
  };
  [
    "nft_art", "mad_dog_jones", "deekaymotion", "frankdegods", "LucaNetz",
    "TakashiMurakami", "zancan", "williammapan", "emilyxie_", "monicarizzolli",
    "dmitricherniak", "dhof", "justinaversano", "coldie", "RobnessOfficial",
    "ixshells", "slimesunday", "JosieBellini", "thesarahzucker", "fvckrender",
    "androidjones", "blakekathryn", "osinachiart", "REAS", "mattdesl",
    "bottoproject", "hollyherndon", "andresreisinger", "danielarsham", "kaws",
    "gmunk", "MissALSimpson", "artnome", "shantell_martin", "jamesjeanart",
    "loish", "AmberVittoria", "trevorjonesart", "piterpasma", "manoloide",
    "kjetilgolid", "HelenaSarin", "CharlotteFang77", "pplpleasr1", "0xDesigner",
    "CozomoMedici", "kidmograph"
  ].forEach(function (h) {
    FACE[h] = "/img/faces/" + h + ".jpg";
  });
  function unavatar(handle) {
    return "https://unavatar.io/twitter/" + encodeURIComponent(handle) + "?fallback=false";
  }
  function hashHue(str) {
    var h = 0; str = String(str || "");
    for (var i = 0; i < str.length; i++) h = (h * 33 + str.charCodeAt(i)) >>> 0;
    return h;
  }
  function blob(handle) {
    var seed = hashHue(handle);
    var a = PALETTE[seed % PALETTE.length][0];
    var b = PALETTE[(seed + 3) % PALETTE.length][1];
    return '<div class="ph artmark" style="display:none;--a:' + a + ";--b:" + b + '"></div>';
  }
  window.avErr = function (el) {
    var h = el.getAttribute("data-h") || "";
    var n = +(el.getAttribute("data-n") || 0);
    var next = [];
    if (FACE[h] && el.src.indexOf(FACE[h]) < 0) next.push(FACE[h]);
    next.push("https://unavatar.io/x/" + encodeURIComponent(h) + "?fallback=false");
    if (n < next.length) {
      el.setAttribute("data-n", String(n + 1));
      el.src = next[n];
      return;
    }
    el.style.display = "none";
    if (el.nextElementSibling) el.nextElementSibling.style.display = "grid";
  };
  function tile(handle, name) {
    var first = FACE[handle] || unavatar(handle);
    return (
      '<img data-h="' + handle + '" data-n="0" src="' + first + '" alt="' + name + '" onerror="window.avErr(this)">' +
      blob(handle)
    );
  }
  function setRecv(handle, name) {
    var rf = document.getElementById("recvFace");
    if (rf) rf.innerHTML = tile(handle, name);
    var rn = document.getElementById("recvName");
    if (rn) rn.textContent = "@" + handle;
    var rm = document.getElementById("recvMeta");
    if (rm) rm.textContent = name + " · confirm, then copy the Bankr prompt";
  }
  window.paintFaces = function () {
    var box = document.getElementById("faces");
    if (!box) return;
    var seen = {};
    var list = ARTISTS.filter(function (row) {
      var k = row[1].toLowerCase();
      if (seen[k]) return false;
      seen[k] = 1;
      return true;
    }).slice(0, 69);
    box.innerHTML = list.map(function (row) {
      return '<button class="face" type="button" data-handle="' + row[1] + '" title="' + row[0] + '">' + tile(row[1], row[0]) + "</button>";
    }).join("");
    box.querySelectorAll(".face").forEach(function (el) {
      el.addEventListener("click", function () {
        box.querySelectorAll(".face").forEach(function (x) { x.classList.remove("on"); });
        el.classList.add("on");
        setRecv(el.dataset.handle, el.title);
        if (typeof openConfirm === "function") openConfirm({ name: el.title, handle: el.dataset.handle, address: "" });
      });
    });
  };
  window.paintFaces();
})();
