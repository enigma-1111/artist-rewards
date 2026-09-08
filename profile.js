(function () {
  var KEY = "art.profile.v1";

  function $(id) { return document.getElementById(id); }

  function load() {
    try { return scrubSelected(JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { return {}; }
  }

  function saveStore(p) {
    localStorage.setItem(KEY, JSON.stringify(scrubSelected(p)));
  }

  function scrubSelected(raw) {
    var p = raw && typeof raw === "object" ? raw : {};
    var drop = ["art", "selected", "selectedArt", "pinned", "pin", "work", "nft"];
    var i;
    for (i = 0; i < drop.length; i++) {
      if (Object.prototype.hasOwnProperty.call(p, drop[i])) delete p[drop[i]];
    }
    return p;
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

  function liveHandle() {
    var x = $("profX");
    var typed = normHandle(x ? x.value : "");
    if (typed) return typed;
    return handleOf(load());
  }

  function amountKey(raw) {
    var t = String(raw || "").trim();
    if (!t) return "";
    if (/^\$/.test(t) || /\bof\s+ART\b/i.test(t)) {
      var d = t.replace(/,/g, "").match(/([0-9]+(?:\.[0-9]+)?)/);
      return d ? "$" + d[1] : t.toLowerCase();
    }
    var n = t.replace(/,/g, "").match(/([0-9]+(?:\.[0-9]+)?)/);
    return n ? n[1] : t.toLowerCase();
  }

  function normalizeAmount(raw) {
    var t = String(raw || "").trim();
    if (!t) return "500 ART";
    if (/^\$/.test(t) || /\bof\s+ART\b/i.test(t)) {
      var d = t.replace(/,/g, "").match(/([0-9]+(?:\.[0-9]+)?)/);
      return "$" + (d ? d[1] : "5") + " of ART";
    }
    var n = t.replace(/,/g, "").match(/([0-9]+(?:\.[0-9]+)?)/);
    return n ? n[1] + " ART" : "500 ART";
  }

  function liveAmount() {
    var p = load();
    return normalizeAmount(p.amt || "500 ART");
  }

  function syncProfChips(canonical) {
    var box = $("profChips");
    if (!box) return;
    var key = amountKey(canonical);
    var nodes = box.querySelectorAll(".amt");
    for (var i = 0; i < nodes.length; i++) {
      var x = nodes[i];
      var on = amountKey(x.getAttribute("data-v")) === key;
      x.classList.toggle("on", on);
      x.setAttribute("aria-pressed", on ? "true" : "false");
    }
  }

  function promptLine(h, amt) {
    var amount = normalizeAmount(amt || "500 ART");
    if (!h) return "@bankrbot send " + amount + " to @yourhandle on robinhood chain";
    return "@bankrbot send " + amount + " to @" + h + " on robinhood chain";
  }

  function writePrompt() {
    var pr = $("profPrompt");
    var h = liveHandle();
    var amt = liveAmount();
    var line = promptLine(h, amt);
    if (pr) {
      pr.textContent = line;
      pr.setAttribute("data-ready", h ? "1" : "0");
      pr.setAttribute("data-handle", h || "");
      pr.classList.toggle("wait", !h);
      pr.classList.remove("copied");
      pr.title = h ? "Tap to copy" : "Add a handle to build the prompt";
    }
    syncProfChips(amt);
    var lead = $("profPromptLead");
    if (lead) {
      lead.textContent = h
        ? "Preview tips @" + h + ". This is your profile handle, not a tip-page artist."
        : "Uses the X handle on this page. Not a leftover tip-page artist.";
    }
    return line;
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

  var catalogIndex = {};

  function indexCatalog(data) {
    catalogIndex = {};
    function add(row, kind) {
      if (!row || !row.handle || !row.img) return;
      var key = String(row.handle).replace(/^@+/, "").toLowerCase();
      if (!key) return;
      if (catalogIndex[key] && catalogIndex[key].kind === "artist") return;
      catalogIndex[key] = {
        handle: row.handle,
        name: row.name || row.handle,
        img: String(row.img),
        kind: kind
      };
    }
    var i;
    var arts = (data && data.artists) || [];
    var cols = (data && data.collections) || [];
    for (i = 0; i < arts.length; i++) add(arts[i], "artist");
    for (i = 0; i < cols.length; i++) add(cols[i], "collection");
  }

  function catalogHit(h) {
    if (!h) return null;
    return catalogIndex[String(h).replace(/^@+/, "").toLowerCase()] || null;
  }

  function paintMark(face, h) {
    if (!face) return;
    face.innerHTML = '<div class="ph" aria-hidden="true">AR</div>';
    face.setAttribute("data-src", "");
    face.setAttribute("data-kind", "mark");
    if (h) face.setAttribute("title", "@" + h);
    else face.removeAttribute("title");
  }

  function paintFace(face, h) {
    if (!face) return;
    var hit = catalogHit(h);
    if (!hit || !hit.img) {
      paintMark(face, h);
      return;
    }
    if (face.getAttribute("data-src") === hit.img && face.querySelector("img")) return;
    var img = document.createElement("img");
    img.alt = hit.name || ("@" + h);
    img.setAttribute("referrerpolicy", "no-referrer");
    img.referrerPolicy = "no-referrer";
    img.onerror = function () { paintMark(face, h); };
    img.src = hit.img;
    face.innerHTML = "";
    face.appendChild(img);
    face.setAttribute("data-src", hit.img);
    face.setAttribute("data-kind", hit.kind || "still");
    face.setAttribute("title", (hit.name ? hit.name + " \u00b7 " : "") + "@" + h);
  }

  function draw() {
    var p = load();
    var h = handleOf(p);
    var w = $("profWallet"), x = $("profX"), os = $("profOs");
    var rec = $("profReceived"), face = $("profFace");
    var name = $("profName"), sub = $("profSub");
    if (w && document.activeElement !== w) w.value = p.wallet || "";
    if (x && document.activeElement !== x) x.value = h ? "@" + h : "";
    if (os && document.activeElement !== os) os.value = p.os || "";
    if (rec) rec.textContent = "\u2014 until $ART is live";
    var live = liveHandle();
    if (name) {
      name.textContent = live ? "@" + live : (p.wallet ? short(p.wallet) : "Not set");
    }
    if (sub) {
      var hit = catalogHit(live);
      if (live && hit && p.wallet) sub.textContent = "Culture-map still \u00b7 wallet on this device";
      else if (live && hit) sub.textContent = "Culture-map still \u00b7 Bankr can send to this handle";
      else if (live && p.wallet) sub.textContent = "Wallet linked on this device";
      else if (live) sub.textContent = "Bankr can send to this handle";
      else if (p.wallet) sub.textContent = "Wallet saved. Add an X handle for Bankr.";
      else if (p.os) sub.textContent = "Site saved. Add a handle so people can tip you";
      else sub.textContent = "Add a handle so people can tip you";
    }
    writePrompt();
    paintFace(face, live);
    if (h || p.wallet) {
      var recv = face && face.parentElement;
      if (recv && recv.classList) recv.classList.add("on");
    }
    setSavedLine(p, (h || p.wallet || p.os) ? "ok" : "");
    paintSoon();
  }

  function paintSoon() {
    var frame = $("soonFrame");
    var title = $("soonTitle");
    var meta = $("soonMeta");
    if (frame) {
      frame.innerHTML = '<div class="ph">AR</div>';
      frame.setAttribute("data-kind", "empty");
      frame.removeAttribute("data-src");
    }
    if (title) title.textContent = "Nothing pinned";
    if (meta) {
      meta.textContent = "This page will pin work you choose. Not live. Culture map only \u2014 ART is not affiliated with any listed artist or collection.";
    }
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
    p.amt = liveAmount();
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
    el.addEventListener("input", function () {
      if (id === "profX") {
        var name = $("profName");
        var sub = $("profSub");
        var h = liveHandle();
        if (name && document.activeElement === el) name.textContent = h ? "@" + h : "Not set";
        if (sub && document.activeElement === el) {
          var hit = catalogHit(h);
          if (h && hit) sub.textContent = "Culture-map still \u00b7 Bankr can send to this handle";
          else if (h) sub.textContent = "Bankr can send to this handle";
          else sub.textContent = "Add a handle so people can tip you";
        }
        paintFace($("profFace"), h);
        writePrompt();
      }
    });
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        grab();
        el.blur();
      }
    });
  });

  var chips = $("profChips");
  if (chips) {
    chips.addEventListener("click", function (e) {
      var b = e.target.closest(".amt");
      if (!b) return;
      var p = load();
      p.amt = normalizeAmount(b.getAttribute("data-v"));
      saveStore(p);
      writePrompt();
    });
  }

  if ($("profSave")) $("profSave").addEventListener("click", function () { grab(); });

  var pin = $("soonPin");
  if (pin) {
    pin.addEventListener("click", function () {
      var note = $("soonNote") || $("status");
      if (note) {
        note.className = "hint warn";
        note.textContent = "Selected art is not live. Nothing was pinned or saved from the catalog.";
      }
      paintSoon();
    });
  }

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
    var h = liveHandle();
    if (!h) {
      setCopyStatus("Save an X handle first. Preview will not copy @artist or a blank target.", "warn");
      var x = $("profX");
      if (x) x.focus();
      return;
    }
    var line = writePrompt();
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

  fetch("/catalog.json")
    .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
    .then(function (data) {
      indexCatalog(data);
      paintFace($("profFace"), liveHandle());
      draw();
    })
    .catch(function () {
      catalogIndex = {};
      paintFace($("profFace"), liveHandle());
    });

  try {
    var first = load();
    saveStore(first);
  } catch (e) {}
  draw();
})();
