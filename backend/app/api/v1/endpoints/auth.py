"""
Authentication endpoints.
"""
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_access_token
from app.schemas.auth import Token, LoginRequest, UserResponse
from app.services.auth import authenticate_user
from app.api.deps import CurrentUser
from app.middleware.rate_limit_redis import get_login_rate_limiter
from app.middleware.account_lockout import get_lockout_manager

login_rate_limiter = get_login_rate_limiter()
lockout_manager = get_lockout_manager()

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=Token)
async def login(
    request: Request,
    response: Response,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[Session, Depends(get_db)]
):
    """
    OAuth2 compatible token login.

    Returns JWT access token for authenticated users.
    Sets httpOnly cookie for secure token storage.
    Rate limited and protected with account lockout to prevent brute force attacks.
    """
    # Check rate limit before authentication attempt
    await login_rate_limiter.check_rate_limit(request)

    # Check if account is locked
    is_locked, seconds_or_attempts = lockout_manager.is_locked(form_data.username)
    if is_locked:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Account temporarily locked due to too many failed attempts. Try again in {seconds_or_attempts} seconds."
        )

    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        # Record failed attempt
        is_now_locked, remaining = lockout_manager.record_failed_attempt(form_data.username)

        if is_now_locked:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Account locked due to too many failed attempts. Try again in {remaining} seconds."
            )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Incorrect email or password. {remaining} attempts remaining.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    # Clear failed attempts on successful login
    lockout_manager.record_successful_login(form_data.username)

    access_token = create_access_token(subject=user.email)

    # Set httpOnly cookie for secure token storage
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,  # Only send over HTTPS
        samesite="lax",  # CSRF protection
        max_age=1800,  # 30 minutes (matches token expiry)
        path="/",
    )

    return Token(access_token=access_token, token_type="bearer")


@router.post("/login/json", response_model=Token)
async def login_json(
    request: Request,
    response: Response,
    login_data: LoginRequest,
    db: Annotated[Session, Depends(get_db)]
):
    """
    JSON-based login endpoint.

    Alternative to OAuth2 form-based login.
    Sets httpOnly cookie for secure token storage.
    Rate limited and protected with account lockout to prevent brute force attacks.
    """
    # Check rate limit before authentication attempt
    await login_rate_limiter.check_rate_limit(request)

    # Check if account is locked
    is_locked, seconds_or_attempts = lockout_manager.is_locked(login_data.email)
    if is_locked:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Account temporarily locked due to too many failed attempts. Try again in {seconds_or_attempts} seconds."
        )

    user = authenticate_user(db, login_data.email, login_data.password)
    if not user:
        # Record failed attempt
        is_now_locked, remaining = lockout_manager.record_failed_attempt(login_data.email)

        if is_now_locked:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Account locked due to too many failed attempts. Try again in {remaining} seconds."
            )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Incorrect email or password. {remaining} attempts remaining.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    # Clear failed attempts on successful login
    lockout_manager.record_successful_login(login_data.email)

    access_token = create_access_token(subject=user.email)

    # Set httpOnly cookie for secure token storage
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,  # Only send over HTTPS
        samesite="lax",  # CSRF protection
        max_age=1800,  # 30 minutes (matches token expiry)
        path="/",
    )

    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: CurrentUser):
    """Get current authenticated user's information."""
    return current_user


@router.post("/logout")
def logout(response: Response):
    """
    Logout endpoint.

    Clears the httpOnly auth cookie to log out the user.
    """
    response.delete_cookie(
        key="access_token",
        path="/",
        httponly=True,
        secure=True,
        samesite="lax",
    )
    return {"message": "Successfully logged out"}
