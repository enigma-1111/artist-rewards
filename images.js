(function () {
  function stamp(h) {
    return "https://cdn.stamp.fyi/avatar/twitter:" + encodeURIComponent(h) + "?s=96";
  }
  var ART = {
    CryptoPunks: "https://www.larvalabs.com/public/images/cryptopunks/punk7804.png",
    Fidenza: "https://media-proxy.artblocks.io/1/0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270/78000027.png",
    "Chromie Squiggle": "https://media-proxy.artblocks.io/1/0x059edd72cd353df5106d2b9cc5ab83a52287ac3a/0.png"
  };
  window.avErr = function (el) {
    var h = el.dataset.h || "";
    var name = el.dataset.name || h || "AR";
    var n = +(el.dataset.n || 0);
    var next = [
      "https://unavatar.io/x/" + encodeURIComponent(h) + "?fallback=false",
      "https://unavatar.io/twitter/" + encodeURIComponent(h) + "?fallback=false",
      "https://ui-avatars.com/api/?name=" + encodeURIComponent(name) + "&background=e23d28&color=f3ead7&size=96&bold=true"
    ];
    if (n < next.length) {
      el.dataset.n = String(n + 1);
      el.src = next[n];
    } else {
      el.style.display = "none";
      if (el.nextElementSibling) el.nextElementSibling.style.display = "grid";
    }
  };
  function wire(img, handle, name, src) {
    img.dataset.h = handle || "";
    img.dataset.name = name || handle || "AR";
    img.dataset.n = "0";
    img.onerror = function () { window.avErr(img); };
    img.src = src || stamp(handle);
  }
  document.querySelectorAll(".face").forEach(function (el) {
    var img = el.querySelector("img");
    if (!img) return;
    wire(img, el.dataset.handle, el.getAttribute("title") || img.alt, stamp(el.dataset.handle));
  });
  document.querySelectorAll(".tile").forEach(function (el) {
    var img = el.querySelector("img");
    if (!img) return;
    var name = el.dataset.name || (el.querySelector("strong") && el.querySelector("strong").textContent) || img.alt;
    var handle = el.dataset.handle || "";
    wire(img, handle, name, ART[name] || stamp(handle));
  });
})();
