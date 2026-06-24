/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  Copy, 
  FileText, 
  Sparkles, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Download, 
  HelpCircle,
  Cpu, 
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import { CalcState, DesignItem, PriceUnit, LengthUnit, Client } from '../types';
import { fmt, numToAr, safe, numToFr, safeAlert, safeConfirm } from '../utils';

interface PricingCalculatorProps {
  clients: Client[];
  initialState: CalcState;
  onSaveState: (state: CalcState) => void;
  brandLogo: string | null;
  pdfLang?: 'ar' | 'fr';
  setPdfLang?: (lang: 'ar' | 'fr') => void;
  pdfShowLogo?: boolean;
  setPdfShowLogo?: (v: boolean) => void;
  pdfShowClient?: boolean;
  setPdfShowClient?: (v: boolean) => void;
  pdfShowItemDetails?: boolean;
  setPdfShowItemDetails?: (v: boolean) => void;
  pdfShowItemPrices?: boolean;
  setPdfShowItemPrices?: (v: boolean) => void;
  pdfShowBreakdown?: boolean;
  setPdfShowBreakdown?: (v: boolean) => void;
  pdfShowTafqeet?: boolean;
  setPdfShowTafqeet?: (v: boolean) => void;
  pdfShowNotes?: boolean;
  setPdfShowNotes?: (v: boolean) => void;
}

const TEMPLATES = [
  { name: 'بوستر (A2)', length: 42, width: 59.4, unitL: 'cm', unitW: 'cm', price: 0.8, priceUnit: 'm2' as PriceUnit, basePrice: 1500 },
  { name: 'رول أب عمودي', length: 85, width: 200, unitL: 'cm', unitW: 'cm', price: 1.2, priceUnit: 'm2' as PriceUnit, basePrice: 2000 },
  { name: 'بروشور A4 مطوي', length: 21, width: 29.7, unitL: 'cm', unitW: 'cm', price: 0.5, priceUnit: 'm2' as PriceUnit, basePrice: 3000 },
  { name: 'منشور سوشيال ميديا', length: 1080, width: 1080, unitL: 'px', unitW: 'px', price: 1500, priceUnit: 'fixed' as PriceUnit, basePrice: 0 },
  { name: 'غلاف كتاب فني', length: 15, width: 23, unitL: 'cm', unitW: 'cm', price: 0.9, priceUnit: 'm2' as PriceUnit, basePrice: 2500 },
  { name: 'لافتة محلات ضخمة', length: 3, width: 2, unitL: 'm', unitW: 'm', price: 0.7, priceUnit: 'm2' as PriceUnit, basePrice: 4000 },
];

