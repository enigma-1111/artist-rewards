(function () {
  var KEY = "art.profile.v1";

  function $(id) { return document.getElementById(id); }

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; }
  }

  function saveStore(p) {
    localStorage.setItem(KEY, JSON.stringify(p));
  }

  function handleOf(p) {
    return normHandle((p && p.x) || "");
  }

  function normHandle(raw) {
    var s = String(raw || "").trim().replace(/^@+/, "");
    s = s.replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//i, "");
    s = s.split(/[/?#]/)[0];
    s = s.replace(/[^A-Za-z0-9_]/g, "");
    if (s.length > 15) s = s.slice(0, 15);
    return s;
  }

  function normWallet(raw) {
    var s = String(raw || "").trim();
    if (!s) return "";
    if (/^0x[0-9a-fA-F]{40}$/.test(s)) return s.toLowerCase();
    return null;
  }

  function normSite(raw) {
    var s = String(raw || "").trim();
    if (!s) return "";
    if (/^https?:\/\//i.test(s)) return s;
    if (/^(www\.)?(opensea\.io|os\.io)\//i.test(s) || /^[a-z0-9.-]+\.[a-z]{2,}([/:?#].*)?$/i.test(s)) {
      return "https://" + s.replace(/^\/+/, "");
    }
    return s;
  }

  function short(a) {
    return a ? a.slice(0, 6) + "\u2026" + a.slice(-4) : "";
  }

  function promptLine(h) {
    return "@bankrbot send 500 ART to @" + (h || "handle") + " on robinhood chain";
  }

  function whenSaved(ts) {
    if (!ts) return "";
    var d = new Date(ts);
    if (isNaN(d.getTime())) return "";
    try {
      return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
    } catch (e) {
      return "";
    }
  }

  function summarize(p) {
    var bits = [];
    var h = handleOf(p);
    if (h) bits.push("@" + h);
    if (p.wallet) bits.push(short(p.wallet));
    if (p.os) bits.push(p.os.replace(/^https?:\/\//i, "").slice(0, 28));
    var clock = whenSaved(p.savedAt);
    if (!bits.length) return "Nothing saved yet. Add a handle, wallet, or site, then Save.";
    return "Saved on this phone" + (clock ? " \u00b7 " + clock : "") + " \u00b7 " + bits.join(" \u00b7 ");
  }

  function setSavedLine(p, kind) {
    var el = $("profSaved") || $("status");
    if (!el) return;
    el.className = "hint" + (kind ? " " + kind : "");
    el.textContent = summarize(p);
  }

  function paintFace(face, h) {
    if (!face) return;
    face.innerHTML = '<div class="ph">AR</div>';
    if (h) face.setAttribute("title", "@" + h);
    else face.removeAttribute("title");
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
    if (name) {
      name.textContent = h ? "@" + h : (p.wallet ? short(p.wallet) : "Not set");
    }
    if (sub) {
      if (h && p.wallet) sub.textContent = "Wallet linked on this device";
      else if (h) sub.textContent = "Bankr can send to this handle";
      else if (p.wallet) sub.textContent = "Wallet saved. Add an X handle for Bankr.";
      else if (p.os) sub.textContent = "Site saved. Add a handle so people can tip you";
      else sub.textContent = "Add a handle so people can tip you";
    }
    if (pr) pr.textContent = promptLine(h);
    paintFace(face, h);
    if (h || p.wallet) {
      var recv = face && face.parentElement;
      if (recv && recv.classList) recv.classList.add("on");
    }
    setSavedLine(p, (h || p.wallet || p.os) ? "ok" : "");
  }

  function grab(opts) {
    opts = opts || {};
    var p = load();
    var xEl = $("profX");
    var wEl = $("profWallet");
    var osEl = $("profOs");
    var xRaw = xEl ? xEl.value : "";
    var wRaw = wEl ? wEl.value : "";
    var osRaw = osEl ? osEl.value : "";
    var h = normHandle(xRaw);
    var w = normWallet(wRaw);
    var site = normSite(osRaw);
    var s = $("status");
    if (w === null) {
      if (s) {
        s.className = "hint warn";
        s.textContent = "Wallet needs a 0x and 40 hex characters. Handle and site still saved.";
      }
      w = "";
    }
    p.x = h;
    p.wallet = w;
    p.os = site;
    p.savedAt = Date.now();
    saveStore(p);
    if (xEl && document.activeElement !== xEl) xEl.value = h ? "@" + h : "";
    if (wEl && document.activeElement !== wEl) wEl.value = w;
    if (osEl && document.activeElement !== osEl) osEl.value = site;
    draw();
    if (s && w !== "") {
      s.className = "hint ok";
      s.textContent = opts.quiet ? s.textContent : "Saved on this device. Reload keeps it.";
    } else if (s && w === "" && String(wRaw || "").trim() && normWallet(wRaw) === null) {
      /* warn already set */
    } else if (s && !opts.quiet) {
      s.className = "hint ok";
      s.textContent = "Saved on this device. Reload keeps it.";
    }
    var btn = $("profSave");
    if (btn && !opts.quiet) {
      var prev = btn.getAttribute("data-label") || btn.textContent;
      btn.setAttribute("data-label", prev);
      btn.textContent = "Saved";
      window.clearTimeout(btn._saveT);
      btn._saveT = window.setTimeout(function () {
        btn.textContent = btn.getAttribute("data-label") || prev;
      }, 1600);
    }
    return p;
  }

  ["profWallet", "profX", "profOs"].forEach(function (id) {
    var el = $(id);
    if (!el) return;
    el.addEventListener("change", function () { grab(); });
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        grab();
        el.blur();
      }
    });
  });

  if ($("profSave")) $("profSave").addEventListener("click", function () { grab(); });

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
      var ok = normWallet(account);
      if (!ok) {
        var miss = $("status");
        if (miss) { miss.className = "hint warn"; miss.textContent = "Wallet did not return a 0x address."; }
        return;
      }
      var p = load();
      p.wallet = ok;
      p.savedAt = Date.now();
      saveStore(p);
      var w = $("profWallet");
      if (w) w.value = ok;
      draw();
      var note = $("status");
      if (note) { note.className = "hint ok"; note.textContent = "Wallet saved on this device."; }
    } catch (err) {}
  }
  if (use) use.addEventListener("click", connectWallet);

  window.addEventListener("storage", function (e) {
    if (e.key === KEY) draw();
  });

  window.addEventListener("pageshow", function () { draw(); });

  draw();
})();
