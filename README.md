# 🎓 Scholarship Buddy — AI Scholarship Copilot for India

> **Agentic AI platform & deterministic rule engine helping Indian students discover scholarships, verify eligibility with zero hallucinations, prepare applications, and receive proactive guidance.**

![License](https://img.shields.io/badge/Phase-Phase%201%20Complete-indigo)
![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-emerald)
![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![Database](https://img.shields.io/badge/Database-SQLite%20%2F%20PostgreSQL-cyan)

---

##  Overview & Vision

Indian students often miss out on millions of rupees in scholarship grants due to scattered information across government portals (NSP, State portals) and private corporate CSR schemes (Reliance, Tata, HDFC, Wipro, Aditya Birla).

**Scholarship Buddy** solves this by combining:
1. **100% Deterministic Python Rule Matching**: Evaluates exact criteria (annual family income, reservation category, domicile state, academic percentage, special quotas) without relying on AI for eligibility decisions—eliminating AI hallucinations.
2. **Agentic AI Guidance**: Generates natural language executive summaries, step-by-step action plans, and tailored document procurement advice.
3. **Seamless 2-State User Journey**: Provides a public exploratory portal for guest visitors and dynamically unlocks personalized matching once a student profile is created.

---

## 🚀 Key Features (Phase 1 Implementation)

### 1.  2-State User Flow
- **State 1: Default Guest Portal (No Profile Created)**
  - Public landing experience showcasing verified schemes, platform stats (10+ schemes, ₹50L+ grant pool), and a 4-step "How It Works" guide.
  - Searchable & filterable public scholarship directory.
  - Prominent CTAs encouraging visitors to build a profile.
- **State 2: Personalized AI Copilot (Profile Created)**
  - Switches automatically to a personalized dashboard once a profile is created or a 1-click test preset is selected.
  - Displays personalized match stats, AI strategy executive summary card, 100% Eligible vs. Partially Eligible badges, rule inspection breakdown, and total grant aid calculation.
  - Header badge displaying active profile details with a 1-click **"Reset Profile / Guest Mode"** button.

### 2.  Comprehensive Student Profile System (18+ Attributes)
Captures all parameters required by Indian scholarship rules:
- **Demographics**: Name, Domicile State, District, Category (SC/ST/OBC/EWS/General/Minority), Religion, Gender.
- **Financial Background**: Annual Family Income (INR ₹), Parent Occupation, First-Generation Learner status.
- **Academic Details**: Education Level (Class 10, Class 11, Class 12, Diploma, Undergraduate, Postgraduate, PhD), Course/Branch, Year of Study, Academic Score (% or CGPA).
- **Special Quotas & Reservations**: Single Girl Child, Person with Disability (PwD status & %), Sports/NCC Quota, Defence/Ex-Servicemen Quota, Hostel Status.

### 3.  Deterministic Rule-Based Eligibility Engine
- Evaluates student profiles against structured scholarship JSON schemas.
- Outputs match statuses:
  - 🟢 **`ELIGIBLE`** (100% rules satisfied)
  - 🟡 **`PARTIALLY_ELIGIBLE`** (Minor income/score threshold delta or document pending)
  - 🔴 **`INELIGIBLE`** (Core criterion mismatch)
- Provides rule-by-rule inspection (e.g. *"Family income ₹2,50,000 is within max limit ₹6,00,000"*).

### 4.  Pre-Seeded Knowledge Base (10 Real Indian Schemes)
Pre-populated with detailed eligibility rules, deadlines, required documents, and official portal links for:
1. **NSP Post-Matric Scholarship for SC/ST Students** (Govt. of India)
2. **Reliance Foundation Undergraduate Scholarship** (Up to ₹50,000/yr)
3. **Tata Capital Pankh Scholarship** (Up to ₹18,000/yr)
4. **HDFC Bank Parivartan's ECSS / Badhte Kadam** (Up to ₹75,000/yr)
5. **AICTE Pragati Scholarship Scheme for Girl Students** (₹50,000/yr)
6. **Prime Minister's Special Scholarship Scheme (PMSSS J&K and Ladakh)** (Full tuition + ₹1.25 Lakh maintenance)
7. **Santoor Women's Scholarship** (Wipro Cares, ₹24,000/yr)
8. **Foundation for Excellence (FFE) Merit Scholarship** (Engineering/Medical, ₹50,000/yr)
9. **Aditya Birla Capital Scholarship** (₹60,000/yr)
10. **Central Sector Scheme of Scholarships for College Students** (Ministry of Education)

### 5. Document Procurement Advisor
Generates customized guidance on where and how to obtain required Indian documents:
- **Income Certificate**: Tehsildar office / State e-District portal / CSC MeeSeva.
- **Caste Certificate**: Executive Magistrate / Revenue Department.
- **Aadhaar NPCI Mapping**: Bank branch Direct Benefit Transfer (DBT) seeding.
- **Bonafide Certificate**: College administrative counter.

---

##  Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 (App Router) | React, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion |
| **Backend** | FastAPI | Python 3.10+, Pydantic v2, Uvicorn |
| **Database** | SQLite / PostgreSQL | SQLAlchemy ORM with automatic startup schema & seed data |
| **AI Copilot** | Gemini / OpenAI API | Pluggable LLM integration with intelligent deterministic fallbacks |
| **Styling** | Vanilla CSS + Tailwind | Glassmorphism UI cards, dark modern aesthetics |

---

## Project Architecture

```
SCHOLARSHIP_BUDDY/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI entry point & startup auto-seeder
│   │   ├── models/
│   │   │   ├── schema.py               # Pydantic schemas (StudentProfile, Scholarship, Rules)
│   │   │   └── database.py             # SQLAlchemy models for SQLite/PostgreSQL
│   │   ├── engine/
│   │   │   └── eligibility_engine.py   # Deterministic rule-based matching engine
│   │   ├── agent/
│   │   │   └── llm_agent.py            # AI Copilot summary & document guidance agent
│   │   ├── data/
│   │   │   └── scholarship_seed.py     # 10+ real Indian scholarship datasets
│   │   └── routers/
│   │       └── scholarships.py         # REST API endpoints
│   ├── tests/
│   │   └── test_eligibility_engine.py  # Unit tests for rule engine
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx                # Dynamic Home (Guest Portal vs Personalized Dashboard)
    │   │   ├── profile/page.tsx        # Student Profile Manager
    │   │   ├── matches/page.tsx        # Matched Scholarships Hub with filters
    │   │   ├── scholarships/page.tsx   # Scholarship Knowledge Base & Search Explorer
    │   │   ├── documents/page.tsx      # Document Procurement Guide
    │   │   ├── layout.tsx              # Root Layout with ProfileProvider wrapper
    │   │   └── globals.css             # Glassmorphism dark visual styles
    │   ├── components/
    │   │   ├── Navbar.tsx              # Header navigation bar with state indicators
    │   │   ├── ProfileForm.tsx         # 18+ field profile form with quick test presets
    │   │   └── ScholarshipCard.tsx     # Card component with rule inspection accordion
    │   ├── context/
    │   │   └── ProfileContext.tsx      # React Context for Guest vs Active Profile state
    │   └── lib/
    │       └── api.ts                  # API client + offline fallback evaluator
    ├── package.json
    └── tailwind.config.js
```

---

## 💻 Quick Start Guide

### Prerequisites
- **Node.js** v18.0 or higher
- **Python** v3.10 or higher
- **npm** or **yarn**

---

### 1. Backend Setup (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. Install requirements:
   ```bash
   pip install --timeout 120 --retries 10 -r requirements.txt
   ```

4. *(Optional)* Set API key for Gemini / OpenAI in a `.env` file inside `backend/`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```
   *(Note: If no API key is set, the application automatically uses its intelligent fallback engine.)*

5. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   - **API Server**: `http://localhost:8000`
   - **Interactive Swagger Docs**: `http://localhost:8000/docs`

---

### 2. Frontend Setup (Next.js)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` in your web browser.

---

##  REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | API Health Check |
| `GET` | `/api/scholarships` | List & filter scholarships by keyword, category, education level, state, provider |
| `GET` | `/api/scholarships/{id}` | Retrieve full scholarship details by ID |
| `POST` | `/api/eligibility/evaluate` | Evaluate student profile against all scholarships deterministically & return AI summary |
| `POST` | `/api/documents/guidance` | Generate tailored document procurement instructions based on profile & matched schemes |

---

##  Running Backend Unit Tests

Run unit tests for the deterministic rule engine:
```bash
cd backend
python3 -m pytest tests/
```

---

##  Roadmap & Future Enhancements (Phase 2+)

- [ ] **Resume & SOP Agent**: AI-assisted writing for scholarship essays, cover letters, and statements of purpose.
- [ ] **Application Progress Tracker**: Step-by-step progress tracking and deadline countdown alerts via WhatsApp / SMS / Email.
- [ ] **Document OCR & Verification**: Auto-extract income and category details from uploaded certificates.
- [ ] **Multi-lingual Support**: Hindi, Marathi, Tamil, Telugu, and Kannada regional language options.

---
