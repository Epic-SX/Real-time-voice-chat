import * as XLSX from 'xlsx';

export interface SpreadsheetData {
  fileName: string;
  sheets: { [sheetName: string]: any[][] };
  rawData: any;
}

export function parseSpreadsheet(file: File, data: ArrayBuffer): SpreadsheetData {
  const workbook = XLSX.read(data, { type: 'array' });
  const sheets: { [sheetName: string]: any[][] } = {};
  
  // Parse each sheet
  workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    sheets[sheetName] = jsonData as any[][];
  });

  return {
    fileName: file.name,
    sheets,
    rawData: workbook
  };
}

// Define interfaces for better type safety
interface ProductInfo {
  name: string;
  price: string;
  unit: string;
  features: string;
  description: string;
  benefits: string;
  target: string;
}

interface SalesScript {
  situation: string;
  script: string;
  keyPoints: string;
  response: string;
}

interface FAQData {
  question: string;
  answer: string;
  category: string;
}

interface OtherData {
  sheet: string;
  data: any[];
}

export function formatSpreadsheetDataForAI(data: SpreadsheetData): string {
  let formattedData = `=== 営業データベース (${data.fileName}) ===\n\n`;
  
  // Extract and format different types of data
  const productInfo: ProductInfo[] = [];
  const salesScripts: SalesScript[] = [];
  const companyInfo: { [key: string]: string } = {};
  const faqData: FAQData[] = [];
  const otherData: OtherData[] = [];
  
  Object.entries(data.sheets).forEach(([sheetName, sheetData]) => {
    if (sheetName === '商品情報' || sheetName.includes('商品') || sheetName.includes('商品')) {
      // Enhanced product information extraction
      const headers = sheetData[0] || [];
      for (let i = 1; i < sheetData.length; i++) {
        const row = sheetData[i];
        if (row.length > 0 && row[0]) {
          const product = {
            name: row[0] || '',
            price: row[1] || '',
            unit: row[2] || 'kg',
            features: row[3] || '',
            description: row[4] || '',
            benefits: row[5] || '',
            target: row[6] || ''
          };
          productInfo.push(product);
        }
      }
    } else if (sheetName === '営業スクリプト' || sheetName.includes('営業') || sheetName.includes('スクリプト')) {
      // Enhanced sales scripts extraction
      for (let i = 1; i < sheetData.length; i++) {
        const row = sheetData[i];
        if (row.length > 0 && row[0]) {
          salesScripts.push({
            situation: row[0] || '',
            script: row[1] || '',
            keyPoints: row[2] || '',
            response: row[3] || ''
          });
        }
      }
    } else if (sheetName === '会社情報' || sheetName.includes('会社') || sheetName.includes('情報')) {
      // Enhanced company information
      for (let i = 1; i < sheetData.length; i++) {
        const row = sheetData[i];
        if (row.length > 0 && row[0] && row[1]) {
          companyInfo[row[0] as string] = row[1] as string;
        }
      }
    } else if (sheetName === 'FAQ・回答' || sheetName.includes('FAQ') || sheetName.includes('質問')) {
      // Enhanced FAQ extraction
      for (let i = 1; i < sheetData.length; i++) {
        const row = sheetData[i];
        if (row.length > 0 && row[0]) {
          faqData.push({
            question: row[0] || '',
            answer: row[1] || '',
            category: row[2] || '一般'
          });
        }
      }
    } else {
      // Other data
      for (let i = 1; i < sheetData.length; i++) {
        const row = sheetData[i];
        if (row.length > 0) {
          otherData.push({
            sheet: sheetName,
            data: row.filter(cell => cell && cell.toString().trim())
          });
        }
      }
    }
  });
  
  // Format product information
  if (productInfo.length > 0) {
    formattedData += '=== 商品情報 ===\n';
    productInfo.forEach((product, index) => {
      formattedData += `商品${index + 1}: ${product.name}\n`;
      if (product.price) formattedData += `価格: ${product.price}円/${product.unit}\n`;
      if (product.features) formattedData += `特徴: ${product.features}\n`;
      if (product.description) formattedData += `説明: ${product.description}\n`;
      if (product.benefits) formattedData += `メリット: ${product.benefits}\n`;
      if (product.target) formattedData += `対象: ${product.target}\n`;
      formattedData += '\n';
    });
  }
  
  // Format sales scripts
  if (salesScripts.length > 0) {
    formattedData += '=== 営業会話パターン ===\n';
    salesScripts.forEach((script, index) => {
      formattedData += `パターン${index + 1}: ${script.situation}\n`;
      if (script.script) formattedData += `会話例: ${script.script}\n`;
      if (script.keyPoints) formattedData += `ポイント: ${script.keyPoints}\n`;
      if (script.response) formattedData += `想定回答: ${script.response}\n`;
      formattedData += '\n';
    });
  }
  
  // Format company information
  if (Object.keys(companyInfo).length > 0) {
    formattedData += '=== 会社情報 ===\n';
    Object.entries(companyInfo).forEach(([key, value]) => {
      formattedData += `${key}: ${value}\n`;
    });
    formattedData += '\n';
  }
  
  // Format FAQ
  if (faqData.length > 0) {
    formattedData += '=== よくある質問 ===\n';
    faqData.forEach((faq, index) => {
      formattedData += `Q${index + 1}: ${faq.question}\n`;
      formattedData += `A: ${faq.answer}\n`;
      if (faq.category) formattedData += `カテゴリ: ${faq.category}\n`;
      formattedData += '\n';
    });
  }
  
  // Format other data
  if (otherData.length > 0) {
    formattedData += '=== その他の情報 ===\n';
    otherData.forEach((item, index) => {
      formattedData += `${item.sheet}: ${item.data.join(' | ')}\n`;
    });
    formattedData += '\n';
  }
  
  return formattedData;
}

