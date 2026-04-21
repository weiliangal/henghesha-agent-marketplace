import { ImageOff } from "lucide-react";
import { useState } from "react";

import { resolveAssetUrl } from "../api/client";

export default function SmartImage({ src, alt, className = "", fallbackClassName = "", label = "图片预览" }) {
  const [failed, setFailed] = useState(false);
  const resolvedSrc = resolveAssetUrl(src);
  const fallbackVisual = getFallbackVisual(alt || label);

  if (!resolvedSrc || failed) {
    return (
      <div
        role="img"
        aria-label={alt || label}
        className={`relative flex items-center justify-center overflow-hidden bg-slate-100 text-white ${fallbackClassName || className}`}
        style={{ background: fallbackVisual.background }}
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20" />
        <div className="absolute -bottom-12 left-8 h-48 w-48 rounded-full bg-white/10" />
        <div className="absolute inset-x-8 bottom-8 h-20 rounded-[28px] bg-white/10" />
        <div className="relative z-10 flex max-w-[72%] flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 shadow-sm ring-1 ring-white/20">
            <ImageOff size={22} />
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">{label}</span>
          <span className="line-clamp-2 font-display text-2xl font-semibold leading-tight">{fallbackVisual.title}</span>
        </div>
      </div>
    );
  }

  return <img src={resolvedSrc} alt={alt} className={className} onError={() => setFailed(true)} />;
}

function getFallbackVisual(seed) {
  const palettes = [
    "linear-gradient(135deg, #06101d 0%, #0e7490 54%, #ff8a3d 100%)",
    "linear-gradient(135deg, #2b0f3a 0%, #d94645 54%, #ffd166 100%)",
    "linear-gradient(135deg, #052e2b 0%, #0f766e 58%, #86efac 100%)",
    "linear-gradient(135deg, #082f49 0%, #0891b2 58%, #a5f3fc 100%)",
    "linear-gradient(135deg, #0f172a 0%, #1d4ed8 58%, #93c5fd 100%)",
    "linear-gradient(135deg, #241144 0%, #7c3aed 58%, #c4b5fd 100%)",
    "linear-gradient(135deg, #1a2e05 0%, #65a30d 58%, #d9f99d 100%)",
    "linear-gradient(135deg, #312e81 0%, #c026d3 58%, #f9a8d4 100%)",
  ];

  const text = String(seed || "Agent");
  const hash = Array.from(text).reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return {
    background: palettes[hash % palettes.length],
    title: text.slice(0, 18),
  };
}
