/* Teak Pro — shared site behavior */
document.addEventListener("DOMContentLoaded", () => {
  /* Sticky nav shadow + mobile toggle */
  const nav = document.querySelector(".nav");
  if (nav) {
    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const toggle = nav.querySelector(".nav__toggle");
    if (toggle) {
      toggle.addEventListener("click", () => {
        const open = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      nav.querySelectorAll(".nav__links a").forEach((a) =>
        a.addEventListener("click", () => nav.classList.remove("is-open"))
      );
    }
  }

  /* Footer year */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* Broken/missing image -> styled placeholder fallback.
     Drop a real photo at the src path shown in data-hint and it will
     replace this automatically; until then, a clean placeholder shows. */
  document.querySelectorAll(".photo-slot img").forEach((img) => {
    img.addEventListener("error", () => {
      const slot = img.closest(".photo-slot");
      if (slot) slot.classList.add("is-empty");
      img.remove();
    }, { once: true });
  });

  /* Before/After compare sliders */
  document.querySelectorAll(".compare").forEach((compare) => {
    const before = compare.querySelector(".compare__before");
    const handle = compare.querySelector(".compare__handle");
    if (!before || !handle) return;

    const setPos = (pct) => {
      const clamped = Math.min(95, Math.max(5, pct));
      before.style.width = clamped + "%";
      handle.style.left = clamped + "%";
    };

    const posFromClientX = (clientX) => {
      const rect = compare.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    };

    let dragging = false;
    const start = () => (dragging = true);
    const stop = () => (dragging = false);
    const move = (clientX) => {
      if (!dragging) return;
      setPos(posFromClientX(clientX));
    };

    handle.addEventListener("mousedown", start);
    window.addEventListener("mouseup", stop);
    window.addEventListener("mousemove", (e) => move(e.clientX));

    handle.addEventListener("touchstart", start, { passive: true });
    window.addEventListener("touchend", stop);
    compare.addEventListener("touchmove", (e) => {
      if (e.touches[0]) move(e.touches[0].clientX);
    }, { passive: true });

    compare.addEventListener("click", (e) => {
      if (e.target === handle) return;
      setPos(posFromClientX(e.clientX));
    });

    setPos(50);
  });

  /* Gallery filters */
  const filterBar = document.querySelector(".filter-bar");
  if (filterBar) {
    const buttons = filterBar.querySelectorAll("button");
    const items = document.querySelectorAll(".gallery-item");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        const filter = btn.dataset.filter;
        items.forEach((item) => {
          const show = filter === "all" || item.dataset.tags?.includes(filter);
          item.hidden = !show;
        });
      });
    });
  }

  /* Contact page: homeowner vs partner form tabs */
  const tabs = document.querySelectorAll(".form-tabs button");
  if (tabs.length) {
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("is-active"));
        tab.classList.add("is-active");
        document.querySelectorAll(".form-panel").forEach((panel) => {
          panel.hidden = panel.dataset.panel !== tab.dataset.tab;
        });
      });
    });
  }

  /* File upload label preview */
  document.querySelectorAll(".file-drop input[type=file]").forEach((input) => {
    input.addEventListener("change", () => {
      const list = input.closest(".file-drop").querySelector(".file-drop__list");
      if (!list) return;
      if (!input.files.length) { list.textContent = ""; return; }
      const names = Array.from(input.files).map((f) => f.name);
      list.textContent = names.length > 3
        ? `${names.length} photos selected`
        : names.join(", ") + " selected";
    });
  });
});
