"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, GalleryHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface PhotoEntry {
    photo_url: string;
    date: string;
    // Add other relevant fields like notes, etc.
}

interface TransformationGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: PhotoEntry[];
}

export default function TransformationGalleryModal({ isOpen, onClose, photos }: TransformationGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const totalPhotos = photos.length;
  const currentPhoto = photos[currentIndex];

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPhotos);
  };

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPhotos) % totalPhotos);
  };

  if (totalPhotos === 0) return null; // Modal shouldn't open if no photos exist

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/90 p-5 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl relative overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-[#162a41] text-white">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <GalleryHorizontal size={22} className="text-emerald-300" />
                    Transformation Gallery
                </h2>
                <button onClick={onClose} className="p-1 rounded-full text-white/70 hover:bg-white/10 transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Photo View Area */}
            <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                <img 
                    src={currentPhoto.photo_url} 
                    alt={`Progress Photo ${currentIndex + 1}`} 
                    className="w-full h-full object-contain max-h-[70vh]"
                />

                {/* Navigation Buttons */}
                {totalPhotos > 1 && (
                    <>
                        <button 
                            onClick={prevPhoto} 
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button 
                            onClick={nextPhoto} 
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}

                {/* Caption / Date */}
                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white p-4 flex justify-between items-center backdrop-blur-sm">
                    <span className="text-sm font-medium">
                        {currentPhoto.date ? new Date(currentPhoto.date).toLocaleDateString() : 'Date Unknown'}
                    </span>
                    <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full">
                        {currentIndex + 1} / {totalPhotos}
                    </span>
                </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}