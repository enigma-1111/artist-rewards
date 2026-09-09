(function () {
  function $(id) { return document.getElementById(id); }
  function live() {
    var cfg = typeof CONFIG !== "undefined" ? CONFIG : {};
    var c = String(cfg.contract || "").trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(c)) return false;
    if (c.toLowerCase() === "0xa5bc127b167bd5b89e161838799b1bddfd0697c4") return false;
    return true;
  }
  function bind() {
    var btn = $("send");
    if (!btn || !btn.parentNode) return;
    var neu = btn.cloneNode(true);
    btn.parentNode.replaceChild(neu, btn);
    if (live()) {
      neu.textContent = "Send";
      neu.classList.remove("wait");
      neu.removeAttribute("aria-disabled");
      neu.title = "Send ART from the connected wallet";
      neu.addEventListener("click", function () {
        if (typeof sendArt === "function") sendArt();
      });
      return;
    }
    neu.textContent = "Send later";
    neu.classList.add("wait");
    neu.setAttribute("aria-disabled", "true");
    neu.title = "On-site send waits for the live token. Copy Bankr for now.";
    neu.addEventListener("click", async function (e) {
      e.preventDefault();
      var ok = false;
      if (typeof copyBankr === "function") {
        try { ok = await copyBankr(); } catch (err) { ok = false; }
      }
      if (typeof setStatus === "function") {
        setStatus(
          ok
            ? "On-site send waits for the live token. Prompt copied — paste into Bankr."
            : "On-site send waits for the live token. Copy the Bankr prompt instead.",
          "warn"
        );
      }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();
