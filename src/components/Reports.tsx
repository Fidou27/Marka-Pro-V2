/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TrendingUp, 
  Coins, 
  Layers, 
  Users, 
  Target, 
  DollarSign, 
  Award,
  ArrowUpRight,
  Sparkles,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Project, Client } from '../types';
import { fmt, safe } from '../utils';
import InvoiceGenerator from './InvoiceGenerator';

interface ReportsProps {
  projects: Project[];
  clients: Client[];
}

const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-950 border border-zinc-900 p-3.5 rounded-xl shadow-2xl space-y-1 text-right font-sans">
        <g id="tooltip-content">
          <p className="text-[10px] font-black text-zinc-400 mb-1 border-b border-zinc-800/60 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-5 text-[11px] py-0.5">
              <span className="font-bold font-mono" style={{ color: entry.color }}>
                {fmt(entry.value, 0)} دج
              </span>
              <span className="text-zinc-500 font-semibold">{entry.name}</span>
            </div>
          ))}
        </g>
      </div>
    );
  }
  return null;
};

export default function Reports({ projects, clients }: ReportsProps) {
  const currentMonthIdx = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Financial calculations
  const prices = projects.map((p) => p.price || 0);
  const totalIncome = prices.reduce((a, b) => a + b, 0);
  const averageDealSize = projects.length ? totalIncome / projects.length : 0;
  const maxDealSize = Math.max(0, ...prices);

  const thisMonthProjects = projects.filter((p) => {
    if (!p.start) return false;
    const d = new Date(p.start);
    return d.getMonth() === currentMonthIdx && d.getFullYear() === currentYear;
  });
  const thisMonthIncome = thisMonthProjects.reduce((sum, p) => sum + (p.price || 0), 0);

  // Completion stats
  const completedProjectsCount = projects.filter((p) => p.status === 'done').length;
  const ongoingProjectsCount = projects.filter((p) => p.status === 'progress').length;
  const newProjectsCount = projects.filter((p) => p.status === 'new').length;
  const completionRate = projects.length 
    ? Math.round((completedProjectsCount / projects.length) * 100) 
    : 0;

  // Best valuable customer calculation
  const clientRevenueMap: { [key: string]: number } = {};
  projects.forEach((p) => {
    if (p.clientId) {
      clientRevenueMap[p.clientId] = (clientRevenueMap[p.clientId] || 0) + (p.price || 0);
    }
  });

  const sortedClientsByRevenue = Object.entries(clientRevenueMap)
    .sort((a, b) => b[1] - a[1]);

  const topClientId = sortedClientsByRevenue[0]?.[0];
  const topClientVal = sortedClientsByRevenue[0]?.[1] || 0;
  const topClient = clients.find((c) => c.id === topClientId);

  // Category division database counts
  const categoryCounts: { [key: string]: number } = {
    'هوية بصرية': 0,
    'تصميم سوشيال ميديا': 0,
    'طباعة': 0,
    'موقع إلكتروني': 0,
    'فيديو موشن': 0,
    'أخرى': 0,
  };

  projects.forEach((p) => {
    const type = p.type || 'أخرى';
    if (categoryCounts[type] !== undefined) {
      categoryCounts[type]++;
    } else {
      categoryCounts['أخرى']++;
    }
  });

  const categoryMax = Math.max(1, ...Object.values(categoryCounts));

  // Compute monthly earnings progression for chart (last 6 months)
  const chartData = (() => {
    const arabMonths = [
      'جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان',
      'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];

    const list: {
      year: number;
      month: number;
      name: string;
      yearMonth: string;
      totalValue: number;
      realizedValue: number;
    }[] = [];

    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      list.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        name: `${arabMonths[d.getMonth()]} ${d.getFullYear()}`,
        yearMonth: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        totalValue: 0,
        realizedValue: 0,
      });
    }

    projects.forEach((p) => {
      if (!p.start) return;
      const parts = p.start.split('-');
      if (parts.length < 2) return;
      const pYear = parseInt(parts[0], 10);
      const pMonth = parseInt(parts[1], 10) - 1; // 0-indexed

      if (isNaN(pYear) || isNaN(pMonth)) return;

      const bucket = list.find((item) => item.year === pYear && item.month === pMonth);
      if (bucket) {
        const val = Number(p.price) || 0;
        bucket.totalValue += val;
        if (p.status === 'done') {
          bucket.realizedValue += val;
        }
      }
    });

    return list;
  })();

  const [activeTab, setActiveTab] = useState<'analytics' | 'invoice'>('analytics');

  return (
    <div className="animate-fade-in space-y-6">
      {/* Page Heading - Hidden during print */}
      <div className="print:hidden">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-brand-gold" />
          <span>التقارير والتحليلات البيانية للأعمال</span>
        </h2>
        <p className="text-zinc-400 text-xs mt-1">نظرة تفصيلية على حجم المعاملات وقيم المشاريع المالية ونسب النمو والاستحواذ</p>
      </div>

      {/* Tab Switcher - Hidden during print */}
      <div className="flex border-b border-zinc-800/80 gap-6 print:hidden">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 text-xs font-black transition flex items-center gap-1.5 cursor-pointer border-b-2 ${
            activeTab === 'analytics'
              ? 'text-brand-gold border-brand-gold'
              : 'text-zinc-500 hover:text-zinc-300 border-transparent'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>التحليلات والمؤشرات المالية</span>
        </button>

        <button
          onClick={() => setActiveTab('invoice')}
          className={`pb-3 text-xs font-black transition flex items-center gap-1.5 cursor-pointer border-b-2 ${
            activeTab === 'invoice'
              ? 'text-brand-gold border-brand-gold'
              : 'text-zinc-500 hover:text-zinc-300 border-transparent'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>إنشاء فاتورة رسمية</span>
          <span className="bg-brand-gold/15 text-brand-gold text-[9px] px-2 py-0.5 rounded-full font-black">جديد</span>
        </button>
      </div>

      {activeTab === 'analytics' ? (
        <>
          {/* Primary analytical grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total revenue */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-zinc-500 uppercase">إجمالي العائد المادي</span>
            <Coins className="w-5 h-5 text-brand-gold" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {fmt(totalIncome, 0)} <span className="text-xs font-sans text-zinc-500">دج</span>
          </div>
          <p className="text-[11px] text-zinc-400">إجمالي الأرباح المشتركة منذ إطلاق ماركا برو</p>
        </div>

        {/* Month earnings progress */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-zinc-500 uppercase">مداخيل الشهر الحالي</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {fmt(thisMonthIncome, 0)} <span className="text-xs font-sans text-zinc-500 text-emerald-500">دج</span>
          </div>
          <p className="text-[11px] text-zinc-400">تدوين لعدد {thisMonthProjects.length} مشاريع هذا الشهر</p>
        </div>

        {/* Average transaction pricing */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-zinc-500 uppercase">متوسط قيمة الصفقة/المشروع</span>
            <DollarSign className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {fmt(averageDealSize, 0)} <span className="text-xs font-sans text-zinc-500">دج</span>
          </div>
          <p className="text-[11px] text-zinc-400">معدل ما يدره عليك العقد الواحد تبياناً</p>
        </div>

        {/* Biggest Deal */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-zinc-500 uppercase">حجم أضخم صفقة تجارية</span>
            <Award className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400 font-mono">
            {fmt(maxDealSize, 0)} <span className="text-xs font-sans text-zinc-500 text-purple-500 font-sans font-normal">دج</span>
          </div>
          <p className="text-[11px] text-zinc-400">قيمة أضخم عقد تصميمي قمت بإبرامه</p>
        </div>
      </div>

      {/* Monthly Business Progression - Line Chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5.5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-3 gap-2">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-[#7C3AED]" />
              <span>تطور الدخل المادي وصافي المبيعات شهرياً</span>
            </h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">تتبع المداخيل الإجمالية والمحصلة الفعلية لآخر 6 أشهر استناداً لبيانات مشاريعك</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold leading-none">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
              إجمالي التعاقدات
            </span>
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5E62]" />
              المحقق المكتمل
            </span>
          </div>
        </div>

        <div className="h-64 sm:h-80 w-full pt-1" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 15, right: 15, left: 25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                dy={10} 
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                dx={-10}
                tickFormatter={(val) => `${fmt(val, 0)}`}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Line 
                name="إجمالي التعاقدات"
                type="monotone" 
                dataKey="totalValue" 
                stroke="#7C3AED" 
                strokeWidth={3.5} 
                activeDot={{ r: 6 }} 
                dot={{ r: 4 }}
              />
              <Line 
                name="المحقق المكتمل"
                type="monotone" 
                dataKey="realizedValue" 
                stroke="#FF5E62" 
                strokeWidth={3.5} 
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Visual Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects division categories bar chart */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-5.5 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-1.5 border-b border-zinc-800 pb-3">
            <Target className="w-4.5 h-4.5 text-brand-gold" />
            <span>توزع الخدمات وحصص الأسد من الأعمال</span>
          </h3>

          <div className="space-y-4.5 pt-1">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const percentage = Math.round((count / categoryMax) * 100);
              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-zinc-300">{cat}</span>
                    <span className="text-zinc-500 font-mono">{count} مشاريع</span>
                  </div>
                  {/* Dynamic responsive SVG custom Bar */}
                  <div className="w-full h-3 bg-zinc-950 rounded-lg overflow-hidden border border-zinc-850">
                    <div 
                      className="h-full bg-gradient-to-r from-brand-gold to-amber-500 rounded-lg transition-all duration-500"
                      style={{ width: `${count ? percentage : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column sidebar */}
        <div className="space-y-6">
          {/* Completion Ring Rate */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center flex flex-col justify-between h-full">
            <h3 className="font-bold text-white text-xs text-right border-b border-zinc-800 pb-3">
              <span>📊 فعالية ومعدل إنجاز العقود</span>
            </h3>

            <div className="py-6 flex flex-col items-center justify-center">
              {/* SVG Ring Gauge progress */}
              <div className="relative w-36 h-36">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Outer circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-zinc-850 fill-none"
                    strokeWidth="8"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-brand-gold fill-none transition-all duration-500"
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionRate / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Center text of svg ring */}
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0.5">
                  <span className="text-2xl font-black text-white font-mono">{completionRate}%</span>
                  <span className="text-[10px] text-zinc-500 font-sans">صفقات ناضجة</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-zinc-800/85 pt-3">
              <div className="space-y-0.5">
                <div className="text-[9px] text-emerald-400 font-extrabold uppercase font-sans">مثبت مكتمل</div>
                <div className="font-black text-white font-mono text-sm">{completedProjectsCount}</div>
              </div>
              <div className="space-y-0.5 border-x border-zinc-800">
                <div className="text-[9px] text-amber-400 font-extrabold uppercase font-sans">قيد المعاملة</div>
                <div className="font-black text-white font-mono text-sm">{ongoingProjectsCount}</div>
              </div>
              <div className="space-y-0.5">
                <div className="text-[9px] text-blue-400 font-extrabold uppercase font-sans">مسودات جدد</div>
                <div className="font-black text-white font-mono text-sm">{newProjectsCount}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

          {/* Top Client Highlight card */}
          <div className="bg-gradient-to-r from-zinc-900 to-zinc-900/10 border border-zinc-800 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-brand-gold/10 text-brand-gold border border-brand-gold/25 rounded-2xl flex items-center justify-center">
                  <Award className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h4 className="text-white font-extrabold text-sm mb-0.5">شريك النجاح والعميل الأكثر قيمة</h4>
                  {topClient ? (
                    <p className="text-xs text-zinc-400">
                      العميل <span className="font-bold text-white">{safe(topClient.name)}</span> هو أهم داعم لأعمالك وقنوات تسييرك للمبيعات!
                    </p>
                  ) : (
                    <p className="text-xs text-zinc-500 font-sans">لم نجد مشاريع كافية لربط واحتساب مساهمات وقيمة العملاء الكليين.</p>
                  )}
                </div>
              </div>
              {topClient && (
                <div className="text-left font-mono">
                  <span className="text-[10px] text-zinc-500 uppercase block font-sans font-bold">إجمالي التدفق المالي من شراكته</span>
                  <span className="text-lg font-black text-brand-gold">
                    {fmt(topClientVal, 0)} دج
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <InvoiceGenerator projects={projects} clients={clients} />
      )}
    </div>
  );
}
