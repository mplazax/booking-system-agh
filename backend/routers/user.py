from database import get_db
from fastapi import APIRouter, Depends, HTTPException
from model import User, UserRole
# POPRAWKA: Dodano kropkę, aby import był poprawny wewnątrz pakietu 'routers'
from .auth import get_password_hash, role_required 
from .schemas import UserCreate, UserResponse, UserUpdate
from sqlalchemy.orm import Session
from starlette.status import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_204_NO_CONTENT,
    HTTP_404_NOT_FOUND,
    HTTP_409_CONFLICT,
)

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=list[UserResponse], status_code=HTTP_200_OK)
async def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required([UserRole.ADMIN, UserRole.KOORDYNATOR])),
) -> list[User]:
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.get("/{user_id}", response_model=UserResponse, status_code=HTTP_200_OK)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required([UserRole.ADMIN, UserRole.KOORDYNATOR])),
) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.post("/create", response_model=UserResponse, status_code=HTTP_201_CREATED)
async def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required([UserRole.ADMIN, UserRole.KOORDYNATOR])),
) -> User:
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(
            status_code=HTTP_409_CONFLICT, detail="Email already registered"
        )
    hashed_password = get_password_hash(user.password)
    db_user = User(
        name=user.name,
        surname=user.surname,
        email=user.email,
        password=hashed_password,
        role=user.role,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.put("/{user_id}", response_model=UserResponse, status_code=HTTP_200_OK)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required([UserRole.ADMIN, UserRole.KOORDYNATOR])),
) -> User:
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="User not found")

    update_data = user_update.dict(exclude_unset=True)

    if "email" in update_data:
        existing_email = db.query(User).filter(User.email == update_data["email"], User.id != user_id).first()
        if existing_email:
            raise HTTPException(
                status_code=HTTP_409_CONFLICT, detail="Email already registered by another user"
            )
        db_user.email = update_data["email"]

    if "password" in update_data and update_data["password"]:
        db_user.password = get_password_hash(update_data["password"])
    
    if "name" in update_data:
        db_user.name = update_data["name"]
    if "surname" in update_data:
        db_user.surname = update_data["surname"]
    if "role" in update_data:
        db_user.role = update_data["role"]
    
    db.commit()
    db.refresh(db_user)
    return db_user


@router.delete("/{user_id}", status_code=HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required([UserRole.ADMIN, UserRole.KOORDYNATOR])),
) -> None:
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="User not found")
    db.delete(db_user)
    db.commit()
    return