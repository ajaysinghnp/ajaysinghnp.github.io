export async function html2pdf(source: HTMLElement, title: string) {
  let wrapper: HTMLDivElement | null = null;

  try {
    const [{ default: html2canvas }, { default: JsPDF }] = await Promise.all([
      import("html2canvas-pro"),
      import("jspdf"),
    ]);

    const SCALE = 2;
    const PAGE_WIDTH_PX = 794; // A4 width at 96dpi
    const MARGIN_MM = 14;

    wrapper = document.createElement("div");
    wrapper.setAttribute("data-theme", "light");
    wrapper.setAttribute("data-pdf-export", ""); // <- new

    // <- new: PDF-only styles, scoped to the wrapper
    const pdfStyle = document.createElement("style");
    pdfStyle.textContent = `
      [data-pdf-export] pre,
      [data-pdf-export] pre * {
        white-space: pre-wrap !important;
        overflow-wrap: anywhere !important;
        word-break: break-word !important;
        min-width: 0 !important;
      }
      [data-pdf-export] pre {
        overflow: visible !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
      }
      [data-pdf-export] :not(pre) > code {
        overflow-wrap: anywhere !important;
      }
      [data-pdf-export] table {
        width: 100% !important;
        table-layout: fixed !important;
      }
      [data-pdf-export] td,
      [data-pdf-export] th {
        overflow-wrap: anywhere !important;
      }
      [data-pdf-export] img,
      [data-pdf-export] svg {
        max-width: 100% !important;
        height: auto;
      }
    `;
    wrapper.appendChild(pdfStyle);

    // ...Object.assign(wrapper.style, {...}) and the rest stay the same
    Object.assign(wrapper.style, {
      position: "fixed",
      left: "-10000px",
      top: "0",
      width: `${PAGE_WIDTH_PX}px`,
      boxSizing: "border-box",
      padding: "0 48px", // vertical spacing now comes from PDF page margins
      backgroundColor: "#ffffff",
      color: "#17202a",
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: "15px",
      lineHeight: "1.7",
    });

    const clone = source.cloneNode(true) as HTMLElement;
    clone.style.maxWidth = "none";
    clone.style.width = "100%";
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    await document.fonts.ready;
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );

    // ---- Measure unbreakable blocks (CSS px, relative to wrapper top) ----
    const BLOCK_SELECTOR = "h1,h2,h3,h4,h5,h6,p,pre,tr,li,img,figure,hr,blockquote";
    const wrapperTop = wrapper.getBoundingClientRect().top;

    const blocks = Array.from(wrapper.querySelectorAll<HTMLElement>(BLOCK_SELECTOR))
      .filter((el) => !el.querySelector(BLOCK_SELECTOR)) // leaf blocks only
      .map((el) => {
        const rect = el.getBoundingClientRect();
        const isHeading = /^H[1-6]$/.test(el.tagName);
        return {
          top: rect.top - wrapperTop,
          // extend headings so they stay attached to the next block
          bottom: rect.bottom - wrapperTop + (isHeading ? 48 : 0),
        };
      });

    // ---- Render with a light theme applied only to html2canvas's copy ----
    const canvas = await html2canvas(wrapper, {
      scale: SCALE,
      backgroundColor: "#ffffff",
      useCORS: true,
      onclone: (clonedDoc) => {
        const root = clonedDoc.documentElement;
        root.classList.remove("dark");
        root.classList.add("light");
        root.setAttribute("data-theme", "light");
        root.style.colorScheme = "light";
        clonedDoc.body.classList.remove("dark");
      },
    });

    const pdf = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    const pxPerMm = PAGE_WIDTH_PX / pageW;
    const pageContentPx = (pageH - MARGIN_MM * 2) * pxPerMm;
    const totalPx = canvas.height / SCALE;

    // ---- Compute page breaks that avoid cutting through blocks ----
    const breaks: number[] = [0];
    let start = 0;

    while (start + pageContentPx < totalPx) {
      let cut = start + pageContentPx;
      let moved = true;

      while (moved) {
        moved = false;
        for (const b of blocks) {
          // block straddles the cut and fits on a page -> push it to the next page
          if (b.top > start + 1 && b.top < cut && b.bottom > cut) {
            cut = b.top;
            moved = true;
          }
        }
      }

      breaks.push(cut);
      start = cut;
    }
    breaks.push(totalPx);

    // ---- Slice the canvas at those breaks ----
    for (let i = 0; i < breaks.length - 1; i++) {
      const sy = Math.round(breaks[i] * SCALE);
      const sh = Math.min(Math.round((breaks[i + 1] - breaks[i]) * SCALE), canvas.height - sy);
      if (sh <= 0) continue;

      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = sh;
      const ctx = slice.getContext("2d");
      if (!ctx) throw new Error("Canvas 2D context unavailable");

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, slice.width, slice.height);
      ctx.drawImage(canvas, 0, sy, canvas.width, sh, 0, 0, canvas.width, sh);

      if (i > 0) pdf.addPage();
      pdf.addImage(
        slice.toDataURL("image/jpeg", 0.95),
        "JPEG",
        0,
        MARGIN_MM,
        pageW,
        (sh * pageW) / canvas.width,
      );
    }

    pdf.save(`${title}.pdf`);
    return true;
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    return false;
  } finally {
    wrapper?.remove();
  }
}
