"use client";

import { Camera, Upload, History } from "lucide-react";

interface PhotoGalleryProps {
  photos: any[];
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onViewGallery: () => void;
}

export default function PhotoGallery({ photos, onUpload, onViewGallery }: PhotoGalleryProps) {
  const beforePhoto = photos[photos.length - 1]; // Oldest photo (last in a descending array)
  const currentPhoto = photos[0]; // Newest photo (first in a descending array)

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col">
      <div className="grid grid-cols-2 gap-4 mb-4 flex-1">
        {/* Start Photo */}
        <div className="relative aspect-[3/4] rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden">
          {beforePhoto ? (
            <>
              <img src={beforePhoto.photo_url} alt="Start" className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm">
                START
              </div>
            </>
          ) : (
            <div className="text-center p-4">
              <Camera size={24} className="text-slate-300 mx-auto mb-2" />
              <span className="text-xs font-bold text-slate-400">No starting photo</span>
            </div>
          )}
          {beforePhoto && <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent text-white text-[11px] p-3 text-center font-medium">Day 1</div>}
        </div>

        {/* Recent Photo */}
        <div className="relative aspect-[3/4] rounded-xl bg-[#282828] overflow-hidden group cursor-pointer shadow-inner">
          {currentPhoto ? (
            <>
              <img src={currentPhoto.photo_url} alt="Current" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                LATEST
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/40">
               <div className="p-3 rounded-full bg-white/10 mb-2">
                 <Upload size={20} />
               </div>
              <span className="text-xs font-medium">Upload current</span>
            </div>
          )}

          <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-[2px]">
            <input type="file" className="hidden" accept="image/*" onChange={onUpload} />
            <div className="text-white flex flex-col items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <div className="p-3 bg-white rounded-full text-[#282828] shadow-lg">
                <Upload size={20} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Update Photo</span>
            </div>
          </label>
        </div>
      </div>

      <button 
        onClick={onViewGallery} 
        disabled={photos.length === 0}
        className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-[#282828] bg-slate-50 hover:bg-slate-100 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <History size={14} />
        View Transformation Gallery
      </button>
    </div>
  );
}