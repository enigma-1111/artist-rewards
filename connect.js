(function () {
  var SITE = "https://art-rewards.vercel.app";
  var KEY = "art.profile.v1";

  function $(id) { return document.getElementById(id); }
  function short(a) { return a ? a.slice(0, 6) + "\u2026" + a.slice(-4) : ""; }
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } }
  function save(p) { localStorage.setItem(KEY, JSON.stringify(p)); }

  function bankrLine() {
    var tip = $("prompt");
    if (tip && tip.textContent && tip.textContent.indexOf("@artist") === -1) return tip.textContent;
    var pr = $("profPrompt");
    if (pr && pr.getAttribute("data-ready") === "1" && pr.textContent) return pr.textContent;
    var p = load();
    var h = String((p && p.x) || "").replace(/^@+/, "").replace(/[^A-Za-z0-9_]/g, "");
    if (h) {
      var amt = String((p && p.amt) || "500 ART");
      return "@bankrbot send " + amt + " to @" + h + " on robinhood chain";
    }
    return "";
  }

  function note(msg, kind) {
    var el = $("walletNote");
    if (el) {
      el.className = "hint" + (kind ? " " + kind : "");
      el.textContent = msg || "";
    }
    var s = $("status");
    if (s && msg) {
      s.className = "hint" + (kind ? " " + kind : "");
      s.textContent = msg;
    }
  }

  function setAccount(addr) {
    if (!addr) return;
    try { if (typeof account !== "undefined") account = addr; } catch (e) {}
    var p = load();
    p.wallet = addr;
    save(p);
    var btn = $("connect");
    if (btn) btn.textContent = short(addr);
    var w = $("profWallet");
    if (w) w.value = addr;
    note("Connected " + short(addr) + ". Pick a receiver, then copy Bankr or send.", "ok");
  }

  function clearAccount() {
    try { if (typeof account !== "undefined") account = ""; } catch (e) {}
    var p = load();
    delete p.wallet;
    save(p);
    var btn = $("connect");
    if (btn) btn.textContent = "Connect";
    var w = $("profWallet");
    if (w && String(w.value || "").indexOf("0x") === 0) w.value = "";
    note("Wallet cleared on this device.", "ok");
  }

  var panel = $("walletSheet");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "walletSheet";
    document.body.appendChild(panel);
  }
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-labelledby", "walletTitle");
  panel.setAttribute("hidden", "");
  panel.innerHTML =
    '<div class="wallet-card" role="document">' +
      '<div class="wallet-head">' +
        '<strong id="walletTitle">Connect</strong>' +
        '<button type="button" id="walletX" class="ghost tiny" aria-label="Close connect sheet">Close</button>' +
      "</div>" +
      '<p class="hint" id="walletLead">Use a wallet in this browser, open a free app, or paste a 0x to preview the tip flow. Token send stays off until the live 0x is pasted.</p>' +
      '<button type="button" class="go" data-w="inject">Wallet in this browser</button>' +
      '<button type="button" class="ghost" data-w="mm">Open in MetaMask</button>' +
      '<button type="button" class="ghost" data-w="cb">Open in Coinbase Wallet</button>' +
      '<button type="button" class="ghost" data-w="rb">Open in Rainbow</button>' +
      '<button type="button" class="ghost" data-w="ph">Open in Phantom</button>' +
      '<button type="button" class="ghost" data-w="tw">Open in Trust</button>' +
      '<button type="button" class="ghost" data-w="bankr">Bankr / Privy terminal</button>' +
      '<input id="walletPaste" placeholder="Or paste 0x to preview" autocomplete="off" spellcheck="false" inputmode="text" />' +
      '<button type="button" class="ghost" data-w="paste">Use pasted address</button>' +
      '<button type="button" class="ghost" data-w="clear" id="walletClear" hidden>Disconnect this device</button>' +
      '<p class="hint" id="walletNote" aria-live="polite"></p>' +
      '<p class="hint">Privy is what Bankr uses. We cannot embed it without an App ID. WalletConnect QR needs a Reown project ID later.</p>' +
    "</div>";

  var lastFocus = null;

  function syncClear() {
    var p = load();
    var clr = $("walletClear");
    if (clr) clr.hidden = !p.wallet;
  }

  function close() {
    panel.classList.remove("on");
    panel.setAttribute("hidden", "");
    document.body.classList.remove("sheet-lock");
    document.removeEventListener("keydown", onKey);
    if (lastFocus && typeof lastFocus.focus === "function") {
      try { lastFocus.focus(); } catch (e) {}
    }
  }

  function open() {
    lastFocus = document.activeElement;
    syncClear();
    var lead = $("walletLead");
    var p = load();
    if (lead) {
      lead.textContent = p.wallet
        ? "This device already has " + short(p.wallet) + ". Inject again, paste a different 0x, or disconnect."
        : "Use a wallet in this browser, open a free app, or paste a 0x to preview the tip flow. Token send stays off until the live 0x is pasted.";
    }
    note("", "");
    panel.removeAttribute("hidden");
    panel.classList.add("on");
    document.body.classList.add("sheet-lock");
    document.addEventListener("keydown", onKey);
    var x = $("walletX");
    if (x) x.focus();
  }

  function onKey(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== "Tab" || !panel.classList.contains("on")) return;
    var nodes = panel.querySelectorAll("button:not([hidden]), input:not([hidden])");
    if (!nodes.length) return;
    var first = nodes[0];
    var last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  panel.addEventListener("click", function (e) {
    if (e.target === panel) close();
  });
  $("walletX").addEventListener("click", function (e) {
    e.preventDefault();
    close();
  });

  async function inject() {
    var eth = window.ethereum;
    if (!eth) {
      note("No wallet in this browser. Pick MetaMask, Coinbase, Rainbow, or Bankr below.", "warn");
      return;
    }
    try {
      var accs = await eth.request({ method: "eth_requestAccounts" });
      setAccount(accs && accs[0]);
      close();
    } catch (err) {
      note((err && err.message) || "Connect cancelled.", "warn");
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
      var line = bankrLine();
      if (line) {
        try { navigator.clipboard.writeText(line); } catch (e2) {}
        note("Bankr prompt copied. Sign in at bankr.bot (Privy) and paste it.", "ok");
      } else {
        note("Add an X handle on Profile, or pick a receiver on Tip, then open Bankr.", "warn");
      }
      window.open("https://bankr.bot", "_blank", "noopener");
      close();
    }
    if (w === "paste") {
      var v = ($("walletPaste").value || "").trim();
      var m = v.match(/0x[a-fA-F0-9]{40}/);
      if (!m) {
        note("Paste a 0x address to preview. This does not set the token contract.", "warn");
        return;
      }
      setAccount(m[0]);
      close();
    }
    if (w === "clear") {
      clearAccount();
      syncClear();
    }
  });

  var paste = $("walletPaste");
  if (paste) {
    paste.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        var btn = panel.querySelector('[data-w="paste"]');
        if (btn) btn.click();
      }
    });
  }

  function bind() {
    var btn = $("connect");
    if (!btn) return;
    var neu = btn.cloneNode(true);
    btn.parentNode.replaceChild(neu, btn);
    neu.setAttribute("type", "button");
    neu.setAttribute("aria-haspopup", "dialog");
    neu.setAttribute("aria-controls", "walletSheet");
    neu.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (panel.classList.contains("on")) close();
      else open();
    });
  }
  bind();

  if (window.ethereum) {
    window.ethereum.request({ method: "eth_accounts" }).then(function (accs) {
      if (accs && accs[0]) setAccount(accs[0]);
    }).catch(function () {});
  } else {
    var stored = load();
    if (stored.wallet) {
      var cap = $("connect");
      if (cap) cap.textContent = short(stored.wallet);
    }
  }

  window.openWalletSheet = open;
  window.closeWalletSheet = close;
})();
