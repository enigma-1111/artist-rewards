(function () {
  var COL = {
    CryptoPunks: "https://www.larvalabs.com/public/images/cryptopunks/punk5822.png",
    Fidenza: "https://artblocks-mainnet.s3.amazonaws.com/78000027.png",
    "Chromie Squiggle": "https://artblocks-mainnet.s3.amazonaws.com/0.png",
    "Art Blocks": "https://avatars.githubusercontent.com/u/78487324?s=256"
  };
  function unavatar(h) {
    return "https://unavatar.io/twitter/" + encodeURIComponent(h) + "?fallback=false";
  }
  function showPh(img) {
    img.style.display = "none";
    var ph = img.nextElementSibling;
    if (ph) ph.style.display = "grid";
  }
  document.querySelectorAll(".face img").forEach(function (img) {
    var handle = (img.parentNode && img.parentNode.dataset.handle) || "";
    img.onerror = function () { showPh(img); };
    if (handle) img.src = unavatar(handle);
  });
  document.querySelectorAll(".tile").forEach(function (el) {
    var img = el.querySelector("img");
    if (!img) return;
    var name = el.dataset.name || (el.querySelector("strong") && el.querySelector("strong").textContent) || img.alt;
    var src = COL[name];
    img.onerror = function () { showPh(img); };
    if (src) img.src = src;
    else showPh(img);
  });
})();
