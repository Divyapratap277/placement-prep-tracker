 PDF To Markdown Converter
Debug View
Result View
What is this app in one line?

A "Placement Prep Tracker" where nal-year CS students add target companies, create prep
tasks (DSA, system design, projects), and track progress (pending/in-progress/done).

Who is the user?

Final-year engineering students preparing for campus placements at top tech companies.

Business Value:

Solves the problem: Students prep randomly without tracking progress or company-
specic requirements.
Aligns with House of Edtech's mission: Upskilling students for better career outcomes.
Signup/Login:

Student creates account with name, email, password
Uses NextAuth.js + credentials provider
Password hashing with bcrypt
Session management via JWT
Why:

Each student sees only their own companies and tasks
Secure and industry-standard
What is a Company?

A target company record (NOT a real user) storing:

Company name (e.g., Amazon, TCS, Microsoft)
Role (e.g., SDE 1, Ninja, Fullstack Developer)
CTC (expected salary)
Location
Rounds (Online test, Tech 1, Tech 2, HR, Bar Raiser, etc.)
Required skills (DSA, System Design, Java, SQL, React, etc.)
Placement Prep Tracker – Product
Requirements Document
1. Project Overview
2. Core Features
2.1 Authentication (Must-Have)
2.2 Companies Management (Must-Have)
CRUD Operations:

Operation Details
Create Student adds new target company
Read View list of all target companies with lters
Update Edit company details (role, CTC, required skills, etc.)
Delete Remove company from tracking
Example Flow:

Student goes to /companies page
Clicks "Add Company"
Fills: Amazon, SDE 1, 25 LPA, Bangalore, Rounds: OA/Tech1/Tech2/HR, Skills:
DSA/System Design/Java
Company appears in table
UI:

Table showing:

Compa
ny
Role CTC
Locatio
n
Rounds Actions
Amazon
SDE
1
25
LPA
Bangalo
re
OA, Tech 1, Tech
2, HR
Edit,
Delete
TCS
Ninj
a
3.
LPA
Mumba
i
Online Test, HR
Edit,
Delete
What is a Task?

A unit of work the student must complete for preparation:

Title (e.g., "Solve 20 Array DSA questions")
Type (DSA, CS Theory, Project, Web Dev, etc.)
Status (TODO, IN_PROGRESS, DONE)
Topic (Arrays, DP, DBMS, OOPs, React, etc.)
Due date
Linked company (optional)
CRUD Operations:

2.3 Tasks Management (Must-Have)
Operatio
n
Details
Create
Student adds prep task with type, deadline, optional
company link
Read
View tasks with lters (by company, status, topic, due
date)
Update Change task status or edit details
Delete Remove task
Example Flow:

Student goes to /tasks page
Clicks "Add Task"
Fills: "Solve 20 Array DSA questions", DSA, TODO, Arrays, 2025-12-04, Link to Amazon
Task appears in dashboard
UI:

Table showing:

Task Title Type Status
Com
pany
Topi
c
Due
Date
Actio
ns
Solve 20
Array
questions
DSA TODO
Amaz
on
Arra
ys
2025-
12-
Edit,
Delete
Revise DBMS
CS
Theo
ry
IN_PRO
GRESS
TCS
DBM
S
2025-
12-
Edit,
Delete
Build CRUD
project
Proje
ct
TODO —
Fulls
tack
2025-
12-
Edit,
Delete
What the student sees on /dashboard:

Total tasks count
Done count
In-progress count
TODO count
Total companies count
"Tasks due today/this week" list (with urgency highlight)
2.4 Dashboard (Must-Have)
Progress percentage by company (e.g., "Amazon: 3/10 tasks done")
Quick stats cards
Purpose:

When a student opens the app, they instantly see:

How many tasks remain
Which companies they're prepping for
What's urgent
Feature:

"Generate AI Prep Plan" button on dashboard.

User Input:

Select target company (from their list)
Prep duration (e.g., "30 days", "60 days")
Current skill level (optional)
AI Output (using Vercel AI SDK + OpenAI/Gemini):

