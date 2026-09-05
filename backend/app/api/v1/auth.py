from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token
from app.schemas.schemas import UserCreate, UserLogin, UserResponse, Token
from datetime import datetime, timezone

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

# Demo users memory cache for instant seed access
DEMO_USERS = {
    "admin@citytwin.ai": {
        "id": 1,
        "email": "admin@citytwin.ai",
        "hashed_password": get_password_hash("admin123"),
        "full_name": "Dr. Sarah Chen (Chief City Architect)",
        "role": "Admin",
        "is_active": True,
        "created_at": datetime.now(timezone.utc)
    },
    "analyst@citytwin.ai": {
        "id": 2,
        "email": "analyst@citytwin.ai",
        "hashed_password": get_password_hash("analyst123"),
        "full_name": "Alex Rivera (Urban Systems Analyst)",
        "role": "Analyst",
        "is_active": True,
        "created_at": datetime.now(timezone.utc)
    },
    "viewer@citytwin.ai": {
        "id": 3,
        "email": "viewer@citytwin.ai",
        "hashed_password": get_password_hash("viewer123"),
        "full_name": "Public Community Observer",
        "role": "Viewer",
        "is_active": True,
        "created_at": datetime.now(timezone.utc)
    }
}

@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate):
    if user_in.email in DEMO_USERS:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    new_user = {
        "id": len(DEMO_USERS) + 1,
        "email": user_in.email,
        "hashed_password": get_password_hash(user_in.password),
        "full_name": user_in.full_name,
        "role": user_in.role if user_in.role in ["Admin", "Analyst", "Viewer"] else "Viewer",
        "is_active": True,
        "created_at": datetime.now(timezone.utc)
    }
    DEMO_USERS[user_in.email] = new_user
    return UserResponse(**new_user)

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    user = DEMO_USERS.get(credentials.email)
    if not user or not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = create_access_token(subject=user["email"], role=user["role"])
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserResponse(**user)
    )

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = DEMO_USERS.get(form_data.username)
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    token = create_access_token(subject=user["email"], role=user["role"])
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserResponse(**user)
    )

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserResponse:
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    email = payload["sub"]
    user = DEMO_USERS.get(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(**user)

@router.get("/me", response_model=UserResponse)
async def read_current_user(current_user: UserResponse = Depends(get_current_user)):
    return current_user
