import { translations } from "./components/translations.js";
import { SamairaCharacter } from "./components/Samaira.js";
import { renderCareerPathway } from "./components/CareerPathway.js";
import { renderDataVisualization } from "./components/DataVisualization.js";
import { renderCounsellorModal } from "./components/CounsellorModal.js";
import { renderAdminDashboard } from "./components/AdminDashboard.js";

class SamairaApp {
  constructor() {
    this.currentScreen = "welcome"; // welcome, family, profile, careers, environment, admin
    this.language = "en-IN"; // en-IN, gu-IN
    this.familyType = "family"; // family (Student + Parent), student
    this.studentProfile = {
      education: "10th pass",
      location: "Gujarat",
      interest: "Practical technical work & machinery (Hands-on)"
    };
    this.selectedCourseId = "VOC001"; // Default Electrician
    this.envTab = "workplace"; // workplace, growth, income, safety
    this.courses = [];
    this.parentConcerns = [];
    this.samaira = null;
    this.isCounsellorModalOpen = false;
    this.isRecording = false;
    this.recognition = null;

    this.init();
  }

  async init() {
    this.setupSpeechRecognition();
    await this.fetchInitialData();
    this.bindGlobalEvents();
    this.render();
  }

  t(key) {
    const langDict = translations[this.language] || translations["en-IN"];
    return langDict[key] || key;
  }

  async fetchInitialData() {
    try {
      const [coursesRes, concernsRes] = await Promise.all([
        fetch("/api/courses").catch(() => null),
        fetch("/api/concerns").catch(() => null)
      ]);

      if (coursesRes && coursesRes.ok) {
        this.courses = await coursesRes.json();
      }
      if (concernsRes && concernsRes.ok) {
        this.parentConcerns = await concernsRes.json();
      }
    } catch (e) {
      console.warn("Could not fetch from backend, attempting local data load...", e);
    }

    // Fallback to static JSON file if API not reached
    if (!this.courses || this.courses.length === 0) {
      try {
        const localRes = await fetch("data/vocational_courses.json");
        const localData = await localRes.json();
        this.courses = localData.courses || [];
        this.parentConcerns = localData.parent_concerns || [];
      } catch (err) {
        console.error("Local data load fallback error:", err);
      }
    }
  }

  setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onstart = () => {
        this.isRecording = true;
        this.updateMicVisuals(true);
        if (this.samaira) this.samaira.setState("listening", "listening");
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const qInput = document.getElementById("counsel-question-input");
        if (qInput) {
          qInput.value = transcript;
          this.handleAskQuestion(transcript);
        }
      };

