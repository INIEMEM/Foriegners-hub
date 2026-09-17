import Link from "next/link";
import Image from "next/image";

/**
 * Foreigners Hub logo.
 */
export default function Logo({
  className = "",
  light = false,
  asLink = true,
  withText = true,
  width = 38,
  height,
}) {
  const calculatedHeight = height || Math.round(width * (444 / 464));
  const content = (
    <span className={`fh-logo-wrap ${light ? "fh-logo-light" : ""} ${className}`}>
      <Image 
        src="/logo-mark.png" 
        alt="Foreigners Hub Logo" 
        width={width} 
        height={calculatedHeight}
        className="object-contain fh-logo-img"
        style={{ width: `${width}px`, height: "auto" }}
        priority
      />
      {withText && (
        <span className="fh-logo-text">Foreigners Hub</span>
      )}
    </span>
  );

  if (!asLink) {
    return content;
  }

  return (
    <Link href="/" className="fh-logo-link">
      {content}
    </Link>
  );
}
