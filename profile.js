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
    if (rec) rec.textContent = "\u2014 until $ART is live";
    if (name) name.textContent = h ? "@" + h : (p.wallet ? p.wallet.slice(0, 6) + "\u2026" + p.wallet.slice(-4) : "Not set");
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
  function setCopyStatus(msg, kind) {
    var s = $("profCopyStatus") || $("status");
    if (!s) return;
    s.className = "hint" + (kind ? " " + kind : "");
    s.textContent = msg;
  }
  function selectPromptText(el) {
    if (!el) return;
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
  }
  async function copyLine(text) {
    var line = String(text || "");
    if (!line) return false;
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(line);
        return true;
      } catch (e) {}
    }
    var ta = document.createElement("textarea");
    ta.value = line;
    ta.setAttribute("readonly", "");
    ta.setAttribute("aria-hidden", "true");
    ta.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0.01;border:0;padding:0;margin:0;";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, line.length);
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }
  async function copyProfPrompt() {
    var pr = $("profPrompt");
    var btn = $("profCopy");
    var line = (pr && pr.textContent) || "";
    var ok = await copyLine(line);
    if (pr) pr.classList.toggle("copied", !!ok);
    if (ok) {
      if (btn) {
        var prev = btn.getAttribute("data-label") || btn.textContent;
        btn.setAttribute("data-label", prev);
        btn.textContent = "Copied";
        window.clearTimeout(btn._copyT);
        btn._copyT = window.setTimeout(function () {
          btn.textContent = btn.getAttribute("data-label") || prev;
        }, 1800);
      }
      setCopyStatus("Copied. Paste into Bankr or tweet at @bankrbot.", "ok");
    } else {
      selectPromptText(pr);
      setCopyStatus("Clipboard blocked on this phone. Prompt is selected \u2014 long-press and Copy.", "warn");
    }
  }
  if ($("profCopy")) $("profCopy").addEventListener("click", function () { copyProfPrompt(); });
  if ($("profPrompt")) {
    $("profPrompt").addEventListener("click", function () { copyProfPrompt(); });
    $("profPrompt").addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); copyProfPrompt(); }
    });
  }
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
      saveStore(p);
      draw();
    } catch (err) {}
  }
  if (use) use.addEventListener("click", connectWallet);
  if (connect) connect.addEventListener("click", connectWallet);
  draw();
})();
