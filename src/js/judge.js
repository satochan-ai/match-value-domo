/**
 * judge.js
 * スコアから提案判定・強み・懸念点・改善ポイントを生成する
 */

const Judge = (() => {

  /**
   * 提案判定
   */
  function getVerdict(total) {
    if (total >= 80) return { label: '即提案', level: 'excellent', emoji: '🚀' };
    if (total >= 60) return { label: '条件付き提案', level: 'good', emoji: '✅' };
    return { label: '見送り', level: 'poor', emoji: '⚠️' };
  }

  /**
   * 強みを抽出する
   */
  function getStrengths(scoreResult) {
    const strengths = [];
    const { breakdown, parsed } = scoreResult;

    // 技術力
    if (breakdown.techSkill >= 18) {
      const yrs = Math.round(parsed.experienceYears);
      strengths.push(`豊富な開発経験（${yrs}年以上）があり、即戦力として期待できる`);
    } else if (breakdown.techSkill >= 12) {
      strengths.push('実務経験を積んだ中堅エンジニアとして安定した技術力がある');
    }

    // クラウドスキル
    const cloud = parsed.techStack.languages.cloud;
    if (cloud.length > 0) {
      strengths.push(`クラウド技術（${cloud.slice(0, 3).join('・')}）を保有しており需要が高い`);
    }

    // AIスキル
    const ai = parsed.techStack.languages.ai;
    if (ai.length > 0) {
      strengths.push(`AI・データ系スキル（${ai.slice(0, 2).join('・')}）を持つ希少人材`);
    }

    // SAP/Salesforce
    const sap = parsed.techStack.languages.sap;
    if (sap.length > 0) {
      strengths.push(`${sap.slice(0, 2).join('・')}などのエンタープライズ系スキルは単価が高く競合が少ない`);
    }

    // 上流経験
    if (parsed.upstream.requirement) {
      strengths.push('要件定義経験あり。上流から参画できる人材としてPM・リーダー案件へも提案可能');
    }
    if (parsed.upstream.leader) {
      strengths.push('リーダー・マネジメント経験あり。チーム牽引が必要な案件にも対応可能');
    }
    if (parsed.upstream.negotiation) {
      strengths.push('顧客折衝経験あり。コミュニケーション能力が高く、直接クライアントへの提案に適している');
    }

    // 工程
    if (parsed.processes.highest === 'requirement') {
      strengths.push('要件定義〜製造まで一貫した工程経験を持つフルサイクルエンジニア');
    } else if (parsed.processes.highest === 'basicDesign') {
      strengths.push('基本設計以上の上位工程経験あり。設計力があり、品質の高いアウトプットが期待できる');
    }

    // フロントエンド
    const fe = parsed.techStack.languages.frontend;
    if (fe.length > 0) {
      strengths.push(`フロントエンド（${fe.slice(0, 2).join('・')}）とバックエンド両方の技術を保有するフルスタック型`);
    }

    // シート品質
    if (breakdown.sheetQuality >= 8) {
      strengths.push('スキルシートが見やすく整理されており、書類選考での第一印象が良い');
    }

    return strengths.length > 0 ? strengths : ['特筆すべき技術力・経験が確認できなかった'];
  }

  /**
   * 懸念点を抽出する
   */
  function getConcerns(scoreResult) {
    const concerns = [];
    const { breakdown, parsed } = scoreResult;

    // 経験年数が不明または少ない
    if (parsed.experienceYears === 0) {
      concerns.push('スキルシートから経験年数が読み取れない。営業時に年数確認が必要');
    } else if (parsed.experienceYears < 2) {
      concerns.push('IT経験が2年未満の可能性があり、対応できる案件が限定される');
    }

    // 工程経験が浅い
    if (parsed.processes.highest === 'test' || parsed.processes.highest === 'none') {
      concerns.push('テスト・製造工程のみの経験では、上位工程案件への提案は難しい');
    }

    // 条件の厳しさ
    if (parsed.options.remoteOnly) {
      concerns.push('フルリモートのみの条件は、案件マッチ率が大幅に低下する（約30〜40%減）');
    }

    // 希望単価と実力の乖離
    if (parsed.options.desiredRate) {
      const mid = scoreResult.rateRange.midpoint;
      if (parsed.options.desiredRate > mid + 10) {
        concerns.push(`希望単価（${parsed.options.desiredRate}万円）が市場相場（${mid}万円前後）より高め。単価交渉が必要な可能性`);
      }
    }

    // 外国籍・日本語レベル
    if (parsed.options.nationality === 'foreign') {
      if (parsed.options.japaneseLevel === 'basic') {
        concerns.push('日本語がビジネスレベル未満の場合、日本語必須案件への提案はリスクが高い');
      }
    }

    // 市場適合性が低い
    if (breakdown.marketFit <= 3) {
      concerns.push('メインスキルが市場でニッチな技術。案件数が少なく、マッチングに時間がかかる可能性');
    }

    // シート品質が低い
    if (breakdown.sheetQuality < 5) {
      concerns.push('スキルシートの記載が不十分。書類選考での通過率低下が懸念される');
    }

    // 希少性が低い
    if (breakdown.rarity === 0 && breakdown.techSkill < 12) {
      concerns.push('クラウド・AI・SAP等の希少スキルがなく、競合との差別化が難しい');
    }

    return concerns.length > 0 ? concerns : ['現時点での大きな懸念点は見当たらない'];
  }

  /**
   * 改善ポイントを生成する
   */
  function getImprovements(scoreResult) {
    const improvements = [];
    const { breakdown, parsed } = scoreResult;

    if (breakdown.sheetQuality < 10) {
      if (!parsed.quality.hasBulletPoints) {
        improvements.push('スキルシートを箇条書き形式に整えると、担当者の読みやすさが向上し通過率が上がる');
      }
      if (!parsed.quality.hasProjectDetails) {
        improvements.push('各プロジェクトに「期間・規模・役割・使用技術・担当工程」を明記すると評価が上がりやすい');
      }
    }

    if (breakdown.rarity < 10) {
      improvements.push('AWS/GCP/AzureなどクラウドのAP資格・実績を追加できると単価アップと希少性向上につながる');
    }

    if (!parsed.upstream.leader && parsed.experienceYears >= 5) {
      improvements.push('経験年数を考慮するとリーダー経験が見えづらい。過去にサブリーダー等があれば明記する');
    }

    if (parsed.options.remoteOnly) {
      improvements.push('フルリモートにこだわる場合、週1〜2出社可等の柔軟な対応で案件選択肢が広がる');
    }

    if (parsed.experienceYears === 0) {
      improvements.push('経験年数（「IT経験X年」等）をスキルシートの冒頭に明記することで、評価者が即座に把握できる');
    }

    if (improvements.length === 0) {
      improvements.push('現状のスキルシートは十分なレベル。さらなる希少スキルの習得で単価アップを狙える');
    }

    return improvements;
  }

  /**
   * 刺さる案件タイプを提案する
   */
  function getTargetJobTypes(scoreResult) {
    const types = [];
    const { parsed } = scoreResult;
    const tech = parsed.techStack;

    if (tech.languages.cloud.length > 0) types.push('クラウドインフラ構築・移行案件');
    if (tech.languages.ai.length > 0) types.push('AI・データ分析基盤開発');
    if (tech.languages.sap.length > 0) types.push('SAP導入・保守案件');
    if (tech.languages.frontend.length > 0 && tech.languages.backend.length > 0) types.push('フルスタックWeb開発');
    else if (tech.languages.frontend.length > 0) types.push('フロントエンド開発（React/Vue系）');
    else if (tech.languages.backend.length > 0) types.push('バックエンドAPI開発');

    if (parsed.upstream.requirement) types.push('上流工程（PM補佐・業務改善コンサル）');
    if (parsed.upstream.leader) types.push('チームリード・技術リーダーポジション');

    if (parsed.processes.highest === 'implementation' || parsed.processes.highest === 'detailDesign') {
      types.push('既存システム改修・機能追加開発');
    }

    const mainstream = tech.languages.mainstream;
    if (mainstream.includes('Java')) types.push('Java系エンタープライズシステム開発');
    if (mainstream.includes('Python')) types.push('Python系バックエンド・自動化ツール開発');

    return types.length > 0 ? types.slice(0, 5) : ['汎用的なWebシステム開発・保守'];
  }

  /**
   * スコア内訳ごとの点数と理由を生成する
   */
  function generateBreakdownReasons(scoreResult) {
    const { breakdown, parsed } = scoreResult;
    const yrs = parsed.experienceYears;
    const tech = parsed.techStack;

    // 技術力
    let techBase = 0;
    if (yrs >= 8) techBase = 22;
    else if (yrs >= 5) techBase = 18;
    else if (yrs >= 3) techBase = 12;
    else if (yrs >= 1) techBase = 8;
    else if (yrs > 0) techBase = 3;
    const techBonus = breakdown.techSkill - techBase;
    const yearsLabel = yrs === 0 ? '不明' : `約${Math.round(yrs * 10) / 10}年`;
    const techBonusDetails = [];
    if (tech.languages.mainstream.length > 0) techBonusDetails.push(`主要言語(${tech.languages.mainstream.slice(0,2).join('・')})+2`);
    if (tech.languages.frontend.length > 0) techBonusDetails.push(`フロントエンド(${tech.languages.frontend[0]})+2`);
    if (tech.languages.backend.length > 0) techBonusDetails.push(`バックエンド(${tech.languages.backend[0]})+2`);
    const estimatedSuffix = parsed.isEstimatedExperience ? '（職務経歴の期間から推定）' : '';
    const techReason = `経験年数${yearsLabel}${estimatedSuffix} → ベース${techBase}点` +
      (techBonus > 0 ? ` + スキル加点(${techBonusDetails.join('、')})=${techBonus}点` : '') +
      ` → 合計${breakdown.techSkill}点（上限25点）`;

    // 工程経験
    const processLabelMap = { requirement:'要件定義', basicDesign:'基本設計', detailDesign:'詳細設計', implementation:'製造', test:'テスト', none:'検出なし' };
    const processScoreMap = { requirement:15, basicDesign:13, detailDesign:10, implementation:6, test:3, none:0 };
    const highestLabel = processLabelMap[parsed.processes.highest] || '不明';
    const processReason = `最高工程「${highestLabel}」を検出 → ${processScoreMap[parsed.processes.highest] ?? 0}点（複数工程は最高工程のみ採用）`;

    // 上流経験
    const upParts = [];
    if (parsed.upstream.requirement) upParts.push('要件定義+5');
    if (parsed.upstream.negotiation) upParts.push('顧客折衝+3');
    if (parsed.upstream.leader) upParts.push('リーダー経験+2');
    const upstreamReason = upParts.length > 0
      ? `検出項目：${upParts.join('、')} → 合計${breakdown.upstream}点`
      : '要件定義・折衝・リーダー経験のいずれも検出されず → 0点';

    // 希少性
    const rareParts = [];
    if (tech.languages.cloud.length > 0) rareParts.push(`クラウド(${tech.languages.cloud.slice(0,2).join('・')})+5`);
    if (tech.languages.ai.length > 0) rareParts.push(`AI・データ系(${tech.languages.ai[0]})+5`);
    if (tech.languages.sap.length > 0) rareParts.push(`SAP/Salesforce(${tech.languages.sap[0]})+5`);
    const rarityReason = rareParts.length > 0
      ? `検出項目：${rareParts.join('、')} → 合計${breakdown.rarity}点（上限15点）`
      : 'クラウド・AI・SAP/Salesforceスキルが未検出 → 0点';

    // 市場適合性
    const marketReason = (() => {
      if (breakdown.marketFit >= 10) return `Java/TypeScript/Web系スキルを検出 → ${breakdown.marketFit}点（市場需要が最も高いカテゴリ）`;
      if (breakdown.marketFit >= 8) {
        const cats = [];
        if (tech.languages.frontend.length > 0) cats.push('フロントエンド');
        if (tech.languages.cloud.length > 0 || tech.languages.infra.length > 0) cats.push('クラウド/インフラ');
        return `${cats.join('・')}スキルを検出 → ${breakdown.marketFit}点`;
      }
      if (breakdown.marketFit > 0) return `ニッチ技術を検出 → ${breakdown.marketFit}点（市場案件数は少なめ）`;
      return '市場需要の高いスキルが未検出 → 0点';
    })();

    // 条件適合
    const condParts = [];
    if (parsed.options.remoteOnly) condParts.push('フルリモートのみ -3点');
    const mid = scoreResult.rateRange.midpoint;
    if (parsed.options.desiredRate && parsed.options.desiredRate > mid + 10) {
      condParts.push(`希望単価(${parsed.options.desiredRate}万)が相場(${mid}万)より高め -3点`);
    }
    if (parsed.options.nationality === 'foreign' && parsed.options.japaneseLevel !== 'native' && parsed.options.japaneseLevel !== 'business') {
      condParts.push('外国籍かつ日本語ビジネスレベル未満 -4点');
    }
    const conditionReason = condParts.length > 0
      ? `10点満点から減点：${condParts.join('、')} → ${breakdown.condition}点`
      : '減点項目なし → 満点10点';

    // シート品質
    const qualParts = [];
    if (parsed.quality.hasBulletPoints) qualParts.push('箇条書き形式を確認+5点');
    else qualParts.push('箇条書きが未検出 +0点');
    if (parsed.quality.hasProjectDetails) qualParts.push('プロジェクト詳細（期間・役割等）を確認+5点');
    else qualParts.push('プロジェクト詳細が不十分 +0点');
    const sheetReason = `${qualParts.join('、')} → ${breakdown.sheetQuality}点`;

    return [
      { label: '技術力', score: breakdown.techSkill, max: 25, reason: techReason },
      { label: '工程経験', score: breakdown.process, max: 15, reason: processReason },
      { label: '上流経験', score: breakdown.upstream, max: 10, reason: upstreamReason },
      { label: '希少性', score: breakdown.rarity, max: 15, reason: rarityReason },
      { label: '市場適合性', score: breakdown.marketFit, max: 15, reason: marketReason },
      { label: '条件適合', score: breakdown.condition, max: 10, reason: conditionReason },
      { label: 'シート品質', score: breakdown.sheetQuality, max: 10, reason: sheetReason },
    ];
  }

  /**
   * 単価レンジの算出根拠を生成する
   */
  function generateRateRationale(scoreResult) {
    const { breakdown, parsed, rateRange } = scoreResult;
    const base = Math.round(breakdown.techSkill * 2.5);
    const adjustments = [];

    if (parsed.upstream.requirement || parsed.upstream.leader) {
      adjustments.push({ label: '上流・リーダー経験あり', delta: +5 });
    }
    if (parsed.techStack.languages.cloud.length > 0) {
      adjustments.push({ label: 'クラウドスキルあり', delta: +5 });
    }
    if (parsed.options.remoteOnly) {
      adjustments.push({ label: 'フルリモート条件', delta: -5 });
    }

    return {
      base,
      formula: `技術力スコア(${breakdown.techSkill}) × 2.5 = ${base}万円`,
      adjustments,
      result: `${rateRange.min}〜${rateRange.max}万円（中心値 ${rateRange.midpoint}万円）`,
    };
  }

  /**
   * 提案判定の理由を生成する
   */
  function generateVerdictRationale(scoreResult, verdict) {
    const { total } = scoreResult;
    const reasonMap = {
      excellent: [
        `総合スコア${total}点は即提案ライン（80点以上）を達成`,
        '技術力・工程経験ともに市場水準を満たしており、書類選考の通過が見込める',
        '積極的に提案を進め、複数の案件へ同時アプローチが有効',
      ],
      good: [
        `総合スコア${total}点は条件付き提案ライン（60〜79点）`,
        'スキルや条件面でいくつかの懸念点があり、案件・クライアントを絞って提案することを推奨',
        '懸念点を事前に説明し、条件のすり合わせを行ったうえで提案することで通過率を高められる',
      ],
      poor: [
        `総合スコア${total}点は見送りライン（59点以下）`,
        '現時点では即提案が難しい状態。まずは改善ポイントを本人にフィードバックすることを推奨',
        'スキルシートの加筆・希少スキル習得・条件の柔軟化により、次回評価での再提案を目指す',
      ],
    };
    return reasonMap[verdict.level] || [];
  }

  /**
   * 判定のメイン関数
   */
  function judge(scoreResult) {
    const verdict = getVerdict(scoreResult.total);
    const strengths = getStrengths(scoreResult);
    const concerns = getConcerns(scoreResult);
    const improvements = getImprovements(scoreResult);
    const targetJobTypes = getTargetJobTypes(scoreResult);
    const breakdownReasons = generateBreakdownReasons(scoreResult);
    const rateRationale = generateRateRationale(scoreResult);
    const verdictRationale = generateVerdictRationale(scoreResult, verdict);

    return {
      verdict,
      strengths,
      concerns,
      improvements,
      targetJobTypes,
      breakdownReasons,
      rateRationale,
      verdictRationale,
    };
  }

  return { judge };
})();
