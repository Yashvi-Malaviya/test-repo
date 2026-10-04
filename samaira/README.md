# Samaira AI Vocational Career Counselling Platform
**Smart India Hackathon (SIH) — Problem Statement 26241**  
*AI-Enabled Career Counselling and Family Decision-Support Platform for Vocational Education*

---

## 🌟 Executive Summary

**Samaira** is an empathetic, data-backed AI vocational career counsellor designed to help students and their parents explore technical and vocational pathways with clarity, pride, and confidence.

Rather than a generic chatbot, Samaira is the central visual character throughout the experience, guiding families through immersive 3D/illustrated workplace simulations, visual career ladders, transparent earnings benchmarks, and parent-specific concern resolutions in both **English** and **Gujarati**.

---

## 🚀 Key Demonstration Flow (Electrician Trade)

```
Student + Parent
       ↓
Samaira Introduction (Welcoming Pose & Voice)
       ↓
Student Profile (10th Pass • Gujarat • Practical Hands-on Work)
       ↓
Vocational Career Selection (8 Curated Trades)
       ↓
Electrician Animated/Illustrated Workplace Environment
       ↓
4-State Simulation (Workplace → Career Growth → Income → Safety)
       ↓
Parent Concerns Resolution (12 Categories: Salary, Safety, Degree, Demand)
       ↓
Gemini AI Intent Engine + Vocational Knowledge Dataset
       ↓
Data-Backed Explanations in English & Gujarati
       ↓
Visual 5-Stage Career Ladder & Salary Benchmarks (Labeled Prototype / Demo Dataset)
       ↓
Certified Human Counsellor Escalation (Callback / Live Session / Inquiry)
       ↓
Real-Time Admin Analytics Dashboard
```

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | Modern Vanilla JS + CSS3 Design System | Glassmorphism, Google Fonts (*Outfit*, *Inter*, *Noto Sans Gujarati*), micro-animations, zero external node build friction |
| **Character System** | Samaira Visual Animation Engine | Extracted from master character sheet with 7 emotional states (`idle`, `listening`, `speaking`, `thinking`, `explaining`, `reassuring`, `pointing`) |
| **Backend API** | FastAPI + Python 3.13 | High-performance asynchronous REST API with Swagger documentation at `/docs` |
| **AI Integration** | Google Gemini API + Intelligent Fallback | Powered by `google-genai` with dataset grounding and offline rule/semantic fallback engine |
| **Data Source** | Vocational Knowledge Dataset | 8 Master Trades (VOC001–VOC008), 12 Parent Concern categories (CON001–CON012), labeled `Prototype / Demo Dataset` |
| **Audio / Voice** | Web Speech API | Dual-language speech recognition (STT) and voice synthesis (TTS) |

---

## 📂 Project Structure

```
samaira/
├── frontend/
│   ├── index.html                 # Main website shell with navigation & modal root
│   ├── index.css                  # CSS tokens, glassmorphism, responsive grid & animations
│   ├── app.js                     # Main client orchestrator & state manager
│   ├── components/
│   │   ├── Samaira.js             # Character visual controller & speech synthesizer
│   │   ├── CareerPathway.js       # Animated 5-stage career progression ladder
│   │   ├── DataVisualization.js   # Salary benchmarks & placement metrics
│   │   ├── CounsellorModal.js     # Human counsellor escalation dialog
│   │   ├── AdminDashboard.js      # Live analytics metrics & charts
│   │   └── translations.js        # Full English & Gujarati localization dictionary
│   ├── assets/
│   │   ├── samaira/               # Character sprites (faces, poses, scenes, avatar)
│   │   └── environments/          # Illustrated workplace environments (workshop, growth, income, safety)
│   └── data/
│       └── vocational_courses.json # Master 8-trade dataset with bilingual fields
├── backend/
│   ├── main.py                    # FastAPI server & static file mount
│   ├── ai/
│   │   └── counsellor.py          # Gemini AI integration & dataset grounding engine
│   └── data/
│       └── vocational_courses.json # Backend copy of master dataset
└── README.md                      # Complete system documentation
```

---

## 🏃 Running the Application

### 1. Launch the Server
From the project root:
```bash
python -m uvicorn samaira.backend.main:app --host 127.0.0.1 --port 8000
```
Or navigate into `samaira/backend`:
```bash
cd samaira/backend
python main.py
```

### 2. Open the Application
Open your web browser at:
```
http://127.0.0.1:8000/
```
Interactive API documentation is available at:
```
http://127.0.0.1:8000/docs
```

---

## 🧪 Automated Verification Suite

Run the full end-to-end test suite:
```bash
python test_system.py
```
This script validates:
- All static HTML, CSS, and JS components
- All 11 character sprites and environment backgrounds
- API health check (`/api/health`)
- Course catalogs (`/api/courses`, `/api/courses/VOC001`)
- 12 Parent concern mappings (`/api/concerns`)
- AI counselling in English and Gujarati (`POST /api/counsel`)
- Human counsellor escalation (`POST /api/counsellor/request`)
- Live admin analytics aggregation (`GET /api/admin/stats`)
