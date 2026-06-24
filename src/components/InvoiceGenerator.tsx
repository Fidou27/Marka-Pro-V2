/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Plus, 
  Trash2, 
  ArrowRight, 
  Download, 
  User, 
  Calendar, 
  Percent, 
  Hash, 
  CheckCircle,
  Briefcase,
  Copy,
  Check
} from 'lucide-react';
import { Project, Client } from '../types';
import { fmt, numToAr, safe, safeAlert } from '../utils';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceGeneratorProps {
  projects: Project[];
  clients: Client[];
}

export default function InvoiceGenerator({ projects, clients }: InvoiceGeneratorProps) {
  // Selection States
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  
  // Invoice Details
  const [invoiceNumber, setInvoiceNumber] = useState<string>(`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [dueDate, setDueDate] = useState<string>('');
  
  // Issuer details (The designer)
  const [issuerName, setIssuerName] = useState<string>(localStorage.getItem('M_issuer_name') || 'أستوديو ماركا للتصميم الإبداعي');
  const [issuerPhone, setIssuerPhone] = useState<string>(localStorage.getItem('M_issuer_phone') || '0555 12 34 56');
  const [issuerEmail, setIssuerEmail] = useState<string>(localStorage.getItem('M_issuer_email') || 'contact@markastudio.dz');
  const [issuerAddress, setIssuerAddress] = useState<string>(localStorage.getItem('M_issuer_address') || 'الجزائر العاصمة، الجزائر');

  // Client details
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [clientAddress, setClientAddress] = useState<string>('');

  // Invoice Items
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'تصميم هوية بصرية متكاملة وشاملة', quantity: 1, unitPrice: 45000 }
  ]);

  // Global taxes and discounts
  const [taxRate, setTaxRate] = useState<number>(19); // 19% standard VAT Algerian
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [paymentTerms, setPaymentTerms] = useState<string>('يرجى تسديد 50% كدفعة أولى والـ50% المتبقية عند التسليم النهائي.\nطريقة الدفع: CCP أو عبر خدمة BaridiMob.');

  const [copied, setCopied] = useState(false);

  // Auto-fill issuer info inside localStorage upon changes
  useEffect(() => {
    localStorage.setItem('M_issuer_name', issuerName);
    localStorage.setItem('M_issuer_phone', issuerPhone);
    localStorage.setItem('M_issuer_email', issuerEmail);
    localStorage.setItem('M_issuer_address', issuerAddress);
  }, [issuerName, issuerPhone, issuerEmail, issuerAddress]);

  // Retrieve project information when selected
  const handleProjectSelect = (projId: string) => {
    setSelectedProjectId(projId);
    if (!projId) return;

    const proj = projects.find(p => p.id === projId);
    if (proj) {
      // Set Client info
      setClientName(proj.clientName);
      const matchingClient = clients.find(c => c.id === proj.clientId);
      if (matchingClient) {
        setClientPhone(matchingClient.phone || '');
        setClientEmail(matchingClient.email || '');
        setClientAddress(matchingClient.notes || 'العنوان مسجل مسبقاً لدى إدارة العملاء');
      } else {
        setClientPhone('');
        setClientEmail('');
        setClientAddress('');
      }

      // Populate Items with this project
      setItems([
        {
          id: 'proj-item',
          description: `بند تعاقدي: تمثيل مشروع "${proj.name}" ذو التصنيف (${proj.type})`,
          quantity: 1,
          unitPrice: proj.price || 0
        }
      ]);
      
      // Auto due date (e.g. 15 days later)
      const d = new Date();
      d.setDate(d.getDate() + 15);
      setDueDate(d.toISOString().substring(0, 10));

      // Generate localized invoice number
      setInvoiceNumber(`INV-${proj.start?.split('-')[0] || new Date().getFullYear()}-${proj.id.substring(0, 4).toUpperCase()}`);
    }
  };

  // Add line item
  const addInvoiceItem = () => {
    const newItem: InvoiceItem = {
      id: Math.random().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0
    };
    setItems([...items, newItem]);
  };

  // Remove line item
  const removeInvoiceItem = (id: string) => {
    if (items.length <= 1) {
      safeAlert('⚠️ يجب أن تحتوي الفاتورة على بند واحد على الأقل.');
      return;
    }
    setItems(items.filter(item => item.id !== id));
  };

  // Update item field
  const updateItemField = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        if (field === 'quantity') {
          return { ...item, quantity: Math.max(1, parseInt(value) || 1) };
        }
        if (field === 'unitPrice') {
          return { ...item, unitPrice: Math.max(0, parseFloat(value) || 0) };
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Financial calculations
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const discountAmount = (subtotal * discountRate) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * taxRate) / 100;
  const totalAmount = taxableAmount + taxAmount;

  // Print invoice helper
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 print:p-0">
      {/* Configuration & Input Controls (Hidden during print) */}
      <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-3xl p-6 space-y-6 print:hidden">
        <div className="border-b border-zinc-800/60 pb-4">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-gold" />
            <span>نظام إعداد وتوليد الفواتير الرسمية لمشاريعك</span>
          </h3>
          <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
            اختر المشروع لتعبئة تفاصيل العميل ونوع العمل والأسعار تلقائياً، أو قم بملء الحقول وتخصيص البنود والضربية بديناميكية تامة لطباعتها كـ PDF.
          </p>
        </div>

        {/* Project Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">سحب بيانات مشروع مسجل مسبقاً</label>
            <select
              value={selectedProjectId}
              onChange={(e) => handleProjectSelect(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl p-3 text-xs focus:border-brand-gold focus:outline-none transition font-sans cursor-pointer"
            >
              <option value="">-- اختر المشروع لتوليد الفاتورة تلقائياً --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.clientName}) - {fmt(p.price, 0)} دج
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">رقم الفاتورة المعتمد</label>
              <div className="relative">
                <Hash className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:border-brand-gold focus:outline-none transition font-mono"
                  placeholder="INV-2026-X"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">تاريخ الإصدار</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:border-brand-gold focus:outline-none transition font-sans"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Issuer and Client details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Issuer details block */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl space-y-4">
            <h4 className="text-xs font-black text-brand-gold border-b border-zinc-800/50 pb-2">بيانات المصمم / مُصدر الفاتورة</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-500 block">اسمك التجاري / الاستوديو</label>
                <input
                  type="text"
                  value={issuerName}
                  onChange={(e) => setIssuerName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-1.5 text-xs focus:border-brand-gold focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-500 block">رقم الهاتف</label>
                <input
                  type="text"
                  value={issuerPhone}
                  onChange={(e) => setIssuerPhone(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-400 rounded-lg px-2.5 py-1.5 text-xs focus:border-brand-gold focus:outline-none font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-500 block">البريد الإلكتروني</label>
                <input
                  type="text"
                  value={issuerEmail}
                  onChange={(e) => setIssuerEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-400 rounded-lg px-2.5 py-1.5 text-xs focus:border-brand-gold focus:outline-none font-sans"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-500 block">المقر / العنوان</label>
                <input
                  type="text"
                  value={issuerAddress}
                  onChange={(e) => setIssuerAddress(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-400 rounded-lg px-2.5 py-1.5 text-xs focus:border-brand-gold focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Client details block */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl space-y-4">
            <h4 className="text-xs font-black text-brand-gold border-b border-zinc-800/50 pb-2">تفاصيل العميل / المشتري</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-500 block">الاسم الكامل للعميل</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-1.5 text-xs focus:border-brand-gold focus:outline-none"
                  placeholder="شركة تطوير أو فرد مستقل"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-500 block">رقم الهاتف</label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-1.5 text-xs focus:border-brand-gold focus:outline-none font-mono"
                  placeholder="0661 XX XX XX"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-500 block">البريد الإلكتروني</label>
                <input
                  type="text"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-1.5 text-xs focus:border-brand-gold focus:outline-none font-sans"
                  placeholder="client@mail.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-500 block">العنوان أو المقر</label>
                <input
                  type="text"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-1.5 text-xs focus:border-brand-gold focus:outline-none"
                  placeholder="وهران الجزائر، أو عنوان المقر"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Items list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800/40 pb-2">
            <h4 className="text-xs font-black text-zinc-300">بنود الخدمات والأسعار المضمنة בפواتيرك</h4>
            <button
              type="button"
              onClick={addInvoiceItem}
              className="px-3 py-1 bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold rounded-lg border border-brand-gold/20 text-[10px] font-extrabold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة بند خدمة جديد</span>
            </button>
          </div>

          <div className="space-y-3.5">
            {items.map((item, index) => (
              <div key={item.id} className="flex flex-col md:flex-row items-stretch md:items-end gap-3 bg-zinc-900/20 p-3 rounded-xl border border-zinc-800/40">
                <div className="text-xs font-black text-brand-gold self-center px-1">
                  #{index + 1}
                </div>
                
                <div className="flex-1 space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 block">وصف البند / تفصيل الخدمة</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItemField(item.id, 'description', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-2 text-xs focus:border-brand-gold focus:outline-none"
                    placeholder="امثلة: تصميم الشعار، إدارة الإعلانات، تطوير الموقع..."
                  />
                </div>

                <div className="w-full md:w-28 space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 block">الكمية / التكرار</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItemField(item.id, 'quantity', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-2 text-xs focus:border-brand-gold focus:outline-none font-mono"
                    min="1"
                  />
                </div>

                <div className="w-full md:w-40 space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 block">سعر الوحدة (دج)</label>
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => updateItemField(item.id, 'unitPrice', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-2 text-xs focus:border-brand-gold focus:outline-none font-mono"
                  />
                </div>

                <div className="w-full md:w-36 space-y-1 text-center bg-zinc-950/60 py-2 rounded-lg border border-zinc-900 self-stretch flex flex-col justify-center px-2">
                  <span className="text-[8px] text-zinc-500 font-extrabold uppercase">إجمالي البند</span>
                  <span className="text-xs font-black text-white font-mono truncate">{fmt(item.quantity * item.unitPrice, 0)} دج</span>
                </div>

                <button
                  type="button"
                  onClick={() => removeInvoiceItem(item.id)}
                  className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg transition self-stretch md:self-end flex items-center justify-center cursor-pointer"
                  title="حذف البند"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Summary factors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-zinc-800/40 pt-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">نسبة الخصم التجاري الممنوح %</label>
            <div className="relative">
              <Percent className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
              <input
                type="number"
                value={discountRate}
                onChange={(e) => setDiscountRate(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:border-brand-gold focus:outline-none font-mono"
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">نسبة الضريبة والخدمات الرأسمالية %</label>
            <div className="relative">
              <Percent className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:border-brand-gold focus:outline-none font-mono"
                min="0"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">تاريخ استحقاق الدفع</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:border-brand-gold focus:outline-none font-sans"
              />
            </div>
          </div>
        </div>

        {/* Notes and Terms */}
        <div className="space-y-2">
          <label className="text-[10px] font-extrabold text-zinc-400 block">شروط الدفع والتسليم والتوقيع</label>
          <textarea
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl p-3 text-xs focus:border-brand-gold focus:outline-none transition h-20 leading-relaxed"
            placeholder="اكتب ملاحظات إضافية أو الحساب البريدي هنا..."
          />
        </div>

        {/* Action triggers */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-800/40 pt-4">
          <div className="text-zinc-500 text-[11px] leading-relaxed">
            * اضغط على زر الطباعة لفتح نافذة طباعة المتصفح لحفظ نموذج الفاتورة فوراً كصيغة <span className="text-brand-gold font-bold">PDF</span> منسقة بالكامل وجاهزة للعميل.
          </div>
          <button
            type="button"
            onClick={handlePrint}
            className="px-6 py-3 bg-brand-gold hover:bg-amber-500 text-brand-bg font-black rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg"
          >
            <Printer className="w-4 h-4" />
            <span>حفظ كملف PDF وطباعة الفاتورة</span>
          </button>
        </div>
      </div>

      {/* --- PREMIUM PRINT PREVIEW VIEW --- */}
      <div className="space-y-4">
        {/* Helper Label (Hidden during print) */}
        <div className="flex items-center justify-between print:hidden">
          <h4 className="text-xs font-black text-zinc-400 block">معاينة مباشرة وحية لورقة الفاتورة المعتمدة والتناسق اللوني</h4>
          <span className="text-[10px] text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-md">جاهزة للطباعة والتحميل الفوري</span>
        </div>

        {/* The Printable A4 Sheet layout wrapper */}
        <div 
          id="invoice-printable-sheet"
          className="bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl relative overflow-hidden font-sans
                    print:bg-white print:text-slate-900 print:rounded-none print:shadow-none print:border-none print:p-0 print:absolute print:inset-0 print:w-full print:h-full print:z-[9999]"
        >
          {/* Header watermark/decor (Hidden during print, or visible optionally) */}
          <div className="absolute top-0 right-0 left-0 h-2.5 bg-gradient-to-r from-brand-gold to-amber-500 print:h-2" />

          {/* Core Invoice Top Block */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-zinc-800/80 pb-6 print:border-slate-200">
            {/* Logo and Brand Name */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-brand-gold text-brand-bg rounded-lg font-black text-sm block">PRO</span>
                <span className="text-lg font-black tracking-widest text-white print:text-slate-900 font-sans">MARKAPRO</span>
              </div>
              <p className="text-[10px] text-zinc-400 print:text-slate-500 font-semibold max-w-sm">
                منصة تسيير حسابات المصممين المحترفين وبناء عروضهم الرقمية
              </p>
            </div>

            {/* Document Header Text */}
            <div className="text-right space-y-1">
              <h1 className="text-2xl font-black tracking-tighter text-brand-gold uppercase">فاتورة رقمية رسمية</h1>
              <p className="text-xs font-mono text-zinc-400 print:text-slate-500 font-bold">{invoiceNumber}</p>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-2 text-[11px] font-sans">
                <span className="text-zinc-500 text-left print:text-slate-400">تاريخ الإصدار:</span>
                <span className="text-zinc-300 font-bold font-mono text-right print:text-slate-800">{issueDate}</span>
                
                {dueDate && (
                  <>
                    <span className="text-zinc-500 text-left print:text-slate-400">تاريخ الاستحقاق:</span>
                    <span className="text-rose-400 print:text-rose-600 font-bold font-mono text-right">{dueDate}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Issuer vs Client Addresses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-right leading-relaxed">
            {/* Sender */}
            <div className="space-y-2 bg-zinc-950/40 p-5 rounded-2xl border border-zinc-800/60 print:bg-slate-50 print:border-slate-200 print:text-slate-800">
              <span className="text-[9px] font-black tracking-wide text-zinc-500 uppercase block print:text-slate-400">المرسل والمُنفذ:</span>
              <p className="font-extrabold text-white print:text-slate-900 text-sm">{safe(issuerName)}</p>
              
              <div className="space-y-0.5 text-zinc-400 print:text-slate-600 text-[11px]">
                {issuerPhone && <p><span className="text-zinc-500 font-bold print:text-slate-400">الهاتف:</span> <span className="font-mono">{safe(issuerPhone)}</span></p>}
                {issuerEmail && <p><span className="text-zinc-500 font-bold print:text-slate-400">البريد:</span> <span className="font-sans">{safe(issuerEmail)}</span></p>}
                {issuerAddress && <p><span className="text-zinc-500 font-bold print:text-slate-400">المقر:</span> {safe(issuerAddress)}</p>}
              </div>
            </div>

            {/* Recipient */}
            <div className="space-y-2 bg-zinc-950/40 p-5 rounded-2xl border border-zinc-800/60 print:bg-slate-50 print:border-slate-200 print:text-slate-800">
              <span className="text-[9px] font-black tracking-wide text-zinc-500 uppercase block print:text-slate-400">العميل والمستلم:</span>
              <p className="font-extrabold text-white print:text-slate-900 text-sm">{safe(clientName) || 'لم يحدد اسم العميل بعد'}</p>
              
              <div className="space-y-0.5 text-zinc-400 print:text-slate-600 text-[11px]">
                {clientPhone && <p><span className="text-zinc-500 font-bold print:text-slate-400">الهاتف:</span> <span className="font-mono">{safe(clientPhone)}</span></p>}
                {clientEmail && <p><span className="text-zinc-500 font-bold print:text-slate-400">البريد:</span> <span className="font-sans">{safe(clientEmail)}</span></p>}
                {clientAddress && <p><span className="text-zinc-500 font-bold print:text-slate-400">العنوان:</span> {safe(clientAddress)}</p>}
              </div>
            </div>
          </div>

          {/* Core Table Layout for A4 Invoice sheet */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs leading-none">
              <thead>
                <tr className="bg-zinc-950/80 border-b border-zinc-800 text-[10px] text-zinc-400 uppercase font-black tracking-wide print:bg-slate-100 print:text-slate-700 print:border-slate-300">
                  <th className="py-3 px-4 text-center rounded-r-xl print:rounded-none w-12">م</th>
                  <th className="py-3 px-4">تفاصيل البنود والخدمات الإبداعية المقدمة</th>
                  <th className="py-3 px-4 text-center w-16">الكمية</th>
                  <th className="py-3 px-4 text-left w-28">سعر الوحدة</th>
                  <th className="py-3 px-4 text-left rounded-l-xl print:rounded-none w-28">المجموع الصافي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 print:divide-slate-200 font-sans">
                {items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-zinc-900/10 print:hover:bg-transparent">
                    <td className="py-4 px-4 text-center text-zinc-500 font-bold font-mono">{index + 1}</td>
                    <td className="py-4 px-4 text-zinc-200 print:text-slate-900 font-bold text-justify line-clamp-3">
                      {safe(item.description) || 'بند خدمة وتصميم مخصص'}
                    </td>
                    <td className="py-4 px-4 text-center text-white print:text-slate-800 font-black font-mono">{item.quantity}</td>
                    <td className="py-4 px-4 text-left text-zinc-400 print:text-slate-600 font-mono">{fmt(item.unitPrice, 0)} دج</td>
                    <td className="py-4 px-4 text-left text-white print:text-slate-900 font-black font-mono">
                      {fmt(item.quantity * item.unitPrice, 0)} دج
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footing calculations block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start text-xs border-t border-zinc-800/60 pt-6 print:border-slate-200">
            {/* Notes/Terms as block letter */}
            <div className="space-y-2">
              <span className="text-[9px] font-black tracking-wide text-zinc-500 uppercase block print:text-slate-400">إرشادات تسيير الفاتورة والالتزام:</span>
              <div className="bg-zinc-950/30 p-4 rounded-xl border border-zinc-800/40 text-[11px] text-zinc-400 leading-relaxed text-justify whitespace-pre-wrap print:bg-slate-50 print:border-slate-200 print:text-slate-600">
                {paymentTerms || 'لا يوجد شروط مخصصة لهذه الفاتورة'}
              </div>
            </div>

            {/* Price Calculations */}
            <div className="bg-zinc-950/50 rounded-2xl p-5 space-y-3.5 border border-zinc-800/80 print:bg-slate-50 print:border-slate-200 print:text-slate-800">
              <div className="flex items-center justify-between text-zinc-400 print:text-slate-500 text-[11px] font-bold">
                <span>المجموع الفرعي الكامل (Subtotal)</span>
                <span className="font-mono font-bold text-white print:text-slate-800">{fmt(subtotal, 0)} دج</span>
              </div>

              {discountRate > 0 && (
                <div className="flex items-center justify-between text-rose-400 text-[11px] font-bold">
                  <span>الخصم التجاري المطبق (-{discountRate}%)</span>
                  <span className="font-mono font-bold">-{fmt(discountAmount, 0)} دج</span>
                </div>
              )}

              {taxRate > 0 && (
                <div className="flex items-center justify-between text-zinc-400 print:text-slate-500 text-[11px] font-bold">
                  <span>الضريبة الإضافية المستحقة (+{taxRate}%)</span>
                  <span className="font-mono font-bold text-zinc-300 print:text-slate-800">+{fmt(taxAmount, 0)} دج</span>
                </div>
              )}

              {/* Final Payable total net */}
              <div className="flex items-center justify-between border-t border-zinc-800/85 pt-3.5 print:border-slate-300">
                <span className="text-sm font-black text-brand-gold font-sans">المجموع الإجمالي المطلوب للتسديد</span>
                <span className="text-base font-black text-white print:text-emerald-700 font-mono uppercase">
                  {fmt(totalAmount, 0)} دج
                </span>
              </div>

              {/* Arabic spelling out - Tafqeet */}
              <div className="bg-brand-gold/5 p-3 rounded-xl border border-brand-gold/15 text-[11px] text-justify leading-relaxed print:bg-slate-100 print:border-slate-300">
                <span className="font-black text-brand-gold print:text-slate-800 font-sans">مبلغ التفقيط بالحروف العربية:</span>{' '}
                <span className="text-zinc-300 print:text-slate-800 font-extrabold">
                  فقط {numToAr(totalAmount)} دينار جزائري لا غير.
                </span>
              </div>
            </div>
          </div>

          {/* Sub signature block */}
          <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-6 border-t border-zinc-800/40 print:border-slate-200">
            <div>
              <p className="font-semibold text-zinc-400 print:text-slate-500 mb-1">ختم وتوقيع المستلم للعمل:</p>
              <div className="w-24 h-12 border border-dashed border-zinc-800/85 rounded-lg flex items-center justify-center font-mono text-[9px] text-zinc-650 print:border-slate-300">
                Stamp/Sign
              </div>
            </div>

            <div className="text-left font-serif py-1 italic font-black.5">
              <p className="font-semibold text-zinc-400 print:text-slate-500 mb-1">توقيع وختم مقدم الخدمة:</p>
              <div className="text-xs text-brand-gold font-black tracking-widest font-sans not-italic">
                {safe(issuerName)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
