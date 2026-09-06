(function () {
  if (typeof ARTISTS === "undefined" || typeof PALETTE === "undefined") return;
  function initials(name) {
    return String(name || "AR").replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase() || "AR";
  }
  function hashHue(str) {
    var h = 0;
    str = String(str || "");
    for (var i = 0; i < str.length; i++) h = (h * 33 + str.charCodeAt(i)) >>> 0;
    return h;
  }
  window.mark = function (handle, name) {
    var seed = hashHue(handle || name || "AR");
    var a = PALETTE[seed % PALETTE.length][0];
    var b = PALETTE[(seed + 2) % PALETTE.length][1];
    return '<div class="ph" style="--a:' + a + ";--b:" + b + '">' + initials(name || handle) + "</div>";
  };
  var facePage = 0;
  var FACE_PAGE = 18;
  function uniqueArtists() {
    var seen = {};
    return ARTISTS.filter(function (row) {
      var k = row[1].toLowerCase();
      if (seen[k]) return false;
      seen[k] = 1;
      return true;
    });
  }
  window.paintFaces = function () {
    var box = document.getElementById("faces");
    if (!box) return;
    var list = uniqueArtists();
    var pages = Math.max(1, Math.ceil(list.length / FACE_PAGE));
    if (facePage >= pages) facePage = 0;
    if (facePage < 0) facePage = pages - 1;
    var slice = list.slice(facePage * FACE_PAGE, facePage * FACE_PAGE + FACE_PAGE);
    box.innerHTML = slice.map(function (row) {
      return '<button class="face" type="button" data-handle="' + row[1] + '" title="' + row[0] + '">' + window.mark(row[1], row[0]) + "</button>";
    }).join("");
    var pager = document.getElementById("facePager");
    if (pager) pager.textContent = (facePage + 1) + " / " + pages;
    box.querySelectorAll(".face").forEach(function (el) {
      el.addEventListener("click", function () {
        box.querySelectorAll(".face").forEach(function (x) { x.classList.remove("on"); });
        el.classList.add("on");
        if (typeof openConfirm === "function") openConfirm({ name: el.title, handle: el.dataset.handle, address: "" });
        var rf = document.getElementById("recvFace");
        if (rf) rf.innerHTML = window.mark(el.dataset.handle, el.title);
        var rn = document.getElementById("recvName");
        if (rn) rn.textContent = "@" + el.dataset.handle;
        var rm = document.getElementById("recvMeta");
        if (rm) rm.textContent = el.title + " \u00b7 confirm, then copy the Bankr prompt";
      });
    });
  };
  var prev = document.getElementById("facePrev");
  var next = document.getElementById("faceNext");
  if (prev) prev.addEventListener("click", function () { facePage--; window.paintFaces(); });
  if (next) next.addEventListener("click", function () { facePage++; window.paintFaces(); });
  window.paintFaces();
})();