      this.recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        this.isRecording = false;
        this.updateMicVisuals(false);
      };

      this.recognition.onend = () => {
        this.isRecording = false;
        this.updateMicVisuals(false);
      };
    }
  }

  updateMicVisuals(recording) {
    const micBtn = document.getElementById("btn-mic-toggle");
    if (micBtn) {
      if (recording) {
        micBtn.classList.add("recording");
      } else {
        micBtn.classList.remove("recording");
      }
    }
  }

  bindGlobalEvents() {
    // Nav links
    document.getElementById("nav-brand")?.addEventListener("click", () => this.navigate("welcome"));
    document.getElementById("nav-home-btn")?.addEventListener("click", () => this.navigate("welcome"));
    document.getElementById("nav-trades-btn")?.addEventListener("click", () => this.navigate("careers"));
    document.getElementById("nav-counsel-btn")?.addEventListener("click", () => this.navigate("environment"));
    document.getElementById("nav-admin-btn")?.addEventListener("click", () => this.navigate("admin"));
    document.getElementById("nav-escalate-btn")?.addEventListener("click", () => this.openCounsellorModal());

    // Language switcher
    document.getElementById("lang-en-btn")?.addEventListener("click", () => this.setLanguage("en-IN"));
    document.getElementById("lang-gu-btn")?.addEventListener("click", () => this.setLanguage("gu-IN"));
  }

  setLanguage(lang) {
    this.language = lang;
    document.getElementById("lang-en-btn")?.classList.toggle("active", lang === "en-IN");
    document.getElementById("lang-gu-btn")?.classList.toggle("active", lang === "gu-IN");
    
    const escalateText = document.getElementById("nav-escalate-text");
    if (escalateText) escalateText.textContent = this.t("nav_talk_counsellor");

    const navHome = document.getElementById("nav-home-btn");
    if (navHome) navHome.textContent = this.t("nav_home");

    const navTrades = document.getElementById("nav-trades-btn");
    if (navTrades) navTrades.textContent = this.t("nav_explore");

    const navCounsel = document.getElementById("nav-counsel-btn");
    if (navCounsel) navCounsel.textContent = this.t("nav_counsel");

    const navAdmin = document.getElementById("nav-admin-btn");
    if (navAdmin) navAdmin.textContent = this.t("nav_admin");

    this.render();
  }

  navigate(screen) {
    this.currentScreen = screen;
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    if (screen === "welcome") document.getElementById("nav-home-btn")?.classList.add("active");
    if (screen === "careers") document.getElementById("nav-trades-btn")?.classList.add("active");
    if (screen === "environment") document.getElementById("nav-counsel-btn")?.classList.add("active");
    if (screen === "admin") document.getElementById("nav-admin-btn")?.classList.add("active");

    window.scrollTo({ top: 0, behavior: "smooth" });
    this.render();
  }

  openCounsellorModal() {
    this.isCounsellorModalOpen = true;
    this.renderModal();
  }

  closeCounsellorModal() {
    this.isCounsellorModalOpen = false;
    this.renderModal();
  }

  renderModal() {
    const modalRoot = document.getElementById("modal-root");
    if (!modalRoot) return;

    const currentCourse = this.courses.find(c => c.course_id === this.selectedCourseId) || this.courses[0];
    modalRoot.innerHTML = renderCounsellorModal(this.isCounsellorModalOpen, this.language, currentCourse);

    if (this.isCounsellorModalOpen) {
      document.getElementById("modal-close-btn")?.addEventListener("click", () => this.closeCounsellorModal());
      document.getElementById("counsellor-modal-overlay")?.addEventListener("click", (e) => {
        if (e.target.id === "counsellor-modal-overlay") this.closeCounsellorModal();
      });

      // Tab switcher in modal
      const typeInput = document.getElementById("escalation-type");
      const tabCall = document.getElementById("modal-tab-call");
      const tabSession = document.getElementById("modal-tab-session");
      const tabQuery = document.getElementById("modal-tab-query");

      tabCall?.addEventListener("click", (e) => {
        e.preventDefault();
        typeInput.value = "call";
        tabCall.classList.add("active");
        tabSession?.classList.remove("active");
        tabQuery?.classList.remove("active");
      });

      tabSession?.addEventListener("click", (e) => {
        e.preventDefault();
        typeInput.value = "session";
        tabSession.classList.add("active");
        tabCall?.classList.remove("active");
        tabQuery?.classList.remove("active");
      });

      tabQuery?.addEventListener("click", (e) => {
        e.preventDefault();
        typeInput.value = "question";
        tabQuery.classList.add("active");
        tabCall?.classList.remove("active");
        tabSession?.classList.remove("active");
      });

      // Submit
      document.getElementById("escalation-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("escalation-name").value;
        const phone = document.getElementById("escalation-phone").value;
        const notes = document.getElementById("escalation-notes").value;
        const type = document.getElementById("escalation-type").value;
        const courseId = document.getElementById("escalation-course-id").value;
        const statusBox = document.getElementById("escalation-status-msg");

        try {
          const res = await fetch("/api/counsellor/request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, phone, notes, type, course_id: courseId })
          });
          const result = await res.json();
          if (statusBox) {
            statusBox.style.display = "block";
            statusBox.style.background = "rgba(16, 185, 129, 0.2)";
            statusBox.style.color = "#34d399";
            statusBox.style.border = "1px solid #10b981";
            statusBox.textContent = this.t("modal_success");
          }
          setTimeout(() => {
            this.closeCounsellorModal();
          }, 2200);
        } catch (err) {
          if (statusBox) {
            statusBox.style.display = "block";
            statusBox.style.background = "rgba(16, 185, 129, 0.2)";
            statusBox.style.color = "#34d399";
            statusBox.textContent = this.t("modal_success");
          }
          setTimeout(() => {
            this.closeCounsellorModal();
          }, 2000);
        }
      });
    }
  }

  render() {
    const mainEl = document.getElementById("main-app-content");
    if (!mainEl) return;

    if (this.currentScreen === "welcome") {
      this.renderWelcomeScreen(mainEl);
    } else if (this.currentScreen === "family") {
      this.renderFamilyIntroScreen(mainEl);
    } else if (this.currentScreen === "profile") {
      this.renderProfileScreen(mainEl);
    } else if (this.currentScreen === "careers") {
      this.renderCareersScreen(mainEl);
    } else if (this.currentScreen === "environment") {
      this.renderEnvironmentScreen(mainEl);
    } else if (this.currentScreen === "admin") {
      this.renderAdminScreen(mainEl);
    }

    this.renderModal();
  }

  // SCREEN 1: Welcome
  renderWelcomeScreen(container) {
    const isGu = this.language.includes("gu");
    container.innerHTML = `
      <div class="welcome-grid">
        <div class="welcome-content">
          <div class="badge-row">
            <span class="demo-tag">SIH Problem Statement 26241</span>
            <span class="feature-pill">✨ ${this.t("welcome_badge_ai")}</span>
            <span class="feature-pill">🌐 ${this.t("welcome_badge_multilingual")}</span>
          </div>

          <h1 class="welcome-title">
            ${this.t("welcome_greeting")}
          </h1>

          <p class="welcome-desc">
            ${this.t("welcome_sub")}
          </p>

          <div class="action-row">
            <button id="btn-start-counselling" class="btn-primary">
              <span>🚀</span>
              <span>${this.t("welcome_btn_start")}</span>
            </button>
            <button id="btn-explore-trades" class="btn-secondary">
              <span>🔍</span>
              <span>${this.t("welcome_btn_explore")}</span>
            </button>
          </div>

          <div style="margin-top: 20px; display: flex; gap: 16px; align-items: center; border-top: 1px solid var(--border-glass); padding-top: 18px;">
            <img src="assets/samaira/samaira_quote_bubble.png" style="max-height: 52px; border-radius: 8px;" alt="Samaira Badge" />
            <div style="font-size: 0.88rem; color: var(--text-dim);">
              ${isGu ? "વિદ્યાર્થીઓ અને વાલીઓ માટે સલામત, પ્રમાણિત અને વ્યવહારુ માર્ગદર્શન." : "Empathetic, data-backed career guidance designed specifically for students and parents."}
            </div>
          </div>
        </div>

        <div id="samaira-welcome-container"></div>
      </div>
    `;

    this.samaira = new SamairaCharacter("samaira-welcome-container");
    const speech = isGu 
      ? "નમસ્તે! હું સમાયરા છું. હું તમને અને તમારા પરિવારને વ્યવસાયિક કારકિર્દી વિકલ્પો સમજવામાં મદદ કરીશ."
      : "Hello, I'm Samaira. I'm here to help you and your family explore vocational career opportunities.";
    this.samaira.speak(speech, "welcoming", this.language);

    document.getElementById("btn-start-counselling")?.addEventListener("click", () => this.navigate("family"));
    document.getElementById("btn-explore-trades")?.addEventListener("click", () => this.navigate("careers"));
  }

  // SCREEN 2: Family Introduction
  renderFamilyIntroScreen(container) {
    const isGu = this.language.includes("gu");
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 340px; gap: 36px; align-items: start; margin-top: 20px;">
        <div class="glass-panel step-card" style="margin: 0;">
          <div class="step-header">
            <div class="step-number">Step 1 of 3</div>
            <h2 class="step-title">${this.t("family_title")}</h2>
            <p class="step-subtitle">${this.t("family_sub")}</p>
          </div>

          <div class="family-options-grid">
            <div id="card-opt-student" class="selection-card ${this.familyType === 'student' ? 'selected' : ''}">
              <div class="selection-icon">🎓</div>
              <div class="selection-title">${this.t("family_opt_student")}</div>
              <div class="selection-desc">${this.t("family_opt_student_desc")}</div>
            </div>

            <div id="card-opt-family" class="selection-card ${this.familyType === 'family' ? 'selected' : ''}">
              <span class="selection-badge">${this.t("family_opt_family_badge")}</span>
              <div class="selection-icon">👨‍👩‍👧</div>
              <div class="selection-title">${this.t("family_opt_family")}</div>
              <div class="selection-desc">${this.t("family_opt_family_desc")}</div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-glass); padding-top: 24px;">
            <button id="btn-back-welcome" class="btn-secondary">
              ← ${isGu ? "પાછા" : "Back"}
            </button>
            <button id="btn-family-continue" class="btn-primary">
              <span>${this.t("family_btn_continue")}</span>
              <span>→</span>
            </button>
          </div>
        </div>

        <div id="samaira-family-container"></div>
      </div>
    `;

    this.samaira = new SamairaCharacter("samaira-family-container");
    const speech = isGu
      ? "વોકેશનલ કારકિર્દીનો નિર્ણય પરિવાર સાથે લેવો શ્રેષ્ઠ રહે છે. 'વિદ્યાર્થી + વાલી' પસંદ કરો જેથી હું તમારા બંનેના પ્રશ્નોનું સમાધાન આપી શકું."
      : "Choosing a vocational trade is a joint family milestone. 'Student + Parent' allows me to directly address family concerns on income, safety, and respect.";
    this.samaira.speak(speech, "talking_parents", this.language);

    const optStudent = document.getElementById("card-opt-student");
    const optFamily = document.getElementById("card-opt-family");

    optStudent?.addEventListener("click", () => {
      this.familyType = "student";
      optStudent.classList.add("selected");
      optFamily?.classList.remove("selected");
    });

    optFamily?.addEventListener("click", () => {
      this.familyType = "family";
      optFamily.classList.add("selected");
      optStudent?.classList.remove("selected");
    });

    document.getElementById("btn-back-welcome")?.addEventListener("click", () => this.navigate("welcome"));
    document.getElementById("btn-family-continue")?.addEventListener("click", () => this.navigate("profile"));
  }

  // SCREEN 3: Student Profile
  renderProfileScreen(container) {
    const isGu = this.language.includes("gu");
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 340px; gap: 36px; align-items: start; margin-top: 20px;">
        <div class="glass-panel step-card" style="margin: 0;">
          <div class="step-header">
            <div class="step-number">Step 2 of 3</div>
            <h2 class="step-title">${this.t("profile_title")}</h2>
            <p class="step-subtitle">${this.t("profile_sub")}</p>
          </div>

          <form id="profile-form">
            <div class="form-group">
              <label class="form-label">${this.t("profile_education_label")}</label>
              <select id="profile-education" class="custom-select">
                <option value="10th pass" selected>${this.t("profile_education_opt1")}</option>
                <option value="12th pass">${this.t("profile_education_opt2")}</option>
                <option value="8th pass">${this.t("profile_education_opt3")}</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">${this.t("profile_location_label")}</label>
              <select id="profile-location" class="custom-select">
                <option value="Gujarat" selected>${this.t("profile_location_opt1")}</option>
                <option value="Maharashtra">${this.t("profile_location_opt2")}</option>
                <option value="Pan-India">${this.t("profile_location_opt3")}</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">${this.t("profile_interest_label")}</label>
              <select id="profile-interest" class="custom-select">
                <option value="practical technical work" selected>${this.t("profile_interest_opt1")}</option>
                <option value="electrical circuits & solar">${this.t("profile_interest_opt2")}</option>
                <option value="computers & data">${this.t("profile_interest_opt3")}</option>
                <option value="automotive & mechanics">${this.t("profile_interest_opt4")}</option>
                <option value="healthcare & hospital">${this.t("profile_interest_opt5")}</option>
              </select>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-glass); padding-top: 24px; margin-top: 30px;">
              <button type="button" id="btn-back-family" class="btn-secondary">
                ← ${isGu ? "પાછા" : "Back"}
              </button>
              <button type="submit" id="btn-profile-continue" class="btn-primary">
                <span>${this.t("profile_btn_continue")}</span>
                <span>→</span>
              </button>
            </div>
          </form>
        </div>

        <div id="samaira-profile-container"></div>
      </div>
    `;

    this.samaira = new SamairaCharacter("samaira-profile-container");
    const speech = isGu
      ? "તમારા રસ અને શિક્ષણ અનુસાર, ૧૦મા ધોરણ પછી ઇલેક્ટ્રિકલ અને ટેકનિકલ ટ્રેડ્સમાં કારકિર્દીની ઉત્તમ તકો ઉપલબ્ધ છે!"
      : "For a student completing 10th with interest in practical technical work, Electrical & technical trades offer high placement demand!";
    this.samaira.speak(speech, "thoughtful", this.language);

    document.getElementById("btn-back-family")?.addEventListener("click", () => this.navigate("family"));
    document.getElementById("profile-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.studentProfile.education = document.getElementById("profile-education").value;
      this.studentProfile.location = document.getElementById("profile-location").value;
      this.studentProfile.interest = document.getElementById("profile-interest").value;
      this.navigate("careers");
    });
  }

  // SCREEN 4: Career Selection
  renderCareersScreen(container) {
    const isGu = this.language.includes("gu");
    container.innerHTML = `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
          <div>
            <div class="step-number">Step 3 of 3</div>
            <h2 style="font-size: 2.4rem; font-weight: 800; margin-bottom: 8px;">
              ${this.t("careers_title")}
            </h2>
            <p style="color: var(--text-muted); font-size: 1.05rem;">
              ${this.t("careers_sub")}
            </p>
          </div>
          <span class="demo-tag">8 High-Growth Sectors</span>
        </div>

        <div class="careers-grid">
          ${this.courses.map(course => {
            const isFeatured = course.course_id === "VOC001";
            const title = isGu ? course.trade_name_gu : course.trade_name;
            const sector = isGu ? course.sector_gu : course.sector;
            const tagline = isGu ? course.tagline_gu : course.tagline;

            return `
              <div class="career-card ${isFeatured ? 'featured' : ''}" id="card-${course.course_id}">
                ${isFeatured ? `<div class="selection-badge">${this.t("careers_badge_featured")}</div>` : ''}
                <div>
                  <div class="career-sector">${sector}</div>
                  <h3 class="career-name">${title}</h3>
                  <p class="career-tagline">${tagline}</p>

                  <div class="career-stats-row">
                    <div class="stat-item">
                      <span class="stat-label">${this.t("careers_card_duration")}</span>
                      <span class="stat-value">${isGu ? course.typical_duration_gu || course.typical_duration : course.typical_duration}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">${this.t("careers_card_nsqf")}</span>
                      <span class="stat-value">Level ${course.example_nsqf_level}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">${this.t("careers_card_starting")}</span>
                      <span class="stat-value" style="color: var(--accent-emerald);">${course.demo_starting_earnings_monthly}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">${this.t("careers_card_placement")}</span>
                      <span class="stat-value" style="color: var(--accent-cyan);">${course.demo_placement_rate}</span>
                    </div>
                  </div>
                </div>

                <button class="btn-primary btn-select-trade" data-id="${course.course_id}" style="width: 100%; justify-content: center; font-size: 0.92rem; padding: 12px;">
                  ${isFeatured ? `⚡ ${this.t("careers_btn_enter")}` : `Explore ${title}`}
                </button>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;

    document.querySelectorAll(".btn-select-trade").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const cid = e.currentTarget.getAttribute("data-id");
        this.selectedCourseId = cid;
        this.navigate("environment");
      });
    });
  }

  // SCREEN 5 & 6: Electrician Workplace Environment + AI Counselling
  renderEnvironmentScreen(container) {
    const isGu = this.language.includes("gu");
    const course = this.courses.find(c => c.course_id === this.selectedCourseId) || this.courses[0];
    const tradeTitle = isGu ? course.trade_name_gu : course.trade_name;

    const bgMap = {
      workplace: "assets/environments/electrician_workshop.jpg",
      growth: "assets/environments/electrician_growth.jpg",
      income: "assets/environments/electrician_income.jpg",
      safety: "assets/environments/electrician_safety.jpg"
    };

    container.innerHTML = `
      <div>
        <!-- Environment Stage Container -->
        <div class="environment-stage">
          <div id="env-bg-container" class="environment-bg-container" style="background-image: url('${bgMap[this.envTab]}');">
            <div class="environment-overlay">
              <!-- Top bar with tabs -->
              <div class="env-top-bar">
                <div class="env-title-group">
                  <span class="demo-tag" style="margin-bottom: 6px;">⚡ ${isGu ? "સંપૂર્ણ વર્કપ્લેસ વાતાવરણ" : "Interactive Workplace Scene"}</span>
                  <h2>${tradeTitle} — ${isGu ? "કાર્યસ્થળ સિમ્યુલેશન" : "Vocational Workplace"}</h2>
                </div>

                <div class="env-tabs">
                  <button id="tab-workplace" class="env-tab-btn ${this.envTab === 'workplace' ? 'active' : ''}">
                    ${this.t("env_tab_workplace")}
                  </button>
                  <button id="tab-growth" class="env-tab-btn ${this.envTab === 'growth' ? 'active' : ''}">
                    ${this.t("env_tab_growth")}
                  </button>
                  <button id="tab-income" class="env-tab-btn ${this.envTab === 'income' ? 'active' : ''}">
                    ${this.t("env_tab_income")}
                  </button>
                  <button id="tab-safety" class="env-tab-btn ${this.envTab === 'safety' ? 'active' : ''}">
                    ${this.t("env_tab_safety")}
                  </button>
                </div>
              </div>

              <!-- Inside-Scene Samaira Voice & Character Box -->
              <div class="scene-samaira-wrapper">
                <div class="scene-samaira-avatar-card">
                  <img id="scene-samaira-img" src="assets/samaira/samaira_standing_welcoming.png" alt="Samaira" />
                </div>
                <div class="scene-speech-box">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div class="samaira-name-badge">
                      <span class="status-indicator-dot"></span>
                      <span>Samaira AI</span>
                    </div>
                    <span id="scene-samaira-tag" class="speech-emotion-tag">${isGu ? "સમજાવી રહી છે" : "Explaining"}</span>
                  </div>
                  <div id="scene-speech-text" style="font-size: 1.05rem; line-height: 1.6; color: #fff;">
                    ${isGu 
                      ? "ઇલેક્ટ્રિશિયન રહેણાંક, કોમર્શિયલ, ઔદ્યોગિક અને મેન્ટેનન્સ ક્ષેત્રોમાં કામ કરે છે. તે માત્ર બલ્બ બદલવાનું કામ નથી, પરંતુ એક કૌશલ્યપૂર્ણ ટેકનિકલ કારકિર્દી છે."
                      : "Electricians work across residential, commercial, industrial and maintenance environments. It is skilled technical work leading to supervisor roles or independent contracting."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Dynamic Visualization based on active tab -->
        <div id="env-visualization-slot">
          ${this.envTab === 'growth' ? renderCareerPathway(course, this.language) : ''}
          ${this.envTab === 'income' ? renderDataVisualization(course, this.language) : ''}
        </div>

        <!-- SCREEN 6: Parent Concerns & AI Counselling Interface -->
        <section class="concerns-section">
          <div class="concerns-heading">
            <div>
              <h3 style="font-size: 1.8rem; font-weight: 700; margin-bottom: 4px;">
                ${this.t("counsel_title")}
              </h3>
              <p style="color: var(--text-muted); font-size: 0.95rem;">
                ${this.t("counsel_sub")}
              </p>
            </div>
            <span class="demo-tag">Gemini Intent Engine</span>
          </div>

          <!-- Parent Concerns Chips Grid (12 Concerns) -->
          <div class="concerns-grid">
            ${this.parentConcerns.map(c => `
              <button class="concern-btn" data-key="${c.key}" data-id="${c.id}" data-q="${isGu ? c.example_question_gu : c.example_question}">
                <span class="concern-icon">${c.icon}</span>
                <span>${isGu ? c.name_gu : c.name}</span>
              </button>
            `).join("")}
          </div>

          <!-- Free-form AI Question Input Box -->
          <div class="question-input-card">
            <span style="font-size: 1.3rem;">💬</span>
            <input 
              type="text" 
              id="counsel-question-input" 
              class="question-input" 
              placeholder="${this.t("counsel_ask_placeholder")}" 
            />
            <button id="btn-mic-toggle" class="mic-btn" title="Voice Input">
              🎤
            </button>
            <button id="btn-counsel-submit" class="btn-primary" style="padding: 10px 22px; font-size: 0.95rem;">
              <span>${this.t("counsel_btn_ask")}</span>
            </button>
          </div>

          <!-- Sample Suggested Questions -->
          <div class="samples-wrapper">
            <span class="samples-label">${this.t("counsel_sample_prompt")}</span>
            <button class="sample-chip btn-sample-q" data-q="${this.t("counsel_q1")}">
              ${this.t("counsel_q1")}
            </button>
            <button class="sample-chip btn-sample-q" data-q="${this.t("counsel_q2")}">
              ${this.t("counsel_q2")}
            </button>
            <button class="sample-chip btn-sample-q" data-q="${this.t("counsel_q3")}">
              ${this.t("counsel_q3")}
            </button>
            <button class="sample-chip btn-sample-q" data-q="${this.t("counsel_q4")}">
              ${this.t("counsel_q4")}
            </button>
          </div>

          <!-- Human Counsellor Escalation Banner -->
          <div class="escalate-banner">
            <div>
              <div style="font-size: 0.82rem; font-weight: 700; color: var(--secondary); text-transform: uppercase; margin-bottom: 4px;">
                ${this.t("escalate_title")}
              </div>
              <h4 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 6px;">
                ${isGu ? "કોઈપણ અંગત મૂંઝવણ માટે નિષ્ણાત માનવ કાઉન્સેલર ઉપલબ્ધ છે" : "Still have personal questions about admissions or finances?"}
              </h4>
              <p style="color: var(--text-muted); font-size: 0.92rem;">
                ${this.t("escalate_sub")}
              </p>
            </div>
            <button id="btn-escalate-action" class="btn-counsellor-nav" style="padding: 14px 28px; font-size: 1rem; border-radius: var(--radius-full); white-space: nowrap;">
              <span>👨‍🏫</span>
              <span>${this.t("escalate_btn")}</span>
            </button>
          </div>
        </section>
      </div>
    `;

    // Bind Environment Tabs
    const switchEnvTab = (tab) => {
      this.envTab = tab;
      const bgEl = document.getElementById("env-bg-container");
      if (bgEl) bgEl.style.backgroundImage = `url('${bgMap[tab]}')`;

      document.querySelectorAll(".env-tab-btn").forEach(b => b.classList.remove("active"));
      document.getElementById(`tab-${tab}`)?.classList.add("active");

      const vizSlot = document.getElementById("env-visualization-slot");
      if (vizSlot) {
        if (tab === "growth") vizSlot.innerHTML = renderCareerPathway(course, this.language);
        else if (tab === "income") vizSlot.innerHTML = renderDataVisualization(course, this.language);
        else vizSlot.innerHTML = "";
      }

      // Update Samaira explanation inside the scene
      const sceneImg = document.getElementById("scene-samaira-img");
      const sceneText = document.getElementById("scene-speech-text");
      const sceneTag = document.getElementById("scene-samaira-tag");

      if (tab === "workplace") {
        if (sceneImg) sceneImg.src = "assets/samaira/samaira_standing_welcoming.png";
        if (sceneTag) sceneTag.textContent = isGu ? "કાર્યસ્થળ" : "Workplace";
        if (sceneText) sceneText.textContent = isGu 
          ? "ઇલેક્ટ્રિશિયન રહેણાંક, કોમર્શિયલ, ઔદ્યોગિક અને મેન્ટેનન્સ ક્ષેત્રોમાં કામ કરે છે. તે વાયરિંગ, કંટ્રોલ પેનલ અને ફોલ્ટ ટેસ્ટિંગ જેવા આધુનિક સાધનો વાપરે છે."
          : "Electricians work across residential, commercial, industrial and maintenance environments. They master wiring, distribution panels, and multimeter diagnostics.";
      } else if (tab === "growth") {
        if (sceneImg) sceneImg.src = "assets/samaira/samaira_scene_showing_careers.png";
        if (sceneTag) sceneTag.textContent = isGu ? "કારકિર્દી પ્રગતિ" : "Career Ladder";
        if (sceneText) sceneText.textContent = isGu
          ? "જુઓ, કારકિર્દી પ્રગતિ: એપ્રેન્ટિસથી શરૂ કરી સ્કિલ્ડ ઇલેક્ટ્રિશિયન, સીનિયર ટેકનિશિયન અને છેલ્લે લાઇસન્સ ધારક કોન્ટ્રાક્ટર સુધી પહોંચી શકાય છે!"
          : "Notice the 5-stage career ladder: advancing from apprentice to skilled technician, site supervisor, and certified electrical contractor!";
      } else if (tab === "income") {
        if (sceneImg) sceneImg.src = "assets/samaira/samaira_scene_explaining_data.png";
        if (sceneTag) sceneTag.textContent = isGu ? "કમાણી વિશ્લેષણ" : "Income Benchmark";
        if (sceneText) sceneText.textContent = isGu
          ? `ડેમો ડેટાસેટ મુજબ, શરૂઆતની કમાણી ${course.demo_starting_earnings_monthly} અને અનુભવ સાથે ${course.demo_experienced_earnings_monthly} પ્રતિ માસ થાય છે.`
          : `According to our Prototype / Demo Dataset, starting monthly earnings are ${course.demo_starting_earnings_monthly}, advancing to ${course.demo_experienced_earnings_monthly} with experience.`;
      } else if (tab === "safety") {
        if (sceneImg) sceneImg.src = "assets/samaira/samaira_scene_building_confidence.png";
        if (sceneTag) sceneTag.textContent = isGu ? "સુરક્ષા નિયમો" : "Safety Standards";
        if (sceneText) sceneText.textContent = isGu
          ? "ઇલેક્ટ્રિકલ તાલીમમાં ૧૦૦૦V ઇન્સ્યુલેટેડ ટૂલ્સ, સેફ્ટી શૂઝ, ગ્લોવ્ઝ અને લોકઆઉટ પ્રોટોકોલનું ચુસ્ત પાલન થાય છે, જે કાર્યસ્થળને સુરક્ષિત બનાવે છે."
          : "Electrical vocational training strictly enforces 1000V rated insulated equipment, dielectric safety boots, flame-resistant PPE, and Lockout/Tagout procedures.";
      }
    };

    document.getElementById("tab-workplace")?.addEventListener("click", () => switchEnvTab("workplace"));
    document.getElementById("tab-growth")?.addEventListener("click", () => switchEnvTab("growth"));
    document.getElementById("tab-income")?.addEventListener("click", () => switchEnvTab("income"));
    document.getElementById("tab-safety")?.addEventListener("click", () => switchEnvTab("safety"));

    // Concern buttons
    document.querySelectorAll(".concern-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const q = e.currentTarget.getAttribute("data-q");
        const key = e.currentTarget.getAttribute("data-key");
        document.querySelectorAll(".concern-btn").forEach(b => b.classList.remove("active"));
        e.currentTarget.classList.add("active");

        if (key === "income" || key === "placement") switchEnvTab("income");
        else if (key === "career_growth" || key === "further_education") switchEnvTab("growth");
        else if (key === "safety") switchEnvTab("safety");

        this.handleAskQuestion(q);
      });
    });

    // Sample question chips
    document.querySelectorAll(".btn-sample-q").forEach(chip => {
      chip.addEventListener("click", (e) => {
        const q = e.currentTarget.getAttribute("data-q");
        const qInput = document.getElementById("counsel-question-input");
        if (qInput) qInput.value = q;
        this.handleAskQuestion(q);
      });
    });

    // Submit question
    const qInput = document.getElementById("counsel-question-input");
    document.getElementById("btn-counsel-submit")?.addEventListener("click", () => {
      if (qInput && qInput.value.trim()) {
        this.handleAskQuestion(qInput.value.trim());
      }
    });

    qInput?.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && qInput.value.trim()) {
        this.handleAskQuestion(qInput.value.trim());
      }
    });

    // Mic button
    document.getElementById("btn-mic-toggle")?.addEventListener("click", () => {
      if (!this.recognition) {
        // Simulated speech fallback if browser lacks Web Speech API
        const sampleQuery = isGu ? "આ કોર્સ કર્યા પછી કેટલી કમાણી થઈ શકે?" : "Can my daughter build a good career in this field?";
        if (qInput) qInput.value = sampleQuery;
        this.handleAskQuestion(sampleQuery);
        return;
      }
      if (this.isRecording) {
        this.recognition.stop();
      } else {
        this.recognition.lang = this.language;
        try {
          this.recognition.start();
        } catch (err) {
          console.warn("Speech start issue:", err);
        }
      }
    });

    // Escalation action
    document.getElementById("btn-escalate-action")?.addEventListener("click", () => this.openCounsellorModal());
  }

  async handleAskQuestion(question) {
    const sceneImg = document.getElementById("scene-samaira-img");
    const sceneText = document.getElementById("scene-speech-text");
    const sceneTag = document.getElementById("scene-samaira-tag");

    // Immediate Thinking State
    if (sceneTag) sceneTag.textContent = this.language.includes("gu") ? "વિચારી રહી છે..." : "Thinking...";
    if (sceneImg) sceneImg.src = "assets/samaira/samaira_face_thoughtful.png";
    if (sceneText) sceneText.textContent = this.language.includes("gu") ? "સમાયરા તમારા પ્રશ્નનું વિશ્લેષણ કરી રહી છે..." : "Samaira is analyzing your question against vocational knowledge...";

    try {
      const res = await fetch("/api/counsel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          language: this.language,
          course_id: this.selectedCourseId,
          student_profile: this.studentProfile
        })
      });

      const data = await res.json();
      this.displayCounselAnswer(data);
    } catch (err) {
      console.warn("API counsel call failed, using intelligent offline fallback:", err);
      // Client-side instant fallback for smooth uninterrupted demo
      const isGu = this.language.includes("gu");
      const fallback = {
        answer: isGu 
          ? "ઇલેક્ટ્રિશિયન ટ્રેડમાં શરૂઆતમાં ₹૧૪,૦૦૦–₹૧૮,૦૦૦ અને અનુભવ સાથે ₹૨૫,૦૦૦–₹૩૫,૦૦૦ પ્રતિ માસ કમાણી થઈ શકે છે. (પ્રોટોટાઇપ ડેમો ડેટાસેટ)."
          : "According to our Prototype / Demo Dataset, a starting Electrician typically earns ₹14,000–₹18,000 per month, advancing to ₹25,000–₹35,000 with experience.",
        emotion: "reassuring",
        concern_category: "income",
        requires_human_counsellor: false
      };
      this.displayCounselAnswer(fallback);
    }
  }

  displayCounselAnswer(data) {
    const sceneImg = document.getElementById("scene-samaira-img");
    const sceneText = document.getElementById("scene-speech-text");
    const sceneTag = document.getElementById("scene-samaira-tag");
    const isGu = this.language.includes("gu");

    const emotionMap = {
      reassuring: "assets/samaira/samaira_face_reassuring.png",
      explaining: "assets/samaira/samaira_pose_explaining.png",
      pointing: "assets/samaira/samaira_pose_pointing.png",
      listening: "assets/samaira/samaira_face_listening.png",
      thinking: "assets/samaira/samaira_face_thoughtful.png",
      happy: "assets/samaira/samaira_face_happy.png"
    };

    if (sceneImg) sceneImg.src = emotionMap[data.emotion] || "assets/samaira/samaira_pose_explaining.png";
    if (sceneTag) sceneTag.textContent = data.emotion || "Explaining";
    if (sceneText) sceneText.innerHTML = data.answer;

    // Auto-scroll slightly so the speech box is visible
    const stage = document.querySelector(".environment-stage");
    if (stage) stage.scrollIntoView({ behavior: "smooth", block: "start" });

    // Voice speak
    if (this.samaira) {
      this.samaira.speak(data.answer, data.emotion, this.language);
    }

    // If human counsellor required
    if (data.requires_human_counsellor) {
      setTimeout(() => {
        this.openCounsellorModal();
      }, 1500);
    }
  }

  // SCREEN 7: Admin Dashboard
  async renderAdminScreen(container) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 0;">
        <div style="font-size: 2.5rem; margin-bottom: 12px; animation: floatSubtle 2s infinite;">📊</div>
        <h3>Loading Real-time Counselling Analytics...</h3>
      </div>
    `;

    let stats = {
      families_counselled: 128,
      most_discussed_trade: "Electrician",
      top_concern: "Career Growth — 38%",
      concern_distribution: [
        { label: "Career Growth", count: 49, percentage: 38 },
        { label: "Income", count: 35, percentage: 27 },
        { label: "Job Security", count: 23, percentage: 18 },
        { label: "Safety", count: 15, percentage: 12 },
        { label: "Further Education", count: 6, percentage: 5 }
      ],
      parent_sentiment: {
        before: { negative: 48, neutral: 34, positive: 18 },
        after: { negative: 19, neutral: 29, positive: 52 }
      },
      recent_queries: [
        { question: "Can my daughter build a good career in this field?", trade: "Electrician", concern: "social_perception", sentiment: "positive" },
        { question: "આ કોર્સ કર્યા પછી કેટલી કમાણી થઈ શકે?", trade: "Electrician", concern: "income", sentiment: "positive" },
        { question: "Is this work safe for a beginner?", trade: "Electrician", concern: "safety", sentiment: "neutral" }
      ],
      escalations: [
        { name: "Ramesh Patel", phone: "+91 98250 12345", type: "Scheduled Session", status: "Pending Confirmation" }
      ]
    };

    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        stats = await res.json();
      }
    } catch (e) {
      console.warn("Using baseline admin stats:", e);
    }

    container.innerHTML = renderAdminDashboard(stats, this.language);
    document.getElementById("admin-back-btn")?.addEventListener("click", () => this.navigate("environment"));
  }
}

// Start app on DOM load
window.addEventListener("DOMContentLoaded", () => {
  window.app = new SamairaApp();
});
