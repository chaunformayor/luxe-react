import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const MAX_RENDER_WIDTH = 1300;

/**
 * Renders a PDF page-by-page into images with pdf.js. Pages become JPEG blobs instead of live
 * canvases so long leases don't exhaust memory on phones.
 */
export default function PdfViewer({ url }: { url: string }) {
  const [pages, setPages] = useState<{ src: string; ratio: number }[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let task: { destroy: () => Promise<void> } | null = null;
    const objectUrls: string[] = [];
    setPages([]);
    setTotal(null);
    setError(null);

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        const worker = await import("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url");
        pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

        const res = await fetch(url, { credentials: "same-origin" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = new Uint8Array(await res.arrayBuffer());
        const loading = pdfjs.getDocument({ data, standardFontDataUrl: "/pdfjs/standard_fonts/", wasmUrl: "/pdfjs/wasm/" });
        task = loading;
        const doc = await loading.promise;
        if (cancelled) return;
        setTotal(doc.numPages);

        for (let n = 1; n <= doc.numPages && !cancelled; n++) {
          const page = await doc.getPage(n);
          const base = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({ scale: Math.min(2.2, MAX_RENDER_WIDTH / base.width) });
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          await page.render({ canvas, viewport }).promise;
          const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.86));
          page.cleanup();
          if (!blob || cancelled) continue;
          const src = URL.createObjectURL(blob);
          objectUrls.push(src);
          setPages((prev) => [...prev, { src, ratio: viewport.height / viewport.width }]);
        }
      } catch (err) {
        console.error("[PdfViewer]", err);
        if (!cancelled) setError("The preview couldn't be shown here.");
      }
    })();

    return () => {
      cancelled = true;
      task?.destroy();
      objectUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [url]);

  if (error) {
    return <div className="p-6 text-center text-sm text-gray-600">{error} Use “Open full document” to read it.</div>;
  }

  return (
    <div className="space-y-3">
      {pages.map((page, i) => (
        <figure key={page.src} className="bg-white shadow-sm border border-gray-200">
          <img src={page.src} alt={`Page ${i + 1}`} className="w-full h-auto block" />
          <figcaption className="text-center text-[11px] text-gray-400 py-1 border-t border-gray-100">
            Page {i + 1}
            {total ? ` of ${total}` : ""}
          </figcaption>
        </figure>
      ))}
      {(total === null || pages.length < total) && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          {total ? `Loading page ${pages.length + 1} of ${total}…` : "Loading document…"}
        </div>
      )}
    </div>
  );
}