AI generates week-by-week breakdown:

Week 1: Arrays & Strings Basics

Solve 15 easy array problems on LeetCode
Master two-pointer technique
Practice string manipulation (5 problems)
Week 2: Dynamic Programming Intro

Study DP fundamentals (read article)
Solve 10 DP problems (easy to medium)
Practice overlapping subproblems
Week 3: System Design Basics

Study scalability concepts
Learn database sharding
Read 2 system design articles
Auto-create Tasks:

AI-generated plan is converted to tasks automatically:

prisma.task.createMany([...])
Each task linked to the company
Student can then track progress
Why:

2.5 AI Feature: Smart Prep Plan Generator (Optional but Recommended)
Beyond basic CRUD (meets House of Edtech assignment requirement [le:1])
Demonstrates AI integration (optional bonus)
Saves student time
id: String (cuid, primary key)
name: String
email: String (unique)
password: String (bcrypt hashed)
createdAt: DateTime
updatedAt: DateTime

Relationships:

companies: Company[] (one-to-many)
tasks: Task[] (one-to-many)
id: String (cuid, primary key)
userId: String (foreign key to User)
name: String
role: String
ctc: String
location: String
rounds: String (JSON format or plain text)
requiredSkills: String (JSON format or plain text)
createdAt: DateTime
updatedAt: DateTime

Relationships:

user: User (many-to-one)
tasks: Task[] (one-to-many)
id: String (cuid, primary key)
userId: String (foreign key to User)
companyId: String? (nullable foreign key to Company)
title: String
type: String (DSA, CS Theory, Project, etc.)
status: String (TODO, IN_PROGRESS, DONE)
topic: String
dueDate: DateTime
createdAt: DateTime
updatedAt: DateTime

Relationships:

3. Database Schema
3.1 User Table
3.2 Company Table
3.3 Task Table
user: User (many-to-one)
company: Company? (many-to-one, nullable)
Layer Technology
Frontend Next.js 16 (App Router) + TypeScript
UI Components shadcn/ui + Tailwind CSS
Backend Next.js API Routes
Database PostgreSQL (Supabase)
ORM Prisma 6
Authentication NextAuth.js (credentials provider)
AI Integration Vercel AI SDK + OpenAI/Gemini (optional)
Deployment Vercel
placement-prep-tracker/
├── src/
│ ├── app/
│ │ ├── layout.tsx (root layout with providers)
│ │ ├── page.tsx (home/landing)
│ │ ├── auth/
│ │ │ ├── login/page.tsx
│ │ │ ├── signup/page.tsx
│ │ ├── dashboard/page.tsx (protected)
│ │ ├── companies/page.tsx (protected)
│ │ ├── tasks/page.tsx (protected)
│ │ ├── api/
│ │ │ ├── auth/[...nextauth]/route.ts
│ │ │ ├── companies.ts (POST, GET, PATCH, DELETE)
│ │ │ ├── tasks.ts (POST, GET, PATCH, DELETE)
│ │ │ └── generate-plan.ts (AI feature)
│ ├── lib/
│ │ ├── prisma.ts (Prisma client)
│ │ └── auth.ts (auth setup)
│ ├── components/
│ │ ├── providers/ (SessionProvider, etc.)
│ │ └── ui/ (form components, tables, etc.)
├── prisma/

4. Technical Architecture
4.1 Tech Stack
4.2 Folder Structure
│ ├── schema.prisma
│ └── migrations/
├── .env
├── package.json
└── tscong.json

POST /api/companies

Create new company
Input: name, role, ctc, location, rounds, requiredSkills
Output: created company object
GET /api/companies?userId=...

List all companies for a user
Optional lters: search, sortBy
PATCH /api/companies/[id]

Update company details
Input: elds to update
Output: updated company
DELETE /api/companies/[id]

Remove company
Returns: success message
Similar for Tasks:

POST /api/tasks (create)
GET /api/tasks (list with lters)
PATCH /api/tasks/[id] (update status/details)
DELETE /api/tasks/[id] (delete)
POST /api/generate-plan (AI Feature)

