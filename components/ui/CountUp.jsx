"use client";

import { useState, useEffect, useRef } from "react";

export default function CountUp({ target, duration = 1800, className, style }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    let animFrameId = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = typeof window !== "undefined" ? window.performance.now() : 0;

          const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) {
              animFrameId = window.requestAnimationFrame(tick);
            } else {
              setCount(target);
            }
          };

          animFrameId = window.requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => {
      observer.disconnect();
      if (animFrameId && typeof window !== "undefined") {
        window.cancelAnimationFrame(animFrameId);
      }
    };
  }, [target, duration]);

  return (
    <span ref={ref} className={className} style={style}>
      {count}
    </span>
  );
}
