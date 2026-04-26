/**
 * app.js
 * アプリケーションのエントリーポイント
 * 各モジュールを統括し、UIイベントを処理する
 */

document.addEventListener('DOMContentLoaded', () => {

  // ===== 要素取得 =====
  const analyzeBtn = document.getElementById('analyze-btn');
  const resetBtn = document.getElementById('reset-btn');
  const skillSheetInput = document.getElementById('skill-sheet-input');
  const charCount = document.getElementById('char-count');

  // コピーボタン
  const copyBtns = document.querySelectorAll('.copy-btn');

  // ===== 文字数カウント =====
  skillSheetInput?.addEventListener('input', () => {
    const len = skillSheetInput.value.length;
    if (charCount) charCount.textContent = len.toLocaleString();
  });

  // ===== 分析実行 =====
  analyzeBtn?.addEventListener('click', () => {
    const skillSheetText = skillSheetInput?.value?.trim();

    if (!skillSheetText) {
      Renderer.showError('スキルシート本文を入力してください。');
      skillSheetInput?.focus();
      return;
    }

    if (skillSheetText.length < 30) {
      Renderer.showError('スキルシートの内容が短すぎます。もう少し詳しく入力してください。');
      return;
    }

    // オプション取得
    const options = {
      age: document.getElementById('input-age')?.value || null,
      desiredRate: document.getElementById('input-rate')?.value || null,
      availableFrom: document.getElementById('input-available')?.value || null,
      remoteOnly: document.getElementById('input-remote')?.value === 'remote-only',
      nationality: document.getElementById('input-nationality')?.value || 'japanese',
      japaneseLevel: document.getElementById('input-japanese')?.value || 'native',
    };

    try {
      Renderer.setLoading(true);

      // 処理をわずかに遅延させてUIをフラッシュさせる
      setTimeout(() => {
        try {
          // 1. パース
          const parsed = Parser.parse(skillSheetText, options);

          // 2. スコアリング
          const scoreResult = Scorer.score(parsed);

          // 3. 判定
          const judgeResult = Judge.judge(scoreResult);

          // 4. コメント生成
          const comments = Generator.generate(scoreResult, judgeResult);

          // 5. レンダリング
          Renderer.render(scoreResult, judgeResult, comments);

        } catch (err) {
          console.error('Analysis error:', err);
          Renderer.showError('解析中にエラーが発生しました。入力内容を確認してください。');
        } finally {
          Renderer.setLoading(false);
        }
      }, 50);

    } catch (err) {
      console.error('Unexpected error:', err);
      Renderer.showError('予期せぬエラーが発生しました。');
      Renderer.setLoading(false);
    }
  });

  // ===== リセット =====
  resetBtn?.addEventListener('click', () => {
    if (skillSheetInput) skillSheetInput.value = '';
    if (charCount) charCount.textContent = '0';

    const inputs = document.querySelectorAll('.meta-input');
    inputs.forEach(el => {
      if (el.tagName === 'SELECT') el.selectedIndex = 0;
      else el.value = '';
    });

    const resultSection = document.getElementById('result-section');
    if (resultSection) resultSection.classList.remove('visible');

    skillSheetInput?.focus();
  });

  // ===== コピー機能 =====
  copyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      const text = targetEl.tagName === 'TEXTAREA' ? targetEl.value : targetEl.textContent;

      navigator.clipboard.writeText(text).then(() => {
        const original = btn.textContent;
        btn.textContent = 'コピー完了！';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = original;
          btn.classList.remove('copied');
        }, 2000);
      }).catch(() => {
        // フォールバック
        if (targetEl.tagName === 'TEXTAREA') {
          targetEl.select();
          document.execCommand('copy');
        }
      });
    });
  });

  const copyAllBtn = document.getElementById('copy-all-btn');
  copyAllBtn?.addEventListener('click', () => {
    const salesText = document.getElementById('sales-comment-text')?.value || '';
    const bpText = document.getElementById('bp-distribution-text')?.value || '';
    if (!salesText && !bpText) return;

    const combinedText = `【クライアント向け提案文】\n${salesText}\n\n=========================\n\n【BP会社向け配信文】\n${bpText}`;

    navigator.clipboard.writeText(combinedText).then(() => {
      const original = copyAllBtn.textContent;
      copyAllBtn.textContent = 'コピー完了！';
      copyAllBtn.classList.add('copied');
      setTimeout(() => {
        copyAllBtn.textContent = original;
        copyAllBtn.classList.remove('copied');
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy combined text:', err);
      alert('コピーに失敗しました。');
    });
  });

  // ===== サンプルデータ読み込み =====
  const sampleBtn = document.getElementById('load-sample-btn');
  sampleBtn?.addEventListener('click', () => {
    if (typeof SAMPLE_DATA === 'undefined') return;
    
    const selector = document.getElementById('sample-selector');
    const selectedKey = selector ? selector.value : 'high';
    const data = SAMPLE_DATA[selectedKey];
    
    if (data && data.skillSheet) {
      if (skillSheetInput) skillSheetInput.value = data.skillSheet;
      if (charCount) charCount.textContent = data.skillSheet.length.toLocaleString();

      // メタ情報もセット
      if (data.age) {
        const ageEl = document.getElementById('input-age');
        if (ageEl) ageEl.value = data.age;
      }
      if (data.desiredRate) {
        const rateEl = document.getElementById('input-rate');
        if (rateEl) rateEl.value = data.desiredRate;
      }
      if (data.availableFrom) {
        const availEl = document.getElementById('input-available');
        if (availEl) availEl.value = data.availableFrom;
      }
      if (data.remoteOnly !== undefined) {
        const remoteEl = document.getElementById('input-remote');
        if (remoteEl) remoteEl.value = data.remoteOnly ? 'remote-only' : 'both';
      }
    }
  });

  // ===== ファイル添付 =====
  const fileUploadBtn = document.getElementById('file-upload-btn');
  const fileUploadInput = document.getElementById('file-upload-input');
  
  console.log('fileUploadBtn:', fileUploadBtn);
  console.log('fileUploadInput:', fileUploadInput);

  fileUploadBtn?.addEventListener('click', () => {
    console.log('添付ボタンがクリックされた');
    fileUploadInput?.click();
  });

  fileUploadInput?.addEventListener('change', async (e) => {
    console.log('file input が開いた / change イベント発火');
    const file = e.target.files[0];
    if (!file) {
      console.log('ファイルが選択されませんでした');
      return;
    }
    console.log('ファイルが選択された:', file.name, 'type:', file.type);

    try {
      Renderer.setLoading(true);
      const text = await SkillSheetReader.extractText(file);
      console.log('テキスト抽出が完了した。文字数:', text.length);
      
      if (skillSheetInput) {
        skillSheetInput.value = text;
        if (charCount) charCount.textContent = text.length.toLocaleString();
        console.log('textarea に反映された');
        
        const filename = file.name.toLowerCase();
        if (filename.endsWith('.xlsx') || filename.endsWith('.xls') || filename.endsWith('.csv')) {
          alert('Excelからテキストを抽出しました。内容を確認してから分析してください。');
        } else {
          alert('テキストの抽出が完了しました。内容を確認・修正してから分析を実行してください。');
        }
      }
    } catch (err) {
      console.error('抽出エラー:', err);
      Renderer.showError(err.message || 'ファイルの読み込みに失敗しました。');
    } finally {
      Renderer.setLoading(false);
      // 同じファイルを再度選択できるようにクリア
      e.target.value = '';
    }
  });

  // ===== タブ切り替え =====
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;

      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.toggle('active', panel.dataset.tab === targetTab);
      });
    });
  });

  // ===== キーボードショートカット =====
  document.addEventListener('keydown', (e) => {
    // Ctrl+Enter で分析実行
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      analyzeBtn?.click();
    }
  });

});
