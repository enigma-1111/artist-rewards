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
async function ownerOf(chain, contract, tokenId) {
  const rpc = (typeof RPCS !== "undefined" && RPCS[chain]) ? RPCS[chain] : "https://ethereum.publicnode.com";
  let idHex;
  try { idHex = BigInt(tokenId).toString(16).padStart(64, "0"); }
  catch (e) { throw new Error("Token id is not a number."); }
  const res = await fetch(rpc, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to: contract, data: "0x6352211e" + idHex }, "latest"] })
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
  if (!text) { box.innerHTML = ""; return; }
  const parsed = parseNft(text);
  if (!parsed || parsed.kind === "unknown") {
    nftMiss((parsed && parsed.hint) || "Need an OpenSea item link or contract / token id.");
    return;
  }
  if (parsed.kind === "collection") {
    nftMiss("That's a collection page. Paste one item (.../assets/.../token id) to find the holder.");
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
const RPCS = {
  ethereum: "https://ethereum.publicnode.com",
  eth: "https://ethereum.publicnode.com",
  base: "https://mainnet.base.org",
  polygon: "https://polygon-bor-rpc.publicnode.com",
  matic: "https://polygon-bor-rpc.publicnode.com",
  arbitrum: "https://arbitrum-one-rpc.publicnode.com",
  optimism: "https://optimism-rpc.publicnode.com"
};
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
const PROFILE_KEY = "art.profile.v1";
function loadProfile() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}"); } catch (e) { return {}; }
}
function saveProfile(p) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
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
if (typeof paintRecv === "function") paintRecv();
if (typeof syncSendBtn === "function") syncSendBtn();
