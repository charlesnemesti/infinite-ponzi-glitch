import { clsx } from "clsx";

type BrandLogoProps = {
  size?: "sm" | "md" | "lg" | "xl";
  showBorder?: boolean;
  className?: string;
  priority?: boolean;
};

const SIZES = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
} as const;

export function BrandLogo({
  size = "md",
  showBorder = true,
  className,
  priority = false,
}: BrandLogoProps) {
  const px = SIZES[size];

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="Infinite Ponzi Glitch"
      width={px}
      height={px}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={clsx(
        "block shrink-0 object-contain",
        showBorder && "border border-terminal/60",
        className,
      )}
      style={{ width: px, height: px }}
    />
  );
}
