from pydantic import BaseModel, Field

class UploadedImageRead(BaseModel):
    image_url: str
    public_id: str
    width: int | None = None
    height: int | None = None
    bytes: int | None = None

class DeleteUploadedImageRequest(BaseModel):
    public_id: str = Field(min_length=1, max_length=255)