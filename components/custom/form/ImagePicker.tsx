"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { Upload, User, X } from "lucide-react";
import { useImageStore } from "@/stores/image_store";

export default function ImagePicker({
  uid,
  url, // expects a storage path like "1234-abc.png"
  size,
  bucket,
  title,
  onUpload, // will be called with the new storage path (or "" on remove)
}: {
  uid: string | null;
  url: string | null;
  size: number;
  bucket: string;
  title: string;
  onUpload: (url: string) => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const objectUrlRef = useRef<string | null>(null);
  const imageStore = useImageStore((state) => state);

  async function downloadImage(path: string) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(path);
      if (error) throw error;

      // Revoke previous object URL (if any) before creating a new one
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      const objUrl = URL.createObjectURL(data);
      objectUrlRef.current = objUrl;
      setAvatarUrl(objUrl);
      imageStore.setImage(path, objUrl);
    } catch (err) {
      //console.log("Error downloading image:", err);
      setAvatarUrl(null);
    }
  }

  useEffect(() => {
    if (url) downloadImage(url);
    else setAvatarUrl(null);
    // cleanup on unmount
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, [url]);

  const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file || !uid) return;

      const fileExt = file.name.split(".").pop() ?? "bin";
      const filePath = `${uid}-${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: false });

      if (uploadError) {
        //console.log("Error uploading avatar:", uploadError);
        return;
      }

      onUpload(filePath); // parent should persist this path
      // Optionally show immediately without waiting for parent state:
      await downloadImage(filePath);
    } catch (err) {
      //console.log("Error uploading avatar:", err);
    } finally {
      setUploading(false);
      if (event.target) event.target.value = ""; // allow reselecting same file
    }
  };

  const removeAvatar = async () => {
    try {
      if (!url) return;
      setUploading(true);

      const { error } = await supabase.storage.from(bucket).remove([url]);
      //if (error) console.log("Error removing from storage:", error);

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setAvatarUrl(null);
      onUpload(""); // tell parent it's cleared
      imageStore.removeImage(url);
    } catch (err) {
      //console.log("Error removing avatar:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative group cursor-pointer">
        <div
          className="relative rounded-full overflow-hidden border-4 border-primary/20 group-hover:border-primary/40 transition-colors"
          style={{ width: size, height: size }}
        >
          {avatarUrl ? (
            <Image
              width={size}
              height={size}
              src={avatarUrl}
              alt={title}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <User className="w-10 h-10 text-primary/60" />
            </div>
          )}
          <div className="absolute inset-0 bg-primary/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <Upload className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {uploading && (
          <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </div>

      {avatarUrl && !uploading && (
        <button
          type="button"
          onClick={removeAvatar}
          className="absolute -top-2 -right-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-800 rounded-full p-1.5 shadow-sm transition-colors cursor-pointer"
          title="Remove profile picture"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
