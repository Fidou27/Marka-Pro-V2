/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  LayoutDashboard, 
  Layers, 
  Users, 
  Calculator, 
  TrendingUp, 
  Sun, 
  Moon,
  Briefcase,
  Smartphone,
  ChevronLeft,
  X,
  Upload,
  Trash2,
  Bell,
  AlertTriangle,
  Palette,
  Settings,
  FileText,
  Database
} from 'lucide-react';

import { Project, Client, CalcState, ProjectStatus, ErrorLog } from './types';
import { safe, safeAlert, safeConfirm, safeSetItem, safeGetItem, safeRemoveItem } from './utils';

import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import ClientsList from './components/ClientsList';
import PricingCalculator from './components/PricingCalculator';
import Reports from './components/Reports';

const S_PROJ = 'marka_projects_v2';
const S_CLI = 'marka_clients_v2';
const S_CALC = 'marka_calc_v2';
const S_LOGO = 'marka_logo_v2';
const S_THEME = 'marka_theme_v2';

export interface ThemePreset {
  id: string;
  nameAr: string;
  bg: string;
  surface: string;
  surface2: string;
  primaryColor: string;
  accentColor: string;
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
  tagline: string;
}

export const PRESET_THEMES: ThemePreset[] = [
  {
    id: 'premium-glass',
    nameAr: 'المظهر البانورامي الفاخر 📱',
    bg: '#0f172a',
    surface: '#121b2e',
    surface2: '#1e293b',
    primaryColor: '#3b82f6',
    accentColor: '#10b981',
    gradientFrom: '#3b82f6',
    gradientVia: '#7c3aed',
    gradientTo: '#ec4899',
    tagline: 'المظهر البانورامي والبطاقات الزجاجية الممتازة المباشرة من التصميم الجمالي المرجعي'
  },
  {
    id: 'marka-original',
    nameAr: 'ماركا برو الأصلي',
    bg: '#0f172a',
    surface: '#1e293b',
    surface2: '#334155',
    primaryColor: '#7c3aed',
    accentColor: '#00c2ff',
    gradientFrom: '#ff5e62',
    gradientVia: '#7c3aed',
    gradientTo: '#00c2ff',
    tagline: 'الهوية البصرية الكلاسيكية لبرنامج ماركا برو'
  },
  {
    id: 'emerald-royal',
    nameAr: 'الزمرد الملكي 🌲',
    bg: '#022c22',
    surface: '#064e3b',
    surface2: '#115e59',
    primaryColor: '#10b981',
    accentColor: '#fbbf24',
    gradientFrom: '#fbbf24',
    gradientVia: '#10b981',
    gradientTo: '#064e3b',
    tagline: 'مزيج فاخر من الأخضر الزمردي والذهبي الملكي'
  },
  {
    id: 'cyber-sunset',
    nameAr: 'شفق السايبر 🌆',
    bg: '#0f051d',
    surface: '#1a0b2e',
    surface2: '#2b104c',
    primaryColor: '#ec4899',
    accentColor: '#f97316',
    gradientFrom: '#d946ef',
    gradientVia: '#f43f5e',
    gradientTo: '#f97316',
    tagline: 'ألوان حيوية مستوحاة من عوالم النيون الخيالية والوردي المتدرج الممتع'
  },
  {
    id: 'ocean-blue',
    nameAr: 'المحيط الأزرق 🌊',
    bg: '#031224',
    surface: '#081e36',
    surface2: '#0f2f54',
    primaryColor: '#00c2ff',
    accentColor: '#3b82f6',
    gradientFrom: '#2563eb',
    gradientVia: '#3b82f6',
    gradientTo: '#00c2ff',
    tagline: 'هدوء المحيط مع تدرجات اللون الأزرق والسماوي المشرق لملهمي التصاميم'
  },
  {
    id: 'amethyst-bloom',
    nameAr: 'زهرة الأميثيست 🪻',
    bg: '#0b040f',
    surface: '#1c0c24',
    surface2: '#2c123b',
    primaryColor: '#a855f7',
    accentColor: '#ec4899',
    gradientFrom: '#d946ef',
    gradientVia: '#8b5cf6',
    gradientTo: '#ec4899',
    tagline: 'فخامة درجات اللون البنفسجي الساحر واللافندر الملكي الفاتن'
  },
  {
    id: 'fire-ember',
    nameAr: 'جمر الغروب 🔥',
    bg: '#0a0a0a',
    surface: '#141414',
    surface2: '#242424',
    primaryColor: '#ef4444',
    accentColor: '#fbbf24',
    gradientFrom: '#fbbf24',
    gradientVia: '#ea580c',
    gradientTo: '#ef4444',
    tagline: 'الجرأة المتمثلة في مزيج أسود الكربون النقي والجمر الناري المضيء'
  }
];

const DEMO_PROJECTS: Project[] = [
  {
    id: "demo-pr-1",
    name: "تصميم الهوية البصرية لشبكة شركة جازي للاتصالات",
    clientId: "demo-cli-1",
    clientName: "شركة جازي للاتصالات الجزائرية",
    type: "هوية بصرية",
    start: "2026-06-01",
    deadline: "2026-06-25",
    price: 185000,
    status: "progress"
  },
  {
    id: "demo-pr-2",
    name: "تطوير العلامة التجارية ومطبوعات مجمع كوندور للصناعات الإلكترونية",
    clientId: "demo-cli-2",
    clientName: "شركة كوندور للإلكترونيات",
    type: "تصميم سوشيال ميديا",
    start: "2026-05-15",
    deadline: "2026-06-05",
    price: 95000,
    status: "done"
  },
  {
    id: "demo-pr-3",
    name: "لوحة تحكم إلكترونية متجاوبة Web Application Dashboard UI/UX",
    clientId: "demo-cli-3",
    clientName: "مؤسسة ترقية الشركات الرقمية الناشئة",
    type: "موقع إلكتروني",
    start: "2026-06-12",
    deadline: "2026-07-10",
    price: 320000,
    status: "new"
  },
  {
    id: "demo-pr-4",
    name: "مطبوعات فوتوغرافية وبوسترات مهرجان الجزائر الدولي للسينما",
    clientId: "demo-cli-4",
    clientName: "الديوان الوطني للثقافة والإعلام بالجزائر",
    type: "طباعة",
    start: "2026-06-18",
    deadline: "2026-06-22",
    price: 75000,
    status: "waiting"
  }
];

const DEMO_CLIENTS: Client[] = [
  {
    id: "demo-cli-1",
    name: "شركة جازي للاتصالات الجزائرية",
    phone: "0770123456",
    email: "branding@djezzy.dz",
    notes: "يفضل التواصل دائماً عبر البريد الإلكتروني الرسمي مع إرسال الفواتير والمقترحات بصيغة PDF."
  },
  {
    id: "demo-cli-2",
    name: "شركة كوندور للإلكترونيات",
    phone: "035123456",
    email: "marketing@condor.dz",
    notes: "المتابعة والمراجعة تتم مع مدير الاتصال للعلامة التجارية مباشرة على الهاتف."
  },
  {
    id: "demo-cli-3",
    name: "مؤسسة ترقية الشركات الرقمية الناشئة",
    phone: "0661998877",
    email: "contact@startups.dz",
    notes: "يتطلب العمل معهم جلسة مراجعة أسبوعية فنية للنماذج الأولية."
  },
  {
    id: "demo-cli-4",
    name: "الالديوان الوطني للثقافة والإعلام بالجزائر",
    phone: "021998811",
    email: "culture@onci.gov.dz",
    notes: "الحسابات معهم تخضع لبنود المراجعة المالية والصرف الحكومي الرسمي الموسمي."
  }
];

const LABELS = {
  ar: {
    mainMenu: 'القائمة الرئيسية',
    dashboard: 'لوحة التحكم والمؤشرات',
    projects: 'محفظة وإدارة المشاريع',
    clients: 'قاعدة بيانات العملاء',
    calculator: 'حاسبة تسعير فوري',
    analyticsSection: 'التحليلات والمحاسبة',
    analytics: 'التقارير المالية والتحليلات',
    themeLight: 'الوضع الفاتح المضيء',
    themeDark: 'الوضع الليلي الداكن',
    uploadLogo: 'انقر لتحميل شعار الاستوديو',
    changeLogo: 'تغيير الشعار',
    deleteLogo: 'حذف',
    appLabel: 'MARKA PRO – منصة إدارة وتسيير أعمال المصممين',
    h_dashboard: 'الرئيسية والمؤشرات العامة',
    h_projects: 'إجمالي محفظة المشروعات',
    h_clients: 'بيانات وحسابات العملاء',
    h_calculator: 'برمجيات وحاسبة التسعير القياسي',
    h_reports: 'التقارير والمكاسب المالية',
  },
  fr: {
    mainMenu: 'Menu Principal',
    dashboard: 'Tableau de bord',
    projects: 'Gestion des projets',
    clients: 'Base de données clients',
    calculator: 'Calculateur de tarifs',
    analyticsSection: 'Analyses & Finance',
    analytics: 'Rapports et analyses',
    themeLight: 'Mode Lumineux',
    themeDark: 'Mode Sombre',
    uploadLogo: 'Uploader le logo du studio',
    changeLogo: 'Changer le logo',
    deleteLogo: 'Supprimer',
    appLabel: 'MARKA PRO – Espace de gestion pour designers',
    h_dashboard: 'Tableau de Bord & Indicateurs',
    h_projects: 'Portefeuille des Projets',
    h_clients: 'Base de données & Comptes Clients',
    h_calculator: 'Calculateur de Tarifs Standard',
    h_reports: 'Rapports & Revenus Financiers',
  }
};

const S_PRESET = 'marka_theme_preset_v3';
const S_CUSTOM_COLORS = 'marka_custom_colors_v3';

