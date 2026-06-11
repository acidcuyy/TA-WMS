import { useEffect, useRef } from "react";

/**
 * useGlobalSelectLock
 * 
 * 1. Membungkus semua <select> filter dengan wrapper + tombol 🔒/🔓
 * 2. Menambahkan tombol 🔒 di pojok kanan atas setiap summary card
 */
export function useGlobalSelectLock() {
  const observerRef = useRef(null);

  useEffect(() => {
    /* ── 1. INJECT LOCK KE SEMUA <select> FILTER ── */
    function injectSelectLocks() {
      const selects = document.querySelectorAll("select:not([data-lock-injected])");

      selects.forEach((sel) => {
        if (sel.closest(".locked-select-wrapper")) return;
        if (
          sel.closest(".item-select-list") ||
          sel.getAttribute("data-no-lock") === "true"
        ) return;

        sel.setAttribute("data-lock-injected", "true");

        const wrapper = document.createElement("div");
        wrapper.className = "locked-select-wrapper";
        wrapper.style.display = "inline-flex";
        wrapper.style.alignItems = "stretch";
        wrapper.style.position = "relative";
        
        // Copy flex and width from original select so layout doesn't break
        if (sel.style.flex) wrapper.style.flex = sel.style.flex;
        if (sel.style.width) wrapper.style.width = sel.style.width;

        sel.parentNode.insertBefore(wrapper, sel);
        wrapper.appendChild(sel);
        sel.classList.add("locked-select");

        // Overlay transparan blokir klik saat locked
        const overlay = document.createElement("div");
        overlay.className = "lock-overlay";
        overlay.style.cssText = `
          position:absolute; inset:0; right:32px;
          background:transparent; cursor:not-allowed;
          display:none; z-index:5;
          border-radius:10px 0 0 10px;
        `;
        wrapper.appendChild(overlay);

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "lock-btn lock-btn--unlocked";
        btn.textContent = "🔓";
        btn.title = "Klik untuk mengunci filter ini";
        btn.setAttribute("aria-label", "Kunci dropdown");

        let locked = false;
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          locked = !locked;
          if (locked) {
            overlay.style.display = "block";
            sel.classList.add("locked-select--locked");
            sel.style.pointerEvents = "none";
            btn.classList.replace("lock-btn--unlocked", "lock-btn--locked");
            btn.textContent = "🔒";
            btn.title = "Klik untuk membuka kunci";
          } else {
            overlay.style.display = "none";
            sel.classList.remove("locked-select--locked");
            sel.style.pointerEvents = "";
            btn.classList.replace("lock-btn--locked", "lock-btn--unlocked");
            btn.textContent = "🔓";
            btn.title = "Klik untuk mengunci filter ini";
          }
        });

        wrapper.appendChild(btn);
      });
    }

    /* ── 2. INJECT LOCK KE SUMMARY CARDS ── */
    function injectCardLocks() {
      const cards = document.querySelectorAll(
        ".summary-card:not([data-card-lock-injected]), .mpAdmin__productCard:not([data-card-lock-injected]), [class*='statCard']:not([data-card-lock-injected]), [class*='summaryCard']:not([data-card-lock-injected]), [class*='StatCard']:not([data-card-lock-injected])"
      );

      cards.forEach((card) => {
        card.setAttribute("data-card-lock-injected", "true");

        // Pastikan card punya position relative
        const cs = getComputedStyle(card);
        if (cs.position === "static") card.style.position = "relative";

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "card-lock-btn card-lock-btn--unlocked";
        btn.textContent = "🔓";
        btn.title = "Kunci card ini";
        btn.setAttribute("aria-label", "Kunci card");

        let locked = false;

        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          locked = !locked;

          if (locked) {
            // Tambahkan overlay di atas card
            let overlay = card.querySelector(".card-lock-overlay");
            if (!overlay) {
              overlay = document.createElement("div");
              overlay.className = "card-lock-overlay";
              overlay.style.cssText = `
                position:absolute; inset:0; border-radius:inherit;
                background:rgba(249,115,22,0.06);
                border:2px solid #f97316;
                cursor:not-allowed; z-index:10;
                pointer-events:all;
                display:flex; align-items:center; justify-content:center;
              `;
              const lbl = document.createElement("span");
              lbl.textContent = "🔒 Terkunci";
              lbl.style.cssText = "font-size:11px;font-weight:700;color:#f97316;background:#fff7ed;padding:3px 8px;border-radius:6px;";
              overlay.appendChild(lbl);
              card.appendChild(overlay);
            }
            overlay.style.display = "flex";
            btn.textContent = "🔒";
            btn.classList.replace("card-lock-btn--unlocked", "card-lock-btn--locked");
            btn.title = "Buka kunci card";
          } else {
            const overlay = card.querySelector(".card-lock-overlay");
            if (overlay) overlay.style.display = "none";
            btn.textContent = "🔓";
            btn.classList.replace("card-lock-btn--locked", "card-lock-btn--unlocked");
            btn.title = "Kunci card ini";
          }
        });

        card.appendChild(btn);
      });
    }

    function runAll() {
      injectSelectLocks();
      injectCardLocks();
    }

    runAll();

    observerRef.current = new MutationObserver(() => {
      runAll();
    });

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);
}
