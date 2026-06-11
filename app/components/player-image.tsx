"use client";

import Image from "next/image";
import { useState } from "react";

type PlayerImageProps = {
  src?: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
};

export default function PlayerImage({
  src,
  alt,
  width,
  height,
  className = "",
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
      onError={() => {
        if (src) {
          setFailedSrc(src);
        }
      }}
    />
  );
}
