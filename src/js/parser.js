/**
 * parser.js
 * スキルシートのテキストを構造化データに変換する
 */

const Parser = (() => {
  // 技術キーワード辞書
  const TECH_KEYWORDS = {
    languages: {
      mainstream: ['Java', 'Python', 'JavaScript', 'TypeScript', 'C#', 'Go', 'Kotlin', 'Swift'],
      frontend: ['React', 'Vue', 'Angular', 'Next.js', 'Nuxt', 'jQuery'],
      backend: ['Spring', 'Spring Boot', 'Django', 'Flask', 'FastAPI', 'Node.js', 'Express', 'Laravel', 'Rails'],
      database: ['MySQL', 'PostgreSQL', 'Oracle', 'SQL Server', 'MongoDB', 'Redis', 'DynamoDB', 'SQLite'],
      infra: ['Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Jenkins', 'CircleCI', 'GitHub Actions', 'Nginx', 'Apache'],
      cloud: ['AWS', 'GCP', 'Azure', 'EC2', 'S3', 'Lambda', 'RDS', 'Cloud Run', 'BigQuery', 'Azure AD'],
      ai: ['機械学習', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'scikit-learn', 'OpenAI', 'LLM', 'ChatGPT', 'AI', 'データ分析', 'Data Science'],
      sap: ['SAP', 'ABAP', 'Salesforce', 'ServiceNow', 'Dynamics'],
      other: ['Git', 'GitHub', 'GitLab', 'Jira', 'Confluence', 'Slack', 'Linux', 'Unix', 'Windows Server'],
    }
  };

  // 工程キーワード
  const PROCESS_KEYWORDS = {
    requirement: ['要件定義', '要件整理', 'RFP', '提案書', '提案活動', '業務要件', 'ユーザーヒアリング', '要求分析'],
    basicDesign: ['基本設計', '外部設計', 'アーキテクチャ設計', 'システム設計'],
    detailDesign: ['詳細設計', '内部設計', 'DB設計', 'テーブル設計', 'クラス設計'],
    implementation: ['実装', '製造', 'コーディング', '開発', 'プログラミング', 'プログラム作成'],
    test: ['テスト', '単体テスト', '結合テスト', 'システムテスト', '受入テスト', 'QA', '品質管理'],
  };

  // 上流経験キーワード
  const UPSTREAM_KEYWORDS = {
    requirement: ['要件定義', 'ユーザーヒアリング', '顧客折衝', '要求分析', 'RFP'],
    negotiation: ['顧客折衝', 'クライアント対応', '折衝', 'ステークホルダー', '打ち合わせ', '議事録', '提案'],
    leader: ['リーダー', 'PM', 'プロジェクトマネージャー', 'テックリード', 'チームリード', 'マネージャー', 'サブリーダー', '管理'],
  };

  /**
   * テキストを正規化する
   */
  function normalizeText(text) {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/　/g, ' ')
      .replace(/[！-～]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
      .toLowerCase();
  }

  /**
   * キーワードが含まれているか判定（大文字小文字を区別しない）
   */
  function containsKeyword(text, keyword) {
    return text.toLowerCase().includes(keyword.toLowerCase());
  }

  /**
   * 経験年数を抽出する
   */
  function extractExperienceYears(text) {
    // 「IT経験X年」「エンジニア歴X年」「経験X年」などにマッチ
    const patterns = [
      /(?:IT|システム|エンジニア|開発|プログラマ)[^\d]*(\d+(?:\.\d+)?)\s*年/,
      /(?:経験|実務|業務)[^\d]*(\d+(?:\.\d+)?)\s*年/,
      /(\d+(?:\.\d+)?)\s*年(?:以上)?の?(?:経験|実務|開発)/,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return { value: parseFloat(match[1]), isEstimated: false };
      }
    }

    // プロジェクト履歴から年数を推定
    const projectYears = estimateYearsFromProjects(text);
    if (projectYears > 0) return { value: projectYears, isEstimated: true };

    return { value: 0, isEstimated: false };
  }

  /**
   * プロジェクト履歴から経験年数を推計する
   */
  function estimateYearsFromProjects(text) {
    // 期間の開始年月を抽出するパターン（例: 2020/04〜, 2020年4月～, 2020.04-）
    const startPattern = /(20\d{2})[年\/\.](0?[1-9]|1[0-2])月?\s*[〜～\-]/g;
    
    let minYear = 9999;
    let minMonth = 12;
    let found = false;

    let match;
    while ((match = startPattern.exec(text)) !== null) {
      const year = parseInt(match[1]);
      const month = parseInt(match[2]);
      
      // 不正な未来の年や古すぎる年を省く
      if (year < 2000 || year > new Date().getFullYear() + 1) continue;

      if (year < minYear || (year === minYear && month < minMonth)) {
        minYear = year;
        minMonth = month;
        found = true;
      }
    }

    if (!found) return 0;

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    let months = (currentYear - minYear) * 12 + (currentMonth - minMonth);
    if (months < 0) months = 0;
    
    return months / 12;
  }

  /**
   * テクノロジースタックを抽出する
   */
  function extractTechStack(text) {
    const found = {
      languages: {
        mainstream: [],
        frontend: [],
        backend: [],
        database: [],
        infra: [],
        cloud: [],
        ai: [],
        sap: [],
        other: [],
      },
      allSkills: [],
    };

    for (const [category, keywords] of Object.entries(TECH_KEYWORDS.languages)) {
      for (const keyword of keywords) {
        if (containsKeyword(text, keyword)) {
          found.languages[category].push(keyword);
          if (!found.allSkills.includes(keyword)) {
            found.allSkills.push(keyword);
          }
        }
      }
    }

    return found;
  }

  /**
   * 工程経験を抽出する
   */
  function extractProcesses(text) {
    const processes = {
      requirement: false,
      basicDesign: false,
      detailDesign: false,
      implementation: false,
      test: false,
      highest: 'none',
    };

    for (const [process, keywords] of Object.entries(PROCESS_KEYWORDS)) {
      for (const keyword of keywords) {
        if (containsKeyword(text, keyword)) {
          processes[process] = true;
          break;
        }
      }
    }

    // 最高工程を判定
    if (processes.requirement) processes.highest = 'requirement';
    else if (processes.basicDesign) processes.highest = 'basicDesign';
    else if (processes.detailDesign) processes.highest = 'detailDesign';
    else if (processes.implementation) processes.highest = 'implementation';
    else if (processes.test) processes.highest = 'test';

    return processes;
  }

  /**
   * 上流経験を抽出する
   */
  function extractUpstreamExperience(text) {
    const upstream = {
      requirement: false,
      negotiation: false,
      leader: false,
    };

    for (const [type, keywords] of Object.entries(UPSTREAM_KEYWORDS)) {
      for (const keyword of keywords) {
        if (containsKeyword(text, keyword)) {
          upstream[type] = true;
          break;
        }
      }
    }

    return upstream;
  }

  /**
   * シート品質を評価する
   */
  function evaluateSheetQuality(text) {
    const quality = {
      hasBulletPoints: false,
      hasProjectDetails: false,
    };

    // 箇条書きチェック（・、●、▪、-、*、数字+.）
    const bulletPattern = /^[\s]*[・●▪▶◆\-\*]\s+.{5,}/m;
    const numberedPattern = /^\s*\d+[\.\)]\s+.{5,}/m;
    quality.hasBulletPoints = bulletPattern.test(text) || numberedPattern.test(text);

    // プロジェクト詳細チェック（期間・内容・担当が含まれる）
    const hasProjectPeriod = /20\d{2}年/.test(text);
    const hasProjectRole = containsKeyword(text, '担当') || containsKeyword(text, '役割') || containsKeyword(text, 'ロール');
    const hasProjectDesc = text.length > 200; // ある程度の記述量
    quality.hasProjectDetails = hasProjectPeriod && (hasProjectRole || hasProjectDesc);

    return quality;
  }

  /**
   * メインのパース関数
   */
  function parse(skillSheetText, options = {}) {
    const normalized = normalizeText(skillSheetText);
    const original = skillSheetText;

    const techStack = extractTechStack(original);
    const processes = extractProcesses(original);
    const upstream = extractUpstreamExperience(original);
    const quality = evaluateSheetQuality(original);
    const experienceData = extractExperienceYears(original);

    return {
      raw: skillSheetText,
      experienceYears: experienceData.value,
      isEstimatedExperience: experienceData.isEstimated,
      techStack,
      processes,
      upstream,
      quality,
      options: {
        age: options.age ? parseInt(options.age) : null,
        desiredRate: options.desiredRate ? parseInt(options.desiredRate) : null,
        availableFrom: options.availableFrom || null,
        remoteOnly: options.remoteOnly === true || options.remoteOnly === 'true',
        nationality: options.nationality || 'japanese', // japanese / foreign
        japaneseLevel: options.japaneseLevel || 'native', // native / business / basic
      },
    };
  }

  return { parse };
})();
