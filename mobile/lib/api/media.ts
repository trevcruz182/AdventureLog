import { apiRequest } from "./client";

import type { LocalImageUpload, UploadedImage } from "@/types/media";

function inferFileName(image: LocalImageUpload, index: number): string {
    if(image.fileName) {
        return image.fileName
    }

    const uriFileName = image.uri.split("/").pop();

    return (uriFileName || `adventure-photo-${index + 1}.jpg`);
}

function inferMimeType(image: LocalImageUpload): string {
    if(image.mimeType) {
        return image.mimeType;
    }

    const normalizedUri = image.uri.toLowerCase();

    if(normalizedUri.endsWith(".png")) {
        return "image/png";
    }

    if(normalizedUri.endsWith(".webp")) {
        return "image/webp";
    }

    if(normalizedUri.endsWith(".heic") || normalizedUri.endsWith(".heif")) {
        return "image/heic";
    }

    return "image/jpeg";
}

export function uploadImageRequest(image: LocalImageUpload, index: number): Promise<UploadedImage> {
    const formData = new FormData();

    formData.append("image", {
        uri: image.uri,
        name: inferFileName(image, index),
        type: inferMimeType(image),
    } as unknown as Blob);

    return apiRequest<UploadedImage>("/media/images", {
        method: "POST",
        body: formData
    });
}

export function deleteUploadedImageRequest(publicId: string): Promise<void> {
    return apiRequest<void>("/media/images", {
        method: "DELETE",
        body: JSON.stringify({public_id: publicId})
    });
}