import NextImage from "next/image";
import { Play } from "lucide-react";

interface SmartImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
}

function isVideoUrl(src: string) {
  return /\.(mp4|webm|ogg|mov)$/i.test(src);
}

/**
 * SmartImage — gère automatiquement 3 cas :
 * - Vidéo (.mp4, .webm…) → placeholder avec icône Play (jamais dans <img>)
 * - Image locale /uploads/… → <img> natif (pas d'optimisation Next.js)
 * - Image distante https://… → <Image> Next.js optimisé
 */
export default function SmartImage({ src, alt, fill, sizes, className, priority, width, height }: SmartImageProps) {
  // Cas 1 : vidéo — afficher un placeholder, jamais dans <img>
  if (isVideoUrl(src)) {
    if (fill) {
      return (
        <div className="absolute inset-0 w-full h-full bg-[#F4F4F1] flex flex-col items-center justify-center gap-1">
          <Play className="w-8 h-8 text-[#6B7280]" />
          <span className="text-[10px] text-[#9CA3AF]">Vidéo</span>
        </div>
      );
    }
    return (
      <div
        className={`bg-[#F4F4F1] flex flex-col items-center justify-center gap-1 ${className ?? ""}`}
        style={{ width: width ?? "100%", height: height ?? "100%" }}
      >
        <Play className="w-6 h-6 text-[#6B7280]" />
        <span className="text-[10px] text-[#9CA3AF]">Vidéo</span>
      </div>
    );
  }

  // Cas 2 : image locale /uploads/…
  const isLocal = src.startsWith("/uploads/") || src.startsWith("/public/uploads/");
  if (isLocal) {
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className={`absolute inset-0 w-full h-full ${className ?? ""}`}
          style={{ objectFit: "cover" }}
          loading={priority ? "eager" : "lazy"}
        />
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={priority ? "eager" : "lazy"}
      />
    );
  }

  // Cas 3 : image distante — Next.js Image optimisé
  return (
    <NextImage
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      className={className}
      priority={priority}
      width={!fill ? (width ?? undefined) : undefined}
      height={!fill ? (height ?? undefined) : undefined}
    />
  );
}

/** Utilitaire exporté pour éviter de dupliquer la regex partout */
export { isVideoUrl };