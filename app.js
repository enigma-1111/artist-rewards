const CONFIG = {
  name: "Artist Rewards Token",
  ticker: "ART",
  contract: "",
  lookalike: "0xa5bc127b167bD5B89E161838799B1bDdfD0697c4",
  x: "nft_art",
  pair: "WETH",
  payout: "Both",
  chainId: 4663,
  chainHex: "0x1237",
  chainName: "Robinhood Chain",
  rpc: "https://rpc.mainnet.chain.robinhood.com",
  explorer: "https://explorer.robinhood.com",
  decimals: 18
};

if (String(CONFIG.contract || "").toLowerCase() === String(CONFIG.lookalike || "").toLowerCase()) {
  CONFIG.contract = "";
}

const $ = (id) => document.getElementById(id);
const who = $("who");
const amt = $("amt");
const promptEl = $("prompt");
const matchesEl = $("matches");
const statusEl = $("status");
const connectBtn = $("connect");
const sendBtn = $("send");

let picked = { kind: "x", handle: "", address: "", name: "", img: "", label: "" };
let account = "";

function initials(name) {
  return String(name || "AR").replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase() || "AR";
}
function shortAddr(a) {
  return a.slice(0, 6) + "\u2026" + a.slice(-4);
}
function extractHandle(s) {
  const t = String(s || "").trim();
  const x = t.match(/(?:x\.com|twitter\.com)\/@?([A-Za-z0-9_]{1,15})/i);
  if (x) return x[1];
  const at = t.match(/^@?([A-Za-z0-9_]{1,15})$/);
  return at ? at[1] : "";
}
function extractOpensea(s) {
  const t = String(s || "").trim();
  const m = t.match(/opensea\.io\/(?:os\/)?([A-Za-z0-9._-]+)/i);
  if (!m) return "";
  const slug = m[1];
  if (["assets", "item", "collection", "collections", "rankings", "activity"].includes(slug.toLowerCase())) return "";
  return slug;
}
function extractAddr(s) {
  const m = String(s).match(/0x[a-fA-F0-9]{40}/);
  return m ? m[0] : "";
}
function normalizeNftChain(s) {
  const k = String(s || "").toLowerCase();
  if (k === "eth" || k === "mainnet" || k === "ethereum") return "ethereum";
  if (k === "matic" || k === "polygon") return "polygon";
  if (k === "arb" || k === "arbitrum") return "arbitrum";
  if (k === "op" || k === "optimism") return "optimism";
  if (k === "base") return "base";
  return k || "ethereum";
}
function parseNft(raw) {
  const t = String(raw || "").trim();
  if (!t) return null;
  const path = t.split(/[?#]/)[0];
  const idRe = "(\\d+|0x[a-fA-F0-9]+)";
  let m = path.match(new RegExp("opensea\\.io\\/(?:assets|item)\\/([a-z0-9-]+)\\/(0x[a-fA-F0-9]{40})\\/" + idRe, "i"));
  if (m) return { kind: "item", chain: normalizeNftChain(m[1]), contract: m[2], tokenId: m[3] };
  m = path.match(new RegExp("opensea\\.io\\/(?:assets|item)\\/(0x[a-fA-F0-9]{40})\\/" + idRe, "i"));
  if (m) return { kind: "item", chain: "ethereum", contract: m[1], tokenId: m[2] };
  m = t.match(new RegExp("(0x[a-fA-F0-9]{40})\\s*[\\/#:, ]+\\s*" + idRe));
  if (m) return { kind: "item", chain: "ethereum", contract: m[1], tokenId: m[2] };
  m = path.match(/opensea\.io\/collection\/([a-z0-9._-]+)/i);
  if (m) return { kind: "collection", slug: m[1] };
  if (/opensea\.io/i.test(t)) return { kind: "unknown", hint: "Need the item page — collection or profile links have no holder." };
  return { kind: "unknown", hint: "Need an OpenSea item link or contract / token id." };
}
function stillFor(handle) {
  const k = String(handle || picked.handle || "").replace(/^@/, "").toLowerCase();
  if (picked.img && String(picked.handle || "").replace(/^@/, "").toLowerCase() === k) return picked.img;
  const cat = window.__artCatalog;
  if (k && cat) {
    const all = [].concat(cat.artists || [], cat.collections || []);
    const hit = all.find((r) => String(r.handle || "").replace(/^@/, "").toLowerCase() === k && r.img);
    if (hit) return hit.img;
  }
  const face = document.querySelector(".face.on[data-img]");
  if (face && face.dataset.img) return face.dataset.img;
  return "";
}
window.avErr = function (el) {
  el.style.display = "none";
  if (el.nextElementSibling) el.nextElementSibling.style.display = "grid";
};
function paintRecv() {
  const box = $("recvFace");
  const nameEl = $("recvName");
  const metaEl = $("recvMeta");
  const wrap = $("recv");
  if (!box) return;
  const handle = (picked.handle || "").replace(/^@/, "");
  const name = picked.name || handle || "Receiver";
  const ph = initials(name);
  const still = stillFor(handle);
  if (still) {
    box.innerHTML = '<img data-h="' + handle + '" alt="' + name + '" referrerpolicy="no-referrer" src="' + still + '" onerror="window.avErr(this)"><div class="ph" style="display:none">' + ph + "</div>";
  } else if (handle || picked.address) {
    box.innerHTML = '<div class="ph">' + ph + "</div>";
  } else {
    box.innerHTML = '<div class="ph">AR</div>';
  }
  if (picked.address) {
    nameEl.textContent = shortAddr(picked.address);
    metaEl.textContent = "Wallet \u00b7 Bankr or on-site send";
  } else if (handle) {
    nameEl.textContent = name;
    metaEl.textContent = picked.label === "collection"
      ? "@" + handle + " \u00b7 collection still \u00b7 Bankr can send to this handle"
      : "@" + handle + " \u00b7 Bankr can send to this handle";
  } else {
    nameEl.textContent = "Pick a receiver";
    metaEl.textContent = "Tap a mark or type a name / @handle";
  }
  if (wrap) wrap.classList.toggle("on", !!(handle || picked.address));
}
function esc(s) {
  return String(s || "").replace(/[&<>"']/g, function (c) {
    return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
  });
}
function cardHTML(id, title, sub, extra, img) {
  const ph = initials(title);
  const mark = img
    ? '<img alt="" referrerpolicy="no-referrer" src="' + esc(img) + '" onerror="window.avErr(this)"><div class="ph" style="display:none">' + ph + "</div>"
    : '<div class="ph">' + ph + "</div>";
  return '<div class="match" data-id="' + esc(id) + '" role="option"><div class="match-face">' + mark + "</div><div><strong>" + esc(title) + "</strong><span>" + esc(sub) + (extra ? " \u00b7 " + esc(extra) : "") + "</span></div></div>";
}
function catalogPool() {
  const cat = window.__artCatalog || {};
  const out = [];
  const seen = {};
  function add(row, kind) {
    if (!row || !row.handle) return;
    const handle = String(row.handle).replace(/^@/, "");
    const name = String(row.name || handle);
    const key = handle.toLowerCase() + "|" + name.toLowerCase();
    if (seen[key]) return;
    seen[key] = 1;
    out.push({ handle: handle, name: name, img: row.img || "", kind: kind });
  }
  (cat.artists || []).forEach(function (r) { add(r, "artist"); });
  (cat.collections || []).forEach(function (r) { add(r, "collection"); });
  return out;
}
function scoreHit(row, q) {
  const h = String(row.handle || "").toLowerCase();
  const n = String(row.name || "").toLowerCase();
  if (!q) return 0;
  if (h === q) return 100;
  if (n === q) return 90;
  if (h.startsWith(q)) return 80;
  if (n.startsWith(q)) return 70;
  if (h.indexOf(q) >= 0) return 55;
  if (n.indexOf(q) >= 0) return 45;
  return 0;
}
function searchCatalog(raw) {
  const q = String(raw || "").trim().replace(/^@/, "").toLowerCase();
  if (q.length < 1) return [];
  return catalogPool()
    .map(function (row) { return { row: row, score: scoreHit(row, q) }; })
    .filter(function (x) { return x.score > 0; })
    .sort(function (a, b) { return b.score - a.score || a.row.name.localeCompare(b.row.name); })
    .slice(0, 6)
    .map(function (x, i) {
      const row = x.row;
      const kind = row.kind === "collection" ? "collection" : "artist";
      return {
        id: "cat-" + i,
        kind: "x",
        label: kind,
        handle: row.handle,
        address: "",
        name: row.name,
        img: row.img,
        html: cardHTML("cat-" + i, row.name, "@" + row.handle, kind === "collection" ? "collection still" : "culture map", row.img)
      };
    });
}
function setWhoExpanded(on) {
  if (who) who.setAttribute("aria-expanded", on ? "true" : "false");
}
function highlightMatch(id) {
  if (!matchesEl) return;
  window.__activeMatch = id;
  matchesEl.querySelectorAll(".match").forEach(function (el) {
    const on = el.dataset.id === id;
    el.classList.toggle("on", on);
    if (on) el.setAttribute("aria-selected", "true");
    else el.removeAttribute("aria-selected");
  });
}
function renderMatches(raw, opts) {
  if (!matchesEl) return;
  const commit = !!(opts && opts.commit);
  const trimmed = String(raw || "").trim();
  if (!trimmed) {
    matchesEl.innerHTML = "";
    window.__cards = [];
    window.__activeMatch = "";
    setWhoExpanded(false);
    if (!(opts && opts.keepPicked)) {
      picked = { kind: "x", handle: "", address: "", name: "", img: "", label: "" };
      document.querySelectorAll(".face.on").forEach(function (el) { el.classList.remove("on"); });
      writePrompt();
      paintRecv();
    }
    return;
  }
  const addr = extractAddr(trimmed);
  const handle = extractHandle(trimmed);
  const os = extractOpensea(trimmed);
  const nft = parseNft(trimmed);
  const cards = [];
  if (nft && nft.kind === "item") lookupNft(trimmed);
  if (addr) {
    cards.push({
      id: "addr",
      kind: "addr",
      label: "wallet",
      handle: "",
      address: addr,
      name: shortAddr(addr),
      img: "",
      html: cardHTML("addr", shortAddr(addr), "Wallet", "ready to send")
    });
  } else {
    searchCatalog(trimmed).forEach(function (c) { cards.push(c); });
    const typed = handle || (!os && !nft && trimmed.length >= 2 ? trimmed.replace(/^@/, "") : "");
    const already = typed && cards.some(function (c) {
      return String(c.handle || "").toLowerCase() === typed.toLowerCase();
    });
    if (typed && !already && /^[A-Za-z0-9_]{1,30}$/.test(typed)) {
      cards.push({
        id: "x",
        kind: "x",
        label: "artist",
        handle: typed,
        address: "",
        name: typed,
        img: stillFor(typed),
        html: cardHTML("x", "@" + typed, "Treat as X handle", "tap to confirm", stillFor(typed))
      });
    }
    if (os && !os.startsWith("0x") && !cards.length) {
      cards.push({
        id: "os",
        kind: "os",
        label: "artist",
        handle: os,
        address: "",
        name: os,
        img: "",
        html: cardHTML("os", os, "OpenSea profile", "paste their 0x to send from this page")
      });
    }
  }
  matchesEl.innerHTML = cards.map(function (c) { return c.html; }).join("");
  window.__cards = cards;
  setWhoExpanded(cards.length > 0);
  const start = cards[0] ? cards[0].id : "";
  highlightMatch(start);
  matchesEl.querySelectorAll(".match").forEach(function (el) {
    el.addEventListener("click", function () { select(el.dataset.id, { commit: true }); });
  });
  if (commit && cards[0]) select(cards[0].id, { commit: true });
  else writePrompt();
}
function select(id, opts) {
  const cards = window.__cards || [];
  const c = cards.find(function (x) { return x.id === id; }) || cards[0];
  if (!c) return;
  highlightMatch(c.id);
  if (!(opts && opts.commit)) return;
  picked = {
    kind: c.kind || "x",
    label: c.label || (c.kind === "addr" ? "wallet" : "artist"),
    handle: c.handle || "",
    address: c.address || "",
    name: c.name || c.handle || "",
    img: c.img || stillFor(c.handle)
  };
  if (who) who.value = picked.address || (picked.handle ? "@" + picked.handle : who.value);
  document.querySelectorAll("#faces .face, #collections .face").forEach(function (el) {
    el.classList.toggle("on", !!(picked.handle && String(el.dataset.handle || "").toLowerCase() === String(picked.handle).toLowerCase()));
  });
  writePrompt();
  paintRecv();
  if (statusEl && (picked.handle || picked.address)) {
    statusEl.className = "hint ok";
    statusEl.textContent = picked.address
      ? "Receiver set to " + shortAddr(picked.address) + ". Copy the Bankr prompt."
      : "Receiver set to " + (picked.name || "@" + picked.handle) + ". Copy the Bankr prompt.";
  }
}
function isPlaceholderHandle(h) {
  return /^(artist|yourhandle|handle)$/i.test(String(h || "").replace(/^@/, ""));
}
function recipient() {
  if (picked.kind === "addr" && picked.address) return picked.address;
  if (picked.handle) {
    var h = String(picked.handle).replace(/^@/, "");
    if (!h || isPlaceholderHandle(h)) return "";
    return "@" + h;
  }
  return "";
}
function amountKey(raw) {
  const t = String(raw || "").trim();
  if (!t) return "";
  if (/^\$/.test(t) || /\bof\s+ART\b/i.test(t)) {
    const n = t.replace(/,/g, "").match(/([0-9]+(?:\.[0-9]+)?)/);
    return n ? "$" + n[1] : t.toLowerCase();
  }
  const n = t.replace(/,/g, "").match(/([0-9]+(?:\.[0-9]+)?)/);
  return n ? n[1] : t.toLowerCase();
}
function normalizeAmount(raw) {
  const t = String(raw || "").trim();
  if (!t) return "500 ART";
  if (/^\$/.test(t) || /\bof\s+ART\b/i.test(t)) {
    const n = t.replace(/,/g, "").match(/([0-9]+(?:\.[0-9]+)?)/);
    return "$" + (n ? n[1] : "5") + " of ART";
  }
  const n = t.replace(/,/g, "").match(/([0-9]+(?:\.[0-9]+)?)/);
  return n ? n[1] + " ART" : "500 ART";
}
function syncChips(canonical) {
  const box = $("chips");
  if (!box) return;
  const key = amountKey(canonical);
  box.querySelectorAll(".amt").forEach((x) => {
    const on = amountKey(x.getAttribute("data-v")) === key;
    x.classList.toggle("on", on);
    x.setAttribute("aria-pressed", on ? "true" : "false");
  });
}
function writePrompt() {
  if (!promptEl) return "";
  const amount = normalizeAmount((amt && amt.value) || "500 ART");
  const to = recipient();
  const ready = !!to;
  const line = "@bankrbot send " + amount + " to " + (to || "@handle") + " on robinhood chain";
  promptEl.textContent = line;
  promptEl.setAttribute("data-ready", ready ? "1" : "0");
  promptEl.classList.toggle("wait", !ready);
  promptEl.title = ready ? "Tap to copy" : "Pick a receiver first";
  syncChips(amount);
  return ready ? line : "";
}
function commitAmount(raw) {
  const amount = normalizeAmount(raw);
  if (amt) amt.value = amount;
  return writePrompt();
}
function openConfirm(t) {
  const handle = ((t && t.handle) || "").replace(/^@/, "");
  picked = {
    kind: t && t.address ? "addr" : "x",
    label: (t && (t.kind || t.label)) || picked.label || "artist",
    handle: handle,
    address: (t && t.address) || "",
    name: (t && t.name) || handle || "receiver",
    img: (t && t.img) || stillFor(handle)
  };
  if (who) who.value = picked.address || (handle ? "@" + handle : "");
  writePrompt();
  paintRecv();
  if (who) renderMatches(who.value);
  writePrompt();
  paintRecv();
  const recv = $("recv");
  if (recv) recv.scrollIntoView({ behavior: "smooth", block: "nearest" });
  if (statusEl) {
    statusEl.className = "hint ok";
    statusEl.textContent = picked.address
      ? "Receiver set to " + shortAddr(picked.address) + ". Copy the Bankr prompt."
      : "Receiver set to " + (picked.name || "@" + picked.handle) + ". Copy the Bankr prompt.";
  }
}
window.openConfirm = openConfirm;
