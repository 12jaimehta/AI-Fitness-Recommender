"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/supabase-client";
import { Image as ImageIcon, X, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

type UploadImageProps = {
  label?: string;
  bucket?: string; // default: trainer-avatars
  pathPrefix?: string; // e.g. "trainers/<userId>"
  value?: string | null;
  onChange: (url: string | null) => void;
  className?: string;
};

export default function UploadImage({
  label = "Profile Image",
  bucket = "trainer-avatars",
  pathPrefix = "trainers",
  value,
  onChange,
  className = "",
}: UploadImageProps) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = `${pathPrefix}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error(uploadError);
        setUploading(false);
        return;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      if (data?.publicUrl) {
        onChange(data.publicUrl);
      }
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    onChange(null);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label className="text-sm font-semibold text-[#162a41]">{label}</label>

      <div className="flex items-center gap-4">
        <label
          className={cn(
            "flex-1 flex items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-3 text-sm cursor-pointer transition",
            "bg-white/70 hover:bg-white shadow-sm",
            uploading ? "opacity-70 cursor-not-allowed" : ""
          )}
        >
          <UploadCloud className="w-4 h-4 text-[#162a41]" />
          <span className="text-[#162a41]">
            {uploading ? "Uploading..." : "Click to upload image"}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>

        {value && (
          <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow"
            >
              <X className="w-3 h-3 text-red-500" />
            </button>
          </div>
        )}

        {!value && (
          <div className="w-16 h-16 rounded-xl border border-gray-200 bg-gray-100 flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-gray-400" />
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Recommended: square image, at least 400x400px.
      </p>
    </div>
  );
}
