(function () {
  function hideHover() {
    var el = document.getElementById("hover");
    if (el) el.hidden = true;
  }
  function showHover(ev, name, handle) {
    var el = document.getElementById("hover");
    if (!el || window.matchMedia("(hover: none)").matches) return;
    el.hidden = false;
    el.innerHTML = "<strong>" + name + "</strong><span>@" + handle + " · tap to confirm tip</span>";
    el.style.left = Math.min(ev.clientX + 12, innerWidth - 180) + "px";
    el.style.top = Math.min(ev.clientY + 12, innerHeight - 80) + "px";
  }
  window.openConfirm = function (t) {
    var handle = String(t.handle || "").replace(/^@/, "");
    var address = t.address || "";
    var name = t.name || handle || "receiver";
    var who = document.getElementById("who");
    if (who) who.value = address || ("@" + handle);
    if (typeof renderMatches === "function") renderMatches(who.value);
    if (typeof writePrompt === "function") writePrompt();
    if (typeof picked !== "undefined") {
      picked.kind = address ? "addr" : "x";
      picked.handle = handle;
      picked.address = address;
    }
    var sheet = document.getElementById("sheet");
    var whoBox = document.getElementById("sheetWho");
    var meta = document.getElementById("sheetMeta");
    var warn = document.getElementById("sheetWarn");
    if (!sheet || !whoBox) return;
    var ph = (name || "AR").replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase();
    var img = handle
      ? '<img src="https://unavatar.io/x/' + encodeURIComponent(handle) + '?fallback=false" alt="">'
      : '<div class="ph">' + ph + "</div>";
    whoBox.innerHTML = img + "<div><strong>" + name + "</strong><span>" + (address || ("@" + handle)) + "</span></div>";
    if (address) {
      meta.textContent = "Wallet read from what you pasted or from the NFT owner lookup.";
      warn.textContent = "Confirm this 0x is the person you mean to tip.";
    } else {
      meta.textContent = "Mapped X handle from this page. No 0x on file.";
      warn.textContent = "Bankr sends to the wallet linked to that handle. Confirm the handle before you copy.";
    }
    sheet.hidden = false;
  };
  document.querySelectorAll(".face").forEach(function (el) {
    var handle = el.dataset.handle;
    var name = el.getAttribute("title") || handle;
    el.addEventListener("click", function () {
      hideHover();
      window.openConfirm({ name: name, handle: handle, address: "" });
    });
    el.addEventListener("pointerenter", function (ev) { showHover(ev, name, handle); });
    el.addEventListener("pointerleave", hideHover);
  });
  document.querySelectorAll(".tile").forEach(function (el) {
    el.addEventListener("click", function (ev) {
      ev.preventDefault();
      var nameEl = el.querySelector("strong");
      window.openConfirm({ name: el.dataset.name || (nameEl && nameEl.textContent) || "collection", handle: el.dataset.handle, address: "" });
    });
  });
  var connects = document.querySelector(".connects");
  if (connects) {
    connects.addEventListener("click", function (e) {
      var b = e.target.closest("[data-act]");
      if (!b) return;
      var act = b.dataset.act;
      if (act === "tip") window.openConfirm({ name: b.dataset.name, handle: b.dataset.handle, address: "" });
      if (act === "bankr") document.getElementById("copy").click();
      if (act === "launch") {
        var d = document.getElementById("launch");
        if (d) { d.open = true; d.scrollIntoView({ behavior: "smooth", block: "center" }); }
      }
      if (act === "nft") {
        var n = document.getElementById("nft");
        n.focus();
        n.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }
  var sheet = document.getElementById("sheet");
  if (sheet) {
    document.getElementById("sheetX").addEventListener("click", function () { sheet.hidden = true; });
    sheet.addEventListener("click", function (e) { if (e.target === sheet) sheet.hidden = true; });
    document.getElementById("sheetUse").addEventListener("click", function () {
      sheet.hidden = true;
      var s = document.getElementById("status");
      if (s) { s.textContent = "Receiver confirmed. Copy Bankr or send from wallet."; s.className = "hint ok"; }
    });
    document.getElementById("sheetCopy").addEventListener("click", function () {
      document.getElementById("copy").click();
    });
  }
})();
