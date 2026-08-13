import json
from sqlalchemy import create_engine, Column, String, Float, Boolean, Text, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./scholarship_buddy.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class ScholarshipDB(Base):
    __tablename__ = "scholarships"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    provider = Column(String)
    provider_type = Column(String)
    amount_per_year = Column(Float)
    amount_description = Column(String)
    deadline = Column(String)
    official_website = Column(String)
    application_process = Column(Text)
    contact_details = Column(String)
    eligibility_rules_json = Column(Text)
    required_documents_json = Column(Text)
    renewal_rules = Column(Text, nullable=True)
    description = Column(Text)
    tags_json = Column(Text)


class StudentProfileDB(Base):
    __tablename__ = "student_profiles"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    state = Column(String)
    district = Column(String, nullable=True)
    category = Column(String)
    annual_family_income = Column(Float)
    religion = Column(String, nullable=True)
    gender = Column(String)
    disability_status = Column(Boolean, default=False)
    disability_percentage = Column(Float, default=0.0)
    first_generation_learner = Column(Boolean, default=False)
    parent_occupation = Column(String, nullable=True)
    education_level = Column(String)
    institution_type = Column(String, nullable=True)
    course = Column(String)
    year_of_study = Column(Integer)
    cgpa_or_percentage = Column(Float)
    hostel_status = Column(Boolean, default=False)
    domicile = Column(String)
    sports_quota = Column(Boolean, default=False)
    ncc_quota = Column(Boolean, default=False)
    defence_quota = Column(Boolean, default=False)
    single_girl_child = Column(Boolean, default=False)


def init_db():
    Base.metadata.create_all(bind=engine)
