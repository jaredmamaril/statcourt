"use client";

import Image from "next/image";
import { useState } from "react";
import type { CSSProperties } from "react";

type PlayerImageProps = {
  src?: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  style?: CSSProperties;
  // Above-the-fold images (e.g. the player page headshot, its largest paint): load
  // immediately at high priority instead of lazily.
  priority?: boolean;
};

export default function PlayerImage({
  src,
  alt,
  width,
  height,
  className = "",
  style,
  priority = false,
}: PlayerImageProps) {
  const fallbackSrc = "/blank-player.svg";
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imageSrc = src && failedSrc !== src ? src : fallbackSrc;

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      loading={priority ? "eager" : undefined}
      fetchPriority={priority ? "high" : undefined}
      onError={() => {
        if (src) {
          setFailedSrc(src);
        }
      }}
    />
  );
}
