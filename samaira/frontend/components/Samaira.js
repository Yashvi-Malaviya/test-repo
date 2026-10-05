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

    // Transparent animated standalone character cutouts
    this.assetMap = {
      idle: "assets/samaira/samaira_char_welcoming.png",
      welcoming: "assets/samaira/samaira_char_welcoming.png",
      greeting: "assets/samaira/samaira_char_welcoming.png",
      listening: "assets/samaira/samaira_char_listening.png",
      attentive: "assets/samaira/samaira_char_listening.png",
      thinking: "assets/samaira/samaira_char_listening.png",
      speaking: "assets/samaira/samaira_char_explaining.png",
      explaining: "assets/samaira/samaira_char_explaining.png",
      pointing: "assets/samaira/samaira_char_explaining.png",
      reassuring: "assets/samaira/samaira_char_welcoming.png",
      concerned: "assets/samaira/samaira_char_listening.png",
      happy: "assets/samaira/samaira_char_welcoming.png",
      excited: "assets/samaira/samaira_char_explaining.png"
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
        concerned: "Empathetic & Caring",
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
      const guVoice = this.voices.find(v => 
        (v.lang && (v.lang.toLowerCase().includes("gu") || v.lang.toLowerCase() === "gu-in")) ||
        (v.name && v.name.toLowerCase().includes("gujarati"))
      );
      if (guVoice) return guVoice;

      const hiVoice = this.voices.find(v => 
        (v.lang && v.lang.toLowerCase().includes("hi")) ||
        (v.name && (v.name.toLowerCase().includes("hindi") || v.name.toLowerCase().includes("kalpana") || v.name.toLowerCase().includes("swara")))
      );
      if (hiVoice) return hiVoice;

      const inVoice = this.voices.find(v => 
        (v.lang && v.lang.toLowerCase().includes("en-in")) ||
        (v.name && (v.name.toLowerCase().includes("india") || v.name.toLowerCase().includes("heera") || v.name.toLowerCase().includes("neerja")))
      );
      if (inVoice) return inVoice;
    } else {
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
      <div class="samaira-animated-stage ${this.isSpeaking ? 'is-speaking' : 'is-idle'}">
        <!-- Glowing Pulse Aura behind character -->
        <div class="samaira-aura"></div>
        <div class="samaira-sound-rings ${this.isSpeaking ? 'active' : ''}">
          <span class="sound-ring ring-1"></span>
          <span class="sound-ring ring-2"></span>
          <span class="sound-ring ring-3"></span>
        </div>

        <!-- Animated Character Rig with Breathing & Living Shadow -->
        <div class="samaira-character-rig ${this.isSpeaking ? 'speaking-animation' : 'breathing-animation'}">
          <img 
            id="samaira-img-element"
            src="${this.getImageForState()}" 
            alt="Samaira AI Virtual Career Counsellor" 
            class="samaira-live-character"
          />
          <div class="samaira-ground-shadow"></div>
        </div>

        <!-- Interactive Floating Dialogue Bubble -->
        <div id="samaira-bubble-wrapper" class="samaira-floating-dialogue" style="${this.speechText ? 'display: block;' : 'display: none;'}">
          <div class="dialogue-tail"></div>
          
          <div class="dialogue-header">
            <div class="dialogue-brand">
              <span class="status-indicator-dot ${this.isSpeaking ? 'speaking-dot' : ''}"></span>
              <span class="dialogue-name">Samaira AI</span>
              ${this.isSpeaking ? `
                <div class="audio-wave">
                  <div class="wave-bar"></div>
                  <div class="wave-bar"></div>
                  <div class="wave-bar"></div>
                  <div class="wave-bar"></div>
                </div>
              ` : ''}
            </div>

            <div class="dialogue-actions">
              <span id="samaira-emotion-tag" class="dialogue-emotion-tag">
                ${this.getEmotionLabel()}
              </span>
              <button id="btn-samaira-replay" class="dialogue-mini-btn" title="Replay Voice">
                🔊
              </button>
            </div>
          </div>

          <div id="samaira-speech-content" class="dialogue-content">
            ${this.speechText}
          </div>
        </div>
      </div>
    `;

    document.getElementById("btn-samaira-replay")?.addEventListener("click", () => this.replay());
  }

  updateVisuals() {
    const imgEl = document.getElementById("samaira-img-element");
    const rigEl = document.querySelector(".samaira-character-rig");
    const stageEl = document.querySelector(".samaira-animated-stage");
    const ringsEl = document.querySelector(".samaira-sound-rings");
    const bubbleWrapper = document.getElementById("samaira-bubble-wrapper");
    const speechContent = document.getElementById("samaira-speech-content");
    const emotionTag = document.getElementById("samaira-emotion-tag");
    const dot = document.querySelector(".dialogue-brand .status-indicator-dot");

    if (imgEl) {
      imgEl.src = this.getImageForState();
    }

    if (stageEl) {
      if (this.isSpeaking) {
        stageEl.classList.add("is-speaking");
        stageEl.classList.remove("is-idle");
      } else {
        stageEl.classList.add("is-idle");
        stageEl.classList.remove("is-speaking");
      }
    }

    if (ringsEl) {
      if (this.isSpeaking) ringsEl.classList.add("active");
      else ringsEl.classList.remove("active");
    }

    if (rigEl) {
      if (this.isSpeaking) {
        rigEl.classList.add("speaking-animation");
        rigEl.classList.remove("breathing-animation");
      } else {
        rigEl.classList.add("breathing-animation");
        rigEl.classList.remove("speaking-animation");
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
