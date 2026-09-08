const ARTISTS = [
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
  ["Cozomo de Medici", "CozomoMedici"],
  ["Sewer", "sewerart"],
  ["OSF", "osf_nft"],
  ["aeforia", "aeforia"],
  ["Kidmograph", "kidmograph"],
  ["Seerlight", "seerlight"],
  ["Sartoshi", "sartoshi_nft"],
  ["Matt Kane", "mattkane"],
  ["Rafaël Rozendaal", "newrafael"],
  ["Mario Klingemann", "quasimondo"],
  ["Robbie Barrat", "robbiebarrat"],
  ["Anna Ridler", "annaridler"],
  ["Memo Akten", "memotv"],
  ["Sougwen Chung", "sougwen"],
  ["Zach Lieberman", "zachlieberman"],
  ["Lauren Lee McCarthy", "laurmccarthy"],
  ["Kim Asendorf", "kimasendorf"],
  ["Leander Herzog", "leanderherzog"],
  ["Harm van den Dorpel", "harmvandendorpel"],
  ["Jonas Lund", "jonaslund"],
  ["Kevin Abosch", "kevinabosch"],
  ["Alotta Money", "AlottaMoney"],
  ["Giant Swan", "giantswan"],
  ["Vinnie Hager", "vinniehager"],
  ["Victor Mosquera", "victormosquera"],
  ["Chad Knight", "chadknight"],
  ["Vincent Schwenk", "vincentschwenk"],
  ["Maya Man", "mayaontheinternet"],
  ["Everest Pipkin", "everestpipkin"],
  ["Ian Cheng", "iancheng"],
  ["Auriea Harvey", "auriea"],
  ["Morehshin Allahyari", "morehshin"],
  ["teamLab", "teamLab_net"],
  ["Quayola", "quayola"],
  ["David OReilly", "davidoreilly"],
  ["Caleb Wood", "calebwood"],
  ["Ivona Tau", "ivonatau"],
  ["Felipe Pantone", "felipepantone"],
  ["Zach Gage", "zachgage"],
  ["Bennett Foddy", "bennettfoddy"],
  ["Lu Yang", "luyangart"],
  ["Rafael Lozano-Hemmer", "lozanohemmer"],
  ["Golan Levin", "golan"],
  ["John Provencher", "jfsiii"],
  ["ThankYouX", "thankyoux"],
  ["Sam Spratt", "samspratt"],
  ["Krista Kim", "kristakimstudio"],
  ["Iskra Velitchkova", "IskraVelitchkova"],
  ["Eko33", "eko33"],
  ["Licia He", "LiciaHe"],
  ["Anna Lucia", "annalucia"],
  ["Serwah Attafuah", "SerwahAttafuah"],
  ["Linda Dounia", "LindaDounia"],
  ["Huntrezz Janos", "huntrezz"],
  ["Deeze", "deezeFi"],
  ["Pranksy", "pranksy"],
  ["GaryVee", "garyvee"],
  ["Steve Aoki", "steveaoki"],
  ["3LAU", "3LAU"],
  ["Zeneca", "zeneca_33"],
  ["GMoney", "gmoneyNFT"],
  ["Farokh", "farokh"],
  ["Dingaling", "dingalingts"],
  ["Vincent Van Dough", "vincentvandough"],
  ["Punk4156", "punk4156"],
  ["Chris Torres", "ChrisTorresArt"],
  ["BossLogic", "Bosslogic"],
  ["Shepard Fairey", "OBEYGIANT"],
  ["Damien Hirst", "damienhirst"],
  ["Tom Sachs", "Tomsachs"],
  ["Art Blocks", "artblocks_io"],
  ["Bright Moments", "BrightMoments"],
  ["fxhash", "fx_hash"],
  ["Feral File", "feralfile"],
  ["Manifold", "manifoldxyz"],
  ["Async Art", "async_art"],
  ["SuperRare", "SuperRare"],
  ["Foundation", "foundation"],
  ["Zora", "ourzora"],
  ["Nifty Gateway", "niftygateway"],
  ["KnownOrigin", "knownorigin"],
  ["MakersPlace", "MakersPlace"],
  ["Azuki", "AzukiOfficial"],
  ["Pudgy Penguins", "pudgypenguins"],
  ["BAYC", "BoredApeYC"],
  ["CryptoPunks", "cryptopunksnfts"],
  ["DeGods", "DeGodsNFT"],
  ["Mad Lads", "MadLadsNFT"],
  ["NodeMonkes", "NodeMonkes"],
  ["Milady", "MiladyMaker"],
  ["Remilia", "remiliaofficial"],
  ["mfers", "mfers"],
  ["Goblintown", "goblintownnft"],
  ["Nouns", "nounsdao"],
  ["Doodles", "doodles"],
  ["Moonbirds", "moonbirds"],
  ["PROOF", "PROOF_XYZ"],
  ["CloneX", "CloneX"],
  ["RTFKT", "RTFKT"],
  ["Cool Cats", "coolcatsnft"],
  ["World of Women", "worldofwomennft"],
  ["VeeFriends", "veefriends"],
  ["Loot", "lootproject"],
  ["Meebits", "MeebitsDAO"],
  ["Otherdeed", "OthersideMeta"],
  ["Cryptoadz", "cryptoadzNFT"],
  ["Blitmap", "blitmap"],
  ["Avastars", "avastars_nft"],
  ["Hashmasks", "Hashmasks"],
  ["Terraforms", "mathcastles"],
  ["Entangled Others", "entangledothers"],
  ["Untold Garden", "untoldgarden"],
  ["nft_art", "nft_art"]
];

