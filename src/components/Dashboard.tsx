/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  FolderKanban, 
  Users, 
  Calendar, 
  Plus, 
  ChevronLeft, 
  Zap, 
  Layers, 
  Smile,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Globe,
  Settings,
  X,
  Compass,
  Palette,
  AlertTriangle,
  User,
  Sliders,
  Check,
  BadgePercent
} from 'lucide-react';
import { Project, Client, ProjectStatus } from '../types';
import { fmt, safe, safeAlert } from '../utils';
import AIEarningsAdvisor from './AIEarningsAdvisor';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from 'recharts';

interface DashboardProps {
  projects: Project[];
  clients: Client[];
  onNavigate: (view: string) => void;
  onOpenProjectModal: (id?: string) => void;
  onOpenClientModal: () => void;
}

export default function Dashboard({
  projects,
  clients,
  onNavigate,
  onOpenProjectModal,
  onOpenClientModal,
}: DashboardProps) {
  // Toggle between Premium Panoramic Mockup and Classic Stats layout
  const [dashboardMode, setDashboardMode] = useState<'panoramic' | 'classic'>('classic');

  // SCREEN 1 STATE: تسعير خدمات التصميم
  const [designType, setDesignType] = useState('branding, logo, ملصق');
  const [deliveryTime, setDeliveryTime] = useState('20');
  const [experienceLevel, setExperienceLevel] = useState('خبير محترف');
  const [focusedInput, setFocusedInput] = useState<'deliveryTime' | 'designType'>('deliveryTime');
  const [suggestedPrice, setSuggestedPrice] = useState(15000);
  const [isSparkling, setIsSparkling] = useState(false);

  // SCREEN 2 STATE: تفاصيل المشروع
  const [complexity, setComplexity] = useState<'بسيط' | 'متوسط' | 'معقد'>('متوسط');
  const [revisions, setRevisions] = useState(5);
  const [commercialLicense, setCommercialLicense] = useState(true);
  const [priorityScore, setPriorityScore] = useState(4); // "الشاص الأموبيات" / الخاص بالأولويات
  const [qualityInsurance, setQualityInsurance] = useState(true);

  // SCREEN 4 STATE: الإعدادات والملف الشخصي
  const [userName, setUserName] = useState('أكرم مغراوي');
  const [userInitials, setUserInitials] = useState('أ م');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [currency, setCurrency] = useState('constant DZD');
  const [language, setLanguage] = useState('اللغة العربية');

  // Quick helper to extract initials
  useEffect(() => {
    if (userName.trim()) {
      const parts = userName.trim().split(' ');
      if (parts.length >= 2) {
        setUserInitials(`${parts[1][0]} ${parts[0][0]}`);
      } else {
        setUserInitials(userName.trim().slice(0, 2));
      }
    }
  }, [userName]);

  // Classic statistics calculations
  const totalEarnings = projects.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
  
  const activeProjectsCount = projects.filter(
    (p) => p.status !== 'done' && p.status !== 'cancelled'
  ).length;

  const dashboardAlerts = (() => {
    const list: { project: Project; daysRemaining: number; urgency: 'overdue' | 'high' | 'medium' }[] = [];
    const activeProjs = projects.filter(
      (p) => p.status !== 'done' && p.status !== 'cancelled' && p.start
    );
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayTime = new Date(todayStr).getTime();

    activeProjs.forEach((p) => {
      const targetDeadlineStr = p.deadline || (() => {
        const startDate = new Date(p.start);
        startDate.setDate(startDate.getDate() + 10);
        return startDate.toISOString().slice(0, 10);
      })();

      const deadlineTime = new Date(targetDeadlineStr).getTime();
      const diffMs = deadlineTime - todayTime;
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        list.push({ project: p, daysRemaining: diffDays, urgency: 'overdue' });
      } else if (diffDays <= 3) {
        list.push({ project: p, daysRemaining: diffDays, urgency: 'high' });
      } else if (diffDays <= 7) {
        list.push({ project: p, daysRemaining: diffDays, urgency: 'medium' });
      }
    });

    return list.sort((a, b) => {
      const urgencyWeight = { overdue: 3, high: 2, medium: 1 };
      if (urgencyWeight[a.urgency] !== urgencyWeight[b.urgency]) {
        return urgencyWeight[b.urgency] - urgencyWeight[a.urgency];
      }
      return a.daysRemaining - b.daysRemaining;
    });
  })();

  const thisMonthEarnings = projects
    .filter((p) => {
      if (!p.start) return false;
      const d = new Date(p.start);
      return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
    })
    .reduce((sum, p) => sum + (Number(p.price) || 0), 0);

  // Status counters
  const statusCounts = {
    new: 0,
    progress: 0,
    waiting: 0,
    done: 0,
    cancelled: 0,
  };
  projects.forEach((p) => {
    if (statusCounts[p.status] !== undefined) {
      statusCounts[p.status]++;
    }
  });

  const getStatusDetails = (status: ProjectStatus) => {
    switch (status) {
      case 'new':
        return { label: 'جديد', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: <AlertCircle className="w-4 h-4" /> };
      case 'progress':
        return { label: 'قيد الإنجاز', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: <Clock className="w-4 h-4" /> };
      case 'waiting':
        return { label: 'بانتظار العميل', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', icon: <Layers className="w-4 h-4" /> };
      case 'done':
        return { label: 'مكتمل', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: <CheckCircle className="w-4 h-4" /> };
      case 'cancelled':
        return { label: 'ملغى', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', icon: <AlertCircle className="w-4 h-4" /> };
    }
  };

  // Recharts Data Processing
  const statusPieData = [
    { name: 'مكتملة', value: statusCounts.done || 0, color: '#10b981' },
    { name: 'قيد التنفيذ', value: statusCounts.progress || 0, color: '#f59e0b' },
    { name: 'بانتظار الرد', value: statusCounts.waiting || 0, color: '#8b5cf6' },
    { name: 'جديدة', value: statusCounts.new || 0, color: '#3b82f6' },
    { name: 'ملغاة', value: statusCounts.cancelled || 0, color: '#ef4444' },
  ].filter((d) => d.value > 0);

  const fallbackPieData = [
    { name: 'مكتملة (مثال)', value: 4, color: '#10b981' },
    { name: 'قيد التنفيذ (مثال)', value: 2, color: '#f59e0b' },
    { name: 'بانتظار الرد (مثال)', value: 1, color: '#8b5cf6' },
    { name: 'جديدة (مثال)', value: 1, color: '#3b82f6' },
  ];

  const finalPieData = statusPieData.length > 0 ? statusPieData : fallbackPieData;

  const projectsWithPrice = [...projects]
    .filter((p) => (Number(p.price) || 0) > 0)
    .sort((a, b) => (a.start || '').localeCompare(b.start || ''));

  const revenueTimelineData = projectsWithPrice.map((p, idx) => ({
    name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
    fullName: p.name,
    'القيمة (دج)': Number(p.price) || 0,
    'الترتيب': `م${idx + 1}`,
    'الحالة': p.status === 'done' ? 'مكتمل' : 'قيد الإنجاز'
  })).slice(-8);

  const fallbackTimelineData = [
    { name: 'هوية بصرية', fullName: 'هوية بصرية كاملة لشركة ماركة', 'القيمة (دج)': 120000, 'الترتيب': 'م1', 'الحالة': 'مكتمل' },
    { name: 'تصميم موقع ويب', fullName: 'تصميم موقع تعريفي للشركة الاستثمارية', 'القيمة (دج)': 85000, 'الترتيب': 'م2', 'الحالة': 'قيد الإنجاز' },
    { name: 'تطبيق جوال', fullName: 'تصميم واجهة مستخدم تطبيق الجوال', 'القيمة (دج)': 195000, 'الترتيب': 'م3', 'الحالة': 'مكتمل' },
    { name: 'فيديو موشن جرافيك', fullName: 'فيديو موشن جرافيك ترويجي لخدمة الدفع الإلكتروني', 'القيمة (دج)': 65000, 'الترتيب': 'م4', 'الحالة': 'قيد الإنجاز' },
    { name: 'شعار تجاري', fullName: 'تصميم شعار وبطاقات وهوية تجارية لمحل ملابس', 'القيمة (دج)': 45000, 'الترتيب': 'م5', 'الحالة': 'مكتمل' }
  ];

  const finalTimelineData = revenueTimelineData.length > 0 ? revenueTimelineData : fallbackTimelineData;
  const isTimelineMocked = revenueTimelineData.length === 0;
  const isPieMocked = statusPieData.length === 0;

  // Keyboard numerical click events
  const handleKeypadPress = (key: string) => {
    if (focusedInput === 'deliveryTime') {
      if (key === 'C') {
        setDeliveryTime('');
      } else if (key === '.') {
        if (!deliveryTime.includes('.')) {
          setDeliveryTime((prev) => prev + '.');
        }
      } else {
        // limit to 3 digits
        if (deliveryTime.length < 4) {
          setDeliveryTime((prev) => prev + key);
        }
      }
    }
  };

  // Calculate the Suggested Price live!
  const calculateLivePrice = () => {
    setIsSparkling(true);
    setTimeout(() => {
      setIsSparkling(false);
    }, 900);

    // Formulation: Base price times experience & complexity and commercial use
    let base = 5000;
    const hours = parseFloat(deliveryTime) || 20;
    
    // Add hourly factor
    base += hours * 350;

    // Experience weight
    if (experienceLevel === 'خبير محترف') base *= 1.8;
    else if (experienceLevel === 'متوسط') base *= 1.3;
    else base *= 0.9;

    // Complexity
    if (complexity === 'معقد') base += 8000;
    else if (complexity === 'متوسط') base += 3500;
    else base += 1000;

    // Add revisions
    base += revisions * 500;

    // Commercial use & Priorities
    if (commercialLicense) base += 4000;
    base += priorityScore * 1000;

    // Save
    setSuggestedPrice(Math.round(base));
  };

  // Calculate live price automatically whenever inputs change
  useEffect(() => {
    calculateLivePrice();
  }, [deliveryTime, experienceLevel, complexity, revisions, commercialLicense, priorityScore]);

  // Handle adding the simulated design price estimate as a real database project
  const saveEstimateAsProject = () => {
    safeAlert(`تم تحويل عرض السعر المقترح بقيمة (${fmt(suggestedPrice, 0)} دج) بنجاح! سيتم فتح قائمة تسجيل المشروع الجديد.`);
    onOpenProjectModal();
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header with layout switcher tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800/20 pb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Palette className="w-5 h-5 text-brand-gold animate-bounce" />
            <span>لوحة التحكم وتخصيص المظهر</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">تفاعل مع واجهة التطبيق البانورامية الفاخرة أو تنقل للمشاهدات الكلاسيكية.</p>
        </div>

        {/* Custom tabs to switch design mode */}
        <div className="bg-zinc-950/80 p-1.5 rounded-2xl border border-zinc-800 flex items-center gap-1 self-start select-none">
          <button
            type="button"
            onClick={() => setDashboardMode('panoramic')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
              dashboardMode === 'panoramic'
                ? 'bg-brand-gold text-brand-bg shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            }`}
          >
            <span>📱 المظهر الفاخر البانورامي (التصميم العصري)</span>
          </button>
          <button
            type="button"
            onClick={() => setDashboardMode('classic')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
              dashboardMode === 'classic'
                ? 'bg-brand-gold text-brand-bg shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            }`}
          >
            <span>📊 الإحصائيات وجدول البيانات الكلاسيكي</span>
          </button>
        </div>
      </div>

      {/* RENDER PANORAMIC DEVICE LAYOUT MATCHING IMAGE */}
      {dashboardMode === 'panoramic' && (
        <div className="space-y-6">
          {/* Informative tips */}
          <div className="bg-gradient-to-r from-brand-gold/10 via-zinc-900/50 to-transparent p-4 rounded-2xl border border-brand-gold/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-black text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-gold animate-spin" />
                <span>الوضع البانورامي عالي الفخامة للوحة التصميم والأسعار</span>
              </h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                هذه الواجهة تم تنسيقها وتطويرها طبقاً لمرجع التصميم البصري المُقدّم. جميع البطاقات والأجهزة الأربعة تفاعلية بالكامل: استخدم أزرار لوحة الأرقام، حرّك أشرطة المراجعات والأولويات، غيّر مستوى التعقيد والعملات، لترى التحديث الساحر للأسعار الإجمالية والمخططات فوراً!
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={calculateLivePrice}
                className="px-3.5 py-1.5 bg-brand-gold/20 hover:bg-brand-gold/30 text-brand-gold border border-brand-gold/25 text-xs font-bold rounded-lg transition"
              >
                🔄 إعادة حساب المخططات
              </button>
            </div>
          </div>

          {/* Panoramic scrolling wrapper of 4 smart columns */}
          <div className="overflow-x-auto pb-4 no-scrollbar">
            <div className="flex flex-col lg:flex-row gap-6 min-w-full justify-between items-stretch">
              
              {/* DEVICE COLUMN 1: تسعير خدمات التصميم */}
              <div 
                className="w-full lg:w-[280px] shrink-0 bg-[#0f172a] dark:bg-zinc-950 border border-zinc-805/80 rounded-[35px] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-brand-gold/5 transition duration-300 flex flex-col justify-between text-right relative overflow-hidden premium-device-column"
                style={{ minHeight: '580px' }}
              >
                {/* Smartphone glass bar top */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-zinc-900 rounded-full border border-zinc-850/30 flex items-center justify-center pointer-events-none z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 mr-2" />
                  <span className="w-10 h-1 bg-zinc-800 rounded-full" />
                </div>

                <div className="pt-4 space-y-4 flex-1 flex flex-col justify-between">
                  {/* Header Row */}
                  <div className="flex items-center gap-2 border-b border-zinc-800/50 pb-2.5">
                    <span className="p-1.5 bg-brand-gold/15 rounded-lg border border-brand-gold/20 flex items-center justify-center shrink-0">
                      <Compass className="w-4 h-4 text-brand-gold" />
                    </span>
                    <h3 className="text-xs font-black text-white truncate">تسعير خدمات التصميم</h3>
                  </div>

                  {/* Form contents */}
                  <div className="space-y-3.5">
                    
                    {/* Design Type input */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 block">نوع التصميم</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={designType}
                          onChange={(e) => setDesignType(e.target.value)}
                          onFocus={() => setFocusedInput('designType')}
                          placeholder="branding, logo, Poster"
                          className={`w-full text-right bg-zinc-900 border text-xs rounded-xl p-2.5 text-white transition focus:outline-none ${
                            focusedInput === 'designType' ? 'border-brand-gold bg-zinc-900/60' : 'border-zinc-800/80'
                          }`}
                        />
                        <span className="absolute left-3 top-2.5 text-[10px] text-zinc-500 font-sans">نوع</span>
                      </div>
                    </div>

                    {/* Delivery Time input */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 block">وقت التسليم</label>
                      <div className="flex gap-2">
                        <div className="w-[85px] bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs rounded-xl flex items-center justify-center font-bold px-1 py-2 select-none shrink-0 font-sans">
                          ساعة
                        </div>
                        <input
                          type="text"
                          value={deliveryTime || '0'}
                          onChange={(e) => setDeliveryTime(e.target.value.replace(/[^0-9.]/g, ''))}
                          onFocus={() => setFocusedInput('deliveryTime')}
                          className={`flex-1 text-center font-mono font-black text-sm bg-zinc-900 border text-white rounded-xl p-2.5 transition focus:outline-none ${
                            focusedInput === 'deliveryTime' ? 'border-brand-gold bg-zinc-900/60' : 'border-zinc-800/80'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Experience level custom select */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 block">مستوى الخبرة</label>
                      <select
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                        className="w-full text-right bg-zinc-900 border border-zinc-800 text-xs rounded-xl p-2.5 text-zinc-200 focus:outline-none focus:border-brand-gold transition"
                      >
                        <option value="محترف وخبير">خبير محترف ⭐⭐⭐</option>
                        <option value="متوسط">متوسط المستوى ⭐⭐</option>
                        <option value="مبتدئ">مبتدئ واعد ⭐</option>
                      </select>
                    </div>
                  </div>

                  {/* DIGITAL KEYPAD OVERLAY STYLE */}
                  <div className="bg-zinc-900/60 border border-zinc-850 p-2 rounded-2xl space-y-1.5 my-2">
                    <div className="grid grid-cols-4 gap-1.5 font-mono text-center">
                      {['7', '8', '9', '÷'].map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => key === '÷' ? setFocusedInput('deliveryTime') : handleKeypadPress(key)}
                          className={`py-1.5 rounded-lg text-xs font-extrabold bg-[#1e293b] hover:bg-zinc-800 transition cursor-pointer border border-zinc-800 ${
                            key === '÷' ? '!text-[#00C2FF]' : '!text-white'
                          }`}
                        >
                          {key}
                        </button>
                      ))}
                      {['4', '5', '6', '×'].map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => key === '×' ? setFocusedInput('deliveryTime') : handleKeypadPress(key)}
                          className={`py-1.5 rounded-lg text-xs font-extrabold bg-[#1e293b] hover:bg-zinc-800 transition cursor-pointer border border-zinc-800 ${
                            key === '×' ? '!text-[#00C2FF]' : '!text-white'
                          }`}
                        >
                          {key}
                        </button>
                      ))}
                      {['1', '2', '3', '-'].map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => key === '-' ? setFocusedInput('deliveryTime') : handleKeypadPress(key)}
                          className={`py-1.5 rounded-lg text-xs font-extrabold bg-[#1e293b] hover:bg-zinc-800 transition cursor-pointer border border-zinc-800 ${
                            key === '-' ? '!text-[#00C2FF]' : '!text-white'
                          }`}
                        >
                          {key}
                        </button>
                      ))}
                      {['C', '0', '.', '+'].map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            if (key === '+') {
                              calculateLivePrice();
                            } else {
                              handleKeypadPress(key);
                            }
                          }}
                          className={`py-1.5 rounded-lg text-xs font-black transition cursor-pointer border ${
                            key === '+' 
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 !text-white border-blue-500' 
                              : key === 'C' 
                              ? 'bg-rose-950/40 !text-rose-400 border-rose-900/30' 
                              : 'bg-[#1e293b] hover:bg-zinc-800 border-zinc-800 !text-white'
                          }`}
                        >
                          {key}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Calculate primary button */}
                  <div className="space-y-3.5 mt-auto">
                    <button
                      type="button"
                      onClick={calculateLivePrice}
                      className="w-full relative py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-extrabold rounded-2xl text-xs transition-transform transform active:scale-98 shadow-md hover:shadow-blue-500/10 cursor-pointer overflow-hidden flex items-center justify-center gap-1.5"
                    >
                      {isSparkling ? (
                        <span className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
                      ) : null}
                      <Sparkles className={`w-4 h-4 ${isSparkling ? 'animate-spin' : ''}`} />
                      <span>احسب السعر</span>
                    </button>

                    {/* Calculated Price Footer Badge */}
                    <div 
                      onClick={saveEstimateAsProject}
                      className="bg-zinc-900/55 hover:bg-zinc-900 p-2 rounded-xl text-center border border-zinc-800 cursor-pointer transition flex flex-col items-center justify-center gap-0.5 group"
                    >
                      <span className="text-[9px] text-zinc-500 group-hover:text-brand-gold">السعر المقترح للمشروع</span>
                      <span className="font-mono text-xs font-bold text-brand-gold">
                        {fmt(suggestedPrice, 0)} دج
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* DEVICE COLUMN 2: تفاصيل المشروع */}
              <div 
                className="w-full lg:w-[280px] shrink-0 bg-[#0f172a] dark:bg-zinc-950 border border-zinc-805/80 rounded-[35px] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-brand-gold/5 transition duration-300 flex flex-col justify-between text-right relative overflow-hidden premium-device-column"
                style={{ minHeight: '580px' }}
              >
                {/* Smartphone glass bar top */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-zinc-900 rounded-full border border-zinc-850/30 flex items-center justify-center pointer-events-none z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 mr-2" />
                  <span className="w-10 h-1 bg-zinc-800 rounded-full" />
                </div>

                <div className="pt-4 space-y-4 flex-1 flex flex-col justify-between">
                  {/* Header Row */}
                  <div className="flex items-center gap-2 border-b border-zinc-800/50 pb-2.5">
                    <span className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20 flex items-center justify-center shrink-0">
                      <Sliders className="w-4 h-4 text-indigo-400" />
                    </span>
                    <h3 className="text-xs font-black text-white">تفاصيل المشروع</h3>
                  </div>

                  {/* Sliders and custom switches */}
                  <div className="space-y-4 my-auto">
                    
                    {/* Complexity Selector */}
                    <div className="space-y-1 bg-zinc-900/40 p-3 rounded-2xl border border-zinc-850/45">
                      <label className="text-[10px] font-bold text-zinc-400 block mb-1">تعقيد التصميم</label>
                      <div className="grid grid-cols-3 gap-1.5 text-center">
                        {['بسيط', 'متوسط', 'معقد'].map((opt) => {
                          const isSel = complexity === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setComplexity(opt as any)}
                              className={`py-1.5 text-[10px] font-bold rounded-lg border transition ${
                                isSel 
                                  ? 'bg-blue-600/20 text-blue-400 border-blue-500' 
                                  : 'bg-zinc-950/80 border-transparent text-zinc-400 hover:text-zinc-200'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Revisions Control slider with cyan slider handle */}
                    <div className="space-y-1 bg-zinc-900/30 p-3 rounded-2xl border border-zinc-855">
                      <div className="flex items-center justify-between text-[10px] mb-1 font-bold">
                        <span className="text-zinc-400">عدد المراجعات</span>
                        <span className="font-mono text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          {revisions} مرات
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={revisions}
                        onChange={(e) => setRevisions(Number(e.target.value))}
                        className="w-full accent-blue-500 h-1.5 rounded-full bg-zinc-950 cursor-pointer outline-none"
                      />
                    </div>

                    {/* Commercial License switch */}
                    <div className="flex items-center justify-between bg-zinc-905/65 p-3 rounded-xl border border-zinc-850/45">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-zinc-300 block">الترخيص الاستخدام</span>
                        <span className="text-[9px] text-zinc-500">حقوق ملكية تجارية كاملة</span>
                      </div>
                      
                      {/* Interactive beautiful toggle switch */}
                      <button
                        type="button"
                        onClick={() => setCommercialLicense(!commercialLicense)}
                        className={`w-10 h-5.5 rounded-full p-0.5 transition-colors focus:outline-none ${
                          commercialLicense ? 'bg-blue-500' : 'bg-zinc-850'
                        }`}
                      >
                        <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                          commercialLicense ? '-translate-x-4.5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Priorities Slider */}
                    <div className="space-y-1 bg-zinc-900/30 p-3 rounded-2xl border border-zinc-855">
                      <div className="flex items-center justify-between text-[10px] mb-1 font-bold">
                        <span className="text-zinc-400">الشاص الأموبيات (درجة الأولوية)</span>
                        <span className="font-mono text-amber-500 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                          {priorityScore === 5 ? 'طارئ جداً 🔥' : priorityScore >= 3 ? 'متوسط الإلحاح ⏳' : 'متاح براحة ☕'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={priorityScore}
                        onChange={(e) => setPriorityScore(Number(e.target.value))}
                        className="w-full accent-amber-500 h-1.5 rounded-full bg-zinc-950 cursor-pointer outline-none"
                      />
                    </div>

                    {/* Commercial Quality Switch */}
                    <div className="flex items-center justify-between bg-zinc-905/65 p-3 rounded-xl border border-zinc-850/45">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-zinc-300 block">الترخيص الاستخدام</span>
                        <p className="text-[9px] text-zinc-500">المشروي المعجل بالجودة العالية</p>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => setQualityInsurance(!qualityInsurance)}
                        className={`w-10 h-5.5 rounded-full p-0.5 transition-colors focus:outline-none ${
                          qualityInsurance ? 'bg-indigo-500' : 'bg-zinc-850'
                        }`}
                      >
                        <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                          qualityInsurance ? '-translate-x-4.5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                  </div>

                  {/* Card bottom notice */}
                  <div className="mt-auto border-t border-zinc-900/60 pt-3 text-center">
                    <p className="text-[10px] text-zinc-500 leading-relaxed font-sans">
                      تؤثر الخيارات والترخيص طردياً في خوارزميات التسعير الفوري للمساهمين.
                    </p>
                  </div>
                </div>
              </div>

              {/* DEVICE COLUMN 3: الإحصائيات والأرباح */}
              <div 
                className="w-full lg:w-[280px] shrink-0 bg-[#0f172a] dark:bg-zinc-950 border border-zinc-805/80 rounded-[35px] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-brand-gold/5 transition duration-300 flex flex-col justify-between text-right relative overflow-hidden premium-device-column"
                style={{ minHeight: '580px' }}
              >
                {/* Smartphone glass bar top */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-zinc-900 rounded-full border border-zinc-850/30 flex items-center justify-center pointer-events-none z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 mr-2" />
                  <span className="w-10 h-1 bg-zinc-800 rounded-full" />
                </div>

                <div className="pt-4 space-y-4 flex-1 flex flex-col justify-between">
                  {/* Header Row */}
                  <div className="flex items-center gap-2 border-b border-zinc-800/50 pb-2.5">
                    <span className="p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </span>
                    <h3 className="text-xs font-black text-white">الإحصائيات والأرباح</h3>
                  </div>

                  {/* TOTAL EARNINGS NAVY CARD */}
                  <div className="bg-[#1e3a8a] text-white rounded-2xl p-4.5 text-center relative overflow-hidden shadow-md mt-1.5 select-none shrink-0">
                    <div className="absolute -top-3 -right-3 w-16 h-16 bg-blue-500/20 rounded-full blur-xl pointer-events-none" />
                    <span className="text-[10px] uppercase font-bold text-blue-200 block mb-1">الأرباح الكلية</span>
                    <span className="text-xl md:text-2xl font-black block font-mono text-center leading-none">
                      {fmt(850000 + projects.reduce((s, x) => s + (Number(x.price) || 0), 0) - totalEarnings, 0)} دج
                    </span>
                  </div>

                  {/* AREA CHART BLOCK (using high-accuracy smooth vectors) */}
                  <div className="bg-zinc-900/40 border border-zinc-850/45 p-2 rounded-2xl space-y-1 select-none">
                    <div className="w-full h-24 relative mt-1">
                      {/* Interactive curved chart drawing */}
                      <svg viewBox="0 0 300 120" className="w-full h-full">
                        <defs>
                          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.32" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Horizontal grid lines */}
                        <line x1="10" y1="20" x2="280" y2="20" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="2 2" />
                        <line x1="10" y1="50" x2="280" y2="50" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="2 2" />
                        <line x1="10" y1="80" x2="280" y2="80" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="2 2" />
                        
                        {/* Y-Axis numbers overlay on right */}
                        <text x="288" y="24" fill="#6b7280" fontSize="8" fontFamily="sans-serif">80</text>
                        <text x="288" y="54" fill="#6b7280" fontSize="8" fontFamily="sans-serif">40</text>
                        <text x="288" y="84" fill="#6b7280" fontSize="8" fontFamily="sans-serif">20</text>
                        <text x="288" y="112" fill="#6b7280" fontSize="8" fontFamily="sans-serif">0</text>

                        {/* Solid smooth Bezier curve */}
                        <path
                          d="M 15 95 C 45 65, 75 75, 105 45 C 135 25, 155 90, 185 62 C 215 32, 235 15, 265 15"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        {/* Shaded Area fill below the line */}
                        <path
                          d="M 15 95 C 45 65, 75 75, 105 45 C 135 25, 155 90, 185 62 C 215 32, 235 15, 265 15 L 265 110 L 15 110 Z"
                          fill="url(#areaGrad)"
                        />

                        {/* Interactive circle bullet points */}
                        <circle cx="15" cy="95" r="3.5" fill="#1e293b" stroke="#3b82f6" strokeWidth="2.5" className="hover:scale-150 transition" />
                        <circle cx="105" cy="45" r="3.5" fill="#1e293b" stroke="#3b82f6" strokeWidth="2.5" className="hover:scale-150 transition" />
                        <circle cx="185" cy="62" r="3.5" fill="#1e293b" stroke="#3b82f6" strokeWidth="2.5" className="hover:scale-150 transition" />
                        <circle cx="265" cy="15" r="4.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" className="hover:scale-150 transition shrink-0" />
                      </svg>
                    </div>

                    {/* Month indicators from reference */}
                    <div className="flex justify-between items-center text-[8.5px] text-zinc-500 font-sans px-1">
                      <span>دول</span>
                      <span>شهب</span>
                      <span>شمي</span>
                      <span>شوي</span>
                      <span>فون</span>
                      <span>مج</span>
                      <span>دج</span>
                    </div>
                  </div>

                  {/* PROFITS CATEGORY BAR CHART */}
                  <div className="bg-zinc-900/40 border border-zinc-850/45 p-3 rounded-2xl space-y-2 select-none flex-1 flex flex-col justify-between">
                    <span className="text-[10px] text-zinc-400 font-bold block">الأرباح المشروع</span>
                    
                    {/* Columns containers */}
                    <div className="flex h-16 items-end justify-around gap-2 px-1">
                      {/* Bar 1: شعار */}
                      <div className="flex flex-col items-center flex-1 h-full justify-end group">
                        <div className="w-3.5 bg-cyan-400 rounded-t-md h-[45%] group-hover:bg-cyan-300 transition duration-150 relative">
                          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[7px] text-cyan-400 opacity-0 group-hover:opacity-100 transition whitespace-nowrap bg-zinc-900 px-1 rounded">45%</span>
                        </div>
                      </div>

                      {/* Bar 2: هوية بصرية */}
                      <div className="flex flex-col items-center flex-1 h-full justify-end group">
                        <div className="w-3.5 bg-indigo-500 rounded-t-md h-[78%] group-hover:bg-indigo-400 transition duration-150 relative">
                          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[7px] text-indigo-400 opacity-0 group-hover:opacity-100 transition whitespace-nowrap bg-zinc-900 px-1 rounded">78%</span>
                        </div>
                      </div>

                      {/* Bar 3: ملصق */}
                      <div className="flex flex-col items-center flex-1 h-full justify-end group">
                        <div className="w-3.5 bg-purple-600 rounded-t-md h-[25%] group-hover:bg-purple-500 transition duration-150 relative">
                          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[7px] text-purple-400 opacity-0 group-hover:opacity-100 transition whitespace-nowrap bg-zinc-900 px-1 rounded">25%</span>
                        </div>
                      </div>
                    </div>

                    {/* Labels row and descriptive values exactly as requested */}
                    <div className="grid grid-cols-3 text-center border-t border-zinc-800/50 pt-2 gap-1 text-[8px] text-zinc-400 font-sans select-none leading-relaxed">
                      <div>
                        <div className="font-bold text-white text-[9px] truncate">شعار</div>
                        <span className="font-mono text-zinc-500">15,000 دج</span>
                      </div>
                      <div className="border-x border-zinc-800/40">
                        <div className="font-bold text-white text-[9px] truncate">هوية بصرية</div>
                        <span className="font-mono text-zinc-500">15,000 دج</span>
                      </div>
                      <div>
                        <div className="font-bold text-white text-[9px] truncate">ملصق</div>
                        <span className="font-mono text-cyan-400">21% دج</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* DEVICE COLUMN 4: الإعدادات والملف الشخصي */}
              <div 
                className="w-full lg:w-[280px] shrink-0 bg-[#0f172a] dark:bg-zinc-950 border border-zinc-805/80 rounded-[35px] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-brand-gold/5 transition duration-300 flex flex-col justify-between text-right relative overflow-hidden premium-device-column"
                style={{ minHeight: '580px' }}
              >
                {/* Smartphone glass bar top */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-zinc-900 rounded-full border border-zinc-850/30 flex items-center justify-center pointer-events-none z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 mr-2" />
                  <span className="w-10 h-1 bg-zinc-800 rounded-full" />
                </div>

                <div className="pt-4 space-y-4 flex-1 flex flex-col justify-between">
                  {/* Header Row */}
                  <div className="flex items-center gap-2 border-b border-zinc-800/50 pb-2.5">
                    <span className="p-1.5 bg-purple-500/10 rounded-lg border border-purple-500/20 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-purple-400" />
                    </span>
                    <h3 className="text-xs font-black text-white">الإعدادات والملف الشخصي</h3>
                  </div>

                  {/* VIBRANT GRADIENT PROFILE CARD */}
                  <div className="relative bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-4.5 text-center shadow-lg overflow-hidden shrink-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-20 pointer-events-none" />
                    
                    {/* Large bubble with user initials with white border */}
                    <div 
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      className="w-14 h-14 rounded-full border-2 border-white bg-white/15 backdrop-blur-md mx-auto flex items-center justify-center text-white font-extrabold text-base cursor-pointer hover:scale-105 active:scale-95 transition"
                      title="انقر لتعديل اسمك الكريم"
                    >
                      {userInitials || 'أ م'}
                    </div>

                    <div className="mt-2.5 space-y-0.5">
                      <span className="text-xs font-black text-white block">{userName}</span>
                      <span className="text-[10px] text-zinc-200 block">الملف الشخصي</span>
                    </div>

                    {isEditingProfile && (
                      <div className="absolute inset-0 bg-zinc-950/95 p-3 flex flex-col justify-between text-right animate-fade-in z-20">
                        <div>
                          <label className="text-[9px] font-bold text-zinc-400 block mb-1">اسمك الكريم</label>
                          <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 p-1 rounded text-xs text-white text-right focus:outline-none"
                            placeholder="مثال: أكرم مغراوي"
                          />
                        </div>
                        <div className="flex gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => setIsEditingProfile(false)}
                            className="px-2 py-1 bg-brand-gold text-brand-bg text-[10px] font-bold rounded"
                          >
                            موافق
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SETTINGS CARD LIST */}
                  <div className="space-y-2.5 flex-1 mt-2.5 flex flex-col justify-start">
                    <span className="text-[10px] text-zinc-400 font-extrabold uppercase block tracking-wider">الإعدادات</span>
                    
                    {/* Item 1: Currency constant DZD */}
                    <div className="bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-850/60 p-3 rounded-2xl flex items-center justify-between text-right transition group cursor-pointer">
                      <div className="space-y-0.5 flex-1 mr-2.5 overflow-hidden">
                        <span className="text-[10px] font-sans font-bold text-zinc-500 block">العملة</span>
                        <input
                          type="text"
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="bg-transparent border-0 text-white font-mono font-bold text-[11px] outline-none block w-full text-right"
                        />
                      </div>
                      <span className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <Coins className="w-4 h-4" />
                      </span>
                    </div>

                    {/* Item 2: Language العربية */}
                    <div className="bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-850/60 p-3 rounded-2xl flex items-center justify-between text-right transition group cursor-pointer">
                      <div className="space-y-0.5 flex-1 mr-2.5 overflow-hidden">
                        <span className="text-[10px] font-sans font-bold text-zinc-500 block">اللغة</span>
                        <input
                          type="text"
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="bg-transparent border-0 text-white font-bold text-[11px] outline-none block w-full text-right"
                        />
                      </div>
                      <span className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <Globe className="w-4 h-4" />
                      </span>
                    </div>

                    {/* Item 3: Pricing settings */}
                    <div 
                      onClick={() => onNavigate('calculator')}
                      className="bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-850/60 p-3 rounded-2xl flex items-center justify-between text-right transition group cursor-pointer"
                    >
                      <div className="space-y-0.5 flex-1 mr-2.5">
                        <span className="text-[10px] font-sans font-bold text-zinc-405 block">إعدادات التسعير</span>
                        <p className="text-[9.5px] text-zinc-500 leading-tight">
                          إعدادات التسعير وتأثيرها في الإيرادات والتصميم
                        </p>
                      </div>
                      <span className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <Settings className="w-4 h-4 text-blue-400" />
                      </span>
                    </div>
                  </div>

                  {/* Logout/Reset row */}
                  <div className="mt-auto pt-3 border-t border-zinc-900/60 text-center">
                    <span className="text-[10px] text-zinc-650 font-mono">DZD Pricing Standard v3.1</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* CLASSIC DETAILED LAYOUT LIST (for compatibility & comprehensive charts) */}
      {dashboardMode === 'classic' && (
        <div className="space-y-6">
          {/* Welcome Banner */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 top-0 w-48 bg-gradient-to-r from-brand-gold/10 to-transparent pointer-events-none" />
            <div className="relative z-10 space-y-1">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                مرحباً بك في <span>MARKA </span><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5E62] via-[#7C3AED] to-[#00C2FF]">PRO</span> 👋
              </h2>
              <p className="text-zinc-400 text-sm">
                نظامك المتكامل لإدارة الحسابات، تسعير المشاريع، وإرسال عروض الأسعار الأنيقة لعملائك بالدينار الجزائري.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-3 relative z-10">
              <button 
                type="button"
                onClick={() => onOpenProjectModal()}
                className="flex items-center gap-2 bg-brand-gold hover:bg-amber-500 text-brand-bg font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>مشروع جديد</span>
              </button>
              <button 
                type="button"
                onClick={() => onNavigate('calculator')}
                className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-brand-gold border border-brand-gold/20 font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>حاسبة التسعير السريع</span>
              </button>
            </div>
          </div>

          {/* Active Alerts Notification Banner */}
          {dashboardAlerts.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-805/80 rounded-2xl p-5 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-2.5 gap-2">
                <h3 className="text-xs font-black text-rose-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>جرس إشعارات تتبع مواعيد تسليم المشاريع ({dashboardAlerts.length})</span>
                </h3>
                <span className="text-[10px] text-zinc-500 font-sans">برجاء مراجعة وتحديث حالة المشاريع التالية</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {dashboardAlerts.map((a) => {
                  let alertColor = '';
                  let badgeText = '';
                  let borderClass = '';
                  
                  if (a.urgency === 'overdue') {
                    alertColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
                    borderClass = 'hover:border-rose-500/40 border-rose-950/40';
                    badgeText = `⚠️ متأخر بـ ${Math.abs(a.daysRemaining)} يوم!`;
                  } else if (a.urgency === 'high') {
                    alertColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
                    borderClass = 'hover:border-amber-500/40 border-amber-950/40';
                    badgeText = `⏳ متبقي ${a.daysRemaining} أيام فقط!`;
                  } else {
                    alertColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
                    borderClass = 'hover:border-cyan-500/40 border-cyan-950/40';
                    badgeText = `📅 متبقي ${a.daysRemaining} أيام`;
                  }
                  
                  return (
                    <div 
                      key={a.project.id}
                      onClick={() => onOpenProjectModal(a.project.id)}
                      className={`p-3.5 rounded-xl border ${borderClass} bg-zinc-950/30 hover:bg-zinc-950/80 cursor-pointer transition flex flex-col justify-between gap-2.5 group`}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="text-xs font-bold text-zinc-100 group-hover:text-amber-400 transition line-clamp-1 flex-1">{safe(a.project.name)}</span>
                        <span className={`text-[9px] font-black shrink-0 px-2 py-0.5 rounded-md border ${alertColor}`}>
                          {badgeText}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 border-t border-zinc-800/20 pt-1.5">
                        <span className="text-zinc-400">👤 {safe(a.project.clientName || 'بدون ارتباط')}</span>
                        <span className="font-mono">{a.project.deadline || 'تلقائي من الموعد'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 hover:border-brand-gold/30 rounded-2xl p-5 relative overflow-hidden transition duration-205 group">
              <div className="absolute top-0 right-0 w-1 h-full bg-brand-gold" />
              <div className="text-zinc-400 font-bold text-xs uppercase tracking-wider">إجمالي الأرباح المشتركة</div>
              <div className="text-2xl md:text-3xl font-black text-brand-gold font-mono mt-2 mb-1">
                {fmt(totalEarnings, 0)} <span className="text-xs font-sans font-medium text-zinc-500">دج</span>
              </div>
              <div className="text-xs text-zinc-400 flex items-center gap-1">منذ البداية</div>
              <Coins className="absolute bottom-4 left-4 w-10 h-10 text-white/5 group-hover:text-brand-gold/10 transition-colors duration-200" />
            </div>

            <div className="bg-zinc-900 border border-zinc-800 hover:border-blue-500/30 rounded-2xl p-5 relative overflow-hidden transition duration-200 group">
              <div className="absolute top-0 right-0 w-1 h-full bg-blue-500" />
              <div className="text-zinc-400 font-bold text-xs uppercase tracking-wider">المشاريع النشطة</div>
              <div className="text-2xl md:text-3xl font-black text-white font-mono mt-2 mb-1">
                {activeProjectsCount} <span className="text-xs font-sans font-medium text-zinc-500">مشروع</span>
              </div>
              <div className="text-xs text-zinc-400">قيد المتابعة والإنجاز</div>
              <FolderKanban className="absolute bottom-4 left-4 w-10 h-10 text-white/5 group-hover:text-blue-500/10 transition-colors duration-200" />
            </div>

            <div className="bg-zinc-900 border border-zinc-800 hover:border-emerald-500/30 rounded-2xl p-5 relative overflow-hidden transition duration-200 group">
              <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500" />
              <div className="text-zinc-400 font-bold text-xs uppercase tracking-wider">قاعدة العملاء</div>
              <div className="text-2xl md:text-3xl font-black text-emerald-400 font-mono mt-2 mb-1">
                {clients.length} <span className="text-xs font-sans font-medium text-zinc-500">عميل</span>
              </div>
              <div className="text-xs text-zinc-400">مسجلين في المنظومة</div>
              <Users className="absolute bottom-4 left-4 w-10 h-10 text-white/5 group-hover:text-emerald-500/10 transition-colors duration-205" />
            </div>

            <div className="bg-zinc-900 border border-zinc-800 hover:border-rose-500/30 rounded-2xl p-5 relative overflow-hidden transition duration-200 group">
              <div className="absolute top-0 right-0 w-1 h-full bg-rose-500" />
              <div className="text-zinc-400 font-bold text-xs uppercase tracking-wider">أرباح هذا الشهر</div>
              <div className="text-2xl md:text-3xl font-black text-white font-mono mt-2 mb-1">
                {fmt(thisMonthEarnings, 0)} <span className="text-xs font-sans font-medium text-zinc-500">دج</span>
              </div>
              <div className="text-xs text-zinc-400">احصاء لشهر {new Date().getMonth() + 1}</div>
              <Calendar className="absolute bottom-4 left-4 w-10 h-10 text-white/5 group-hover:text-rose-500/10 transition-colors duration-200" />
            </div>
          </div>

          {/* Recharts Analytics Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: Financial Progression (Area Chart) */}
            <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-[#00C2FF]" />
                    <span>مؤشر الأداء المالي وقيمة المشاريع</span>
                  </h3>
                  <p className="text-zinc-400 text-[11px] mt-1">
                    {isTimelineMocked 
                      ? '💡 يعرض قيمة آخر المشاريع المضافة (بيانات توضيحية لعدم وجود مشاريع مسعرة بعد)' 
                      : 'تحليل تطور قيم وميزانيات آخر 8 مشاريع مسجلة في المنظومة'}
                  </p>
                </div>
                {isTimelineMocked && (
                  <span className="text-[9px] font-black bg-[#00C2FF]/15 text-[#00C2FF] border border-[#00C2FF]/20 px-2 py-0.5 rounded-full uppercase">
                    توضيحي
                  </span>
                )}
              </div>

              <div className="w-full h-64 md:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={finalTimelineData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00C2FF" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#00C2FF" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="الترتيب" 
                      stroke="#4b5563" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#4b5563" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(v) => `${v / 1000}k`}
                    />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="bg-zinc-950/95 border border-zinc-800 p-3 rounded-xl shadow-xl text-right font-sans text-xs">
                              <p className="font-bold text-white mb-1">{item.fullName || label}</p>
                              <p className="text-[#00C2FF] font-mono font-black text-xs">
                                القيمة: {fmt(item['القيمة (دج)'], 0)} دج
                              </p>
                              {item['الحالة'] && (
                                <p className="text-zinc-400 text-[10px] mt-1">الحالة الحالية: {item['الحالة']}</p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="القيمة (دج)" 
                      stroke="#00C2FF" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Project Status Distribution (Pie Chart) */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>توزيع المشاريع والإنجاز</span>
                  </h3>
                  <p className="text-zinc-400 text-[11px] mt-1">
                    {isPieMocked 
                      ? 'نسبة الإنجاز المقدرة (بيانات توضيحية لعدم وجود مشاريع مسجلة)' 
                      : 'توزيع المشاريع النشطة والمكتملة'}
                  </p>
                </div>
                {isPieMocked && (
                  <span className="text-[9px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">
                    توضيحي
                  </span>
                )}
              </div>

              <div className="w-full h-48 md:h-56 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={finalPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {finalPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-zinc-950/95 border border-zinc-800 p-2 rounded-xl shadow-xl text-right font-sans text-xs">
                              <p className="font-bold text-white mb-1">{payload[0].name}</p>
                              <p className="text-[#00C2FF] font-mono font-bold text-xs">
                                عدد المشاريع: {payload[0].value}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Inside circle summary stats */}
                <div className="absolute text-center">
                  <span className="text-xs text-zinc-500 block">إجمالي المشاريع</span>
                  <span className="text-xl font-black text-white font-mono leading-none">
                    {projects.length || 5}
                  </span>
                </div>
              </div>

              {/* Pie custom legends */}
              <div className="grid grid-cols-2 gap-2 text-right mt-2 pt-2 border-t border-zinc-800/40">
                {finalPieData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-300">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                    <span className="truncate">{entry.name}:</span>
                    <span className="font-mono text-white text-xs">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main detailed tables */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
              <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-brand-gold" />
                  <span>📁 آخر المشاريع المضافة</span>
                </h3>
                <button 
                  type="button"
                  onClick={() => onNavigate('projects')}
                  className="text-brand-gold hover:text-amber-500 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <span>عرض الكل</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-center">
                {projects.length > 0 ? (
                  <div className="divide-y divide-zinc-800/60">
                    {[...projects].reverse().slice(0, 5).map((p) => {
                      const statusDet = getStatusDetails(p.status);
                      return (
                        <div key={p.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0 group">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-lg shadow-sm group-hover:bg-zinc-700 transition duration-150">
                              {p.status === 'done' ? '🟢' : p.status === 'progress' ? '🟡' : '🔵'}
                            </div>
                            <div className="min-width-0">
                              <h4 className="text-white hover:text-brand-gold font-bold text-sm transition truncate max-w-xs cursor-pointer" onClick={() => onOpenProjectModal(p.id)}>
                                {safe(p.name)}
                              </h4>
                              <p className="text-xs text-zinc-400 mt-0.5">
                                العميل: <span className="font-semibold text-zinc-300">{safe(p.clientName || 'بدون')}</span> · {safe(p.type)}
                              </p>
                            </div>
                          </div>
                          <div className="text-left space-y-1.5">
                            <div className="text-brand-gold font-black font-mono text-sm leading-none">
                              {fmt(p.price, 0)} دج
                            </div>
                            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${statusDet?.color}`}>
                              {statusDet?.icon}
                              <span>{statusDet?.label}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-500">
                      <FolderKanban className="w-8 h-8" />
                    </div>
                    <p className="text-zinc-400 text-sm font-semibold">لا يوجد مشاريع مسجلة حالياً</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {/* Quick actions box */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-zinc-800 pb-3">
                  <Zap className="w-4 h-4 text-brand-gold" />
                  <span>إجراءات فائقة السرعة</span>
                </h3>
                <div className="grid grid-cols-1 gap-2.5">
                  <button 
                    type="button"
                    onClick={() => onOpenProjectModal()}
                    className="w-full flex items-center justify-between text-right p-3 rounded-xl bg-gradient-to-r from-brand-gold/10 to-transparent border border-brand-gold/25 hover:border-brand-gold text-brand-gold text-xs font-bold transition cursor-pointer"
                  >
                    <span>➕ تدوين مشروع تصميم جديد</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => onNavigate('calculator')}
                    className="w-full flex items-center justify-between text-right p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/20 hover:border-blue-400 text-blue-400 text-xs font-bold transition cursor-pointer"
                  >
                    <span>📐 حاسبة تسعير المتر والسنتيمتر</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => onOpenClientModal()}
                    className="w-full flex items-center justify-between text-right p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700 hover:border-zinc-500 text-zinc-300 text-xs font-semibold transition cursor-pointer"
                  >
                    <span>👤 تسجيل معلومات عميل جديد</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status breakdown chart */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-zinc-800 pb-3">
                  <Layers className="w-4 h-4 text-brand-gold" />
                  <span>إحصائيات الإنجاز وحالة العمل</span>
                </h3>
                <div className="space-y-4">
                  {Object.keys(statusCounts).map((statusKey) => {
                    const count = statusCounts[statusKey as ProjectStatus];
                    const total = projects.length || 1;
                    const percentage = Math.round((count / total) * 100);
                    const details = getStatusDetails(statusKey as ProjectStatus);
                    
                    return (
                      <div key={statusKey} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-zinc-300">{details?.label}</span>
                          <span className="text-zinc-500 font-mono">
                            {count} ({percentage}% )
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              statusKey === 'new' ? 'bg-blue-500' :
                              statusKey === 'progress' ? 'bg-amber-500' :
                              statusKey === 'waiting' ? 'bg-purple-500' :
                              statusKey === 'done' ? 'bg-emerald-500' :
                              'bg-rose-500'
                            }`}
                            style={{ width: `${projects.length ? percentage : 0}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Earnings and Grow Advisor Section */}
      <AIEarningsAdvisor projects={projects} clients={clients} />
    </div>
  );
}
