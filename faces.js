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

  function setRecv(handle, name, img, kind) {
    var wrap = document.getElementById("recv");
    var rf = document.getElementById("recvFace");
    if (rf) {
      rf.innerHTML = img
        ? '<img src="' + img + '" alt="' + name + '" referrerpolicy="no-referrer">'
        : '<div class="ph">AR</div>';
    }
    var rn = document.getElementById("recvName");
    if (rn) rn.textContent = name || ("@" + handle);
    var rm = document.getElementById("recvMeta");
    if (rm) {
      rm.textContent = kind === "collection"
        ? "@" + handle + " · collection still · Bankr can send to this handle"
        : "@" + handle + " · Bankr can send to this handle";
    }
    if (wrap) wrap.classList.add("on");
    if (typeof picked !== "undefined") {
      picked.kind = "x";
      picked.label = kind || "artist";
      picked.handle = handle;
      picked.address = "";
      picked.name = name || handle;
      picked.img = img || "";
    }
    var whoEl = document.getElementById("who");
    if (whoEl) whoEl.value = handle ? "@" + handle : "";
    if (typeof writePrompt === "function") writePrompt();
  }

  function bind(el) {
    el.addEventListener("click", function () {
      document.querySelectorAll("#faces .face, #collections .face").forEach(function (x) {
        x.classList.remove("on");
      });
      el.classList.add("on");
      var kind = el.dataset.kind || "artist";
      setRecv(el.dataset.handle, el.title, el.dataset.img, kind);
      if (typeof openConfirm === "function") {
        openConfirm({
          name: el.title,
          handle: el.dataset.handle,
          address: "",
          img: el.dataset.img,
          kind: kind
        });
      }
    });
  }

  function paintGrid(boxId, pool, metaId, kind) {
    var box = document.getElementById(boxId);
    if (!box) return;
    box.className = "faces";
    box.innerHTML = "";
    var list = shuffle(pool.filter(function (row) { return row && row.img && row.handle; }));
    function meta() {
      var el = document.getElementById(metaId);
      if (!el) return;
      el.textContent = kind === "collection"
        ? box.querySelectorAll(".face").length + " on screen · " + pool.length + " in pool · culture map · shuffle"
        : box.querySelectorAll(".face").length + " on screen · " + pool.length + " in pool · shuffle";
    }
    function add(row) {
      if (!row || !row.img) return;
      if (box.querySelectorAll(".face").length >= SHOW) return;
      var el = document.createElement("button");
      el.className = "face";
      el.type = "button";
      el.dataset.handle = row.handle;
      el.dataset.img = row.img;
      el.dataset.kind = kind || "artist";
      el.title = row.name || row.handle;
      el.setAttribute("aria-label", (row.name || row.handle) + (kind === "collection" ? " collection" : ""));
      var img = document.createElement("img");
      img.alt = el.title;
      img.referrerPolicy = "no-referrer";
      img.src = row.img;
      img.onload = function () {
        if (!img.naturalWidth || img.naturalWidth < 16) {
          if (el.parentNode) el.parentNode.removeChild(el);
          var next = list.shift();
          if (next) add(next);
        }
        meta();
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
    var first = list.splice(0, SHOW);
    for (i = 0; i < first.length; i++) add(first[i]);
    meta();
  }

  function paintArtists() {
    paintGrid("faces", catalog.artists, "faceMeta", "artist");
  }
  function paintCollections() {
    paintGrid("collections", catalog.collections, "collMeta", "collection");
  }
  function paint() {
    paintArtists();
    paintCollections();
  }

  function apply(data) {
    catalog.artists = (data && data.artists) || [];
    catalog.collections = (data && data.collections) || [];
    window.__artCatalog = catalog;
    paint();
  }

  var shuffleBtn = document.getElementById("shuffleFaces");
  if (shuffleBtn) shuffleBtn.addEventListener("click", paintArtists);
  var shuffleCols = document.getElementById("shuffleCols");
  if (shuffleCols) shuffleCols.addEventListener("click", paintCollections);

  fetch("/catalog.json")
    .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
    .then(apply)
    .catch(function () {
      return fetch("/api/catalog").then(function (r) { return r.ok ? r.json() : Promise.reject(); });
    })
    .then(function (data) {
      if (data && !(catalog.artists.length || catalog.collections.length)) apply(data);
    })
    .catch(function () {
      catalog.artists = [];
      catalog.collections = [];
      paint();
    });
})();
