(function () {
  function hoverEl() { return document.getElementById("hover"); }
  function hideHover() {
    var el = hoverEl();
    if (el) el.classList.remove("on");
  }
  function showHover(ev, name, handle) {
    var el = hoverEl();
    if (!el || window.matchMedia("(hover: none)").matches) return;
    el.classList.add("on");
    el.innerHTML = "<strong>" + name + "</strong><span>@" + handle + " · tap to tip</span>";
    el.style.left = Math.min(ev.clientX + 12, innerWidth - 180) + "px";
    el.style.top = Math.min(ev.clientY + 12, innerHeight - 80) + "px";
  }
  function pick(t) {
    var handle = String((t && t.handle) || "").replace(/^@/, "");
    var address = (t && t.address) || "";
    var name = (t && t.name) || handle || "receiver";
    var who = document.getElementById("who");
    var value = address || (handle ? "@" + handle : "");
    if (who) {
      who.value = value;
      who.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (typeof renderMatches === "function") renderMatches(value);
    if (typeof writePrompt === "function") writePrompt();
    if (typeof picked !== "undefined") {
      picked.kind = address ? "addr" : "x";
      picked.handle = handle;
      picked.address = address;
      picked.name = name;
    }
    document.querySelectorAll(".face").forEach(function (el) {
      el.classList.toggle("on", el.dataset.handle === handle);
    });
    var amt = document.getElementById("amt");
    if (amt) amt.scrollIntoView({ behavior: "smooth", block: "center" });
    var status = document.getElementById("status");
    if (status) {
      status.className = "hint ok";
      status.textContent = address
        ? "Receiver set. Copy the Bankr prompt or send."
        : "Receiver set to @" + handle + ". Copy the Bankr prompt or send.";
    }
  }
  window.openConfirm = pick;
  document.querySelectorAll(".face").forEach(function (el) {
    var handle = el.dataset.handle;
    var name = el.getAttribute("title") || handle;
    el.addEventListener("click", function () {
      hideHover();
      pick({ name: name, handle: handle, address: "" });
    });
    el.addEventListener("pointerenter", function (ev) { showHover(ev, name, handle); });
    el.addEventListener("pointerleave", hideHover);
  });
  document.querySelectorAll(".tile").forEach(function (el) {
    el.addEventListener("click", function (ev) {
      ev.preventDefault();
      var nameEl = el.querySelector("strong");
      pick({
        name: el.dataset.name || (nameEl && nameEl.textContent) || "collection",
        handle: el.dataset.handle,
        address: ""
      });
    });
  });
  var connects = document.querySelector(".connects");
  if (connects) {
    connects.addEventListener("click", function (e) {
      var b = e.target.closest("[data-act]");
      if (!b) return;
      var act = b.dataset.act;
      if (act === "tip") pick({ name: b.dataset.name, handle: b.dataset.handle, address: "" });
      if (act === "bankr") {
        var copy = document.getElementById("copy");
        if (copy) copy.click();
      }
      if (act === "launch") {
        var d = document.getElementById("launch");
        if (d) { d.open = true; d.scrollIntoView({ behavior: "smooth", block: "center" }); }
      }
      if (act === "nft") {
        var n = document.getElementById("nft");
        if (n) { n.focus(); n.scrollIntoView({ behavior: "smooth", block: "center" }); }
      }
    });
  }
})();
