"""
Publication model for academic papers and articles.
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, JSON

from app.models.base import Base, TimestampMixin


class Publication(Base, TimestampMixin):
    """Academic publication model."""
    __tablename__ = "publications"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    authors = Column(JSON, default=list)  # List of author names
    venue = Column(String(255), nullable=True)  # Journal/conference name
    year = Column(Integer, nullable=True)
    
    abstract = Column(Text, nullable=True)
    url = Column(String(500), nullable=True)  # Link to publication
    doi = Column(String(100), nullable=True)
    pdf_url = Column(String(500), nullable=True)
    
    publication_type = Column(String(50), nullable=True)  # "journal", "conference", "thesis", "preprint"
    
    order = Column(Integer, default=0)
    is_visible = Column(Boolean, default=True)
