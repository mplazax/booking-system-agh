from database import get_db
from fastapi import APIRouter, Depends, HTTPException
from model import (
    AvailabilityProposal,
    ChangeRecomendation,
    ChangeRequest,
    CourseEvent,
    Room,
    RoomUnavailability,
    User,
)
from routers.auth import get_current_user
from routers.schemas import ChangeRecomendationResponse
from sqlalchemy.orm import Session
from starlette.status import HTTP_204_NO_CONTENT

router = APIRouter(prefix="/change_recommendation", tags=["change_recommendation"])


@router.post("/common-availability")
async def find_and_add_common_availability(
    user1_id: int,
    user2_id: int,
    change_request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Find common availability between two users and generate room change recommendations.
    
    Args:
        user1_id (int): ID of the first user
        user2_id (int): ID of the second user
        change_request_id (int): ID of the change request
        db (Session): Database session
        current_user (User): Current authenticated user
        
    Raises:
        HTTPException: If change request is not found or no common availability/rooms found
        
    Returns:
        dict: Success message with the number of recommendations added
    """
    user1_proposals = (
        db.query(AvailabilityProposal)
        .filter(
            AvailabilityProposal.user_id == user1_id,
            AvailabilityProposal.change_request_id == change_request_id,
        )
        .all()
    )
    user2_proposals = (
        db.query(AvailabilityProposal)
        .filter(
            AvailabilityProposal.user_id == user2_id,
            AvailabilityProposal.change_request_id == change_request_id,
        )
        .all()
    )

    change_request = (
        db.query(ChangeRequest).filter(ChangeRequest.id == change_request_id).first()
    )
    if not change_request:
        raise HTTPException(status_code=404, detail="Change request not found")

    common_intervals = []
    for proposal1 in user1_proposals:
        for proposal2 in user2_proposals:
            if (
                proposal1.time_slot_id == proposal2.time_slot_id
                and proposal1.day == proposal2.day
            ):
                common_intervals.append((proposal1.time_slot_id, proposal1.day))

    if not common_intervals:
        raise HTTPException(status_code=404, detail="No common availability found")

    recommendations = []
    for slot_id, day in common_intervals:
        # Base query for available rooms
        available_rooms_query = db.query(Room).filter(
            ~Room.id.in_(
                db.query(RoomUnavailability.room_id).filter(
                    RoomUnavailability.start_datetime <= day,
                    RoomUnavailability.end_datetime >= day,
                )
            ),
            ~Room.id.in_(
                db.query(CourseEvent.room_id).filter(
                    CourseEvent.day == day,
                    CourseEvent.time_slot_id == slot_id.id,
                    CourseEvent.canceled == False,
                )
            ),
        )

        # Add room requirements filtering if specified
        # TODO: dodac filtrowanie pokoi po wymaganiach pokoju
        if change_request.room_requirements:
            requirements = change_request.room_requirements.lower()
            if "projector" in requirements:
                available_rooms_query = available_rooms_query.filter(
                    Room.equipment.ilike("%projector%")
                )
            if "capacity" in requirements:
                # Extract capacity requirement if present
                import re

                capacity_match = re.search(r"capacity\s*>\s*(\d+)", requirements)
                if capacity_match:
                    min_capacity = int(capacity_match.group(1))
                    available_rooms_query = available_rooms_query.filter(
                        Room.capacity >= min_capacity
                    )

        available_rooms = available_rooms_query.all()

        for room in available_rooms:
            recommendation = ChangeRecomendation(
                change_request_id=change_request_id,
                recommended_slot_id=slot_id.id,
                recommended_day=day,
                recommended_room_id=room.id,
            )
            recommendations.append(recommendation)
            db.add(recommendation)

    if not recommendations:
        raise HTTPException(
            status_code=404, detail="No rooms available for the common intervals"
        )

    db.commit()
    return {"message": "Recommendations added successfully"}


@router.get(
    "/{change_request_id}/recommendations",
    response_model=list[ChangeRecomendationResponse],
)
async def get_proposals(
    change_request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[ChangeRecomendation]:
    """
    Get all recommendations for a specific change request.
    
    Args:
        change_request_id (int): ID of the change request
        db (Session): Database session
        current_user (User): Current authenticated user
        
    Raises:
        HTTPException: If change request is not found
        
    Returns:
        list[ChangeRecomendation]: List of change recommendations
    """
    change_request = (
        db.query(ChangeRequest).filter(ChangeRequest.id == change_request_id).first()
    )
    if not change_request:
        raise HTTPException(status_code=404, detail="Change request not found")

    change_recommendations = (
        db.query(ChangeRecomendation)
        .filter(ChangeRecomendation.change_request_id == change_request_id)
        .all()
    )
    return change_recommendations


@router.delete("/{change_request_id}/recommendations", status_code=HTTP_204_NO_CONTENT)
async def delete_recommendations(
    change_request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """
    Delete all recommendations for a specific change request.
    
    Args:
        change_request_id (int): ID of the change request
        db (Session): Database session
        current_user (User): Current authenticated user
        
    Raises:
        HTTPException: If change request is not found
    """
    change_request = (
        db.query(ChangeRequest).filter(ChangeRequest.id == change_request_id).first()
    )
    if not change_request:
        raise HTTPException(status_code=404, detail="Change request not found")

    db.query(ChangeRecomendation).filter(
        ChangeRecomendation.change_request_id == change_request_id
    ).delete()
    db.commit()
    return
