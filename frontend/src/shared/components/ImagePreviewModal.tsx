type ImagePreviewModalProps = {
  imageUrl: string;
  alt?: string;
  onClose: () => void;
};

export function ImagePreviewModal({
  imageUrl,
  alt = 'Hình ảnh',
  onClose,
}: ImagePreviewModalProps) {
  if (!imageUrl) {
    return null;
  }

  return (
    <div
      className="
        fixed inset-0 z-[200]
        flex items-center justify-center
        bg-black/75 p-6
      "
      onClick={onClose}
    >
      <img
        src={imageUrl}
        alt={alt}
        className="
          max-h-[85vh]
          max-w-[90vw]
          bg-white object-contain
        "
        onClick={(event) =>
          event.stopPropagation()
        }
      />
    </div>
  );
}