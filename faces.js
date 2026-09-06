(function () {
  if (typeof ARTISTS === "undefined") return;
  var FACE = {
    cryptopunksnfts: "https://www.larvalabs.com/public/images/cryptopunks/punk5822.png",
    larvalabs: "https://www.larvalabs.com/public/images/cryptopunks/punk7804.png",
    artblocks_io: "https://avatars.githubusercontent.com/u/78487324?s=128",
    Snowfro: "https://artblocks-mainnet.s3.amazonaws.com/0.png",
    tylerxhobbs: "https://artblocks-mainnet.s3.amazonaws.com/78000027.png"
  };
  function hashHue(str) {
    var h = 0; str = String(str || "");
    for (var i = 0; i < str.length; i++) h = (h * 33 + str.charCodeAt(i)) >>> 0;
    return h;
  }
  function blob(handle) {
    var seed = hashHue(handle);
    var a = PALETTE[seed % PALETTE.length][0];
    var b = PALETTE[(seed + 3) % PALETTE.length][1];
    return '<div class="ph artmark" style="--a:' + a + ";--b:" + b + '"></div>';
  }
  function tile(handle, name) {
    if (FACE[handle]) return '<img src="' + FACE[handle] + '" alt="' + name + '">';
    return blob(handle);
  }
  window.paintFaces = function () {
    var box = document.getElementById("faces");
    if (!box) return;
    var seen = {};
    var list = ARTISTS.filter(function (row) {
      var k = row[1].toLowerCase();
      if (seen[k]) return false;
      seen[k] = 1;
      return true;
    }).slice(0, 69);
    box.innerHTML = list.map(function (row) {
      return '<button class="face" type="button" data-handle="' + row[1] + '" title="' + row[0] + '">' + tile(row[1], row[0]) + "</button>";
    }).join("");
    box.querySelectorAll(".face").forEach(function (el) {
      el.addEventListener("click", function () {
        box.querySelectorAll(".face").forEach(function (x) { x.classList.remove("on"); });
        el.classList.add("on");
        if (typeof openConfirm === "function") openConfirm({ name: el.title, handle: el.dataset.handle, address: "" });
        var rf = document.getElementById("recvFace");
        if (rf) rf.innerHTML = el.innerHTML;
        var rn = document.getElementById("recvName");
        if (rn) rn.textContent = "@" + el.dataset.handle;
        var rm = document.getElementById("recvMeta");
        if (rm) rm.textContent = el.title + " \u00b7 confirm, then copy the Bankr prompt";
      });
    });
  };
  window.paintFaces();
})();
