"use client";

import { useState, useEffect, useRef } from "react";
import { Bike, Building2, ChevronLeft, ChevronRight, MapPin } from "lucide-react";

const slides = [
  {
    id: "bike",
    title: "E-Bikes",
    videoSrc: "/bike-video.mp4",
    tag: "⚡ E-Bike for rent",
    tagColor: "#ea580c",
    stickerIcon: Bike,
    stickerText: "Move around & earn",
  },
  {
    id: "apartment",
    title: "Apartments",
    videoSrc: "/hero-video.mp4",
    tag: "🏠 Student apartment",
    tagColor: "#315cff",
    stickerIcon: Building2,
    stickerText: "Move in. Settle in.",
  },
];

export default function HeroVideoCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const videoRefs = useRef([]);

  const currentSlide = slides[activeIndex];

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

  function handlePrev() {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }

  function handleNext() {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  }

  const StickerIcon = currentSlide.stickerIcon || MapPin;

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
            const Icon = slide.stickerIcon;
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

        {/* Carousel arrows & dots */}
        <div className="fh-hero-carousel-nav">
          <button
            type="button"
            className="fh-hero-carousel-btn prev"
            onClick={handlePrev}
            aria-label="Previous video"
          >
            <ChevronLeft size={16} />
          </button>
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
          <button
            type="button"
            className="fh-hero-carousel-btn next"
            onClick={handleNext}
            aria-label="Next video"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Floating Tag */}
      <div
        className="fh-hero-tag"
        style={{
          background: currentSlide.tagColor,
          transition: "background 0.3s ease, transform 0.2s ease",
        }}
      >
        {currentSlide.tag}
      </div>

      {/* Floating Sticker */}
      <div className="fh-hero-sticker">
        <span className="fh-hero-sticker-icon">
          <StickerIcon size={15} />
        </span>
        <span className="fh-hero-sticker-text">{currentSlide.stickerText}</span>
      </div>

      <div className="fh-hero-route" />
    </>
  );
}
