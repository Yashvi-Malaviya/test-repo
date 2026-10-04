# Samaira --- One-Day SIH MVP Build Plan

## Problem Statement 26241 --- AI-Enabled Career Counselling and Family Decision-Support Platform for Vocational Education

------------------------------------------------------------------------

# 0. Objective

Build a **basic but polished end-to-end prototype in one day**.

The prototype must prove this core idea:

> A student and parent can interact with **Samaira**, an AI vocational
> career counsellor, select a vocational career such as **Electrician**,
> ask questions about income/career growth/job security/etc., and
> receive a data-backed answer in **English or Gujarati**.

The prototype should demonstrate:

``` text
Student + Parent
      ↓
Samaira
      ↓
Student Profile
      ↓
Vocational Career Selection
      ↓
Electrician Animated/Illustrated Environment
      ↓
Parent Concern
      ↓
Gemini AI
      ↓
Vocational Dataset
      ↓
Data-backed Answer
      ↓
English / Gujarati
      ↓
Career / Salary Visualization
      ↓
Human Counsellor Escalation
      ↓
Admin Analytics
```

## Scope Rule

**Do not attempt to build a production-ready platform today.**

Build one excellent end-to-end journey and keep the remaining
trades/data ready for expansion.

------------------------------------------------------------------------

# 1. Recommended Technology Stack

Use the existing Antigravity project stack if one already exists.

### Frontend

-   React
-   Vite
-   CSS / Tailwind if already configured
-   Framer Motion or another lightweight animation library

### Backend

Choose one:

-   FastAPI + Python
-   Node.js + Express

Do not migrate an existing working project just to change frameworks.

### AI

-   Google Gemini API

### Data

For today's MVP:

-   JSON dataset

Later:

-   SQLite/PostgreSQL
-   RAG/vector database if required

### Voice

Optional for MVP:

-   Speech-to-text
-   Text-to-speech

Do not delay the core prototype for voice.

------------------------------------------------------------------------

# 2. Project Folder Structure

Ask Antigravity to create/maintain approximately this structure:

``` text
samaira/
│
├── frontend/
│   ├── components/
│   │   ├── Samaira.jsx
│   │   ├── WelcomeScene.jsx
│   │   ├── ProfileScene.jsx
│   │   ├── CareerSelection.jsx
│   │   ├── CareerEnvironment.jsx
│   │   ├── CounsellingPanel.jsx
│   │   ├── DataVisualization.jsx
│   │   ├── CareerPathway.jsx
│   │   ├── LanguageSelector.jsx
│   │   └── CounsellorModal.jsx
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Counselling.jsx
│   │   └── Admin.jsx
│   │
│   ├── assets/
│   │   ├── samaira/
│   │   └── environments/
│   │
│   └── data/
│       └── vocational_courses.json
│
├── backend/
│   ├── main.py / server.js
│   ├── ai/
│   ├── routes/
│   └── services/
│
└── README.md
```

If Antigravity uses a different structure, preserve its existing
conventions.

------------------------------------------------------------------------

# 3. Task 1 --- Create the Basic Website Shell

## Goal

Create the initial website navigation and scene structure.

## Required screens

### Screen 1 --- Welcome

Full-screen immersive landing scene.

Display:

> **Hello, I'm Samaira.**

> **I'm here to help you and your family explore vocational career
> opportunities.**

Buttons:

-   Start Counselling
-   Explore Careers
-   English / ગુજરાતી

### Screen 2 --- Family Introduction

Samaira asks:

> "Who is exploring a career today?"

Options:

-   Student
-   Student + Parent

For the main demo, use:

**Student + Parent**

### Screen 3 --- Student Profile

Collect only:

-   Education
-   Location
-   Main interest

Do not create a long form.

### Screen 4 --- Career Selection

Display:

-   Electrical
-   Renewable Energy
-   Manufacturing
-   Automotive
-   Healthcare
-   IT & Digital
-   Construction
-   Retail

### Screen 5 --- Career Environment

For the MVP, only Electrician needs a full environment.

### Screen 6 --- Counselling

Show parent concerns and free-form question input.

### Screen 7 --- Admin

Simple analytics dashboard.

------------------------------------------------------------------------

# 4. Task 2 --- Add Samaira

## Goal

Make Samaira the central visual element.

