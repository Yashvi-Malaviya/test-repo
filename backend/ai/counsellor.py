import os
import json
import re
from typing import Dict, Any, Optional

try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False


SYSTEM_INSTRUCTION = """You are Samaira, a virtual AI vocational career counsellor designed for Indian students and their parents (SIH Problem Statement 26241).
You guide families in exploring vocational career opportunities, especially trades like Electrician, with empathy, respect, and factual data.

CORE PERSONALITY:
- Warm, empathetic, respectful, professional, calm, reassuring, and family-centric.
- Never insult or dismiss parental concerns. Never say "Your concern is wrong."
- Always validate parental worries: "That's a very understandable concern. Let me explain what the available information tells us."
- Do NOT make long speeches. Keep spoken text short, natural, and conversational.

VOICE & TEXT RULES:
- Output MUST include "spoken_text" formatted specifically for Text-To-Speech:
  * Short, natural, spoken sentences.
  * Spell out rupee numbers phonetically (e.g., "around fourteen to eighteen thousand rupees per month") so TTS sounds natural.
  * No markdown, asterisks, bullet points, or tables in "spoken_text".
- Output "display_text" containing the rich, well-formatted explanation to show on screen.
- If answering about income, career growth, job security, or placement, USE ONLY THE FACTS IN THE PROVIDED COURSE DATASET. NEVER invent statistics.
- If answering unverified or unknown questions, say:
  "That's an important question. I don't currently have enough verified information to give you a reliable answer. I can connect you with a counsellor who can help you further." and set "requires_human_counsellor": true.
- Always include "follow_up_question": "Would you like me to explain the income, career growth, job opportunities, or something else?" (or in Gujarati if requested).

LANGUAGES:
- English ("en-IN") or Gujarati ("gu-IN").
- For Gujarati, both "spoken_text" and "display_text" must be in natural, respectful Gujarati.

OUTPUT FORMAT (JSON ONLY):
{
  "spoken_text": "Short natural sentence for voice synthesis",
  "display_text": "Formatted text with bolding and structure for visual display",
  "language": "en-IN" or "gu-IN",
  "emotion": "reassuring" | "explaining" | "listening" | "thinking" | "pointing" | "concerned" | "welcoming",
  "concern_category": "income" | "career_growth" | "job_opportunity" | "job_security" | "education" | "safety" | "work_environment" | "local_opportunity" | "social_perception" | "other",
  "visual_card_type": "income" | "career_growth" | "safety" | "job_opportunity" | "work_environment" | "education" | "local_opportunity" | "none",
  "visual_card_data": {},
  "follow_up_question": "Would you like me to explain the income, career growth, job opportunities, or something else?",
  "confidence": 0.95,
  "requires_human_counsellor": false,
  "sentiment": "positive" | "neutral" | "negative",
  "suggested_actions": ["view_pathway", "view_salary", "view_safety", "talk_counsellor"]
}
"""

