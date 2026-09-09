import Link from "next/link";
import Image from "next/image";

/**
 * Foreigners Hub logo.
 */
export default function Logo({ className = "", light = false, asLink = true }) {
  const content = (
    <Image 
      src="/logo.jpg" 
      alt="Foreigners Hub Logo" 
      width={100} 
      height={25}
      className="object-contain"
      style={{ width: "auto", height: "auto" }}
      priority
    />
  );

  if (!asLink) {
    return (
      <div className={`inline-flex items-center gap-0 select-none ${className}`}>
        {content}
      </div>
    );
  }

  return (
    <Link href="/" className={`inline-flex items-center gap-0 select-none ${className}`}>
      {content}
    </Link>
  );
}