const COLLECTION_HANDLE = {
  "Pudgy Penguins": "pudgypenguins",
  "Bored Ape Yacht Club": "BoredApeYC",
  "CryptoPunks": "cryptopunksnfts",
  "Milady Maker": "MiladyMaker",
  "Mutant Ape Yacht Club": "BoredApeYC",
  "Moonbirds": "moonbirds",
  "Azuki": "AzukiOfficial",
  "CloneX": "CloneX",
  "Doodles": "doodles",
  "Nouns": "nounsdao",
  "DeGods": "DeGodsNFT",
  "Pudgy Rods": "pudgypenguins",
  "Lil Pudgys": "pudgypenguins",
  "Art Blocks": "artblocks_io",
  "Chromie Squiggle": "Snowfro",
  "Fidenza": "tylerxhobbs",
  "Ringers": "dmitricherniak",
  "Checks": "jackbutcher",
  "Otherdeed": "OthersideMeta",
  "Meebits": "MeebitsDAO",
  "Autoglyphs": "larvalabs",
  "Cryptoadz": "cryptoadzNFT",
  "World of Women": "worldofwomennft",
  "Cool Cats": "coolcatsnft",
  "VeeFriends": "veefriends",
  "Loot": "lootproject",
  "Goblintown": "goblintownnft",
  "mfers": "mfers",
  "Remilia": "remiliaofficial"
};

function uniqueArtists() {
  var seen = {};
  var out = [];
  ARTISTS.forEach(function (row) {
    var handle = String(row[1] || "");
    var k = handle.toLowerCase();
    if (!k || seen[k]) return;
    seen[k] = 1;
    out.push({
      name: row[0],
      handle: handle,
      img: "https://unavatar.io/twitter/" + encodeURIComponent(handle) + "?fallback=false"
    });
  });
  return out;
}

function slimCollections(rows) {
  var seen = {};
  var out = [];
  rows.forEach(function (row) {
    if (out.length >= 200) return;
    var name = String((row && row.name) || "").trim();
    var img = String((row && row.image) || "").trim();
    if (!name || !img) return;
    if (/wrapped|v1 \(/i.test(name)) return;
    var key = name.toLowerCase();
    if (seen[key]) return;
    seen[key] = 1;
    var handle = COLLECTION_HANDLE[name];
    if (!handle) {
      handle = String(row.symbol || name).replace(/[^a-zA-Z0-9_]/g, "").slice(0, 24) || "collection";
    }
    out.push({ name: name, handle: handle, img: img });
  });
  return out;
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=86400");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  var artists = uniqueArtists();
  var collections = [];
  try {
    var r = await fetch("https://nft.llama.fi/collections", {
      headers: { accept: "application/json" }
    });
    if (r.ok) collections = slimCollections(await r.json());
  } catch (err) {
    collections = [];
  }
  res.status(200).json({
    artists: artists,
    collections: collections,
    note: "Culture map only. Not affiliated. Images loaded from source CDNs, not stored."
  });
};
