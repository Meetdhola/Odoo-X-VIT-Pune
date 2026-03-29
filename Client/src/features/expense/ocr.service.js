import Tesseract from 'tesseract.js';

export const ocrService = {
  scanReceipt: async (imageFile, onProgress) => {
    try {
      const result = await Tesseract.recognize(
        imageFile,
        'eng',
        { 
          logger: m => {
            if (m.status === 'recognizing text' && onProgress) {
              onProgress(Math.floor(m.progress * 100));
            }
          } 
        }
      );

      const text = result.data.text;
      console.log('--- OCR RAW TEXT ---');
      console.log(text);

      return parseReceiptText(text);
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Failed to scan receipt');
    }
  }
};

const parseReceiptText = (text) => {
  const lines = text.split('\n');
  let amount = 0;
  let date = new Date().toISOString().split('T')[0];
  let vendor = '';

  // 1. Extract Amount (Look for currencies or 'Total' labels)
  const amountRegex = /(?:total|amount|sum|net|due|paid)[:\s]*[\$|₹|€|£]?\s?(\d+[\.,]\d{2})/i;
  const amountMatch = text.match(amountRegex);
  if (amountMatch) {
    amount = parseFloat(amountMatch[1].replace(',', '.'));
  } else {
    // Fallback: Find the largest number that looks like a decimal
    const allNumbers = text.match(/(\d+[\.,]\d{2})/g);
    if (allNumbers) {
      const parsedNumbers = allNumbers.map(n => parseFloat(n.replace(',', '.')));
      amount = Math.max(...parsedNumbers);
    }
  }

  // 2. Extract Date
  const dateRegex = /(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})|(\d{4}[\/-]\d{1,2}[\/-]\d{1,2})/;
  const dateMatch = text.match(dateRegex);
  if (dateMatch) {
    try {
      const d = new Date(dateMatch[0]);
      if (!isNaN(d.getTime())) {
        date = d.toISOString().split('T')[0];
      }
    } catch (e) {}
  }

  // 3. Extract Vendor (Assume it's in the first few lines)
  if (lines.length > 0) {
    vendor = lines[0].trim();
    if (vendor.length < 3 && lines[1]) vendor = lines[1].trim();
  }

  return {
    amount,
    date,
    description: vendor || 'Receipt Scan',
    vendor: vendor || 'Unknown Vendor',
    confidence: 0.85 // Mock confidence
  };
};
