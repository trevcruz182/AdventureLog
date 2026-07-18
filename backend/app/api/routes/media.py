from fastapi import APIRouter, File, HTTPException, Response, UploadFile, status

from app.api.dependencies import CurrentUser
from app.core.config import settings
from app.schemas.media import DeleteUploadedImageRequest, UploadedImageRead
from app.services.media import MediaDeleteError, MediaUploadError, delete_adventure_image, upload_adventure_image

router = APIRouter(prefix="/media", tags=["Media"])

@router.post("/images", response_model=UploadedImageRead, status_code=status.HTTP_201_CREATED)
def upload_image(current_user: CurrentUser, image: UploadFile = File(...)) -> dict[str, object]:
    if image.content_type not in {
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/heic",
        "image/heif",
    }:
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Only JPEG, PNG, WebP, HEIC, and HEIF images are supported.")
    
    if(image.size is not None and image.size > settings.max_image_upload_bytes):
        raise HTTPException(status_code=status.HTTP_413_CONTENT_TOO_LARGE, detail="The image is larger than 10 MB.")
    
    try: 
        return upload_adventure_image(file=image.file, user_id=current_user.id, filename=image.filename)
    except MediaUploadError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    finally:
        image.file.close()

@router.delete("/images", status_code=status.HTTP_204_NO_CONTENT)
def delete_image(payload: DeleteUploadedImageRequest, current_user: CurrentUser) -> Response:
    try: 
        delete_adventure_image(public_id=payload.public_id, user_id=current_user.id)
    except MediaDeleteError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    
    return Response(status_code=status.HTTP_204_NO_CONTENT)