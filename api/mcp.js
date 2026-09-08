const PROTOCOL = "2025-03-26";
const SITE = "https://art-rewards.vercel.app";
const LOOKALIKE =
  "0xa5bc127b167bD5B89E161838799B1bDdfD0697c4".toLowerCase();

const STATUS = {
  name: "Artist Rewards Token",
  ticker: "ART",
  site: SITE,
  profile: SITE + "/profile.html",
  catalog: SITE + "/catalog.json",
  github: "https://github.com/enigma-1111/artist-rewards",
  x: "nft_art",
  contract: "",
  pair: "WETH",
  payout: "Both",
  feesToHolders: true,
  purpose:
    "Tip a handle with ART. Culture map only — not affiliated with any listed artist or collection. Holders earn trading fees in ART and WETH.",
  bankr: "@bankrbot send 500 ART to @handle on robinhood chain",
  mcp: SITE + "/api/mcp",
  mcpAlt: SITE + "/mcp",
  agent: SITE + "/agent.json",
  pages: ["/", "/profile.html"],
  affiliation: "none",
  note: "Human launches on pools.fun and pastes the 0x. Contract stays empty until then.",
  lookalike:
    "ScanHood ticker ART at 0xa5bc127b167bD5B89E161838799B1bDdfD0697c4 is a different token named Robinhood ART. Do not paste that 0x.",
};

async function liveCatalog() {
  try {
    const r = await fetch(SITE + "/catalog.json", { cache: "no-store" });
    if (!r.ok) return null;
    const d = await r.json();
    const artists = Array.isArray(d.artists) ? d.artists : [];
    const collections = Array.isArray(d.collections) ? d.collections : [];
    return { artists, collections, note: d.note || "" };
  } catch (err) {
    return null;
  }
}

function catalogRows(list) {
  return (list || [])
    .filter((row) => row && (row.handle || row.name))
    .map((row) => ({
      name: row.name || row.handle,
      handle: String(row.handle || "").replace(/^@/, ""),
      still: row.img || row.image_url || "",
      source: "catalog",
    }));
}
