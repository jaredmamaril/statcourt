import { renderPlayerShareImage } from "./player-share-image";

export const alt = "StatCourt player profile card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

type PlayerOpenGraphImageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PlayerOpenGraphImage({
  params,
}: PlayerOpenGraphImageProps) {
  const { slug } = await params;

  return renderPlayerShareImage(slug, "peak");
}
