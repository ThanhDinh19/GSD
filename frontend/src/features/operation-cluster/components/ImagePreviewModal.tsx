type ImagePreviewModalProps = {
    imageUrl: string;
    onClose: () => void;
};

export default function ImagePreviewModal({
    imageUrl,
    onClose,
}: ImagePreviewModalProps) {
    return (
        <div
            className="fixed inset-0 z-[100] bg-black/75 flex items-center justify-center p-6"
            onClick={onClose}
        >
            <img
                src={imageUrl}
                alt="Hình mã hàng"
                className="w-[30vw] h-[50vh] object-contain bg-white"
                onClick={(event) =>
                    event.stopPropagation()
                }
            />
        </div>
    );
}