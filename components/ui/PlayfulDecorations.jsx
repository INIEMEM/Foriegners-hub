"use client";

/**
 * PlayfulDecorations
 * 
 * Provides vibrant, organic edge blobs, imperfect circles, and playful floating
 * accent dots inspired by the Foreigners Hub flyer and youth-oriented design system.
 * Tailored for 17-24 year old international students.
 * 
 * All elements are strictly non-interactive (pointer-events-none, select-none)
 * and safely positioned within overflow-hidden containers.
 */

// Core Brand Palette from Foreigners Hub Logo & Flyer
export const BRAND_COLORS = {
  navy: "#232742",        // Dark navy/indigo top-left flyer blob
  coral: "#ea580c",       // Warm vibrant coral/orange flyer edge blob
  coralLight: "#ff6d43",  // Lighter coral accent
  blue: "#315cff",        // Electric brand blue
  blueLight: "#5b7eff",   // Light electric blue
  green: "#16a34a",       // Leaf green from logo
  greenLight: "#22c55e",  // Bright emerald green
  yellow: "#f59e0b",      // Sunny amber yellow from logo
  yellowLight: "#fbbf24", // Golden sunshine yellow
  purple: "#8b5cf6",      // Playful violet/purple from logo
  purpleLight: "#a855f7", // Soft lilac
  cyan: "#0ea5e9",        // Bright sky cyan
};

/**
 * Top-left Corner Organic Blob (direct match to flyer top-left corner)
 */
export function TopLeftBlob({ color = BRAND_COLORS.navy, className = "" }) {
  return (
    <div
      className={`absolute -top-3 -left-3 pointer-events-none select-none z-0 ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 220 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 drop-shadow-sm opacity-95 transition-transform duration-700"
      >
        <path
          d="M0 0 L170 0 C155 35 150 75 125 110 C95 150 55 175 0 190 Z"
          fill={color}
        />
      </svg>
    </div>
  );
}

/**
 * Right-edge Protruding Organic Blob (direct match to flyer right edge)
 */
export function RightEdgeBlob({ color = BRAND_COLORS.coral, className = "" }) {
  return (
    <div
      className={`absolute top-1/4 -right-1 pointer-events-none select-none z-0 ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 140 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-14 sm:w-20 md:w-28 h-48 sm:h-64 md:h-80 drop-shadow-sm opacity-90 transition-transform duration-700"
      >
        <path
          d="M140 0 C100 45 40 85 20 140 C-2 195 45 250 140 300 Z"
          fill={color}
        />
      </svg>
    </div>
  );
}

/**
 * Left-edge Protruding Organic Blob
 */
export function LeftEdgeBlob({ color = BRAND_COLORS.blue, className = "" }) {
  return (
    <div
      className={`absolute top-1/3 -left-1 pointer-events-none select-none z-0 ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 140 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-14 sm:w-20 md:w-28 h-48 sm:h-64 md:h-80 drop-shadow-sm opacity-90 transition-transform duration-700"
      >
        <path
          d="M0 0 C40 45 100 85 120 140 C142 195 95 250 0 300 Z"
          fill={color}
        />
      </svg>
    </div>
  );
}

/**
 * Bottom-right Corner Organic Blob
 */
export function BottomRightBlob({ color = BRAND_COLORS.green, className = "" }) {
  return (
    <div
      className={`absolute -bottom-4 -right-4 pointer-events-none select-none z-0 ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 220 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 drop-shadow-sm opacity-95 transition-transform duration-700"
      >
        <path
          d="M220 220 L50 220 C65 185 70 145 95 110 C125 70 165 45 220 30 Z"
          fill={color}
        />
      </svg>
    </div>
  );
}

/**
 * Imperfect Circle (Pebble Shape)
 */
export function ImperfectCircle({
  size = 56,
  color = BRAND_COLORS.yellow,
  opacity = 0.85,
  variant = 1,
  outline = false,
  className = "",
  style = {},
}) {
  const radiusVariants = [
    "60% 40% 30% 70% / 60% 30% 70% 40%",
    "53% 47% 70% 30% / 45% 58% 42% 55%",
    "40% 60% 65% 35% / 55% 40% 60% 45%",
    "68% 32% 45% 55% / 40% 65% 35% 60%",
  ];

  const borderRadius = radiusVariants[variant % radiusVariants.length];

  return (
    <div
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius,
        backgroundColor: outline ? "transparent" : color,
        border: outline ? `2.5px dashed ${color}` : "none",
        opacity,
        boxShadow: outline ? "none" : `0 8px 24px ${color}28`,
        ...style,
      }}
    />
  );
}

