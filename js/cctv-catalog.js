(function () {
  const search = document.getElementById("cctvSearch");
  const cards = Array.from(document.querySelectorAll("[data-cctv-card]"));
  const count = document.getElementById("cctvResultCount");
  const emptyState = document.getElementById("cctvEmptyState");

  if (!search || !count || !emptyState) {
    return;
  }

  search.addEventListener("input", function () {
    const term = search.value.trim().toLocaleLowerCase("id-ID");
    let visibleCards = 0;

    cards.forEach(function (card) {
      const matches = (card.dataset.search || "").includes(term);
      card.hidden = !matches;
      if (matches) {
        visibleCards += 1;
      }
    });

    count.textContent = visibleCards + " kamera ditampilkan";
    emptyState.hidden = visibleCards !== 0;
  });
})();
