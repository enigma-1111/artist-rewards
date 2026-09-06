const CONFIG = {
  name: "Artist Rewards Token",
  ticker: "ART",
  contract: "",
  x: "nft_art",
  pair: "WETH",
  payout: "Both",
  chainId: 4663
};

const ARTISTS = [
  { name: "nft_art", handle: "nft_art", chain: "RH 4663" },
  { name: "Beeple", handle: "beeple", chain: "ETH" },
  { name: "Pak", handle: "muratpak", chain: "ETH" },
  { name: "XCOPY", handle: "XCOPYART", chain: "ETH" },
  { name: "FEWOCiOUS", handle: "fewocious", chain: "ETH" },
  { name: "Refik Anadol", handle: "refikanadol", chain: "ETH" },
  { name: "Tyler Hobbs", handle: "tylerxhobbs", chain: "ETH" },
  { name: "Snowfro", handle: "Snowfro", chain: "ETH" },
  { name: "Claire Silver", handle: "ClaireSilver12", chain: "ETH" },
  { name: "Sofia Crespo", handle: "sofiacrespo", chain: "ETH" },
  { name: "Grant Yun", handle: "grantyun", chain: "ETH" },
  { name: "Hackatao", handle: "hackatao", chain: "ETH" },
  { name: "Mad Dog Jones", handle: "mad_dog_jones", chain: "ETH" },
  { name: "DeeKay", handle: "deekaymotion", chain: "ETH" },
  { name: "Jack Butcher", handle: "jackbutcher", chain: "ETH" },
  { name: "6529", handle: "punk6529", chain: "ETH" },
  { name: "Frank", handle: "frankdegods", chain: "SOL / ETH" },
  { name: "Luca Netz", handle: "LucaNetz", chain: "ETH / Abstract" },
  { name: "Takashi Murakami", handle: "TakashiMurakami", chain: "ETH" },
  { name: "Zancan", handle: "zancan", chain: "ETH" }
];

const PALETTE = [
  ["#e23d28", "#3d6bff"],
  ["#e6ff63", "#1a100e"],
  ["#f0a58e", "#6b3cff"],
  ["#3d6bff", "#e23d28"],
  ["#f3ead7", "#8b1e3f"],
  ["#6b3cff", "#e6ff63"]
];

const COLLECTIONS = [
  { name: "CryptoPunks", chain: "ETH", url: "https://opensea.io/collection/cryptopunks" },
  { name: "Fidenza", chain: "ETH · Art Blocks", url: "https://opensea.io/collection/fidenza-by-tyler-hobbs" },
  { name: "XCOPY", chain: "ETH", url: "https://opensea.io/XCOPYART" },
  { name: "Bored Ape Yacht Club", chain: "ETH", url: "https://opensea.io/collection/boredapeyachtclub" },
  { name: "Pudgy Penguins", chain: "ETH", url: "https://opensea.io/collection/pudgypenguins" },
  { name: "Art Blocks", chain: "ETH", url: "https://opensea.io/collection/art-blocks" },
  { name: "Chromie Squiggle", chain: "ETH", url: "https://opensea.io/collection/chromie-squiggle-by-snowfro" },
  { name: "Azuki", chain: "ETH", url: "https://opensea.io/collection/azuki" },
  { name: "DeGods", chain: "SOL / ETH", url: "https://opensea.io/collection/degods" },
  { name: "Mad Lads", chain: "SOL", url: "https://www.tensor.trade/trade/mad_lads" },
  { name: "Checks", chain: "ETH", url: "https://opensea.io/collection/vv-checks" },
  { name: "NodeMonkes", chain: "BTC", url: "https://magiceden.io/ordinals/marketplace/nodemonkes" }
];

const $ = (id) => document.getElementById(id);
const who = $("who");
const amt = $("amt");
const promptEl = $("prompt");
const matchesEl = $("matches");
const statusEl = $("status");
let picked = { kind: "x", handle: "artist", address: "", label: "artist" };

function explorerToken() {
  return CONFIG.contract ? "https://explorer.robinhood.com/token/" + CONFIG.contract : "";
}
function poolsToken() {
  return CONFIG.contract ? "https://pools.fun/token/" + CONFIG.contract : "";
}

function paintToken() {
  const line = $("tokenLine");
  const links = $("tokenLinks");
  if (!CONFIG.contract) {
    line.textContent = "No contract yet. You launch on pools.fun. Then send the 0x and it goes here.";
    links.innerHTML = '<a href="https://pools.fun/?tab=top" target="_blank" rel="noreferrer">Open pools.fun</a>';
    return;
  }
  line.innerHTML = CONFIG.ticker + " · <span class='ok'>" + CONFIG.contract + "</span>";
  links.innerHTML =
    '<a href="' + poolsToken() + '" target="_blank" rel="noreferrer">Trade / claim on pools.fun</a>' +
    '<a href="' + explorerToken() + '" target="_blank" rel="noreferrer">Explorer</a>';
}

function extractHandle(s) {
  const t = s.trim();
  const x = t.match(/(?:x\.com|twitter\.com)\/@?([A-Za-z0-9_]{1,15})/i);
  if (x) return x[1];
  const at = t.match(/^@?([A-Za-z0-9_]{1,15})$/);
  if (at) return at[1];
  return "";
}
function extractOpensea(s) {
  const t = s.trim();
  const m = t.match(/opensea\.io\/(?:os\/)?([A-Za-z0-9._-]+)/i);
  if (!m) return "";
  const slug = m[1];
  if (["assets", "collection", "collections", "rankings", "activity"].includes(slug.toLowerCase())) return "";
  return slug;
}
function extractAddr(s) {
  const m = s.trim().match(/0x[a-fA-F0-9]{40}/);
  return m ? m[0] : "";
}

