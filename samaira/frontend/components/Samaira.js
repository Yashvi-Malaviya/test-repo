export class SamairaCharacter {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = options;
    this.currentState = "idle";
    this.currentEmotion = "welcoming";
    this.speechText = "";
    this.isSpeaking = false;
    this.speechSynthesis = typeof window !== "undefined" ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.ttsEnabled = true;
    this.lastSpokenText = "";
    this.lastLanguage = "en-IN";
    this.voices = [];

    this.assetMap = {
      idle: "assets/samaira/samaira_standing_welcoming.png",
      welcoming: "assets/samaira/samaira_standing_welcoming.png",
      greeting: "assets/samaira/samaira_standing_welcoming.png",
      listening: "assets/samaira/samaira_face_listening.png",
      attentive: "assets/samaira/samaira_face_listening.png",
      thinking: "assets/samaira/samaira_face_thoughtful.png",
      speaking: "assets/samaira/samaira_pose_explaining.png",
      explaining: "assets/samaira/samaira_pose_explaining.png",
      pointing: "assets/samaira/samaira_pose_pointing.png",
      reassuring: "assets/samaira/samaira_face_reassuring.png",
      concerned: "assets/samaira/samaira_face_concerned.png",
      happy: "assets/samaira/samaira_face_happy.png",
      excited: "assets/samaira/samaira_face_excited.png",
      showing_careers: "assets/samaira/samaira_scene_showing_careers.png",
      explaining_data: "assets/samaira/samaira_scene_explaining_data.png",
      building_confidence: "assets/samaira/samaira_scene_building_confidence.png",
      talking_parents: "assets/samaira/samaira_scene_talking_parents.png"
    };

    this.emotionLabels = {
      "en-IN": {
        welcoming: "Welcoming",
        greeting: "Welcoming",
        listening: "Attentive Listening",
        attentive: "Attentive",
        thinking: "Thinking...",
        speaking: "Explaining",
        explaining: "Explaining",
        pointing: "Pointing to Pathway",
        reassuring: "Warm & Reassuring",
        concerned: "Empathetic & Concerned",
        happy: "Encouraging",
        excited: "Enthusiastic"
      },
      "gu-IN": {
        welcoming: "સ્વાગત કરે છે",
        greeting: "સ્વાગત કરે છે",
        listening: "ધ્યાનપૂર્વક સાંભળી રહી છે",
        attentive: "ધ્યાનપૂર્વક",
        thinking: "વિચારી રહી છે...",
        speaking: "સમજાવી રહી છે",
        explaining: "સમજાવી રહી છે",
        pointing: "પ્રગતિ સીડી દર્શાવે છે",
        reassuring: "હૂંફાળું અને આશ્વાસનદાયક",
        concerned: "સહાનુભૂતિપૂર્વક",
        happy: "પ્રોત્સાહિત",
        excited: "ઉત્સાહી"
      }
    };

    this.initVoices();
    this.render();
  }

  initVoices() {
    if (!this.speechSynthesis) return;
    const load = () => {
      this.voices = this.speechSynthesis.getVoices() || [];
    };
    load();
    if (this.speechSynthesis.onvoiceschanged !== undefined) {
      this.speechSynthesis.onvoiceschanged = load;
    }
  }

  getBestVoice(language) {
    if (!this.voices || this.voices.length === 0) {
      if (this.speechSynthesis) this.voices = this.speechSynthesis.getVoices() || [];
    }

    const isGu = language.includes("gu");

    if (isGu) {
      // 1. Look for native Gujarati voice
      const guVoice = this.voices.find(v => 
        (v.lang && (v.lang.toLowerCase().includes("gu") || v.lang.toLowerCase() === "gu-in")) ||
        (v.name && v.name.toLowerCase().includes("gujarati"))
      );
      if (guVoice) return guVoice;

      // 2. Look for Indian Hindi voice (reads Indic phonetics cleanly on Windows/Chrome)
      const hiVoice = this.voices.find(v => 
        (v.lang && v.lang.toLowerCase().includes("hi")) ||
        (v.name && (v.name.toLowerCase().includes("hindi") || v.name.toLowerCase().includes("kalpana") || v.name.toLowerCase().includes("swara")))
      );
      if (hiVoice) return hiVoice;

      // 3. Fallback to any Indian English voice
      const inVoice = this.voices.find(v => 
        (v.lang && v.lang.toLowerCase().includes("en-in")) ||
        (v.name && (v.name.toLowerCase().includes("india") || v.name.toLowerCase().includes("heera") || v.name.toLowerCase().includes("neerja")))
      );
      if (inVoice) return inVoice;
    } else {
      // English: Look for Indian English female voice for authentic warm persona
      const indianVoice = this.voices.find(v => 
        (v.lang && v.lang.toLowerCase() === "en-in") ||
        (v.name && (
          v.name.toLowerCase().includes("heera") ||
          v.name.toLowerCase().includes("neerja") ||
          v.name.toLowerCase().includes("veena") ||
          v.name.toLowerCase().includes("priya") ||
          v.name.toLowerCase().includes("india")
        ))
      );
      if (indianVoice) return indianVoice;

      // Fallback to high quality English voice
      const enVoice = this.voices.find(v => v.lang && v.lang.startsWith("en"));
      if (enVoice) return enVoice;
    }

    return null;
  }

  setState(state, emotion = null) {
    this.currentState = state;
    if (emotion) this.currentEmotion = emotion;
    this.updateVisuals();
  }

  speak(text, emotion = "explaining", language = "en-IN") {
    this.lastSpokenText = text;
    this.lastLanguage = language;
    this.speechText = text;
    this.currentEmotion = emotion;
    this.currentState = "speaking";
    this.isSpeaking = true;
    this.updateVisuals();

    if (!this.ttsEnabled || !this.speechSynthesis) {
      setTimeout(() => {
        this.isSpeaking = false;
        this.currentState = "idle";
        this.updateVisuals();
      }, Math.min(Math.max(text.length * 45, 2000), 5000));
      return;
    }

    try {
      this.speechSynthesis.cancel();

      // Clean text for speech synthesis (strip markdown, bullets, tags)
      const cleanText = text
        .replace(/[*#_`~]/g, "")
        .replace(/•/g, "")
        .replace(/₹/g, "rupees ")
        .replace(/\s+/g, " ")
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const isGu = language.includes("gu");

      utterance.lang = isGu ? "gu-IN" : "en-IN";
      const selectedVoice = this.getBestVoice(language);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // Warm, professional, calm cadence suitable for parents
      utterance.rate = isGu ? 0.90 : 0.92;
      utterance.pitch = isGu ? 1.02 : 1.05;

      utterance.onend = () => {
        this.isSpeaking = false;
        this.currentState = "idle";
        this.updateVisuals();
      };

      utterance.onerror = (e) => {
        console.warn("Speech synthesis notice:", e);
        this.isSpeaking = false;
        this.currentState = "idle";
        this.updateVisuals();
      };

      this.currentUtterance = utterance;
      this.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Speech synthesis trigger error:", err);
      setTimeout(() => {
        this.isSpeaking = false;
        this.currentState = "idle";
        this.updateVisuals();
      }, 3000);
    }
  }

  replay() {
    if (this.lastSpokenText) {
      this.speak(this.lastSpokenText, this.currentEmotion, this.lastLanguage);
    }
  }

  toggleMute() {
    this.ttsEnabled = !this.ttsEnabled;
    if (!this.ttsEnabled && this.speechSynthesis) {
      this.speechSynthesis.cancel();
      this.isSpeaking = false;
      this.currentState = "idle";
    }
    this.updateVisuals();
    return this.ttsEnabled;
  }

  stopSpeaking() {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.currentState = "idle";
    this.updateVisuals();
  }

  getImageForState() {
    if (this.currentEmotion && this.assetMap[this.currentEmotion]) {
      return this.assetMap[this.currentEmotion];
    }
    return this.assetMap[this.currentState] || this.assetMap.idle;
  }

  getEmotionLabel() {
    const langDict = this.emotionLabels[this.lastLanguage] || this.emotionLabels["en-IN"];
    return langDict[this.currentEmotion] || this.currentEmotion;
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="samaira-stage">
        <div class="samaira-glow-aura"></div>
        
        <div class="samaira-character-box">
          <img 
            id="samaira-img-element"
            src="${this.getImageForState()}" 
            alt="Samaira AI Vocational Counsellor" 
            class="samaira-character-img ${this.isSpeaking ? 'speaking' : ''}"
          />
          <div class="samaira-badge-floating">
            <span class="status-indicator-dot ${this.isSpeaking ? 'speaking-dot' : ''}"></span>
            <span id="samaira-character-badge-text">Samaira</span>
          </div>
        </div>

        <div id="samaira-bubble-wrapper" class="samaira-speech-bubble" style="${this.speechText ? 'display: block;' : 'display: none;'}">
          <div class="speech-bubble-tail"></div>
          
          <div class="speech-status-bar">
            <div class="samaira-name-badge">
              <span class="status-indicator-dot ${this.isSpeaking ? 'speaking-dot' : ''}"></span>
              <span>Samaira AI</span>
              ${this.isSpeaking ? `
                <div class="audio-wave">
                  <div class="wave-bar"></div>
                  <div class="wave-bar"></div>
                  <div class="wave-bar"></div>
                  <div class="wave-bar"></div>
                </div>
              ` : ''}
            </div>

            <div style="display: flex; align-items: center; gap: 8px;">
              <span id="samaira-emotion-tag" class="speech-emotion-tag">
                ${this.getEmotionLabel()}
              </span>
              <button id="btn-samaira-replay" class="speech-mini-action" title="Replay Spoken Voice">
                🔊
              </button>
            </div>
          </div>

          <div id="samaira-speech-content" class="speech-text">
            ${this.speechText}
          </div>
        </div>
      </div>
    `;

    document.getElementById("btn-samaira-replay")?.addEventListener("click", () => this.replay());
  }

  updateVisuals() {
    const imgEl = document.getElementById("samaira-img-element");
    const bubbleWrapper = document.getElementById("samaira-bubble-wrapper");
    const speechContent = document.getElementById("samaira-speech-content");
    const emotionTag = document.getElementById("samaira-emotion-tag");
    const dot = document.querySelector(".status-indicator-dot");

    if (imgEl) {
      imgEl.src = this.getImageForState();
      if (this.isSpeaking) {
        imgEl.classList.add("speaking");
      } else {
        imgEl.classList.remove("speaking");
      }
    }

    if (dot) {
      if (this.isSpeaking) dot.classList.add("speaking-dot");
      else dot.classList.remove("speaking-dot");
    }

    if (bubbleWrapper && speechContent && emotionTag) {
      if (this.speechText) {
        bubbleWrapper.style.display = "block";
        speechContent.innerHTML = this.speechText;
        emotionTag.textContent = this.getEmotionLabel();
      } else {
        bubbleWrapper.style.display = "none";
      }
    }
  }
}
