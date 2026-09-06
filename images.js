(function () {
  var COL = {
    CryptoPunks: "https://www.larvalabs.com/public/images/cryptopunks/punk5822.png",
    Fidenza: "https://artblocks-mainnet.s3.amazonaws.com/78000027.png",
    "Chromie Squiggle": "https://artblocks-mainnet.s3.amazonaws.com/0.png",
    "Art Blocks": "https://avatars.githubusercontent.com/u/78487324?s=256"
  };
  function unavatar(h) {
    return "https://unavatar.io/twitter/" + encodeURIComponent(h) + "?fallback=false";
  }
  function showPh(img) {
    img.style.display = "none";
    var ph = img.nextElementSibling;
    if (ph) ph.style.display = "grid";
  }
  window.avatar = unavatar;
  document.querySelectorAll("img[data-h]").forEach(function (img) {
    var h = img.dataset.h;
    img.onerror = function () { showPh(img); };
    if (h) img.src = unavatar(h);
  });
  document.querySelectorAll(".tile").forEach(function (el) {
    var img = el.querySelector("img");
    if (!img) return;
    var name = el.dataset.name || (el.querySelector("strong") && el.querySelector("strong").textContent) || img.alt;
    if (COL[name]) {
      img.onerror = function () { showPh(img); };
      img.src = COL[name];
    } else {
      showPh(img);
    }
  });
})();
(function () {
  var KEY = "art.profile.v1";
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } }
  function save(p) { localStorage.setItem(KEY, JSON.stringify(p)); draw(); }
  function draw() {
    var p = load();
    var w = document.getElementById("profWallet");
    var x = document.getElementById("profX");
    var os = document.getElementById("profOs");
    var rec = document.getElementById("profReceived");
    var face = document.getElementById("profFace");
    if (w && document.activeElement !== w) w.value = p.wallet || "";
    if (x && document.activeElement !== x) x.value = p.x ? "@" + String(p.x).replace(/^@/, "") : "";
    if (os && document.activeElement !== os) os.value = p.os || "";
    if (rec) rec.textContent = "\u2014 until $ART is live";
    if (face && p.x) {
      var h = String(p.x).replace(/^@/, "");
      face.innerHTML = '<img data-h="' + h + '" src="https://unavatar.io/twitter/' + encodeURIComponent(h) + '?fallback=false" alt=""><div class="ph" style="display:none">AR</div>';
    }
  }
  function grab() {
    var p = load();
    var w = document.getElementById("profWallet");
    var x = document.getElementById("profX");
    var os = document.getElementById("profOs");
    if (w) p.wallet = w.value.trim();
    if (x) p.x = x.value.trim().replace(/^@/, "");
    if (os) p.os = os.value.trim();
    save(p);
  }
  ["profWallet", "profX", "profOs"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("change", grab);
  });
  var btn = document.getElementById("profSave");
  if (btn) btn.addEventListener("click", grab);
  var use = document.getElementById("profUseWallet");
  if (use) use.addEventListener("click", function () {
    var c = document.getElementById("connect");
    if (c) c.click();
  });
  draw();
})();
