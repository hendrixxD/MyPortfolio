"""
Custom exception handlers and error responses for the API.
"""
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime
import traceback

from app.core.logging import get_logger

logger = get_logger()


class ErrorDetail(BaseModel):
    """Schema for detailed error information."""
    field: Optional[str] = None
    message: str
    type: Optional[str] = None


class ErrorResponse(BaseModel):
    """Standard error response schema."""
    success: bool = False
    error: str
    status_code: int
    timestamp: str
    path: Optional[str] = None
    details: Optional[List[ErrorDetail]] = None
    request_id: Optional[str] = None


# Common HTTP error messages
ERROR_MESSAGES = {
    400: {
        "title": "Bad Request",
        "description": "The request was invalid or cannot be served. Please check your input and try again."
    },
    401: {
        "title": "Unauthorized",
        "description": "Authentication is required. Please provide valid credentials."
    },
    403: {
        "title": "Forbidden",
        "description": "You don't have permission to access this resource."
    },
    404: {
        "title": "Not Found",
        "description": "The requested resource could not be found on this server."
    },
    405: {
        "title": "Method Not Allowed",
        "description": "The HTTP method is not allowed for this endpoint."
    },
    408: {
        "title": "Request Timeout",
        "description": "The server timed out waiting for the request."
    },
    409: {
        "title": "Conflict",
        "description": "The request conflicts with the current state of the resource."
    },
    415: {
        "title": "Unsupported Media Type",
        "description": "The media format of the requested data is not supported."
    },
    422: {
        "title": "Unprocessable Entity",
        "description": "The request was well-formed but contains semantic errors."
    },
    429: {
        "title": "Too Many Requests",
        "description": "You have exceeded the rate limit. Please try again later."
    },
    500: {
        "title": "Internal Server Error",
        "description": "An unexpected error occurred on the server. Our team has been notified."
    },
    502: {
        "title": "Bad Gateway",
        "description": "The server received an invalid response from an upstream server."
    },
    503: {
        "title": "Service Unavailable",
        "description": "The service is temporarily unavailable. Please try again later."
    },
    504: {
        "title": "Gateway Timeout",
        "description": "The server did not receive a timely response from an upstream server."
    }
}


def get_error_message(status_code: int) -> dict:
    """Get error message for a status code."""
    return ERROR_MESSAGES.get(status_code, {
        "title": "Error",
        "description": "An unexpected error occurred."
    })


def create_error_response(
    status_code: int,
    error: str,
    path: str = None,
    details: List[ErrorDetail] = None,
    request_id: str = None
) -> ErrorResponse:
    """Create a standardized error response."""
    return ErrorResponse(
        success=False,
        error=error,
        status_code=status_code,
        timestamp=datetime.utcnow().isoformat() + "Z",
        path=path,
        details=details,
        request_id=request_id
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handle HTTPExceptions with custom error responses."""
    error_info = get_error_message(exc.status_code)
    error_message = exc.detail if exc.detail else error_info["description"]
    
    logger.warning(
        f"HTTP {exc.status_code} - {error_info['title']}: {error_message}",
        extra={"path": str(request.url.path), "method": request.method}
    )
    
    response = create_error_response(
        status_code=exc.status_code,
        error=error_message,
        path=str(request.url.path)
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=response.model_dump(),
        headers=getattr(exc, 'headers', None)
    )


async def starlette_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Handle Starlette HTTP exceptions."""
    error_info = get_error_message(exc.status_code)
    error_message = exc.detail if exc.detail else error_info["description"]
    
    logger.warning(
        f"HTTP {exc.status_code} - {error_info['title']}: {error_message}",
        extra={"path": str(request.url.path), "method": request.method}
    )
    
    response = create_error_response(
        status_code=exc.status_code,
        error=error_message,
        path=str(request.url.path)
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=response.model_dump()
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handle validation errors with detailed field information."""
    details = []
    for error in exc.errors():
        field_path = ".".join(str(loc) for loc in error.get("loc", []))
        details.append(ErrorDetail(
            field=field_path,
            message=error.get("msg", "Validation error"),
            type=error.get("type", "validation_error")
        ))
    
    logger.warning(
        f"Validation error for {request.method} {request.url.path}",
        extra={"errors": [d.model_dump() for d in details]}
    )
    
    response = create_error_response(
        status_code=422,
        error="Validation failed. Please check your input.",
        path=str(request.url.path),
        details=details
    )
    
    return JSONResponse(
        status_code=422,
        content=response.model_dump()
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle all unhandled exceptions (500 errors)."""
    # Log the full traceback for debugging
    logger.error(
        f"Unhandled exception for {request.method} {request.url.path}: {str(exc)}",
        extra={"traceback": traceback.format_exc()}
    )
    
    error_info = get_error_message(500)
    
    response = create_error_response(
        status_code=500,
        error=error_info["description"],
        path=str(request.url.path)
    )
    
    return JSONResponse(
        status_code=500,
        content=response.model_dump()
    )


def register_exception_handlers(app: FastAPI) -> None:
    """Register all custom exception handlers with the FastAPI app."""
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(StarletteHTTPException, starlette_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)
