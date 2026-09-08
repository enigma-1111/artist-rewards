(function () {
  var SHOW = 30;
  var catalog = { artists: [], collections: [] };
  var lastNew = { faces: 0, collections: 0 };

  function shuffle(arr) {
    var a = arr.slice();
    var i, j, t;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function usable(pool) {
    var seen = {};
    var out = [];
    var i, row, key;
    for (i = 0; i < pool.length; i++) {
      row = pool[i];
      if (!row || !row.img || !row.handle) continue;
      key = String(row.img);
      if (seen[key]) continue;
      seen[key] = 1;
      out.push(row);
    }
    return out;
  }

  function shownImgs(boxId) {
    var box = document.getElementById(boxId);
    var keys = {};
    if (!box) return keys;
    box.querySelectorAll(".face").forEach(function (el) {
      if (el.dataset.img) keys[el.dataset.img] = 1;
    });
    return keys;
  }

  function drawFromPool(pool, boxId) {
    var rows = usable(pool);
    var on = shownImgs(boxId);
    var onCount = 0;
    var k;
    for (k in on) if (Object.prototype.hasOwnProperty.call(on, k)) onCount++;
    if (!onCount) return { list: shuffle(rows), fresh: 0, poolSize: rows.length };
    var fresh = [];
    var kept = [];
    var i, row;
    for (i = 0; i < rows.length; i++) {
      row = rows[i];
      if (on[row.img]) kept.push(row);
      else fresh.push(row);
    }
    fresh = shuffle(fresh);
    kept = shuffle(kept);
    return {
      list: fresh.concat(kept),
      fresh: fresh.length,
      poolSize: rows.length
    };
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
        x.setAttribute("aria-pressed", "false");
      });
      el.classList.add("on");
      el.setAttribute("aria-pressed", "true");
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

  function pickedHandle() {
    if (typeof picked === "undefined" || !picked || !picked.handle) return "";
    return String(picked.handle).replace(/^@/, "").toLowerCase();
  }

  function paintGrid(boxId, pool, metaId, kind) {
    var box = document.getElementById(boxId);
    if (!box) return;
    var draw = drawFromPool(pool, boxId);
    var list = draw.list.slice();
    lastNew[boxId] = draw.fresh;
    box.className = "faces";
    box.innerHTML = "";
    function meta() {
      var el = document.getElementById(metaId);
      if (!el) return;
      var n = box.querySelectorAll(".face").length;
      var extra = draw.fresh ? " · " + Math.min(draw.fresh, n) + " new" : " · shuffle";
      el.textContent = n + " on screen · " + draw.poolSize + " in pool · culture map" + extra;
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
      el.setAttribute("aria-pressed", "false");
      if (pickedHandle() && String(row.handle).toLowerCase() === pickedHandle()) {
        el.classList.add("on");
        el.setAttribute("aria-pressed", "true");
      }
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

  function flashChip(id) {
    var btn = document.getElementById(id);
    if (!btn) return;
    btn.classList.add("on");
    window.setTimeout(function () { btn.classList.remove("on"); }, 280);
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
    var whoEl = document.getElementById("who");
    if (whoEl && whoEl.value && typeof renderMatches === "function") {
      renderMatches(whoEl.value, { keepPicked: true });
    }
  }

  var shuffleBtn = document.getElementById("shuffleFaces");
  if (shuffleBtn) {
    shuffleBtn.addEventListener("click", function () {
      flashChip("shuffleFaces");
      paintArtists();
    });
  }
  var shuffleCols = document.getElementById("shuffleCols");
  if (shuffleCols) {
    shuffleCols.addEventListener("click", function () {
      flashChip("shuffleCols");
      paintCollections();
    });
  }

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
