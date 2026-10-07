export function renderCounsellorModal(isOpen, lang = "en-IN", course = null, onSubmitSuccess = null) {
  if (!isOpen) return "";
  const isGu = lang.includes("gu");
  const tradeName = course ? (isGu ? course.trade_name_gu : course.trade_name) : "Vocational Education";

  return `
    <div id="counsellor-modal-overlay" class="escalate-modal-overlay">
      <div class="escalate-modal">
        <button id="modal-close-btn" class="modal-close-btn">✕</button>

        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 2.2rem; margin-bottom: 8px;">👨‍🏫</div>
          <h3 style="font-size: 1.6rem; font-weight: 700; margin-bottom: 6px;">
            ${isGu ? "માનવ કારકિર્દી કાઉન્સેલર સાથે વાત કરો" : "Connect with a Human Career Counsellor"}
          </h3>
          <p style="font-size: 0.92rem; color: var(--text-muted);">
            ${isGu ? `તમારા પરિવાર અને ${tradeName} માટે નિષ્ણાત માર્ગદર્શન મેળવો.` : `Personalized 1-on-1 guidance for your family regarding ${tradeName}.`}
          </p>
        </div>

        <div style="display: flex; gap: 8px; margin-bottom: 20px; background: rgba(255, 255, 255, 0.05); padding: 4px; border-radius: var(--radius-md);">
          <button id="modal-tab-call" class="env-tab-btn active" style="flex: 1; padding: 8px;">
            📞 ${isGu ? "કૉલબેક" : "Callback"}
          </button>
          <button id="modal-tab-session" class="env-tab-btn" style="flex: 1; padding: 8px;">
            📅 ${isGu ? "લાઈવ સત્ર" : "Live Session"}
          </button>
          <button id="modal-tab-query" class="env-tab-btn" style="flex: 1; padding: 8px;">
            ✉️ ${isGu ? "લેખિત પ્રશ્ન" : "Written Query"}
          </button>
        </div>

        <form id="escalation-form">
          <input type="hidden" id="escalation-type" value="call" />
          <input type="hidden" id="escalation-course-id" value="${course ? course.course_id : 'VOC001'}" />

          <div class="form-group">
            <label class="form-label">${isGu ? "વાલી / વિદ્યાર્થીનું પૂરું નામ" : "Parent / Student Full Name"}</label>
            <input type="text" id="escalation-name" class="custom-input" placeholder="${isGu ? 'દા.ત. રમેશભાઈ પટેલ' : 'e.g. Ramesh Patel'}" required />
          </div>

          <div class="form-group">
            <label class="form-label">${isGu ? "મોબાઇલ નંબર (વોટ્સએપ)" : "Mobile Phone Number (WhatsApp)"}</label>
            <input type="tel" id="escalation-phone" class="custom-input" placeholder="+91 98250 00000" required />
          </div>

          <div class="form-group">
            <label class="form-label">${isGu ? "તમારો મુખ્ય પ્રશ્ન અથવા અનુકૂળ સમય" : "Preferred Time or Specific Question"}</label>
            <textarea id="escalation-notes" class="custom-input" rows="3" placeholder="${isGu ? 'દા.ત. સરકારી ITI પ્રવેશ અને ફી વિશે માહિતી જોઈએ છે...' : 'e.g. Guidance on government ITI admission and scholarships...'}"></textarea>
          </div>

          <div id="escalation-status-msg" style="display: none; padding: 12px; border-radius: var(--radius-sm); margin-bottom: 16px; font-size: 0.9rem;"></div>

          <button type="submit" id="btn-submit-escalation" class="btn-primary" style="width: 100%; justify-content: center;">
            ${isGu ? "વિનંતી સબમિટ કરો (નિઃશુલ્ક)" : "Confirm Free Counsellor Connection"}
          </button>
        </form>
      </div>
    </div>
  `;
}
