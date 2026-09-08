"use client";

import { useEffect, useRef, useState } from "react";

export default function ScrollReveal({ children, delay = 0, className = "", as = "div" }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  const Tag = as;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const delayClass = delay === 1 ? "fh-delay-1" : delay === 2 ? "fh-delay-2" : delay === 3 ? "fh-delay-3" : "";

  return (
    <Tag
      ref={ref}
      className={`${className} ${isVisible ? `fh-fade-in ${delayClass}` : "opacity-0"}`}
    >
      {children}
    </Tag>
  );
}
