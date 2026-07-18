export type UploadedImage = {
    image_url: string;
    public_id: string;
    width: number | null;
    height: number | null;
    bytes: number | null;
};

export type LocalImageUpload = {
    uri: string;
    fileName?: string | null;
    mimeType?: string | null;
};