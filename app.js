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
    metaEl.textContent = "Tap a mark or paste @handle / 0x";
  }
  if (wrap) wrap.classList.toggle("on", !!(handle || picked.address));
}
function cardHTML(id, title, sub, extra) {
  const ph = initials(title);
  return '<div class="match" data-id="' + id + '"><div class="ph">' + ph + "</div><div><strong>" + title + "</strong><span>" + sub + (extra ? " \u00b7 " + extra : "") + "</span></div></div>";
}
function renderMatches(raw) {
  if (!matchesEl) return;
  const addr = extractAddr(raw);
  const handle = extractHandle(raw);
  const os = extractOpensea(raw);
  const nft = parseNft(raw);
  const cards = [];
  if (nft) lookupNft(raw);
  if (addr) cards.push({ id: "addr", kind: "addr", handle: "", address: addr, html: cardHTML("addr", addr.slice(0, 6) + "\u2026" + addr.slice(-4), "Wallet", "ready to send") });
  if (handle) cards.push({ id: "x", kind: "x", handle: handle, address: "", html: cardHTML("x", "@" + handle, "X profile", "Bankr can send to the linked wallet") });
  if (os && !os.startsWith("0x") && !addr) cards.push({ id: "os", kind: "os", handle: os, address: "", html: cardHTML("os", os, "OpenSea profile", "paste their 0x to send from this page") });
  else if (!addr && !handle && !nft && String(raw || "").trim().length >= 2) {
    const guess = String(raw).trim().replace(/^@/, "");
    cards.push({ id: "x", kind: "x", handle: guess, address: "", html: cardHTML("x", "@" + guess, "Treat as X handle", "tap to confirm") });
  }
  matchesEl.innerHTML = cards.map((c) => c.html).join("");
  window.__cards = cards;
  if (cards[0]) select(cards[0].id);
  else writePrompt();
  matchesEl.querySelectorAll(".match").forEach((el) => el.addEventListener("click", () => select(el.dataset.id)));
}
function select(id) {
  const cards = window.__cards || [];
  const c = cards.find((x) => x.id === id) || cards[0];
  if (!c) return;
  const keepImg = picked.img;
  const keepName = picked.name;
  const keepLabel = picked.label;
  picked = {
    kind: c.kind || picked.kind,
    label: keepLabel || "artist",
    handle: c.handle || picked.handle,
    address: c.address || "",
    name: c.name || keepName || c.handle,
    img: c.img || keepImg || stillFor(c.handle)
  };
  matchesEl.querySelectorAll(".match").forEach((el) => el.classList.toggle("on", el.dataset.id === id));
  writePrompt();
  paintRecv();
}
function recipient() {
  if (picked.kind === "addr" && picked.address) return picked.address;
  if (picked.handle) return "@" + String(picked.handle).replace(/^@/, "");
  return "@artist";
}
function writePrompt() {
  if (!promptEl) return "";
  const amount = ((amt && amt.value) || "500 ART").trim();
  const line = "@bankrbot send " + amount + " to " + recipient() + " on robinhood chain";
  promptEl.textContent = line;
  return line;
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
if (connectBtn) connectBtn.addEventListener("click", connect);
if (sendBtn) sendBtn.addEventListener("click", sendArt);
if ($("chips")) $("chips").addEventListener("click", (e) => {
  const b = e.target.closest(".amt");
  if (!b) return;
  $("chips").querySelectorAll(".amt").forEach((x) => x.classList.remove("on"));
  b.classList.add("on");
  if (amt) amt.value = b.dataset.v;
  writePrompt();
});
if (who) who.addEventListener("input", () => renderMatches(who.value));
if (amt) amt.addEventListener("input", writePrompt);
if ($("nft")) $("nft").addEventListener("change", () => lookupNft());
if ($("copy")) $("copy").addEventListener("click", async () => {
  const line = writePrompt();
  try {
    await navigator.clipboard.writeText(line);
    setStatus("Copied. Paste into Bankr or tweet at @bankrbot.", "ok");
  } catch {
    setStatus("Copy failed \u2014 select the prompt and copy it yourself.", "warn");
  }
});
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
