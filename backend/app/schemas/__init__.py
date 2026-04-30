"""
Schemas package - exports all schemas for easy imports.
"""
from app.schemas.auth import (
    Token, TokenData, LoginRequest,
    UserBase, UserCreate, UserUpdate, UserResponse
)
from app.schemas.tag import TagBase, TagCreate, TagUpdate, TagResponse, TagBrief
from app.schemas.article import (
    ArticleBase, ArticleCreate, ArticleUpdate, ArticleResponse,
    ArticleBrief, ArticleListResponse
)
from app.schemas.project import (
    ProjectBase, ProjectCreate, ProjectUpdate, ProjectResponse,
    ProjectBrief, ProjectListResponse
)
from app.schemas.profile_link import (
    ProfileLinkBase, ProfileLinkCreate, ProfileLinkUpdate, ProfileLinkResponse
)
from app.schemas.education import (
    EducationBase, EducationCreate, EducationUpdate, EducationResponse
)
from app.schemas.experience import (
    ExperienceBase, ExperienceCreate, ExperienceUpdate, ExperienceResponse
)
from app.schemas.skill import (
    SkillBase, SkillCreate, SkillUpdate, SkillResponse, SkillsByCategory
)
from app.schemas.publication import (
    PublicationBase, PublicationCreate, PublicationUpdate, PublicationResponse
)
from app.schemas.contact import (
    ContactBase, ContactCreate, ContactUpdate, ContactResponse, ContactListResponse
)
from app.schemas.coursework import (
    CourseworkBase, CourseworkCreate, CourseworkUpdate, CourseworkResponse, CourseworkGrouped
)

__all__ = [
    # Auth
    "Token", "TokenData", "LoginRequest",
    "UserBase", "UserCreate", "UserUpdate", "UserResponse",
    # Tag
    "TagBase", "TagCreate", "TagUpdate", "TagResponse", "TagBrief",
    # Article
    "ArticleBase", "ArticleCreate", "ArticleUpdate", "ArticleResponse",
    "ArticleBrief", "ArticleListResponse",
    # Project
    "ProjectBase", "ProjectCreate", "ProjectUpdate", "ProjectResponse",
    "ProjectBrief", "ProjectListResponse",
    # ProfileLink
    "ProfileLinkBase", "ProfileLinkCreate", "ProfileLinkUpdate", "ProfileLinkResponse",
    # Education
    "EducationBase", "EducationCreate", "EducationUpdate", "EducationResponse",
    # Experience
    "ExperienceBase", "ExperienceCreate", "ExperienceUpdate", "ExperienceResponse",
    # Skill
    "SkillBase", "SkillCreate", "SkillUpdate", "SkillResponse", "SkillsByCategory",
    # Publication
    "PublicationBase", "PublicationCreate", "PublicationUpdate", "PublicationResponse",
    # Contact
    "ContactBase", "ContactCreate", "ContactUpdate", "ContactResponse", "ContactListResponse",
    # Coursework
    "CourseworkBase", "CourseworkCreate", "CourseworkUpdate", "CourseworkResponse", "CourseworkGrouped",
]

