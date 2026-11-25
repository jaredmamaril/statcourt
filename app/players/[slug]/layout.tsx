type PlayerProfileLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

// Metadata lives in page.tsx, which receives ?mode for mode-matched previews.
export default function PlayerProfileLayout({
  children,
}: PlayerProfileLayoutProps) {
  return children;
}
