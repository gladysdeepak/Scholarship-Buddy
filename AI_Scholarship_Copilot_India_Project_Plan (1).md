# AI Scholarship Copilot for India

## Vision

Build an **Agentic AI platform** that helps Indian students discover
scholarships, verify eligibility, prepare applications, and receive
proactive notifications about new opportunities.

The goal is to eliminate the confusion caused by scattered scholarship
information and make quality guidance accessible to every student.

------------------------------------------------------------------------

# Problem Statement

Students often struggle because:

-   Scholarship information is scattered across multiple government and
    private portals.
-   Eligibility rules are complex and vary by scholarship.
-   Many students are unaware of scholarships they qualify for.
-   Resume, SOP, and essay writing are difficult without guidance.
-   Important deadlines are frequently missed.
-   Required documents are often unclear.

------------------------------------------------------------------------

# Core Features

## 1. Student Profile

Collect information such as:

-   Name
-   State
-   District
-   Category (SC/ST/OBC/EWS/General)
-   Annual Family Income
-   Religion (if applicable)
-   Gender
-   Disability Status
-   First-generation learner
-   Parent Occupation
-   Education Level
-   Institution Type
-   Course
-   Year of Study
-   CGPA / Percentage
-   Hostel Status
-   Domicile
-   Sports / NCC / Defence Quota

------------------------------------------------------------------------

## 2. Eligibility Agent

### Responsibilities

-   Match student profile against scholarship eligibility rules.
-   Explain why a scholarship is or isn't eligible.
-   Rank scholarships by confidence and relevance.

### Example Output

-   Eligible Scholarships
-   Partially Eligible
-   Missing Documents
-   Upcoming Deadlines

------------------------------------------------------------------------

## 3. Scholarship Knowledge Base

Maintain structured information for every scholarship.

Each record should include:

-   Scholarship Name
-   Provider
-   Amount
-   Eligibility Rules
-   Required Documents
-   Deadline
-   Renewal Rules
-   Official Website
-   Application Process
-   Contact Details

------------------------------------------------------------------------

## 4. Document Agent

Generate personalized document checklists.

Example:

-   Aadhaar
-   Income Certificate
-   Caste Certificate
-   Bonafide Certificate
-   Previous Marks Card
-   Bank Passbook
-   Fee Receipt

Also explain where each document can be obtained.

------------------------------------------------------------------------

## 5. Resume & SOP Agent

Interview the student and generate:

-   Resume
-   Statement of Purpose
-   Personal Statement
-   Scholarship Essays
-   Cover Letters

Allow users to regenerate content tailored for a specific scholarship.

------------------------------------------------------------------------

## 6. Application Assistant

Guide students step-by-step through the application process.

Features:

-   Checklist
-   Progress Tracker
-   Missing Document Detection
-   Application Readiness Score

------------------------------------------------------------------------

## 7. Deadline & Notification Agent

Monitor scholarship portals for:

-   New scholarships
-   Deadline changes
-   Requirement updates

Notify users about relevant opportunities based on their profile.

------------------------------------------------------------------------

## 8. Application Review Agent

Review uploaded:

-   Resume
-   SOP
-   Essays

Provide feedback on:

-   Grammar
-   Clarity
-   Structure
-   Impact
-   Missing Achievements

------------------------------------------------------------------------

## 9. Opportunity Recommendation Agent

Beyond scholarships, recommend:

-   Internships
-   Fellowships
-   Research Grants
-   Hackathons
-   Competitions
-   Exchange Programs
-   Government Schemes

------------------------------------------------------------------------

# System Architecture

Frontend

-   Next.js / React

Backend

-   FastAPI

Database

-   PostgreSQL

Vector Database

-   FAISS or Chroma

LLM

-   GPT or an open-weight model (e.g. Llama/Qwen)

Agent Framework

-   LangGraph or similar orchestration framework

Notifications

-   Email
-   WhatsApp
-   SMS

------------------------------------------------------------------------

# Data Pipeline

1.  Collect scholarship data from official portals.
2.  Normalize eligibility rules into structured fields.
3.  Store scholarship metadata in PostgreSQL.
4.  Index descriptive content in a vector database.
5.  Keep data updated with scheduled refresh jobs.

------------------------------------------------------------------------

# User Flow

1.  Student creates a profile.
2.  AI determines eligibility.
3.  AI ranks scholarships.
4.  Student receives a document checklist.
5.  AI generates resume/SOP.
6.  Student applies.
7.  AI monitors deadlines and new opportunities.
8.  AI suggests additional scholarships as the profile evolves.

------------------------------------------------------------------------

# Future Enhancements

-   Regional language support
-   Voice assistant
-   Parent dashboard
-   College counselor dashboard
-   OCR for uploaded documents
-   AI chatbot for scholarship FAQs
-   Mobile application
-   Calendar integration
-   Scholarship success analytics

------------------------------------------------------------------------

# Key Differentiator

This is **not just a scholarship search engine**.

It is an **AI-powered scholarship and academic opportunity copilot**
that combines:

-   Rule-based eligibility matching
-   Retrieval over scholarship knowledge
-   Agentic workflows
-   Document generation
-   Application guidance
-   Continuous opportunity monitoring

The emphasis should be on **accurate eligibility decisions using
structured rules**, with AI assisting in explanations, writing, and user
guidance rather than making eligibility decisions on its own.
