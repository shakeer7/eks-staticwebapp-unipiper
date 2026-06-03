(function () {
  var storageKey = "uniPiperTheme";

  function syncButton() {
    var theme = document.documentElement.getAttribute("data-theme") || "dark";
    var btn = document.getElementById("theme-toggle");
    if (!btn) return;
    btn.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light background" : "Switch to dark background"
    );
    btn.setAttribute("title", btn.getAttribute("aria-label"));
    var icon = btn.querySelector(".theme-toggle-icon");
    if (icon) icon.textContent = theme === "dark" ? "\u2600" : "\u263E";
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!document.documentElement.hasAttribute("data-theme")) {
      try {
        var s = localStorage.getItem(storageKey);
        var t =
          s === "light" || s === "dark"
            ? s
            : window.matchMedia("(prefers-color-scheme: light)").matches
              ? "light"
              : "dark";
        document.documentElement.setAttribute("data-theme", t);
      } catch (e) {
        document.documentElement.setAttribute("data-theme", "dark");
      }
    }
    syncButton();
    document.getElementById("theme-toggle")?.addEventListener("click", function () {
      var cur = document.documentElement.getAttribute("data-theme") || "dark";
      var next = cur === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem(storageKey, next);
      } catch (e) {}
      syncButton();
    });
  });
})();