/**
 * Generate dynamic conversation context based on spreadsheet content
 */
export function generateDynamicContext(data: SpreadsheetData): string {
  const context = {
    hasProducts: false,
    hasScripts: false,
    hasCompanyInfo: false,
    hasFAQ: false,
    productCount: 0,
    scriptCount: 0,
    faqCount: 0
  };
  
  // Analyze spreadsheet content
  Object.entries(data.sheets).forEach(([sheetName, sheetData]) => {
    if (sheetName.includes('商品') || sheetName.includes('商品')) {
      context.hasProducts = true;
      context.productCount = Math.max(0, sheetData.length - 1);
    } else if (sheetName.includes('営業') || sheetName.includes('スクリプト')) {
      context.hasScripts = true;
      context.scriptCount = Math.max(0, sheetData.length - 1);
    } else if (sheetName.includes('会社') || sheetName.includes('情報')) {
      context.hasCompanyInfo = true;
    } else if (sheetName.includes('FAQ') || sheetName.includes('質問')) {
      context.hasFAQ = true;
      context.faqCount = Math.max(0, sheetData.length - 1);
    }
  });
  
  // Generate context-specific instructions
  let dynamicInstructions = '';
  
  if (context.hasProducts) {
    dynamicInstructions += `\n=== 商品販売モード ===\n- ${context.productCount}種類の商品データが利用可能です\n- お客様のニーズに応じて適切な商品を紹介してください\n- 価格、特徴、メリットを自然に会話に織り込んでください\n`;
  }
  
  if (context.hasScripts) {
    dynamicInstructions += `\n=== 営業会話モード ===\n- ${context.scriptCount}種類の会話パターンが利用可能です\n- お客様の反応に応じて適切な会話パターンを参考にしてください\n- スクリプトをそのまま読まず、自然に会話してください\n`;
  }
  
  if (context.hasCompanyInfo) {
    dynamicInstructions += `\n=== 会社情報モード ===\n- 会社の信頼性を示す情報が利用可能です\n- 必要に応じて会社情報を自然に会話に含めてください\n`;
  }
  
  if (context.hasFAQ) {
    dynamicInstructions += `\n=== FAQ対応モード ===\n- ${context.faqCount}種類のよくある質問への回答が利用可能です\n- お客様の質問に対して適切な回答を提供してください\n`;
  }
  
  return dynamicInstructions;
}