class SamairaCounsellor:
    def __init__(self, dataset_path: str):
        self.dataset_path = dataset_path
        self.courses_data = self._load_dataset()
        self.api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        self.client = None
        if self.api_key and GENAI_AVAILABLE:
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"Warning: Could not initialize Gemini client: {e}")

    def _load_dataset(self) -> Dict[str, Any]:
        with open(self.dataset_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def get_course(self, course_id: str) -> Optional[Dict[str, Any]]:
        for course in self.courses_data.get("courses", []):
            if course["course_id"].lower() == course_id.lower():
                return course
        return None

    def counsel(self, question: str, language: str = "en-IN", course_id: str = "VOC001", student_profile: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        course = self.get_course(course_id) or self.courses_data["courses"][0]
        student_profile = student_profile or {
            "education": "10th pass",
            "location": "Gujarat",
            "interest": "practical technical work & machinery",
            "preferred_career": "Electrician"
        }

        # Attempt Gemini call if API client available
        if self.client:
            try:
                gemini_resp = self._call_gemini(question, language, course, student_profile)
                if gemini_resp and "spoken_text" in gemini_resp:
                    return gemini_resp
            except Exception as err:
                print(f"Gemini API call failed, using intelligent dataset fallback: {err}")

        # Intelligent Fallback Engine using exact dataset knowledge & prompt scripts
        return self._intelligent_fallback(question, language, course, student_profile)

    def _call_gemini(self, question: str, language: str, course: Dict[str, Any], student_profile: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        course_context = json.dumps(course, ensure_ascii=False)
        profile_context = json.dumps(student_profile, ensure_ascii=False)

        prompt = f"""
Course Knowledge:
{course_context}

Student Profile:
{profile_context}

User Question:
{question}

Requested Language:
{language}

Remember to return only JSON matching the schema with spoken_text, display_text, visual_card_type, visual_card_data, and follow_up_question.
"""
        response = self.client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                response_mime_type="application/json"
            )
        )

        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        return json.loads(text.strip())

    def _intelligent_fallback(self, question: str, language: str, course: Dict[str, Any], student_profile: Dict[str, Any]) -> Dict[str, Any]:
        q_lower = question.lower()
        is_gujarati = ("gu" in language.lower()) or any(ord(c) >= 0x0A80 and ord(c) <= 0x0AFF for c in question)

        trade_name = course["trade_name_gu"] if is_gujarati else course["trade_name"]
        starting_sal = course.get("demo_starting_earnings_monthly", "₹14,000–₹18,000/month")
        exp_sal = course.get("demo_experienced_earnings_monthly", "₹25,000–₹35,000/month")
        placement_rate = course.get("demo_placement_rate", "76%")

        follow_up = (
            "તમે ઇચ્છો તો શું હું આવક, કારકિર્દી પ્રગતિ, નોકરીની તકો અથવા બીજું કંઈક સમજાવું?"
            if is_gujarati else
            "Would you like me to explain the income, career growth, job opportunities, or something else?"
        )

        # 1. CAREER GROWTH / FUTURE OF AN ELECTRICIAN
        # Exact prompt script requirement:
        # "Becoming an electrician does not necessarily mean staying at the same level throughout your career."
        # Pathway: Electrician -> Skilled Electrician -> Senior Technician -> Supervisor -> Specialised Technical Roles
        if any(w in q_lower for w in ["future", "growth", "career", "ladder", "scope", "level", "progress", "promotion", "aage"]) or any(k in question for k in ["ભવિષ્ય", "વૃદ્ધિ", "પ્રગતિ", "પ્રમોશન", "આગળ"]):
            if is_gujarati:
                spoken = "ઇલેક્ટ્રિશિયન બનવાનો અર્થ એ નથી કે તમે આખી કારકિર્દી એક જ સ્તર પર રહો. કુશળ ઇલેક્ટ્રિશિયન તરીકે આગળ વધીને સીનિયર ટેકનિશિયન, સાઇટ સુપરવાઇઝર અને નિષ્ણાત કોન્ટ્રાક્ટર બની શકાય છે."
                display = (
                    f"**ઇલેક્ટ્રિશિયન ક્ષેત્રમાં કારકિર્દીનો માર્ગ અત્યંત મજબૂત છે.**\n\n"
                    f"ઇલેક્ટ્રિશિયન બનવાનો અર્થ એ નથી કે તમે આખી કારકિર્દી એક જ સ્તર પર રહો. વ્યવસાયિક તાલીમ પછી કારકિર્દી આ રીતે ક્રમશઃ આગળ વધે છે:\n"
                    f"1. **ઇલેક્ટ્રિશિયન / એપ્રેન્ટિસ**: પાયાનું વાયરિંગ અને બેઝિક ઇન્સ્ટોલેશન.\n"
                    f"2. **સ્કિલ્ડ ઇલેક્ટ્રિશિયન**: સ્વતંત્ર સર્કિટ ડાયગ્નોસ્ટિક્સ અને કંટ્રોલ પેનલ વર્ક.\n"
                    f"3. **સીનિયર ટેકનિશિયન**: જટિલ ઇન્ડસ્ટ્રિયલ ફોલ્ટ ફાઇન્ડિંગ અને ટીમ લીડર.\n"
                    f"4. **ઇલેક્ટ્રિકલ સુપરવાઇઝર**: આખી સાઇટનું સંચાલન, સેફ્ટી કમ્પ્લાયન્સ અને વર્ક શેડ્યુલિંગ.\n"
                    f"5. **નિષ્ણાત ટેકનિકલ રોલ્સ / સરકારી લાયસન્સ કોન્ટ્રાક્ટર**: પોતાનો વ્યવસાય અને મોટા કોન્ટ્રેક્ટ્સ."
                )
            else:
                spoken = "Becoming an electrician does not necessarily mean staying at the same level throughout your career. Technicians progress step by step to skilled electrician, senior technician, site supervisor, and specialised technical roles."
                display = (
                    f"**Becoming an electrician does not necessarily mean staying at the same level throughout your career.**\n\n"
                    f"Vocational education opens an expansive, upward 5-stage career progression pathway:\n"
                    f"1. **Electrician / Apprentice**: Foundational wiring, residential fittings, and guided maintenance.\n"
                    f"2. **Skilled Electrician**: Independent diagnostic testing, single & 3-phase panel installations.\n"
                    f"3. **Senior Technician**: Industrial automation, PLC systems, motor troubleshooting, and crew leadership.\n"
                    f"4. **Electrical Supervisor**: Project site supervision, compliance certification, and team management.\n"
                    f"5. **Specialised Technical Roles / Licensed Contractor**: Solar grid integration, HT substation engineer, or self-employed contracting enterprise."
                )

            return {
                "spoken_text": spoken,
                "display_text": display,
                "language": "gu-IN" if is_gujarati else "en-IN",
                "emotion": "pointing",
                "concern_category": "career_growth",
                "visual_card_type": "career_growth",
                "visual_card_data": {
                    "trade": trade_name,
                    "stages": [
                        {"stage": 1, "title": "Electrician / Apprentice", "title_gu": "ઇલેક્ટ્રિશિયન / એપ્રેન્ટિસ", "desc": "Foundational installation & wiring", "desc_gu": "પાયાનું વાયરિંગ અને ફિટિંગ"},
                        {"stage": 2, "title": "Skilled Electrician", "title_gu": "સ્કિલ્ડ ઇલેક્ટ્રિશિયન", "desc": "Independent 3-phase & control panels", "desc_gu": "સ્વતંત્ર કંટ્રોલ પેનલ વર્ક"},
                        {"stage": 3, "title": "Senior Technician", "title_gu": "સીનિયર ટેકનિશિયન", "desc": "Industrial diagnostics & maintenance", "desc_gu": "ઇન્ડસ્ટ્રિયલ મેન્ટેનન્સ અને લીડર"},
                        {"stage": 4, "title": "Electrical Supervisor", "title_gu": "ઇલેક્ટ્રિકલ સુપરવાઇઝર", "desc": "Site management & team coordination", "desc_gu": "સાઇટ સુપરવિઝન અને સેફ્ટી"},
                        {"stage": 5, "title": "Specialised Technical Roles / Contractor", "title_gu": "નિષ્ણાત ટેકનિકલ રોલ્સ / કોન્ટ્રાક્ટર", "desc": "Solar/HT expert & business ownership", "desc_gu": "સોલર/એચટી એક્સપર્ટ અને બિઝનેસ"}
                    ]
                },
                "follow_up_question": follow_up,
                "confidence": 0.98,
                "requires_human_counsellor": False,
                "sentiment": "positive",
                "suggested_actions": ["view_pathway", "view_salary"]
            }

        # 2. INCOME / SALARY
        # Exact prompt script requirement:
        # "Income can vary depending on experience, location, skills and employer. For this prototype, I can show you the available demo data."
        # Spoken: "According to the prototype data available to me, starting earnings are around fourteen to eighteen thousand rupees per month. With experience, the range shown in our demo dataset is around twenty-five to thirty-five thousand rupees per month."
        # Display: Starting Earnings ₹14,000–₹18,000/month, Experienced Earnings ₹25,000–₹35,000/month, Placement Rate 76%, labeled "Prototype / Demo Dataset".
        if any(w in q_lower for w in ["income", "salary", "earn", "money", "rupee", "kamani", "paisa", "pay", "stipend"]) or any(k in question for k in ["આવક", "પગાર", "કમાણી", "રૂપિયા"]):
            if is_gujarati:
                spoken = "આવક અનુભવ, સ્થળ, કૌશલ્ય અને કંપની મુજબ બદલાઈ શકે છે. પ્રોટોટાઇપ ડેમો ડેટાસેટ મુજબ, શરૂઆતની કમાણી આશરે ચૌદથી અઢાર હજાર રૂપિયા પ્રતિ માસ છે. અનુભવ સાથે, આ રકમ પચીસથી પાંત્રીસ હજાર રૂપિયા પ્રતિ માસ સુધી પહોંચી શકે છે."
                display = (
                    f"**આવક વિગતો (પ્રોટોટાઇપ / ડેમો ડેટાસેટ)**\n\n"
                    f"આવક અનુભવ, સ્થળ, કૌશલ્ય અને કંપની મુજબ બદલાઈ શકે છે. આ પ્રોટોટાઇપ માટે ઉપલબ્ધ ડેમો ડેટા નીચે મુજબ છે:\n\n"
                    f"• **શરૂઆતની કમાણી**: {starting_sal}\n"
                    f"• **અનુભવી કમાણી (૨-૫ વર્ષ)**: {exp_sal}\n"
                    f"• **પ્લેસમેન્ટ સહાયતા દર**: {placement_rate}\n"
                    f"• **સ્વતંત્ર લાયસન્સ કોન્ટ્રાક્ટર ક્ષમતા**: ₹૫૦,૦૦૦ થી ₹૧,૦૦,૦૦૦+ પ્રતિ માસ\n\n"
                    f"*(નોંધ: આ આંકડા પ્રોટોટાઇપ ડેમો ડેટાસેટ આધારિત છે અને કોઈ સત્તાવાર સરકારી ગેરંટી નથી.)*"
                )
            else:
                spoken = "Income can vary depending on experience, location, skills and employer. According to the prototype data available to me, starting earnings are around fourteen to eighteen thousand rupees per month. With experience, the range shown in our demo dataset is around twenty-five to thirty-five thousand rupees per month."
                display = (
                    f"**Income Benchmark (Prototype / Demo Dataset)**\n\n"
                    f"Income can vary depending on experience, location, skills and employer. For this prototype, I can show you the available demo data:\n\n"
                    f"• **Starting Earnings**: {starting_sal}\n"
                    f"• **Experienced Earnings (2–5 years)**: {exp_sal}\n"
                    f"• **Estimated Placement Rate**: {placement_rate}\n"
                    f"• **Licensed Contractor Potential**: ₹50,000–₹1,00,000+/month for independent projects\n\n"
                    f"*(Clear Notice: Prototype / Demo Dataset. These figures reflect indicative benchmark data and are not official government statistics.)*"
                )

            return {
                "spoken_text": spoken,
                "display_text": display,
                "language": "gu-IN" if is_gujarati else "en-IN",
                "emotion": "explaining",
                "concern_category": "income",
                "visual_card_type": "income",
                "visual_card_data": {
                    "trade": trade_name,
                    "starting_range": starting_sal,
                    "starting_spoken": "fourteen to eighteen thousand rupees per month",
                    "experienced_range": exp_sal,
                    "experienced_spoken": "twenty-five to thirty-five thousand rupees per month",
                    "placement_rate": placement_rate,
                    "contractor_potential": "₹50,000–₹1,00,000+/month",
                    "dataset_badge": "Prototype / Demo Dataset"
                },
                "follow_up_question": follow_up,
                "confidence": 0.98,
                "requires_human_counsellor": False,
                "sentiment": "positive",
                "suggested_actions": ["view_salary", "view_pathway"]
            }

        # 3. UNEXPECTED QUESTION: DAUGHTER / NOT IN OFFICE / GENDER / HANDS-ON
        # Exact prompt requirement:
        # Parent asks: "My daughter doesn't want to work in an office. Would electrician be suitable for her?"
        # Understand naturally using course data, work environment, skills, job roles, general AI reasoning.
        # DO NOT say "I don't have this question in my database."
        if any(w in q_lower for w in ["daughter", "girl", "female", "woman", "women", "dikri", "dikari"]) or ("office" in q_lower and ("not" in q_lower or "desk" in q_lower or "sit" in q_lower)) or any(k in question for k in ["દીકરી", "છોકરી", "ઓફિસ", "બેસવું"]):
            if is_gujarati:
                spoken = "જો તમારી દીકરીને ઓફિસમાં બેસી રહેવા કરતાં પ્રેક્ટિકલ કામ કરવું વધુ ગમતું હોય, તો ઇલેક્ટ્રિશિયન ક્ષેત્ર ખૂબ જ યોગ્ય છે. આજે ઓટોમેશન, કંટ્રોલ પેનલ એસેમ્બલી અને ક્વોલિટી ટેસ્ટિંગમાં બહેનો માટે સલામત અને આદરણીય વાતાવરણ છે."
                display = (
                    f"**દીકરીઓ માટે વ્યવસાયિક ઇલેક્ટ્રિકલ ક્ષેત્રમાં તકો અને સુરક્ષા**\n\n"
                    f"જો તમારી દીકરીને ઓફિસમાં એક જ જગ્યાએ બેસી રહેવું ગમતું નથી અને હાથથી ટેકનિકલ કામ કરવું ગમે છે, તો {trade_name} તેના માટે શ્રેષ્ઠ અને આધુનિક પસંદગી છે:\n\n"
                    f"• **સક્રિય અને ટેકનિકલ કાર્ય**: સર્કિટ ડાયગ્નોસ્ટિક્સ, સ્માર્ટ મીટરિંગ, ઇન્ડસ્ટ્રિયલ વાયરિંગ અને સોલર પેનલ ટેસ્ટિંગ.\n"
                    f"• **મહિલાઓ માટે અનુકૂળ ભૂમિકાઓ**: અદ્યતન મેન્યુફેક્ચરિંગ પ્લાન્ટ્સ, ઇલેક્ટ્રોનિક્સ ટેસ્ટિંગ લેબોરેટરીઝ, સ્માર્ટ ગ્રીડ મોનિટરિંગ અને ટેકનિકલ સુપરવિઝન.\n"
                    f"• **સુરક્ષિત કાર્યસ્થળ વાતાવરણ**: માન્ય ઔદ્યોગિક એકમોમાં કડક સેફ્ટી પ્રોટોકોલ અને આદરણીય વ્યવસાયિક માહોલ ઉપલબ્ધ હોય છે.\n"
                    f"• **સરકારી સહાય અને પ્રોત્સાહન**: ઘણી સરકારી ITI અને પોલિટેકનિક સંસ્થાઓમાં વિદ્યાર્થિનીઓ માટે વિશેષ સ્કોલરશીપ અને રિઝર્વેશન ઉપલબ્ધ છે."
                )
            else:
                spoken = "If your daughter thrives on active hands-on technical work rather than sitting behind an office desk, an electrician career is very suitable. Today, modern electrical roles in testing labs, automation, and solar design offer safe, respected, and highly viable pathways for women."
                display = (
                    f"**Suitability for Women & Active Hands-on Technical Work**\n\n"
                    f"If your daughter prefers dynamic, practical work rather than sitting at an office desk all day, {trade_name} is an empowering, high-demand technical career choice:\n\n"
                    f"• **Hands-On Problem Solving**: Every day involves active circuit troubleshooting, control panel wiring, diagnostic instruments, and real-world system testing.\n"
                    f"• **Growing Female Representation**: Women are excelling in precision industrial automation, clean electronics manufacturing, quality testing laboratories, and renewable solar installations.\n"
                    f"• **Structured & Safe Workspaces**: Regulated facilities maintain strict safety guidelines, professional shifts, and clear accountability.\n"
                    f"• **Equal Career Ladder**: Growth leads to senior test engineer, site supervisor, or independent electrical consultancy without desk-bound monotony."
                )

            return {
                "spoken_text": spoken,
                "display_text": display,
                "language": "gu-IN" if is_gujarati else "en-IN",
                "emotion": "reassuring",
                "concern_category": "social_perception",
                "visual_card_type": "work_environment",
                "visual_card_data": {
                    "trade": trade_name,
                    "focus": "Hands-on Technical Work for Women",
                    "focus_gu": "મહિલાઓ માટે સક્રિય ટેકનિકલ કાર્ય",
                    "suitable_roles": ["Automation Testing", "Smart Metering", "Solar Design", "Quality Inspection"],
                    "suitable_roles_gu": ["ઓટોમેશન ટેસ્ટિંગ", "સ્માર્ટ મીટરિંગ", "સોલર ડિઝાઇન", "ક્વોલિટી ઇન્સ્પેક્શન"],
                    "environment_type": "Modern Structured Facilities & Labs"
                },
                "follow_up_question": follow_up,
                "confidence": 0.96,
                "requires_human_counsellor": False,
                "sentiment": "positive",
                "suggested_actions": ["view_pathway", "view_safety", "talk_counsellor"]
            }

        # 4. SAFETY / WORKPLACE HAZARDS / SHOCK
        if any(w in q_lower for w in ["safe", "danger", "hazard", "shock", "current", "risk", "hurt", "injury", "protect", "suraksha"]) or any(k in question for k in ["સલામત", "સુરક્ષા", "જોખમ", "કરંટ", "શોક"]):
            if is_gujarati:
                spoken = "ઇલેક્ટ્રિકલ તાલીમમાં સુરક્ષા એ સૌથી પહેલો નિયમ છે. વિદ્યાર્થીઓને એક હજાર વોલ્ટ ઇન્સ્યુલેટેડ ટૂલ્સ, સેફ્ટી શૂઝ અને લોકઆઉટ પ્રોટોકોલ સાથે કામ કરવાની સંપૂર્ણ તાલીમ આપવામાં આવે છે."
                display = (
                    f"**કાર્યસ્થળ સુરક્ષા અને આધુનિક સેફ્ટી સ્ટાન્ડર્ડ્સ**\n\n"
                    f"સુરક્ષા એ વાલીઓ માટે ખૂબ જ સ્વાભાવિક ચિંતા છે. વ્યાવસાયિક {trade_name} તાલીમમાં આંતરરાષ્ટ્રીય સુરક્ષા નિયમોનું પાલન થાય છે:\n\n"
                    f"• **૧૦૦૦V ઇન્સ્યુલેટેડ હેન્ડ ટૂલ્સ**: કરંટ સામે રક્ષણ આપતા ખાસ પ્રમાણિત સાધનો.\n"
                    f"• **ડાઇ-ઇલેક્ટ્રિક સેફ્ટી શૂઝ અને ગ્લોવ્ઝ**: અર્થિંગ અને આકસ્મિક સંપર્ક સામે સંપૂર્ણ સુરક્ષા.\n"
                    f"• **લોકઆઉટ / ટેગઆઉટ (LOTO) પદ્ધતિ**: કાર્ય શરૂ કરતા પહેલા મુખ્ય પાવર સપ્લાય લોક કરવાનો ફરજિયાત પ્રોટોકોલ.\n"
                    f"• **સેફ્ટી ફર્સ્ટ માઇન્ડસેટ**: તાલીમનો ૩૦% સમય ફક્ત સુરક્ષા, પ્રાથમિક સારવાર અને જોખમ મુક્ત કામગીરી શીખવવામાં વપરાય છે."
                )
            else:
                spoken = "Workplace safety is the foundational pillar of electrical vocational training. Technicians work using one-thousand-volt rated insulated tools, dielectric safety shoes, and strict lockout-tagout procedures to ensure zero-risk operations."
                display = (
                    f"**Workplace Safety & Regulated Electrical Standards**\n\n"
                    f"That's a very understandable concern. Modern vocational electrical training rigorously adheres to established industrial safety standards:\n\n"
                    f"• **1000V Insulated Hand Tools**: Certified tools designed to safeguard against inadvertent live-contact.\n"
                    f"• **Dielectric Protective Footwear & PPE**: Flame-resistant clothing, anti-static gloves, and safety helmets.\n"
                    f"• **Lockout/Tagout (LOTO) Protocols**: Strict isolation of power sources prior to maintenance or testing.\n"
                    f"• **Standard Operating Procedures**: When protocols taught in certified courses are followed, electrical work is an orderly, safe, and regulated profession."
                )

            return {
                "spoken_text": spoken,
                "display_text": display,
                "language": "gu-IN" if is_gujarati else "en-IN",
                "emotion": "reassuring",
                "concern_category": "safety",
                "visual_card_type": "safety",
                "visual_card_data": {
                    "trade": trade_name,
                    "gear": ["1000V Insulated Tools", "Dielectric Safety Shoes", "Insulated Gloves", "Flame-Resistant Apparel"],
                    "gear_gu": ["૧૦૦૦V ઇન્સ્યુલેટેડ ટૂલ્સ", "સેફ્ટી શૂઝ", "ઇન્સ્યુલેટેડ ગ્લોવ્ઝ", "સેફ્ટી જેકેટ / હેલ્મેટ"],
                    "protocol": "Lockout / Tagout (LOTO) Verified",
                    "risk_management": "Strict Industrial Safety Mandate"
                },
                "follow_up_question": follow_up,
                "confidence": 0.95,
                "requires_human_counsellor": False,
                "sentiment": "neutral",
                "suggested_actions": ["view_safety", "view_environment"]
            }

        # 5. JOB OPPORTUNITIES / PLACEMENT / DEMAND / SECURITY
        if any(w in q_lower for w in ["job", "placement", "demand", "security", "market", "hiring", "employ", "naukri"]) or any(k in question for k in ["નોકરી", "પ્લેસમેન્ટ", "માંગ", "સ્થિરતા"]):
            if is_gujarati:
                spoken = f"પ્રોટોટાઇપ ડેમો ડેટાસેટ મુજબ, ઇલેક્ટ્રિશિયન માટે અંદાજિત {placement_rate} પ્લેસમેન્ટ સહાયતા દર છે. મેન્યુફેક્ચરિંગ, કન્સ્ટ્રક્શન, રેલવે અને સૌર ઉર્જા જેવા ક્ષેત્રોમાં કુશળ ટેકનિશિયનની માંગ સતત રહે છે."
                display = (
                    f"**નોકરીની તકો અને લાંબા ગાળાની સ્થિરતા**\n\n"
                    f"ડેમો ડેટાસેટ મુજબ, {trade_name} માટે આશરે **{placement_rate} પ્લેસમેન્ટ સહાયતા દર** નોંધાયેલો છે:\n\n"
                    f"• **સતત વધતી માંગ**: વીજળી અને ઓટોમેશન વિના કોઈપણ ઉદ્યોગ ચાલી શકતો નથી, તેથી ઇલેક્ટ્રિશિયનની માંગ ક્યારેય ઘટતી નથી.\n"
                    f"• **મુખ્ય રોજગાર ક્ષેત્રો**: રહેણાંક બાંધકામ, ઔદ્યોગિક પ્લાન્ટ્સ, મેટ્રો રેલ પ્રોજેક્ટ્સ, હોસ્પિટલ ફેસિલિટી મેનેજમેન્ટ અને રિન્યુએબલ સોલર એનર્જી.\n"
                    f"• **સરકારી અને ખાનગી વિકલ્પો**: રેલવે, વીજ કંપનીઓ (જેમ કે PGVCL/UGVCL/DGVCL), લાર્સન એન્ડ ટુબ્રો, ટાટા પાવર અને સ્થાનિક ઔદ્યોગિક એકમો."
                )
            else:
                spoken = f"According to our prototype demo dataset, electricians maintain an estimated placement rate of {placement_rate}. Demand remains continuous across manufacturing plants, construction infrastructure, railway projects, and renewable solar energy."
                display = (
                    f"**Job Opportunities & Long-term Employment Demand**\n\n"
                    f"Based on our Prototype / Demo Dataset, {trade_name} reflects an estimated **placement rate of {placement_rate}**:\n\n"
                    f"• **Evergreen Demand**: Electrical infrastructure is foundational to every home, factory, hospital, and data centre.\n"
                    f"• **Sectors Hiring**: Residential & commercial building construction, automotive plants, solar power farms, metro rail systems, and facilities maintenance.\n"
                    f"• **Public & Private Employers**: State distribution utilities (DISCOMs), Indian Railways, L&T, Siemens, Schneider Electric, and thousands of industrial MSMEs."
                )

            return {
                "spoken_text": spoken,
                "display_text": display,
                "language": "gu-IN" if is_gujarati else "en-IN",
                "emotion": "explaining",
                "concern_category": "job_opportunity",
                "visual_card_type": "job_opportunity",
                "visual_card_data": {
                    "trade": trade_name,
                    "placement_rate": placement_rate,
                    "key_sectors": ["Manufacturing", "Construction", "Solar Energy", "Metro Rail", "Facilities Maintenance"],
                    "key_sectors_gu": ["મેન્યુફેક્ચરિંગ", "બાંધકામ", "સોલર ઉર્જા", "મેટ્રો રેલ", "ફેસિલિટી મેન્ટેનન્સ"]
                },
                "follow_up_question": follow_up,
                "confidence": 0.94,
                "requires_human_counsellor": False,
                "sentiment": "positive",
                "suggested_actions": ["view_salary", "view_pathway"]
            }

        # 6. FURTHER EDUCATION / DIPLOMA / DEGREE
        if any(w in q_lower for w in ["education", "study", "degree", "diploma", "higher", "college", "btech", "lateral", "b.tech"]) or any(k in question for k in ["અભ્યાસ", "ડિગ્રી", "ડિપ્લોમા", "કોલેજ", "આગળ ભણવું"]):
            if is_gujarati:
                spoken = "વોકેશનલ તાલીમ લીધા પછી આગળ ભણવાના રસ્તા બંધ થતા નથી. વિદ્યાર્થી પોલિટેકનિક ડિપ્લોમામાં સીધો બીજા વર્ષમાં લેટરલ એડમિશન મેળવી શકે છે અને ત્યારબાદ ડિગ્રી એન્જિનિયરિંગ પણ કરી શકે છે."
                display = (
                    f"**આગળનું ઉચ્ચ શિક્ષણ અને ડિગ્રીનો માર્ગ**\n\n"
                    f"આ એક ખૂબ જ સારો પ્રશ્ન છે! વોકેશનલ કોર્સ એ ડેડ-એન્ડ નથી, પરંતુ ઉચ્ચ શિક્ષણનું એક મહત્વપૂર્ણ પગથિયું છે:\n\n"
                    f"• **પોલિટેકનિક ડિપ્લોમામાં લેટરલ એન્ટ્રી**: ITI ઇલેક્ટ્રિશિયન પૂર્ણ કર્યા પછી વિદ્યાર્થી ૩-વર્ષીય ડિપ્લોમાના બીજા વર્ષમાં સીધો પ્રવેશ (Lateral Entry) મેળવી શકે છે.\n"
                    f"• **ડિગ્રી એન્જિનિયરિંગ (B.Tech / B.E.)**: ડિપ્લોમા પછી B.Tech ઇલેક્ટ્રિકલ એન્જિનિયરિંગમાં એડમિશન લઈ શકાય છે.\n"
                    f"• **વિશેષ સર્ટિફિકેટ્સ**: ઇન્ડસ્ટ્રિયલ ઓટોમેશન (PLC/SCADA), સોલર PV ઇન્સ્ટોલેશન અને ઇલેક્ટ્રિક વ્હીકલ (EV) ટેકનોલોજી."
                )
            else:
                spoken = "Vocational training is not a dead end for education. Students can gain direct lateral entry into the second year of a polytechnic diploma in electrical engineering and subsequently advance to a B-Tech degree."
                display = (
                    f"**Higher Education & Academic Mobility Pathway**\n\n"
                    f"Vocational qualification opens formal technical education pathways recognized across state technical boards:\n\n"
                    f"• **Lateral Entry to Polytechnic Diploma**: Certified electricians are eligible for direct second-year admission into 3-year Diploma in Electrical Engineering.\n"
                    f"• **Subsequent B.Tech Advancement**: Diploma graduates can further pursue B.Tech/B.E. degrees through state engineering entrance quotas.\n"
                    f"• **Specialized Certifications**: Solar Rooftop Installer (Surya Mitra), PLC/SCADA Automation, Electric Vehicle Charging Systems, and Substation Operations."
                )

            return {
                "spoken_text": spoken,
                "display_text": display,
                "language": "gu-IN" if is_gujarati else "en-IN",
                "emotion": "pointing",
                "concern_category": "education",
                "visual_card_type": "education",
                "visual_card_data": {
                    "trade": trade_name,
                    "path": "ITI / Vocational (NSQF 4/5) → Lateral Polytechnic Diploma (NSQF 5/6) → B.Tech Engineering",
                    "path_gu": "આઇટીઆઇ / વોકેશનલ → લેટરલ પોલિટેકનિક ડિપ્લોમા → બી.ટેક એન્જિનિયરિંગ",
                    "certifications": ["Surya Mitra Solar PV", "PLC/SCADA Automation", "EV Charging Systems"]
                },
                "follow_up_question": follow_up,
                "confidence": 0.96,
                "requires_human_counsellor": False,
                "sentiment": "positive",
                "suggested_actions": ["view_pathway", "talk_counsellor"]
            }

        # 7. WORK ENVIRONMENT & LOCAL OPPORTUNITIES
        if any(w in q_lower for w in ["workplace", "environment", "shop", "factory", "site", "where", "local", "location", "gujarat", "surat", "ahmedabad", "vadodara"]) or any(k in question for k in ["વાતાવરણ", "કાર્યસ્થળ", "જગ્યા", "સ્થાનિક", "ગુજરાત"]):
            if is_gujarati:
                spoken = "ઇલેક્ટ્રિશિયન રહેણાંક મકાનો, ફેક્ટરીઓ, સબ-સ્ટેશન અને આધુનિક પ્રોજેક્ટ સાઇટ્સ પર કામ કરે છે. ગુજરાતમાં સાણંદ, દહેજ, હજીરા, વડોદરા અને મોરબી જેવા ઔદ્યોગિક કેન્દ્રોમાં સ્થાનિક તકો પુષ્કળ છે."
                display = (
                    f"**કાર્યસ્થળ વાતાવરણ અને ગુજરાતમાં સ્થાનિક તકો**\n\n"
                    f"ઇલેક્ટ્રિશિયન્સ માટે કાર્યસ્થળ વિવિધ અને આધુનિક હોય છે:\n\n"
                    f"• **વર્કપ્લેસ પ્રકારો**: રહેણાંક એપાર્ટમેન્ટ્સ, ઇન્ડસ્ટ્રિયલ મેન્યુફેક્ચરિંગ પ્લાન્ટ્સ, પાવર ડિસ્ટ્રિબ્યુશન ગ્રીડ અને સોલર પ્રોજેક્ટ સાઇટ્સ.\n"
                    f"• **ગુજરાતમાં મુખ્ય હબ**: સાણંદ (ઓટોમોબાઇલ હબ), દહેજ અને હજીરા (પેટ્રોકેમિકલ્સ અને હેવી ઇન્ડસ્ટ્રી), વડોદરા (ઇલેક્ટ્રિકલ ઇક્વિપમેન્ટ ક્લસ્ટર), મોરબી અને અમદાવાદ.\n"
                    f"• **ઘરની નજીક કામ કરવાની તક**: રહેણાંક મેન્ટેનન્સ અને સ્થાનિક ઔદ્યોગિક વસાહતો (GIDC) ને કારણે મોટા શહેરોમાં ગયા વગર પણ સારી આવક મેળવી શકાય છે."
                )
            else:
                spoken = "Electricians work across residential buildings, manufacturing factories, substations, and modern solar project sites. In Gujarat, major industrial hubs in Sanand, Dahej, Hazira, and Vadodara provide abundant local employment."
                display = (
                    f"**Work Environment & Regional Opportunities in Gujarat**\n\n"
                    f"Electrical professionals operate in structured, diverse workplace environments:\n\n"
                    f"• **Workplaces**: Commercial facilities, high-tech manufacturing plants, electricity distribution substations, and solar farms.\n"
                    f"• **Gujarat Industrial Corridors**: Sanand Auto Hub, Dahej & Hazira Special Economic Zones, Vadodara Electrical Equipment Cluster, Morbi Ceramics, and Dholera SIR.\n"
                    f"• **Proximity to Home**: Abundant local GIDC industrial estates and continuous residential township developments mean families can find employment close to their hometown."
                )

            return {
                "spoken_text": spoken,
                "display_text": display,
                "language": "gu-IN" if is_gujarati else "en-IN",
                "emotion": "explaining",
                "concern_category": "work_environment",
                "visual_card_type": "work_environment",
                "visual_card_data": {
                    "trade": trade_name,
                    "environments": ["Manufacturing Facilities", "Commercial Infrastructure", "Power Substations", "Solar Project Sites"],
                    "gujarat_hubs": ["Sanand (Auto & EV)", "Vadodara (Electrical Hub)", "Dahej & Hazira (Process & Heavy)", "Morbi & Ahmedabad (Industrial & GIDC)"]
                },
                "follow_up_question": follow_up,
                "confidence": 0.95,
                "requires_human_counsellor": False,
                "sentiment": "positive",
                "suggested_actions": ["view_environment", "view_pathway"]
            }

        # 8. SOCIAL RESPECT & PARENTAL DIGNITY CONCERNS
        # "Is this career respectable?" / "Will society respect my child?"
        if any(w in q_lower for w in ["respect", "status", "reputation", "society", "dignity", "shame", "samaj", "ijjat"]) or any(k in question for k in ["આદર", "પ્રતિષ્ઠા", "સમાજ", "માન", "ઇજ્જત"]):
            if is_gujarati:
                spoken = "તે ખૂબ જ સ્વાભાવિક ચિંતા છે. આજના સમયમાં લાઇસન્સ ધારક ઇલેક્ટ્રિશિયન એક કુશળ અને સન્માનજનક ટેકનિકલ પ્રોફેશનલ છે, જે પોતાના કૌશલ્યથી સન્માનભેર કમાણી કરે છે."
                display = (
                    f"**સામાજિક પ્રતિષ્ઠા અને આદર**\n\n"
                    f"તે ખૂબ જ સ્વાભાવિક ચિંતા છે. ચાલો આપણે ઉપલબ્ધ વાસ્તવિકતા સમજીએ:\n\n"
                    f"• **જરૂરી કૌશલ્ય**: સમાજ અને ઉદ્યોગો વીજળી અને ઓટોમેશન વિના એક મિનિટ પણ ચાલી શકતા નથી. કુશળ ઇલેક્ટ્રિશિયનને સમાજમાં મહત્વપૂર્ણ આધાર માનવામાં આવે છે.\n"
                    f"• **સરકારી લાઇસન્સિંગ**: વર્કમેન અને સુપરવાઇઝરી લાઇસન્સ મેળવ્યા પછી વ્યક્તિ એક પ્રમાણિત ટેકનિકલ એક્સપર્ટ બને છે.\n"
                    f"• **સ્વાભિમાનભેર કમાણી**: ઘણા યુવાનો માત્ર ૨-૩ વર્ષમાં પોતાના સહાયકો રાખીને સ્વતંત્ર કોન્ટ્રાક્ટર બની પરિવારની આર્થિક સ્થિતિ સુધારી રહ્યા છે."
                )
            else:
                spoken = "That's a very understandable concern. Today, a licensed electrical technician is a skilled, respected technical professional whose specialized expertise is essential to homes and modern industries."
                display = (
                    f"**Social Respect & Professional Dignity**\n\n"
                    f"That's a very understandable concern. Let me explain what the available information tells us:\n\n"
                    f"• **Essential Community Reliance**: Every modern household, business, and hospital depends indispensably on certified electrical specialists.\n"
                    f"• **Government Licensing & Authority**: Licensed electricians carry formal government competency certificates (Wireman & Supervisory permits).\n"
                    f"• **Entrepreneurial Pride**: Many certified technicians evolve into independent licensed electrical contractors, managing their own crews and commanding high professional dignity."
                )

            return {
                "spoken_text": spoken,
                "display_text": display,
                "language": "gu-IN" if is_gujarati else "en-IN",
                "emotion": "reassuring",
                "concern_category": "social_perception",
                "visual_card_type": "none",
                "visual_card_data": {},
                "follow_up_question": follow_up,
                "confidence": 0.94,
                "requires_human_counsellor": False,
                "sentiment": "positive",
                "suggested_actions": ["view_pathway", "talk_counsellor"]
            }

        # 9. HUMAN COUNSELLOR ESCALATION (Financial crisis, specific admission help, dispute)
        # Exact prompt requirement:
        # If reliable information is unavailable:
        # "That's an important question. I don't currently have enough verified information to give you a reliable answer. I can connect you with a counsellor who can help you further."
        if any(w in q_lower for w in ["counsellor", "human", "talk to counsellor", "person", "call me", "admission form", "scholarship amount for", "fee receipt", "loan guarantee", "private college", "unknown"]) or any(k in question for k in ["કાઉન્સેલર", "વાત કરવી", "ફોર્મ", "લોન", "સ્કોલરશીપ"]):
            if is_gujarati:
                spoken = "આ એક મહત્વનો પ્રશ્ન છે. તમને વિશ્વસનીય અને ચોક્કસ માહિતી મળે તે માટે, શું હું તમને અમારા માનવ કાઉન્સેલર સાથે જોડી આપું?"
                display = (
                    f"**માનવ કાઉન્સેલર સાથે વ્યક્તિગત માર્ગદર્શન**\n\n"
                    f"હું ખાતરી કરવા માંગુ છું કે તમને અનિશ્ચિત જવાબ આપવાને બદલે સંપૂર્ણ ચોક્કસ માહિતી મળે. શું તમે અમારા પ્રમાણિત વોકેશનલ કાઉન્સેલર સાથે વાત કરવા માંગો છો?\n\n"
                    f"નીચેના બટન પર ક્લિક કરીને તમે નિઃશુલ્ક ફોન કોલ અથવા વન-ઓન-વન કાઉન્સેલિંગ સેશન બુક કરી શકો છો."
                )
            else:
                spoken = "That's an important question. I want to make sure you receive accurate information rather than give you an uncertain answer. Would you like me to connect you with a human counsellor?"
                display = (
                    f"**Human Counsellor Connection**\n\n"
                    f"That's an important question. I want to make sure you receive accurate information rather than give you an uncertain answer. Would you like me to connect you with a human counsellor?\n\n"
                    f"Click below to book a free 1-on-1 call with a certified vocational career counsellor."
                )

            return {
                "spoken_text": spoken,
                "display_text": display,
                "language": "gu-IN" if is_gujarati else "en-IN",
                "emotion": "reassuring",
                "concern_category": "other",
                "visual_card_type": "none",
                "visual_card_data": {},
                "follow_up_question": follow_up,
                "confidence": 0.98,
                "requires_human_counsellor": True,
                "sentiment": "neutral",
                "suggested_actions": ["talk_counsellor"]
            }

        # 10. UNVERIFIED / UNKNOWN QUERY FALLBACK
        # Exact prompt requirement:
        # "That's an important question. I don't currently have enough verified information to give you a reliable answer. I can connect you with a counsellor who can help you further."
        # If the question is outside our dataset knowledge (e.g. medical advice, astrology, random stock picks):
        if any(w in q_lower for w in ["medicine", "doctor", "cricket", "astrology", "stock", "bitcoin", "weather", "recipe", "unverified"]):
            if is_gujarati:
                spoken = "આ એક મહત્વનો પ્રશ્ન છે. મારી પાસે હાલમાં વિશ્વસનીય જવાબ આપવા માટે પૂરતી ચકાસાયેલ માહિતી નથી. હું તમને કાઉન્સેલર સાથે જોડી શકું છું જે તમને વધુ મદદ કરી શકે."
                display = (
                    f"આ એક મહત્વનો પ્રશ્ન છે. મારી પાસે હાલમાં વિશ્વસનીય જવાબ આપવા માટે પૂરતી ચકાસાયેલ માહિતી નથી. હું તમને અમારા વરિષ્ઠ માનવ કાઉન્સેલર સાથે જોડી શકું છું જે તમને વધુ સચોટ માહિતી આપી શકે."
                )
            else:
                spoken = "That's an important question. I don't currently have enough verified information to give you a reliable answer. I can connect you with a counsellor who can help you further."
                display = (
                    f"That's an important question. I don't currently have enough verified information to give you a reliable answer. I can connect you with a counsellor who can help you further."
                )

            return {
                "spoken_text": spoken,
                "display_text": display,
                "language": "gu-IN" if is_gujarati else "en-IN",
                "emotion": "concerned",
                "concern_category": "other",
                "visual_card_type": "none",
                "visual_card_data": {},
                "follow_up_question": follow_up,
                "confidence": 0.60,
                "requires_human_counsellor": True,
                "sentiment": "neutral",
                "suggested_actions": ["talk_counsellor"]
            }

        # 11. GENERAL / TRADE OVERVIEW
        if is_gujarati:
            spoken = f"ઇલેક્ટ્રિશિયન ક્ષેત્રમાં બાંધકામ, ઉત્પાદન, સુવિધા વ્યવસ્થાપન અને સૌર ઉર્જા જેવા ક્ષેત્રોમાં ઘણી ઉત્તમ તકો છે. તમે ઇચ્છો તો હું તમને કારકિર્દીનો સંપૂર્ણ માર્ગ બતાવી શકું."
            display = (
                f"**{trade_name} વ્યવસાયિક કારકિર્દી વિહંગાવલોકન**\n\n"
                f"{trade_name} ક્ષેત્રમાં બાંધકામ, ઉત્પાદન, ફેસિલિટી મેન્ટેનન્સ અને રિન્યુએબલ ઉર્જા જેવા ક્ષેત્રોમાં સતત તકો ઉપલબ્ધ છે. કુશળ તાલીમ સાથે વિદ્યાર્થી સુરક્ષિત અને પ્રગતિશીલ કારકિર્દી બનાવી શકે છે."
            )
        else:
            spoken = f"Electricians can work in areas such as construction, manufacturing, maintenance, facilities, infrastructure and related technical industries. I can guide you through career growth, income, safety, or further education."
            display = (
                f"**{trade_name} Vocational Career Overview**\n\n"
                f"Electricians can work in areas such as construction, manufacturing, maintenance, facilities, infrastructure and related technical industries. With hands-on competency and formal certifications, students secure stable and rewarding careers."
            )

        return {
            "spoken_text": spoken,
            "display_text": display,
            "language": "gu-IN" if is_gujarati else "en-IN",
            "emotion": "explaining",
            "concern_category": "career_growth",
            "visual_card_type": "none",
            "visual_card_data": {},
            "follow_up_question": follow_up,
            "confidence": 0.90,
            "requires_human_counsellor": False,
            "sentiment": "positive",
            "suggested_actions": ["view_pathway", "view_salary", "talk_counsellor"]
        }
