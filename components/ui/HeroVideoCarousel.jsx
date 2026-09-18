"use client";

import { useState, useEffect, useRef } from "react";
import { Bike, Building2 } from "lucide-react";

const slides = [
  {
    id: "apartment",
    title: "Apartments",
    videoSrc: "/hero-video.mp4",
    icon: Building2,
  },
  {
    id: "bike",
    title: "E-Bikes",
    videoSrc: "/bike-video.mp4",
    icon: Bike,
  },
];

export default function HeroVideoCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const videoRefs = useRef([]);

  // Auto-advance carousel every 8 seconds unless hovered
  useEffect(() => {
    if (isPaused) return;

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 8000);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  // Ensure active video is playing
  useEffect(() => {
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      if (idx === activeIndex) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      } else {
        video.pause();
      }
    });
  }, [activeIndex]);

  return (
    <>
      <div
        className="fh-hero-image-wrap"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Videos with smooth crossfade */}
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`fh-hero-video-slide ${idx === activeIndex ? "active" : ""}`}
            aria-hidden={idx !== activeIndex}
          >
            <video
              ref={(el) => (videoRefs.current[idx] = el)}
              src={slide.videoSrc}
              autoPlay
              muted
              playsInline
              loop
              preload="auto"
            />
          </div>
        ))}

        {/* Top interactive switcher tabs */}
        <div className="fh-hero-carousel-tabs" role="tablist">
          {slides.map((slide, idx) => {
            const isActive = idx === activeIndex;
            const Icon = slide.icon;
            return (
              <button
                key={slide.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveIndex(idx)}
                className={`fh-hero-carousel-tab ${isActive ? "active" : ""}`}
                type="button"
              >
                <Icon size={14} />
                <span>{slide.title}</span>
              </button>
            );
          })}
        </div>

        {/* Carousel pagination dots */}
        <div className="fh-hero-carousel-nav" role="tablist" aria-label="Slide indicators">
          <div className="fh-hero-carousel-dots">
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                className={`fh-hero-carousel-dot ${idx === activeIndex ? "active" : ""}`}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Go to ${slide.title} video`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="fh-hero-route" />
    </>
  );
}
