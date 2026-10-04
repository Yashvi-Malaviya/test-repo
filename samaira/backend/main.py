import os
import json
import time
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from ai.counsellor import SamairaCounsellor

app = FastAPI(
    title="Samaira AI Vocational Career Counselling Platform",
    description="SIH Problem Statement 26241 - AI-Enabled Career Counselling and Family Decision-Support Platform for Vocational Education",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dataset path
DATASET_PATH = os.path.join(os.path.dirname(__file__), "data", "vocational_courses.json")
if not os.path.exists(DATASET_PATH):
    # fallback to frontend data
    DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "frontend", "data", "vocational_courses.json")

counsellor = SamairaCounsellor(dataset_path=DATASET_PATH)

# In-memory session tracking for Admin Dashboard
SESSION_STATE = {
    "base_families_counselled": 128,
    "live_sessions": 0,
    "concern_counts": {
        "career_growth": 49,
        "income": 35,
        "job_security": 23,
        "safety": 15,
        "education": 6,
        "social_perception": 8,
        "job_opportunity": 14,
        "other": 3
    },
    "sentiment_counts": {
        "before": {"negative": 48, "neutral": 34, "positive": 18},
        "after": {"negative": 19, "neutral": 29, "positive": 52}
    },
    "trade_discussions": {
        "VOC001": 89, # Electrician
        "VOC002": 24, # Solar
        "VOC003": 18, # CNC
        "VOC004": 15, # Auto
        "VOC005": 11, # GDA
        "VOC006": 9,  # Data Entry
        "VOC007": 8,  # Assistant Electrician
        "VOC008": 6   # Retail
    },
    "recent_queries": [
        {
            "id": 1,
            "question": "Can my daughter build a good career in this field?",
            "trade": "Electrician",
            "language": "en-IN",
            "concern": "social_perception",
            "sentiment": "positive",
            "timestamp": "Just now"
        },
        {
            "id": 2,
            "question": "આ કોર્સ કર્યા પછી કેટલી કમાણી થઈ શકે?",
            "trade": "Electrician",
            "language": "gu-IN",
            "concern": "income",
            "sentiment": "positive",
            "timestamp": "12 mins ago"
        },
        {
            "id": 3,
            "question": "Is this work safe for a beginner?",
            "trade": "Electrician",
            "language": "en-IN",
            "concern": "safety",
            "sentiment": "neutral",
            "timestamp": "28 mins ago"
        }
    ],
    "escalations": [
        {
            "id": 1,
            "name": "Ramesh Patel",
            "phone": "+91 98250 12345",
            "type": "Scheduled Session",
            "trade": "Electrician",
            "status": "Pending Confirmation",
            "date": "Tomorrow, 11:00 AM",
            "notes": "Parent wants guidance on government ITI vs private polytechnic diploma."
        }
    ]
}

# Request Models
class StudentProfile(BaseModel):
    education: Optional[str] = "10th"
    location: Optional[str] = "Gujarat"
    interest: Optional[str] = "practical technical work"

class CounselRequest(BaseModel):
    question: str
    language: Optional[str] = "en-IN"
    course_id: Optional[str] = "VOC001"
    student_profile: Optional[StudentProfile] = None

class EscalationRequest(BaseModel):
    name: str
    phone: str
    type: str = "call" # "call", "session", "question"
    course_id: Optional[str] = "VOC001"
    notes: Optional[str] = ""
    preferred_time: Optional[str] = "Earliest available"

# API Endpoints
@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "Samaira AI Career Counselling",
        "gemini_active": counsellor.client is not None,
        "trades_loaded": len(counsellor.courses_data.get("courses", []))
    }

@app.get("/api/courses")
def get_courses():
    return counsellor.courses_data.get("courses", [])

