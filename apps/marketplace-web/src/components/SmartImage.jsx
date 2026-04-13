import { ImageOff } from "lucide-react";
import { useState } from "react";

import { resolveAssetUrl } from "../api/client";

export default function SmartImage({ src, alt, className = "", fallbackClassName = "", label = "图片预览" }) {
  const [failed, setFailed] = useState(false);
  const resolvedSrc = resolveAssetUrl(src);

  if (!resolvedSrc || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-sky/15 via-white to-ember/15 text-ink/45 ${fallbackClassName || className}`}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <ImageOff size={20} />
          <span className="text-xs font-medium tracking-[0.2em] uppercase">{label}</span>
        </div>
      </div>
    );
  }

  return <img src={resolvedSrc} alt={alt} className={className} onError={() => setFailed(true)} />;
}
