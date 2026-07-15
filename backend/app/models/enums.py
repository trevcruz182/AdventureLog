from enum import StrEnum

class AdventureCategory(StrEnum):
    HIKING = "hiking"
    SPORTS = "sports"
    TRAVEL = "travel"
    FOOD = "food"
    OUTDOORS = "outdoors"

class AdventureStatus(StrEnum):
    COMPLETED = "completed"
    WISHLIST = "wishlist"