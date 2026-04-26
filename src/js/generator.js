/**
 * generator.js
 * 営業コメントとBP配信文を生成する
 */

const Generator = (() => {

  /**
   * 主要スキルのサマリを作成する
   */
  function buildSkillSummary(parsed) {
    const tech = parsed.techStack;
    const skills = [];

    if (tech.languages.mainstream.length > 0) skills.push(...tech.languages.mainstream.slice(0, 3));
    if (tech.languages.frontend.length > 0) skills.push(...tech.languages.frontend.slice(0, 2));
    if (tech.languages.backend.length > 0) skills.push(...tech.languages.backend.slice(0, 2));
    if (tech.languages.cloud.length > 0) skills.push(...tech.languages.cloud.slice(0, 2));
    if (tech.languages.ai.length > 0) skills.push(...tech.languages.ai.slice(0, 1));
    if (tech.languages.sap.length > 0) skills.push(...tech.languages.sap.slice(0, 1));

    const unique = [...new Set(skills)];
    return unique.slice(0, 6).join('・') || '汎用スキル';
  }

  /**
   * 最高工程のラベルを返す
   */
  function getProcessLabel(highest) {
    const map = {
      requirement: '要件定義',
      basicDesign: '基本設計',
      detailDesign: '詳細設計',
      implementation: '製造',
      test: 'テスト',
      none: '不明',
    };
    return map[highest] || '不明';
  }

  /**
   * 経験年数のテキストを返す
   */
  function getYearsText(years) {
    if (years === 0) return '経験年数不明';
    if (years < 1) return '1年未満';
    return `約${Math.round(years)}年`;
  }

  /**
   * 単価レンジのテキストを返す
   */
  function getRateRangeText(rateRange) {
    return `${rateRange.min}〜${rateRange.max}万円`;
  }

  /**
   * 稼働開始のテキストを返す
   */
  function getAvailableText(availableFrom) {
    if (!availableFrom) return '応相談';
    return availableFrom;
  }

  /**
   * リモートのテキスト
   */
  function getRemoteText(remoteOnly) {
    return remoteOnly ? 'フルリモート希望' : 'リモート・常駐両対応可';
  }

  /**
   * 営業コメントを生成する（クライアント向け提案文）
   */
  function generateSalesComment(scoreResult, judgeResult) {
    const { parsed, rateRange } = scoreResult;
    const { verdict } = judgeResult;
    const skillSummary = buildSkillSummary(parsed);
    const processLabel = getProcessLabel(parsed.processes.highest);
    const yearsText = getYearsText(parsed.experienceYears);
    const rateText = getRateRangeText(rateRange);
    const availableText = getAvailableText(parsed.options.availableFrom);
    const remoteText = getRemoteText(parsed.options.remoteOnly);

    const upstreamNote = parsed.upstream.requirement
      ? '要件定義・顧客折衝経験もございますので、上流フェーズからのご参画も可能です。'
      : parsed.upstream.leader
      ? 'チームリード経験がございますので、技術リーダーとしてのご参画も対応可能です。'
      : '';

    const verdictNote = verdict.level === 'excellent'
      ? '即戦力としてご提案できる優秀な人材です。'
      : verdict.level === 'good'
      ? '一定の条件のもとでご提案可能な人材です。'
      : '現時点ではご提案が難しい状況ですが、条件次第でご相談可能です。';

    return `【人材ご紹介】${skillSummary}エンジニア（${yearsText}）

いつもお世話になっております。
この度、ご要望に沿う可能性のある人材をご紹介させていただきます。

■ スキルサマリ
・主要スキル：${skillSummary}
・IT経験：${yearsText}
・担当工程：${processLabel}まで
・稼働開始：${availableText}
・希望単価：${rateText}
・稼働形態：${remoteText}

${upstreamNote}

${verdictNote}
詳細なスキルシートをご希望の場合は、お気軽にお申し付けください。
ご検討のほど、どうぞよろしくお願いいたします。`;
  }

  /**
   * BP配信文を生成する（BP会社向け）
   */
  function generateBpDistribution(scoreResult, judgeResult) {
    const { parsed, rateRange } = scoreResult;
    const skillSummary = buildSkillSummary(parsed);
    const processLabel = getProcessLabel(parsed.processes.highest);
    const yearsText = getYearsText(parsed.experienceYears);
    const availableText = getAvailableText(parsed.options.availableFrom);
    const remoteText = getRemoteText(parsed.options.remoteOnly);

    const specialSkills = [];
    if (parsed.techStack.languages.cloud.length > 0) specialSkills.push('クラウド');
    if (parsed.techStack.languages.ai.length > 0) specialSkills.push('AI・データ系');
    if (parsed.techStack.languages.sap.length > 0) specialSkills.push('SAP/Salesforce');
    if (parsed.upstream.leader) specialSkills.push('PL/PM経験');

    const specialNote = specialSkills.length > 0
      ? `\n■ 特記事項\n${specialSkills.map(s => `・${s}`).join('\n')}\n`
      : '';

    return `【BP配信】${skillSummary}エンジニア（${yearsText}）

お世話になっております。
下記の要員が稼働可能となりましたので、案件マッチングをお願いできますでしょうか。

■ 基本情報
・経験：${yearsText}
・スキル：${skillSummary}
・工程：${processLabel}まで対応
・稼働開始：${availableText}
・希望単価：${rateRange.min}〜${rateRange.max}万円
・稼働形態：${remoteText}
${specialNote}
ご案件がございましたら、お気軽にご連絡ください。
スキルシートをご希望の方は返信にてご連絡ください。`;
  }

  /**
   * コメント生成のメイン関数
   */
  function generate(scoreResult, judgeResult) {
    return {
      salesComment: generateSalesComment(scoreResult, judgeResult),
      bpDistribution: generateBpDistribution(scoreResult, judgeResult),
    };
  }

  return { generate };
})();
