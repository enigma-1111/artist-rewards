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
  catalogApi: SITE + "/api/catalog",
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
  const urls = [SITE + "/catalog.json", SITE + "/api/catalog"];
  for (const url of urls) {
    try {
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) continue;
      const d = await r.json();
      const artists = Array.isArray(d.artists) ? d.artists : [];
      const collections = Array.isArray(d.collections) ? d.collections : [];
      return {
        artists,
        collections,
        note: d.note || "",
        catalogHttp: r.status,
        catalogUrl: url,
      };
    } catch (err) {
      continue;
    }
  }
  return null;
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

const FACES = {
  cryptopunksnfts: "cdn",
  larvalabs: "cdn",
  artblocks_io: "local",
  Snowfro: "local",
  tylerxhobbs: "local",
  beeple: "local",
  muratpak: "local",
  XCOPYART: "local",
  fewocious: "local",
  refikanadol: "pbs",
  punk6529: "local",
  jackbutcher: "local",
  yugalabs: "local",
  sofiacrespo: "local",
  hackatao: "local",
  ClaireSilver12: "local",
  grantyun: "local",
  BoredApeYC: "pbs",
  pudgypenguins: "pbs",
  AzukiOfficial: "pbs",
  nft_art: "local",
  mad_dog_jones: "local",
  deekaymotion: "local",
  frankdegods: "local",
  LucaNetz: "local",
  TakashiMurakami: "local",
  zancan: "local",
  williammapan: "local",
  emilyxie_: "local",
  monicarizzolli: "local",
  dmitricherniak: "local",
  dhof: "local",
  justinaversano: "local",
  coldie: "local",
  RobnessOfficial: "local",
  ixshells: "local",
  slimesunday: "local",
  JosieBellini: "local",
  thesarahzucker: "local",
  fvckrender: "local",
  androidjones: "local",
  blakekathryn: "local",
  osinachiart: "local",
  REAS: "local",
  mattdesl: "local",
  bottoproject: "local",
  hollyherndon: "local",
  andresreisinger: "local",
  danielarsham: "local",
  kaws: "local",
  gmunk: "local",
  MissALSimpson: "local",
  artnome: "local",
  shantell_martin: "local",
  jamesjeanart: "local",
  loish: "local",
  AmberVittoria: "local",
  trevorjonesart: "local",
  piterpasma: "local",
  manoloide: "local",
  kjetilgolid: "local",
  HelenaSarin: "local",
  CharlotteFang77: "local",
  pplpleasr1: "local",
  "0xDesigner": "local",
  CozomoMedici: "local",
  kidmograph: "local",
  gremplin: "local",
  sewerart: "local",
  osf_nft: "local",
  aeforia: "local",
  seerlight: "local",
  jeffdavis: "local",
};

