import { SpreadsheetData } from './spreadsheetParser';

export interface DynamicConfig {
  role: string;
  company: string;
  products: string[];
  targetCustomers: string[];
  salesApproach: string[];
  keyFeatures: string[];
  pricing: string;
  delivery: string;
  payment: string;
}

/**
 * Analyze spreadsheet content to determine the business type and generate appropriate config
 */
export function analyzeBusinessType(data: SpreadsheetData): DynamicConfig {
  const config: DynamicConfig = {
    role: '営業担当',
    company: 'エックス商事',
    products: [],
    targetCustomers: [],
    salesApproach: [],
    keyFeatures: [],
    pricing: '',
    delivery: '',
    payment: ''
  };

  // Analyze all sheets to determine business type
  Object.entries(data.sheets).forEach(([sheetName, sheetData]) => {
    // Look for product information
    if (sheetName.includes('商品') || sheetName.includes('商品')) {
      for (let i = 1; i < sheetData.length; i++) {
        const row = sheetData[i];
        if (row.length > 0 && row[0]) {
          const productName = row[0].toString();
          config.products.push(productName);
          
          // Analyze product type from name
          if (productName.includes('米') || productName.includes('ライス') || productName.includes('ご飯')) {
            config.role = '米販売担当';
            config.targetCustomers.push('お弁当屋', 'レストラン', '食堂');
          } else if (productName.includes('野菜') || productName.includes('キャベツ') || productName.includes('人参') || productName.includes('玉ねぎ')) {
            config.role = '野菜販売担当';
            config.targetCustomers.push('レストラン', '食堂', 'スーパー', '青果店');
          } else if (productName.includes('肉') || productName.includes('牛肉') || productName.includes('豚肉') || productName.includes('鶏肉')) {
            config.role = '肉類販売担当';
            config.targetCustomers.push('レストラン', '食堂', '精肉店');
          } else if (productName.includes('魚') || productName.includes('海鮮') || productName.includes('刺身')) {
            config.role = '海鮮販売担当';
            config.targetCustomers.push('寿司屋', 'レストラン', '食堂');
          }
        }
      }
    }

    // Look for company information
    if (sheetName.includes('会社') || sheetName.includes('情報')) {
      for (let i = 1; i < sheetData.length; i++) {
        const row = sheetData[i];
        if (row.length > 0 && row[0] && row[1]) {
          const key = row[0].toString().toLowerCase();
          const value = row[1].toString();
          
          if (key.includes('会社名') || key.includes('社名')) {
            config.company = value;
          }
        }
      }
    }

    // Look for pricing information
    if (sheetName.includes('商品') || sheetName.includes('価格')) {
      for (let i = 1; i < sheetData.length; i++) {
        const row = sheetData[i];
        if (row.length > 1 && row[1]) {
          const price = row[1].toString();
          if (price.includes('円') || price.includes('¥')) {
            config.pricing = `価格は${price}からとなっております`;
            break;
          }
        }
      }
    }
  });

  // Set default values if not found
  if (config.products.length === 0) {
    config.products = ['高品質な商品'];
  }
  
  if (config.targetCustomers.length === 0) {
    config.targetCustomers = ['お客様'];
  }

  // Generate sales approach based on business type
  if (config.role.includes('野菜')) {
    config.salesApproach = [
      '新鮮な野菜の品質をアピール',
      '産地直送のメリットを説明',
      '季節の野菜の提案',
      '栄養価の高さを強調'
    ];
    config.keyFeatures = ['新鮮さ', '産地直送', '季節感', '栄養価'];
  } else if (config.role.includes('肉')) {
    config.salesApproach = [
      '肉の品質と安全性をアピール',
      'トレーサビリティの説明',
      '調理方法の提案',
      '保存方法のアドバイス'
    ];
    config.keyFeatures = ['品質', '安全性', 'トレーサビリティ', '鮮度'];
  } else if (config.role.includes('海鮮')) {
    config.salesApproach = [
      '鮮度の良さをアピール',
      '産地の説明',
      '調理方法の提案',
      '保存方法のアドバイス'
    ];
    config.keyFeatures = ['鮮度', '産地', '品質', '安全性'];
  } else {
    // Default for rice or other products
    config.salesApproach = [
      '商品の品質をアピール',
      'お客様のニーズに合わせた提案',
      '価格の妥当性を説明',
      'アフターサービスの充実'
    ];
    config.keyFeatures = ['品質', '価格', 'サービス', '信頼性'];
  }

  // Set default business terms
  config.delivery = '全国配送対応、関東圏内は翌日配送';
  config.payment = '月末締め翌月20日払いの掛取引';

  return config;
}

/**
 * Generate dynamic conversation instructions based on spreadsheet content
 */
export function generateDynamicInstructions(data: SpreadsheetData): string {
  const config = analyzeBusinessType(data);
  
  const instructions = `System settings:
Tool use: enabled.

Instructions:
- You are ${config.role} from ${config.company}
- You MUST respond ONLY in native Japanese (日本語)
- Never use English or any other language - only Japanese
- You are calling ${config.targetCustomers.join('、')} to introduce ${config.products.join('、')}
- Be professional, friendly, and sales-oriented
- Use natural Japanese business conversation patterns
- Focus on ${config.products.join('、')} sales and product information
- Be persistent but not pushy
- Always maintain a professional tone
- WAIT for user responses before continuing - don't read long scripts
- Respond naturally to what the user says
- Keep responses concise and conversational

Personality:
- Professional and courteous (礼儀正しく、プロフェッショナル)
- Friendly but business-focused (親しみやすいがビジネス重視)
- Use natural Japanese business expressions
- Speak clearly and at a moderate pace
- Show enthusiasm for your products
- Be conversational, not scripted

Sales Approach:
- Start with a brief, polite introduction
- Introduce yourself as ${config.role} from ${config.company}
- Explain that you sell ${config.products.join('、')} to ${config.targetCustomers.join('、')}
- Present your recommended products briefly
- Focus on: ${config.keyFeatures.join('、')}
- Offer free samples
- Listen to user responses and respond appropriately
- Handle objections professionally
- Collect customer information naturally through conversation
- Don't read long scripts - have natural dialogue

Product Knowledge:
- You sell ${config.products.join('、')} specifically for ${config.targetCustomers.join('、')}
- Main products include: ${config.products.join('、')}
- ${config.pricing}
- Minimum order varies by product
- Payment terms: ${config.payment}
- Delivery: ${config.delivery}
- Orders via email
- Closed on weekends and holidays

IMPORTANT: 
- You are a ${config.role} waiting for the customer to speak first
- Wait for the user to say something before responding
- When the user speaks, respond naturally and professionally
- Don't start the conversation automatically - let the user initiate
- Respond to what the user actually says
- Keep the conversation natural and interactive
- Be ready to help when the user speaks
- Use the spreadsheet data to provide accurate, relevant information`;

  return instructions;
}
