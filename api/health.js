const DATA = require("../catalog.json");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Allow", "GET, HEAD, OPTIONS");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method === "HEAD") {
    res.status(200).end();
    return;
  }
  if (req.method !== "GET") {
    res.status(405).end("method not allowed");
    return;
  }
  const artists = Array.isArray(DATA.artists) ? DATA.artists.length : 0;
  const collections = Array.isArray(DATA.collections) ? DATA.collections.length : 0;
  res.status(200).json({
    ok: artists > 0 && collections > 0,
    catalogHttp: 200,
    catalog: "https://art-rewards.vercel.app/catalog.json",
    catalogApi: "https://art-rewards.vercel.app/api/catalog",
    catalogArtists: artists,
    catalogCollections: collections,
    contract: "",
    lookalike: "ScanHood ticker ART at 0xa5bc127b167bD5B89E161838799B1bDdfD0697c4 is Robinhood ART, not this token.",
    note: "Static catalog.json plus /api/catalog. Contract empty until the human pastes a 0x. Do not paste the ScanHood lookalike.",
  });
};