const ARTISTS = [
  ["nft_art", "nft_art"],
  ["Beeple", "beeple"],
  ["Pak", "muratpak"],
  ["XCOPY", "XCOPYART"],
  ["FEWOCiOUS", "fewocious"],
  ["Refik Anadol", "refikanadol"],
  ["Tyler Hobbs", "tylerxhobbs"],
  ["Snowfro", "Snowfro"],
  ["Claire Silver", "ClaireSilver12"],
  ["Sofia Crespo", "sofiacrespo"],
  ["Grant Yun", "grantyun"],
  ["Hackatao", "hackatao"],
  ["Mad Dog Jones", "mad_dog_jones"],
  ["DeeKay", "deekaymotion"],
  ["Jack Butcher", "jackbutcher"],
  ["6529", "punk6529"],
  ["Frank", "frankdegods"],
  ["Luca Netz", "LucaNetz"],
  ["Takashi Murakami", "TakashiMurakami"],
  ["Zancan", "zancan"],
  ["William Mapan", "williammapan"],
  ["Emily Xie", "emilyxie_"],
  ["Monica Rizzolli", "monicarizzolli"],
  ["Dmitri Cherniak", "dmitricherniak"],
  ["Larva Labs", "larvalabs"],
  ["Dom Hofmann", "dhof"],
  ["Justin Aversano", "justinaversano"],
  ["Coldie", "coldie"],
  ["ROBNESS", "RobnessOfficial"],
  ["IX Shells", "ixshells"],
  ["Slimesunday", "slimesunday"],
  ["Josie Bellini", "JosieBellini"],
  ["Sarah Zucker", "thesarahzucker"],
  ["Fvckrender", "fvckrender"],
  ["Android Jones", "androidjones"],
  ["Blake Kathryn", "blakekathryn"],
  ["Osinachi", "osinachiart"],
  ["Casey Reas", "REAS"],
  ["Matt DesLauriers", "mattdesl"],
  ["Botto", "bottoproject"],
  ["Holly Herndon", "hollyherndon"],
  ["Andrés Reisinger", "andresreisinger"],
  ["Daniel Arsham", "danielarsham"],
  ["KAWS", "kaws"],
  ["GMUNK", "gmunk"],
  ["AL Simpson", "MissALSimpson"],
  ["Artnome", "artnome"],
  ["Shantell Martin", "shantell_martin"],
  ["James Jean", "jamesjeanart"],
  ["Loish", "loish"],
  ["Amber Vittoria", "AmberVittoria"],
  ["Trevor Jones", "trevorjonesart"],
  ["piter pasma", "piterpasma"],
  ["manoloide", "manoloide"],
  ["Kjetil Golid", "kjetilgolid"],
  ["Jeff Davis", "jeffdavis"],
  ["Helena Sarin", "HelenaSarin"],
  ["Charlotte Fang", "CharlotteFang77"],
  ["gremplin", "gremplin"],
  ["Yuga Labs", "yugalabs"],
  ["pplpleasr", "pplpleasr1"],
  ["0xDesigner", "0xDesigner"],
  ["Cozomo", "CozomoMedici"],
  ["Sewer", "sewerart"],
  ["OSF", "osf_nft"],
  ["aeforia", "aeforia"],
  ["Kidmograph", "kidmograph"],
  ["Seerlight", "seerlight"],
];

const COLLECTIONS = [
  { name: "CryptoPunks", handle: "cryptopunksnfts", url: "https://opensea.io/collection/cryptopunks" },
  { name: "Fidenza", handle: "tylerxhobbs", url: "https://www.tylerxhobbs.com/works/series/fidenza" },
  { name: "XCOPY", handle: "XCOPYART", url: "https://xcopy.art" },
  { name: "Bored Ape Yacht Club", handle: "BoredApeYC", url: "https://opensea.io/collection/boredapeyachtclub" },
  { name: "Pudgy Penguins", handle: "pudgypenguins", url: "https://opensea.io/collection/pudgypenguins" },
  { name: "Art Blocks", handle: "artblocks_io", url: "https://www.artblocks.io" },
  { name: "Chromie Squiggle", handle: "Snowfro", url: "https://www.artblocks.io/collection/chromie-squiggle-by-snowfro" },
  { name: "Azuki", handle: "AzukiOfficial", url: "https://opensea.io/collection/azuki" },
  { name: "DeGods", handle: "DeGodsNFT", url: "https://opensea.io/collection/degods" },
  { name: "Mad Lads", handle: "MadLadsNFT", url: "https://www.tensor.trade/trade/mad_lads" },
  { name: "Checks", handle: "jackbutcher", url: "https://opensea.io/collection/vv-checks" },
  { name: "NodeMonkes", handle: "NodeMonkes", url: "https://magiceden.io/ordinals/marketplace/nodemonkes" },
];

function rows() {
  const seen = {};
  return ARTISTS.filter(([name, handle]) => {
    const k = handle.toLowerCase();
    if (seen[k]) return false;
    seen[k] = 1;
    return true;
  }).map(([name, handle]) => ({
    name,
    handle,
    face: FACES[handle] || "initials",
  }));
}

function isAddr(s) {
  return /^0x[a-fA-F0-9]{40}$/.test(String(s || ""));
}

const BLOCKED_HANDLES = {
  "": 1,
  artist: 1,
  yourhandle: 1,
  handle: 1,
  user: 1,
  name: 1,
};

function cleanHandle(s) {
  return String(s || "")
    .trim()
    .replace(/^@/, "")
    .replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//i, "")
    .replace(/\/.*$/, "")
    .trim();
}

function isBlockedHandle(h) {
  return !!BLOCKED_HANDLES[String(h || "").toLowerCase()];
}

