const DATA = require("../catalog.json");
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=600");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
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
  res.status(200).json(DATA);
};