export default function PricingCalculator({
  clients,
  initialState,
  onSaveState,
  brandLogo,
  pdfLang: propPdfLang,
  setPdfLang: propSetPdfLang,
  pdfShowLogo: propPdfShowLogo,
  setPdfShowLogo: propSetPdfShowLogo,
  pdfShowClient: propPdfShowClient,
  setPdfShowClient: propSetPdfShowClient,
  pdfShowItemDetails: propPdfShowItemDetails,
  setPdfShowItemDetails: propSetPdfShowItemDetails,
  pdfShowItemPrices: propPdfShowItemPrices,
  setPdfShowItemPrices: propSetPdfShowItemPrices,
  pdfShowBreakdown: propPdfShowBreakdown,
  setPdfShowBreakdown: propSetPdfShowBreakdown,
  pdfShowTafqeet: propPdfShowTafqeet,
  setPdfShowTafqeet: propSetPdfShowTafqeet,
  pdfShowNotes: propPdfShowNotes,
  setPdfShowNotes: propSetPdfShowNotes,
}: PricingCalculatorProps) {
  // Calculator Form States
  const [client, setClient] = useState(initialState.client || '');
  const [offer, setOffer] = useState(initialState.offer || '');
  const [deadline, setDeadline] = useState(initialState.deadline || '');
  const [notes, setNotes] = useState(initialState.notes || '');
  const [discount, setDiscount] = useState<number>(initialState.discount ?? 0);
  const [tax, setTax] = useState<number>(initialState.tax ?? 0);
  const [margin, setMargin] = useState<number>(initialState.margin ?? 0);
  const [designs, setDesigns] = useState<DesignItem[]>(initialState.designs || []);
  const [draft, setDraft] = useState<boolean>(initialState.draft || false);

  // PDF Document Customization & Export Language States
  const [pdfLang, setPdfLang] = useState<'ar' | 'fr'>('ar');
  const [pdfShowLogo, setPdfShowLogo] = useState<boolean>(true);
  const [pdfShowClient, setPdfShowClient] = useState<boolean>(true);
  const [pdfShowItemDetails, setPdfShowItemDetails] = useState<boolean>(true);
  const [pdfShowItemPrices, setPdfShowItemPrices] = useState<boolean>(true);
  const [pdfShowBreakdown, setPdfShowBreakdown] = useState<boolean>(true);
  const [pdfShowTafqeet, setPdfShowTafqeet] = useState<boolean>(true);
  const [pdfShowNotes, setPdfShowNotes] = useState<boolean>(true);

  // Sync props to state if provided
  useEffect(() => {
    if (propPdfLang !== undefined) setPdfLang(propPdfLang);
  }, [propPdfLang]);
  useEffect(() => {
    if (propPdfShowLogo !== undefined) setPdfShowLogo(propPdfShowLogo);
  }, [propPdfShowLogo]);
  useEffect(() => {
    if (propPdfShowClient !== undefined) setPdfShowClient(propPdfShowClient);
  }, [propPdfShowClient]);
  useEffect(() => {
    if (propPdfShowItemDetails !== undefined) setPdfShowItemDetails(propPdfShowItemDetails);
  }, [propPdfShowItemDetails]);
  useEffect(() => {
    if (propPdfShowItemPrices !== undefined) setPdfShowItemPrices(propPdfShowItemPrices);
  }, [propPdfShowItemPrices]);
  useEffect(() => {
    if (propPdfShowBreakdown !== undefined) setPdfShowBreakdown(propPdfShowBreakdown);
  }, [propPdfShowBreakdown]);
  useEffect(() => {
    if (propPdfShowTafqeet !== undefined) setPdfShowTafqeet(propPdfShowTafqeet);
  }, [propPdfShowTafqeet]);
  useEffect(() => {
    if (propPdfShowNotes !== undefined) setPdfShowNotes(propPdfShowNotes);
  }, [propPdfShowNotes]);

  // Wrappers to update both local state and parent props if present
  const updatePdfLang = (val: 'ar' | 'fr') => {
    setPdfLang(val);
    if (propSetPdfLang) propSetPdfLang(val);
  };
  const updatePdfShowLogo = (val: boolean) => {
    setPdfShowLogo(val);
    if (propSetPdfShowLogo) propSetPdfShowLogo(val);
  };
  const updatePdfShowClient = (val: boolean) => {
    setPdfShowClient(val);
    if (propSetPdfShowClient) propSetPdfShowClient(val);
  };
  const updatePdfShowItemDetails = (val: boolean) => {
    setPdfShowItemDetails(val);
    if (propSetPdfShowItemDetails) propSetPdfShowItemDetails(val);
  };
  const updatePdfShowItemPrices = (val: boolean) => {
    setPdfShowItemPrices(val);
    if (propSetPdfShowItemPrices) propSetPdfShowItemPrices(val);
  };
  const updatePdfShowBreakdown = (val: boolean) => {
    setPdfShowBreakdown(val);
    if (propSetPdfShowBreakdown) propSetPdfShowBreakdown(val);
  };
  const updatePdfShowTafqeet = (val: boolean) => {
    setPdfShowTafqeet(val);
    if (propSetPdfShowTafqeet) propSetPdfShowTafqeet(val);
  };
  const updatePdfShowNotes = (val: boolean) => {
    setPdfShowNotes(val);
    if (propSetPdfShowNotes) propSetPdfShowNotes(val);
  };

  // AI Assistant States
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiResult, setAiResult] = useState<{
    suggested_items: any[];
    negotiation_tip: string;
    client_proposal: string;
  } | null>(null);

  // Generate unique ID
  const generateId = () => String(Math.random().toString(36).substr(2, 9));

  // Initialize offer number if empty
  useEffect(() => {
    if (!offer) {
      const year = new Date().getFullYear();
      const num = Math.floor(1000 + Math.random() * 9000);
      setOffer(`OFF-${year}-${num}`);
    }
  }, [offer]);

  // Sync state to parent cache & local storage
  const handleSave = (currentDesigns = designs) => {
    onSaveState({
      client,
      offer,
      deadline,
      notes,
      discount,
      tax,
      margin,
      designs: currentDesigns,
      draft,
    });
  };

  useEffect(() => {
    handleSave();
  }, [client, offer, deadline, notes, discount, tax, margin, draft]);

  // Dimension helpers (convert inputs to Metric cm)
  const toCm = (val: string | number, unit: LengthUnit): number => {
    const num = parseFloat(String(val)) || 0;
    if (unit === 'mm') return num / 10;
    if (unit === 'm') return num * 100;
    if (unit === 'px') return num * 0.026458; // Standard pixel is roughly 0.026 cm at 96 DPI
    return num; // Default cm
  };

  // Calculations for single design item
  const calcItem = (item: DesignItem) => {
    const lCm = toCm(item.length, item.unitL);
    const wCm = toCm(item.width, item.unitW);
    const areaCm2 = lCm * wCm;
    
    const baseP = parseFloat(String(item.basePrice)) || 0;
    const rate = parseFloat(String(item.price)) || 0;
    const copiesNum = parseInt(String(item.copies)) || 1;
    const itemDisc = parseFloat(String(item.individualDiscount)) || 0;

    let calcedCost = 0;
    if (item.priceUnit === 'fixed') {
      calcedCost = rate;
    } else if (item.priceUnit === 'cm2') {
      calcedCost = areaCm2 * rate;
    } else if (item.priceUnit === 'm2') {
      calcedCost = (areaCm2 / 10000) * rate; // Convert cm² to m²
    }

    const totalBefore = (baseP + calcedCost) * copiesNum;
    const discAmount = totalBefore * (itemDisc / 100);
    const finalPrice = Math.max(0, totalBefore - discAmount);

    return { areaCm2, totalBefore, finalPrice, discAmount };
  };

  // Add standard design item
  const addDesignItem = (customFields?: Partial<DesignItem>) => {
    const newItem: DesignItem = {
      id: generateId(),
      desc: customFields?.desc || '',
      length: customFields?.length !== undefined ? customFields.length : '',
      width: customFields?.width !== undefined ? customFields.width : '',
      unitL: customFields?.unitL || 'cm',
      unitW: customFields?.unitW || 'cm',
      basePrice: customFields?.basePrice !== undefined ? customFields.basePrice : '',
      price: customFields?.price !== undefined ? customFields.price : '',
      priceUnit: customFields?.priceUnit || 'm2',
      copies: customFields?.copies || 1,
      individualDiscount: customFields?.individualDiscount || 0,
    };
    
    const updated = [...designs, newItem];
    setDesigns(updated);
    handleSave(updated);
  };

  // Render first sample details if empty
  useEffect(() => {
    if (designs.length === 0) {
      addDesignItem({ desc: 'تصميم لافتة إعلانية' });
    }
  }, []);

  // Set selected template
  const applyTemplate = (index: number, itemId: string) => {
    const t = TEMPLATES[index];
    if (!t) return;
    setDesigns(
      designs.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            desc: t.name,
            length: t.length,
            width: t.width,
            unitL: t.unitL as LengthUnit,
            unitW: t.unitW as LengthUnit,
            price: t.price,
            priceUnit: t.priceUnit,
            basePrice: t.basePrice,
          };
        }
        return item;
      })
    );
  };

  const rmItem = (id: string) => {
    if (designs.length <= 1) return;
    const updated = designs.filter((d) => d.id !== id);
    setDesigns(updated);
    handleSave(updated);
  };

  const dupItem = (id: string) => {
    const findItem = designs.find((d) => d.id === id);
    if (!findItem) return;
    const dup: DesignItem = {
      ...findItem,
      id: generateId(),
      desc: findItem.desc ? `${findItem.desc} (نسخة)` : 'نسخة تصميم',
    };
    const updated = [...designs];
    const idx = designs.findIndex((d) => d.id === id);
    updated.splice(idx + 1, 0, dup);
    setDesigns(updated);
    handleSave(updated);
  };

  const updateItemField = (id: string, field: keyof DesignItem, val: any) => {
    const updated = designs.map((d) => {
      if (d.id === id) {
        return { ...d, [field]: val };
      }
      return d;
    });
    setDesigns(updated);
    handleSave(updated);
  };

  // Summarize overall calculations
  let sumAreaCm2 = 0;
  let sumBeforeVal = 0;

  designs.forEach((item) => {
    const { areaCm2, finalPrice } = calcItem(item);
    sumAreaCm2 += areaCm2 * (parseInt(String(item.copies)) || 1);
    sumBeforeVal += finalPrice;
  });

  const gdAmount = sumBeforeVal * (discount / 100);
  const afterDiscount = sumBeforeVal - gdAmount;
  const taxAmount = afterDiscount * (tax / 100);
  const beforeProfit = afterDiscount + taxAmount;
  const profitMarginAmount = beforeProfit * (margin / 100);
  const grandTotal = beforeProfit + profitMarginAmount;

  // Clear Form handler
  const resetCalculator = () => {
    if (!safeConfirm('هل أنت متأكد من رغبتك في إفراغ الحاسبة وإعادة البدء؟', true)) return;
    
    // 1. Generate a brand new clean offer ID
    const year = new Date().getFullYear();
    const num = Math.floor(1000 + Math.random() * 9000);
    const newOffer = `OFF-${year}-${num}`;

    // 2. Set the single initial design item
    const startItems = [
      {
        id: generateId(),
        desc: '',
        length: '',
        width: '',
        unitL: 'cm' as LengthUnit,
        unitW: 'cm' as LengthUnit,
        basePrice: '',
        price: '',
        priceUnit: 'm2' as PriceUnit,
        copies: 1,
        individualDiscount: 0,
      },
    ];

    // 3. Update all local states immediately
    setClient('');
    setOffer(newOffer);
    setDeadline('');
    setNotes('');
    setDiscount(0);
    setTax(0);
    setMargin(0);
    setDesigns(startItems);
    setDraft(false);

    // 4. Force save the exact clean state to the parent to prevent any race condition or stale closures
    onSaveState({
      client: '',
      offer: newOffer,
      deadline: '',
      notes: '',
      discount: 0,
      tax: 0,
      margin: 0,
      designs: startItems,
      draft: false,
    });
  };

  // Copy proposal text
  const copyProposal = () => {
    let text = `💎 عرض سعر احترافي 💎\n`;
    text += `رقم العرض: ${offer}\n`;
    if (client) text += `العميل: ${client}\n`;
    if (deadline) text += `تاريخ التسليم المتوقع: ${deadline}\n`;
    text += `------------------------------------\n`;
    text += `قائمة بنود الخدمات والتصاميم:\n`;

    designs.forEach((d, idx) => {
      const { finalPrice } = calcItem(d);
      text += `${idx + 1}. ${d.desc || 'خدمة تصميم'} - الأبعاد ${d.length}×${d.width} (${d.unitL}) | النسخ: ${d.copies} | السعر: ${fmt(finalPrice, 0)} دج\n`;
    });

    text += `------------------------------------\n`;
    text += `الإجمالي النهائي: ${fmt(grandTotal, 0)} دينار جزائري (دج)\n`;
    text += `فقط ${numToAr(grandTotal)} دينار جزائري لا غير.\n`;
    if (notes) text += `\nملاحظات وشروط إضافية:\n${notes}\n`;

    navigator.clipboard.writeText(text).then(() => {
      safeAlert('📋 تم نسخ تفاصيل عرض السعر المنسق للحافظة بنجاح!');
    });
  };

  // Download CSV
  const exportToCSV = () => {
    let csv = '\ufeffالوصف,الطول,العرض,وحدة الطول,سعر المساحة,الوحدة المحسوبة,النسخ,خصم البند,السعر النهائي\n';
    designs.forEach((d) => {
      const { finalPrice } = calcItem(d);
      csv += `"${d.desc || 'خدمة'}","${d.length}","${d.width}","${d.unitL}","${d.price}","${d.priceUnit}","${d.copies}","${d.individualDiscount}","${finalPrice.toFixed(2)}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `عرض_سعر_${offer}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Native Print PDF
  const triggerPrintPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const isAr = pdfLang === 'ar';
    const dir = isAr ? 'rtl' : 'ltr';
    const font = isAr 
      ? "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" 
      : "'Helvetica Neue', Helvetica, Arial, sans-serif";

    const tDocTitle = isAr ? 'عرض سعر رسمي' : 'DEVIS OFFICIEL';
    const tSubtitle = isAr 
      ? 'تطبيق MARKA PRO لإقران وتصميم الأعمال الجرافيكية' 
      : "Application MARKA PRO de gestion d'ateliers de design";
    const tDocNo = isAr ? 'رقم وثيقة العرض:' : 'N° Devis :';
    const tDocDate = isAr ? 'التاريخ:' : 'Date :';
    
    const tClientLabel = isAr ? 'اسم العميل الكريم:' : 'Nom du Client :';
    const tClientVal = client ? safe(client) : (isAr ? 'موقر من دون عنوان' : 'Client non spécifié');
    
    const tDeadlineLabel = isAr ? 'تاريخ التسليم والالتزام:' : 'Délai de Livraison :';
    const tDeadlineVal = deadline ? safe(deadline) : (isAr ? 'غير محدد' : 'Non spécifié');
    
    const tCurrencyLabel = isAr ? 'الحساب والعملة:' : 'Compte & Devise :';
    const tCurrencyVal = isAr ? 'دينار جزائري (DZD)' : 'Dinar Algérien (DZD)';

    const tColNum = '#';
    const tColDesc = isAr ? 'الوصف وبند التصميم الفني' : 'Description / Service';
    const tColDims = isAr ? 'الأبعاد والمقاسات' : 'Dimensions & Unités';
    const tColCopies = isAr ? 'عدد النسخ' : 'Quantité';
    const tColPrice = isAr ? 'القيمة الصافية' : 'Montant Net';
    
    const tTotalBefore = isAr ? 'إجمالي البنود قبل الضرائب والخصومات:' : 'Sous-total HT :';
    const tDiscountApplied = isAr ? `الخصم العام الممنوح (${discount}%):` : `Remise générale (${discount}%) :`;
    const tTaxApplied = isAr ? `ضريبة القيمة المضافة الإضافية (${tax}%):` : `TVA (${tax}%) :`;
    const tMarginApplied = isAr ? `خدمة وهوامش التصميم والإلحاحية (${margin}%):` : `Majoration d'Urgence & Marge (${margin}%) :`;
    const tGrandTotal = isAr ? 'الإجمالي النهائي:' : 'Total Général TTC :';
    
    const currencyUnit = isAr ? 'دج' : 'DZD';

    const tTafqeetAr = `فقط: ${numToAr(grandTotal)} دينار جزائري لا غير.`;
    const tTafqeetFr = `Arrêté à la somme de : ${numToFr(grandTotal)} Dinars Algériens.`;
    const tTafqeet = isAr ? tTafqeetAr : tTafqeetFr;

    const tConditionsTitle = isAr ? '📋 شروط السداد ومستجدات الشروط:' : '📋 Conditions de paiement & Remarques :';
    const tFooter = isAr 
      ? 'سعدنا بالتعامل معكم. تم توليد وطباعة الوثيقة بواسطة نظام MARKA PRO لإدارة الاستوديوهات بنجاح.' 
      : 'Nous sommes honorés de votre confiance. Document généré avec succès via l\'application MARKA PRO.';

    // Generate columns headers dynamically
    let ths = `<th>${tColNum}</th>`;
    ths += `<th style="text-align: ${isAr ? 'right' : 'left'};">${tColDesc}</th>`;
    if (pdfShowItemDetails) {
      ths += `<th>${tColDims}</th>`;
      ths += `<th>${tColCopies}</th>`;
    }
    if (pdfShowItemPrices) {
      ths += `<th style="text-align: ${isAr ? 'left' : 'right'};">${tColPrice}</th>`;
    }

    // Build row body
    let itemsMarkup = '';
    designs.forEach((d, idx) => {
      const { finalPrice } = calcItem(d);
      let tds = `<td>${idx + 1}</td>`;
      tds += `<td style="text-align: ${isAr ? 'right' : 'left'}; font-weight: bold;">${safe(d.desc || (isAr ? 'تصميم مخصص' : 'Design Personnalisé'))}</td>`;
      
      if (pdfShowItemDetails) {
        tds += `<td>${d.length}×${d.width} ${d.unitL}</td>`;
        tds += `<td>${d.copies}</td>`;
      }
      
      if (pdfShowItemPrices) {
        tds += `<td style="text-align: ${isAr ? 'left' : 'right'}; font-family: monospace;">${fmt(finalPrice, 0)} ${currencyUnit}</td>`;
      }
      
      itemsMarkup += `<tr class="item-row">${tds}</tr>`;
    });

    const isLogo = (brandLogo && pdfShowLogo) ? `<img src="${brandLogo}" style="max-height: 80px; margin-bottom: 12px; display: block;" />` : '';

    // Build Client section
    let clientSectionMarkup = '';
    if (pdfShowClient) {
      clientSectionMarkup = `
        <div class="meta-section">
          <div class="meta-grid">
            <div class="meta-item"><strong>${tClientLabel}</strong> ${tClientVal}</div>
            <div class="meta-item"><strong>${tDeadlineLabel}</strong> ${tDeadlineVal}</div>
            <div class="meta-item"><strong>${tCurrencyLabel}</strong> ${tCurrencyVal}</div>
          </div>
        </div>
      `;
    }

    // Build Totals section
    let totalsMarkup = '';
    if (pdfShowBreakdown) {
      totalsMarkup += `
        <p style="margin: 4px 0; font-size: 14px; color: #4b5563;">
          ${tTotalBefore} ${fmt(sumBeforeVal, 0)} ${currencyUnit}
        </p>
      `;
      if (discount > 0) {
        totalsMarkup += `
          <p style="margin: 4px 0; font-size: 14px; color: #dc2626;">
            -${tDiscountApplied} ${fmt(gdAmount, 0)} ${currencyUnit}
          </p>
        `;
      }
      if (tax > 0) {
        totalsMarkup += `
          <p style="margin: 4px 0; font-size: 14px; color: #111827;">
            +${tTaxApplied} ${fmt(taxAmount, 0)} ${currencyUnit}
          </p>
        `;
      }
      if (margin > 0) {
        totalsMarkup += `
          <p style="margin: 4px 0; font-size: 14px; color: #059669;">
            +${tMarginApplied} ${fmt(profitMarginAmount, 0)} ${currencyUnit}
          </p>
        `;
      }
    }

    totalsMarkup += `
      <div style="margin-top: 12px; border-top: ${pdfShowBreakdown ? '1px dashed #d1d5db' : 'none'}; padding-top: 8px;">
        <span style="font-size: 14px; font-weight: bold; color: #4b5563;">${tGrandTotal} </span>
        <span class="grand-total">${fmt(grandTotal, 0)} ${currencyUnit}</span>
      </div>
    `;

    // Build Tafqeet section
    let tafqeetMarkup = '';
    if (pdfShowTafqeet) {
      tafqeetMarkup = `
        <div class="tafqeet">
          ${tTafqeet}
        </div>
      `;
    }

    // Build Notes markup
    let notesMarkup = '';
    if (pdfShowNotes && notes) {
      notesMarkup = `
        <div class="notes">
          <h4 style="margin: 0 0 8px; color: #111827;">${tConditionsTitle}</h4>
          <p style="margin: 0; white-space: pre-wrap;">${safe(notes)}</p>
        </div>
      `;
    }

    printWindow.document.write(`
      <html dir="${dir}" lang="${pdfLang}">
        <head>
          <title>${tDocTitle} - MARKA PRO</title>
          <style>
            body {
              font-family: ${font};
              padding: 40px;
              color: #111827;
              line-height: 1.6;
              direction: ${dir};
              text-align: ${isAr ? 'right' : 'left'};
            }
            .header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 3px solid #f0b429;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header-info { text-align: ${isAr ? 'left' : 'right'}; font-size: 13px; color: #4b5563; }
            .meta-section {
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              padding: 18px;
              margin-bottom: 30px;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
            }
            .meta-item { font-size: 14px; text-align: ${isAr ? 'right' : 'left'}; }
            .meta-item strong { color: #374151; }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 40px;
              direction: ${dir};
            }
            th {
              background: #111827;
              color: white;
              padding: 12px;
              font-size: 14px;
              text-align: center;
            }
            td {
              border-bottom: 1px solid #e5e7eb;
              padding: 14px 12px;
              font-size: 13px;
              text-align: center;
            }
            .totals {
              text-align: ${isAr ? 'left' : 'right'};
              margin-top: 20px;
              border-top: 2px solid #e5e7eb;
              padding-top: 15px;
            }
            .grand-total {
              font-size: 26px;
              font-weight: 900;
              color: #b45309;
              font-family: monospace;
            }
            .tafqeet {
              background: #fefbeb;
              border: 1px solid #fde68a;
              color: #b45309;
              padding: 12px;
              border-radius: 8px;
              font-size: 14px;
              font-weight: bold;
              margin-top: 20px;
              text-align: ${isAr ? 'right' : 'left'};
            }
            .notes {
              margin-top: 40px;
              font-size: 13px;
              color: #4b5563;
              border-${isAr ? 'right' : 'left'}: 3px solid #f0b429;
              padding-${isAr ? 'right' : 'left'}: 15px;
              text-align: ${isAr ? 'right' : 'left'};
            }
            .footer-invoice {
              margin-top: 80px;
              text-align: center;
              font-size: 11px;
              color: #9ca3af;
              border-top: 1px solid #e5e7eb;
              padding-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              ${isLogo}
              <h1 style="margin: 0; font-size: 28px; color: #111827;">${tDocTitle}</h1>
              <p style="margin: 3px 0 0; font-size: 14px; color: #b45309; font-weight: bold;">${tSubtitle}</p>
            </div>
            <div class="header-info">
              <p style="margin: 2px 0;"><strong>${tDocNo}</strong> ${offer}</p>
              <p style="margin: 2px 0;"><strong>${tDocDate}</strong> ${new Date().toLocaleDateString(isAr ? 'ar-DZ' : 'fr-FR')}</p>
            </div>
          </div>

          ${clientSectionMarkup}

          <table>
            <thead>
              <tr>
                ${ths}
              </tr>
            </thead>
            <tbody>
              ${itemsMarkup}
            </tbody>
          </table>

          <div class="totals">
            ${totalsMarkup}
          </div>

          ${tafqeetMarkup}

          ${notesMarkup}

          <div class="footer-invoice">
            ${tFooter}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Hit the backend Express server side API route with prompt
  const callAIPricingHelper = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError('');
    setAiResult(null);

    try {
      const response = await fetch('/api/ai-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'فشل توليد الاقتراح بالذكاء الاصطناعي.');
      }
      setAiResult(data);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'فشلت معالجة الطلب، تأكد من إعداد مفتاح API الخاص بالخادم.');
    } finally {
      setAiLoading(false);
    }
  };

  // Populate generated AI items inside current calculator
  const applyAISuggestions = () => {
    if (!aiResult || !aiResult.suggested_items) return;
    
    const formatted: DesignItem[] = aiResult.suggested_items.map((item: any) => ({
      id: generateId(),
      desc: item.desc || 'خدمة تصميم بالذكاء الاصطناعي',
      length: item.length || 1,
      width: item.width || 1,
      unitL: (item.unit || 'px') === 'm' ? 'm' : (item.unit || 'px') === 'cm' ? 'cm' : 'px',
      unitW: (item.unit || 'px') === 'm' ? 'm' : (item.unit || 'px') === 'cm' ? 'cm' : 'px',
      basePrice: item.basePrice || 0,
      price: item.price || 5000,
      priceUnit: (item.priceUnit || 'fixed') as PriceUnit,
      copies: item.copies || 1,
      individualDiscount: item.individualDiscount || 0,
    }));

    if (designs.length === 1 && !designs[0].desc && !designs[0].price) {
      // Replace completely if there is only 1 blank item
      setDesigns(formatted);
      handleSave(formatted);
    } else {
      // Appending to existing items
      const merged = [...designs, ...formatted];
      setDesigns(merged);
      handleSave(merged);
    }

    // Capture proposal summary in notes
    if (aiResult.client_proposal) {
      setNotes((prev) => {
        const textToAppend = `\n---\nملخص الاقتراح المصاحب:\n${aiResult.client_proposal}`;
        return prev ? prev + textToAppend : aiResult.client_proposal;
      });
    }

    safeAlert('✅ تم تطبيق قائمة التصاميم المقترحة ودمج مسودة عرض العميل في قسم الملاحظات بنجاح!');
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Dynamic AI Estimation panel */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-900/40 border border-brand-gold/25 rounded-2xl p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5.5 h-5.5 text-brand-gold animate-pulse" />
            <div>
              <h3 className="font-extrabold text-white text-sm">مساعد التسعير والتخطيط الفوري بذكاء Gemini AI</h3>
              <p className="text-[11px] text-zinc-400">صف للذكاء الاصطناعي طلب العميل ليجيد تقسيم البنود وصياغة عرض احترافي!</p>
            </div>
          </div>
          <span className="text-[10px] bg-brand-gold/10 text-brand-gold border border-brand-gold/20 font-bold px-2 py-0.5 rounded-full uppercase">ذكي جداً</span>
        </div>

        <div className="space-y-3">
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="مثال: اتصل بي زبون يريد هوية بصرية لمحل حلويات تقليدية وبحاجة لتصميم شعار، علب تغليف للحلويات بمقاس 25×15سم، وتصميم 4 فواصل سوشيال ميديا..."
            className="w-full h-20 bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl p-3 text-xs focus:border-brand-gold focus:outline-none transition font-sans resize-y"
          />

          <div className="flex justify-between items-center gap-4">
            <button
              type="button"
              onClick={callAIPricingHelper}
              disabled={aiLoading || !aiPrompt.trim()}
              className="flex items-center justify-center gap-2 bg-brand-gold hover:bg-amber-500 disabled:bg-zinc-800 text-brand-bg disabled:text-zinc-500 font-bold px-5 py-2 rounded-xl text-xs transition cursor-pointer self-start"
            >
              <Sparkles className="w-4 h-4" />
              <span>{aiLoading ? 'جاري تحليل المتطلبات واحتساب المعدل...' : 'تخطيط وتفكيك بنود السعر بالذكاء الاصطناعي'}</span>
            </button>
            <span className="text-[11px] text-zinc-500 font-sans hidden sm:inline">يعتمد على أسعار السوق الوطني التقريبية</span>
          </div>
        </div>

        {/* AI Suggestions Results */}
        {aiError && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-xs text-rose-400 font-sans">
            <strong>⚠️ تنبيه: </strong> {aiError}
          </div>
        )}

        {aiResult && (
          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-4.5 space-y-4 animate-fade-in text-xs font-sans text-zinc-300">
            {/* Split row results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Items break up */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-white text-xs border-r-2 border-brand-gold pr-2">البنود المقترحة للمشروع:</h4>
                <div className="bg-zinc-900/60 border border-zinc-850 rounded-lg p-2.5 space-y-2 max-h-56 overflow-y-auto">
                  {aiResult.suggested_items?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center bg-zinc-950 p-2 rounded border border-zinc-850">
                      <div>
                        <div className="font-bold text-white text-[11px]">{item.desc}</div>
                        <div className="text-[10px] text-zinc-400">
                          {item.length}×{item.width} {item.unit} | {item.priceUnit === 'fixed' ? 'سعر ثابت' : `حساب بالمساحة`}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-brand-gold text-[11px]">{fmt(item.price, 0)} دج</span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={applyAISuggestions}
                  className="w-full py-2 bg-brand-gold text-brand-bg font-bold rounded-lg text-[11px] hover:bg-amber-500 transition duration-150 inline-flex items-center justify-center gap-1 cursor-pointer"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>تطبيق هذه البنود في الحاسبة تلقائياً</span>
                </button>
              </div>

              {/* Negotiation advice */}
              <div className="space-y-2 flex flex-col justify-between">
                <div className="space-y-2">
                  <h4 className="font-extrabold text-white text-xs border-r-2 border-blue-400 pr-2">💡 استراتيجية التفاوض المقترحة:</h4>
                  <div className="bg-zinc-900/30 p-3 rounded-lg border border-zinc-800/80 leading-relaxed text-zinc-400 text-[11px] text-justify">
                    {aiResult.negotiation_tip}
                  </div>
                </div>
                {aiResult.client_proposal && (
                  <div className="pt-2">
                    <h5 className="font-bold text-zinc-300 text-[11px] mb-1">✍️ نص مقتبس للعميل (أضيف للملاحظات):</h5>
                    <div className="bg-zinc-900/20 p-2 rounded border border-zinc-850 text-[10px] truncate leading-relaxed">
                      {aiResult.client_proposal}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Inputs of quote and billing context */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">اسم العميل المقابل</label>
          <input
            type="text"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            placeholder="سجل اسم العميل أو الشركة لتصديره"
            className="w-full bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 rounded-lg p-2 text-xs focus:border-brand-gold focus:outline-none transition font-sans"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">رقم وتوثيق عرض السعر</label>
          <input
            type="text"
            value={offer}
            onChange={(e) => setOffer(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-400 rounded-lg p-2 text-xs focus:border-brand-gold focus:outline-none transition font-mono"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">موعد التسليم الالتزامي</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg p-2 text-xs focus:border-brand-gold focus:outline-none transition font-sans"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">ملاحظات العرض وشروطه</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="مثال: يلتزم العميل بدفع 50% سلفة مسبقة..."
            className="w-full h-8 bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 rounded-lg px-2 py-1.5 text-xs focus:border-brand-gold focus:outline-none transition font-sans resize-none"
          />
        </div>
      </div>

      {/* Main calc layout & summary sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Design cards list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow">
            <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                <Calculator className="w-4.5 h-4.5 text-brand-gold" />
                <span>📐 تفاصيل البنود والقياسات المقدرة</span>
              </h3>
              <span className="text-[11px] text-zinc-500 font-sans">معادلة المساحة: الطول × العرض</span>
            </div>

            <div className="p-5 space-y-4">
              {designs.map((item, idx) => {
                const { finalPrice } = calcItem(item);
                
                return (
                  <div key={item.id} className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4.5 space-y-4 relative group">
                    {/* Top Row count description */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-brand-gold/10 text-brand-gold border border-brand-gold/20 flex items-center justify-center font-bold text-xs font-mono">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-[200px]">
                          <input
                            type="text"
                            value={item.desc}
                            onChange={(e) => updateItemField(item.id, 'desc', e.target.value)}
                            placeholder="مثال: لافتة مضيئة للواجهة الخارجية للمطعم"
                            className="bg-transparent border-b border-transparent hover:border-zinc-800 focus:border-brand-gold text-white placeholder-zinc-600 text-xs font-extrabold pb-0.5 focus:outline-none transition w-full"
                          />
                        </div>
                      </div>

                      {/* Dropdown presets templates */}
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase">قوالب قياس:</label>
                        <select
                          onChange={(e) => {
                            if (e.target.value !== '') {
                              applyTemplate(parseInt(e.target.value), item.id);
                              e.target.value = '';
                            }
                          }}
                          className="bg-zinc-900 border border-zinc-800 text-zinc-400 rounded px-2 py-1 text-[11px] focus:outline-none font-sans"
                        >
                          <option value="">-- مخصص --</option>
                          {TEMPLATES.map((tmpl, i) => (
                            <option key={i} value={i}>
                              {tmpl.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Middle dimensions row */}
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wide block">الارتفاع/الطول</label>
                        <input
                          type="number"
                          value={item.length}
                          onChange={(e) => updateItemField(item.id, 'length', e.target.value)}
                          placeholder="0"
                          className="w-full bg-zinc-900 border border-zinc-800 text-white rounded px-2.5 py-1.5 text-xs focus:border-brand-gold focus:outline-none transition font-sans"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wide block">وحدة الأبعاد</label>
                        <select
                          value={item.unitL}
                          onChange={(e) => updateItemField(item.id, 'unitL', e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded px-2 py-1.5 text-xs focus:border-brand-gold focus:outline-none transition font-sans"
                        >
                          <option value="px">بكسل</option>
                          <option value="mm">ملم</option>
                          <option value="cm">سم</option>
                          <option value="m">متر</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wide block">العرض/الأفق</label>
                        <input
                          type="number"
                          value={item.width}
                          onChange={(e) => updateItemField(item.id, 'width', e.target.value)}
                          placeholder="0"
                          className="w-full bg-zinc-900 border border-zinc-800 text-white rounded px-2.5 py-1.5 text-xs focus:border-brand-gold focus:outline-none transition font-sans"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wide block">وحدة الأبعاد</label>
                        <select
                          value={item.unitW}
                          onChange={(e) => updateItemField(item.id, 'unitW', e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded px-2 py-1.5 text-xs focus:border-brand-gold focus:outline-none transition font-sans"
                        >
                          <option value="px">بكسل</option>
                          <option value="mm">ملم</option>
                          <option value="cm">سم</option>
                          <option value="m">متر</option>
                        </select>
                      </div>
                      
                      {/* Pricing Unit type calculations */}
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wide block">نوع التسعير المطلوب</label>
                        <select
                          value={item.priceUnit}
                          onChange={(e) => updateItemField(item.id, 'priceUnit', e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 text-brand-gold rounded px-2 py-1.5 text-xs focus:border-brand-gold focus:outline-none transition font-sans font-bold"
                        >
                          <option value="m2">سعر المتر المربع (م²)</option>
                          <option value="cm2">سعر السنتيمتر المربع (سم²)</option>
                          <option value="fixed">سعر ثابت للقطعة (مقطوع)</option>
                        </select>
                      </div>
                    </div>

                    {/* Costs calculations row */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wide block">قيمة التأسيس الأساسية (دج)</label>
                        <input
                          type="number"
                          value={item.basePrice}
                          onChange={(e) => updateItemField(item.id, 'basePrice', e.target.value)}
                          placeholder="مثال: 1500"
                          className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-700 rounded px-2.5 py-1.5 text-xs focus:border-brand-gold focus:outline-none transition font-sans"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wide block">سعر الوحدة/مساحة (دج)</label>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateItemField(item.id, 'price', e.target.value)}
                          placeholder="0"
                          className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-750 rounded px-2.5 py-1.5 text-xs focus:border-brand-gold focus:outline-none transition font-sans"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wide block">عدد النسخ المطلوبة</label>
                        <input
                          type="number"
                          value={item.copies}
                          onChange={(e) => updateItemField(item.id, 'copies', e.target.value)}
                          min="1"
                          placeholder="1"
                          className="w-full bg-zinc-900 border border-zinc-800 text-white rounded px-2.5 py-1.5 text-xs focus:border-brand-gold focus:outline-none transition font-sans font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wide block">خصم مخصص للبند %</label>
                        <input
                          type="number"
                          value={item.individualDiscount}
                          onChange={(e) => updateItemField(item.id, 'individualDiscount', e.target.value)}
                          min="0"
                          max="100"
                          placeholder="0"
                          className="w-full bg-zinc-900 border border-zinc-800 text-rose-400 rounded px-2.5 py-1.5 text-xs focus:border-brand-gold focus:outline-none transition font-sans"
                        />
                      </div>
                      
                      {/* Price outputs */}
                      <div className="space-y-1 text-left self-end">
                        <div className="text-[8px] text-zinc-400 uppercase font-black">صافي تكلفة البند</div>
                        <div className={`text-sm font-black text-brand-gold font-mono truncate transition duration-150 ${draft ? 'blur-sm' : ''}`}>
                          {fmt(finalPrice, 0)} دج
                        </div>
                      </div>
                    </div>

                    {/* Delete and duplicate buttons */}
                    <div className="absolute left-2.5 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                      <button
                        type="button"
                        onClick={() => dupItem(item.id)}
                        title="مضاعفة بنود هذا الحساب"
                        className="w-7 h-7 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg flex items-center justify-center transition cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => rmItem(item.id)}
                        title="إبادة/حذف هذا البند"
                        className="w-7 h-7 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-500 rounded-lg flex items-center justify-center transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => addDesignItem()}
                className="w-full border-2 border-dashed border-zinc-800 hover:border-brand-gold/60 text-brand-gold bg-zinc-900/30 hover:bg-brand-gold/5 py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4.5 h-4.5" />
                <span>إضافة خدمة/بند تصميم جديد مخصص</span>
              </button>
            </div>
          </div>
          
          {/* General modifiers card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <span>⚙️ نسب الضرائب والعمولات وهوامش الأرباح الطارئة</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-zinc-400 uppercase">خصم عام على عرض السعر %</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                  className="w-full bg-zinc-950 border border-zinc-800 text-rose-400 rounded-lg p-2 text-xs focus:border-brand-gold focus:outline-none transition font-sans"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-zinc-400 uppercase">الضريبة الإضافية المستحقة %</label>
                <input
                  type="number"
                  value={tax}
                  onChange={(e) => setTax(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg p-2 text-xs focus:border-brand-gold focus:outline-none transition font-sans"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-zinc-400 uppercase">هامش الربح والالتزام الضيق %</label>
                <input
                  type="number"
                  value={margin}
                  onChange={(e) => setMargin(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-zinc-950 border border-zinc-800 text-emerald-400 rounded-lg p-2 text-xs focus:border-brand-gold focus:outline-none transition font-sans"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Calculation Invoice sidebar */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow sticky top-6">
          <div className="bg-zinc-950 border-b border-zinc-800 px-5 py-4 flex items-center justify-between">
            <h3 className="font-extrabold text-white text-xs flex items-center gap-1.5">
              <span>💎 ملخص التسعير وعرض القيمة المضافة</span>
            </h3>
          </div>

          <div className="p-5 space-y-4">
            <div className="space-y-2.5 divide-y divide-zinc-800/50">
              <div className="flex justify-between items-center text-xs pb-2">
                <span className="text-zinc-400">إجمالي البنود والتصاميم</span>
                <span className="font-bold text-white font-mono">{designs.length} بنود</span>
              </div>
              <div className="flex justify-between items-center text-xs py-2">
                <span className="text-zinc-400">إجمالي المساحة المقدرة</span>
                <span className="font-bold text-white font-mono">
                  {sumAreaCm2 >= 10000 
                    ? `${(sumAreaCm2 / 10000).toFixed(2)} متر²` 
                    : `${sumAreaCm2.toFixed(0)} سنتيمتر²`
                  }
                </span>
              </div>
              <div className="flex justify-between items-center text-xs py-2">
                <span className="text-zinc-400">القيمة الإجمالية قبل الخصم</span>
                <span className={`font-bold text-brand-gold font-mono ${draft ? 'blur-sm' : ''}`}>
                  {fmt(sumBeforeVal, 0)} دج
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-xs py-2">
                  <span className="text-rose-400 font-semibold">كمية الخصم الكلي ({discount}%)</span>
                  <span className={`font-bold text-rose-400 font-mono ${draft ? 'blur-sm' : ''}`}>
                    -{fmt(gdAmount, 0)} دج
                  </span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between items-center text-xs py-2">
                  <span className="text-zinc-400">القيمة الإجمالية للضريبة ({tax}%)</span>
                  <span className={`font-bold text-zinc-300 font-mono ${draft ? 'blur-sm' : ''}`}>
                    +{fmt(taxAmount, 0)} دج
                  </span>
                </div>
              )}
              {margin > 0 && (
                <div className="flex justify-between items-center text-xs py-2">
                  <span className="text-emerald-400 font-semibold">هامش الربح الإضافي ({margin}%)</span>
                  <span className={`font-bold text-emerald-400 font-mono ${draft ? 'blur-sm' : ''}`}>
                    +{fmt(profitMarginAmount, 0)} دج
                  </span>
                </div>
              )}
            </div>

            {/* Total value display - Styled with the premium MARKA PRO gradient */}
            <div className="bg-gradient-to-r from-[#FF5E62] via-[#7C3AED] to-[#00C2FF] rounded-2xl p-5 text-center relative overflow-hidden shadow-xl border-0">
              {/* Subtle background highlight shape */}
              <div className="absolute inset-0 bg-white/5 mix-blend-overlay pointer-events-none" />
              <span className="text-[10px] font-black uppercase text-white/90 tracking-wider block">الإجمالي النهائي المستحق عيناً</span>
              <div className={`text-3xl font-black text-white font-mono mt-1.5 mb-0.5 ${draft ? 'blur-sm' : ''}`}>
                {fmt(grandTotal, 0)} <span className="text-xs font-sans font-normal text-white/80">دج</span>
              </div>
              <span className="text-[9px] text-white/70 font-sans block">دينار جزائري شامل المتطلبات والضرائب</span>
            </div>

            {/* Client screen-sharing Blur Mode toggle */}
            <div className="pt-1.5">
              <button
                type="button"
                onClick={() => setDraft(!draft)}
                className={`w-full py-2 px-3 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  draft 
                    ? 'bg-zinc-800 text-white border-zinc-700' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {draft ? <Eye className="w-4.5 h-4.5 text-brand-gold" /> : <EyeOff className="w-4.5 h-4.5" />}
                <span>{draft ? '🔍 كشف ورفع حجب الأسعار' : '👁️ تفعيل وضع المسودة لبث الشاشة'}</span>
              </button>
            </div>

            {/* PDF Customization controls block */}
            <div className="border-t border-zinc-800 pt-3.5 space-y-3 text-right font-sans">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-zinc-300 tracking-wide">📐 تخصيص ملف PDF والتحكم باللغات</span>
                <span className="text-[9px] text-brand-gold font-sans font-bold">تصدير مخصص</span>
              </div>
              
              {/* Language selection toggles */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updatePdfLang('ar')}
                  className={`flex-1 py-1.5 px-3 text-[10px] rounded-lg border font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                    pdfLang === 'ar'
                      ? 'bg-brand-gold/15 border-brand-gold text-brand-gold shadow'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>🇸🇾 العربية (Arabic)</span>
                </button>
                <button
                  type="button"
                  onClick={() => updatePdfLang('fr')}
                  className={`flex-1 py-1.5 px-3 text-[10px] rounded-lg border font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                    pdfLang === 'fr'
                      ? 'bg-brand-gold/15 border-brand-gold text-brand-gold shadow'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>🇫🇷 الفرنسية (French)</span>
                </button>
              </div>

              {/* Custom field show / hide toggles */}
              <div className="grid grid-cols-2 gap-2 bg-zinc-950/50 p-2.5 rounded-xl border border-zinc-850 align-right text-right">
                {/* 1. Logo toggle */}
                <label className="flex items-center justify-start gap-2 cursor-pointer select-none text-right">
                  <input
                    type="checkbox"
                    checked={pdfShowLogo}
                    onChange={(e) => updatePdfShowLogo(e.target.checked)}
                    className="accent-brand-gold h-3.5 w-3.5 rounded bg-zinc-900 border-zinc-800 cursor-pointer"
                  />
                  <span className="text-[10px] font-semibold text-zinc-300 font-sans">شعار الاستوديو</span>
                </label>

                {/* 2. Client toggle */}
                <label className="flex items-center justify-start gap-2 cursor-pointer select-none text-right">
                  <input
                    type="checkbox"
                    checked={pdfShowClient}
                    onChange={(e) => updatePdfShowClient(e.target.checked)}
                    className="accent-brand-gold h-3.5 w-3.5 rounded bg-zinc-900 border-zinc-800 cursor-pointer"
                  />
                  <span className="text-[10px] font-semibold text-zinc-300 font-sans">بيانات العميل</span>
                </label>

                {/* 3. Items details toggle */}
                <label className="flex items-center justify-start gap-2 cursor-pointer select-none text-right">
                  <input
                    type="checkbox"
                    checked={pdfShowItemDetails}
                    onChange={(e) => updatePdfShowItemDetails(e.target.checked)}
                    className="accent-brand-gold h-3.5 w-3.5 rounded bg-zinc-900 border-zinc-800 cursor-pointer"
                  />
                  <span className="text-[10px] font-semibold text-zinc-300 font-sans">أبعاد ومقاسات البند</span>
                </label>

                {/* 4. Items price toggle */}
                <label className="flex items-center justify-start gap-2 cursor-pointer select-none text-right">
                  <input
                    type="checkbox"
                    checked={pdfShowItemPrices}
                    onChange={(e) => updatePdfShowItemPrices(e.target.checked)}
                    className="accent-brand-gold h-3.5 w-3.5 rounded bg-zinc-900 border-zinc-800 cursor-pointer"
                  />
                  <span className="text-[10px] font-semibold text-zinc-300 font-sans">عرض أسعار البنود</span>
                </label>

                {/* 5. Account breakdown details toggle */}
                <label className="flex items-center justify-start gap-2 cursor-pointer select-none text-right">
                  <input
                    type="checkbox"
                    checked={pdfShowBreakdown}
                    onChange={(e) => updatePdfShowBreakdown(e.target.checked)}
                    className="accent-brand-gold h-3.5 w-3.5 rounded bg-zinc-900 border-zinc-800 cursor-pointer"
                  />
                  <span className="text-[10px] font-semibold text-zinc-300 font-sans">تفاصيل الضرائب والخصم</span>
                </label>

                {/* 6. Tafqeet toggle */}
                <label className="flex items-center justify-start gap-2 cursor-pointer select-none text-right">
                  <input
                    type="checkbox"
                    checked={pdfShowTafqeet}
                    onChange={(e) => updatePdfShowTafqeet(e.target.checked)}
                    className="accent-brand-gold h-3.5 w-3.5 rounded bg-zinc-900 border-zinc-800 cursor-pointer"
                  />
                  <span className="text-[10px] font-semibold text-zinc-300 font-sans">تفقيط كتابة المبالغ</span>
                </label>

                {/* 7. Notes and terms toggle */}
                <label className="flex items-center justify-start gap-2 cursor-pointer select-none text-right col-span-2">
                  <input
                    type="checkbox"
                    checked={pdfShowNotes}
                    onChange={(e) => updatePdfShowNotes(e.target.checked)}
                    className="accent-brand-gold h-3.5 w-3.5 rounded bg-zinc-900 border-zinc-800 cursor-pointer"
                  />
                  <span className="text-[10px] font-semibold text-zinc-300 font-sans">إدراج شروط السداد والملحوظات الهامة</span>
                </label>
              </div>
            </div>

            {/* Action buttons list */}
            <div className="grid grid-cols-1 gap-2.5 border-t border-zinc-800 pt-4.5">
              <button
                type="button"
                onClick={triggerPrintPDF}
                className="w-full py-2.5 bg-brand-gold hover:bg-amber-500 text-brand-bg font-extrabold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow"
              >
                <FileText className="w-4.5 h-4.5" />
                <span>تصدير وطباعة وثيقة PDF</span>
              </button>
              <button
                type="button"
                onClick={copyProposal}
                className="w-full py-2.5 bg-zinc-850 hover:bg-zinc-850/80 border border-zinc-750 text-zinc-200 font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Copy className="w-4 h-4 text-brand-gold" />
                <span>نسخ منشور العرض المنسق لحافظة الرسائل</span>
              </button>
              <button
                type="button"
                onClick={exportToCSV}
                className="w-full py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200 rounded-lg text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                <span>تنزيل تفاصيل البنود كملف CSV</span>
              </button>
              <button
                type="button"
                onClick={resetCalculator}
                className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 text-rose-400 rounded-lg text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إرجاع تصفير وإعادة تهيئة الحاسبة</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