function cardHTML(id, title, sub, extra) {
  const ph = (title || "?").replace("@", "").slice(0, 2).toUpperCase();
  return (
    '<div class="match" data-id="' + id + '">' +
      '<div class="ph">' + ph + "</div>" +
      "<div><strong>" + title + "</strong><span>" + sub + (extra ? " · " + extra : "") + "</span></div>" +
    "</div>"
  );
}

function renderMatches(raw) {
  const addr = extractAddr(raw);
  const handle = extractHandle(raw);
  const os = extractOpensea(raw);
  const cards = [];
  if (addr) {
    cards.push({ id: "addr", kind: "addr", handle: "", address: addr, html: cardHTML("addr", addr.slice(0, 6) + "…" + addr.slice(-4), "Wallet", "0x") });
  }
  if (handle) {
    cards.push({ id: "x", kind: "x", handle: handle, address: "", html: cardHTML("x", "@" + handle, "X profile", "confirm this account") });
  }
  if (os && !os.startsWith("0x")) {
    cards.push({ id: "os", kind: "os", handle: os, address: addr || "", html: cardHTML("os", os, "OpenSea profile", "copy the 0x if you have it") });
  } else if (!addr && !handle && raw.trim().length >= 2) {
    const guess = raw.trim().replace(/^@/, "");
    cards.push({ id: "x", kind: "x", handle: guess, address: "", html: cardHTML("x", "@" + guess, "Treat as X handle", "tap to confirm") });
    cards.push({ id: "os", kind: "os", handle: guess, address: "", html: cardHTML("os", guess, "Treat as OpenSea username", "better to paste the URL") });
  }
  matchesEl.innerHTML = cards.map((c) => c.html).join("");
  window.__cards = cards;
  if (cards[0]) select(cards[0].id);
  else {
    picked = { kind: "x", handle: "artist", address: "", label: "artist" };
    writePrompt();
  }
  matchesEl.querySelectorAll(".match").forEach((el) => {
    el.addEventListener("click", () => select(el.dataset.id));
  });
}

function select(id) {
  const cards = window.__cards || [];
  const c = cards.find((x) => x.id === id) || cards[0];
  if (!c) return;
  picked = c;
  matchesEl.querySelectorAll(".match").forEach((el) => el.classList.toggle("on", el.dataset.id === id));
  writePrompt();
}

function recipient() {
  if (picked.kind === "addr" && picked.address) return picked.address;
  if (picked.handle) return "@" + String(picked.handle).replace(/^@/, "");
  return "@artist";
}

function writePrompt() {
  const amount = (amt.value || "500 ART").trim();
  const line = "@bankrbot send " + amount + " to " + recipient() + " on robinhood chain";
  promptEl.textContent = line;
  return line;
}

function paintRails() {
  $("artists").innerHTML = ARTISTS.map((a, i) => {
    const [c1, c2] = PALETTE[i % PALETTE.length];
    const letters = a.name.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "AR";
    return (
      '<button class="tile" type="button" data-handle="' + a.handle + '">' +
        '<div class="art" style="--a:' + c1 + ';--b:' + c2 + '">' + letters + "</div>" +
        '<div class="meta"><strong>' + a.name + '</strong><small>@' + a.handle + ' · ' + a.chain + '</small></div>' +
      "</button>"
    );
  }).join("");
  $("artists").querySelectorAll(".tile").forEach((el) => {
    el.addEventListener("click", () => {
      who.value = "@" + el.dataset.handle;
      renderMatches(who.value);
      who.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
  $("collections").innerHTML = COLLECTIONS.map((c, i) => {
    const [c1, c2] = PALETTE[(i + 2) % PALETTE.length];
    const letters = c.name.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase();
    return (
      '<a class="tile" href="' + c.url + '" target="_blank" rel="noreferrer">' +
        '<div class="art" style="--a:' + c1 + ';--b:' + c2 + '">' + letters + "</div>" +
        '<div class="meta"><strong>' + c.name + '</strong><small>' + c.chain + '</small></div>' +
      "</a>"
    );
  }).join("");
}

$("chips").addEventListener("click", (e) => {
  const b = e.target.closest(".amt");
  if (!b) return;
  $("chips").querySelectorAll(".amt").forEach((x) => x.classList.remove("on"));
  b.classList.add("on");
  amt.value = b.dataset.v;
  writePrompt();
});
who.addEventListener("input", () => renderMatches(who.value));
amt.addEventListener("input", writePrompt);
$("copy").addEventListener("click", async () => {
  const line = writePrompt();
  try {
    await navigator.clipboard.writeText(line);
    statusEl.textContent = "Copied. Paste into Bankr Terminal or tweet at @bankrbot.";
    statusEl.className = "hint ok";
  } catch {
    statusEl.textContent = "Copy failed — select the prompt and copy it yourself.";
    statusEl.className = "hint warn";
  }
});
$("tweet").addEventListener("click", () => {
  window.open("https://x.com/intent/tweet?text=" + encodeURIComponent(writePrompt()), "_blank", "noopener");
});

paintToken();
paintRails();
renderMatches("");
writePrompt();
