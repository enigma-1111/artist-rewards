(function () {
  var KEY = "art.profile.v1";
  function $(id) { return document.getElementById(id); }
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } }
  function save(p) { localStorage.setItem(KEY, JSON.stringify(p)); draw(); }
  function initials(name) {
    return String(name || "AR").replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase() || "AR";
  }
  function draw() {
    var p = load();
    var w = $("profWallet"), x = $("profX"), os = $("profOs"), rec = $("profReceived"), face = $("profFace");
    if (w && document.activeElement !== w) w.value = p.wallet || "";
    if (x && document.activeElement !== x) x.value = p.x ? "@" + String(p.x).replace(/^@/, "") : "";
    if (os && document.activeElement !== os) os.value = p.os || "";
    if (rec) rec.textContent = "\u2014 until $ART is live";
    if (face) face.innerHTML = '<div class="ph">' + initials(p.x || p.wallet || "AR") + "</div>";
  }
  function grab() {
    var p = load();
    p.wallet = ($("profWallet").value || "").trim();
    p.x = ($("profX").value || "").trim().replace(/^@/, "");
    p.os = ($("profOs").value || "").trim();
    save(p);
    var s = $("status");
    if (s) { s.className = "hint ok"; s.textContent = "Profile saved."; }
  }
  ["profWallet", "profX", "profOs"].forEach(function (id) {
    var el = $(id); if (el) el.addEventListener("change", grab);
  });
  if ($("profSave")) $("profSave").addEventListener("click", grab);
  var use = $("profUseWallet");
  var connect = $("connect");
  async function connectWallet() {
    var eth = window.ethereum;
    if (!eth) {
      var s = $("status");
      if (s) { s.className = "hint warn"; s.textContent = "No wallet in this browser."; }
      return;
    }
    try {
      var accs = await eth.request({ method: "eth_requestAccounts" });
      var account = (accs && accs[0]) || "";
      if (connect && account) connect.textContent = account.slice(0, 6) + "\u2026" + account.slice(-4);
      var p = load();
      p.wallet = account || p.wallet;
      save(p);
      if ($("profWallet")) $("profWallet").value = p.wallet;
    } catch (err) {}
  }
  if (use) use.addEventListener("click", connectWallet);
  if (connect) connect.addEventListener("click", connectWallet);
  draw();
})();
