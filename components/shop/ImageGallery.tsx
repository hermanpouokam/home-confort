"use client";

import { useState } from "react";
import SmartImage from "@/components/ui/smart-image";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Play, ZoomIn } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  name: string;
}

function isVideo(url: string) {
  return /\.(mp4|webm|ogg|mov)$/i.test(url);
}

export default function ImageGallery({ images, name }: ImageGalleryProps) {
  const media = images.length > 0 ? images : ["https://picsum.photos/seed/default/800/600"];
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const prev = () => setActiveIndex((i) => (i === 0 ? media.length - 1 : i - 1));
  const next = () => setActiveIndex((i) => (i === media.length - 1 ? 0 : i + 1));

  const active = media[activeIndex];
  const activeIsVideo = isVideo(active);

  return (
    <>
      <div className="flex gap-3">
        {/* Sidebar thumbnails */}
        {media.length > 1 && (
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[520px] pr-1">
            {media.map((url, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "relative w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all",
                  i === activeIndex
                    ? "border-emerald-400 shadow-md"
                    : "border-[#E8E8E3] hover:border-emerald-200 opacity-70 hover:opacity-100"
                )}
              >
                {isVideo(url) ? (
                  <div className="w-full h-full bg-[#F4F4F1] flex items-center justify-center">
                    <Play className="w-5 h-5 text-[#6B7280]" />
                  </div>
                ) : (
                  <SmartImage src={url} alt={`${name} ${i + 1}`} fill sizes="64px" className="object-cover" />
                )}
                {isVideo(url) && (
                  <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] text-center py-0.5">Vidéo</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Main viewer */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="relative aspect-square bg-[#F4F4F1] rounded-2xl overflow-hidden border border-[#E8E8E3] group">
            {activeIsVideo ? (
              <video key={active} src={active} controls className="w-full h-full object-contain" playsInline />
            ) : (
              <>
                <SmartImage
                  src={active}
                  alt={name}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition-opacity duration-200"
                  priority
                />
                <button
                  onClick={() => setLightbox(true)}
                  className="absolute top-3 right-3 bg-white/80 rounded-xl p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  title="Agrandir"
                >
                  <ZoomIn className="w-4 h-4 text-[#6B7280]" />
                </button>
              </>
            )}

            {media.length > 1 && (
              <>
                <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-xl p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm">
                  <ChevronLeft className="w-4 h-4 text-[#111210]" />
                </button>
                <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-xl p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm">
                  <ChevronRight className="w-4 h-4 text-[#111210]" />
                </button>
              </>
            )}

            {media.length > 1 && (
              <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
                {media.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={cn("h-1.5 rounded-full transition-all", i === activeIndex ? "bg-emerald-400 w-4" : "w-1.5 bg-white/60 hover:bg-white/90")}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && !activeIsVideo && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl leading-none" onClick={() => setLightbox(false)}>✕</button>
          {media.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-xl p-2 text-white">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-xl p-2 text-white">
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          <div className="relative w-full max-w-3xl aspect-square" onClick={(e) => e.stopPropagation()}>
            <SmartImage src={active} alt={name} fill sizes="100vw" className="object-contain" />
          </div>
          <p className="absolute bottom-4 text-white/50 text-sm">{activeIndex + 1} / {media.length}</p>
        </div>
      )}
    </>
  );
}