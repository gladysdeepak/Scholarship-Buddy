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
