from pathlib import Path
from typing import BinaryIO
from uuid import UUID

import cloudinary.uploader
from cloudinary.exceptions import Error as CloudinaryError

from app.core.config import settings

ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif"
}

class MediaUploadError(Exception):
    pass

class MediaDeleteError(Exception):
    pass

def validate_image_upload(*, content_type: str | None, size: int | None) -> None:
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise MediaUploadError("Only JPEG, PNG, WebP, HEIC, and HEIF images are supported.")
    
    if (size is not None and size > settings.max_image_upload_bytes):
        max_megabytes = (settings.max_image_upload_bytes) // (1024 * 1024)

        raise MediaUploadError(f"Images must be {max_megabytes} MB or smaller.")
    
def upload_adventure_image(*, file: BinaryIO, user_id: UUID, filename: str | None) -> dict[str, object]:
    suffix = Path(filename or "").suffix.lower()

    try:
        result = cloudinary.uploader.upload(
            file, 
            resource_type="image", 
            folder=f"adventurelog/users/{user_id}", 
            use_filename=False, overwrite=False, 
            filename_override=filename, 
            context={
                "source": "adventurelog",
                "original_extension": suffix,
            }
        )
    except CloudinaryError as exc:
        raise MediaUploadError("The image could not be uploaded.") from exc
    
    secure_url = result.get("secure_url")
    public_id = result.get("public_id")

    if not isinstance(secure_url, str):
        raise MediaUploadError("Cloudinary did not return an image URL.")
    
    if not isinstance(public_id, str):
        raise MediaUploadError("Cloudinary did not return an image ID.")
    
    return {
        "image_url": secure_url,
        "public_id": public_id,
        "width": result.get("width"),
        "height": result.get("height"),
        "bytes": result.get("bytes")
    }

def delete_adventure_image(*, public_id: str, user_id: UUID) -> None:
    expected_prefix = f"adventurelog/users/{user_id}/"

    if not public_id.startswith(expected_prefix):
        raise MediaDeleteError("This uploaded image does not belong to the current user.")
    
    try: 
        result = cloudinary.uploader.destroy(public_id, resource_type="image", invalidate=True)
    except CloudinaryError as exc:
        raise MediaDeleteError("The image could not be deleted.") from exc
    
    deletion_result = result.get("result")

    if deletion_result not in {"ok", "not found"}:
        raise MediaDeleteError("Cloudinary did not confirm deletion.")