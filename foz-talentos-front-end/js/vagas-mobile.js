"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const filterButton =
    document.getElementById("mobileFilterButton");

  const filterClose =
    document.getElementById("mobileFilterClose");

  const filterBackdrop =
    document.getElementById("mobileFilterBackdrop");

  const applyFilters =
    document.getElementById("applyMobileFilters");

  const sidebar =
    document.getElementById("jobsSidebar");

  function isMobile() {
    return window.matchMedia("(max-width: 900px)").matches;
  }

  function openFilters() {
    if (!isMobile() || !sidebar) {
      return;
    }

    sidebar.classList.add("mobile-open");
    document.body.classList.add("mobile-filters-open");

    filterButton?.setAttribute(
      "aria-expanded",
      "true"
    );

    if (filterBackdrop) {
      filterBackdrop.hidden = false;
    }
  }

  function closeFilters() {
    sidebar?.classList.remove("mobile-open");
    document.body.classList.remove("mobile-filters-open");

    filterButton?.setAttribute(
      "aria-expanded",
      "false"
    );

    if (filterBackdrop) {
      filterBackdrop.hidden = true;
    }
  }

  filterButton?.addEventListener(
    "click",
    openFilters
  );

  filterClose?.addEventListener(
    "click",
    closeFilters
  );

  filterBackdrop?.addEventListener(
    "click",
    closeFilters
  );

  applyFilters?.addEventListener(
    "click",
    closeFilters
  );

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeFilters();
    }
  });

  window.addEventListener("resize", () => {
    if (!isMobile()) {
      closeFilters();
    }
  });
});
