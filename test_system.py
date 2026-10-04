import urllib.request
import urllib.parse
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://127.0.0.1:8000"

def test_url(url, expected_code=200):
    try:
        req = urllib.request.urlopen(url)
        content = req.read()
        print(f"PASS: {url} -> {req.status} ({len(content)} bytes)")
        return content
    except Exception as e:
        print(f"FAIL: {url} -> {e}")
        return None

def test_post(url, data_dict):
    try:
        data_bytes = json.dumps(data_dict).encode("utf-8")
        req = urllib.request.Request(url, data=data_bytes, headers={"Content-Type": "application/json"})
        resp = urllib.request.urlopen(req)
        content = resp.read().decode("utf-8")
        print(f"PASS: POST {url} -> {resp.status}")
        return json.loads(content)
    except Exception as e:
        print(f"FAIL: POST {url} -> {e}")
        return None

def main():
    print("=== SAMAIRA SYSTEM VERIFICATION SUITE ===")
    
    # 1. Static Files & Components
    print("\n--- 1. Testing Frontend Static Files & Components ---")
    test_url(f"{BASE_URL}/")
    test_url(f"{BASE_URL}/index.css")
    test_url(f"{BASE_URL}/app.js")
    test_url(f"{BASE_URL}/components/translations.js")
    test_url(f"{BASE_URL}/components/Samaira.js")
    test_url(f"{BASE_URL}/components/CareerPathway.js")
    test_url(f"{BASE_URL}/components/DataVisualization.js")
    test_url(f"{BASE_URL}/components/CounsellorModal.js")
    test_url(f"{BASE_URL}/components/AdminDashboard.js")
    test_url(f"{BASE_URL}/data/vocational_courses.json")

    # 2. Assets (Samaira Character & Environments)
    print("\n--- 2. Testing Assets & Media ---")
    test_url(f"{BASE_URL}/assets/samaira/samaira_standing_welcoming.png")
    test_url(f"{BASE_URL}/assets/samaira/samaira_face_happy.png")
    test_url(f"{BASE_URL}/assets/samaira/samaira_face_listening.png")
    test_url(f"{BASE_URL}/assets/samaira/samaira_face_thoughtful.png")
    test_url(f"{BASE_URL}/assets/samaira/samaira_face_reassuring.png")
    test_url(f"{BASE_URL}/assets/samaira/samaira_pose_explaining.png")
    test_url(f"{BASE_URL}/assets/samaira/samaira_pose_pointing.png")
    test_url(f"{BASE_URL}/assets/environments/electrician_workshop.jpg")
    test_url(f"{BASE_URL}/assets/environments/electrician_growth.jpg")
    test_url(f"{BASE_URL}/assets/environments/electrician_income.jpg")
    test_url(f"{BASE_URL}/assets/environments/electrician_safety.jpg")

    # 3. Backend APIs
    print("\n--- 3. Testing Backend REST APIs ---")
    health = test_url(f"{BASE_URL}/api/health")
    if health:
        print("Health Status:", json.loads(health.decode("utf-8")))

    courses_raw = test_url(f"{BASE_URL}/api/courses")
    courses = json.loads(courses_raw.decode("utf-8")) if courses_raw else []
    print(f"Loaded {len(courses)} courses from API.")

    course_detail_raw = test_url(f"{BASE_URL}/api/courses/VOC001")
    if course_detail_raw:
        detail = json.loads(course_detail_raw.decode("utf-8"))
        print(f"Course VOC001 Trade: {detail['trade_name']} / {detail['trade_name_gu']}")

    concerns_raw = test_url(f"{BASE_URL}/api/concerns")
    concerns = json.loads(concerns_raw.decode("utf-8")) if concerns_raw else []
    print(f"Loaded {len(concerns)} parent concerns.")

    # 4. AI Counselling Endpoint
    print("\n--- 4. Testing AI Counselling Endpoint (/api/counsel) ---")
    
    # Test English Question
    resp_en = test_post(f"{BASE_URL}/api/counsel", {
        "question": "Can my daughter build a good career in this field?",
        "language": "en-IN",
        "course_id": "VOC001",
        "student_profile": {
            "education": "10th",
            "location": "Gujarat",
            "interest": "practical technical work"
        }
    })
    if resp_en:
        print("Emotion:", resp_en.get("emotion"))
        print("Concern:", resp_en.get("concern_category"))
        print("Confidence:", resp_en.get("confidence"))
        print("Requires Counsellor:", resp_en.get("requires_human_counsellor"))

    # Test Gujarati Question
    resp_gu = test_post(f"{BASE_URL}/api/counsel", {
        "question": "આ કોર્સ કર્યા પછી કેટલી કમાણી થઈ શકે?",
        "language": "gu-IN",
        "course_id": "VOC001",
        "student_profile": {
            "education": "10th",
            "location": "Gujarat",
            "interest": "practical technical work"
        }
    })
    if resp_gu:
        print("Gujarati Emotion:", resp_gu.get("emotion"))
        print("Gujarati Concern:", resp_gu.get("concern_category"))

    # 5. Escalation Endpoint
    print("\n--- 5. Testing Human Counsellor Escalation ---")
    esc_resp = test_post(f"{BASE_URL}/api/counsellor/request", {
        "name": "Ramesh Patel",
        "phone": "+91 98250 12345",
        "type": "call",
        "course_id": "VOC001",
        "notes": "Seeking advice on ITI vs Polytechnic lateral entry in Gujarat"
    })
    print("Escalation Result:", esc_resp)

    # 6. Admin Stats Verification
    print("\n--- 6. Testing Admin Stats Aggregation ---")
    admin_raw = test_url(f"{BASE_URL}/api/admin/stats")
    if admin_raw:
        stats = json.loads(admin_raw.decode("utf-8"))
        print("Total Families:", stats.get("families_counselled"))
        print("Top Trade:", stats.get("most_discussed_trade"))
        print("Top Concern:", stats.get("top_concern"))
        print("Recent Queries Count:", len(stats.get("recent_queries", [])))
        print("Escalations Count:", len(stats.get("escalations", [])))

    print("\n=== ALL TEST CHECKS COMPLETED ===")

if __name__ == "__main__":
    main()