Input: companyId, duration, skillLevel
Output: week-by-week plan (JSON)
Side eect: auto-creates tasks in DB
Visit app → see landing page
Click "Sign Up"
Enter name, email, password → Create account
Redirected to /dashboard (empty state)
Click "Add Company" → Fill Amazon details → Save
Click "Add Task" → Link to Amazon, set due date → Save
4.3 API Routes (CRUD Operations)
5. User Flows
5.1 First-Time User Flow
See dashboard with 1 company, 1 task
Repeat: add more companies and tasks
Log in → See /dashboard
View "Tasks due today"
Go to /tasks → Find "Revise DBMS" → Click "In Progress"
Track progress percentage per company
If stuck on prep plan → "Generate AI Plan" → Get recommendations
Update task status as completed
Student sees company has 5 tasks
Completes 3 tasks → Updates status to DONE
Sees "Amazon: 60% prep complete"
Can now apply with condence
Dashboard loads in <2 seconds
API responses in <500ms
SSR for initial page load (Vercel Serverless)
Code splitting for lazy-loaded routes
Password hashing with bcrypt (10 rounds)
JWT tokens with expiry (30 days default)
Input validation with zod
CORS enabled for trusted origins
SQL injection prevention via Prisma ORM
Prisma connection pooling via Supabase
Database indexes on userId, companyId, status
Can handle 10K+ students, 100K+ tasks
User-friendly error messages
Server logs for debugging
Graceful fallback UI (loading states, error boundaries)
5.2 Daily Workow
5.3 Company Application Flow
6. Non-Functional Requirements
6.1 Performance
6.2 Security
6.3 Scalability
6.4 Error Handling
Milestone Target Date Status
DB + Prisma setup Dec 3 ✅ Done
Auth system Dec 4 AM In Progress
Companies CRUD + UI Dec 4 PM Pending
Tasks CRUD + UI Dec 5 AM Pending
Dashboard + stats Dec 5 AM Pending
AI plan generator Dec 5 PM Pending
Testing + bug xes Dec 5 PM Pending
Final deployment Dec 6 Pending
README + documentation Dec 6 Pending
✅ All CRUD operations work end-to-end
✅ Authentication secure and functioning
✅ Dashboard displays accurate stats
✅ AI plan generator produces useful recommendations
✅ Mobile responsive (Tailwind + shadcn)
✅ Code is clean, documented, TypeScript-safe
✅ Deployed live on Vercel
✅ README with setup, feature list, screenshots
Collaboration: Share prep plans with friends
Analytics: Completion trends over time
Notications: Reminders for due tasks
Integration: LeetCode API for auto-fetching questions
Mobile app: React Native version
Community: Share tips/resources with other students
7. Milestones & Timeline
8. Success Metrics
9. Future Enhancements (Post-MVP)
How this project meets House of Edtech assignment requirements:

Requirement Implementation
CRUD operations Companies (C,R,U,D) + Tasks (C,R,U,D) ✅
Next.js 16 App Router + TypeScript ✅
PostgreSQL Supabase + Prisma ✅
Tailwind CSS shadcn/ui components ✅
Authentication NextAuth.js + JWT ✅
Beyond basic CRUD AI Prep Plan Generator ✅
Real-world value Solves actual student pain point ✅
Secure + scalable Bcrypt, Prisma pooling, indexes ✅
Deployment Vercel CI/CD ✅
Code quality TypeScript, clean architecture ✅
Landing page: Hero + CTA "Get Started"
Signup page: Form with validation
Dashboard: Stats cards, company list, urgency highlights
Companies table: Full CRUD interface
Tasks table: Filters, status updates, bulk actions
AI plan modal: Input form + generated week-by-week plan
Mobile view: Responsive design on phone
Author: Divya
GitHub: [Your GitHub Prole]
LinkedIn: [Your LinkedIn Prole]
Deadline: Dec 6, 2025

10. Assignment Alignment
11. Demo Screenshots (Planned)
This is a offline tool, your data stays locally and is not send to any server!
Feedback & Bug Reports