function amountChip(raw) {
  const s = String(raw || "500 ART").trim();
  if (/^\$/.test(s) || /\bof\s+ART\b/i.test(s)) {
    const n = s.replace(/,/g, "").match(/([0-9]+(?:\.[0-9]+)?)/);
    return "$" + (n ? n[1] : "5") + " of ART";
  }
  const n = s.replace(/,/g, "").match(/([0-9]+(?:\.[0-9]+)?)/);
  return (n ? n[1] : "500") + " ART";
}

function bankr(handle, amount) {
  const h = cleanHandle(handle);
  const amt = amountChip(amount);
  return "@bankrbot send " + amt + " to @" + h + " on robinhood chain";
}

function matchQ(list, q) {
  const needle = String(q || "")
    .trim()
    .replace(/^@/, "")
    .toLowerCase();
  if (!needle) return list;
  return list.filter((row) => {
    const name = String(row.name || "").toLowerCase();
    const handle = String(row.handle || "").toLowerCase();
    return name.indexOf(needle) !== -1 || handle.indexOf(needle) !== -1;
  });
}

async function resolveCatalogHit(query) {
  const q = cleanHandle(query);
  if (!q || isBlockedHandle(q)) return null;
  const cat = await liveCatalog();
  if (!cat) return null;
  const pool = catalogRows(cat.artists).concat(catalogRows(cat.collections));
  const low = q.toLowerCase();
  return (
    pool.find((r) => r.handle.toLowerCase() === low) ||
    pool.find((r) => String(r.name || "").toLowerCase() === low) ||
    pool.find((r) => r.handle.toLowerCase().indexOf(low) !== -1 || String(r.name || "").toLowerCase().indexOf(low) !== -1) ||
    null
  );
}

const TOOLS = [
  {
    name: "get_art_status",
    description:
      "Live Artist Rewards Token status. Contract is empty until the human pastes a 0x. Do not invent one.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "list_artists",
    description:
      "Culture-map artists from live catalog.json. Optional q filters name or handle. face=pbs|cdn|local|initials is the legacy face-map only.",
    inputSchema: {
      type: "object",
      properties: {
        q: { type: "string", description: "Filter by name or @handle" },
        face: { type: "string", enum: ["all", "pbs", "cdn", "local", "initials"], default: "all" },
      },
    },
  },
  {
    name: "list_initials",
    description: "Artists still on painted initials. Use this for the daily face improve slice.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "list_collections",
    description: "Culture-map collections from live catalog.json. Optional q filters name or handle. Not affiliated.",
    inputSchema: {
      type: "object",
      properties: {
        q: { type: "string", description: "Filter by name or @handle" },
      },
    },
  },
  {
    name: "build_bankr_prompt",
    description:
      "Build the Bankr copy-paste tip prompt. Refuses leftover @artist / @yourhandle. Amount chips: 100 ART, 500 ART, 1000 ART, $5 of ART.",
    inputSchema: {
      type: "object",
      properties: {
        handle: { type: "string", description: "X handle or catalog name. Not @artist." },
        amount: { type: "string", description: "e.g. 500 ART or $5 of ART" },
      },
      required: ["handle"],
    },
  },
  {
    name: "validate_contract",
    description:
      "Check a human-pasted 0x. Refuses empty or invented addresses. Flags the known ScanHood lookalike named Robinhood ART.",
    inputSchema: {
      type: "object",
      properties: { address: { type: "string" } },
      required: ["address"],
    },
  },
  {
    name: "parse_nft_tip",
    description: "Parse an OpenSea item URL or contract/tokenId pair. Does not claim ownership.",
    inputSchema: {
      type: "object",
      properties: { input: { type: "string" } },
      required: ["input"],
    },
  },
];

