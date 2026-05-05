"""
Seed script to populate the database with initial data.
"""
import sys
import os
from datetime import datetime, date

# Add the parent directory to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models import (
    User, Tag, Article, Project, ProfileLink,
    Education, Experience, Skill, Publication
)


def seed_database():
    """Seed the database with initial data."""
    db = SessionLocal()
    
    try:
        print("🌱 Starting database seeding...")
        
        # Create admin user
        admin_password = os.environ.get("ADMIN_PASSWORD")
        if not admin_password:
            raise ValueError("ADMIN_PASSWORD env var must be set before running seed")

        existing_admin = db.query(User).filter(User.email == "lengedandungjoshua@gmail.com").first()
        if not existing_admin:
            admin = User(
                email="lengedandungjoshua@gmail.com",
                hashed_password=get_password_hash(admin_password),
                full_name="lengedandungjoshua",
                is_active=True,
                is_superuser=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(admin)
            print("✅ Admin user created")
        else:
            print("⏭️ Admin user already exists")
        
        # Create tags
        tags_data = [
            {"name": "Data Engineering", "slug": "data-engineering", "tag_type": "both", "color": "#10b981"},
            {"name": "Python", "slug": "python", "tag_type": "both", "color": "#3b82f6"},
            {"name": "Chemical Engineering", "slug": "chemical-engineering", "tag_type": "both", "color": "#f59e0b"},
            {"name": "Petroleum Technology", "slug": "petroleum-technology", "tag_type": "both", "color": "#8b5cf6"},
            {"name": "Web Development", "slug": "web-development", "tag_type": "both", "color": "#ec4899"},
            {"name": "Machine Learning", "slug": "machine-learning", "tag_type": "both", "color": "#06b6d4"},
            {"name": "Technical Writing", "slug": "technical-writing", "tag_type": "article", "color": "#84cc16"},
            {"name": "Research", "slug": "research", "tag_type": "article", "color": "#f97316"},
        ]
        
        tags = {}
        for tag_data in tags_data:
            existing = db.query(Tag).filter(Tag.slug == tag_data["slug"]).first()
            if not existing:
                tag = Tag(**tag_data, created_at=datetime.utcnow(), updated_at=datetime.utcnow())
                db.add(tag)
                db.flush()
                tags[tag_data["slug"]] = tag
                print(f"✅ Tag created: {tag_data['name']}")
            else:
                tags[tag_data["slug"]] = existing
                print(f"⏭️ Tag already exists: {tag_data['name']}")
        
        # Create profile links
        profile_links_data = [
            {
                "platform": "GitHub",
                "url": "https://github.com/hendrixxD",
                "icon": "github",
                "order": 1,
                "username": "@hendrixxD",
                "description": "Check out my open source projects and contributions"
            },
            {
                "platform": "LinkedIn",
                "url": "https://www.linkedin.com/in/lenge-dandung-joshua/",
                "icon": "linkedin",
                "order": 2,
                "username": "lenge-dandung-joshua",
                "description": "Connect with me professionally"
            },
            {
                "platform": "X (Twitter)",
                "url": "https://x.com/hendrixxjdl",
                "icon": "twitter",
                "order": 3,
                "username": "@hendrixxjdl",
                "description": "Follow me for tech and industry insights"
            },
        ]
        
        for link_data in profile_links_data:
            existing = db.query(ProfileLink).filter(ProfileLink.platform == link_data["platform"]).first()
            if not existing:
                link = ProfileLink(**link_data, created_at=datetime.utcnow(), updated_at=datetime.utcnow())
                db.add(link)
                print(f"✅ Profile link created: {link_data['platform']}")
            else:
                print(f"⏭️ Profile link already exists: {link_data['platform']}")
        
        # Create education
        education_data = [
            {
                "school": "Federal University of Technology",
                "program": "Science Laboratory Technology",
                "degree": "Higher National Diploma",
                "department": "Chemical/Petroleum Technology",
                "location": "Nigeria",
                "start_date": date(2019, 9, 1),
                "end_date": date(2023, 7, 1),
                "is_current": False,
                "description": "Specialized in Chemical and Petroleum Technology with strong foundation in laboratory analysis, process engineering, and quality control.",
                "achievements": "Dean's List, Best Student in Analytical Chemistry",
                "order": 1
            },
        ]
        
        for edu_data in education_data:
            existing = db.query(Education).filter(Education.school == edu_data["school"]).first()
            if not existing:
                edu = Education(**edu_data, created_at=datetime.utcnow(), updated_at=datetime.utcnow())
                db.add(edu)
                print(f"✅ Education created: {edu_data['school']}")
            else:
                print(f"⏭️ Education already exists: {edu_data['school']}")
        
        # Create skills
        skills_data = [
            # Programming Languages
            {"name": "Python", "category": "Programming Languages", "level": "Advanced", "level_percent": 90, "order": 1},
            {"name": "SQL", "category": "Programming Languages", "level": "Advanced", "level_percent": 85, "order": 2},
            {"name": "JavaScript", "category": "Programming Languages", "level": "Intermediate", "level_percent": 70, "order": 3},
            {"name": "TypeScript", "category": "Programming Languages", "level": "Intermediate", "level_percent": 65, "order": 4},
            
            # Data Engineering
            {"name": "Apache Spark", "category": "Data Engineering", "level": "Intermediate", "level_percent": 75, "order": 1},
            {"name": "Apache Airflow", "category": "Data Engineering", "level": "Intermediate", "level_percent": 70, "order": 2},
            {"name": "ETL Pipelines", "category": "Data Engineering", "level": "Advanced", "level_percent": 85, "order": 3},
            {"name": "dbt", "category": "Data Engineering", "level": "Intermediate", "level_percent": 70, "order": 4},
            
            # Databases
            {"name": "PostgreSQL", "category": "Databases", "level": "Advanced", "level_percent": 85, "order": 1},
            {"name": "MongoDB", "category": "Databases", "level": "Intermediate", "level_percent": 70, "order": 2},
            {"name": "Redis", "category": "Databases", "level": "Intermediate", "level_percent": 65, "order": 3},
            
            # Cloud & DevOps
            {"name": "Docker", "category": "Cloud & DevOps", "level": "Advanced", "level_percent": 80, "order": 1},
            {"name": "AWS", "category": "Cloud & DevOps", "level": "Intermediate", "level_percent": 70, "order": 2},
            {"name": "Git", "category": "Cloud & DevOps", "level": "Advanced", "level_percent": 85, "order": 3},
            
            # Chemical/Petroleum
            {"name": "Laboratory Analysis", "category": "Chemical/Petroleum", "level": "Advanced", "level_percent": 90, "order": 1},
            {"name": "Quality Control", "category": "Chemical/Petroleum", "level": "Advanced", "level_percent": 85, "order": 2},
            {"name": "HPLC/GC Analysis", "category": "Chemical/Petroleum", "level": "Advanced", "level_percent": 80, "order": 3},
            
            # Currently Learning
            {"name": "Rust", "category": "Currently Learning", "level": "Beginner", "level_percent": 30, "is_learning": True, "order": 1},
            {"name": "Apache Kafka", "category": "Currently Learning", "level": "Beginner", "level_percent": 40, "is_learning": True, "order": 2},
        ]
        
        for skill_data in skills_data:
            existing = db.query(Skill).filter(
                Skill.name == skill_data["name"],
                Skill.category == skill_data["category"]
            ).first()
            if not existing:
                skill = Skill(**skill_data, created_at=datetime.utcnow(), updated_at=datetime.utcnow())
                db.add(skill)
                print(f"✅ Skill created: {skill_data['name']}")
            else:
                print(f"⏭️ Skill already exists: {skill_data['name']}")
        
        # Create experiences
        experiences_data = [
            {
                "role": "Data Engineer",
                "organization": "Tech Company",
                "location": "Remote",
                "employment_type": "Full-time",
                "start_date": date(2023, 8, 1),
                "is_current": True,
                "description": "Building and maintaining data pipelines and infrastructure.",
                "bullets": [
                    "Designed and implemented ETL pipelines processing 10M+ records daily",
                    "Reduced data processing time by 60% through optimization",
                    "Built real-time dashboards for business intelligence"
                ],
                "technologies": ["Python", "Apache Spark", "Airflow", "PostgreSQL", "AWS"],
                "category": "tech",
                "order": 1
            },
            {
                "role": "Laboratory Technician",
                "organization": "Petroleum Research Institute",
                "location": "Nigeria",
                "employment_type": "Internship",
                "start_date": date(2022, 1, 1),
                "end_date": date(2022, 6, 1),
                "is_current": False,
                "description": "Conducted chemical analysis and quality control testing.",
                "bullets": [
                    "Performed HPLC and GC analysis on petroleum samples",
                    "Maintained laboratory equipment and documentation",
                    "Assisted in research projects on crude oil analysis"
                ],
                "technologies": ["HPLC", "GC-MS", "Spectroscopy"],
                "category": "academia",
                "order": 2
            },
        ]
        
        for exp_data in experiences_data:
            existing = db.query(Experience).filter(
                Experience.role == exp_data["role"],
                Experience.organization == exp_data["organization"]
            ).first()
            if not existing:
                exp = Experience(**exp_data, created_at=datetime.utcnow(), updated_at=datetime.utcnow())
                db.add(exp)
                print(f"✅ Experience created: {exp_data['role']} at {exp_data['organization']}")
            else:
                print(f"⏭️ Experience already exists: {exp_data['role']}")
        
        # Create publication
        publications_data = [
            {
                "title": "Analysis of Crude Oil Quality Parameters Using Modern Spectroscopic Methods",
                "authors": ["lengedandungjoshua", "Prof. A. Smith", "Dr. B. Johnson"],
                "venue": "Journal of Petroleum Science and Technology",
                "year": 2023,
                "abstract": "This study presents a comprehensive analysis of crude oil quality parameters using advanced spectroscopic techniques...",
                "publication_type": "journal",
                "order": 1
            },
        ]
        
        for pub_data in publications_data:
            existing = db.query(Publication).filter(Publication.title == pub_data["title"]).first()
            if not existing:
                pub = Publication(**pub_data, created_at=datetime.utcnow(), updated_at=datetime.utcnow())
                db.add(pub)
                print(f"✅ Publication created: {pub_data['title'][:50]}...")
            else:
                print(f"⏭️ Publication already exists: {pub_data['title'][:50]}...")
        
        db.flush()
        
        # Create articles
        articles_data = [
            {
                "title": "Building Scalable Data Pipelines with Apache Airflow",
                "slug": "building-scalable-data-pipelines-with-apache-airflow",
                "summary": "A comprehensive guide to designing and implementing production-ready data pipelines using Apache Airflow, including best practices and real-world examples.",
                "content_md": """# Building Scalable Data Pipelines with Apache Airflow

In this comprehensive guide, we'll explore how to build production-ready data pipelines using Apache Airflow.

## Introduction

Apache Airflow has become the de facto standard for orchestrating complex data workflows. As a data engineer, understanding how to leverage its capabilities is essential.

## Key Concepts

### DAGs (Directed Acyclic Graphs)

DAGs are the backbone of Airflow. They define the workflow structure and dependencies between tasks.

```python
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime

with DAG(
    'my_data_pipeline',
    start_date=datetime(2024, 1, 1),
    schedule_interval='@daily'
) as dag:
    
    extract = PythonOperator(
        task_id='extract',
        python_callable=extract_data
    )
```

### Operators

Operators define individual tasks within a DAG. Common types include:

- **PythonOperator**: Execute Python functions
- **BashOperator**: Run bash commands
- **SQLOperator**: Execute SQL queries

## Best Practices

1. **Idempotency**: Design tasks to be idempotent
2. **Atomicity**: Each task should be atomic
3. **Testing**: Write unit tests for your DAGs

## Conclusion

Apache Airflow provides a powerful framework for building data pipelines. By following these best practices, you can create maintainable and scalable workflows.
""",
                "status": "published",
                "published_at": datetime.utcnow(),
                "reading_time": 8,
                "featured": True,
                "meta_description": "Learn how to build production-ready data pipelines with Apache Airflow, including best practices and code examples."
            },
            {
                "title": "Introduction to ETL Best Practices",
                "slug": "introduction-to-etl-best-practices",
                "summary": "Exploring the fundamental principles and best practices for building robust ETL (Extract, Transform, Load) processes.",
                "content_md": """# Introduction to ETL Best Practices

ETL (Extract, Transform, Load) is a fundamental concept in data engineering. This article covers essential practices for building robust ETL pipelines.

## What is ETL?

ETL stands for:
- **Extract**: Pulling data from source systems
- **Transform**: Cleaning, validating, and reshaping data
- **Load**: Writing data to the destination

## Best Practices

### 1. Data Quality Checks

Always validate your data at each stage:

```python
def validate_data(df):
    assert df['id'].notna().all(), "Null IDs found"
    assert df['amount'] >= 0).all(), "Negative amounts found"
    return df
```

### 2. Incremental Processing

Process only new or changed data when possible to improve efficiency.

### 3. Error Handling

Implement robust error handling with proper logging and alerting.

## Draft - More content coming soon...
""",
                "status": "draft",
                "reading_time": 5,
                "featured": False
            },
        ]
        
        for article_data in articles_data:
            existing = db.query(Article).filter(Article.slug == article_data["slug"]).first()
            if not existing:
                article = Article(**article_data, created_at=datetime.utcnow(), updated_at=datetime.utcnow())
                
                # Add tags
                if "airflow" in article_data["slug"]:
                    if "data-engineering" in tags:
                        article.tags.append(tags["data-engineering"])
                    if "python" in tags:
                        article.tags.append(tags["python"])
                
                db.add(article)
                print(f"✅ Article created: {article_data['title']}")
            else:
                print(f"⏭️ Article already exists: {article_data['title']}")
        
        # Create projects
        projects_data = [
            {
                "title": "Real-time Data Pipeline Platform",
                "slug": "real-time-data-pipeline-platform",
                "summary": "A scalable real-time data pipeline platform built with Apache Kafka, Spark Streaming, and Airflow for processing millions of events daily.",
                "description_md": """# Real-time Data Pipeline Platform

A comprehensive data engineering platform for processing and analyzing streaming data in real-time.

## Features

- **Real-time Processing**: Handle millions of events per second
- **Scalable Architecture**: Horizontally scalable components
- **Data Quality**: Built-in data validation and monitoring
- **Analytics Ready**: Processed data available for BI tools

## Tech Stack

- Apache Kafka for message streaming
- Apache Spark for data processing
- Apache Airflow for orchestration
- PostgreSQL & Redis for storage
- Docker & Kubernetes for deployment

## Architecture

The platform follows a lambda architecture pattern, combining batch and stream processing for comprehensive data handling.
""",
                "repo_url": "https://github.com/hendrixxD/data-pipeline-platform",
                "tech_tags": ["Python", "Apache Kafka", "Apache Spark", "Airflow", "Docker"],
                "status": "published",
                "featured": True,
                "category": "data-engineering",
                "order": 1
            },
            {
                "title": "Crude Oil Quality Analysis System",
                "slug": "crude-oil-quality-analysis-system",
                "summary": "A laboratory information management system (LIMS) for tracking and analyzing crude oil quality parameters with automated reporting.",
                "description_md": """# Crude Oil Quality Analysis System

A comprehensive system for managing laboratory analysis of crude oil samples, from sample collection to reporting.

## Features

- **Sample Tracking**: Complete chain of custody
- **Analysis Management**: Support for multiple test methods
- **Automated Reporting**: Generate compliance reports
- **Quality Control**: Built-in QC/QA workflows

## Technical Details

Built with Python and FastAPI for the backend, with PostgreSQL for data storage and a React frontend for the user interface.
""",
                "repo_url": "https://github.com/hendrixxD/oil-quality-lims",
                "tech_tags": ["Python", "FastAPI", "PostgreSQL", "React", "Docker"],
                "status": "published",
                "featured": True,
                "category": "chemical-petroleum",
                "order": 2
            },
            {
                "title": "Personal Portfolio Website",
                "slug": "personal-portfolio-website",
                "summary": "A modern, responsive portfolio website built with Next.js and FastAPI, featuring a custom CMS for content management.",
                "description_md": """# Personal Portfolio Website

This portfolio website showcases my work and experience as a Data Engineer and Chemical/Petroleum Technology professional.

## Features

- **Server-Side Rendering**: Fast, SEO-friendly pages
- **Dark/Light Mode**: User preference support
- **CMS Integration**: Custom admin panel for content management
- **Responsive Design**: Works on all devices

## Tech Stack

- Next.js 14 with App Router
- FastAPI backend with PostgreSQL
- TypeScript for type safety
- Tailwind CSS for styling
""",
                "repo_url": "https://github.com/hendrixxD/portfolio",
                "live_url": "https://lengedandungjoshua.dev",
                "tech_tags": ["Next.js", "TypeScript", "FastAPI", "PostgreSQL", "Tailwind CSS"],
                "status": "published",
                "featured": False,
                "category": "web-app",
                "order": 3
            },
        ]
        
        for project_data in projects_data:
            existing = db.query(Project).filter(Project.slug == project_data["slug"]).first()
            if not existing:
                project = Project(**project_data, created_at=datetime.utcnow(), updated_at=datetime.utcnow())
                
                # Add tags based on category
                if project_data.get("category") == "data-engineering":
                    if "data-engineering" in tags:
                        project.tags.append(tags["data-engineering"])
                    if "python" in tags:
                        project.tags.append(tags["python"])
                elif project_data.get("category") == "chemical-petroleum":
                    if "chemical-engineering" in tags:
                        project.tags.append(tags["chemical-engineering"])
                    if "petroleum-technology" in tags:
                        project.tags.append(tags["petroleum-technology"])
                elif project_data.get("category") == "web-app":
                    if "web-development" in tags:
                        project.tags.append(tags["web-development"])
                
                db.add(project)
                print(f"✅ Project created: {project_data['title']}")
            else:
                print(f"⏭️ Project already exists: {project_data['title']}")
        
        db.commit()
        print("\n🎉 Database seeding completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
