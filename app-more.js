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
function tokenIsLive() {
  return /^0x[a-fA-F0-9]{40}$/.test(String(CONFIG.contract || "").trim());
}
function syncSendBtn() {
  if (!sendBtn) return;
  if (tokenIsLive()) {
    sendBtn.textContent = "Send";
    sendBtn.classList.remove("wait");
    sendBtn.removeAttribute("aria-disabled");
    sendBtn.title = "Send ART from the connected wallet";
  } else {
    sendBtn.textContent = "Send later";
    sendBtn.classList.add("wait");
    sendBtn.setAttribute("aria-disabled", "true");
    sendBtn.title = "On-site send waits for the live token. Copy Bankr for now.";
  }
}
async function sendArt() {
  if (!tokenIsLive()) {
    const ok = typeof copyBankr === "function" ? await copyBankr() : false;
    setStatus(
      ok
        ? "On-site send waits for the live token. Prompt copied \u2014 paste into Bankr."
        : "On-site send waits for the live token. Copy the Bankr prompt instead.",
      "warn"
    );
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
  let idHex;
  try {
    idHex = BigInt(tokenId).toString(16).padStart(64, "0");
  } catch (e) {
    throw new Error("Token id is not a number.");
  }
  const data = "0x6352211e" + idHex;
  const res = await fetch(rpc, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to: contract, data }, "latest"] })
  });
  if (!res.ok) throw new Error("Lookup failed. Try again.");
  const json = await res.json();
  if (json && json.error) throw new Error("No owner on this item. Not ERC-721, burned, or wrong chain.");
  const hex = json && json.result;
  if (!hex || hex === "0x" || hex === "0x" + "0".repeat(64)) {
    throw new Error("No owner on this item. Not ERC-721, burned, or wrong chain.");
  }
  return "0x" + hex.slice(-40);
}
function nftMiss(msg) {
  const box = $("nftOut");
  if (!box) return;
  box.innerHTML = '<p class="hint warn">' + esc(msg) + "</p>";
}
async function lookupNft(raw) {
  const box = $("nftOut");
  if (!box) return;
  const text = String(raw == null ? (($("nft") && $("nft").value) || "") : raw).trim();
  if (!text) {
    box.innerHTML = "";
    return;
  }
  const parsed = parseNft(text);
  if (!parsed || parsed.kind === "unknown") {
    nftMiss((parsed && parsed.hint) || "Need an OpenSea item link or contract / token id.");
    return;
  }
  if (parsed.kind === "collection") {
    nftMiss("That\u2019s a collection page. Paste one item (\u2026/assets/\u2026/token id) to find the holder.");
    return;
  }
  const seq = (window.__nftLook = (window.__nftLook || 0) + 1);
  box.innerHTML = '<p class="hint">Looking up current holder\u2026</p>';
  try {
    const owner = await ownerOf(parsed.chain, parsed.contract, parsed.tokenId);
    if (seq !== window.__nftLook) return;
    if (who) who.value = owner;
    renderMatches(owner);
    box.innerHTML = '<div class="match on" role="status"><div class="match-face"><div class="ph">0x</div></div><div><strong>' + shortAddr(owner) + "</strong><span>Current holder \u00b7 ready to tip</span></div></div>";
    setStatus("Holder found. Confirm this wallet.", "ok");
    openConfirm({ name: "NFT holder", handle: "", address: owner });
  } catch (err) {
    if (seq !== window.__nftLook) return;
    nftMiss(err && err.message ? err.message : "Could not read owner.");
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
/* Connect tap belongs to connect.js wallet sheet \u2014 do not inject here. */
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
(function bindNftField() {
  const field = $("nft");
  if (!field) return;
  let t = 0;
  function run() {
    window.clearTimeout(t);
    lookupNft(field.value);
  }
  field.addEventListener("input", function () {
    window.clearTimeout(t);
    t = window.setTimeout(run, 420);
  });
  field.addEventListener("change", run);
  field.addEventListener("paste", function () { window.setTimeout(run, 0); });
  field.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); run(); }
  });
  const go = $("nftGo");
  if (go) go.addEventListener("click", run);
})();
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
syncSendBtn();
if (who) {
  writePrompt();
}
