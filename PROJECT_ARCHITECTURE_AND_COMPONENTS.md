# 📐 Scholarship Buddy — Deep Dive Architecture & Component Guide

> A comprehensive technical breakdown of **Scholarship Buddy** explaining the architectural choices, component implementations, data flows, and design rationale behind the AI Scholarship Copilot for India.

---

## 📑 Table of Contents

1. [Architectural Philosophy & Design Rationale](#1-architectural-philosophy--design-rationale)
   - [Why Hybrid Rule Engine + AI Agent?](#11-why-hybrid-rule-engine--ai-agent)
   - [Why FastAPI + Next.js Stack?](#12-why-fastapi--nextjs-stack)
   - [Why a 2-State User Journey (Guest vs Profile)?](#13-why-a-2-state-user-journey-guest-vs-profile)
2. [System Architecture Diagram](#2-system-architecture-diagram)
3. [Backend Component Breakdown](#3-backend-component-breakdown)
   - [Pydantic Schemas (`backend/app/models/schema.py`)](#31-pydantic-schemas-backendappmodelsschemapy)
   - [SQLAlchemy Database (`backend/app/models/database.py`)](#32-sqlalchemy-database-backendappmodelsdatabasepy)
   - [Deterministic Eligibility Engine (`backend/app/engine/eligibility_engine.py`)](#33-deterministic-eligibility-engine-backendappengineeligibility_enginepy)
   - [AI Copilot Guidance Agent (`backend/app/agent/llm_agent.py`)](#34-ai-copilot-guidance-agent-backendappagentllm_agentpy)
   - [Scholarship Knowledge Base (`backend/app/data/scholarship_seed.py`)](#35-scholarship-knowledge-base-backendappdatascholarship_seedpy)
   - [REST API Routers (`backend/app/routers/scholarships.py`)](#36-rest-api-routers-backendapprouters-scholarships-py)
   - [FastAPI Main Server (`backend/app/main.py`)](#37-fastapi-main-server-backendappmainpy)
   - [Unit Testing Suite (`backend/tests/test_eligibility_engine.py`)](#38-unit-testing-suite-backendteststest_eligibility_enginepy)
4. [Frontend Component Breakdown](#4-frontend-component-breakdown)
   - [Global Profile Context (`frontend/src/context/ProfileContext.tsx`)](#41-global-profile-context-frontendsrccontextprofilecontexttsx)
   - [API Client & Fallback Evaluator (`frontend/src/lib/api.ts`)](#42-api-client--fallback-evaluator-frontendsrculibapits)
   - [Navbar Component (`frontend/src/components/Navbar.tsx`)](#43-navbar-component-frontendsrccomponentsnavbar-tsx)
   - [Profile Form (`frontend/src/components/ProfileForm.tsx`)](#44-profile-form-frontendsrccomponentsprofileformtsx)
   - [Scholarship Card (`frontend/src/components/ScholarshipCard.tsx`)](#45-scholarship-card-frontendsrccomponentsscholarshipcardtsx)
   - [Pages (Home, Matches, Directory, Documents)](#46-pages-home-matches-directory-documents)
5. [End-to-End Request Data Flow](#5-end-to-end-request-data-flow)

---

## 1. Architectural Philosophy & Design Rationale

### 1.1 Why Hybrid Rule Engine + AI Agent?

#### The Problem with Pure LLM Matching
Large Language Models (LLMs) excel at natural language understanding, but they are probabilistic and prone to hallucination. In scholarship eligibility, an error can be devastating:
- Informing a student whose annual family income is ₹3,00,000 that they qualify for a scheme capped strictly at ₹2,50,000 leads to rejected applications, wasted time, and missed deadlines.

#### The Solution: Hybrid Architecture
We separated **Eligibility Decision** from **Natural Language Guidance**:

```
+-------------------------------------------------------------------------+
|                              STUDENT PROFILE                            |
+------------------------------------+------------------------------------+
                                     |
                                     v
+------------------------------------+------------------------------------+
|               DETERMINISTIC PYTHON RULE ENGINE                      |
| - Compares exact income caps (<= 2.5L), categories, marks (>= 60%),|
|   domicile state, gender, and special quotas.                            |
| - Outputs: 100% ELIGIBLE / PARTIALLY_ELIGIBLE / INELIGIBLE               |
| - 100% Deterministic • Zero AI Hallucinations                            |
+------------------------------------+------------------------------------+
                                     |
                                     v
+------------------------------------+------------------------------------+
|                      AI COPILOT GUIDANCE AGENT                          |
| - Takes verified rule outputs and generates natural summaries.          |
| - Explains *why* a student qualifies or what missing document to fix.   |
| - Provides step-by-step procurement advice for e-District & Tehsildar. |
+-------------------------------------------------------------------------+
```

---

### 1.2 Why FastAPI + Next.js Stack?

1. **FastAPI (Backend)**:
   - **Performance**: High-performance Python async framework built on Starlette and Pydantic v2.
   - **Type Safety**: Automatic data validation and documentation generation (Swagger `/docs`).
   - **AI Ecosystem Integration**: Direct access to Python AI libraries (Gemini, OpenAI, LangChain, FAISS, NumPy).

2. **Next.js 14 App Router (Frontend)**:
   - **Server & Client Components**: Rapid page rendering with reactive UI components.
   - **Aesthetics & UX**: Combined with Tailwind CSS and glassmorphism styling for modern visual appeal.
   - **Zero-Config Routing**: Clean folder-based routing (`/profile`, `/matches`, `/scholarships`, `/documents`).

3. **SQLite / PostgreSQL (Database)**:
   - **Zero-Setup Quickstart**: Uses SQLite out-of-the-box for instant local development.
   - **Production Readiness**: Built on SQLAlchemy ORM, making PostgreSQL migration a one-line config change.

---

### 1.3 Why a 2-State User Journey (Guest vs Profile)?

In real-world applications, forcing a visitor to complete a lengthy 18-field form before exploring the site causes high bounce rates. We designed a **2-state flow**:

1. **State 1: Default Guest Portal (Before Profile Creation)**:
   - Visitors explore public features, search all 10+ verified scholarships, inspect eligibility rules, and view platform stats without any pre-filled profile or assumptions.
2. **State 2: Personalized AI Copilot (After Profile Creation)**:
   - Once a user completes their profile (or uses a 1-click test preset), the app dynamically switches to personalized matching, displaying AI copilot recommendations and personal financial aid totals.

---

## 2. System Architecture Diagram

```
[Browser / User]
       │
       ├──> Next.js Frontend (Port 3000)
       │       ├── ProfileContext (localStorage state management)
       │       ├── Pages (/profile, /matches, /scholarships, /documents)
       │       └── API Client (lib/api.ts with offline fallback engine)
       │
       └── REST API Calls (HTTP / JSON)
               │
               ▼
       FastAPI Backend (Port 8000)
               ├── Routers (routers/scholarships.py)
               ├── Pydantic Validation (models/schema.py)
               ├── Deterministic Engine (engine/eligibility_engine.py) ──► Strict Rules Evaluation
               ├── AI Guidance Agent (agent/llm_agent.py) ──────────────► Gemini / OpenAI / Fallback
               └── SQLAlchemy DB (models/database.py) ──────────────────► SQLite / PostgreSQL Seed
```

---

## 3. Backend Component Breakdown

### 3.1 Pydantic Schemas (`backend/app/models/schema.py`)

- **Purpose**: Defines data schemas, type constraints, and enums across the entire backend.
- **Key Schemas**:
  - `CategoryEnum`: `SC`, `ST`, `OBC`, `EWS`, `GENERAL`, `MINORITY`.
  - `GenderEnum`: `MALE`, `FEMALE`, `OTHER`, `ANY`.
  - `EducationLevelEnum`: `CLASS_10`, `CLASS_11`, `CLASS_12`, `DIPLOMA`, `UNDERGRADUATE`, `POSTGRADUATE`, `DOCTORAL`.
  - `StudentProfile`: 18+ fields including `annual_family_income`, `cgpa_or_percentage`, `domicile`, `single_girl_child`, `disability_status`, `first_generation_learner`.
  - `EligibilityRules`: Structured JSON rule model defining max income, allowed categories, allowed genders, allowed states, and minimum marks.
  - `ScholarshipMatchResult`: Stores `match_status` (`ELIGIBLE`, `PARTIALLY_ELIGIBLE`, `INELIGIBLE`), `confidence_score` (0-100%), `criteria_breakdown`, `missing_documents`, and `action_items`.

---

### 3.2 SQLAlchemy Database (`backend/app/models/database.py`)

- **Purpose**: Object-Relational Mapping (ORM) layer managing persistence for scholarships and student profiles.
- **Key Models**:
  - `ScholarshipDB`: Table storing scholarship metadata, provider info, deadline, official URL, eligibility rules JSON, and required documents JSON.
  - `StudentProfileDB`: Table storing saved student profile data.
- **How It Works**: Exposes `SessionLocal` and `init_db()`. When the app boots, `Base.metadata.create_all()` creates the SQLite tables automatically.

---

### 3.3 Deterministic Eligibility Engine (`backend/app/engine/eligibility_engine.py`)

- **Purpose**: Core logic engine that evaluates a `StudentProfile` against a `Scholarship`'s `EligibilityRules`.
- **How It Was Built**:
  1. **Income Check**: Compares `student.annual_family_income <= rules.max_annual_income`. Generates precise difference messages if exceeded.
  2. **Category Check**: Verifies `student.category in rules.allowed_categories`.
  3. **Gender Check**: Verifies `student.gender in rules.allowed_genders` or `GenderEnum.ANY`.
  4. **Academic Marks Check**: Verifies `student.cgpa_or_percentage >= rules.min_marks_percentage`.
  5. **Education Level Check**: Verifies `student.education_level in rules.allowed_education_levels`.
  6. **Domicile / State Check**: Checks if state/domicile is listed in `rules.allowed_states`.
  7. **Special Quotas**: Evaluates Single Girl Child, PwD disability percentage, and First-Gen learner constraints.
  8. **Scoring & Categorization**:
     - 0 Failed Rules ➔ `ELIGIBLE` (100% confidence).
     - 1 Minor Rule Failure (e.g. slight income or score delta) ➔ `PARTIALLY_ELIGIBLE`.
     - Multiple Fundamental Rule Failures ➔ `INELIGIBLE`.

---

### 3.4 AI Copilot Guidance Agent (`backend/app/agent/llm_agent.py`)

- **Purpose**: Generates plain-English advice, executive summaries, and document procurement guides.
- **How It Was Built**:
  - **Provider Abstraction**: Tries Gemini API (`google.generativeai`) if `GEMINI_API_KEY` is present.
  - **Deterministic Fallback Engine**: If no API key is set, executes an intelligent structured text generator. The application **never crashes or throws errors** due to missing API keys.
  - **Document Guidance Knowledge Base**: Contains detailed procurement steps for Indian certificates:
    - *Income Certificate*: Issued by Tehsildar / SDM via State e-District portal.
    - *Caste Certificate*: Issued by Revenue Dept / Executive Magistrate.
    - *Bank Aadhaar NPCI Mapping*: Seeding form submitted to home bank branch for DBT transfers.
    - *Bonafide Certificate*: Issued by college principal office.

---

### 3.5 Scholarship Knowledge Base (`backend/app/data/scholarship_seed.py`)

- **Purpose**: Provides pre-seeded data for 10 real, highly recognized Indian scholarships.
- **Included Schemes**:
  1. **NSP Post-Matric SC/ST**: Govt of India (Income <= 2.5L, SC/ST).
  2. **Reliance Foundation Undergraduate**: Corporate CSR (Up to ₹50,000/yr, Income <= 6L, Min 60%).
  3. **Tata Capital Pankh**: Corporate CSR (Up to ₹18,000/yr, Income <= 4L).
  4. **HDFC Parivartan ECSS**: Corporate CSR (Crisis & Need-based support up to ₹75,000/yr).
  5. **AICTE Pragati for Girls**: Technical degree/diploma scholarship for female students (₹50,000/yr, Income <= 8L).
  6. **PMSSS J&K and Ladakh**: AICTE scheme (Full fee + ₹1.25L maintenance).
  7. **Santoor Women's Scholarship**: Wipro Cares scheme for AP, Telangana, Karnataka, CG.
  8. **Foundation for Excellence (FFE)**: Engineering & MBBS degree grant (₹50,000/yr).
  9. **Aditya Birla Capital Scholarship**: Corporate CSR grant (Up to ₹60,000/yr).
  10. **Central Sector Scheme (NSP)**: Top 80th percentile Class 12 board scholarship.

---

### 3.6 REST API Routers (`backend/app/routers/scholarships.py`)

- **Endpoints**:
  - `GET /api/scholarships`: Supports filtering by `query`, `category`, `education_level`, `provider_type`, `state`, and `max_income`.
  - `GET /api/scholarships/{id}`: Returns single scholarship record.
  - `POST /api/eligibility/evaluate`: Saves/updates profile in DB, runs deterministic eligibility evaluation on all scholarships, and appends AI summary.
  - `POST /api/documents/guidance`: Generates step-by-step document procurement instructions for missing certificates.

---

### 3.7 FastAPI Main Server (`backend/app/main.py`)

- Initializes FastAPI application with title, version, and CORS middleware (`allow_origins=["*"]`).
- `@app.on_event("startup")`: Automates SQLite schema creation and populates the database with `SAMPLE_SCHOLARSHIPS` if empty.

---

### 3.8 Unit Testing Suite (`backend/tests/test_eligibility_engine.py`)

- Built with `pytest`.
- Tests rule engine behavior against edge cases:
  - Valid SC student meeting NSP criteria ➔ Expects `ELIGIBLE` (100%).
  - Male student attempting female-only AICTE Pragati ➔ Expects `INELIGIBLE` due to gender rule failure.
  - General student exceeding income cap ➔ Expects `INELIGIBLE` with income delta message.

---

## 4. Frontend Component Breakdown

### 4.1 Global Profile Context (`frontend/src/context/ProfileContext.tsx`)

- **Purpose**: React Context managing the **Guest Mode vs Active Profile** state across the entire frontend.
- **How It Works**:
  - Checks `localStorage` on initial mount.
  - Exposes `profile: StudentProfileData | null`, `hasProfile: boolean`, `saveProfile(data)`, `clearProfile()`.
  - `clearProfile()` reverts the app to **State 1 (Guest Mode)** instantly.

---

### 4.2 API Client & Fallback Evaluator (`frontend/src/lib/api.ts`)

- **Purpose**: Handles HTTP REST requests to the FastAPI backend (`http://localhost:8000/api`).
- **Resilience**: Includes a complete client-side mirror evaluator. If the FastAPI backend is offline during a local demo, the frontend falls back seamlessly without breaking the UI.

---

### 4.3 Navbar Component (`frontend/src/components/Navbar.tsx`)

- Glassmorphism navigation bar containing:
  - Brand Logo & Title.
  - Nav Links (`Home`, `My Profile`, `Matched Schemes`, `All Scholarships`, `Document Guide`).
  - Dynamic State Badge:
    - **Guest Visitor**: Displays "Create Profile" button.
    - **Profile Active**: Displays active profile badge (e.g. `Rahul • OBC`) with "Edit Profile" and "Reset Profile" buttons.

---

### 4.4 Profile Form (`frontend/src/components/ProfileForm.tsx`)

- Multi-section interactive form covering all 18+ profile attributes across 4 structured categories:
  1. Personal & Demographics
  2. Financial & Family Background
  3. Academic Details
  4. Special Quotas & Reservations
- **1-Click Test Presets**: Includes quick-load buttons for testing (e.g., *Rahul Sharma - OBC Tech Student*, *Priya Patel - Female Pragati Candidate*, *Ankit Kumar - SC Student*).

---

### 4.5 Scholarship Card (`frontend/src/components/ScholarshipCard.tsx`)

- Displays:
  - Scholarship Name, Provider badge, Amount/Year pill, Deadline urgency pill.
  - Match Status Badge (🟢 100% Eligible, 🟡 Partially Eligible, 🔴 Ineligible).
  - Required document tags.
  - **Expandable Rule-by-Rule Accordion**: Shows green checkmarks for passed rules and red X icons for failed rules, explaining the exact mathematical difference.
  - Direct CTA button to the official portal.

---

### 4.6 Pages (Home, Matches, Directory, Documents)

- **Home Page (`frontend/src/app/page.tsx`)**:
  - **State 1 (Guest)**: Displays public hero banner, platform statistics, "How It Works" 4-step workflow, public scheme explorer, and CTA banner.
  - **State 2 (Personalized)**: Displays personalized metrics (Total Aid ₹), AI Copilot strategy summary card, and top matched scholarships.
- **Matches Hub (`frontend/src/app/matches/page.tsx`)**:
  - **State 1 (Guest)**: Displays clean empty state explaining why creating a profile unlocks rule matching, with 1-click sample presets.
  - **State 2 (Personalized)**: Displays matched scholarships filtered by *All Matches*, *Fully Eligible*, and *Partially Eligible*.
- **Scholarship Directory (`frontend/src/app/scholarships/page.tsx`)**:
  - Public search & knowledge base explorer with real-time filters for search query, category, education level, state, and provider type.
- **Document Guide (`frontend/src/app/documents/page.tsx`)**:
  - Displays step-by-step instructions for acquiring required Indian certificates from e-District portals, Tehsildar desks, and bank branches.

---

## 5. End-to-End Request Data Flow

Here is what happens when a student fills out their profile and clicks **"Save & Evaluate"**:

```
 1. User submits ProfileForm in Next.js UI
    │
 2. saveProfile() updates ProfileContext & saves to localStorage
    │
 3. POST request sent to FastAPI (/api/eligibility/evaluate) with StudentProfile JSON
    │
 4. FastAPI validates request payload using Pydantic StudentProfile model
    │
 5. Profile is saved/updated in SQLite database (StudentProfileDB)
    │
 6. EligibilityEngine.evaluate_all() iterates through all scholarships in DB:
    ├── Evaluates Income Rule (student.income <= max_income)
    ├── Evaluates Category Rule (student.category in allowed_categories)
    ├── Evaluates Gender & Quotas (female/single girl child/PwD)
    └── Computes confidence score (0-100%) and MatchStatus (ELIGIBLE/PARTIAL/INELIGIBLE)
    │
 7. ScholarshipCopilotAgent generates natural language executive summary
    │
 8. OverallEligibilityResponse returned to Next.js frontend
    │
 9. UI switches to State 2 (Personalized Dashboard) & renders matched cards with rule accordions
```
