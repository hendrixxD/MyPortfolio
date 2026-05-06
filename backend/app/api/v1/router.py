"""
API v1 router - combines all endpoint routers.
"""
from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    health,
    tags,
    articles,
    projects,
    profile_links,
    education,
    experience,
    skills,
    publications,
    contact,
    upload,
    coursework,
    gallery,
    analytics,
    tracking,
    csrf
)

api_router = APIRouter(prefix="/api/v1")

# Include all routers
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(tags.router)
api_router.include_router(articles.router)
api_router.include_router(projects.router)
api_router.include_router(profile_links.router)
api_router.include_router(education.router)
api_router.include_router(experience.router)
api_router.include_router(skills.router)
api_router.include_router(publications.router)
api_router.include_router(contact.router)
api_router.include_router(upload.router)
api_router.include_router(coursework.router)
api_router.include_router(gallery.router)
api_router.include_router(analytics.router)
api_router.include_router(tracking.router)
api_router.include_router(csrf.router)

