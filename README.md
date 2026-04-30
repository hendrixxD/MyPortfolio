# lengedandungjoshua Portfolio

A production-ready fullstack portfolio web application built with FastAPI (Python) and Next.js (TypeScript).

## 🏗️ Architecture

- **Backend**: FastAPI with PostgreSQL, SQLAlchemy, Alembic migrations
- **Frontend**: Next.js 14+ with App Router, TypeScript, Server Components
- **Database**: PostgreSQL 15+
- **Containerization**: Docker & Docker Compose

## 📁 Project Structure

```
myport/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py
│   │   │   └── v1/
│   │   │       ├── endpoints/
│   │   │       │   ├── articles.py
│   │   │       │   ├── auth.py
│   │   │       │   ├── contact.py
│   │   │       │   ├── coursework.py
│   │   │       │   ├── education.py
│   │   │       │   ├── experience.py
│   │   │       │   ├── health.py
│   │   │       │   ├── profile_links.py
│   │   │       │   ├── projects.py
│   │   │       │   ├── publications.py
│   │   │       │   ├── skills.py
│   │   │       │   ├── tags.py
│   │   │       │   └── upload.py
│   │   │       └── router.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   ├── logging.py
│   │   │   └── security.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── article.py
│   │   │   ├── base.py
│   │   │   ├── contact.py
│   │   │   ├── coursework.py
│   │   │   ├── education.py
│   │   │   ├── experience.py
│   │   │   ├── profile_link.py
│   │   │   ├── project.py
│   │   │   ├── publication.py
│   │   │   ├── skill.py
│   │   │   ├── tag.py
│   │   │   └── user.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── article.py
│   │   │   ├── auth.py
│   │   │   ├── contact.py
│   │   │   ├── coursework.py
│   │   │   ├── education.py
│   │   │   ├── experience.py
│   │   │   ├── profile_link.py
│   │   │   ├── project.py
│   │   │   ├── publication.py
│   │   │   ├── skill.py
│   │   │   └── tag.py
│   │   ├── services/
│   │   │   ├── article.py
│   │   │   ├── auth.py
│   │   │   ├── contact.py
│   │   │   ├── coursework.py
│   │   │   ├── education.py
│   │   │   ├── experience.py
│   │   │   ├── profile_link.py
│   │   │   ├── project.py
│   │   │   ├── publication.py
│   │   │   ├── skill.py
│   │   │   └── tag.py
│   │   └── main.py
│   ├── alembic/
│   │   ├── versions/
│   │   ├── env.py
│   │   └── script.py.mako
│   ├── scripts/
│   │   └── seed.py
│   ├── uploads/
│   ├── tests/
│   │   └── test_health.py
│   ├── alembic.ini
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (public)/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── articles/
│   │   │   │   ├── projects/
│   │   │   │   ├── profiles/
│   │   │   │   ├── academia/
│   │   │   │   ├── tech/
│   │   │   │   ├── contact/
│   │   │   │   └── resume/
│   │   │   ├── admin/
│   │   │   │   ├── login/
│   │   │   │   ├── dashboard/
│   │   │   │   └── layout.tsx
│   │   │   ├── robots.ts
│   │   │   ├── sitemap.ts
│   │   │   ├── layout.tsx
│   │   │   ├── not-found.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── layout/
│   │   │   └── shared/
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── utils.ts
│   │   ├── hooks/
│   │   ├── types/
│   │   └── context/
│   ├── public/
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Using Docker Compose (Recommended)

1. **Clone and setup environment files:**

```bash
cd myport
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

2. **Start all services:**

```bash
docker-compose up --build
```

3. **Run database migrations:**

```bash
docker-compose exec backend alembic upgrade head
```

4. **Seed the database:**

```bash
docker-compose exec backend python -m scripts.seed
```

5. **Create admin user:**

```bash
docker-compose exec backend python -c "
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

db = SessionLocal()
admin = User(
    email='admin@lengedandungjoshua.dev',
    hashed_password=get_password_hash('changeme123'),
    full_name='lengedandungjoshua',
    is_active=True,
    is_superuser=True
)
db.add(admin)
db.commit()
print('Admin user created!')
db.close()
"
```

6. **Access the application:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Admin Panel: http://localhost:3000/admin/login

### Local Development (Without Docker)

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set up PostgreSQL and update .env
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
alembic upgrade head

# Seed data
python -m scripts.seed

# Start server
uvicorn app.main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your API URL

npm run dev
```

## 🔧 Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/portfolio
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
UPLOAD_DIR=./uploads
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest tests/ -v
```

### Frontend Tests

```bash
cd frontend
npm run test
```

## 📝 API Documentation

Once the backend is running, visit:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🏭 Production Deployment

### Environment Considerations

1. **Change all secret keys** in environment variables
2. **Use a managed PostgreSQL** database
3. **Configure S3-compatible storage** for image uploads
4. **Set up proper CORS origins** for your domain
5. **Enable HTTPS** with proper SSL certificates
6. **Set up rate limiting** at the reverse proxy level
7. **Configure proper logging** and monitoring

### Docker Production Build

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

## 📄 License

MIT License - feel free to use this for your own portfolio!

## 👤 Author

**lengedandungjoshua**
- Data Engineer
- Chemical/Petroleum Technology Major
- Science Laboratory Technology Department