@app.get("/api/courses/{course_id}")
def get_course_detail(course_id: str):
    course = counsellor.get_course(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course trade not found")
    return course

@app.get("/api/concerns")
def get_concerns():
    return counsellor.courses_data.get("parent_concerns", [])

@app.post("/api/counsel")
def counsel(req: CounselRequest):
    profile_dict = req.student_profile.model_dump() if req.student_profile else {}
    result = counsellor.counsel(
        question=req.question,
        language=req.language or "en-IN",
        course_id=req.course_id or "VOC001",
        student_profile=profile_dict
    )

    # Track in admin stats
    SESSION_STATE["live_sessions"] += 1
    cid = req.course_id or "VOC001"
    SESSION_STATE["trade_discussions"][cid] = SESSION_STATE["trade_discussions"].get(cid, 0) + 1

    cat = result.get("concern_category", "career_growth")
    SESSION_STATE["concern_counts"][cat] = SESSION_STATE["concern_counts"].get(cat, 0) + 1

    trade_name = "Electrician"
    c = counsellor.get_course(cid)
    if c:
        trade_name = c["trade_name"]

    SESSION_STATE["recent_queries"].insert(0, {
        "id": len(SESSION_STATE["recent_queries"]) + 1,
        "question": req.question,
        "trade": trade_name,
        "language": req.language or "en-IN",
        "concern": cat,
        "sentiment": result.get("sentiment", "positive"),
        "timestamp": "Just now"
    })
    # Keep last 15
    SESSION_STATE["recent_queries"] = SESSION_STATE["recent_queries"][:15]

    return result

@app.post("/api/counsellor/request")
def request_escalation(req: EscalationRequest):
    c = counsellor.get_course(req.course_id or "VOC001")
    trade_name = c["trade_name"] if c else "Vocational Education"

    item = {
        "id": len(SESSION_STATE["escalations"]) + 1,
        "name": req.name,
        "phone": req.phone,
        "type": req.type.capitalize() + (" Request" if req.type == "call" else " Session"),
        "trade": trade_name,
        "status": "Booked / In Queue",
        "date": req.preferred_time or "Earliest slot",
        "notes": req.notes or "Escalated from Samaira AI session."
    }
    SESSION_STATE["escalations"].insert(0, item)
    return {
        "success": True,
        "message": "Counsellor request recorded successfully. A certified vocational counsellor will connect with the family.",
        "details": item
    }

@app.get("/api/admin/stats")
def get_admin_stats():
    total_families = SESSION_STATE["base_families_counselled"] + SESSION_STATE["live_sessions"]
    
    # Calculate top concern
    total_concerns = sum(SESSION_STATE["concern_counts"].values()) or 1
    distribution = []
    labels = {
        "career_growth": "Career Growth",
        "income": "Income",
        "job_security": "Job Security",
        "safety": "Safety",
        "education": "Further Education",
        "social_perception": "Social Respect",
        "job_opportunity": "Job Placement",
        "other": "Other Inquiries"
    }

    sorted_concerns = sorted(SESSION_STATE["concern_counts"].items(), key=lambda x: x[1], reverse=True)
    for key, count in sorted_concerns:
        distribution.append({
            "key": key,
            "label": labels.get(key, key.replace("_", " ").title()),
            "count": count,
            "percentage": round((count / total_concerns) * 100)
        })

    top_concern_str = f"{distribution[0]['label']} — {distribution[0]['percentage']}%" if distribution else "Career Growth — 38%"

    # Most discussed trade
    top_trade_id = max(SESSION_STATE["trade_discussions"], key=SESSION_STATE["trade_discussions"].get)
    top_course = counsellor.get_course(top_trade_id)
    top_trade_name = top_course["trade_name"] if top_course else "Electrician"

    return {
        "families_counselled": total_families,
        "most_discussed_trade": top_trade_name,
        "top_concern": top_concern_str,
        "concern_distribution": distribution,
        "parent_sentiment": SESSION_STATE["sentiment_counts"],
        "recent_queries": SESSION_STATE["recent_queries"],
        "escalations": SESSION_STATE["escalations"],
        "data_status": "SYNTHETIC DEMO & PROTOTYPE METRICS"
    }

# Mount static frontend
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))
if os.path.exists(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