/**
 * Floating Accent Dot (DesignCraft style scattered dots)
 */
export function FloatingDot({
  size = 12,
  color = BRAND_COLORS.yellow,
  opacity = 0.9,
  className = "",
  style = {},
}) {
  return (
    <div
      className={`rounded-full pointer-events-none select-none ${className}`}
      aria-hidden="true"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        opacity,
        ...style,
      }}
    />
  );
}

/**
 * Preset: Home Page Playful Decorations
 * Combines flyer top-left Navy blob, Coral right-edge blob, and colorful floating circles.
 */
export function HomePlayfulDecorations() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0" aria-hidden="true">
      {/* 1. Flyer Right-Edge Protruding Blob (Warm Coral) */}
      <RightEdgeBlob color={BRAND_COLORS.coral} className="top-[18%] sm:top-[22%]" />

      {/* Companion floating dots near right blob */}
      <div className="absolute top-[28%] right-20 sm:right-32 hidden md:block fh-float-2">
        <ImperfectCircle size={38} color={BRAND_COLORS.purpleLight} opacity={0.35} variant={2} />
      </div>
      <div className="absolute top-[35%] right-8 sm:right-16 hidden sm:block fh-pulse-gentle">
        <FloatingDot size={11} color={BRAND_COLORS.yellow} />
      </div>

      {/* 2. Left-Side Organic Blue Accent */}
      <div className="absolute top-[62%] -left-6 hidden md:block fh-float-2">
        <ImperfectCircle size={88} color={BRAND_COLORS.blue} opacity={0.15} variant={1} />
      </div>
      <div className="absolute top-[65%] left-14 hidden lg:block fh-float-1">
        <FloatingDot size={13} color={BRAND_COLORS.green} />
      </div>

      {/* 3. Playful Dashed Ring on Right Side (DesignCraft style) */}
      <div className="absolute top-[72%] right-12 hidden lg:block fh-float-1">
        <ImperfectCircle size={48} color={BRAND_COLORS.blueLight} outline={true} opacity={0.5} variant={3} />
      </div>

      {/* 4. Bottom Left Corner Fresh Green accent */}
      <div className="absolute bottom-6 left-6 hidden sm:block fh-pulse-gentle">
        <FloatingDot size={9} color={BRAND_COLORS.coral} />
      </div>
    </div>
  );
}

/**
 * Preset: Bikes Page Playful Decorations
 * Outdoor, kinetic mobility vibe: Fresh Green edge blob, Sunny Yellow rings, Coral and Cyan floating dots.
 */
