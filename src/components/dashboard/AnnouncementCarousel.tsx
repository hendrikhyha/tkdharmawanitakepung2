"use client";

import React, { useEffect, useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useQuery } from '@tanstack/react-query';
import { announcementsQueryOptions } from '@/services/announcements';
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';

export default function AnnouncementCarousel() {
  const { data: announcements, isLoading } = useQuery(announcementsQueryOptions());

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 6000, stopOnInteraction: true })
  ]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  if (isLoading) {
    return (
      <div className="w-full aspect-[21/9] sm:aspect-[24/7] rounded-3xl bg-slate-100 animate-pulse flex items-center justify-center">
        <ImageIcon className="w-8 h-8 text-slate-300" />
      </div>
    );
  }

  if (!announcements || announcements.length === 0) {
    return null; // Don't show anything if no announcements
  }

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-sm border border-slate-100 bg-white group">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {announcements.map((ann, idx) => (
            <div 
              key={ann.id} 
              className="relative flex-[0_0_100%] min-w-0 aspect-[21/9] sm:aspect-[24/7] bg-slate-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={ann.image_url} 
                alt={`Pengumuman ${idx + 1}`} 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      {announcements.length > 1 && (
        <>
          <button 
            onClick={scrollPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black/40"
            aria-label="Previous image"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={scrollNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black/40"
            aria-label="Next image"
          >
            <ChevronRight size={24} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {announcements.map((_, idx) => (
              <button
                key={idx}
                onClick={() => emblaApi?.scrollTo(idx)}
                className={`w-2 h-2 rounded-full transition-all shadow-sm ${
                  selectedIndex === idx 
                    ? "bg-white w-6" 
                    : "bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
