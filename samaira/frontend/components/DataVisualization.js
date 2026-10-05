export function renderDataVisualization(course, lang = "en-IN") {
  const isGu = lang.includes("gu");

  return `
    <div class="glass-panel income-data-card" style="padding: 28px; margin: 24px 0; border: 1px solid rgba(16, 185, 129, 0.3);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
        <div>
          <span class="demo-tag" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); margin-bottom: 8px;">
            ⚠️ ${isGu ? "પ્રોટોટાઇપ / ડેમો ડેટાસેટ" : "Prototype / Demo Dataset"}
          </span>
          <h3 style="font-size: 1.6rem; font-weight: 700; color: #fff;">
            ${isGu ? "ઇલેક્ટ્રિશિયન આવક અને પ્લેસમેન્ટ આંકડા" : "Electrician Income & Placement Benchmarks"}
          </h3>
          <p style="color: var(--text-muted); font-size: 0.95rem; margin-top: 4px;">
            ${isGu 
              ? "આવક અનુભવ, સ્થળ, કૌશલ્ય અને કંપની મુજબ બદલાઈ શકે છે. આ પ્રોટોટાઇપ માટે ઉપલબ્ધ ડેમો ડેટા નીચે મુજબ છે:" 
              : "Income can vary depending on experience, location, skills and employer. For this prototype, here is the available demo data:"}
          </p>
        </div>
      </div>

      <div class="salary-cards-grid">
        <div class="metric-card">
          <span class="stat-label">${isGu ? "શરૂઆતની કમાણી" : "Starting Earnings"}</span>
          <div class="metric-val" style="color: var(--primary-light); font-size: 1.8rem; font-weight: 800;">
            ₹14,000–₹18,000
          </div>
          <span class="metric-sub">${isGu ? "પ્રતિ માસ (એન્ટ્રી-લેવલ)" : "/ month (Entry Level)"}</span>
        </div>

        <div class="metric-card highlight">
          <span class="stat-label">${isGu ? "અનુભવી કમાણી" : "Experienced Earnings"}</span>
          <div class="metric-val" style="color: var(--accent-emerald); font-size: 1.8rem; font-weight: 800;">
            ₹25,000–₹35,000
          </div>
          <span class="metric-sub">${isGu ? "પ્રતિ માસ (૨ થી ૫ વર્ષ અનુભવ)" : "/ month (2–5 Years Experience)"}</span>
        </div>

        <div class="metric-card">
          <span class="stat-label">${isGu ? "પ્લેસમેન્ટ સહાયતા દર" : "Placement Rate"}</span>
          <div class="metric-val" style="color: var(--accent-cyan); font-size: 1.8rem; font-weight: 800;">
            76%
          </div>
          <span class="metric-sub">${isGu ? "ડેમો ડેટાસેટ મુજબ નોંધાયેલ" : "Recorded in Demo Dataset"}</span>
        </div>
      </div>

      <div style="background: rgba(255, 255, 255, 0.03); border-radius: var(--radius-md); padding: 16px 20px; margin-top: 20px; border-left: 4px solid #fbbf24;">
        <div style="font-size: 0.88rem; color: #fde68a; font-weight: 600; margin-bottom: 4px;">
          📌 ${isGu ? "પ્રોટોટાઇપ / ડેમો ડેટાસેટ ઘોષણા" : "Prototype / Demo Dataset Notice"}
        </div>
        <div style="font-size: 0.84rem; color: #cbd5e1; line-height: 1.5;">
          ${isGu
            ? "આ આંકડા આ પ્રોટોટાઇપ ડેમો માટે સિન્થેટિક ડેટાસેટ આધારિત છે અને સત્તાવાર સરકારી આંકડા નથી. વાસ્તવિક આવક ઉમેદવારના ટેકનિકલ કૌશલ્ય, સરકારી લાઇસન્સિંગ અને સ્થાનિક ઔદ્યોગિક બજાર સ્થિતિ પર નિર્ભર કરે છે."
            : "These figures are synthetic benchmark metrics from the prototype demo dataset and are not official government statistics. Actual income depends on candidate skills, licensed certifications, and local industrial market conditions."}
        </div>
      </div>
    </div>
  `;
}