async function callTool(name, args) {
  args = args || {};
  if (name === "get_art_status") {
    const cat = await liveCatalog();
    return {
      ...STATUS,
      contract: "",
      catalogArtists: cat ? cat.artists.length : null,
      catalogCollections: cat ? cat.collections.length : null,
      catalogHttp: cat ? cat.catalogHttp : 0,
      catalogUrl: cat ? cat.catalogUrl : STATUS.catalog,
      catalogOk: !!(cat && cat.artists.length && cat.collections.length),
      faceMap: rows().length,
      lookalikeWarning: STATUS.lookalike,
      tools: TOOLS.map((t) => t.name),
      calls: {
        status: SITE + "/api/mcp?tool=get_art_status",
        artists: SITE + "/api/mcp?tool=list_artists&q=pudgypenguins",
        artistsFace: SITE + "/api/mcp?tool=list_artists&q=beeple",
        bankr: SITE + "/api/mcp?tool=build_bankr_prompt&handle=beeple&amount=500%20ART",
      },
    };
  }
  if (name === "list_artists") {
    const want = args.face || "all";
    const q = args.q || args.query || "";
    if (want === "all") {
      const cat = await liveCatalog();
      if (cat && cat.artists.length) {
        const list = matchQ(catalogRows(cat.artists), q);
        if (list.length || !q) {
          return { count: list.length, artists: list, affiliation: "none", source: "catalog.json", q: q || null };
        }
      }
    }
    const list = matchQ(
      rows().filter((r) => want === "all" || r.face === want),
      q
    );
    return { count: list.length, artists: list, affiliation: "none", source: "face-map", q: q || null };
  }
  if (name === "list_initials") {
    const list = rows().filter((r) => r.face === "initials");
    return { count: list.length, artists: list, note: "Legacy face-map. Live grids use catalog.json stills." };
  }
  if (name === "list_collections") {
    const q = args.q || args.query || "";
    const cat = await liveCatalog();
    if (cat && cat.collections.length) {
      const list = matchQ(catalogRows(cat.collections), q);
      return { count: list.length, collections: list, affiliation: "none", source: "catalog.json", q: q || null };
    }
    return {
      count: COLLECTIONS.length,
      collections: matchQ(COLLECTIONS, q),
      affiliation: "none",
      source: "fallback",
      q: q || null,
    };
  }
  if (name === "build_bankr_prompt") {
    let handle = cleanHandle(args.handle);
    const amount = amountChip(args.amount);
    if (isBlockedHandle(handle)) {
      return {
        ok: false,
        reason: "placeholder-handle",
        hint: "Pass a real @handle. Will not copy leftover @artist or @yourhandle.",
        handle: handle || "",
        amount,
      };
    }
    const hit = await resolveCatalogHit(handle);
    if (hit) handle = hit.handle;
    return {
      ok: true,
      prompt: bankr(handle, amount),
      handle,
      amount,
      matched: hit ? { name: hit.name, handle: hit.handle } : null,
      affiliation: "none",
    };
  }
  if (name === "validate_contract") {
    const address = String(args.address || "").trim();
    if (!address) {
      return { ok: false, reason: "empty", hint: "Wait for the human to paste a 0x." };
    }
    if (!isAddr(address)) {
      return { ok: false, reason: "not-an-address" };
    }
    if (address.toLowerCase() === LOOKALIKE) {
      return {
        ok: false,
        reason: "lookalike",
        hint: "This 0x is ScanHood token Robinhood ART, not Artist Rewards Token.",
      };
    }
    return {
      ok: true,
      address: address.toLowerCase(),
      hint: "Looks like a 0x. Human must still confirm this is the pools.fun launch before writing CONFIG.contract.",
    };
  }
  if (name === "parse_nft_tip") {
    const raw = String(args.input || "").trim();
    const path = raw.split(/[?#]/)[0];
    const itemChain = path.match(/opensea\.io\/(?:assets|item)\/([^/]+)\/(0x[a-fA-F0-9]{40})\/(\d+|0x[a-fA-F0-9]+)/i);
    if (itemChain) {
      const hit = {
        kind: "item",
        chain: itemChain[1],
        contract: itemChain[2],
        tokenId: itemChain[3],
      };
      if (String(hit.contract).toLowerCase() === LOOKALIKE) {
        hit.lookalike = true;
        hit.hint = "This contract is ScanHood token Robinhood ART, not Artist Rewards.";
      }
      return hit;
    }
    const itemLegacy = path.match(/opensea\.io\/(?:assets|item)\/(0x[a-fA-F0-9]{40})\/(\d+|0x[a-fA-F0-9]+)/i);
    if (itemLegacy) {
      return { kind: "item", chain: "ethereum", contract: itemLegacy[1], tokenId: itemLegacy[2] };
    }
    const pair = raw.match(/(0x[a-fA-F0-9]{40})\s*[/#:, ]+\s*(\d+|0x[a-fA-F0-9]+)/);
    if (pair) {
      return { kind: "pair", contract: pair[1], tokenId: pair[2] };
    }
    const col = path.match(/opensea\.io\/collection\/([a-z0-9._-]+)/i);
    if (col) {
      return { kind: "collection", slug: col[1], hint: "Need a token id to resolve ownerOf." };
    }
    return { kind: "unknown", hint: "Paste an OpenSea item link or contract / token id." };
  }
  return { error: "unknown_tool", name };
}

function result(id, obj) {
  return {
    jsonrpc: "2.0",
    id,
    result: {
      content: [{ type: "text", text: JSON.stringify(obj) }],
      structuredContent: obj,
    },
  };
}

async function handleRpc(msg) {
  if (!msg || typeof msg !== "object") {
    return { jsonrpc: "2.0", id: null, error: { code: -32600, message: "Invalid request" } };
  }
  const { id, method, params } = msg;
  if (method === "initialize") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: PROTOCOL,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "artist-rewards", version: "1.1.0" },
        instructions:
          "Artist Rewards Token $ART tipping site tools. Culture map only. Do not invent a contract. Do not print chain id on the public page. GET /api/mcp?tool=get_art_status also answers.",
      },
    };
  }
  if (method === "notifications/initialized" || method === "initialized") {
    return null;
  }
  if (method === "ping") {
    return { jsonrpc: "2.0", id, result: {} };
  }
  if (method === "tools/list") {
    return { jsonrpc: "2.0", id, result: { tools: TOOLS } };
  }
  if (method === "resources/list") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        resources: [
          { uri: SITE + "/agent.json", name: "agent.json", mimeType: "application/json" },
          { uri: SITE + "/catalog.json", name: "catalog.json", mimeType: "application/json" },
          { uri: SITE + "/", name: "tip", mimeType: "text/html" },
          { uri: SITE + "/profile.html", name: "profile", mimeType: "text/html" },
        ],
      },
    };
  }
  if (method === "tools/call") {
    const name = params && params.name;
    const args = (params && params.arguments) || {};
    try {
      return result(id, await callTool(name, args));
    } catch (err) {
      return {
        jsonrpc: "2.0",
        id,
        error: { code: -32000, message: String(err && err.message ? err.message : err) },
      };
    }
  }
  if (id === undefined) return null;
  return { jsonrpc: "2.0", id, error: { code: -32601, message: "Method not found" } };
}

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "content-type, accept, mcp-session-id, mcp-protocol-version");
  res.setHeader("Access-Control-Expose-Headers", "mcp-session-id");
  res.setHeader("Allow", "GET, HEAD, POST, OPTIONS");
}

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }
  if (req.method === "HEAD") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.end();
  }
  if (req.method === "GET") {
    const url = new URL(req.url || "/api/mcp", SITE);
    const tool = url.searchParams.get("tool");
    if (tool) {
      const args = {};
      url.searchParams.forEach((v, k) => {
        if (k !== "tool") args[k] = v;
      });
      const obj = await callTool(tool, args);
      res.setHeader("Content-Type", "application/json");
      const miss = obj && obj.error === "unknown_tool";
      return res.status(miss ? 404 : 200).json(obj);
    }
    const cat = await liveCatalog();
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({
      name: "artist-rewards",
      mcp: true,
      agent: SITE + "/agent.json",
      tools: TOOLS.map((t) => t.name),
      calls: {
        status: SITE + "/api/mcp?tool=get_art_status",
        artists: SITE + "/api/mcp?tool=list_artists&q=pudgypenguins",
        artistsFace: SITE + "/api/mcp?tool=list_artists&q=beeple",
        bankr: SITE + "/api/mcp?tool=build_bankr_prompt&handle=beeple&amount=500%20ART",
      },
      status: {
        ...STATUS,
        contract: "",
        catalogArtists: cat ? cat.artists.length : null,
        catalogCollections: cat ? cat.collections.length : null,
        catalogHttp: cat ? cat.catalogHttp : 0,
        catalogUrl: cat ? cat.catalogUrl : STATUS.catalog,
        catalogOk: !!(cat && cat.artists.length && cat.collections.length),
      },
    });
  }
  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end("method not allowed");
  }
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (err) {
      body = null;
    }
  }
  const messages = Array.isArray(body) ? body : [body];
  const out = [];
  for (const msg of messages) {
    const reply = await handleRpc(msg);
    if (reply) out.push(reply);
  }
  res.setHeader("Content-Type", "application/json");
  if (out.length === 0) {
    res.statusCode = 202;
    return res.end();
  }
  return res.status(200).json(out.length === 1 ? out[0] : out);
};
