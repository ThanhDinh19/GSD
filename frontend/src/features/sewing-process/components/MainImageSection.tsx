import type {
  ChangeEvent,
} from 'react';

type MainImageSectionProps = {
  imageSrc: string;
  imageFileName: string;
  uploading: boolean;
  readOnly: boolean;

  onUpload: (
    event: ChangeEvent<HTMLInputElement>
  ) => void;

  onRemove: () => void;
};

export function MainImageSection({
  imageSrc,
  imageFileName,
  uploading,
  readOnly,
  onUpload,
  onRemove,
}: MainImageSectionProps) {
  return (
    <section className="xl:col-span-3 rounded-sm border border-slate-300 bg-white p-4">
      <div className="mb-3 inline-block border border-sky-300 bg-sky-100 px-3 py-1 text-xs font-bold">
        HÌNH ẢNH
      </div>

      <div className="space-y-3">
        <div className="flex h-[180px] items-center justify-center overflow-hidden rounded-sm border border-dashed border-slate-300 bg-slate-50">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt="Hình mã hàng"
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-xs text-slate-400">
              Chưa có hình ảnh
            </span>
          )}
        </div>

        {!readOnly && (
          <div className="flex gap-2">
            <label className="cursor-pointer rounded-sm border border-blue-300 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50">
              {uploading
                ? 'Đang upload...'
                : 'Upload hình'}

              <input
                type="file"
                accept="image/*"
                hidden
                disabled={uploading}
                onChange={onUpload}
              />
            </label>

            {imageFileName && (
              <button
                type="button"
                onClick={onRemove}
                className="rounded-sm border border-red-300 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
              >
                Xóa hình
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}