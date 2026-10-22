document.addEventListener("DOMContentLoaded", function () {
  const nav = document.querySelector(".nav");
  const navOpenBtn = document.querySelector(".navOpenBtn");
  const navCloseBtn = document.querySelector(".navCloseBtn");
  const navbarSearch = document.querySelector("#navbarSearch");

  if (navOpenBtn && nav) {
    navOpenBtn.addEventListener("click", function () {
      nav.classList.add("openNav");
    });
  }

  if (navCloseBtn && nav) {
    navCloseBtn.addEventListener("click", function () {
      nav.classList.remove("openNav");
    });
  }

  // Close drawer when clicking outside nav-links on mobile
  document.addEventListener("click", function (e) {
    if (nav && nav.classList.contains("openNav")) {
      if (!e.target.closest(".nav-links") && !e.target.closest(".navOpenBtn")) {
        nav.classList.remove("openNav");
      }
    }
  });

  if (navbarSearch) {
    navbarSearch.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        const term = navbarSearch.value.trim();
        if (term) {
          // If on daftarCCTV page, focus search input there; otherwise redirect
          const pageSearch = document.getElementById("cctvSearch");
          if (pageSearch) {
            pageSearch.value = term;
            pageSearch.dispatchEvent(new Event("input"));
            pageSearch.focus();
          } else {
            window.location.href = "daftarCCTV.php";
          }
        }
      }
    });
  }
});
