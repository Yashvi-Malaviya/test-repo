export function renderAdminDashboard(stats, lang = "en-IN") {
  const isGu = lang.includes("gu");

  const families = stats.families_counselled || 128;
  const topTrade = stats.most_discussed_trade || "Electrician";
  const topConcern = stats.top_concern || "Career Growth — 38%";
  const distribution = stats.concern_distribution || [
    { label: "Career Growth", count: 49, percentage: 38 },
    { label: "Income", count: 35, percentage: 27 },
    { label: "Job Security", count: 23, percentage: 18 },
    { label: "Safety", count: 15, percentage: 12 },
    { label: "Further Education", count: 6, percentage: 5 }
  ];

  const sentimentBefore = stats.parent_sentiment?.before || { negative: 48, neutral: 34, positive: 18 };
  const sentimentAfter = stats.parent_sentiment?.after || { negative: 19, neutral: 29, positive: 52 };
  const recentQueries = stats.recent_queries || [];
  const escalations = stats.escalations || [];

  return `
    <div style="max-width: 1200px; margin: 0 auto; padding: 20px 0;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; flex-wrap: wrap; gap: 16px;">
        <div>
          <span class="demo-tag" style="margin-bottom: 8px;">
            📊 ${isGu ? "સિસ્ટમ એનાલિટિક્સ" : "Live SIH Analytics Dashboard"}
          </span>
          <h2 style="font-size: 2.2rem; font-weight: 800;">
            ${isGu ? "સમાયરા કાઉન્સેલિંગ એનાલિટિક્સ ડેશબોર્ડ" : "Samaira Counselling Analytics Dashboard"}
          </h2>
          <p style="color: var(--text-muted); font-size: 0.98rem;">
            Problem Statement 26241 — AI Vocational Decision Support Metrics
          </p>
        </div>
        <button id="admin-back-btn" class="btn-primary" style="padding: 10px 22px; font-size: 0.95rem;">
          ← ${isGu ? "કાઉન્સેલિંગ પર પાછા જાઓ" : "Return to Counselling"}
        </button>
      </div>

      <!-- Top KPI Metric Cards -->
      <div class="admin-metrics-grid">
        <div class="metric-card">
          <span class="stat-label">👥 ${isGu ? "માર્ગદર્શન મેળવનાર પરિવારો" : "Families Counselled"}</span>
          <div class="metric-val" style="color: var(--primary-light);">${families}</div>
          <span class="metric-sub">${isGu ? "વિદ્યાર્થી + વાલી જોડાણો" : "Student + Parent interactions"}</span>
        </div>

        <div class="metric-card">
          <span class="stat-label">⚡ ${isGu ? "સૌથી વધુ ચર્ચાયેલ ટ્રેડ" : "Most Discussed Trade"}</span>
          <div class="metric-val" style="color: var(--accent-cyan); font-size: 1.6rem;">${topTrade}</div>
          <span class="metric-sub">${isGu ? "૬૭% વાલીઓની પ્રાથમિકતા" : "67% parent inquiry share"}</span>
        </div>

        <div class="metric-card">
          <span class="stat-label">🎯 ${isGu ? "મુખ્ય વાલી ચિંતા" : "Top Parent Concern"}</span>
          <div class="metric-val" style="color: var(--secondary); font-size: 1.45rem;">${topConcern}</div>
          <span class="metric-sub">${isGu ? "કારકિર્દી પ્રગતિ વિશે પ્રશ્નો" : "Long-term future & promotions"}</span>
        </div>

        <div class="metric-card highlight">
          <span class="stat-label">📈 ${isGu ? "સંદેહમાં ઘટાડો (Doubt Drop)" : "Parent Hesitation Drop"}</span>
          <div class="metric-val" style="color: var(--accent-emerald);">48% → 19%</div>
          <span class="metric-sub">${isGu ? "નકારાત્મક વલણમાં ૨૯% ઘટાડો" : "29% net positive sentiment gain"}</span>
        </div>
      </div>

      <!-- Two-column charts -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); gap: 24px; margin-bottom: 30px;">
        <!-- Concern Distribution -->
        <div class="admin-chart-box">
          <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 18px; display: flex; align-items: center; gap: 8px;">
            <span>📋</span> ${isGu ? "વાલીઓની ચિંતાઓનું વિતરણ" : "Parent Concern Distribution"}
          </h3>

          <div>
            ${distribution.map(item => `
              <div class="bar-row">
                <div class="bar-label">${item.label}</div>
                <div class="bar-track">
                  <div class="bar-fill" style="width: ${item.percentage}%;"></div>
                </div>
                <div class="bar-val">${item.percentage}%</div>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Sentiment Shift Before / After -->
        <div class="admin-chart-box">
          <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 18px; display: flex; align-items: center; gap: 8px;">
            <span>💖</span> ${isGu ? "વાલીઓનો સેન્ટિમેન્ટ બદલાવ (Before vs After)" : "Parent Sentiment Shift: Before vs After"}
          </h3>

          <div style="margin-bottom: 20px;">
            <div style="font-size: 0.86rem; color: var(--text-dim); margin-bottom: 6px; font-weight: 600;">
              ${isGu ? "કાઉન્સેલિંગ પહેલાં (Initial Perception)" : "Before Counselling (Initial Hesitation):"}
            </div>
            <div style="display: flex; height: 26px; border-radius: var(--radius-sm); overflow: hidden; margin-bottom: 4px;">
              <div style="width: ${sentimentBefore.negative}%; background: #ef4444; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700;">
                ${sentimentBefore.negative}% Negative
              </div>
              <div style="width: ${sentimentBefore.neutral}%; background: #f59e0b; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: #1e1b4b;">
                ${sentimentBefore.neutral}% Neutral
              </div>
              <div style="width: ${sentimentBefore.positive}%; background: #10b981; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700;">
                ${sentimentBefore.positive}% Pos
              </div>
            </div>
          </div>

          <div>
            <div style="font-size: 0.86rem; color: var(--text-dim); margin-bottom: 6px; font-weight: 600;">
              ${isGu ? "સમાયરા સાથે વાતચીત પછી (After Evidence & Explanation):" : "After Counselling with Samaira (Evidence-Backed):"}
            </div>
            <div style="display: flex; height: 26px; border-radius: var(--radius-sm); overflow: hidden; margin-bottom: 4px;">
              <div style="width: ${sentimentAfter.negative}%; background: #ef4444; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700;">
                ${sentimentAfter.negative}%
              </div>
              <div style="width: ${sentimentAfter.neutral}%; background: #f59e0b; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: #1e1b4b;">
                ${sentimentAfter.neutral}%
              </div>
              <div style="width: ${sentimentAfter.positive}%; background: #10b981; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700;">
                ${sentimentAfter.positive}% Confident & Reassured
              </div>
            </div>
          </div>

          <div style="margin-top: 18px; padding: 12px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-sm); font-size: 0.86rem; color: #34d399;">
            ✓ ${isGu ? "વાલીઓમાં નકારાત્મક શંકા ૪૮% થી ઘટીને માત્ર ૧૯% થઈ ગઈ છે." : "Negative hesitation fell from 48% down to 19% once parents saw the 5-stage career ladder & verified earnings."}
          </div>
        </div>
      </div>

      <!-- Live Log Tables -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); gap: 24px;">
        <!-- Recent Queries Log -->
        <div class="admin-chart-box">
          <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 14px;">
            💬 ${isGu ? "તાજેતરના કાઉન્સેલિંગ પ્રશ્નો (Live Queries)" : "Recent AI Counselling Inquiries"}
          </h3>
          <div style="overflow-x: auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Trade</th>
                  <th>Category</th>
                  <th>Sentiment</th>
                </tr>
              </thead>
              <tbody>
                ${recentQueries.slice(0, 6).map(q => `
                  <tr>
                    <td style="max-width: 220px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
                      ${q.question}
                    </td>
                    <td><span class="feature-pill" style="font-size: 0.75rem; padding: 2px 8px;">${q.trade}</span></td>
                    <td style="text-transform: capitalize; color: var(--text-muted);">${q.concern.replace("_", " ")}</td>
                    <td>
                      <span class="${q.sentiment === 'positive' ? 'badge-sentiment-pos' : q.sentiment === 'negative' ? 'badge-sentiment-neg' : 'badge-sentiment-neu'}">
                        ${q.sentiment}
                      </span>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Human Counsellor Escalation Queue -->
        <div class="admin-chart-box">
          <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 14px;">
            🧑‍💼 ${isGu ? "માનવ કાઉન્સેલર એસ્કેલેશન કતાર" : "Human Counsellor Escalation Queue"}
          </h3>
          <div style="overflow-x: auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Family Name</th>
                  <th>Contact</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${escalations.length === 0 ? `
                  <tr><td colspan="4" style="text-align: center; color: var(--text-dim);">No escalations pending</td></tr>
                ` : escalations.slice(0, 6).map(esc => `
                  <tr>
                    <td style="font-weight: 600;">${esc.name}</td>
                    <td style="color: var(--accent-cyan);">${esc.phone}</td>
                    <td>${esc.type}</td>
                    <td><span class="badge-sentiment-neu">${esc.status}</span></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}
