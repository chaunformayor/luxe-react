import { useEffect, useRef, useState } from "react";
import { Eraser } from "lucide-react";

export type SignatureValue = { method: "typed" | "drawn"; dataUrl: string } | null;

const SCRIPT_FONT = "Dancing Script";
const INK = "#14213d";

function loadScriptFont() {
  const id = "esign-script-font";
  if (!document.getElementById(id)) {
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&display=swap";
    document.head.appendChild(link);
  }
  return document.fonts.load(`600 64px "${SCRIPT_FONT}"`).catch(() => undefined);
}

/** Crops transparent margins so the PNG is just the signature (keeps the upload small). */
function trimmedPng(source: HTMLCanvasElement, padding = 12) {
  const ctx = source.getContext("2d")!;
  const { width, height } = source;
  const pixels = ctx.getImageData(0, 0, width, height).data;
  let top = height, left = width, right = 0, bottom = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (pixels[(y * width + x) * 4 + 3] > 0) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }
  if (right < left || bottom < top) return null;
  left = Math.max(0, left - padding);
  top = Math.max(0, top - padding);
  right = Math.min(width - 1, right + padding);
  bottom = Math.min(height - 1, bottom + padding);
  const out = document.createElement("canvas");
  const scale = Math.min(1, 900 / (right - left + 1));
  out.width = Math.round((right - left + 1) * scale);
  out.height = Math.round((bottom - top + 1) * scale);
  out.getContext("2d")!.drawImage(source, left, top, right - left + 1, bottom - top + 1, 0, 0, out.width, out.height);
  return out.toDataURL("image/png");
}

function DrawPad({ onChange }: { onChange: (dataUrl: string | null) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [hasInk, setHasInk] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    const ctx = canvas.getContext("2d")!;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = INK;
  }, []);

  const point = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = point(e);
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.beginPath();
    ctx.arc(last.current.x, last.current.y, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = INK;
    ctx.fill();
  };

  const move = (e: React.PointerEvent) => {
    if (!drawing.current || !last.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = point(e);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    setHasInk(true);
    onChange(trimmedPng(canvasRef.current!));
  };

  const clear = () => {
    const canvas = canvasRef.current!;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
    onChange(null);
  };

  return (
    <div>
      <div className="relative rounded-lg border-2 border-dashed border-gray-300 bg-white">
        <canvas
          ref={canvasRef}
          className="w-full h-40 touch-none cursor-crosshair block"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          onPointerLeave={end}
          aria-label="Draw your signature"
        />
        {!hasInk && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
            Sign here with your finger or mouse
          </span>
        )}
        <div className="pointer-events-none absolute left-6 right-6 bottom-8 border-b border-gray-300" />
      </div>
      <button type="button" onClick={clear} className="mt-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <Eraser size={14} /> Clear
      </button>
    </div>
  );
}

function TypedSignature({ name, onChange }: { name: string; onChange: (dataUrl: string | null) => void }) {
  const [fontReady, setFontReady] = useState(false);

  useEffect(() => {
    loadScriptFont().then(() => setFontReady(true));
  }, []);

  useEffect(() => {
    if (!fontReady) return;
    const text = name.trim();
    if (text.length < 2) {
      onChange(null);
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 220;
    const ctx = canvas.getContext("2d")!;
    let size = 110;
    ctx.font = `600 ${size}px "${SCRIPT_FONT}", cursive`;
    while (ctx.measureText(text).width > 1140 && size > 40) {
      size -= 6;
      ctx.font = `600 ${size}px "${SCRIPT_FONT}", cursive`;
    }
    ctx.fillStyle = INK;
    ctx.textBaseline = "middle";
    ctx.fillText(text, 30, 115);
    onChange(trimmedPng(canvas));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, fontReady]);

  return (
    <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white h-40 flex items-center px-6 overflow-hidden">
      {name.trim().length >= 2 ? (
        <span className="text-5xl text-[#14213d] truncate" style={{ fontFamily: `"${SCRIPT_FONT}", cursive`, fontWeight: 600 }}>
          {name}
        </span>
      ) : (
        <span className="text-gray-400 text-sm">Type your full name above to create your signature</span>
      )}
    </div>
  );
}

export default function SignaturePad({ printedName, onChange }: { printedName: string; onChange: (value: SignatureValue) => void }) {
  const [mode, setMode] = useState<"typed" | "drawn">("typed");

  const tab = (value: "typed" | "drawn", label: string) => (
    <button
      type="button"
      onClick={() => {
        setMode(value);
        onChange(null);
      }}
      className={`flex-1 py-2 text-sm font-semibold rounded-md transition ${mode === value ? "bg-white shadow text-[#0A1628]" : "text-gray-500"}`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-3">
        {tab("typed", "Type it")}
        {tab("drawn", "Draw it")}
      </div>
      {mode === "typed" ? (
        <TypedSignature name={printedName} onChange={(dataUrl) => onChange(dataUrl ? { method: "typed", dataUrl } : null)} />
      ) : (
        <DrawPad onChange={(dataUrl) => onChange(dataUrl ? { method: "drawn", dataUrl } : null)} />
      )}
    </div>
  );
}
