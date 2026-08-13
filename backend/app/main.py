import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.models.database import engine, Base, SessionLocal, ScholarshipDB
from app.data.scholarship_seed import SAMPLE_SCHOLARSHIPS
from app.routers import scholarships

load_dotenv()

app = FastAPI(
    title="Scholarship Buddy API - Phase 1",
    description="Agentic AI Platform & Deterministic Eligibility Engine for Indian Scholarships",
    version="1.0.0",
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing_count = db.query(ScholarshipDB).count()
        if existing_count == 0:
            print("Seeding initial scholarship database...")
            for sch in SAMPLE_SCHOLARSHIPS:
                db_obj = ScholarshipDB(
                    id=sch.id,
                    name=sch.name,
                    provider=sch.provider,
                    provider_type=sch.provider_type,
                    amount_per_year=sch.amount_per_year,
                    amount_description=sch.amount_description,
                    deadline=sch.deadline,
                    official_website=sch.official_website,
                    application_process=sch.application_process,
                    contact_details=sch.contact_details,
                    eligibility_rules_json=json.dumps(sch.eligibility_rules.dict()),
                    required_documents_json=json.dumps(sch.required_documents),
                    renewal_rules=sch.renewal_rules,
                    description=sch.description,
                    tags_json=json.dumps(sch.tags),
                )
                db.add(db_obj)
            db.commit()
            print(f"Successfully seeded {len(SAMPLE_SCHOLARSHIPS)} scholarships!")
    finally:
        db.close()


app.include_router(scholarships.router)


@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "Scholarship Buddy API",
        "phase": 1,
        "docs": "/docs",
    }
