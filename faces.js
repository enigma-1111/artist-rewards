(function () {
  var SHOW = 30;
  var catalog = { artists: [], collections: [] };

  function shuffle(arr) {
    var a = arr.slice();
    var i, j, t;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function setRecv(handle, name, img) {
    var rf = document.getElementById("recvFace");
    if (rf) {
      rf.innerHTML = img
        ? '<img src="' + img + '" alt="' + name + '">' 
        : '<div class="ph">AR</div>';
    }
    var rn = document.getElementById("recvName");
    if (rn) rn.textContent = "@" + handle;
    var rm = document.getElementById("recvMeta");
    if (rm) rm.textContent = name + " \u00b7 confirm, then copy the Bankr prompt";
  }

  function bind(el) {
    el.addEventListener("click", function () {
      document.querySelectorAll("#faces .face, #collections .face").forEach(function (x) {
        x.classList.remove("on");
      });
      el.classList.add("on");
      setRecv(el.dataset.handle, el.title, el.dataset.img);
      if (typeof openConfirm === "function") {
        openConfirm({ name: el.title, handle: el.dataset.handle, address: "" });
      }
    });
  }

  function paintGrid(boxId, pool, metaId) {
    var box = document.getElementById(boxId);
    if (!box) return;
    box.className = "faces";
    box.innerHTML = "";
    var list = shuffle(pool.filter(function (row) { return row && row.img && row.handle; }));
    var shown = 0;
    function add(row) {
      if (!row || !row.img) return;
      var el = document.createElement("button");
      el.className = "face";
      el.type = "button";
      el.dataset.handle = row.handle;
      el.dataset.img = row.img;
      el.title = row.name || row.handle;
      var img = document.createElement("img");
      img.alt = el.title;
      img.src = row.img;
      img.onload = function () {
        if (!img.naturalWidth || img.naturalWidth < 16) {
          if (el.parentNode) el.parentNode.removeChild(el);
        }
      };
      img.onerror = function () {
        if (el.parentNode) el.parentNode.removeChild(el);
        var next = list.shift();
        if (next) add(next);
        meta();
      };
      el.appendChild(img);
      bind(el);
      box.appendChild(el);
    }
    var i;
    for (i = 0; i < list.length && shown < SHOW; i++) {
      add(list[i]);
      shown++;
    }
    list = list.slice(shown);
    function meta() {
      var el = document.getElementById(metaId);
      if (!el) return;
      el.textContent = box.querySelectorAll(".face").length + " on screen \u00b7 " + pool.length + " in pool \u00b7 shuffle";
    }
    meta();
  }

  function paint() {
    paintGrid("faces", catalog.artists, "faceMeta");
    paintGrid("collections", catalog.collections, "collMeta");
  }

  function localFallback() {
    var rows = (typeof ARTISTS !== "undefined" ? ARTISTS : []).map(function (row) {
      return {
        name: row[0],
        handle: row[1],
        img: "https://unavatar.io/twitter/" + encodeURIComponent(row[1]) + "?fallback=false"
      };
    });
    var seen = {};
    catalog.artists = rows.filter(function (r) {
      var k = String(r.handle).toLowerCase();
      if (seen[k]) return false;
      seen[k] = 1;
      return true;
    });
    catalog.collections = [];
  }

  var shuffleBtn = document.getElementById("shuffleFaces");
  if (shuffleBtn) shuffleBtn.addEventListener("click", paint);
  var shuffleCols = document.getElementById("shuffleCols");
  if (shuffleCols) shuffleCols.addEventListener("click", paint);

  fetch("/api/catalog")
    .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
    .then(function (data) {
      catalog.artists = data.artists || [];
      catalog.collections = data.collections || [];
      if (!catalog.artists.length) localFallback();
      paint();
    })
    .catch(function () {
      localFallback();
      paint();
    });
})();
