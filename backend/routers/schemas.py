from datetime import date, datetime
from typing import Optional

from model import ChangeRequestStatus, RoomType, UserRole
from pydantic import BaseModel, EmailStr


# User
class UserUpdate(BaseModel):
    name: Optional[str] = None
    surname: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None

class UserResponse(BaseModel):
    id: int
    name: str
    surname: str
    email: str
    role: UserRole

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    name: str
    surname: str
    email: EmailStr
    password: str
    role: UserRole


# Auth
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


# Room
class RoomCreate(BaseModel):
    name: str
    capacity: int
    type: RoomType
    equipment: Optional[str] = None

class RoomUpdate(BaseModel):
    name: Optional[str] = None
    capacity: Optional[int] = None
    type: Optional[RoomType] = None
    equipment: Optional[str] = None


class RoomResponse(BaseModel):
    id: int
    name: str
    capacity: int
    type: RoomType
    equipment: Optional[str] = None

    class Config:
        from_attributes = True


# Group
class GroupCreate(BaseModel):
    name: str
    year: Optional[int] = None
    leader_id: int


class GroupResponse(BaseModel):
    id: int
    name: str
    year: int
    leader_id: int

    class Config:
        from_attributes = True


class GroupUpdate(BaseModel):
    name: Optional[str] = None
    year: Optional[int] = None
    leader_id: Optional[int] = None


# Change requests
class ChangeRequestCreate(BaseModel):
    course_event_id: int
    initiator_id: int
    status: ChangeRequestStatus
    reason: str
    room_requirements: str
    created_at: datetime


class ChangeRequestUpdate(BaseModel):
    change_request_id: int
    course_event_id: int
    initiator_id: int
    status: Optional[ChangeRequestStatus] = None
    reason: Optional[str] = None
    room_requirements: Optional[str] = None
    created_at: datetime


class ChangeRequestResponse(BaseModel):
    id: int
    course_event_id: int
    initiator_id: int
    status: ChangeRequestStatus
    reason: str
    room_requirements: str
    created_at: datetime

    class Config:
        from_attributes = True


# Proposal
class ProposalCreate(BaseModel):
    change_request_id: int
    user_id: int
    day: date
    time_slot_id: int


class ProposalUpdate(BaseModel):
    user_id: int
    day: date
    time_slot_id: int


class ProposalResponse(BaseModel):
    id: int
    change_request_id: int
    user_id: int
    day: date
    time_slot_id: int
    accepted_by_leader: bool
    accepted_by_representative: bool

    class Config:
        from_attributes = True


class CourseCreate(BaseModel):
    name: str
    teacher_id: int
    group_id: int


class CourseResponse(CourseCreate):
    id: int

    class Config:
        from_attributes = True


class CourseEventCreate(BaseModel):
    course_id: int
    room_id: Optional[int] = None
    day: date
    time_slot_id: int
    canceled: bool = False


class CourseEventUpdate(BaseModel):
    room_id: Optional[int] = None
    day: date
    time_slot_id: int
    canceled: bool = False


class CourseEventResponse(BaseModel):
    id: int
    course_id: int
    room_id: Optional[int] = None
    day: date
    time_slot_id: int
    canceled: bool

    class Config:
        from_attributes = True


class ChangeRecomendationResponse(BaseModel):
    id: int
    change_request_id: int
    recommended_day: date
    recommended_slot_id: int
    recommended_room_id: int

    class Config:
        from_attributes = True


class RoomUnavailabilityCreate(BaseModel):
    room_id: int
    start_datetime: date
    end_datetime: date


class RoomUnavailabilityUpdate(BaseModel):
    start_datetime: date
    end_datetime: date


class RoomUnavailabilityResponse(BaseModel):
    id: int
    room_id: int
    start_datetime: date
    end_datetime: date

    class Config:
        from_attributes = True