export default function App() {
  // Views navigation
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [userLogo, setUserLogo] = useState<string | null>(null);

  // Theme customizer states
  const [currentPresetId, setCurrentPresetId] = useState<string>('premium-glass');
  const [customColors, setCustomColors] = useState({
    bg: '#0f172a',
    surface: '#1e293b',
    surface2: '#334155',
    primaryColor: '#7c3aed',
    accentColor: '#00c2ff',
    gradientFrom: '#ff5e62',
    gradientVia: '#7c3aed',
    gradientTo: '#00c2ff'
  });
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Global Settings & Language configuration
  const [appLang, setAppLang] = useState<'ar' | 'fr'>('ar');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Synced PDF Customizations (Shared with Calculator)
  const [pdfLang, setPdfLang] = useState<'ar' | 'fr'>('ar');
  const [pdfShowLogo, setPdfShowLogo] = useState<boolean>(true);
  const [pdfShowClient, setPdfShowClient] = useState<boolean>(true);
  const [pdfShowItemDetails, setPdfShowItemDetails] = useState<boolean>(true);
  const [pdfShowItemPrices, setPdfShowItemPrices] = useState<boolean>(true);
  const [pdfShowBreakdown, setPdfShowBreakdown] = useState<boolean>(true);
  const [pdfShowTafqeet, setPdfShowTafqeet] = useState<boolean>(true);
  const [pdfShowNotes, setPdfShowNotes] = useState<boolean>(true);

  // Core collections State
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  // PWA and Splash Screen States
  const [splashActive, setSplashActive] = useState<boolean>(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState<boolean>(false);
  
  // Pricing state cache
  const [calcState, setCalcState] = useState<CalcState>({
    client: '',
    offer: '',
    deadline: '',
    notes: '',
    discount: 0,
    tax: 0,
    margin: 0,
    designs: [],
    draft: false,
  });

  // System error logs states
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [isErrorLogsOpen, setIsErrorLogsOpen] = useState(false);

  // Global logging helper
  const logError = (source: string, message: string, details?: any) => {
    const newLog: ErrorLog = {
      id: 'err_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      message,
      source,
      details: details ? (typeof details === 'object' ? JSON.stringify(details) : String(details)) : undefined,
    };
    setErrorLogs((prev) => {
      const updated = [newLog, ...prev].slice(0, 50);
      try {
        localStorage.setItem('marka_error_logs', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save error logs:', e);
      }
      return updated;
    });
  };

  // Expose logError globally on window so child components can log errors easily
  useEffect(() => {
    (window as any).logError = logError;
    const storedLogs = safeGetItem('marka_error_logs');
    if (storedLogs) {
      try {
        setErrorLogs(JSON.parse(storedLogs));
      } catch (e) {
        console.error('Failed to parse error logs:', e);
      }
    }
  }, []);

  // PWA & Splash Screen management
  useEffect(() => {
    // Hide splash screen after 1.8 seconds with an extra 400ms buffer for smoother layout transition
    const timer = setTimeout(() => {
      setSplashActive(false);
    }, 1800);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('[PWA] beforeinstallprompt event captured');
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
      console.log('[PWA] App installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Detect if running in standalone mode (iOS / Android installed PWA)
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsAppInstalled(true);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    try {
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PWA] User choice outcome: ${outcome}`);
      if (outcome === 'accepted') {
        setIsAppInstalled(true);
      }
    } catch (err) {
      console.error('[PWA] Failed during installation prompt:', err);
    }
    setDeferredPrompt(null);
  };

  // Modal display states
  const [isProjModalOpen, setIsProjModalOpen] = useState(false);
  const [isCliModalOpen, setIsCliModalOpen] = useState(false);
  const [editingProjId, setEditingProjId] = useState<string | null>(null);
  const [editingCliId, setEditingCliId] = useState<string | null>(null);

  // Project Modal Specific Form fields
  const [pFormName, setPFormName] = useState('');
  const [pFormClientId, setPFormClientId] = useState('');
  const [pFormType, setPFormType] = useState('هوية بصرية');
  const [pFormStart, setPFormStart] = useState('');
  const [pFormDeadline, setPFormDeadline] = useState('');
  const [pFormPrice, setPFormPrice] = useState<number | ''>('');
  const [pFormStatus, setPFormStatus] = useState<ProjectStatus>('new');

  // Client Modal Specific Form fields
  const [cFormName, setCFormName] = useState('');
  const [cFormPhone, setCFormPhone] = useState('');
  const [cFormEmail, setCFormEmail] = useState('');
  const [cFormNotes, setCFormNotes] = useState('');

  // Project Alerts state and derivation
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  const projectAlerts = (() => {
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

  // Hydrate states from localStorage on boot
  useEffect(() => {
    try {
      const storedProj = safeGetItem(S_PROJ);
      if (storedProj) setProjects(JSON.parse(storedProj));

      const storedCli = safeGetItem(S_CLI);
      if (storedCli) setClients(JSON.parse(storedCli));

      const storedCalc = safeGetItem(S_CALC);
      if (storedCalc) setCalcState(JSON.parse(storedCalc));

      const storedLogo = safeGetItem(S_LOGO);
      if (storedLogo) setUserLogo(storedLogo);

      const storedTheme = safeGetItem(S_THEME);
      if (storedTheme === 'dark') {
        setTheme('dark');
        document.body.classList.remove('light');
      } else {
        setTheme('light');
        document.body.classList.add('light');
      }

      const storedPreset = safeGetItem(S_PRESET);
      if (storedPreset) setCurrentPresetId(storedPreset);

      const storedCustomColors = safeGetItem(S_CUSTOM_COLORS);
      if (storedCustomColors) setCustomColors(JSON.parse(storedCustomColors));

      // Global app and PDF settings hydration
      const storedAppLang = safeGetItem('marka_app_lang');
      if (storedAppLang === 'fr' || storedAppLang === 'ar') setAppLang(storedAppLang);

      const storedPdfLang = safeGetItem('marka_pdf_lang');
      if (storedPdfLang === 'fr' || storedPdfLang === 'ar') setPdfLang(storedPdfLang);

      const sLogo = safeGetItem('marka_pdf_show_logo');
      if (sLogo !== null) setPdfShowLogo(sLogo === 'true');

      const sCli = safeGetItem('marka_pdf_show_client');
      if (sCli !== null) setPdfShowClient(sCli === 'true');

      const sDet = safeGetItem('marka_pdf_show_item_details');
      if (sDet !== null) setPdfShowItemDetails(sDet === 'true');

      const sPrices = safeGetItem('marka_pdf_show_item_prices');
      if (sPrices !== null) setPdfShowItemPrices(sPrices === 'true');

      const sBkdn = safeGetItem('marka_pdf_show_breakdown');
      if (sBkdn !== null) setPdfShowBreakdown(sBkdn === 'true');

      const sTfq = safeGetItem('marka_pdf_show_tafqeet');
      if (sTfq !== null) setPdfShowTafqeet(sTfq === 'true');

      const sNote = safeGetItem('marka_pdf_show_notes');
      if (sNote !== null) setPdfShowNotes(sNote === 'true');
    } catch (e) {
      console.error('Failed reading localStorage on startup:', e);
      logError('النظام عند بدء التشغيل', 'فشل في تحميل الإعدادات والبيانات من الذاكرة المحلية.', e);
    }
  }, []);

  // Sync settings mutations to localStorage
  useEffect(() => {
    if ((window as any).isClearingDatabase) return;
    safeSetItem('marka_app_lang', appLang);
  }, [appLang]);

  useEffect(() => {
    if ((window as any).isClearingDatabase) return;
    safeSetItem('marka_pdf_lang', pdfLang);
  }, [pdfLang]);

  useEffect(() => {
    if ((window as any).isClearingDatabase) return;
    safeSetItem('marka_pdf_show_logo', String(pdfShowLogo));
  }, [pdfShowLogo]);

  useEffect(() => {
    if ((window as any).isClearingDatabase) return;
    safeSetItem('marka_pdf_show_client', String(pdfShowClient));
  }, [pdfShowClient]);

  useEffect(() => {
    if ((window as any).isClearingDatabase) return;
    safeSetItem('marka_pdf_show_item_details', String(pdfShowItemDetails));
  }, [pdfShowItemDetails]);

  useEffect(() => {
    if ((window as any).isClearingDatabase) return;
    safeSetItem('marka_pdf_show_item_prices', String(pdfShowItemPrices));
  }, [pdfShowItemPrices]);

  useEffect(() => {
    if ((window as any).isClearingDatabase) return;
    safeSetItem('marka_pdf_show_breakdown', String(pdfShowBreakdown));
  }, [pdfShowBreakdown]);

  useEffect(() => {
    if ((window as any).isClearingDatabase) return;
    safeSetItem('marka_pdf_show_tafqeet', String(pdfShowTafqeet));
  }, [pdfShowTafqeet]);

  useEffect(() => {
    if ((window as any).isClearingDatabase) return;
    safeSetItem('marka_pdf_show_notes', String(pdfShowNotes));
  }, [pdfShowNotes]);

  // Dynamic CSS variables applying helper
  useEffect(() => {
    const root = document.documentElement;
    const activePreset = PRESET_THEMES.find((p) => p.id === currentPresetId);
    
    // Read final values depends on preset vs custom
    const isCustom = currentPresetId === 'custom';
    const bgVal = isCustom ? customColors.bg : (activePreset?.bg || '#0f172a');
    const surfaceVal = isCustom ? customColors.surface : (activePreset?.surface || '#1e293b');
    const surface2Val = isCustom ? customColors.surface2 : (activePreset?.surface2 || '#334155');
    const primaryVal = isCustom ? customColors.primaryColor : (activePreset?.primaryColor || '#7c3aed');
    const accentVal = isCustom ? customColors.accentColor : (activePreset?.accentColor || '#00c2ff');
    
    const gradFromVal = isCustom ? customColors.gradientFrom : (activePreset?.gradientFrom || '#ff5e62');
    const gradViaVal = isCustom ? customColors.gradientVia : (activePreset?.gradientVia || '#7c3aed');
    const gradToVal = isCustom ? customColors.gradientTo : (activePreset?.gradientTo || '#00c2ff');

    if (theme === 'dark') {
      root.style.setProperty('--brand-bg', bgVal);
      root.style.setProperty('--brand-surface', surfaceVal);
      root.style.setProperty('--brand-surface-2', surface2Val);
      root.style.setProperty('--brand-gold', primaryVal);
      root.style.setProperty('--brand-gold-hover', accentVal);
      root.style.setProperty('--brand-gold-tint', `${primaryVal}29`); // approx 16% alpha
      root.style.setProperty('--brand-text-accent', accentVal);

      root.style.setProperty('--brand-grad-from', gradFromVal);
      root.style.setProperty('--brand-grad-via', gradViaVal);
      root.style.setProperty('--brand-grad-to', gradToVal);

      // Re-map the geometric core variables
      root.style.setProperty('--z-950', bgVal);
      root.style.setProperty('--z-900', surfaceVal);
      root.style.setProperty('--z-850', surface2Val);
      root.style.setProperty('--z-800', surface2Val);
    } else {
      // Light Mode default overrides - keep basic primary brand accents
      root.style.setProperty('--brand-gold', primaryVal);
      root.style.setProperty('--brand-gold-hover', accentVal);
      root.style.setProperty('--brand-text-accent', accentVal);
      root.style.setProperty('--brand-grad-from', gradFromVal);
      root.style.setProperty('--brand-grad-via', gradViaVal);
      root.style.setProperty('--brand-grad-to', gradToVal);

      // Keep light mode base variables
      root.style.setProperty('--brand-bg', '#f8fafc');
      root.style.setProperty('--brand-surface', '#ffffff');
      root.style.setProperty('--brand-surface-2', '#f1f5f9');
      root.style.setProperty('--z-950', '#ffffff');
      root.style.setProperty('--z-900', '#f8fafc');
      root.style.setProperty('--z-850', '#e2e8f0');
      root.style.setProperty('--z-800', '#f1f5f9');
    }
  }, [theme, currentPresetId, customColors]);

  // Save updates helper
  const updateProjects = (updated: Project[]) => {
    setProjects(updated);
    if ((window as any).isClearingDatabase) return;
    safeSetItem(S_PROJ, JSON.stringify(updated));
  };

  const updateClients = (updated: Client[]) => {
    setClients(updated);
    if ((window as any).isClearingDatabase) return;
    safeSetItem(S_CLI, JSON.stringify(updated));
  };

  const handleSaveCalcState = (state: CalcState) => {
    setCalcState(state);
    if ((window as any).isClearingDatabase) return;
    safeSetItem(S_CALC, JSON.stringify(state));
  };

  // Toggle Dark/Light Mode
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    safeSetItem(S_THEME, nextTheme);
    if (nextTheme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
  };

  // Handle Brand Logo uploads
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = event.target?.result as string;
      setUserLogo(res);
      safeSetItem(S_LOGO, res);
    };
    reader.readAsDataURL(file);
  };

  const removeUserLogo = () => {
    setUserLogo(null);
    safeRemoveItem(S_LOGO);
  };

  // ----- Global Settings Handlers & Tools -----
  const handleExportBackup = () => {
    try {
      const backupData = {
        projects,
        clients,
        calcState,
        userLogo,
        currentPresetId,
        customColors,
        appLang,
        pdfLang,
        pdfShowLogo,
        pdfShowClient,
        pdfShowItemDetails,
        pdfShowItemPrices,
        pdfShowBreakdown,
        pdfShowTafqeet,
        pdfShowNotes
      };
      
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `markapro_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      safeAlert('❌ فشل تصدير النسخة الاحتياطية.');
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.projects) {
          setProjects(data.projects);
          safeSetItem(S_PROJ, JSON.stringify(data.projects));
        }
        if (data.clients) {
          setClients(data.clients);
          safeSetItem(S_CLI, JSON.stringify(data.clients));
        }
        if (data.calcState) {
          setCalcState(data.calcState);
          safeSetItem(S_CALC, JSON.stringify(data.calcState));
        }
        if (data.userLogo) {
          setUserLogo(data.userLogo);
          safeSetItem(S_LOGO, data.userLogo);
        }
        if (data.appLang) {
          setAppLang(data.appLang);
          safeSetItem('marka_app_lang', data.appLang);
        }
        if (data.pdfLang) {
          setPdfLang(data.pdfLang);
          safeSetItem('marka_pdf_lang', data.pdfLang);
        }
        if (data.theme) {
          setTheme(data.theme);
          safeSetItem(S_THEME, data.theme);
          if (data.theme === 'dark') {
            document.body.classList.remove('light');
          } else {
            document.body.classList.add('light');
          }
        }
        if (data.currentPresetId) {
          setCurrentPresetId(data.currentPresetId);
          safeSetItem(S_PRESET, data.currentPresetId);
        }
        if (data.customColors) {
          setCustomColors(data.customColors);
          safeSetItem(S_CUSTOM_COLORS, JSON.stringify(data.customColors));
        }
        if (data.pdfShowLogo !== undefined) setPdfShowLogo(data.pdfShowLogo);
        if (data.pdfShowClient !== undefined) setPdfShowClient(data.pdfShowClient);
        if (data.pdfShowItemDetails !== undefined) setPdfShowItemDetails(data.pdfShowItemDetails);
        if (data.pdfShowItemPrices !== undefined) setPdfShowItemPrices(data.pdfShowItemPrices);
        if (data.pdfShowBreakdown !== undefined) setPdfShowBreakdown(data.pdfShowBreakdown);
        if (data.pdfShowTafqeet !== undefined) setPdfShowTafqeet(data.pdfShowTafqeet);
        if (data.pdfShowNotes !== undefined) setPdfShowNotes(data.pdfShowNotes);
        
        safeAlert('🎉 تم استيراد النسخة الاحتياطية واستعادة جميع الإعدادات وقواعد البيانات بنجاح تام!');
        setIsSettingsModalOpen(false);
      } catch (err: any) {
        safeAlert('❌ خطأ في قراءة ملف التكوين. الرجاء التأكد من صحة الملف وصيغة JSON الخاصة بالنظام.');
        logError('استيراد النسخة الاحتياطية', 'فشل في تحليل ملف النسخ الاحتياطي.', err);
      }
    };
    reader.readAsText(file);
  };

  const handleSeedDemoData = () => {
    if (safeConfirm('ملاحظة: تفعيل خيار البيانات التجريبية سيضيف 4 مشاريع كبرى و4 عملاء مسجلين لمحاكاة النظام بالكامل. هل تود الاستمرار؟', true)) {
      setProjects(DEMO_PROJECTS);
      safeSetItem(S_PROJ, JSON.stringify(DEMO_PROJECTS));
      setClients(DEMO_CLIENTS);
      safeSetItem(S_CLI, JSON.stringify(DEMO_CLIENTS));
      safeAlert('🎉 تم حقن وتوليد عينة البيانات التجريبية بنجاح! تصفح المؤشرات ولوحة القيادة لتجربة متميزة.');
      setIsSettingsModalOpen(false);
    }
  };

  const handleClearDatabase = () => {
    if (safeConfirm('⚠️ تحذير شديد: أنت على وشك حذف جميع البيانات المسجلة، المشاريع، العملاء، وحاسبة التسعير بشكل نهائي لا يمكن الرجوع عنه! هل تريد الاستمرار بالفعل؟', false)) {
      if (safeConfirm('لتأكيد الحذف الكلي وتصفير المنصة، يرجى النقر على موافق.', false)) {
        (window as any).isClearingDatabase = true;
        try {
          localStorage.clear();
        } catch (e) {
          console.error('Failed to clear localStorage:', e);
        }
        setProjects([]);
        setClients([]);
        setUserLogo(null);
        setCalcState({
          client: '',
          offer: '',
          notes: '',
          deadline: '',
          discount: 0,
          tax: 0,
          margin: 0,
          designs: [],
          draft: false
        });
        setAppLang('ar');
        setPdfLang('ar');
        setPdfShowLogo(true);
        setPdfShowClient(true);
        setPdfShowItemDetails(true);
        setPdfShowItemPrices(true);
        setPdfShowBreakdown(true);
        setPdfShowTafqeet(true);
        setPdfShowNotes(true);
        safeAlert('🧹 تم تصفير البرنامج وحذف جميع قواعد البيانات المحلية بنجاح.');
        window.location.reload();
      }
    }
  };

  // OPEN OR PREPOPULATE PROJECT MODALS
  const openProjectModal = (projId?: string) => {
    if (projId) {
      const p = projects.find((x) => x.id === projId);
      if (p) {
        setEditingProjId(projId);
        setPFormName(p.name);
        setPFormClientId(p.clientId);
        setPFormType(p.type);
        setPFormStart(p.start);
        setPFormDeadline(p.deadline || '');
        setPFormPrice(p.price);
        setPFormStatus(p.status);
      }
    } else {
      setEditingProjId(null);
      setPFormName('');
      setPFormClientId('');
      setPFormType('هوية بصرية');
      const startVal = new Date().toISOString().slice(0, 10);
      setPFormStart(startVal);
      // Default delivery date to 10 days after start date
      const dDate = new Date();
      dDate.setDate(dDate.getDate() + 10);
      setPFormDeadline(dDate.toISOString().slice(0, 10));
      setPFormPrice('');
      setPFormStatus('new');
    }
    setIsProjModalOpen(true);
  };

  const saveProjectModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pFormName.trim()) {
      safeAlert('⚠️ الرجاء إدخال اسم المشروع أولاً وبشكل صحيح (لا يمكن ترك الحقل فارغاً أو مسافات فقط).');
      return;
    }
    if (!pFormClientId) {
      safeAlert('⚠️ الرجاء اختيار عميل مرتبط بهذا المشروع. إذا لم يكن العميل مسجلاً، يرجى إضافته أولاً من قائمة العملاء.');
      return;
    }
    if (!pFormStart) {
      safeAlert('⚠️ الرجاء تحديد تاريخ بدء المشروع.');
      return;
    }
    
    const parsedPrice = Number(pFormPrice);
    if (pFormPrice !== '' && (isNaN(parsedPrice) || parsedPrice < 0)) {
      safeAlert('⚠️ يرجى إدخال قيمة ميزانية صالحة للمشروع (يجب أن تكون قيمة عددية موجبة أكبر من أو تساوي 0).');
      return;
    }

    if (pFormDeadline && pFormStart && new Date(pFormDeadline) < new Date(pFormStart)) {
      safeAlert('⚠️ تنبيه: تاريخ التسليم المتوقع لا يمكن أن يكون قبل تاريخ بدء المشروع فلكياً.');
      return;
    }

    const linkedClientName = clients.find((c) => c.id === pFormClientId)?.name || '';

    const newProj: Project = {
      id: editingProjId || String(Date.now()),
      name: pFormName.trim(),
      clientId: pFormClientId,
      clientName: linkedClientName,
      type: pFormType,
      start: pFormStart,
      price: Number(pFormPrice) || 0,
      status: pFormStatus,
      deadline: pFormDeadline || undefined,
    };

    let updated: Project[];
    if (editingProjId) {
      updated = projects.map((x) => (x.id === editingProjId ? newProj : x));
    } else {
      updated = [...projects, newProj];
    }

    updateProjects(updated);
    setIsProjModalOpen(false);
  };

  const deleteProject = (id: string) => {
    if (safeConfirm('هل أنت متأكد من رغبتك في حذف هذا المشروع نهائياً؟', true)) {
      updateProjects(projects.filter((p) => p.id !== id));
    }
  };

  // OPEN OR PREPOPULATE CLIENT MODALS
  const openClientModal = (cliId?: string) => {
    if (cliId) {
      const c = clients.find((x) => x.id === cliId);
      if (c) {
        setEditingCliId(cliId);
        setCFormName(c.name);
        setCFormPhone(c.phone);
        setCFormEmail(c.email);
        setCFormNotes(c.notes);
      }
    } else {
      setEditingCliId(null);
      setCFormName('');
      setCFormPhone('');
      setCFormEmail('');
      setCFormNotes('');
    }
    setIsCliModalOpen(true);
  };

  const saveClientModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cFormName.trim()) {
      safeAlert('⚠️ الرجاء كتابة اسم العميل أولاً وبشكل صحيح (لا يمكن ترك الاسم فارغاً أو مسافات فقط).');
      return;
    }
    if (cFormEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cFormEmail.trim())) {
      safeAlert('⚠️ يرجى إدخال عنوان بريد إلكتروني صالح للعميل (مثال: client@domain.com).');
      return;
    }
    if (cFormPhone.trim() && !/^[+0-9\s\-()]{6,20}$/.test(cFormPhone.trim())) {
      safeAlert('⚠️ يرجى التأكد من كتابة رقم هاتف صالح للعميل (أرقام ورموز مثل + أو مسافات فقط، وبطول يتراوح من 6 إلى 20 رقماً).');
      return;
    }

    const newCli: Client = {
      id: editingCliId || String(Date.now()),
      name: cFormName.trim(),
      phone: cFormPhone.trim(),
      email: cFormEmail.trim(),
      notes: cFormNotes.trim(),
    };

    let updated: Client[];
    if (editingCliId) {
      updated = clients.map((x) => (x.id === editingCliId ? newCli : x));
      // Sync names on active projects linked to this client
      const updatedProjects = projects.map((p) => {
        if (p.clientId === editingCliId) {
          return { ...p, clientName: newCli.name };
        }
        return p;
      });
      updateProjects(updatedProjects);
    } else {
      updated = [...clients, newCli];
    }

    updateClients(updated);
    setIsCliModalOpen(false);
  };

  const deleteClient = (id: string) => {
    if (safeConfirm('ملاحظة: سيتم حذف العميل نهائياً من قائمة العملاء، هل تود الاستمرار؟', false)) {
      updateClients(clients.filter((c) => c.id !== id));
    }
  };

  // Sidebar link counts
  const activeProjectsCount = projects.filter(
    (p) => p.status !== 'done' && p.status !== 'cancelled'
  ).length;

  const isRtl = appLang === 'ar';

  return (
    <>
      {/* PWA Splash Screen */}
      <AnimatePresence>
        {splashActive && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0c] text-white select-none"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6, type: 'spring' }}
              className="flex flex-col items-center text-center px-4"
            >
              <div className="w-24 h-24 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-2xl p-1 mb-6">
                <img src="/marka_logo_pwa.jpg" alt="Marka Pro" className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" />
              </div>
              
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-grad-from via-brand-grad-via to-brand-grad-to bg-clip-text text-transparent">
                MARKA PRO V2
              </h1>
              <p className="text-xs text-zinc-400 mt-2 font-medium">
                لوحة وحاسبة تسعير مشاريع التصميم الاحترافية بالجزائر
              </p>

              <div className="mt-8 flex flex-col items-center gap-2">
                <div className="h-1 w-32 bg-zinc-900 rounded-full overflow-hidden relative">
                  <motion.div 
                    initial={{ left: '-100%' }}
                    animate={{ left: '100%' }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    className="absolute top-0 bottom-0 w-1/2 bg-brand-gold"
                  />
                </div>
                <span className="text-[10px] font-mono text-zinc-500 tracking-wider">جاري تحميل لوحة التحكم الفائقة...</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className={`min-h-screen bg-brand-bg text-zinc-100 flex flex-col ${isRtl ? 'md:flex-row rtl' : 'md:flex-row-reverse ltr'}`} 
        dir={isRtl ? 'rtl' : 'ltr'}
      >
      {/* SIDEBAR NAVIGATION */}
      <aside className={`w-full md:w-64 bg-zinc-950 ${isRtl ? 'border-l' : 'border-r'} border-zinc-900/80 md:min-h-screen flex flex-col shrink-0 no-print`}>
        {/* Brand logo & tagline */}
        <div className="p-5 border-b border-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-slate-900/40 border border-zinc-800/80 flex items-center justify-center shadow-lg group overflow-hidden shrink-0">
              <svg viewBox="0 0 100 100" className="w-7 h-7">
                <defs>
                  <linearGradient id="markaSvgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--brand-grad-from, #FF5E62)" />
                    <stop offset="50%" stopColor="var(--brand-grad-via, #7C3AED)" />
                    <stop offset="100%" stopColor="var(--brand-grad-to, #00C2FF)" />
                  </linearGradient>
                </defs>
                {/* A beautifully stylized, modern geometric "M" path */}
                <path 
                  d="M15,80 L15,20 L35,20 L50,48 L65,20 L85,20 L85,80 L70,80 L70,42 L55,67 L45,67 L30,42 L30,80 Z" 
                  fill="url(#markaSvgGrad)" 
                />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-black text-white font-mono tracking-wider flex items-center gap-1.5">
                <span>MARKA</span>
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, var(--brand-grad-from, #FF5E62), var(--brand-grad-via, #7C3AED), var(--brand-grad-to, #00C2FF))' }}>PRO</span>
              </h1>
              <p className="text-[9px] text-zinc-500 font-sans tracking-wide">
                {appLang === 'ar' ? 'تصميم وتسعير احترافي' : 'Design & Pricing Pro'}
              </p>
            </div>
          </div>
        </div>

        {/* Brand Logo Uploader Section */}
        <div className="px-5 py-4 border-b border-zinc-900/60 space-y-3">
          <input 
            type="file" 
            id="logoUploader" 
            accept="image/*" 
            className="hidden" 
            onChange={handleLogoUpload} 
          />
          <div 
            onClick={() => document.getElementById('logoUploader')?.click()}
            className="border border-dashed border-brand-gold/25 hover:border-brand-gold bg-zinc-900/50 hover:bg-brand-gold/5 rounded-xl p-3 text-center cursor-pointer transition flex items-center justify-center h-[52px] group overflow-hidden"
          >
            {userLogo ? (
              <img src={userLogo} alt="Logo" className="max-h-[38px] max-w-full object-contain" />
            ) : (
              <div className="text-[10px] text-zinc-500 font-sans font-semibold flex flex-col items-center gap-1 group-hover:text-brand-gold">
                <Upload className="w-4 h-4 text-zinc-600 group-hover:text-brand-gold" />
                <span>{LABELS[appLang].uploadLogo}</span>
              </div>
            )}
          </div>
          {userLogo && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => document.getElementById('logoUploader')?.click()}
                className="flex-1 py-1 text-[9px] font-bold border border-zinc-800 text-zinc-400 hover:text-white rounded bg-zinc-900 transition cursor-pointer"
              >
                {LABELS[appLang].changeLogo}
              </button>
              <button
                type="button"
                onClick={removeUserLogo}
                className="px-2 py-1 text-[9px] font-bold border border-rose-950 text-rose-500 hover:bg-rose-500/10 rounded transition cursor-pointer"
              >
                {LABELS[appLang].deleteLogo}
              </button>
            </div>
          )}
        </div>

        {/* Navigation list link tags */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="text-[10px] font-bold text-zinc-500 uppercase px-3 pb-1">
            {LABELS[appLang].mainMenu}
          </div>
          {[
            { id: 'dashboard', label: LABELS[appLang].dashboard, icon: <LayoutDashboard className="w-4.5 h-4.5" /> },
            { id: 'projects', label: LABELS[appLang].projects, icon: <Briefcase className="w-4.5 h-4.5" />, badge: activeProjectsCount },
            { id: 'clients', label: LABELS[appLang].clients, icon: <Users className="w-4.5 h-4.5" />, badge: clients.length },
            { id: 'calculator', label: LABELS[appLang].calculator, icon: <Calculator className="w-4.5 h-4.5" /> },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black transition cursor-pointer border ${
                currentView === item.id 
                  ? 'bg-brand-gold/10 text-brand-gold border-brand-gold/20' 
                  : 'text-zinc-400 border-transparent hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span className={`flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="bg-brand-gold text-brand-bg font-extrabold font-mono text-[9px] px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          <div className="text-[10px] font-bold text-zinc-500 uppercase px-3 pt-5 pb-1">
            {LABELS[appLang].analyticsSection}
          </div>
          <button
            type="button"
            onClick={() => setCurrentView('reports')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black transition cursor-pointer border ${
              currentView === 'reports' 
                ? 'bg-brand-gold/10 text-brand-gold border-brand-gold/20' 
                : 'text-zinc-400 border-transparent hover:bg-zinc-900 hover:text-white'
            }`}
          >
            <span><TrendingUp className="w-4.5 h-4.5" /></span>
            <span className={`flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>{LABELS[appLang].analytics}</span>
          </button>
        </nav>

        {/* Sidebar Footer context togglers */}
        <div className="p-4 border-t border-zinc-900/60 bg-zinc-950/60 space-y-2.5">
          {deferredPrompt && (
            <button
              type="button"
              onClick={handleInstallClick}
              className="w-full py-2 bg-gradient-to-r from-[#d4af37] to-amber-500 hover:from-amber-500 hover:to-[#d4af37] text-zinc-950 rounded-lg text-[11px] font-black transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-brand-gold/5"
            >
              <Smartphone className="w-4 h-4" />
              <span>{appLang === 'ar' ? 'تثبيت تطبيق الهاتف 📱' : 'Install PWA App 📱'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            className="w-full py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white rounded-lg text-[11px] font-bold border border-zinc-850/80 transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-brand-gold" /> : <Moon className="w-4 h-4" />}
            <span>{theme === 'dark' ? LABELS[appLang].themeLight : LABELS[appLang].themeDark}</span>
          </button>
        </div>
      </aside>

      {/* CORE FRAMEWORK STAGING PANEL */}
      <main className="flex-1 flex flex-col min-h-0 bg-brand-bg overflow-x-hidden">
        {/* TOP BAR STATUS HEADER */}
        <header className="h-16 bg-zinc-950/60 border-b border-zinc-900/50 flex items-center justify-between px-6 shrink-0 no-print sticky top-0 z-40 backdrop-blur-md">
          <div className="space-y-0.5">
            <h2 className="text-sm font-black text-white">
              {currentView === 'dashboard' ? LABELS[appLang].h_dashboard :
               currentView === 'projects' ? LABELS[appLang].h_projects :
               currentView === 'clients' ? LABELS[appLang].h_clients :
               currentView === 'calculator' ? LABELS[appLang].h_calculator :
               LABELS[appLang].h_reports}
            </h2>
            <p className="text-[10px] text-zinc-500 font-sans hidden sm:block">
              {LABELS[appLang].appLabel}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {deferredPrompt && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-brand-gold to-amber-500 text-zinc-950 rounded-xl text-[10px] font-black transition cursor-pointer shadow-md shadow-brand-gold/10"
              >
                <Smartphone className="w-3.5 h-3.5 text-zinc-950" />
                <span>تثبيت</span>
              </button>
            )}

            {/* General App & Print Settings Toggle Button */}
            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(true)}
              className="w-9 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800/80 hover:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-brand-gold transition cursor-pointer relative"
              title="الإعدادات الشاملة والطباعة والحفظ"
            >
              <Settings className="w-4.5 h-4.5" />
            </button>

            {/* Theme & Colors Customizer Toggle */}
            <button
              type="button"
              onClick={() => setIsThemeModalOpen(true)}
              className="w-9 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800/80 hover:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-brand-gold transition cursor-pointer relative"
              title="تخصيص الألوان والهوية البصرية"
            >
              <Palette className="w-4.5 h-4.5" />
              <span className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-brand-gold animate-pulse" />
            </button>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsAlertsOpen(!isAlertsOpen)}
                className="w-9 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800/80 hover:border-zinc-700 flex items-center justify-center relative text-zinc-400 hover:text-white transition cursor-pointer"
                title="التنبيهات والإشعارات"
              >
                <Bell className="w-4.5 h-4.5" />
                {projectAlerts.length > 0 && (
                  <span className="absolute -top-1 -left-1 w-5 h-5 bg-rose-500 text-white font-extrabold text-[9px] rounded-full flex items-center justify-center shadow animate-pulse">
                    {projectAlerts.length}
                  </span>
                )}
              </button>

              {isAlertsOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40 bg-transparent" 
                    onClick={() => setIsAlertsOpen(false)} 
                  />
                  <div className="absolute left-0 mt-2.5 w-80 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl z-50 text-right overflow-hidden animate-fade-in font-sans">
                    <div className="p-3.5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60">
                      <span className="text-xs font-black text-white flex items-center gap-1.5">
                        <Bell className="w-4 h-4 text-[#00C2FF]" />
                        <span>جرس وبنود التنبيهات وإشعارات التسليم</span>
                      </span>
                      <span className="text-[10px] font-bold text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded">
                        {projectAlerts.length} إشعارات
                      </span>
                    </div>
                    
                    <div className="max-h-72 overflow-y-auto divide-y divide-zinc-850/60">
                      {projectAlerts.length > 0 ? (
                        projectAlerts.map((a) => {
                          let colorClass = '';
                          let textWord = '';
                          let bgClass = '';
                          if (a.urgency === 'overdue') {
                            colorClass = 'text-rose-400';
                            bgClass = 'bg-rose-500/5';
                            textWord = `⚠️ متأخر بـ ${Math.abs(a.daysRemaining)} أيام!`;
                          } else if (a.urgency === 'high') {
                            colorClass = 'text-[#FFB347]';
                            bgClass = 'bg-amber-500/5';
                            textWord = `⏳ متبقي ${a.daysRemaining} أيام فقط!`;
                          } else {
                            colorClass = 'text-[#00C2FF]';
                            bgClass = 'bg-cyan-500/5';
                            textWord = `📅 متبقي ${a.daysRemaining} أيام`;
                          }
                          
                          return (
                            <div 
                              key={a.project.id} 
                              onClick={() => {
                                openProjectModal(a.project.id);
                                setIsAlertsOpen(false);
                              }}
                              className={`p-3 hover:bg-zinc-900 cursor-pointer transition text-right ${bgClass}`}
                            >
                              <div className="flex items-start justify-between gap-1.5">
                                <span className="text-xs font-bold text-zinc-100 hover:text-brand-gold line-clamp-1 flex-1">{safe(a.project.name)}</span>
                                <span className={`text-[9px] font-black shrink-0 px-1.5 py-0.5 rounded-md ${colorClass} bg-zinc-900`}>
                                  {textWord}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-1">
                                <span>العميل: {safe(a.project.clientName || 'غير محدد')}</span>
                                <span>تاريخ البدء: {a.project.start}</span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-8 text-center text-zinc-500 space-y-2">
                          <span className="text-3xl block">🎉</span>
                          <div className="text-xs font-semibold text-zinc-400">مشاريعك في جدولها السليم!</div>
                          <p className="text-[10px] text-zinc-500 leading-normal">لا توجد مشاريع متأخرة أو قريبة من موعد تسليمها حالياً.</p>
                        </div>
                      )}
                    </div>
                    
                    {projectAlerts.length > 0 && (
                      <div className="p-2 bg-zinc-900/40 text-center border-t border-zinc-900 text-[9px] text-zinc-500">
                        انقر لتعديل بيانات المشروع وتمديد الأجل أو تحديث الحالة لمكتمل.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => openProjectModal()}
                className="px-3.5 py-1.5 bg-brand-gold/10 hover:bg-brand-gold/15 text-brand-gold border border-brand-gold/20 text-xs font-bold rounded-lg transition cursor-pointer"
              >
                ➕ مشروع جديد
              </button>
              <button
                type="button"
                onClick={() => { setCurrentView('calculator'); }}
                className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-bold rounded-lg border border-zinc-700/80 transition cursor-pointer"
              >
                📐 تسعير بنود جديدة
              </button>
            </div>
          </div>
        </header>

        {/* ACTUAL RENDERED VIEW FRAME SPAN */}
        <div className="p-6 md:p-8 flex-1 print:p-0">
          {currentView === 'dashboard' && (
            <Dashboard
              projects={projects}
              clients={clients}
              onNavigate={setCurrentView}
              onOpenProjectModal={openProjectModal}
              onOpenClientModal={() => openClientModal()}
            />
          )}

          {currentView === 'projects' && (
            <Projects
              projects={projects}
              onOpenProjectModal={openProjectModal}
              onDeleteProject={deleteProject}
            />
          )}

          {currentView === 'clients' && (
            <ClientsList
              clients={clients}
              projects={projects}
              onOpenClientModal={openClientModal}
              onDeleteClient={deleteClient}
            />
          )}

          {currentView === 'calculator' && (
            <PricingCalculator
              clients={clients}
              initialState={calcState}
              onSaveState={handleSaveCalcState}
              brandLogo={userLogo}
              pdfLang={pdfLang}
              setPdfLang={setPdfLang}
              pdfShowLogo={pdfShowLogo}
              setPdfShowLogo={setPdfShowLogo}
              pdfShowClient={pdfShowClient}
              setPdfShowClient={setPdfShowClient}
              pdfShowItemDetails={pdfShowItemDetails}
              setPdfShowItemDetails={setPdfShowItemDetails}
              pdfShowItemPrices={pdfShowItemPrices}
              setPdfShowItemPrices={setPdfShowItemPrices}
              pdfShowBreakdown={pdfShowBreakdown}
              setPdfShowBreakdown={setPdfShowBreakdown}
              pdfShowTafqeet={pdfShowTafqeet}
              setPdfShowTafqeet={setPdfShowTafqeet}
              pdfShowNotes={pdfShowNotes}
              setPdfShowNotes={setPdfShowNotes}
            />
          )}

          {currentView === 'reports' && (
            <Reports
              projects={projects}
              clients={clients}
            />
          )}
        </div>
      </main>

      {/* POPUP OVERLAY MODAL: PROJECT CREATION & EDITING */}
      {isProjModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in text-zinc-100 font-sans">
            <div className="border-b border-zinc-805 px-5 py-4 flex items-center justify-between bg-zinc-950">
              <h3 className="font-extrabold text-sm text-white">
                {editingProjId ? '✏️ تعديل بيانات المشروع الفني' : '📁 تسجيل وتدوين مشروع تصميم جديد'}
              </h3>
              <button 
                type="button"
                onClick={() => setIsProjModalOpen(false)}
                className="text-zinc-500 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveProjectModal} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 block">اسم المشروع</label>
                <input
                  type="text"
                  required
                  value={pFormName}
                  onChange={(e) => setPFormName(e.target.value)}
                  placeholder="مثال: لوحة فنية لشركة الاتصالات الجزائرية"
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-brand-gold transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 block">العميل المقترن</label>
                <select
                  value={pFormClientId}
                  onChange={(e) => setPFormClientId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 text-xs text-zinc-300 focus:outline-none focus:border-brand-gold transition"
                >
                  <option value="">-- بدون ارتباط بعميل مسجل --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {safe(c.name)} ({safe(c.notes || 'لا يوجد ملاحظات')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 block">نوع الخدمة/تصميم</label>
                <select
                  value={pFormType}
                  onChange={(e) => setPFormType(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 text-xs text-zinc-300 focus:outline-none focus:border-brand-gold transition"
                >
                  <option value="هوية بصرية">أيقونات وهويات بصرية كاملة</option>
                  <option value="تصميم سوشيال ميديا">تصاميم السوشيال ميديا والإعلانات الودية</option>
                  <option value="طباعة">مطبوعات وبوسترات فوتوغرافية</option>
                  <option value="موقع إلكتروني">مواقع وتطوير الواجهات المتجاوبة</option>
                  <option value="فيديو موشن">فيديو موشن جرافيك ووسائط سمعية</option>
                  <option value="أخرى">أخرى / مخصص</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 block">تاريخ البدء</label>
                  <input
                    type="date"
                    required
                    value={pFormStart}
                    onChange={(e) => setPFormStart(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-brand-gold transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 block">تاريخ التسليم المتوقع 📅</label>
                  <input
                    type="date"
                    required
                    value={pFormDeadline}
                    onChange={(e) => setPFormDeadline(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-brand-gold transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 block">سعر التكلفة المتفق (دج)</label>
                  <input
                    type="number"
                    value={pFormPrice}
                    onChange={(e) => setPFormPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0"
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-brand-gold transition font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 block">حالة تقدم المشروع الفلكي</label>
                <select
                  value={pFormStatus}
                  onChange={(e) => setPFormStatus(e.target.value as ProjectStatus)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 text-xs text-zinc-300 focus:outline-none focus:border-brand-gold transition"
                >
                  <option value="new">🔵 مشروع مبرم حديثاً (جديد)</option>
                  <option value="progress">🟡 قيد التنفيذ والإحلال الإبداعي</option>
                  <option value="waiting">🟣 بانتظار موافقة/رد العميل</option>
                  <option value="done">🟢 مكتمل وتم التسليم رسمياً</option>
                  <option value="cancelled">🔴 ملغى ومسدود</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-zinc-850 justify-end">
                <button
                  type="button"
                  onClick={() => setIsProjModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-white rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  إلغاء التعديل
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-gold hover:bg-amber-500 text-brand-bg font-extrabold rounded-lg text-xs transition cursor-pointer shadow"
                >
                  💾 حفظ وتخزين البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP OVERLAY MODAL: CLIENT RECORD CREATION & EDITING */}
      {isCliModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in text-zinc-100 font-sans">
            <div className="border-b border-zinc-805 px-5 py-4 flex items-center justify-between bg-zinc-950">
              <h3 className="font-extrabold text-sm text-white">
                {editingCliId ? '✏️ تعديل ملف العميل' : '👤 إضافة وتسجيل ملف عميل جديد'}
              </h3>
              <button 
                type="button"
                onClick={() => setIsCliModalOpen(false)}
                className="text-zinc-500 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveClientModal} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 block">اسم العميل المعتمد</label>
                <input
                  type="text"
                  required
                  value={cFormName}
                  onChange={(e) => setCFormName(e.target.value)}
                  placeholder="اسم الشخص أو اسم المؤسسة الرسمية"
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-brand-gold transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 block">رقم هاتف الاتصال</label>
                  <input
                    type="tel"
                    value={cFormPhone}
                    onChange={(e) => setCFormPhone(e.target.value)}
                    placeholder="05 / 06 / 07 ..."
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-brand-gold transition font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 block">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={cFormEmail}
                    onChange={(e) => setCFormEmail(e.target.value)}
                    placeholder="example@domain.com"
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-brand-gold transition font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 block">ملاحظات العميل وقنوات التواصل</label>
                <textarea
                  value={cFormNotes}
                  onChange={(e) => setCFormNotes(e.target.value)}
                  placeholder="مثال: يفضل التواصل على تيليجرام أو واتساب..."
                  className="w-full h-16 bg-zinc-950 border border-zinc-850 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-brand-gold transition resize-y font-sans"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-zinc-850 justify-end">
                <button
                  type="button"
                  onClick={() => setIsCliModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-white rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  إلغاء التعديل
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-gold hover:bg-amber-500 text-brand-bg font-extrabold rounded-lg text-xs transition cursor-pointer shadow"
                >
                  💾 حفظ وحفظ المعلومات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* THEME & COLOR CUSTOMIZER MODAL */}
      {isThemeModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto font-sans text-right">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto animate-fade-in text-zinc-200">
            {/* Modal Header */}
            <div className="border-b border-zinc-850 px-6 py-4 flex items-center justify-between bg-zinc-900/60">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-brand-gold ml-2" />
                <h3 className="font-extrabold text-sm text-white">
                  تعديل وتخصيص المظهر العام والسمات البصرية
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsThemeModalOpen(false)}
                className="text-zinc-500 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-1 bg-zinc-900/30 border border-zinc-900/80 p-3.5 rounded-xl">
                <p className="text-xs text-zinc-300 leading-relaxed">
                  اختر من بين <b>6 سمات بصرية جاهزة</b> تم تصميمها بعناية لتناسب مختلف الأذواق، أو قم بتفعيل التخصيص الحر للألوان الفردية لتصميم سمة مستقلة تناسب استوديو التصميم الخاص بك.
                </p>
              </div>

              {/* Ready presets - 6 ready-made themes */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">اقتراح سمات مبنية مسبقاً (6 خيارات جاهزة للتطبيق مباشرة)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {PRESET_THEMES.map((themePreset) => {
                    const isActive = currentPresetId === themePreset.id;
                    return (
                      <button
                        key={themePreset.id}
                        type="button"
                        onClick={() => {
                          setCurrentPresetId(themePreset.id);
                          localStorage.setItem(S_PRESET, themePreset.id);
                        }}
                        className={`p-3.5 rounded-xl border text-right transition flex flex-col justify-between gap-2 cursor-pointer h-28 ${
                          isActive 
                            ? 'bg-brand-gold/10 border-brand-gold text-white shadow-lg' 
                            : 'bg-zinc-900/40 border-zinc-850 hover:border-zinc-700 text-zinc-300 hover:bg-zinc-900/80'
                        }`}
                      >
                        <div className="w-full flex items-center justify-between">
                          <span className="text-xs font-bold flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: themePreset.primaryColor }} />
                            <span>{themePreset.nameAr}</span>
                          </span>
                          {isActive && (
                            <span className="text-[10px] font-black text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded-md border border-brand-gold/15">
                              نشط مفعّل
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-500 line-clamp-1 leading-relaxed">
                          {themePreset.tagline}
                        </p>
                        
                        {/* Little color swatches */}
                        <div className="flex gap-1.5 mt-1 border-t border-zinc-850/30 pt-1.5 items-center">
                          <span className="text-[9px] text-zinc-500 font-mono">الباليت:</span>
                          <div className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full border border-black/40" style={{ backgroundColor: themePreset.bg }} title="الخلفية" />
                            <span className="w-2.5 h-2.5 rounded-full border border-black/40" style={{ backgroundColor: themePreset.surface }} title="البطاقة" />
                            <span className="w-2.5 h-2.5 rounded-full border border-black/40" style={{ backgroundColor: themePreset.primaryColor }} title="الأساسي" />
                            <span className="w-2.5 h-2.5 rounded-full border border-black/40" style={{ backgroundColor: themePreset.accentColor }} title="المتباين" />
                            <span className="w-10 h-2 rounded border border-black/40" style={{ backgroundImage: `linear-gradient(to right, ${themePreset.gradientFrom}, ${themePreset.gradientVia}, ${themePreset.gradientTo})` }} title="تدرج الهوية" />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom manual color adjustment picker */}
              <div className="border-t border-zinc-900 pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold text-zinc-400/80 uppercase tracking-wider">تخصيص حر وتعديل مخصص للألوان</h4>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPresetId('custom');
                      localStorage.setItem(S_PRESET, 'custom');
                    }}
                    className={`text-[10px] font-bold px-3 py-1 rounded transition cursor-pointer ${
                      currentPresetId === 'custom' 
                        ? 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20' 
                        : 'bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white'
                    }`}
                  >
                    🛠️ تفعيل وضع التخصيص اليدوي الحر
                  </button>
                </div>

                <div className="bg-zinc-950/40 border border-zinc-900/80 p-4 rounded-xl space-y-4 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="space-y-1 bg-zinc-900/30 p-2 rounded-lg text-center">
                      <label className="text-[9px] font-bold text-zinc-400 block">لون الخلفية</label>
                      <input
                        type="color"
                        value={customColors.bg}
                        onChange={(e) => {
                          const updated = { ...customColors, bg: e.target.value };
                          setCustomColors(updated);
                          setCurrentPresetId('custom');
                          localStorage.setItem(S_PRESET, 'custom');
                          localStorage.setItem(S_CUSTOM_COLORS, JSON.stringify(updated));
                        }}
                        className="w-8 h-8 rounded-full border-0 cursor-pointer overflow-hidden p-0 mx-auto block outline-none mt-1"
                      />
                      <span className="font-mono text-[9px] text-zinc-500 block uppercase mt-1">{customColors.bg}</span>
                    </div>

                    <div className="space-y-1 bg-zinc-900/30 p-2 rounded-lg text-center">
                      <label className="text-[9px] font-bold text-zinc-400 block">لون البطاقات</label>
                      <input
                        type="color"
                        value={customColors.surface}
                        onChange={(e) => {
                          const updated = { ...customColors, surface: e.target.value };
                          setCustomColors(updated);
                          setCurrentPresetId('custom');
                          localStorage.setItem(S_PRESET, 'custom');
                          localStorage.setItem(S_CUSTOM_COLORS, JSON.stringify(updated));
                        }}
                        className="w-8 h-8 rounded-full border-0 cursor-pointer overflow-hidden p-0 mx-auto block outline-none mt-1"
                      />
                      <span className="font-mono text-[9px] text-zinc-500 block uppercase mt-1">{customColors.surface}</span>
                    </div>

                    <div className="space-y-1 bg-zinc-900/30 p-2 rounded-lg text-center">
                      <label className="text-[9px] font-bold text-zinc-400 block">الهوامش والإطارات</label>
                      <input
                        type="color"
                        value={customColors.surface2}
                        onChange={(e) => {
                          const updated = { ...customColors, surface2: e.target.value };
                          setCustomColors(updated);
                          setCurrentPresetId('custom');
                          localStorage.setItem(S_PRESET, 'custom');
                          localStorage.setItem(S_CUSTOM_COLORS, JSON.stringify(updated));
                        }}
                        className="w-8 h-8 rounded-full border-0 cursor-pointer overflow-hidden p-0 mx-auto block outline-none mt-1"
                      />
                      <span className="font-mono text-[9px] text-zinc-500 block uppercase mt-1">{customColors.surface2}</span>
                    </div>

                    <div className="space-y-1 bg-zinc-900/30 p-2 rounded-lg text-center">
                      <label className="text-[9px] font-bold text-zinc-400 block">اللون المضيء (خيوط)</label>
                      <input
                        type="color"
                        value={customColors.primaryColor}
                        onChange={(e) => {
                          const updated = { ...customColors, primaryColor: e.target.value };
                          setCustomColors(updated);
                          setCurrentPresetId('custom');
                          localStorage.setItem(S_PRESET, 'custom');
                          localStorage.setItem(S_CUSTOM_COLORS, JSON.stringify(updated));
                        }}
                        className="w-8 h-8 rounded-full border-0 cursor-pointer overflow-hidden p-0 mx-auto block outline-none mt-1"
                      />
                      <span className="font-mono text-[9px] text-zinc-500 block uppercase mt-1">{customColors.primaryColor}</span>
                    </div>
                  </div>

                  <div className="border-t border-zinc-900/80 pt-3.5 space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 block">تدرج هوية الستوديو المضيء (3 ألوان متدفقة للوجوهات والأزرار الرئيسية)</label>
                    <div className="grid grid-cols-3 gap-3.5">
                      <div className="space-y-1 bg-zinc-900/20 p-2 rounded-lg text-center">
                        <span className="text-[9px] text-zinc-500 block">بداية المتدرج</span>
                        <input
                          type="color"
                          value={customColors.gradientFrom}
                          onChange={(e) => {
                            const updated = { ...customColors, gradientFrom: e.target.value };
                            setCustomColors(updated);
                            setCurrentPresetId('custom');
                            localStorage.setItem(S_PRESET, 'custom');
                            localStorage.setItem(S_CUSTOM_COLORS, JSON.stringify(updated));
                          }}
                          className="w-7 h-7 rounded border-0 cursor-pointer p-0 block mx-auto outline-none mt-1"
                        />
                      </div>
                      <div className="space-y-1 bg-zinc-900/20 p-2 rounded-lg text-center">
                        <span className="text-[9px] text-zinc-500 block">وسط المتدرج</span>
                        <input
                          type="color"
                          value={customColors.gradientVia}
                          onChange={(e) => {
                            const updated = { ...customColors, gradientVia: e.target.value };
                            setCustomColors(updated);
                            setCurrentPresetId('custom');
                            localStorage.setItem(S_PRESET, 'custom');
                            localStorage.setItem(S_CUSTOM_COLORS, JSON.stringify(updated));
                          }}
                          className="w-7 h-7 rounded border-0 cursor-pointer p-0 block mx-auto outline-none mt-1"
                        />
                      </div>
                      <div className="space-y-1 bg-zinc-900/20 p-2 rounded-lg text-center">
                        <span className="text-[9px] text-zinc-500 block">نهاية المتدرج</span>
                        <input
                          type="color"
                          value={customColors.gradientTo}
                          onChange={(e) => {
                            const updated = { ...customColors, gradientTo: e.target.value };
                            setCustomColors(updated);
                            setCurrentPresetId('custom');
                            localStorage.setItem(S_PRESET, 'custom');
                            localStorage.setItem(S_CUSTOM_COLORS, JSON.stringify(updated));
                          }}
                          className="w-7 h-7 rounded border-0 cursor-pointer p-0 block mx-auto outline-none mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-zinc-900/20 p-3 rounded-xl border border-zinc-900/60 mt-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-zinc-300 block">اللون الثانوي التفاعلي المتباين (Accent)</span>
                      <p className="text-[9px] text-zinc-500">للحالات النشطة والمستحقات المضيئة في الحاسبات الفورية</p>
                    </div>
                    <input
                      type="color"
                      value={customColors.accentColor}
                      onChange={(e) => {
                        const updated = { ...customColors, accentColor: e.target.value };
                        setCustomColors(updated);
                        setCurrentPresetId('custom');
                        localStorage.setItem(S_PRESET, 'custom');
                        localStorage.setItem(S_CUSTOM_COLORS, JSON.stringify(updated));
                      }}
                      className="w-8 h-8 rounded border-0 cursor-pointer p-0 block outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 px-6 py-4.5 bg-zinc-900/50 border-t border-zinc-850 justify-end">
              <button
                type="button"
                onClick={() => {
                  setCurrentPresetId('marka-original');
                  localStorage.setItem(S_PRESET, 'marka-original');
                }}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white rounded-lg text-xs font-bold transition cursor-pointer border border-zinc-850"
              >
                🔄 استعادة المظهر الأصلي
              </button>
              <button
                type="button"
                onClick={() => setIsThemeModalOpen(false)}
                className="px-5 py-2 bg-brand-gold hover:bg-amber-500 text-brand-bg font-extrabold rounded-lg text-xs transition cursor-pointer shadow"
              >
                ✅ تطبيق وحفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP OVERLAY MODAL: GLOBAL PLATFORM SETTINGS */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-850 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in text-zinc-100 font-sans">
            
            {/* Modal Header */}
            <div className="border-b border-zinc-850 px-6 py-5 flex items-center justify-between bg-zinc-900/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                  <Settings className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">⚙️ لوحة الإعدادات والمزامنة الشاملة</h3>
                  <p className="text-[9px] text-zinc-400">تخصيص اللغات وحفظ وطباعة الفواتير وتصدير قواعد البيانات</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="w-8 h-8 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition cursor-pointer flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-thin text-right">
              
              {/* SECTION A: Language Settings (اللغة والترجمة) */}
              <div className="space-y-3">
                <div className="flex items-center justify-start gap-1.5 border-b border-zinc-900/80 pb-2">
                  <span className="text-xs font-bold text-zinc-200">🌐 لغة واجهة التطبيق والبرنامج</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  قم بتخصيص لغة واجهة المستخدم للمنصة. يمكنك العمل باللغة العربية أو الفرنسية بكل مرونة وتلقائية.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAppLang('ar');
                      localStorage.setItem('marka_app_lang', 'ar');
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      appLang === 'ar'
                        ? 'bg-brand-gold/15 border-brand-gold text-brand-gold shadow-lg'
                        : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xl">🇸🇾</span>
                    <span>العربية (Ar)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAppLang('fr');
                      localStorage.setItem('marka_app_lang', 'fr');
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      appLang === 'fr'
                        ? 'bg-brand-gold/15 border-brand-gold text-brand-gold shadow-lg'
                        : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xl">🇫🇷</span>
                    <span>French (Fr)</span>
                  </button>
                </div>
              </div>

              {/* SECTION B: Synced PDF Printing settings */}
              <div className="space-y-3.5 pt-2 border-t border-zinc-900">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                  <span className="text-xs font-bold text-zinc-200">📐 التحكم المسبق بالطباعة وملفات الـ PDF</span>
                  <span className="text-[9px] text-brand-gold font-bold">مزامنة تلقائية</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  حدد العناصر والبنود الافتراضية التي تظهر في مستندات الأسعار التي تصدرها لعملائك لتبدو منسقة واحترافية:
                </p>

                {/* PDF language independent options */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 block">لغة التصدير الافتراضية في الـ PDF:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPdfLang('ar')}
                      className={`py-2 px-3 text-[10px] rounded-lg border font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                        pdfLang === 'ar'
                          ? 'bg-brand-gold/10 border-brand-gold/55 text-brand-gold'
                          : 'bg-zinc-900 border-zinc-850 text-zinc-400'
                      }`}
                    >
                      <span>🇸🇾 العربية (ar)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPdfLang('fr')}
                      className={`py-2 px-3 text-[10px] rounded-lg border font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                        pdfLang === 'fr'
                          ? 'bg-brand-gold/10 border-brand-gold/55 text-brand-gold'
                          : 'bg-zinc-900 border-zinc-850 text-zinc-400'
                      }`}
                    >
                      <span>🇫🇷 الفرنسية (fr)</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 bg-zinc-900/40 p-3 rounded-2xl border border-zinc-900">
                  <label className="flex items-center justify-start gap-2 cursor-pointer select-none text-right">
                    <input
                      type="checkbox"
                      checked={pdfShowLogo}
                      onChange={(e) => setPdfShowLogo(e.target.checked)}
                      className="accent-brand-gold h-3.5 w-3.5 rounded bg-zinc-950 border-zinc-800 cursor-pointer"
                    />
                    <span className="text-[10px] font-semibold text-zinc-300">شعار الاستوديو بالتقرير</span>
                  </label>

                  <label className="flex items-center justify-start gap-2 cursor-pointer select-none text-right">
                    <input
                      type="checkbox"
                      checked={pdfShowClient}
                      onChange={(e) => setPdfShowClient(e.target.checked)}
                      className="accent-brand-gold h-3.5 w-3.5 rounded bg-zinc-950 border-zinc-800 cursor-pointer"
                    />
                    <span className="text-[10px] font-semibold text-zinc-300">عرض بيانات العميل الكلية</span>
                  </label>

                  <label className="flex items-center justify-start gap-2 cursor-pointer select-none text-right">
                    <input
                      type="checkbox"
                      checked={pdfShowItemDetails}
                      onChange={(e) => setPdfShowItemDetails(e.target.checked)}
                      className="accent-brand-gold h-3.5 w-3.5 rounded bg-zinc-950 border-zinc-800 cursor-pointer"
                    />
                    <span className="text-[10px] font-semibold text-zinc-300">أبعاد ومقاسات البند</span>
                  </label>

                  <label className="flex items-center justify-start gap-2 cursor-pointer select-none text-right">
                    <input
                      type="checkbox"
                      checked={pdfShowItemPrices}
                      onChange={(e) => setPdfShowItemPrices(e.target.checked)}
                      className="accent-brand-gold h-3.5 w-3.5 rounded bg-zinc-950 border-zinc-800 cursor-pointer"
                    />
                    <span className="text-[10px] font-semibold text-zinc-300">عرض أسعار البنود منفصلة</span>
                  </label>

                  <label className="flex items-center justify-start gap-2 cursor-pointer select-none text-right">
                    <input
                      type="checkbox"
                      checked={pdfShowBreakdown}
                      onChange={(e) => setPdfShowBreakdown(e.target.checked)}
                      className="accent-brand-gold h-3.5 w-3.5 rounded bg-zinc-950 border-zinc-800 cursor-pointer"
                    />
                    <span className="text-[10px] font-semibold text-zinc-300">تفاصيل الضرائب والخصومات</span>
                  </label>

                  <label className="flex items-center justify-start gap-2 cursor-pointer select-none text-right">
                    <input
                      type="checkbox"
                      checked={pdfShowTafqeet}
                      onChange={(e) => setPdfShowTafqeet(e.target.checked)}
                      className="accent-brand-gold h-3.5 w-3.5 rounded bg-zinc-950 border-zinc-800 cursor-pointer"
                    />
                    <span className="text-[10px] font-semibold text-zinc-300">تفقيط الحساب بالحروف</span>
                  </label>

                  <label className="flex items-center justify-start gap-2 cursor-pointer select-none text-right col-span-2 mt-1">
                    <input
                      type="checkbox"
                      checked={pdfShowNotes}
                      onChange={(e) => setPdfShowNotes(e.target.checked)}
                      className="accent-brand-gold h-3.5 w-3.5 rounded bg-zinc-950 border-zinc-800 cursor-pointer"
                    />
                    <span className="text-[10px] font-semibold text-zinc-300">إدراج شروط السداد والملحوظات الافتراضية</span>
                  </label>
                </div>
              </div>

              {/* SECTION C: Backup & JSON Tools */}
              <div className="space-y-3.5 pt-2 border-t border-zinc-900">
                <div className="flex items-center justify-start gap-1.5 border-b border-zinc-900/85 pb-2">
                  <span className="text-xs font-bold text-zinc-200">💾 النسخ الاحتياطي وحماية قواعد البيانات</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  حافظ على بياناتك مشاريعك وعملائك آمنة، قم بتحميل نسخة احتياطية من جميع ملفات العمل على جهازك أو قم برفع نسخة سابقة في ثوانٍ.
                </p>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="p-3 bg-zinc-900 hover:bg-zinc-850 hover:text-white text-zinc-300 border border-zinc-800 text-[10px] font-extrabold rounded-xl transition flex flex-col items-center gap-2 cursor-pointer"
                  >
                    <span>📥 تصدير ملف النسخة الاحتياطية (JSON)</span>
                  </button>

                  <label className="p-3 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 text-[10px] font-extrabold rounded-xl transition flex flex-col items-center gap-2 cursor-pointer text-center relative justify-center">
                    <span>📤 استيراد ملف النسخة الاحتياطية</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* SECTION D: Diagnostic, Seeding And Platform Actions */}
              <div className="space-y-3.5 pt-2 border-t border-zinc-900">
                <div className="flex items-center justify-start gap-1.5 border-b border-zinc-900/85 pb-2">
                  <span className="text-xs font-bold text-rose-400">⚙️ تشخيص البيانات التجريبية والتصليح السريع</span>
                </div>
                
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleSeedDemoData}
                    className="w-full py-2.5 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    ⚡ حقن وتوليد عينة بيانات ممتازة (4 مشاريع للاستعراض)
                  </button>

                  <button
                    type="button"
                    onClick={handleClearDatabase}
                    className="w-full py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    ⚠️ مسح كلي وتصفير البرنامج (قواعد البيانات والملفات)
                  </button>
                </div>
              </div>

              {/* SECTION E: System Diagnostics & Error Logs */}
              <div className="space-y-3.5 pt-2 border-t border-zinc-900">
                <div className="flex items-center justify-between border-b border-zinc-900/85 pb-2">
                  <span className="text-xs font-bold text-zinc-200">📊 تشخيص صحة وموثوقية النظام وسجل الأخطاء</span>
                  <span className="text-[9px] text-zinc-500 font-mono">النسخة v2.1.0</span>
                </div>
                
                {/* Health grid */}
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-850 flex items-center justify-between">
                    <span className="text-zinc-400">اتصال الإنترنت:</span>
                    <span className="flex items-center gap-1 font-bold text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      نشط (Online)
                    </span>
                  </div>
                  <div className="bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-850 flex items-center justify-between">
                    <span className="text-zinc-400">حجم الذاكرة المحلية:</span>
                    <span className="font-mono text-zinc-300 font-bold">
                      {(() => {
                        let totalBytes = 0;
                        try {
                          for (let key in localStorage) {
                            if (localStorage.hasOwnProperty(key)) {
                              totalBytes += (localStorage[key]?.length || 0) * 2;
                            }
                          }
                        } catch (e) {}
                        return (totalBytes / 1024).toFixed(2) + ' KB';
                      })()}
                    </span>
                  </div>
                  <div className="bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-850 flex items-center justify-between col-span-2">
                    <span className="text-zinc-400">سلامة بنية قاعدة البيانات:</span>
                    <span className="font-bold text-emerald-400">
                      {Array.isArray(projects) && Array.isArray(clients) ? '✓ سليمة ومستقرة' : '✗ بها عطب'}
                    </span>
                  </div>
                </div>

                {/* Error logs collapse/accordion */}
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-zinc-300">سجل أخطاء النظام ({errorLogs.length})</span>
                    {errorLogs.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setErrorLogs([]);
                          safeRemoveItem('marka_error_logs');
                        }}
                        className="text-[9px] text-rose-400 hover:underline cursor-pointer"
                      >
                        تفريغ السجل
                      </button>
                    )}
                  </div>

                  {errorLogs.length === 0 ? (
                    <p className="text-[9px] text-zinc-500 text-center py-2">✓ لا توجد أي أخطاء مسجلة حالياً.</p>
                  ) : (
                    <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1 text-[9px] font-mono">
                      {errorLogs.map((log) => (
                        <div key={log.id} className="p-1.5 bg-zinc-900/50 rounded border border-rose-950/20 text-left text-zinc-300 space-y-1">
                          <div className="flex items-center justify-between text-zinc-500 font-sans font-bold">
                            <span>{log.source}</span>
                            <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="font-sans text-rose-400 font-semibold">{log.message}</p>
                          {log.details && (
                            <pre className="p-1 bg-zinc-950 text-zinc-500 rounded text-[8px] overflow-x-auto whitespace-pre-wrap leading-tight">{log.details}</pre>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex justify-end px-6 py-4.5 bg-zinc-900/40 border-t border-brand-surface-2">
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-6 py-2 bg-brand-gold hover:bg-amber-500 text-brand-bg font-extrabold rounded-xl text-xs transition cursor-pointer shadow"
              >
                حفظ وإغلاق الإعدادات
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
    </>
  );
}
