export function renderCareerPathway(course, lang = "en-IN") {
  const isGu = lang.includes("gu");
  const pathways = course.career_growth || [];

  return `
    <div class="glass-panel" style="padding: 28px; margin: 24px 0;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
        <div>
          <span class="demo-tag" style="margin-bottom: 8px;">
            <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#f59e0b;"></span>
            ${isGu ? "પ્રોટોટાઇપ સંદર્ભ પાથવે" : "Prototype Reference Pathway"}
          </span>
          <h3 style="font-size: 1.6rem; font-weight: 700;">
            ${isGu ? "કારકિર્દી પ્રગતિ સીડી (Career Growth Pathway)" : "Standard Career Progression Pathway"}
          </h3>
          <p style="color: var(--text-muted); font-size: 0.95rem;">
            ${isGu ? "વોકેશનલ તાલીમ અટકતી નથી! જુઓ વિદ્યાર્થી એપ્રેન્ટિસથી શરૂ કરી લાઇસન્સ ધારક કોન્ટ્રાક્ટર સુધી કેવી રીતે આગળ વધે છે." : "Vocational education provides a continuous career escalator. See how practical mastery advances into supervisory and licensed leadership."}
          </p>
        </div>
      </div>

      <div class="pathway-container">
        ${pathways.map((step, idx) => `
          <div class="pathway-step" id="pathway-step-${step.stage}">
            <div class="pathway-step-badge">
              ${step.stage}
            </div>
            <div class="pathway-step-info">
              <h4>${isGu ? step.role_gu || step.role : step.role}</h4>
              <p>${step.focus}</p>
            </div>
            <div class="pathway-step-meta">
              <span>⏱️ ${step.experience}</span>
            </div>
          </div>
        `).join("")}
      </div>

      <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border-glass); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; gap: 10px; align-items: center;">
          <span style="font-size: 1.2rem;">🎓</span>
          <span style="font-size: 0.9rem; color: #cbd5e1;">
            <strong>${isGu ? "ઉચ્ચ અભ્યાસ તકો:" : "Further Learning Route:"}</strong>
            ${isGu ? (course.further_learning_gu || course.further_learning).slice(0, 2).join(", ") : course.further_learning.slice(0, 2).join(", ")}
          </span>
        </div>
        <button id="btn-pathway-ask" class="btn-secondary" style="padding: 8px 16px; font-size: 0.88rem;">
          ${isGu ? "સમાયરાને આ પાથવે વિશે પૂછો" : "Ask Samaira About This Pathway"}
        </button>
      </div>
    </div>
  `;
}