Use the existing Samaira character design/image.

### Do NOT build a full 3D character today.

Use the character image with lightweight animations.

Required visual states:

``` text
idle
listening
speaking
thinking
explaining
reassuring
pointing
```

If separate character images are unavailable:

-   use one image
-   apply subtle floating motion
-   use scale/position animation
-   change surrounding UI based on state
-   use speech bubbles
-   use expression/visual overlays if available

### Samaira personality

Samaira should feel:

-   Friendly
-   Respectful
-   Reassuring
-   Professional
-   Non-judgmental
-   Family-oriented

She should not pressure parents into choosing vocational education.

------------------------------------------------------------------------

# 5. Task 3 --- Create the Electrician Environment

## Goal

Create the main "wow" scene.

Do NOT spend time creating a complex 3D world.

Use an illustrated/AI-generated electrical workplace background.

It should contain visual elements such as:

-   Electrical panels
-   Wiring
-   Tools
-   Equipment
-   Workshop/building environment
-   Worker/electrical work context

Place Samaira inside the scene.

### Environment states

Use the same environment but change overlays/camera focus:

``` text
WORKPLACE
    ↓
INCOME
    ↓
CAREER GROWTH
    ↓
SAFETY
```

This creates the feeling that Samaira is taking the family through
different parts of the career.

------------------------------------------------------------------------

# 6. Task 4 --- Add the Vocational Dataset

Use the previously created:

**Samaira Vocational Course Knowledge Dataset**

The initial dataset contains 8 representative trades:

``` text
VOC001 — Electrician
VOC002 — Solar PV Installer / Technician
VOC003 — CNC Operator
VOC004 — Automotive Service Technician
VOC005 — General Duty Assistant
VOC006 — Domestic Data Entry Operator
VOC007 — Assistant Electrician / Construction Electrician
VOC008 — Retail Sales Associate
```

Convert the Markdown knowledge into:

``` text
data/vocational_courses.json
```

------------------------------------------------------------------------

# 7. Dataset Schema

Each course should contain:

``` json
{
  "course_id": "",
  "sector": "",
  "trade_name": "",
  "aliases": [],
  "entry_education": "",
  "typical_duration": "",
  "example_nsqf_level": "",
  "work_environment": "",
  "practical_work": [],
  "major_skills": [],
  "common_job_roles": [],
  "industries": [],
  "career_growth": [],
  "further_learning": [],
  "parent_concerns": [],
  "demo_starting_earnings_monthly": "",
  "demo_experienced_earnings_monthly": "",
  "demo_placement_rate": "",
  "data_status": "SYNTHETIC DEMO"
}
```

------------------------------------------------------------------------

# 8. IMPORTANT DATA RULE

The existing dataset contains **synthetic/demo salary and placement
values**.

Therefore the website MUST visibly or contextually label these values:

> **Prototype / Demo Dataset**

Do NOT claim that the synthetic numbers are official MSDE/government
statistics.

When the hackathon provides its dummy placement/earnings dataset,
replace the prototype values.

------------------------------------------------------------------------

# 9. Task 5 --- Build the Parent Concern Interface

When Electrician is selected, Samaira says:

> "What would you like to know about this career?"

Show:

``` text
💰 Income
📈 Career Growth
🏢 Job Opportunities
🛡️ Job Security
🎓 Further Education
🦺 Safety
🏠 Work Environment
📍 Local Opportunities
💬 Ask Something Else
```

Also provide a free-form text box.

Optional:

🎤 microphone button.

------------------------------------------------------------------------

# 10. Task 6 --- Create the Concern Mapping

Use the parent concern dataset from the original Samaira dataset.

``` text
CON001 → Income
CON002 → Placement
CON003 → Career Growth
CON004 → Job Security
CON005 → Further Education
CON006 → Social Perception
CON007 → Safety
CON008 → Location
CON009 → Duration
CON010 → Eligibility
CON011 → Cost
CON012 → Skills
```

When a user clicks a concern, retrieve the appropriate course
information.

Example:

``` text
Course:
VOC001

Concern:
CON003

Retrieve:
career_growth
```

------------------------------------------------------------------------

# 11. Task 7 --- Implement Gemini AI

## Goal

Allow parents to ask questions that were NOT predefined.

This is one of the most important features.

### API endpoint

Create:

