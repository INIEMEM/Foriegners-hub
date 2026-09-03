import Link from "next/link";
import Image from "next/image";

/**
 * Foreigners Hub logo.
 */
export default function Logo({ className = "", light = false }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-0 select-none ${className}`}>
      <Image 
        src="/logo.jpg" 
        alt="Foreigners Hub Logo" 
        width={100} 
        height={25}
        className="object-contain"
        priority
      />
    </Link>
  );
}
