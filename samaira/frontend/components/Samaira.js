export class SamairaCharacter {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = options;
    this.currentState = "idle";
    this.currentEmotion = "welcoming";
    this.speechText = "";
    this.isSpeaking = false;
    this.speechSynthesis = window.speechSynthesis;
    this.currentUtterance = null;
    this.ttsEnabled = true;

    this.assetMap = {
      idle: "assets/samaira/samaira_standing_welcoming.png",
      welcoming: "assets/samaira/samaira_pose_welcoming.png",
      listening: "assets/samaira/samaira_face_listening.png",
      thinking: "assets/samaira/samaira_face_thoughtful.png",
      speaking: "assets/samaira/samaira_pose_explaining.png",
      explaining: "assets/samaira/samaira_pose_explaining.png",
      reassuring: "assets/samaira/samaira_face_reassuring.png",
      pointing: "assets/samaira/samaira_pose_pointing.png",
      happy: "assets/samaira/samaira_face_happy.png",
      concerned: "assets/samaira/samaira_face_concerned.png",
      showing_careers: "assets/samaira/samaira_scene_showing_careers.png",
      explaining_data: "assets/samaira/samaira_scene_explaining_data.png",
      building_confidence: "assets/samaira/samaira_scene_building_confidence.png",
      talking_parents: "assets/samaira/samaira_scene_talking_parents.png"
    };

    this.render();
  }

  setState(state, emotion = null) {
    this.currentState = state;
    if (emotion) this.currentEmotion = emotion;
    this.updateVisuals();
  }

  speak(text, emotion = "explaining", language = "en-IN") {
    this.speechText = text;
    this.currentEmotion = emotion;
    this.currentState = "speaking";
    this.isSpeaking = true;
    this.updateVisuals();

    // Voice Synthesis
    if (this.ttsEnabled && this.speechSynthesis) {
      this.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === "gu-IN" ? "gu-IN" : "en-IN";
      utterance.rate = 0.95;
      utterance.pitch = 1.05;

      utterance.onend = () => {
        this.isSpeaking = false;
        this.currentState = "idle";
        this.updateVisuals();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        this.currentState = "idle";
        this.updateVisuals();
      };

      this.currentUtterance = utterance;
      // Note: user gesture required on some browsers, handled gracefully
      try {
        this.speechSynthesis.speak(utterance);
      } catch (e) {
        // Fallback timer if speech blocked
        setTimeout(() => {
          this.isSpeaking = false;
          this.updateVisuals();
        }, Math.min(text.length * 50, 4000));
      }
    } else {
      setTimeout(() => {
        this.isSpeaking = false;
        this.updateVisuals();
      }, Math.min(text.length * 50, 4000));
    }
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
        </div>
        <div id="samaira-bubble-wrapper" class="samaira-speech-bubble" style="${this.speechText ? 'display: block;' : 'display: none;'}">
          <div class="speech-bubble-tail"></div>
          <div class="speech-status-bar">
            <div class="samaira-name-badge">
              <span class="status-indicator-dot"></span>
              <span>Samaira</span>
              ${this.isSpeaking ? `
                <div class="audio-wave">
                  <div class="wave-bar"></div>
                  <div class="wave-bar"></div>
                  <div class="wave-bar"></div>
                  <div class="wave-bar"></div>
                </div>
              ` : ''}
            </div>
            <div id="samaira-emotion-tag" class="speech-emotion-tag">
              ${this.currentEmotion}
            </div>
          </div>
          <div id="samaira-speech-content" class="speech-text">
            ${this.speechText}
          </div>
        </div>
      </div>
    `;
  }

  updateVisuals() {
    const imgEl = document.getElementById("samaira-img-element");
    const bubbleWrapper = document.getElementById("samaira-bubble-wrapper");
    const speechContent = document.getElementById("samaira-speech-content");
    const emotionTag = document.getElementById("samaira-emotion-tag");

    if (imgEl) {
      imgEl.src = this.getImageForState();
      if (this.isSpeaking) {
        imgEl.classList.add("speaking");
      } else {
        imgEl.classList.remove("speaking");
      }
    }

    if (bubbleWrapper && speechContent && emotionTag) {
      if (this.speechText) {
        bubbleWrapper.style.display = "block";
        speechContent.innerHTML = this.speechText;
        emotionTag.textContent = this.currentEmotion;
      } else {
        bubbleWrapper.style.display = "none";
      }
    }
  }
}