``` text
POST /api/counsel
```

### Request

``` json
{
  "question": "Will my daughter have a good career after becoming an electrician?",
  "language": "en-IN",
  "course_id": "VOC001",
  "student_profile": {
    "education": "10th",
    "location": "Gujarat",
    "interest": "practical technical work"
  }
}
```

### Response

``` json
{
  "answer": "...",
  "language": "en-IN",
  "emotion": "reassuring",
  "concern_category": "career_growth",
  "confidence": 0.91,
  "requires_human_counsellor": false
}
```

------------------------------------------------------------------------

# 12. Gemini System Prompt

Use a system instruction based on this:

``` text
You are Samaira, an AI vocational career counsellor.

Your role is to help students and parents understand vocational
career opportunities and make informed decisions.

Be:
- empathetic
- respectful
- practical
- honest
- non-judgmental

Do not oversell vocational education.

IMPORTANT DATA RULE:

When answering questions about:
- salary
- placement
- qualifications
- career progression
- course eligibility
- course duration
- specific vocational outcomes

use the structured course data provided to you.

NEVER invent statistics.

If the required factual information is not available,
say that verified information is not currently available.

For general questions, use your general reasoning ability.

If the question cannot be answered reliably, recommend
human counsellor escalation.

The user may speak English or Gujarati.

Respond in the language requested by the user.

Return:
1. Natural answer
2. Emotion
3. Concern category
4. Confidence
5. Whether human counsellor escalation is recommended
```

------------------------------------------------------------------------

# 13. Task 8 --- Handle Unexpected Questions

This is a key requirement.

Example:

Parent asks:

> "My daughter doesn't like sitting in an office. Would electrician work
> suit her?"

The system should:

``` text
Question
   ↓
Gemini understands intent
   ↓
Course = Electrician
   ↓
Retrieve work_environment + skills
   ↓
Generate personalized answer
```

It should not require a predefined question.

------------------------------------------------------------------------

# 14. Task 9 --- English + Gujarati

The prototype supports:

``` text
English
ગુજરાતી
```

The user can change language at any time.

Example:

### English

> "Electricians can work in residential, commercial, industrial and
> maintenance environments."

### Gujarati

> "ઇલેક્ટ્રિશિયન રહેણાંક, કોમર્શિયલ, ઔદ્યોગિક અને મેન્ટેનન્સ ક્ષેત્રોમાં કામ કરી શકે છે."

The factual content must remain consistent between languages.

------------------------------------------------------------------------

# 15. Task 10 --- Career Growth Visualization

When the parent selects:

**Career Growth**

Show an animated pathway:

``` text
┌──────────────────┐
│    ELECTRICIAN   │
└────────┬─────────┘
         ↓
┌──────────────────────┐
│ SKILLED ELECTRICIAN  │
└────────┬─────────────┘
         ↓
┌──────────────────────┐
│ SENIOR TECHNICIAN    │
└────────┬─────────────┘
         ↓
┌──────────────────────┐
│     SUPERVISOR       │
└────────┬─────────────┘
         ↓
┌──────────────────────┐
│ SPECIALISED ROLES    │
└──────────────────────┘
```

Use the career pathway from:

**VOC001 --- Electrician**

------------------------------------------------------------------------

# 16. Task 11 --- Income Visualization

For Electrician, show:

``` text
Starting Earnings
₹14,000–₹18,000 / month

Experienced Earnings
₹25,000–₹35,000 / month

Demo Placement Rate
76%
```

Clearly display:

> **Prototype / Demo Dataset**

Do not represent these figures as official government data.

The values should come from:

``` text
VOC001
```

and NOT be hardcoded in multiple UI components.

------------------------------------------------------------------------

# 17. Task 12 --- Job Opportunity Explanation

Use:

``` text
common_job_roles
industries
work_environment
placement data
```

For Electrician, the dataset includes example roles such as:

-   Electrician
-   Maintenance Electrician
-   Electrical Technician

Industries include:

-   Construction
-   Manufacturing
-   Facilities Management
-   Infrastructure
-   Solar

Samaira should explain these naturally rather than displaying only a
table.

------------------------------------------------------------------------

# 18. Task 13 --- Further Education

Use the dataset field:

``` text
further_learning
```

Explain that vocational education can be a starting point rather than a
dead end.

