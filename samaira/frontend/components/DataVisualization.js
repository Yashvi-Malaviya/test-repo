export function renderDataVisualization(course, lang = "en-IN") {
  const isGu = lang.includes("gu");

  return `
    <div class="glass-panel" style="padding: 28px; margin: 24px 0;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
        <div>
          <span class="demo-tag" style="margin-bottom: 8px;">
            ⚠️ ${isGu ? "પ્રોટોટાઇપ / ડેમો ડેટાસેટ" : "Prototype / Demo Dataset"}
          </span>
          <h3 style="font-size: 1.6rem; font-weight: 700;">
            ${isGu ? "કમાણી અને પ્લેસમેન્ટ આંકડા (Earnings & Outcomes)" : "Earnings & Placement Benchmarks"}
          </h3>
          <p style="color: var(--text-muted); font-size: 0.95rem;">
            ${isGu ? "નીચે દર્શાવેલ પગાર અને પ્લેસમેન્ટ આંકડા ડેમો મોડલ માટે છે. સરકારી ડેટાસેટ સાથે સરખામણી કરી શકાય છે." : "Official placement and salary benchmarks for this trade. All figures explicitly labeled as Prototype / Demo Dataset."}
          </p>
        </div>
      </div>

      <div class="salary-cards-grid">
        <div class="metric-card">
          <span class="stat-label">${isGu ? "શરૂઆતની માસિક કમાણી" : "Starting Monthly Earnings"}</span>
          <div class="metric-val" style="color: var(--primary-light);">
            ${course.demo_starting_earnings_monthly}
          </div>
          <span class="metric-sub">${isGu ? "પ્રથમ ૦-૨ વર્ષ દરમિયાન" : "Entry-level / First 0–2 years"}</span>
        </div>

        <div class="metric-card highlight">
          <span class="stat-label">${isGu ? "અનુભવી ટેકનિશિયન પગાર" : "Experienced Technician (3–5 Yrs)"}</span>
          <div class="metric-val" style="color: var(--accent-emerald);">
            ${course.demo_experienced_earnings_monthly}
          </div>
          <span class="metric-sub">${isGu ? "કુશળ કારીગર / ટીમ લીડર" : "Skilled Specialist / Lead"}</span>
        </div>

        <div class="metric-card">
          <span class="stat-label">${isGu ? "સ્વતંત્ર કોન્ટ્રાક્ટર ક્ષમતા" : "Independent Contractor Potential"}</span>
          <div class="metric-val" style="color: var(--accent-amber);">
            ${course.contractor_potential_monthly || "₹50,000–₹1,00,000+"}
          </div>
          <span class="metric-sub">${isGu ? "પોતાનો બિઝનેસ / સરકારી લાયસન્સ" : "Licensed enterprise contracts"}</span>
        </div>

        <div class="metric-card">
          <span class="stat-label">${isGu ? "ડેમો પ્લેસમેન્ટ સહાય" : "Demo Placement Assistance"}</span>
          <div class="metric-val" style="color: var(--accent-cyan);">
            ${course.demo_placement_rate}
          </div>
          <span class="metric-sub">${isGu ? "ITI / કેમ્પસ ડ્રાઇવ્સ દ્વારા" : "Campus & apprentice drives"}</span>
        </div>
      </div>

      <div style="background: rgba(255, 255, 255, 0.03); border-radius: var(--radius-md); padding: 18px; margin-top: 20px;">
        <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 12px; color: #e2e8f0;">
          🏢 ${isGu ? "મુખ્ય રોજગાર ક્ષેત્રો અને ઉદ્યોગો (Hiring Industries):" : "Key Employment Sectors & Hiring Industries:"}
        </h4>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${(isGu ? course.industries_gu || course.industries : course.industries).map(ind => `
            <span class="feature-pill" style="border-color: rgba(99, 102, 241, 0.3);">
              ✓ ${ind}
            </span>
          `).join("")}
        </div>
      </div>

      <div style="margin-top: 18px; font-size: 0.8rem; color: var(--text-dim); text-align: center;">
        * ${isGu ? "સંદર્ભ: પ્રોટોટાઇપ ડેટાસેટ (Problem Statement 26241). વાસ્તવિક પ્લેસમેન્ટ કંપની અને સ્થાનિક બજાર સ્થિતિ પર નિર્ભર છે." : "Reference: Prototype Dataset (Problem Statement 26241). Actual placement depends on trainee skill and regional demand."}
      </div>
    </div>
  `;
}
