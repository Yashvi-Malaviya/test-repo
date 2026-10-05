import { translations } from "./components/translations.js";
import { SamairaCharacter } from "./components/Samaira.js";
import { renderCareerPathway } from "./components/CareerPathway.js";
import { renderDataVisualization } from "./components/DataVisualization.js";
import { renderCounsellorModal } from "./components/CounsellorModal.js";
import { renderAdminDashboard } from "./components/AdminDashboard.js";

class SamairaApp {
  constructor() {
    this.currentScreen = "welcome"; // welcome, profile, careers, environment, admin
    this.language = "en-IN"; // en-IN, gu-IN
    this.familyType = "family"; // family (Student + Parent), student
    this.studentProfile = {
      education: "10th pass",
      location: "Gujarat",
      interest: "practical technical work & machinery",
      preferred_career: "Electrician"
    };
    this.selectedCourseId = "VOC001"; // Default Electrician
    this.envTab = "workplace"; // workplace, growth, income, safety
    this.activeOptionKey = null;
    this.courses = [];
    this.parentConcerns = [];
    this.samaira = null;
    this.isCounsellorModalOpen = false;
    this.isRecording = false;
    this.recognition = null;
    this.lastAnswerData = null;

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
        console.warn("Speech recognition notice:", event.error);
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
      if (recording) micBtn.classList.add("recording");
      else micBtn.classList.remove("recording");
    }
  }

  bindGlobalEvents() {
    document.getElementById("nav-brand")?.addEventListener("click", () => this.navigate("welcome"));
    document.getElementById("nav-home-btn")?.addEventListener("click", () => this.navigate("welcome"));
    document.getElementById("nav-trades-btn")?.addEventListener("click", () => this.navigate("careers"));
    document.getElementById("nav-counsel-btn")?.addEventListener("click", () => this.navigate("environment"));
    document.getElementById("nav-admin-btn")?.addEventListener("click", () => this.navigate("admin"));
    document.getElementById("nav-escalate-btn")?.addEventListener("click", () => this.openCounsellorModal());

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

    // Spoken voice confirmation of language switch in the newly selected language
    if (this.samaira) {
      this.samaira.speak(this.t("lang_switch_spoken"), "welcoming", this.language);
    }
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
    if (this.samaira) {
      this.samaira.speak(this.t("escalate_spoken_prompt"), "reassuring", this.language);
    }
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

      const typeInput = document.getElementById("escalation-type");
      const tabCall = document.getElementById("modal-tab-call");
      const tabSession = document.getElementById("modal-tab-session");
      const tabQuery = document.getElementById("modal-tab-query");

      tabCall?.addEventListener("click", (e) => {
        e.preventDefault();
        if (typeInput) typeInput.value = "call";
        tabCall.classList.add("active");
        tabSession?.classList.remove("active");
        tabQuery?.classList.remove("active");
      });

      tabSession?.addEventListener("click", (e) => {
        e.preventDefault();
        if (typeInput) typeInput.value = "session";
        tabSession.classList.add("active");
        tabCall?.classList.remove("active");
        tabQuery?.classList.remove("active");
      });

      tabQuery?.addEventListener("click", (e) => {
        e.preventDefault();
        if (typeInput) typeInput.value = "question";
        tabQuery.classList.add("active");
        tabCall?.classList.remove("active");
        tabSession?.classList.remove("active");
      });

      document.getElementById("escalation-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("escalation-name")?.value;
        const phone = document.getElementById("escalation-phone")?.value;
        const notes = document.getElementById("escalation-notes")?.value;
        const type = document.getElementById("escalation-type")?.value || "call";
        const courseId = document.getElementById("escalation-course-id")?.value || "VOC001";
        const statusBox = document.getElementById("escalation-status-msg");

        try {
          await fetch("/api/counsellor/request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, phone, notes, type, course_id: courseId })
          });
        } catch (err) {
          console.warn("Escalation API notice:", err);
        }

        if (this.samaira) {
          this.samaira.speak(this.t("modal_booked_spoken"), "welcoming", this.language);
        }

        if (statusBox) {
          statusBox.style.display = "block";
          statusBox.style.background = "#ecfdf5";
          statusBox.style.color = "#047857";
          statusBox.style.border = "1px solid #10b981";
          statusBox.textContent = this.t("modal_success");
        }
        setTimeout(() => {
          this.closeCounsellorModal();
        }, 2500);
      });
    }
  }

  render() {
    const mainEl = document.getElementById("main-app-content");
    if (!mainEl) return;

    if (this.currentScreen === "welcome") {
      this.renderWelcomeScreen(mainEl);
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

  // SCREEN 1: Welcome Screen with Samaira in the MIDDLE performing like an animated character
  renderWelcomeScreen(container) {
    const isGu = this.language.includes("gu");
    container.innerHTML = `
      <div class="welcome-hero-centered">
        <!-- Top Badges -->
        <div class="hero-top-badges">
          <span class="demo-tag">SIH Problem Statement 26241</span>
          <span class="feature-pill">✨ ${this.t("welcome_badge_ai")}</span>
          <span class="feature-pill">🌐 ${this.t("welcome_badge_multilingual")}</span>
          <span class="feature-pill">👨‍👩‍👧 ${this.t("welcome_badge_family")}</span>
        </div>

        <!-- Greeting Heading -->
        <h1 class="welcome-title-centered">
          ${this.t("welcome_greeting")}
        </h1>

        <!-- Subtitle -->
        <p class="welcome-sub-centered">
          ${this.t("welcome_sub")}
        </p>

        <!-- SAMAIRA IN THE MIDDLE - PERFORMING AS AN ANIMATED CHARACTER -->
        <div id="samaira-welcome-container" class="samaira-middle-wrapper"></div>

        <!-- Centered Action Buttons below her -->
        <div class="action-row-centered">
          <button id="btn-start-counselling" class="btn-primary" style="padding: 14px 34px; font-size: 1.05rem;">
            <span>🚀</span>
            <span>${this.t("welcome_btn_start")}</span>
          </button>
          <button id="btn-explore-trades" class="btn-secondary" style="padding: 14px 30px; font-size: 1.05rem;">
            <span>🔍</span>
            <span>${this.t("welcome_btn_explore")}</span>
          </button>
        </div>

        <!-- Quick Inquiries Pills -->
        <div class="hero-topics-row">
          <span class="hero-topics-label">${isGu ? "તમે પૂછી શકો છો:" : "Ask Samaira about:"}</span>
          <span class="hero-topic-chip">💰 ${this.t("opt_income")}</span>
          <span class="hero-topic-chip">📈 ${this.t("opt_growth")}</span>
          <span class="hero-topic-chip">🏢 ${this.t("opt_placement")}</span>
          <span class="hero-topic-chip">🦺 ${this.t("opt_safety")}</span>
          <span class="hero-topic-chip">🎓 ${this.t("opt_education")}</span>
          <span class="hero-topic-chip">📍 ${this.t("opt_location")}</span>
        </div>
      </div>
    `;

    this.samaira = new SamairaCharacter("samaira-welcome-container");
    const introSpeech = this.t("welcome_spoken_intro");
    this.samaira.speak(introSpeech, "welcoming", this.language);

    document.getElementById("btn-start-counselling")?.addEventListener("click", () => this.navigate("profile"));
    document.getElementById("btn-explore-trades")?.addEventListener("click", () => this.navigate("careers"));
  }

  // SCREEN 2: Student Profile ("Before we begin, may I know a little about the student?")
  renderProfileScreen(container) {
    const isGu = this.language.includes("gu");
    container.innerHTML = `
      <div style="max-width: 820px; margin: 0 auto;">
        <!-- Samaira in the Middle guiding the questions -->
        <div id="samaira-profile-container" style="margin-bottom: 24px;"></div>

        <div class="glass-panel step-card" style="margin: 0;">
          <div class="step-header">
            <div class="step-number">Step 1 of 3</div>
            <h2 class="step-title">${this.t("profile_ask_title")}</h2>
            <p class="step-subtitle">${this.t("profile_sub")}</p>
          </div>

          <form id="profile-form">
            <!-- 1. Who is with me today -->
            <div class="form-group">
              <label class="form-label">${this.t("family_question")}</label>
              <div class="family-options-grid">
                <div id="card-opt-family" class="selection-card ${this.familyType === 'family' ? 'selected' : ''}">
                  <span class="selection-badge">${this.t("family_opt_family_badge")}</span>
                  <div class="selection-icon">👨‍👩‍👧</div>
                  <div class="selection-title">${this.t("family_opt_family")}</div>
                  <div class="selection-desc">${this.t("family_opt_family_desc")}</div>
                </div>

                <div id="card-opt-student" class="selection-card ${this.familyType === 'student' ? 'selected' : ''}">
                  <div class="selection-icon">🎓</div>
                  <div class="selection-title">${this.t("family_opt_student")}</div>
                  <div class="selection-desc">${this.t("family_opt_student_desc")}</div>
                </div>
              </div>
            </div>

            <!-- 2. Education -->
            <div class="form-group">
              <label class="form-label">${this.t("profile_education_label")}</label>
              <select id="profile-education" class="custom-select">
                <option value="10th pass" selected>${this.t("profile_education_opt1")}</option>
                <option value="12th pass">${this.t("profile_education_opt2")}</option>
                <option value="8th pass">${this.t("profile_education_opt3")}</option>
              </select>
            </div>

            <!-- 3. Location -->
            <div class="form-group">
              <label class="form-label">${this.t("profile_location_label")}</label>
              <select id="profile-location" class="custom-select">
                <option value="Gujarat" selected>${this.t("profile_location_opt1")}</option>
                <option value="Maharashtra">${this.t("profile_location_opt2")}</option>
                <option value="Pan-India">${this.t("profile_location_opt3")}</option>
              </select>
            </div>

            <!-- 4. Interest -->
            <div class="form-group">
              <label class="form-label">${this.t("profile_interest_label")}</label>
              <select id="profile-interest" class="custom-select">
                <option value="practical technical work & machinery" selected>${this.t("profile_interest_opt1")}</option>
                <option value="electrical circuits & solar">${this.t("profile_interest_opt2")}</option>
                <option value="computers & data">${this.t("profile_interest_opt3")}</option>
                <option value="automotive & mechanics">${this.t("profile_interest_opt4")}</option>
                <option value="healthcare & hospital">${this.t("profile_interest_opt5")}</option>
              </select>
            </div>

            <!-- 5. Preferred Career Area -->
            <div class="form-group">
              <label class="form-label">${this.t("profile_preferred_label")}</label>
              <select id="profile-preferred" class="custom-select">
                <option value="Electrician" selected>${this.t("profile_preferred_opt1")}</option>
                <option value="Solar Technician">${this.t("profile_preferred_opt2")}</option>
                <option value="CNC Operator">${this.t("profile_preferred_opt3")}</option>
                <option value="Automotive">${this.t("profile_preferred_opt4")}</option>
              </select>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-glass); padding-top: 24px; margin-top: 30px;">
              <button type="button" id="btn-back-welcome" class="btn-secondary">
                ← ${isGu ? "પાછા" : "Back"}
              </button>
              <button type="submit" id="btn-profile-continue" class="btn-primary">
                <span>${this.t("profile_btn_continue")}</span>
                <span>→</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.samaira = new SamairaCharacter("samaira-profile-container");
    this.samaira.speak(this.t("profile_ask_spoken"), "listening", this.language);

    const optStudent = document.getElementById("card-opt-student");
    const optFamily = document.getElementById("card-opt-family");

    optStudent?.addEventListener("click", () => {
      this.familyType = "student";
      optStudent.classList.add("selected");
      optFamily?.classList.remove("selected");
      if (this.samaira) {
        this.samaira.speak(this.t("family_chosen_student"), "welcoming", this.language);
      }
    });

    optFamily?.addEventListener("click", () => {
      this.familyType = "family";
      optFamily.classList.add("selected");
      optStudent?.classList.remove("selected");
      if (this.samaira) {
        this.samaira.speak(this.t("family_chosen_family"), "welcoming", this.language);
      }
    });

    document.getElementById("btn-back-welcome")?.addEventListener("click", () => this.navigate("welcome"));

    document.getElementById("profile-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.studentProfile.education = document.getElementById("profile-education")?.value || "10th pass";
      this.studentProfile.location = document.getElementById("profile-location")?.value || "Gujarat";
      this.studentProfile.interest = document.getElementById("profile-interest")?.value || "practical technical work";
      this.studentProfile.preferred_career = document.getElementById("profile-preferred")?.value || "Electrician";
      this.navigate("careers");
    });
  }

  // SCREEN 3: Career Selection ("Thank you. Based on your interests, let's explore some vocational career options together.")
  renderCareersScreen(container) {
    const isGu = this.language.includes("gu");
    container.innerHTML = `
      <div>
        <div style="text-align: center; margin-bottom: 24px;">
          <div class="step-number">Step 2 of 3</div>
          <h2 style="font-size: 2.4rem; font-weight: 800; margin-bottom: 8px;">
            ${this.t("careers_title")}
          </h2>
          <p style="color: var(--text-muted); font-size: 1.05rem; max-width: 700px; margin: 0 auto;">
            ${this.t("careers_sub")}
          </p>
        </div>

        <!-- SAMAIRA IN THE MIDDLE OF CAREER SELECTION -->
        <div id="samaira-careers-container" class="samaira-middle-wrapper" style="margin-bottom: 28px;"></div>

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
                      <span class="stat-value" style="color: var(--primary);">${course.demo_placement_rate}</span>
                    </div>
                  </div>
                </div>

                <button class="btn-primary btn-select-trade" data-id="${course.course_id}" style="width: 100%; justify-content: center; font-size: 0.95rem; padding: 12px;">
                  ${isFeatured ? `⚡ ${this.t("careers_btn_enter")}` : `Explore ${title}`}
                </button>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;

    this.samaira = new SamairaCharacter("samaira-careers-container");
    const speech = this.t("careers_spoken_intro");
    this.samaira.speak(speech, "explaining", this.language);

    document.querySelectorAll(".btn-select-trade").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const cid = e.currentTarget.getAttribute("data-id");
        this.selectedCourseId = cid;
        this.navigate("environment");
      });
    });
  }

  // SCREEN 4: Electrician Workplace Environment + Inside-Scene Centered Samaira + 9 Options
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
                  <span class="demo-tag" style="background: rgba(255, 255, 255, 0.9); color: #0f172a; margin-bottom: 6px;">⚡ ${isGu ? "ઇન્ટરેક્ટિવ કાર્યસ્થળ" : "Interactive Workplace"}</span>
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

              <!-- Inside-Scene Samaira in the Middle of the workplace -->
              <div class="scene-samaira-wrapper">
                <div class="scene-samaira-avatar-card">
                  <img id="scene-samaira-img" src="assets/samaira/samaira_char_welcoming.png" alt="Samaira Character" />
                </div>
                
                <div class="scene-speech-box">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div class="dialogue-brand">
                      <span class="status-indicator-dot speaking-dot"></span>
                      <span class="dialogue-name">Samaira AI</span>
                      <div class="audio-wave">
                        <div class="wave-bar"></div>
                        <div class="wave-bar"></div>
                        <div class="wave-bar"></div>
                        <div class="wave-bar"></div>
                      </div>
                    </div>

                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span id="scene-samaira-tag" class="dialogue-emotion-tag">${this.t("state_explaining")}</span>
                      <button id="btn-scene-replay" class="dialogue-mini-btn" title="Replay Voice">
                        🔊
                      </button>
                    </div>
                  </div>

                  <div id="scene-speech-text" style="font-size: 1.05rem; line-height: 1.6; color: #1e293b;">
                    ${this.t("env_workplace_explanation")}
                  </div>

                  <!-- DIRECT ACTION BUTTONS ON IMAGE BACKGROUND -->
                  <div class="scene-quick-nav">
                    <div class="quick-nav-header">
                      <span class="pulse-indicator"></span>
                      <span class="quick-nav-title">
                        ${isGu ? "તમે શું જાણવા માંગો છો? અહીંથી સીધા વિકલ્પો પસંદ કરો:" : "What do you want to know? Choose an option to jump directly:"}
                      </span>
                    </div>
                    <div class="scene-action-buttons-row">
                      <button id="btn-scene-jump-options" class="scene-btn-action highlight-pulse" title="${this.t("scene_action_what_to_know")}">
                        <span>💡</span>
                        <span>${this.t("scene_action_what_to_know")}</span>
                        <span class="btn-arrow">↓</span>
                      </button>
                      <button id="btn-scene-jump-details" class="scene-btn-action" title="${this.t("scene_action_course_details")}">
                        <span>📋</span>
                        <span>${this.t("scene_action_course_details")}</span>
                      </button>
                      <button id="btn-scene-jump-ladder" class="scene-btn-action" title="${this.t("scene_action_career_ladder")}">
                        <span>📈</span>
                        <span>${this.t("scene_action_career_ladder")}</span>
                      </button>
                      <button id="btn-scene-jump-income" class="scene-btn-action" title="${this.t("scene_action_income")}">
                        <span>💰</span>
                        <span>${this.t("scene_action_income")}</span>
                      </button>
                      <button id="btn-scene-jump-safety" class="scene-btn-action" title="${this.t("scene_action_safety")}">
                        <span>🦺</span>
                        <span>${this.t("scene_action_safety")}</span>
                      </button>
                      <button id="btn-scene-jump-ask" class="scene-btn-action" title="${this.t("scene_action_ask")}">
                        <span>💬</span>
                        <span>${this.t("scene_action_ask")}</span>
                        <span class="btn-arrow" style="color: #64748b;">↓</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Course Details Slide-down Slot -->
        <div id="course-details-slot"></div>

        <!-- Dynamic Visualization Slot -->
        <div id="env-visualization-slot">
          ${this.envTab === 'growth' ? renderCareerPathway(course, this.language) : ''}
          ${this.envTab === 'income' ? renderDataVisualization(course, this.language) : ''}
        </div>

        <!-- THE 9 PARENT TOPIC OPTIONS -->
        <section class="concerns-section">
          <div class="concerns-heading">
            <div>
              <h3 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 4px; color: #0f172a;">
                ${this.t("env_ask_first_title")}
              </h3>
              <p style="color: var(--text-muted); font-size: 0.95rem;">
                ${isGu ? "પરિવારની મુખ્ય ચિંતાઓ સમજવા માટે નીચેનામાંથી વિકલ્પ પસંદ કરો:" : "Select a topic below or ask any unexpected question naturally:"}
              </p>
            </div>
            <span class="demo-tag">9 Core Inquiries</span>
          </div>

          <!-- 9 Prominent Parent Option Buttons -->
          <div class="options-grid-9">
            <button class="option-btn-9" id="opt-income" data-topic="income">
              <span class="option-icon-box">💰</span>
              <span>${this.t("opt_income")}</span>
            </button>
            <button class="option-btn-9" id="opt-growth" data-topic="growth">
              <span class="option-icon-box">📈</span>
              <span>${this.t("opt_growth")}</span>
            </button>
            <button class="option-btn-9" id="opt-placement" data-topic="placement">
              <span class="option-icon-box">🏢</span>
              <span>${this.t("opt_placement")}</span>
            </button>
            <button class="option-btn-9" id="opt-security" data-topic="security">
              <span class="option-icon-box">🛡️</span>
              <span>${this.t("opt_security")}</span>
            </button>
            <button class="option-btn-9" id="opt-education" data-topic="education">
              <span class="option-icon-box">🎓</span>
              <span>${this.t("opt_education")}</span>
            </button>
            <button class="option-btn-9" id="opt-safety" data-topic="safety">
              <span class="option-icon-box">🦺</span>
              <span>${this.t("opt_safety")}</span>
            </button>
            <button class="option-btn-9" id="opt-environment" data-topic="environment">
              <span class="option-icon-box">🏭</span>
              <span>${this.t("opt_environment")}</span>
            </button>
            <button class="option-btn-9" id="opt-location" data-topic="location">
              <span class="option-icon-box">📍</span>
              <span>${this.t("opt_location")}</span>
            </button>
            <button class="option-btn-9" id="opt-something-else" data-topic="something_else">
              <span class="option-icon-box">💬</span>
              <span>${this.t("opt_something_else")}</span>
            </button>
          </div>

          <!-- Free-form AI Question Input Box -->
          <div class="question-input-card">
            <span style="font-size: 1.35rem;">💬</span>
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

          <!-- Sample Common Questions for Parents -->
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

          <!-- Dynamic Follow-up conversational card -->
          <div id="follow-up-slot"></div>

          <!-- Human Counsellor Escalation Banner -->
          <div class="escalate-banner">
            <div>
              <div style="font-size: 0.82rem; font-weight: 700; color: var(--secondary); text-transform: uppercase; margin-bottom: 4px;">
                ${this.t("escalate_title")}
              </div>
              <h4 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 6px; color: #0f172a;">
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

    if (!this.samaira) {
      this.samaira = new SamairaCharacter("samaira-container-hidden", {});
    }
    const transitionSpeech = `${this.t("env_transition_spoken")} ${this.t("env_ask_first_spoken")}`;
    this.samaira.speak(transitionSpeech, "explaining", this.language);

    document.getElementById("btn-scene-replay")?.addEventListener("click", () => {
      if (this.samaira) this.samaira.replay();
    });

    const switchEnvTab = (tab, speak = true) => {
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

      if (speak && this.samaira) {
        const tabKey = `env_tab_${tab}_spoken`;
        const speech = this.t(tabKey);
        const emotion = tab === "safety" ? "reassuring" : (tab === "growth" ? "pointing" : "explaining");
        this.samaira.speak(speech, emotion, this.language);
      }
    };

    document.getElementById("tab-workplace")?.addEventListener("click", () => switchEnvTab("workplace", true));
    document.getElementById("tab-growth")?.addEventListener("click", () => switchEnvTab("growth", true));
    document.getElementById("tab-income")?.addEventListener("click", () => switchEnvTab("income", true));
    document.getElementById("tab-safety")?.addEventListener("click", () => switchEnvTab("safety", true));

    // ON-IMAGE DIRECT NAVIGATION ACTIONS
    const renderCourseDetailsCard = () => `
      <div class="glass-panel" style="margin: 20px 0 28px 0; border: 1.5px solid #4f46e5; border-radius: var(--radius-md); padding: 24px; animation: floatDialogue 0.35s ease; box-shadow: 0 14px 34px rgba(79, 70, 229, 0.12);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; flex-wrap: wrap; gap: 8px;">
          <div>
            <span class="demo-tag" style="background: rgba(79, 70, 229, 0.1); color: #4f46e5; margin-bottom: 6px;">NCVT / DGT Government Certified</span>
            <h3 style="font-size: 1.5rem; font-weight: 800; color: #0f172a;">${this.t("course_details_modal_title")}</h3>
          </div>
          <button id="btn-close-course-details" class="dialogue-mini-btn" style="padding: 6px 14px; font-weight: 700; background: #e2e8f0; border-radius: 20px;">
            ✕ ${isGu ? "બંધ કરો" : "Close"}
          </button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 18px;">
          <div class="stat-card" style="padding: 14px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
            <span style="font-size: 0.8rem; color: #64748b; font-weight: 600;">⏱️ ${isGu ? "અવધિ" : "Course Duration"}</span>
            <h4 style="font-size: 1.05rem; font-weight: 800; color: #0f172a; margin-top: 4px;">${isGu ? "૨ વર્ષ (૪ સેમેસ્ટર)" : "2 Years (4 Semesters)"}</h4>
          </div>
          <div class="stat-card" style="padding: 14px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
            <span style="font-size: 0.8rem; color: #64748b; font-weight: 600;">🎓 ${isGu ? "ન્યૂનતમ લાયકાત" : "Eligibility"}</span>
            <h4 style="font-size: 1.05rem; font-weight: 800; color: #0f172a; margin-top: 4px;">${isGu ? "૧૦મું ધોરણ પાસ (ગણિત & વિજ્ઞાન)" : "10th Standard Passed"}</h4>
          </div>
          <div class="stat-card" style="padding: 14px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
            <span style="font-size: 0.8rem; color: #64748b; font-weight: 600;">📜 ${isGu ? "NSQF પ્રમાણપત્ર" : "NSQF Level"}</span>
            <h4 style="font-size: 1.05rem; font-weight: 800; color: #4f46e5; margin-top: 4px;">Level 4 (National Certificate)</h4>
          </div>
          <div class="stat-card" style="padding: 14px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
            <span style="font-size: 0.8rem; color: #64748b; font-weight: 600;">🛠️ ${isGu ? "પ્રેક્ટિકલ તાલીમ" : "Practical Training"}</span>
            <h4 style="font-size: 1.05rem; font-weight: 800; color: #059669; margin-top: 4px;">${isGu ? "૭૦% હેન્ડ્સ-ઓન વર્કશોપ" : "70% Hands-on Workshop"}</h4>
          </div>
        </div>
        <p style="color: #334155; line-height: 1.6; font-size: 0.95rem; margin: 0;">
          ${isGu 
            ? "ઇલેક્ટ્રિશિયન કોર્સમાં રહેણાંક અને ઔદ્યોગિક વાયરિંગ, કંટ્રોલ પેનલ્સ, મોટર્સ અને ટ્રાન્સફોર્મર્સ તેમજ સોલર પાવર સિસ્ટમ્સની સંપૂર્ણ પ્રેક્ટિકલ તાલીમ આપવામાં આવે છે. તાલીમ પૂર્ણ કર્યા પછી સરકારી એપ્રેન્ટિસશીપ અને ઉચ્ચ રોજગાર ઉપલબ્ધ બને છે."
            : "The Electrician curriculum provides comprehensive hands-on instruction in residential, commercial, and industrial electrical installations, diagnostic testing, AC/DC motors, PLC automation panels, and renewable solar PV systems. Certified graduates qualify for government wireman licenses and structured industry apprenticeships."}
        </p>
      </div>
    `;

    document.getElementById("btn-scene-jump-options")?.addEventListener("click", () => {
      const target = document.querySelector(".concerns-section");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        const grid = document.querySelector(".options-grid-9");
        if (grid) {
          grid.classList.add("target-highlight-pulse");
          setTimeout(() => grid.classList.remove("target-highlight-pulse"), 3600);
        }
      }
      if (this.samaira) {
        this.samaira.speak(this.t("scene_jump_options_spoken"), "pointing", this.language);
      }
    });

    document.getElementById("btn-scene-jump-details")?.addEventListener("click", () => {
      const slot = document.getElementById("course-details-slot");
      if (slot) {
        slot.innerHTML = renderCourseDetailsCard();
        slot.scrollIntoView({ behavior: "smooth", block: "center" });
        document.getElementById("btn-close-course-details")?.addEventListener("click", () => {
          slot.innerHTML = "";
        });
      }
      if (this.samaira) {
        this.samaira.speak(this.t("scene_jump_details_spoken"), "explaining", this.language);
      }
    });

    document.getElementById("btn-scene-jump-ladder")?.addEventListener("click", () => {
      switchEnvTab("growth", true);
      const viz = document.getElementById("env-visualization-slot");
      if (viz) viz.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    document.getElementById("btn-scene-jump-income")?.addEventListener("click", () => {
      switchEnvTab("income", true);
      const viz = document.getElementById("env-visualization-slot");
      if (viz) viz.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    document.getElementById("btn-scene-jump-safety")?.addEventListener("click", () => {
      switchEnvTab("safety", true);
      const viz = document.getElementById("env-visualization-slot");
      if (viz) viz.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    document.getElementById("btn-scene-jump-ask")?.addEventListener("click", () => {
      const card = document.querySelector(".question-input-card");
      const qInput = document.getElementById("counsel-question-input");
      if (card && qInput) {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        card.classList.add("target-highlight-pulse");
        setTimeout(() => card.classList.remove("target-highlight-pulse"), 3600);
        qInput.focus();
      }
      if (this.samaira) {
        this.samaira.speak(this.t("scene_jump_ask_spoken"), "listening", this.language);
      }
    });

    const handleTopicClick = (topic) => {
      document.querySelectorAll(".option-btn-9").forEach(b => b.classList.remove("active"));
      document.getElementById(`opt-${topic}`)?.classList.add("active");

      if (topic === "income") {
        switchEnvTab("income", false);
        this.handleAskQuestion(isGu ? "આ કોર્સ કર્યા પછી કેટલી કમાણી થઈ શકે?" : "How much can my child earn after this course?");
      } else if (topic === "growth") {
        switchEnvTab("growth", false);
        this.handleAskQuestion(isGu ? "ઇલેક્ટ્રિશિયનનું ભવિષ્ય કેવું હોય છે?" : "What is the future of an electrician?");
      } else if (topic === "placement") {
        switchEnvTab("income", false);
        this.handleAskQuestion(isGu ? "શું આ કોર્સ પછી નોકરીની તકો મળશે?" : "Will my child get a job after this course?");
      } else if (topic === "security") {
        this.handleAskQuestion(isGu ? "શું આ કામની બજારમાં લાંબા ગાળાની સ્થિરતા અને માંગ છે?" : "Is there job security and long-term demand for this work?");
      } else if (topic === "education") {
        switchEnvTab("growth", false);
        this.handleAskQuestion(isGu ? "શું આ પછી ડિપ્લોમા કે ડિગ્રી આગળ ભણી શકાય?" : "Can they pursue a diploma or degree after this?");
      } else if (topic === "safety") {
        switchEnvTab("safety", false);
        this.handleAskQuestion(isGu ? "શું આ કામ સલામત છે અને કયા સેફ્ટી નિયમો શીખવવામાં આવે છે?" : "How safe is this work and what protective gear is used?");
      } else if (topic === "environment") {
        switchEnvTab("workplace", false);
        this.handleAskQuestion(isGu ? "ઇલેક્ટ્રિશિયન કયા પ્રકારના વાતાવરણમાં કામ કરે છે?" : "What kind of workplace will my child work in?");
      } else if (topic === "location") {
        this.handleAskQuestion(isGu ? "શું ગુજરાતમાં ઘરની નજીક સ્થાનિક રોજગારની તકો મળશે?" : "Will there be local jobs near our location in Gujarat?");
      } else if (topic === "something_else") {
        if (this.samaira) {
          this.samaira.speak(this.t("opt_something_else_spoken"), "listening", this.language);
        }
        const qInput = document.getElementById("counsel-question-input");
        if (qInput) {
          qInput.focus();
          qInput.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    };

    document.querySelectorAll(".option-btn-9").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const topic = e.currentTarget.getAttribute("data-topic");
        handleTopicClick(topic);
      });
    });

    document.querySelectorAll(".btn-sample-q").forEach(chip => {
      chip.addEventListener("click", (e) => {
        const q = e.currentTarget.getAttribute("data-q");
        const qInput = document.getElementById("counsel-question-input");
        if (qInput) qInput.value = q;
        this.handleAskQuestion(q);
      });
    });

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

    document.getElementById("btn-mic-toggle")?.addEventListener("click", () => {
      if (!this.recognition) {
        const sampleQuery = isGu ? "આ કોર્સ કર્યા પછી કેટલી કમાણી થઈ શકે?" : "What is the future of an electrician?";
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
          console.warn("Speech start notice:", err);
        }
      }
    });

    document.getElementById("btn-escalate-action")?.addEventListener("click", () => this.openCounsellorModal());
  }

  async handleAskQuestion(question) {
    const sceneImg = document.getElementById("scene-samaira-img");
    const sceneText = document.getElementById("scene-speech-text");
    const sceneTag = document.getElementById("scene-samaira-tag");
    const isGu = this.language.includes("gu");

    if (sceneTag) sceneTag.textContent = this.t("state_thinking");
    if (sceneImg) sceneImg.src = "assets/samaira/samaira_char_listening.png";
    if (sceneText) sceneText.textContent = isGu 
      ? "સમાયરા તમારા પ્રશ્નનું વિશ્લેષણ કરી રહી છે..." 
      : "Samaira is analyzing your question against vocational knowledge...";

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
      console.warn("API counsel call notice, executing verified fallback:", err);
      const fallback = {
        spoken_text: isGu 
          ? "પ્રોટોટાઇપ ડેમો ડેટાસેટ મુજબ, શરૂઆતની કમાણી ચૌદથી અઢાર હજાર રૂપિયા પ્રતિ માસ છે અને અનુભવ સાથે પચીસથી પાંત્રીસ હજાર રૂપિયા સુધી પહોંચે છે."
          : "According to the prototype data available to me, starting earnings are around fourteen to eighteen thousand rupees per month. With experience, the range shown in our demo dataset is around twenty-five to thirty-five thousand rupees per month.",
        display_text: isGu
          ? "પ્રોટોટાઇપ ડેમો ડેટાસેટ મુજબ, શરૂઆતની કમાણી ₹૧૪,૦૦૦–₹૧૮,૦૦૦/માસ અને અનુભવી કમાણી ₹૨૫,૦૦૦–₹૩૫,૦૦૦/માસ દર્શાવેલ છે."
          : "According to our Prototype / Demo Dataset, starting monthly earnings are ₹14,000–₹18,000, advancing to ₹25,000–₹35,000 with experience.",
        emotion: "explaining",
        concern_category: "income",
        visual_card_type: "income",
        follow_up_question: isGu 
          ? "તમે ઇચ્છો તો શું હું આવક, કારકિર્દી પ્રગતિ, નોકરીની તકો અથવા બીજું કંઈક સમજાવું?" 
          : "Would you like me to explain the income, career growth, job opportunities, or something else?",
        requires_human_counsellor: false
      };
      this.displayCounselAnswer(fallback);
    }
  }

  displayCounselAnswer(data) {
    this.lastAnswerData = data;
    const sceneImg = document.getElementById("scene-samaira-img");
    const sceneText = document.getElementById("scene-speech-text");
    const sceneTag = document.getElementById("scene-samaira-tag");
    const vizSlot = document.getElementById("env-visualization-slot");
    const followUpSlot = document.getElementById("follow-up-slot");
    const course = this.courses.find(c => c.course_id === this.selectedCourseId) || this.courses[0];
    const isGu = this.language.includes("gu");

    // Dynamic transparent character sprites
    const emotionMap = {
      reassuring: "assets/samaira/samaira_char_welcoming.png",
      explaining: "assets/samaira/samaira_char_explaining.png",
      pointing: "assets/samaira/samaira_char_explaining.png",
      listening: "assets/samaira/samaira_char_listening.png",
      thinking: "assets/samaira/samaira_char_listening.png",
      concerned: "assets/samaira/samaira_char_listening.png",
      happy: "assets/samaira/samaira_char_welcoming.png",
      welcoming: "assets/samaira/samaira_char_welcoming.png"
    };

    if (sceneImg) sceneImg.src = emotionMap[data.emotion] || "assets/samaira/samaira_char_explaining.png";
    if (sceneTag) {
      const tagKey = `state_${data.emotion}` in (translations[this.language] || {}) 
        ? this.t(`state_${data.emotion}`) 
        : data.emotion;
      sceneTag.textContent = tagKey;
    }
    if (sceneText) {
      sceneText.innerHTML = data.display_text || data.answer;
    }

    if (vizSlot) {
      if (data.visual_card_type === "career_growth" || data.concern_category === "career_growth") {
        vizSlot.innerHTML = renderCareerPathway(course, this.language);
      } else if (data.visual_card_type === "income" || data.concern_category === "income") {
        vizSlot.innerHTML = renderDataVisualization(course, this.language);
      }
    }

    if (followUpSlot) {
      const followUpText = data.follow_up_question || this.t("follow_up_default");
      followUpSlot.innerHTML = `
        <div class="follow-up-card">
          <div class="follow-up-text">
            <span>💬</span>
            <span>${followUpText}</span>
          </div>
          <div class="follow-up-chips">
            <button class="follow-up-chip btn-quick-followup" data-q="${isGu ? 'આ કોર્સ કર્યા પછી કેટલી કમાણી થઈ શકે?' : 'How much can my child earn after this course?'}">
              💰 ${this.t("opt_income")}
            </button>
            <button class="follow-up-chip btn-quick-followup" data-q="${isGu ? 'ઇલેક્ટ્રિશિયનનું ભવિષ્ય કેવું હોય છે?' : 'What is the future of an electrician?'}">
              📈 ${this.t("opt_growth")}
            </button>
            <button class="follow-up-chip btn-quick-followup" data-q="${isGu ? 'શું આ કોર્સ પછી નોકરીની તકો મળશે?' : 'Will my child get a job after this course?'}">
              🏢 ${this.t("opt_placement")}
            </button>
            <button class="follow-up-chip btn-quick-followup" data-q="${isGu ? 'શું આ કામ સલામત છે?' : 'How safe is this work?'}">
              🦺 ${this.t("opt_safety")}
            </button>
          </div>
        </div>
      `;

      document.querySelectorAll(".btn-quick-followup").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const q = e.currentTarget.getAttribute("data-q");
          this.handleAskQuestion(q);
        });
      });
    }

    const stage = document.querySelector(".environment-stage");
    if (stage) stage.scrollIntoView({ behavior: "smooth", block: "start" });

    const textToSpeak = data.spoken_text || data.answer;
    if (this.samaira) {
      this.samaira.speak(textToSpeak, data.emotion, this.language);
    }

    if (data.requires_human_counsellor) {
      setTimeout(() => {
        this.openCounsellorModal();
      }, 1600);
    }
  }

  // SCREEN 5: Admin Dashboard on White
  async renderAdminScreen(container) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 0;">
        <div style="font-size: 2.5rem; margin-bottom: 12px;">📊</div>
        <h3 style="color: #0f172a;">Loading Real-time Counselling Analytics...</h3>
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
        { question: "What is the future of an electrician?", trade: "Electrician", concern: "career_growth", sentiment: "positive" },
        { question: "આ કોર્સ કર્યા પછી કેટલી કમાણી થઈ શકે?", trade: "Electrician", concern: "income", sentiment: "positive" },
        { question: "My daughter doesn't want to work in an office. Would electrician be suitable for her?", trade: "Electrician", concern: "social_perception", sentiment: "positive" }
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
    if (this.samaira) {
      this.samaira.speak(this.t("admin_spoken_intro"), "explaining", this.language);
    }
    document.getElementById("admin-back-btn")?.addEventListener("click", () => this.navigate("environment"));
  }
}

// Start app on DOM load
window.addEventListener("DOMContentLoaded", () => {
  window.app = new SamairaApp();
});
