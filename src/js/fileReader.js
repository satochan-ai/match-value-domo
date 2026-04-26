/**
 * fileReader.js
 * スキルシート（TXT, PDF, DOCX）からテキストを抽出するモジュール
 */

const SkillSheetReader = (() => {

  /**
   * ファイルからテキストを抽出するメイン関数
   * @param {File} file
   * @returns {Promise<string>}
   */
  async function extractText(file) {
    if (!file) {
      throw new Error('ファイルが選択されていません。');
    }

    const filename = file.name.toLowerCase();
    
    if (filename.endsWith('.txt')) {
      return await readTxt(file);
    } else if (filename.endsWith('.pdf')) {
      return await readPdf(file);
    } else if (filename.endsWith('.docx')) {
      return await readDocx(file);
    } else if (filename.endsWith('.xlsx') || filename.endsWith('.xls') || filename.endsWith('.csv')) {
      return await readExcel(file);
    } else {
      throw new Error('未対応のファイル形式です。.txt, .pdf, .docx, .xlsx, .xls, .csv を選択してください。');
    }
  }

  /**
   * TXTファイルを読み込む
   */
  function readTxt(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('テキストファイルの読み込みに失敗しました。'));
      reader.readAsText(file);
    });
  }

  /**
   * PDFファイルからテキストを抽出する (pdf.js使用)
   */
  async function readPdf(file) {
    if (typeof pdfjsLib === 'undefined') {
      throw new Error('PDF解析ライブラリがロードされていません。ネットワーク接続を確認してください。');
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }

      return fullText.trim();
    } catch (err) {
      console.error('PDF Parse Error:', err);
      throw new Error('PDFからのテキスト抽出に失敗しました。');
    }
  }

  /**
   * DOCXファイルからテキストを抽出する (mammoth.js使用)
   */
  async function readDocx(file) {
    if (typeof mammoth === 'undefined') {
      throw new Error('DOCX解析ライブラリがロードされていません。ネットワーク接続を確認してください。');
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value.trim();
    } catch (err) {
      console.error('DOCX Parse Error:', err);
      throw new Error('Wordファイル(DOCX)からのテキスト抽出に失敗しました。');
    }
  }

  /**
   * Excelファイルからテキストを抽出する (SheetJS使用)
   */
  async function readExcel(file) {
    if (typeof XLSX === 'undefined') {
      throw new Error('Excel解析ライブラリがロードされていません。ネットワーク接続を確認してください。');
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      let fullText = '';

      workbook.SheetNames.forEach(sheetName => {
        fullText += `\n--- シート名: ${sheetName} ---\n`;
        const worksheet = workbook.Sheets[sheetName];
        
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        rows.forEach(row => {
          if (!row || row.length === 0) return;
          const rowText = row.filter(cell => cell !== undefined && cell !== null && cell !== '').join(' ');
          if (rowText.trim()) {
            fullText += rowText + '\n';
          }
        });
      });

      return fullText.trim();
    } catch (err) {
      console.error('Excel Parse Error:', err);
      throw new Error('Excelファイルからのテキスト抽出に失敗しました。');
    }
  }

  return { extractText };
})();