export function BikesPlayfulDecorations() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0" aria-hidden="true">
      {/* 1. Fresh Leaf Green Right-Edge Blob */}
      <RightEdgeBlob color={BRAND_COLORS.green} className="top-[25%] sm:top-[28%]" />

      {/* Companion Coral and Cyan floating dots */}
      <div className="absolute top-[34%] right-20 sm:right-32 hidden md:block fh-float-2">
        <ImperfectCircle size={36} color={BRAND_COLORS.coralLight} opacity={0.4} variant={2} />
      </div>
      <div className="absolute top-[20%] right-10 sm:right-16 hidden sm:block fh-pulse-gentle">
        <FloatingDot size={12} color={BRAND_COLORS.cyan} />
      </div>

      {/* 2. Mid-section Left Playful Violet Ring */}
      <div className="absolute top-[68%] -left-4 hidden md:block fh-float-2">
        <ImperfectCircle size={74} color={BRAND_COLORS.purple} opacity={0.16} variant={0} />
      </div>
      <div className="absolute top-[72%] left-16 hidden lg:block fh-float-1">
        <FloatingDot size={11} color={BRAND_COLORS.yellowLight} />
      </div>

      {/* 3. Dashed bike-wheel inspired ring */}
      <div className="absolute top-[60%] right-8 hidden lg:block fh-float-1">
        <ImperfectCircle size={52} color={BRAND_COLORS.green} outline={true} opacity={0.45} variant={0} />
      </div>
    </div>
  );
}

/**
 * Preset: Apartments Page Playful Decorations
 * Warm, cozy, community living vibe: Warm Terracotta/Coral, Soft Lilac, Golden Amber.
 */
export function ApartmentsPlayfulDecorations() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0" aria-hidden="true">
      {/* 1. Soft Lilac/Purple Right-Edge Blob */}
      <RightEdgeBlob color={BRAND_COLORS.purple} className="top-[20%] sm:top-[24%]" />

      {/* Companion golden warm circle & sky cyan dot */}
      <div className="absolute top-[30%] right-16 sm:right-28 hidden md:block fh-float-2">
        <ImperfectCircle size={42} color={BRAND_COLORS.yellow} opacity={0.45} variant={1} />
      </div>
      <div className="absolute top-[18%] right-8 sm:right-14 hidden sm:block fh-pulse-gentle">
        <FloatingDot size={12} color={BRAND_COLORS.cyan} />
      </div>

      {/* 3. Left-Side Mint Green Organic Pebble */}
      <div className="absolute top-[65%] -left-5 hidden md:block fh-float-2">
        <ImperfectCircle size={82} color={BRAND_COLORS.green} opacity={0.15} variant={2} />
      </div>
      <div className="absolute top-[70%] left-14 hidden lg:block fh-float-1">
        <FloatingDot size={10} color={BRAND_COLORS.coralLight} />
      </div>

      {/* 4. Warm Gold Outline Ring */}
      <div className="absolute top-[75%] right-10 hidden lg:block fh-float-1">
        <ImperfectCircle size={46} color={BRAND_COLORS.yellow} outline={true} opacity={0.5} variant={1} />
      </div>
    </div>
  );
}

/**
 * Preset: Rental Request Flow Playful Decorations
 * Friendly, reassuring, and approachable.
 */
export function RequestPlayfulDecorations() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0" aria-hidden="true">
      {/* 1. Top-Left Navy Accent Blob */}
      <TopLeftBlob color={BRAND_COLORS.navy} className="opacity-90" />

      {/* Sunny yellow pebble */}
      <div className="absolute top-10 left-32 sm:left-40 hidden sm:block fh-float-1">
        <ImperfectCircle size={20} color={BRAND_COLORS.yellow} opacity={0.85} variant={0} />
      </div>

      {/* 2. Right-Edge Coral Accent */}
      <RightEdgeBlob color={BRAND_COLORS.coral} className="top-[15%] sm:top-[20%]" />

      {/* 3. Floating friendly dots around form container */}
      <div className="absolute top-[40%] right-8 sm:right-16 hidden md:block fh-float-2">
        <FloatingDot size={12} color={BRAND_COLORS.blueLight} />
      </div>
      <div className="absolute top-[60%] -left-3 hidden md:block fh-float-1">
        <ImperfectCircle size={60} color={BRAND_COLORS.green} opacity={0.18} variant={1} />
      </div>
      <div className="absolute top-[75%] right-12 hidden lg:block fh-pulse-gentle">
        <ImperfectCircle size={38} color={BRAND_COLORS.purple} outline={true} opacity={0.4} variant={2} />
      </div>
    </div>
  );
}
