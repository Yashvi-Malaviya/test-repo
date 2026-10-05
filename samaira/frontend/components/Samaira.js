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
    this.setupAudioUnlock();
    this.render();
  }

  setupAudioUnlock() {
    if (typeof window === "undefined") return;
    const unlock = () => {
      if (this.speechSynthesis) {
        this.voices = this.speechSynthesis.getVoices() || [];
        if (this.speechSynthesis.paused) {
          try { this.speechSynthesis.resume(); } catch (e) {}
        }
        if (this.pendingUtterance && this.voices.length > 0) {
          const { text, emotion, language } = this.pendingUtterance;
          this.pendingUtterance = null;
          this.speak(text, emotion, language);
        }
      }
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
    };
    window.addEventListener("click", unlock, { once: true, passive: true });
    window.addEventListener("touchstart", unlock, { once: true, passive: true });
  }

  initVoices() {
    if (!this.speechSynthesis) return;
    const load = () => {
      const v = this.speechSynthesis.getVoices() || [];
      if (v.length > 0) {
        this.voices = v;
        if (this.pendingUtterance) {
          const { text, emotion, language } = this.pendingUtterance;
          this.pendingUtterance = null;
          this.speak(text, emotion, language);
        }
      }
    };
    load();
    if (this.speechSynthesis.onvoiceschanged !== undefined) {
      this.speechSynthesis.onvoiceschanged = load;
    }
  }

  attachTo(containerId) {
    const el = document.getElementById(containerId);
    if (el) {
      this.container = el;
      this.render();
      this.updateVisuals();
    }
  }

  getBestVoice(language) {
    if (!this.voices || this.voices.length === 0) {
      if (this.speechSynthesis) this.voices = this.speechSynthesis.getVoices() || [];
    }
    if (!this.voices || this.voices.length === 0) return null;

    const isGu = language && language.toLowerCase().includes("gu");

    // Known female names to match:
    const femaleKeywords = [
      "zira", "heera", "neerja", "veena", "priya", "swara", "kalpana",
      "jenny", "aria", "sonia", "samantha", "victoria", "karen", "female",
      "woman", "girl", "natasha", "libby", "clara", "emma", "amy", "joanna"
    ];
    // Male names to strictly blacklist:
    const maleKeywords = [
      "david", "mark", "george", "male", "ravi", "richard", "james", "guy",
      "stefan", "paul", "matthew", "brian", "justin", "russell"
    ];

    const isMale = (v) => {
      const name = (v.name || "").toLowerCase();
      return maleKeywords.some(m => name.includes(m));
    };

    const isFemale = (v) => {
      const name = (v.name || "").toLowerCase();
      return femaleKeywords.some(f => name.includes(f));
    };

    if (isGu) {
      // 1. Direct Gujarati voice
      const guVoice = this.voices.find(v => 
        (v.lang && (v.lang.toLowerCase().includes("gu") || v.lang.toLowerCase() === "gu-in")) ||
        (v.name && v.name.toLowerCase().includes("gujarati"))
      );
      if (guVoice) return guVoice;

      // 2. Hindi female voice (Swara, Kalpana)
      const hiFemale = this.voices.find(v => 
        (v.lang && (v.lang.toLowerCase().includes("hi") || v.lang.toLowerCase() === "hi-in")) && isFemale(v)
      );
      if (hiFemale) return hiFemale;

      // 3. Any Hindi voice
      const hiVoice = this.voices.find(v => 
        (v.lang && (v.lang.toLowerCase().includes("hi") || v.lang.toLowerCase() === "hi-in")) ||
        (v.name && v.name.toLowerCase().includes("hindi"))
      );
      if (hiVoice) return hiVoice;

      // 4. Indian English female
      const inFemale = this.voices.find(v => 
        (v.lang && v.lang.toLowerCase().includes("en-in")) && isFemale(v)
      );
      if (inFemale) return inFemale;

      // 5. Any female voice (Zira, etc.)
      const femaleFallback = this.voices.find(v => isFemale(v));
      if (femaleFallback) return femaleFallback;

      return this.voices.find(v => !isMale(v)) || this.voices[0];
    } else {
      // ENGLISH: STRICT FEMALE VOICE!
      // 1. Indian English Female voice (Heera, Neerja, Veena, Priya)
      const inFemale = this.voices.find(v => 
        v.lang && v.lang.toLowerCase().includes("en-in") && isFemale(v)
      );
      if (inFemale) return inFemale;

      // 2. High quality natural English Female voice (Zira, Jenny, Aria, Sonia, Google US/UK Female)
      const enFemale = this.voices.find(v => 
        v.lang && v.lang.toLowerCase().startsWith("en") && isFemale(v)
      );
      if (enFemale) return enFemale;

      // 3. ANY voice with female keyword anywhere
      const anyFemale = this.voices.find(v => isFemale(v));
      if (anyFemale) return anyFemale;

      // 4. Any English voice that is NOT male
      const nonMaleEn = this.voices.find(v => 
        v.lang && v.lang.toLowerCase().startsWith("en") && !isMale(v)
      );
      if (nonMaleEn) return nonMaleEn;

      // 5. Explicit check for Zira on Windows
      const zira = this.voices.find(v => (v.name || "").toLowerCase().includes("zira"));
      if (zira) return zira;

      // 6. Non-male voice fallback
      return this.voices.find(v => !isMale(v)) || this.voices[0] || null;
    }
  }

  setState(state, emotion = null) {
    this.currentState = state;
    if (emotion) this.currentEmotion = emotion;
    this.updateVisuals();
  }

  speak(text, emotion = "explaining", language = "en-IN") {
    if (!text) return;
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
      }, Math.min(Math.max(text.length * 40, 1800), 4500));
      return;
    }

    // If voices are not yet ready, defer to pendingUtterance
    if (!this.voices || this.voices.length === 0) {
      this.voices = this.speechSynthesis.getVoices() || [];
      if (this.voices.length === 0) {
        this.pendingUtterance = { text, emotion, language };
        return;
      }
    }

    try {
      // Resume if browser suspended TTS
      if (this.speechSynthesis.paused) {
        try { this.speechSynthesis.resume(); } catch (e) {}
      }
      if (this.speechSynthesis.speaking || this.speechSynthesis.pending) {
        this.speechSynthesis.cancel();
      }

      const isGu = language && language.toLowerCase().includes("gu");

      // Format text phonetically for natural, clear pronunciation
      const cleanText = text
        .replace(/[*#_`~]/g, "")
        .replace(/•/g, "")
        .replace(/₹\s*(\d+)/g, isGu ? "$1 રૂપિયા" : "$1 rupees")
        .replace(/₹/g, isGu ? "રૂપિયા " : "rupees ")
        .replace(/(\d+),(\d+)/g, "$1$2")
        .replace(/\s+/g, " ")
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const selectedVoice = this.getBestVoice(language);

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang || (isGu ? "gu-IN" : "en-US");
      } else {
        utterance.lang = isGu ? "gu-IN" : "en-US";
      }

      // FEMALE PITCH & LIVELY SPEED:
      // For English: pitch 1.18 gives a distinctly warm, pleasant, and feminine counselling tone!
      utterance.pitch = isGu ? 1.12 : 1.18;
      utterance.rate = isGu ? 1.06 : 1.08;

      // Prevent garbage collection bug in Chromium
      if (typeof window !== "undefined") {
        window._samairaActiveUtterances = window._samairaActiveUtterances || new Set();
        window._samairaActiveUtterances.add(utterance);
      }

      utterance.onend = () => {
        if (typeof window !== "undefined" && window._samairaActiveUtterances) {
          window._samairaActiveUtterances.delete(utterance);
        }
        this.isSpeaking = false;
        this.currentState = "idle";
        this.updateVisuals();
      };

      utterance.onerror = (e) => {
        if (typeof window !== "undefined" && window._samairaActiveUtterances) {
          window._samairaActiveUtterances.delete(utterance);
        }
        if (e.error !== "canceled" && e.error !== "interrupted") {
          console.warn("Speech synthesis notice:", e);
        }
        this.isSpeaking = false;
        this.currentState = "idle";
        this.updateVisuals();
      };

      this.currentUtterance = utterance;

      // 60ms delay ensures audio buffer reset and prevents Chromium cancel-before-speak race bug
      setTimeout(() => {
        try {
          if (this.speechSynthesis.paused) this.speechSynthesis.resume();
          this.speechSynthesis.speak(utterance);
        } catch (err) {
          console.warn("Speech synthesis speak call error:", err);
          this.isSpeaking = false;
          this.currentState = "idle";
          this.updateVisuals();
        }
      }, 60);
    } catch (err) {
      console.warn("Speech synthesis trigger error:", err);
      setTimeout(() => {
        this.isSpeaking = false;
        this.currentState = "idle";
        this.updateVisuals();
      }, 2500);
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

    // Sync workplace environment inside-scene character & dialogue box if present
    const sceneImg = document.getElementById("scene-samaira-img");
    const sceneTag = document.getElementById("scene-samaira-tag");
    const sceneSpeech = document.getElementById("scene-speech-text");
    const sceneWave = document.querySelector(".scene-speech-box .audio-wave");
    const sceneDot = document.querySelector(".scene-speech-box .status-indicator-dot");

    if (sceneImg) {
      sceneImg.src = this.getImageForState();
    }
    if (sceneTag) {
      sceneTag.textContent = this.getEmotionLabel();
    }
    if (sceneSpeech && this.speechText) {
      sceneSpeech.innerHTML = this.speechText;
    }
    if (sceneWave) {
      sceneWave.style.display = this.isSpeaking ? "flex" : "none";
    }
    if (sceneDot) {
      if (this.isSpeaking) sceneDot.classList.add("speaking-dot");
      else sceneDot.classList.remove("speaking-dot");
    }
  }
}
