/**
 * renderer.js
 * 解析結果をDOMに描画する
 */

const Renderer = (() => {

  // ゲージアニメーション用タイマー
  let gaugeAnimTimer = null;

  /**
   * スコアゲージをアニメーションで描画する
   */
  function animateGauge(targetScore) {
    const circle = document.getElementById('score-circle');
    const scoreNum = document.getElementById('score-number');
    if (!circle || !scoreNum) return;

    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    circle.style.strokeDasharray = circumference;

    let current = 0;
    const duration = 1200;
    const startTime = performance.now();

    if (gaugeAnimTimer) cancelAnimationFrame(gaugeAnimTimer);

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      current = Math.round(targetScore * eased);

      scoreNum.textContent = current;
      const offset = circumference - (current / 100) * circumference;
      circle.style.strokeDashoffset = offset;

      // スコアに応じて色とラベル変更
      const marketLabel = document.getElementById('market-value-label');
      if (current >= 80) {
        circle.style.stroke = 'url(#gradient-excellent)';
        if (marketLabel) { marketLabel.textContent = '市場価値：高'; marketLabel.className = 'market-value-label high'; }
      } else if (current >= 60) {
        circle.style.stroke = 'url(#gradient-good)';
        if (marketLabel) { marketLabel.textContent = '市場価値：中'; marketLabel.className = 'market-value-label mid'; }
      } else {
        circle.style.stroke = 'url(#gradient-poor)';
        if (marketLabel) { marketLabel.textContent = '市場価値：低'; marketLabel.className = 'market-value-label low'; }
      }

      if (progress < 1) {
        gaugeAnimTimer = requestAnimationFrame(step);
      }
    }

    gaugeAnimTimer = requestAnimationFrame(step);
  }

  /**
   * 内訳バーを描画する
   */
  function renderBreakdown(breakdown) {
    const config = [
      { key: 'techSkill', label: '技術力', max: 25 },
      { key: 'process', label: '工程経験', max: 15 },
      { key: 'upstream', label: '上流経験', max: 10 },
      { key: 'rarity', label: '希少性', max: 15 },
      { key: 'marketFit', label: '市場適合性', max: 15 },
      { key: 'condition', label: '条件適合', max: 10 },
      { key: 'sheetQuality', label: 'シート品質', max: 10 },
    ];

    const container = document.getElementById('breakdown-bars');
    if (!container) return;
    container.innerHTML = '';

    config.forEach(({ key, label, max }) => {
      const val = breakdown[key] || 0;
      const pct = Math.round((val / max) * 100);
      const colorClass = pct >= 80 ? 'bar-excellent' : pct >= 50 ? 'bar-good' : 'bar-poor';

      container.insertAdjacentHTML('beforeend', `
        <div class="bar-item">
          <div class="bar-label">
            <span>${label}</span>
            <span class="bar-score">${val}<span class="bar-max">/${max}</span></span>
          </div>
          <div class="bar-track">
            <div class="bar-fill ${colorClass}" data-width="${pct}" style="width:0%"></div>
          </div>
        </div>
      `);
    });

    // アニメーション
    setTimeout(() => {
      container.querySelectorAll('.bar-fill').forEach(el => {
        el.style.width = el.dataset.width + '%';
      });
    }, 100);
  }

  /**
   * 判定バッジを描画する
   */
  function renderVerdict(verdict) {
    const el = document.getElementById('verdict-badge');
    if (!el) return;
    el.className = `verdict-badge-large verdict-${verdict.level}`;
    el.innerHTML = `<span class="verdict-emoji">${verdict.emoji}</span>${verdict.label}`;
  }

  /**
   * 単価レンジを描画する
   */
  function renderRateRange(rateRange) {
    const el = document.getElementById('rate-range');
    if (!el) return;
    el.innerHTML = `
      <span class="rate-value">${rateRange.min}</span>
      <span class="rate-sep">〜</span>
      <span class="rate-value">${rateRange.max}</span>
      <span class="rate-unit">万円/月</span>
    `;
  }

  /**
   * 年収換算を描画する
   */
  function renderIncomeConversion(rateRange) {
    const annualIncomeEl = document.getElementById('annual-income');
    const takeHomePayEl = document.getElementById('take-home-pay');
    const employeeSalaryEl = document.getElementById('employee-salary');
    
    if (!annualIncomeEl || !takeHomePayEl || !employeeSalaryEl) return;

    // midpoint を月単価として扱う
    const monthlyRate = rateRange.midpoint;
    
    const annualIncome = monthlyRate * 12;
    const takeHomePay = Math.round(annualIncome * 0.7);
    const employeeSalary = Math.round(annualIncome * 0.6);

    annualIncomeEl.innerHTML = `<span class="rate-value">${annualIncome}</span><span class="rate-unit">万円</span>`;
    takeHomePayEl.innerHTML = `<span class="rate-value">約${takeHomePay}</span><span class="rate-unit">万円</span>`;
    employeeSalaryEl.innerHTML = `<span class="rate-value">約${employeeSalary}</span><span class="rate-unit">万円</span>`;
  }

  /**
   * 単価の妥当性判定を描画する
   */
  function renderRateValidity(scoreResult) {
    const section = document.getElementById('rate-validity-section');
    const badge = document.getElementById('rate-validity-badge');
    const reason = document.getElementById('rate-validity-reason');
    const card = document.getElementById('rate-validity-card');

    if (!section || !badge || !reason || !card) return;

    const desiredRate = scoreResult.parsed.options.desiredRate;
    if (!desiredRate) {
      section.style.display = 'none';
      return;
    }

    const midpoint = scoreResult.rateRange.midpoint;
    const diff = desiredRate - midpoint;

    section.style.display = 'block';

    if (diff >= 5) {
      badge.className = 'validity-badge validity-high';
      badge.innerHTML = '⚠️ 高い（売りにくい）';
      reason.textContent = `市場想定より+${diff}万円`;
      card.style.borderLeftColor = '#ef4444';
    } else if (diff <= -5) {
      badge.className = 'validity-badge validity-low';
      badge.innerHTML = '💡 安い（単価アップ可能）';
      reason.textContent = `市場想定より${diff}万円`;
      card.style.borderLeftColor = '#0ea5e9';
    } else {
      badge.className = 'validity-badge validity-proper';
      badge.innerHTML = '✅ 適正';
      reason.textContent = '市場レンジ内';
      card.style.borderLeftColor = '#10b981';
    }
  }

  /**
   * 書類通過率を描画する
   */
  function renderPassRate(passRate) {
    const el = document.getElementById('pass-rate');
    if (!el) return;
    el.textContent = passRate + '%';
  }

  /**
   * リスト項目を描画する
   */
  function renderList(elementId, items, iconClass) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerHTML = items.map(item => `
      <li class="result-list-item">
        <span class="list-icon ${iconClass}"></span>
        <span>${item}</span>
      </li>
    `).join('');
  }

  /**
   * 刺さる案件タイプを描画する
   */
  function renderJobTypes(types) {
    const el = document.getElementById('job-types');
    if (!el) return;
    el.innerHTML = types.map(t => `<span class="job-type-tag">${t}</span>`).join('');
  }

  /**
   * テキストエリアを描画する（コピー可能）
   */
  function renderTextArea(elementId, text) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.value = text;
  }

  /**
   * スキルタグを描画する
   */
  function renderSkillTags(parsed) {
    const el = document.getElementById('detected-skills');
    if (!el) return;

    const allSkills = parsed.techStack.allSkills;
    if (allSkills.length === 0) {
      el.innerHTML = '<span class="no-data">スキルが検出されませんでした</span>';
      return;
    }

    const cloudSkills = parsed.techStack.languages.cloud;
    const aiSkills = parsed.techStack.languages.ai;
    const sapSkills = parsed.techStack.languages.sap;

    el.innerHTML = allSkills.map(skill => {
      let tagClass = 'skill-tag';
      if (cloudSkills.includes(skill)) tagClass += ' skill-tag-cloud';
      else if (aiSkills.includes(skill)) tagClass += ' skill-tag-ai';
      else if (sapSkills.includes(skill)) tagClass += ' skill-tag-sap';
      return `<span class="${tagClass}">${skill}</span>`;
    }).join('');
  }

  /**
   * 判定理由セクションを描画する
   */
  function renderReasoning(judgeResult, scoreResult) {
    // --- 提案判定の理由 ---
    const verdictEl = document.getElementById('verdict-rationale-list');
    if (verdictEl) {
      verdictEl.innerHTML = judgeResult.verdictRationale.map(r =>
        `<li class="rationale-item rationale-verdict"><span class="rationale-bullet">▶</span><span>${r}</span></li>`
      ).join('');
    }

    // --- 単価レンジの算出根拠 ---
    const rateEl = document.getElementById('rate-rationale-body');
    if (rateEl) {
      const r = judgeResult.rateRationale;
      const adjHTML = r.adjustments.length > 0
        ? r.adjustments.map(a => {
            const sign = a.delta > 0 ? '+' : '';
            const cls = a.delta > 0 ? 'adj-plus' : 'adj-minus';
            return `<div class="rate-adj-row"><span>${a.label}</span><span class="rate-adj-val ${cls}">${sign}${a.delta}万円</span></div>`;
          }).join('')
        : '<div class="rate-adj-row muted">補正なし</div>';

      rateEl.innerHTML = `
        <div class="rate-formula-row">
          <span class="rate-formula-label">ベース単価</span>
          <span class="rate-formula-val">${r.formula}</span>
        </div>
        ${adjHTML}
        <div class="rate-formula-row rate-result-row">
          <span class="rate-formula-label">算出結果</span>
          <span class="rate-formula-val rate-result-val">${r.result}</span>
        </div>
      `;
    }

    // --- スコア内訳ごとの理由 ---
    const breakdownEl = document.getElementById('breakdown-reasons-list');
    if (breakdownEl) {
      breakdownEl.innerHTML = judgeResult.breakdownReasons.map(item => {
        const pct = Math.round((item.score / item.max) * 100);
        const levelClass = pct >= 80 ? 'reason-excellent' : pct >= 50 ? 'reason-good' : 'reason-poor';
        return `
          <div class="reason-row">
            <div class="reason-header">
              <span class="reason-label">${item.label}</span>
              <span class="reason-score ${levelClass}">${item.score}<span class="reason-max">/${item.max}</span></span>
            </div>
            <p class="reason-text">${item.reason}</p>
          </div>
        `;
      }).join('');
    }
  }

  /**
   * 全体をレンダリングするメイン関数
   */
  function render(scoreResult, judgeResult, comments) {
    // スコアゲージ
    animateGauge(scoreResult.total);

    // 内訳バー
    renderBreakdown(scoreResult.breakdown);

    // 判定バッジ
    renderVerdict(judgeResult.verdict);

    // 単価レンジ
    renderRateRange(scoreResult.rateRange);

    // 年収換算
    renderIncomeConversion(scoreResult.rateRange);

    // 単価妥当性判定
    renderRateValidity(scoreResult);

    // 書類通過率
    renderPassRate(scoreResult.passRate);

    // 強み・懸念点・改善ポイント
    renderList('strengths-list', judgeResult.strengths, 'icon-strength');
    renderList('concerns-list', judgeResult.concerns, 'icon-concern');
    renderList('improvements-list', judgeResult.improvements, 'icon-improvement');

    // 刺さる案件タイプ
    renderJobTypes(judgeResult.targetJobTypes);

    // スキルタグ
    renderSkillTags(scoreResult.parsed);

    // テキストエリア
    renderTextArea('sales-comment-text', comments.salesComment);
    renderTextArea('bp-distribution-text', comments.bpDistribution);

    // 判定理由
    renderReasoning(judgeResult, scoreResult);

    // 結果セクションを表示
    const resultSection = document.getElementById('result-section');
    if (resultSection) {
      resultSection.classList.add('visible');
      resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * エラーを表示する
   */
  function showError(message) {
    const el = document.getElementById('error-message');
    if (!el) return;
    el.textContent = message;
    el.classList.add('visible');
    setTimeout(() => el.classList.remove('visible'), 5000);
  }

  /**
   * ローディング状態を制御する
   */
  function setLoading(isLoading) {
    const btn = document.getElementById('analyze-btn');
    const spinner = document.getElementById('btn-spinner');
    const btnText = document.getElementById('btn-text');
    if (!btn) return;

    if (isLoading) {
      btn.disabled = true;
      if (spinner) spinner.style.display = 'inline-block';
      if (btnText) btnText.textContent = '解析中...';
    } else {
      btn.disabled = false;
      if (spinner) spinner.style.display = 'none';
      if (btnText) btnText.textContent = '市場価値を分析する';
    }
  }

  return { render, showError, setLoading };
})();
