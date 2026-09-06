import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { uploadImage } from "@/lib/image-upload.functions";

interface ImageUploadButtonProps {
  /** Subdirectory under public/images/ (e.g. "blog", "docs") */
  subdir: string;
  /** Callback that receives the uploaded image URL and optional alt text */
  onInsert: (markdown: string) => void;
  /** Button label */
  label?: string;
}

/**
 * A button that lets the user pick an image file, uploads it to GitHub
 * via a server function, and calls onInsert with the Markdown image syntax.
 *
 * The image is served via jsDelivr CDN (free, unlimited bandwidth).
 */
export function ImageUploadButton({
  subdir,
  onInsert,
  label = "插入图片",
}: ImageUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("请选择图片文件");
      return;
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error("图片大小不能超过 5MB");
      return;
    }

    setUploading(true);
    try {
      // Read file as base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          // Strip the data URL prefix (e.g. "data:image/png;base64,")
          const base64 = result.split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);

      const base64 = await base64Promise;

      // Generate a unique filename with timestamp
      const ext = file.name.split(".").pop() || "png";
      const timestamp = Date.now();
      const safeName = file.name
        .replace(/\.[^.]+$/, "")
        .replace(/[^a-zA-Z0-9-_]/g, "")
        .slice(0, 30);
      const filename = `${safeName || "image"}-${timestamp}.${ext}`;

      const result = await uploadImage({
        data: { filename, base64, subdir },
      });

      const altText = file.name.replace(/\.[^.]+$/, "").slice(0, 50);
      const markdown = `![${altText}](${result.url})`;

      onInsert(markdown);
      toast.success("图片上传成功，已插入到正文");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "上传失败";
      toast.error(msg);
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-white/70 px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-white disabled:opacity-60"
      >
        {uploading ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <ImagePlus className="size-3.5" />
        )}
        {uploading ? "上传中…" : label}
      </button>
    </>
  );
}
