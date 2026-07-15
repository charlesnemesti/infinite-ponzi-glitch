import { clsx } from "clsx";
import { BRAND_NAME } from "@/lib/brand/config";

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
  showBorder = false,
  className,
  priority = false,
}: BrandLogoProps) {
  const px = SIZES[size];

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt={`${BRAND_NAME} logo`}
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
