"use client";

import { useState, useEffect } from "react";

const words = ["sorted.", "simplified.", "handled.", "covered."];

export default function AnimatedText() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="relative inline-flex overflow-hidden align-bottom">
      {/* 
        The invisible placeholder dictates the EXACT width and height of this container.
        Because it is in the normal document flow, it locks the height to exactly 1 line. 
      */}
      <em className="invisible not-italic">simplified.</em>
      
      {/* 
        The scrolling text is absolutely positioned.
        Because it is absolute, it DOES NOT expand the parent container's height.
        The parent's overflow-hidden will successfully clip everything outside the 1 line.
      */}
      <span
        className="absolute top-0 left-0 w-full flex flex-col transition-transform duration-700"
        style={{
          transform: `translateY(-${index * (100 / words.length)}%)`,
          transitionTimingFunction: "cubic-bezier(0.77, 0, 0.175, 1)"
        }}
      >
        {words.map((word, i) => (
          <em key={i} className="not-italic text-[#315cff]">
            {word}
          </em>
        ))}
      </span>
    </span>
  );
}
