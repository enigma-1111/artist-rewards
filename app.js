const CONFIG = {
  name: "Artist Rewards Token",
  ticker: "ART",
  contract: "",
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
function parseNft(raw) {
  const t = String(raw || "").trim();
  let m = t.match(/opensea\.io\/(?:assets|item)\/([a-z0-9-]+)\/(0x[a-fA-F0-9]{40})\/(\d+)/i);
  if (m) return { chain: m[1].toLowerCase(), contract: m[2], tokenId: m[3] };
  m = t.match(/(0x[a-fA-F0-9]{40})\s*[\/# ]\s*(\d+)/);
  if (m) return { chain: "ethereum", contract: m[1], tokenId: m[2] };
  return null;
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
  if (nft) lookupNft(trimmed);
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
function recipient() {
  if (picked.kind === "addr" && picked.address) return picked.address;
  if (picked.handle) return "@" + String(picked.handle).replace(/^@/, "");
  return "@artist";
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
  const line = "@bankrbot send " + amount + " to " + recipient() + " on robinhood chain";
  promptEl.textContent = line;
  syncChips(amount);
  return line;
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
function paintFaces() {
  if ($("faces") && $("faces").querySelector(".face img")) return;
}
function paintCollections() {
  const box = $("collections");
  if (!box || box.querySelector(".face")) return;
}
function setStatus(msg, kind) {
  if (!statusEl) return;
  statusEl.textContent = msg;
  statusEl.className = "hint" + (kind ? " " + kind : "");
}
async function ensureChain(eth) {
  try {
    await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: CONFIG.chainHex }] });
  } catch (err) {
    if (err && err.code === 4902) {
      await eth.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: CONFIG.chainHex,
          chainName: CONFIG.chainName,
          nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
          rpcUrls: [CONFIG.rpc],
          blockExplorerUrls: [CONFIG.explorer]
        }]
      });
    } else throw err;
  }
}
async function connect() {
  const eth = window.ethereum;
  if (!eth) {
    setStatus("No wallet in this browser. Use Robinhood Wallet, Rabby, or MetaMask \u2014 or Copy Bankr tip.", "warn");
    return;
  }
  try {
    const accs = await eth.request({ method: "eth_requestAccounts" });
    account = (accs && accs[0]) || "";
    await ensureChain(eth);
    if (connectBtn) connectBtn.textContent = account ? shortAddr(account) : "Connect";
    const p = loadProfile();
    if (account) p.wallet = account;
    saveProfile(p);
    setStatus(account ? "Wallet connected. Link an X handle so Bankr can reach you." : "", account ? "ok" : "");
  } catch (err) {
    setStatus(err && err.message ? err.message : "Connect cancelled.", "warn");
  }
}
function parseArtAmount(raw) {
  const t = String(raw).trim();
  const usd = t.match(/^\$?\s*([0-9]+(?:\.[0-9]+)?)\s*(?:of\s+ART)?$/i);
  if (t.startsWith("$")) return { kind: "usd", value: usd ? usd[1] : t };
  const n = t.replace(/,/g, "").match(/([0-9]+(?:\.[0-9]+)?)/);
  return { kind: "token", value: n ? n[1] : "0" };
}
function toUnits(amount) {
  const [w, f = ""] = String(amount).split(".");
  const frac = (f + "000000000000000000").slice(0, CONFIG.decimals);
  return BigInt(w + frac).toString(16);
}
async function sendArt() {
  if (!CONFIG.contract) {
    setStatus("Token is not live yet. Copy the Bankr prompt for later, or launch first.", "warn");
    return;
  }
  const to = picked.address || extractAddr(who && who.value);
  if (!to) {
    setStatus("On-site send needs a 0x address. Use Copy Bankr for @handles, or resolve an NFT holder first.", "warn");
    return;
  }
  const parsed = parseArtAmount(amt.value);
  if (parsed.kind === "usd") {
    setStatus("Wallet send needs a token amount (100 ART), not $5. Use Bankr for dollar tips.", "warn");
    return;
  }
  if (!window.ethereum) {
    setStatus("Connect a wallet first.", "warn");
    return;
  }
  if (!account) await connect();
  if (!account) return;
  try {
    const eth = window.ethereum;
    await ensureChain(eth);
    const units = toUnits(parsed.value);
    const data = "0xa9059cbb" + to.slice(2).toLowerCase().padStart(64, "0") + units.padStart(64, "0");
    const hash = await eth.request({ method: "eth_sendTransaction", params: [{ from: account, to: CONFIG.contract, data }] });
    setStatus("Sent. " + hash.slice(0, 10) + "\u2026", "ok");
  } catch (err) {
    setStatus(err && err.message ? err.message : "Send failed.", "warn");
  }
}
const RPCS = {
  ethereum: "https://ethereum.publicnode.com",
  eth: "https://ethereum.publicnode.com",
  base: "https://mainnet.base.org",
  polygon: "https://polygon-bor-rpc.publicnode.com",
  matic: "https://polygon-bor-rpc.publicnode.com",
  arbitrum: "https://arbitrum-one-rpc.publicnode.com",
  optimism: "https://optimism-rpc.publicnode.com"
};
async function ownerOf(chain, contract, tokenId) {
  const rpc = RPCS[chain] || RPCS.ethereum;
  const idHex = BigInt(tokenId).toString(16).padStart(64, "0");
  const data = "0x6352211e" + idHex;
  const res = await fetch(rpc, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to: contract, data }, "latest"] })
  });
  const json = await res.json();
  const hex = json && json.result;
  if (!hex || hex === "0x") throw new Error("No owner on this item");
  return "0x" + hex.slice(-40);
}
async function lookupNft(raw) {
  const parsed = parseNft(raw || ($("nft") && $("nft").value));
  const box = $("nftOut");
  if (!box) return;
  if (!parsed) {
    box.innerHTML = '<p class="hint warn">Need an item link or contract / token id. Works on all EVM-chain artists.</p>';
    return;
  }
  box.innerHTML = '<p class="hint">Looking up current holder\u2026</p>';
  try {
    const owner = await ownerOf(parsed.chain, parsed.contract, parsed.tokenId);
    if (who) who.value = owner;
    renderMatches(owner);
    box.innerHTML = '<div class="match on"><div class="ph">0x</div><div><strong>' + shortAddr(owner) + "</strong><span>Current holder \u00b7 ready to tip</span></div></div>";
    setStatus("Holder found. Confirm this wallet.", "ok");
    openConfirm({ name: "NFT holder", handle: "", address: owner });
  } catch (err) {
    box.innerHTML = '<p class="hint warn">' + (err.message || "Could not read owner.") + "</p>";
  }
}
const PROFILE_KEY = "art.profile.v1";
function loadProfile() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}"); } catch (e) { return {}; }
}
function saveProfile(p) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}
function paintToken() {
  const line = $("tokenLine");
  const links = $("tokenLinks");
  if (!line || !links) return;
  if (!CONFIG.contract) {
    line.textContent = "No contract yet. Launch on pools.fun, then send the 0x.";
    links.innerHTML = "";
  }
}
/* Connect tap belongs to connect.js wallet sheet — do not inject here. */
if (sendBtn) sendBtn.addEventListener("click", sendArt);
if ($("chips")) $("chips").addEventListener("click", (e) => {
  const b = e.target.closest(".amt");
  if (!b) return;
  commitAmount(b.getAttribute("data-v"));
});
if (who) {
  who.addEventListener("input", function () { renderMatches(who.value); });
  who.addEventListener("keydown", function (e) {
    const cards = window.__cards || [];
    if (!cards.length) return;
    const ids = cards.map(function (c) { return c.id; });
    let i = ids.indexOf(window.__activeMatch);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      highlightMatch(ids[(i + 1) % ids.length]);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      highlightMatch(ids[(i - 1 + ids.length) % ids.length]);
    } else if (e.key === "Enter") {
      e.preventDefault();
      select(window.__activeMatch || ids[0], { commit: true });
    } else if (e.key === "Escape") {
      matchesEl.innerHTML = "";
      window.__cards = [];
      window.__activeMatch = "";
      setWhoExpanded(false);
    }
  });
  who.addEventListener("blur", function () {
    window.setTimeout(function () {
      if (!who.value.trim()) return;
      const cards = window.__cards || [];
      if (!picked.handle && !picked.address && cards[0]) select(window.__activeMatch || cards[0].id, { commit: true });
    }, 180);
  });
}
if (amt) {
  amt.addEventListener("input", writePrompt);
  amt.addEventListener("change", () => commitAmount(amt.value));
  amt.addEventListener("blur", () => commitAmount(amt.value));
}
if ($("nft")) $("nft").addEventListener("change", () => lookupNft());
function selectPromptText(el) {
  if (!el) return;
  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = window.getSelection();
  if (!sel) return;
  sel.removeAllRanges();
  sel.addRange(range);
}
async function copyLine(text) {
  const line = String(text || "");
  if (!line) return false;
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(line);
      return true;
    } catch (e) {}
  }
  const ta = document.createElement("textarea");
  ta.value = line;
  ta.setAttribute("readonly", "");
  ta.setAttribute("aria-hidden", "true");
  ta.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0.01;border:0;padding:0;margin:0;";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  ta.setSelectionRange(0, line.length);
  let ok = false;
  try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
  document.body.removeChild(ta);
  return ok;
}
function flashCopyBtn(btn, label) {
  if (!btn) return;
  const prev = btn.getAttribute("data-label") || btn.textContent;
  btn.setAttribute("data-label", prev);
  btn.textContent = label;
  window.clearTimeout(btn._copyT);
  btn._copyT = window.setTimeout(function () {
    btn.textContent = btn.getAttribute("data-label") || prev;
  }, 1800);
}
async function copyBankr() {
  const line = commitAmount(amt && amt.value);
  const ok = await copyLine(line);
  if (promptEl) promptEl.classList.toggle("copied", !!ok);
  if (ok) {
    flashCopyBtn($("copy"), "Copied");
    setStatus("Copied. Paste into Bankr or tweet at @bankrbot.", "ok");
  } else {
    selectPromptText(promptEl);
    setStatus("Clipboard blocked on this phone. Prompt is selected \u2014 long-press and Copy.", "warn");
  }
  return ok;
}
if ($("copy")) $("copy").addEventListener("click", function () { copyBankr(); });
if (promptEl) {
  promptEl.addEventListener("click", function () { copyBankr(); });
  promptEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); copyBankr(); }
  });
}
if (window.ethereum) {
  window.ethereum.request({ method: "eth_accounts" }).then((accs) => {
    if (accs && accs[0]) {
      account = accs[0];
      if (connectBtn) connectBtn.textContent = shortAddr(account);
    }
  }).catch(() => {});
}
paintToken();
paintFaces();
paintCollections();
paintRecv();
if (who) {
  writePrompt();
}
