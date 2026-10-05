export function renderCareerPathway(course, lang = "en-IN") {
  const isGu = lang.includes("gu");

  const stages = [
    {
      stage: 1,
      name: "Electrician",
      name_gu: "ઇલેક્ટ્રિશિયન",
      subtitle: "Apprentice / Entry Level",
      subtitle_gu: "એપ્રેન્ટિસ / પાયાનું વાયરિંગ",
      desc: "Foundational wiring, circuit installation, and basic repairs under supervision.",
      desc_gu: "પાયાનું ઘરગથ્થુ વાયરિંગ, સર્કિટ ફિટિંગ અને વરિષ્ઠ કારીગર સાથે તાલીમ."
    },
    {
      stage: 2,
      name: "Skilled Electrician",
      name_gu: "સ્કિલ્ડ ઇલેક્ટ્રિશિયન",
      subtitle: "Independent Technician",
      subtitle_gu: "સ્વતંત્ર ટેકનિશિયન",
      desc: "Independent multi-meter troubleshooting, single & 3-phase commercial panel installations.",
      desc_gu: "સ્વતંત્ર મલ્ટી-મીટર ડાયગ્નોસ્ટિક્સ, ૩-ફેઝ કંટ્રોલ પેનલ ઇન્સ્ટોલેશન અને મેન્ટેનન્સ."
    },
    {
      stage: 3,
      name: "Senior Technician",
      name_gu: "સીનિયર ટેકનિશિયન",
      subtitle: "Lead Specialist",
      subtitle_gu: "મુખ્ય ટેકનિકલ નિષ્ણાત",
      desc: "Industrial machinery diagnostics, motor controls, factory wiring, and leading junior wiremen.",
      desc_gu: "ઔદ્યોગિક મશીનરી ડાયગ્નોસ્ટિક્સ, મોટર કંટ્રોલ, ફેક્ટરી પ્લાન્ટ વાયરિંગ અને ટીમ લીડરશીપ."
    },
    {
      stage: 4,
      name: "Supervisor",
      name_gu: "સુપરવાઇઝર",
      subtitle: "Site Foreman / Coordinator",
      subtitle_gu: "સાઇટ ફોરમેન / સેફ્ટી ઇન્ચાર્જ",
      desc: "Project site management, electrical blueprint planning, safety compliance, and crew coordination.",
      desc_gu: "પ્રોજેક્ટ સાઇટ મેનેજમેન્ટ, બ્લુપ્રિન્ટ પ્લાનિંગ, સેફ્ટી કમ્પ્લાયન્સ અને ટીમ સંચાલન."
    },
    {
      stage: 5,
      name: "Specialised Technical Roles",
      name_gu: "નિષ્ણાત ટેકનિકલ રોલ્સ",
      subtitle: "Contractor / Automation / Solar Expert",
      subtitle_gu: "સરકારી લાયસન્સ કોન્ટ્રાક્ટર / સોલર એક્સપર્ટ",
      desc: "Substation specialist, PLC automation, grid solar integration, or licensed electrical business owner.",
      desc_gu: "સબ-સ્ટેશન એન્જિનિયર, PLC ઓટોમેશન, સોલર ગ્રીડ ઇન્સ્ટોલર અથવા સરકારી લાયસન્સ કોન્ટ્રાક્ટર."
    }
  ];

  return `
    <div class="glass-panel career-pathway-card" style="padding: 28px; margin: 24px 0; border: 1px solid rgba(99, 102, 241, 0.3);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
        <div>
          <span class="demo-tag" style="margin-bottom: 8px;">
            📈 ${isGu ? "કારકિર્દી પ્રગતિ સીડી" : "5-Stage Career Progression"}
          </span>
          <h3 style="font-size: 1.6rem; font-weight: 700; color: #fff;">
            ${isGu ? "ઇલેક્ટ્રિશિયન કારકિર્દી માર્ગ (Career Ladder)" : "Electrician Career Pathway"}
          </h3>
          <p style="color: var(--text-muted); font-size: 0.95rem; margin-top: 4px;">
            ${isGu 
              ? "ઇલેક્ટ્રિશિયન બનવાનો અર્થ એ નથી કે તમે આખી કારકિર્દી એક જ સ્તર પર રહો. જુઓ પ્રગતિનો સંપૂર્ણ માર્ગ:" 
              : "Becoming an electrician does not necessarily mean staying at the same level throughout your career. See the full upward pathway:"}
          </p>
        </div>
      </div>

      <div class="ladder-vertical-flow">
        ${stages.map((st, idx) => `
          <div class="ladder-stage-card" id="ladder-stage-${st.stage}">
            <div class="ladder-stage-num">${st.stage}</div>
            <div class="ladder-stage-content">
              <div class="ladder-stage-header">
                <h4 class="ladder-stage-title">${isGu ? st.name_gu : st.name}</h4>
                <span class="ladder-stage-sub">${isGu ? st.subtitle_gu : st.subtitle}</span>
              </div>
              <p class="ladder-stage-desc">${isGu ? st.desc_gu : st.desc}</p>
            </div>
          </div>
          ${idx < stages.length - 1 ? `
            <div class="ladder-flow-arrow">
              <span>↓</span>
            </div>
          ` : ''}
        `).join("")}
      </div>

      <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid var(--border-glass); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; gap: 8px; align-items: center; font-size: 0.9rem; color: #94a3b8;">
          <span>💡</span>
          <span>${isGu ? "દરેક તબક્કે અનુભવ અને સરકારી સર્ટિફિકેશન સાથે આવક અને જવાબદારી વધે છે." : "At each milestone, hands-on certifications and experience unlock higher salary and leadership."}</span>
        </div>
        <span class="demo-tag">${isGu ? "પ્રોટોટાઇપ સંદર્ભ" : "Prototype Reference"}</span>
      </div>
    </div>
  `;
}
