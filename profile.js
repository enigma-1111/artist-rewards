(function () {
  var KEY = "art.profile.v1";
  function $(id) { return document.getElementById(id); }
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } }
  function saveStore(p) { localStorage.setItem(KEY, JSON.stringify(p)); }
  function handleOf(p) { return String((p && p.x) || "").replace(/^@/, ""); }
  function promptLine(h) {
    return "@bankrbot send 500 ART to @" + (h || "handle") + " on robinhood chain";
  }
  function draw() {
    var p = load();
    var h = handleOf(p);
    var w = $("profWallet"), x = $("profX"), os = $("profOs");
    var rec = $("profReceived"), face = $("profFace");
    var name = $("profName"), sub = $("profSub"), pr = $("profPrompt");
    if (w && document.activeElement !== w) w.value = p.wallet || "";
    if (x && document.activeElement !== x) x.value = h ? "@" + h : "";
    if (os && document.activeElement !== os) os.value = p.os || "";
    if (rec) rec.textContent = "— until $ART is live";
    if (name) name.textContent = h ? "@" + h : (p.wallet ? p.wallet.slice(0, 6) + "…" + p.wallet.slice(-4) : "Not set");
    if (sub) {
      sub.textContent = h
        ? (p.wallet ? "Wallet linked on this device" : "Bankr can send to this handle")
        : "Add a handle so people can tip you";
    }
    if (pr) pr.textContent = promptLine(h);
    if (face) {
      if (h) {
        face.innerHTML = '<img alt="" src="https://unavatar.io/twitter/' + encodeURIComponent(h) + '?fallback=false" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'grid\'"><div class="ph" style="display:none">AR</div>';
      } else {
        face.innerHTML = '<div class="ph">AR</div>';
      }
    }
  }
  function grab() {
    var p = load();
    p.wallet = ($("profWallet").value || "").trim();
    p.x = ($("profX").value || "").trim().replace(/^@/, "");
    p.os = ($("profOs").value || "").trim();
    saveStore(p);
    draw();
    var s = $("status");
    if (s) { s.className = "hint ok"; s.textContent = "Saved on this device."; }
  }
  ["profWallet", "profX", "profOs"].forEach(function (id) {
    var el = $(id); if (el) el.addEventListener("change", grab);
  });
  if ($("profSave")) $("profSave").addEventListener("click", grab);
  if ($("profCopy")) $("profCopy").addEventListener("click", function () {
    var line = ($("profPrompt") && $("profPrompt").textContent) || "";
    if (navigator.clipboard) navigator.clipboard.writeText(line);
    var s = $("status");
    if (s) { s.className = "hint ok"; s.textContent = "Copied."; }
  });
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
      if (connect && account) connect.textContent = account.slice(0, 6) + "…" + account.slice(-4);
      var p = load();
      p.wallet = account || p.wallet;
      saveStore(p);
      draw();
    } catch (err) {}
  }
  if (use) use.addEventListener("click", connectWallet);
  if (connect) connect.addEventListener("click", connectWallet);
  draw();
})();
