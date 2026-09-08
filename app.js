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
  if (/opensea\.io/i.test(t)) return { kind: "unknown", hint: "Need the item page \u2014 collection or profile links have no holder." };
  return { kind: "unknown", hint: "Need an OpenSea item link or contract / token id." };
}