For Electrician, explain possible progression into:

-   Advanced electrical qualifications
-   Industrial electrical specialisation
-   Solar/electrical specialisation
-   Higher technical education where eligible

Do not promise admission or eligibility unless the dataset verifies it.

------------------------------------------------------------------------

# 19. Task 14 --- Human Counsellor Escalation

Create:

``` text
Still have questions?

[ Talk to a Counsellor ]
```

Open:

``` text
┌──────────────────────────────┐
│      TALK TO A COUNSELLOR    │
│                              │
│ 📞 Request a Call             │
│ 📅 Schedule a Session        │
│ ✉ Submit Your Question       │
└──────────────────────────────┘
```

For the MVP these can be prototype interactions.

The important point is demonstrating that AI does not have to handle
every case.

------------------------------------------------------------------------

# 20. Task 15 --- Sentiment + Concern Detection

After each AI response, identify:

### Sentiment

``` text
positive
neutral
negative
```

### Concern

``` text
income
career_growth
job_opportunity
job_security
education
safety
social_perception
location
other
```

Example:

``` json
{
  "sentiment": "negative",
  "concern": "career_growth"
}
```

Save this locally for the prototype.

------------------------------------------------------------------------

# 21. Task 16 --- Admin Dashboard

Create:

``` text
/admin
```

Show:

``` text
SAMAIRA COUNSELLING DASHBOARD

Families Counselled
128

Most Discussed Trade
Electrician

Top Concern
Career Growth — 38%

Concern Distribution

Career Growth     ██████████
Income             ███████
Job Security       █████
Safety             ███

Parent Sentiment

Before Counselling
Negative → 48%

After Counselling
Negative → 19%
```

Use demo/mock analytics if there are not enough actual conversations.

------------------------------------------------------------------------

# 22. Task 17 --- Optional Voice

Only implement this if the main flow is already working.

Desired flow:

``` text
Parent speaks Gujarati
        ↓
Speech-to-text
        ↓
Gemini
        ↓
Dataset retrieval
        ↓
Gujarati answer
        ↓
Text-to-speech
        ↓
Samaira speaks
```

If voice causes problems, remove it from the MVP.

A working text conversation is more important.

------------------------------------------------------------------------

# 23. Task 18 --- Samaira Response Animation

Connect AI response emotion to visual state.

``` text
emotion = listening
→ listening animation

emotion = thinking
→ thinking animation

emotion = explaining
→ explaining animation

emotion = reassuring
→ reassuring animation
```

If sophisticated animation is unavailable, use CSS/Framer Motion
transitions.

Do not build a full 3D animation system today.

------------------------------------------------------------------------

# 24. Task 19 --- Main Demo Script

The entire SIH demonstration should follow this exact story.

### Step 1

Open Samaira.

She says:

> "Hello, I'm Samaira. I'll help you and your family explore vocational
> career opportunities."

### Step 2

Select:

**Student + Parent**

### Step 3

Enter:

``` text
Education: 10th
Location: Gujarat
Interest: Practical technical work
```

### Step 4

Select:

**Electrical → Electrician**

### Step 5

Transition to the electrical workplace.

Samaira explains:

> "Electricians work across residential, commercial, industrial and
> maintenance environments."

### Step 6

Parent selects:

**Career Growth**

### Step 7

Show:

``` text
Electrician
↓
Skilled Electrician
↓
Senior Technician
↓
Supervisor
```

### Step 8

Parent asks an unexpected question:

> "Can my daughter build a good career in this field?"

Gemini interprets it.

### Step 9

Samaira answers using:

-   Course data
-   Career pathway
-   General AI reasoning

### Step 10

Switch to Gujarati.

Ask:

> "આ કોર્સ કર્યા પછી કેટલી કમાણી થઈ શકે?"

Show the demo outcome data.

### Step 11

Ask a safety question.

Samaira explains safety requirements and does not make an absolute
safety guarantee.

### Step 12

Show:

**Talk to a Counsellor**

### Step 13

Open Admin Dashboard.

Show:

-   Family concerns
-   Most discussed trades
-   Sentiment changes

------------------------------------------------------------------------

# 25. What NOT to Build Today

Do NOT spend time on:

-   User authentication
-   Payment
-   Real counsellor scheduling backend
-   Full NSQF database
-   All 8 animated environments
-   Full 3D Samaira
-   Complex vector database
-   Complex RAG infrastructure
-   Production deployment architecture
-   Advanced recommendation algorithms
-   Perfect speech recognition
-   Large-scale analytics
-   Government API integrations

These can be future phases.

------------------------------------------------------------------------

# 26. Definition of "DONE"

The MVP is DONE when this works:

``` text
Landing
  ↓
Samaira
  ↓
Student + Parent
  ↓
Profile
  ↓
Electrician
  ↓
Electrical Environment
  ↓
Parent Concern
  ↓
Gemini
  ↓
VOC001 Data
  ↓
Answer
  ↓
English / Gujarati
  ↓
Visual Data / Career Path
  ↓
Human Counsellor
  ↓
Admin Dashboard
```

If this complete flow works, STOP adding features.

------------------------------------------------------------------------

# 27. Existing Dataset Reference

The prototype is based on the previously created **Samaira Vocational
Course Knowledge Dataset**.

### Included courses

  ID       Course
  -------- --------------------------------------------------
  VOC001   Electrician
  VOC002   Solar PV Installer / Technician
  VOC003   CNC Operator
  VOC004   Automotive Service Technician
  VOC005   General Duty Assistant
  VOC006   Domestic Data Entry Operator
  VOC007   Assistant Electrician / Construction Electrician
  VOC008   Retail Sales Associate

### Parent concerns

  ID       Concern
  -------- -------------------
  CON001   Income
  CON002   Placement
  CON003   Career Growth
  CON004   Job Security
  CON005   Further Education
  CON006   Social Perception
  CON007   Safety
  CON008   Location
  CON009   Duration
  CON010   Eligibility
  CON011   Cost
  CON012   Skills

------------------------------------------------------------------------

# 28. Data Quality Policy

Every factual record should eventually carry:

``` text
VERIFIED
HACKATHON_DATA
SYNTHETIC_DEMO
NEEDS_VERIFICATION
OUTDATED
```

For the current prototype:

``` text
Salary values → SYNTHETIC_DEMO
Placement values → SYNTHETIC_DEMO
Career pathways → Prototype reference
Course descriptions → Prototype knowledge
```

When the hackathon supplies the dummy dataset, replace the corresponding
fields.

------------------------------------------------------------------------

# 29. Future Production Architecture

After the hackathon prototype, the system can evolve into:

``` text
                   SAMAIRA
                      │
          ┌───────────┴───────────┐
          ↓                       ↓
       Voice                    Text
          │                       │
          └───────────┬───────────┘
                      ↓
                 AI / Gemini
                      │
              Intent Detection
                      │
          ┌───────────┴───────────┐
          ↓                       ↓
     Course Database             RAG
          │                       │
          └───────────┬───────────┘
                      ↓
                Evidence-based
                   Answer
                      │
             ┌────────┴────────┐
             ↓                 ↓
          English           Gujarati
             │                 │
             └────────┬────────┘
                      ↓
                   Samaira
                      │
             ┌────────┴────────┐
             ↓                 ↓
       Family Support     Human Counsellor
                              │
                              ↓
                       Admin Analytics
```

------------------------------------------------------------------------

# 30. Final Development Priority

If time becomes extremely short, follow this priority:

### P0 --- MUST WORK

1.  Welcome
2.  Samaira
3.  Student + Parent
4.  Career selection
5.  Electrician scene
6.  Parent concern buttons
7.  Vocational JSON dataset
8.  Gemini API
9.  Free-form question
10. English + Gujarati
11. Career growth visualization

### P1 --- SHOULD WORK

12. Income visualization
13. Human counsellor button
14. Sentiment
15. Admin dashboard

### P2 --- ONLY IF TIME REMAINS

16. Voice input
17. Text-to-speech
18. More sophisticated Samaira animations
19. More environments
20. Advanced RAG

------------------------------------------------------------------------

# 31. Single Antigravity Instruction

Paste this entire file into the project and instruct Antigravity:

> **"Implement this MVP task-by-task in the order specified. Complete
> and test each P0 task before moving to P1. Do not expand scope. Use
> the included vocational dataset as the source for course information.
> Do not invent statistics. Use Gemini for free-form counselling
> questions. Keep the UI immersive and Samaira-centered rather than
> making it a generic chatbot dashboard."**
