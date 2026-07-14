from typing import Literal

from pydantic import BaseModel

class HealthResponse(BaseModel):
    status: Literal["ok"]
    service: str
    environment: str

class DatabaseHealthResponse(BaseModel):
    status: Literal["ok"]
    database: Literal["connected"]