/**
 * scorer.js
 * パース済みデータからスコアを算出する
 * 合計100点満点
 */

const Scorer = (() => {

  /**
   * 技術力スコア（最大25点）
   */
  function scoreTechSkill(parsed) {
    const years = parsed.experienceYears;
    const tech = parsed.techStack;

    // 経験年数ベース
    let base = 0;
    if (years >= 8) base = 22;
    else if (years >= 5) base = 18;
    else if (years >= 3) base = 12;
    else if (years >= 1) base = 8;
    else if (years > 0) base = 3;

    // スキル加点（各カテゴリに1つ以上あれば+2）
    let bonus = 0;
    if (tech.languages.mainstream.length > 0) bonus += 2;
    if (tech.languages.frontend.length > 0) bonus += 2;
    if (tech.languages.backend.length > 0) bonus += 2;

    return Math.min(25, base + bonus);
  }

  /**
   * 工程経験スコア（最大15点）
   */
  function scoreProcess(parsed) {
    const highest = parsed.processes.highest;
    const scoreMap = {
      requirement: 15,
      basicDesign: 13,
      detailDesign: 10,
      implementation: 6,
      test: 3,
      none: 0,
    };
    return scoreMap[highest] || 0;
  }

  /**
   * 上流経験スコア（最大10点）
   */
  function scoreUpstream(parsed) {
    const u = parsed.upstream;
    let score = 0;
    if (u.requirement) score += 5;
    if (u.negotiation) score += 3;
    if (u.leader) score += 2;
    return Math.min(10, score);
  }

  /**
   * 希少性スコア（最大15点）
   */
  function scoreRarity(parsed) {
    const tech = parsed.techStack;
    let score = 0;
    if (tech.languages.cloud.length > 0) score += 5;
    if (tech.languages.ai.length > 0) score += 5;
    if (tech.languages.sap.length > 0) score += 5;
    return Math.min(15, score);
  }

  /**
   * 市場適合性スコア（最大15点）
   */
  function scoreMarketFit(parsed) {
    const tech = parsed.techStack;
    let score = 0;

    // Java/Web系
    const hasJavaOrWeb = tech.languages.mainstream.some(s =>
      ['Java', 'TypeScript', 'JavaScript'].includes(s)
    ) || tech.languages.backend.length > 0;
    if (hasJavaOrWeb) score = Math.max(score, 10);

    // フロントエンド
    if (tech.languages.frontend.length > 0) score = Math.max(score, 8);

    // インフラ（クラウド）
    if (tech.languages.cloud.length > 0 || tech.languages.infra.length > 0) score = Math.max(score, 8);

    // ニッチ技術（主流ではないもの）
    const nicheIndicators = tech.languages.sap.length > 0 || tech.languages.other.length > 0;
    if (nicheIndicators && score === 0) score = 3;

    return Math.min(15, score);
  }

  /**
   * 条件適合スコア（最大10点、減点方式）
   */
  function scoreCondition(parsed) {
    let score = 10;
    const opts = parsed.options;

    // フルリモートのみ
    if (opts.remoteOnly) score -= 3;

    // 希望単価が市場より高い（技術力スコアベースで判断）
    const techScore = scoreTechSkill(parsed);
    const estimatedBase = Math.round(techScore * 2.5);
    if (opts.desiredRate && opts.desiredRate > estimatedBase + 10) {
      score -= 3;
    }

    // 外国籍でビジネスレベル未満
    if (opts.nationality === 'foreign' && opts.japaneseLevel !== 'native' && opts.japaneseLevel !== 'business') {
      score -= 4;
    }

    return Math.max(0, score);
  }

  /**
   * シート品質スコア（最大10点）
   */
  function scoreSheetQuality(parsed) {
    const q = parsed.quality;
    let score = 0;
    if (q.hasBulletPoints) score += 5;
    if (q.hasProjectDetails) score += 5;
    return score;
  }

  /**
   * 単価レンジを算出する
   * ベース単価 = 技術力スコア × 2.5（万円）
   */
  function calcRateRange(parsed, breakdown) {
    let base = Math.round(breakdown.techSkill * 2.5);

    // 補正
    if (parsed.upstream.requirement || parsed.upstream.leader) base += 5;
    if (parsed.techStack.languages.cloud.length > 0) base += 5;
    if (parsed.options.remoteOnly) base -= 5;

    // 最低単価の保証
    base = Math.max(30, base);

    return {
      min: base - 5,
      max: base + 10,
      midpoint: base,
    };
  }

  /**
   * スコアリングのメイン関数
   */
  function score(parsed) {
    const breakdown = {
      techSkill: scoreTechSkill(parsed),
      process: scoreProcess(parsed),
      upstream: scoreUpstream(parsed),
      rarity: scoreRarity(parsed),
      marketFit: scoreMarketFit(parsed),
      condition: scoreCondition(parsed),
      sheetQuality: scoreSheetQuality(parsed),
    };

    const total = Object.values(breakdown).reduce((sum, v) => sum + v, 0);
    const rateRange = calcRateRange(parsed, breakdown);
    const passRate = Math.round(total * 0.8);

    return {
      total,
      breakdown,
      rateRange,
      passRate,
      parsed,
    };
  }

  return { score };
})();
