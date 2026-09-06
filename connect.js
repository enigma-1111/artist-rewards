(function () {
  var SITE = "https://art-rewards.vercel.app";
  var KEY = "art.profile.v1";
  function $(id) { return document.getElementById(id); }
  function short(a) { return a ? a.slice(0, 6) + "\u2026" + a.slice(-4) : ""; }
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } }
  function save(p) { localStorage.setItem(KEY, JSON.stringify(p)); }
  function setAccount(addr) {
    if (!addr) return;
    if (typeof account !== "undefined") account = addr;
    var p = load();
    p.wallet = addr;
    save(p);
    var btn = $("connect");
    if (btn) btn.textContent = short(addr);
    var w = $("profWallet");
    if (w) w.value = addr;
    var s = $("status");
    if (s) { s.className = "hint ok"; s.textContent = "Connected " + short(addr) + ". Pick a receiver, then copy Bankr or send."; }
  }
  var panel = document.createElement("div");
  panel.id = "walletSheet";
  panel.innerHTML =
    '<div class="wallet-card">' +
      '<div class="wallet-head"><strong>Connect</strong><button type="button" id="walletX" class="ghost tiny">Close</button></div>' +
      '<p class="hint">Use a wallet in this browser, open a free app, or paste a 0x to preview the flow.</p>' +
      '<button type="button" class="go" data-w="inject">Wallet in this browser</button>' +
      '<button type="button" class="ghost" data-w="mm">Open in MetaMask</button>' +
      '<button type="button" class="ghost" data-w="cb">Open in Coinbase Wallet</button>' +
      '<button type="button" class="ghost" data-w="rb">Open in Rainbow</button>' +
      '<button type="button" class="ghost" data-w="ph">Open in Phantom</button>' +
      '<button type="button" class="ghost" data-w="tw">Open in Trust</button>' +
      '<button type="button" class="ghost" data-w="bankr">Bankr / Privy terminal</button>' +
      '<input id="walletPaste" placeholder="Or paste 0x to preview" autocomplete="off" spellcheck="false" />' +
      '<button type="button" class="ghost" data-w="paste">Use pasted address</button>' +
      '<p class="hint">Bankr signs you in with Privy. We cannot embed Privy without your App ID. WalletConnect QR needs a free Reown project ID later.</p>' +
    "</div>";
  document.body.appendChild(panel);
  function close() { panel.classList.remove("on"); }
  function open() { panel.classList.add("on"); }
  panel.addEventListener("click", function (e) { if (e.target === panel) close(); });
  document.getElementById("walletX").addEventListener("click", close);
  async function inject() {
    var eth = window.ethereum;
    if (!eth) {
      var s = $("status");
      if (s) { s.className = "hint warn"; s.textContent = "No wallet in this browser. Open MetaMask / Coinbase / Rainbow, or use Bankr."; }
      return;
    }
    try {
      var accs = await eth.request({ method: "eth_requestAccounts" });
      setAccount(accs && accs[0]);
      close();
    } catch (err) {
      var s = $("status");
      if (s) { s.className = "hint warn"; s.textContent = (err && err.message) || "Connect cancelled."; }
    }
  }
  function go(url) { window.location.href = url; }
  panel.addEventListener("click", function (e) {
    var b = e.target.closest("[data-w]");
    if (!b) return;
    var w = b.getAttribute("data-w");
    if (w === "inject") inject();
    if (w === "mm") go("https://metamask.app.link/dapp/" + SITE.replace(/^https:\/\//, ""));
    if (w === "cb") go("https://go.cb-w.com/dapp?cb_url=" + encodeURIComponent(SITE));
    if (w === "rb") go("https://rainbow.me/dapp?url=" + encodeURIComponent(SITE));
    if (w === "ph") go("https://phantom.app/ul/browse/" + encodeURIComponent(SITE) + "?ref=" + encodeURIComponent(SITE));
    if (w === "tw") go("https://link.trustwallet.com/open_url?coin_id=60&url=" + encodeURIComponent(SITE));
    if (w === "bankr") {
      var line = ($("prompt") && $("prompt").textContent) || "@bankrbot send 500 ART to @artist on robinhood chain";
      try { navigator.clipboard.writeText(line); } catch (e2) {}
      window.open("https://bankr.bot", "_blank", "noopener");
      var s = $("status");
      if (s) { s.className = "hint ok"; s.textContent = "Bankr prompt copied. Sign in at bankr.bot and paste it."; }
      close();
    }
    if (w === "paste") {
      var v = ($("walletPaste").value || "").trim();
      var m = v.match(/0x[a-fA-F0-9]{40}/);
      if (!m) {
        var s = $("status");
        if (s) { s.className = "hint warn"; s.textContent = "Paste a 0x address to preview."; }
        return;
      }
      setAccount(m[0]);
      close();
    }
  });
  var btn = $("connect");
  if (btn) {
    var neu = btn.cloneNode(true);
    btn.parentNode.replaceChild(neu, btn);
    neu.addEventListener("click", function (e) {
      e.preventDefault();
      open();
    });
  }
  if (window.ethereum) {
    window.ethereum.request({ method: "eth_accounts" }).then(function (accs) {
      if (accs && accs[0]) setAccount(accs[0]);
    }).catch(function () {});
  } else {
    var p = load();
    if (p.wallet && $("connect")) $("connect").textContent = short(p.wallet);
  }
})();
