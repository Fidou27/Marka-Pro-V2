/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  Coins, 
  Brain, 
  Lightbulb, 
  AlertCircle,
  Zap,
  ArrowLeftRight
} from 'lucide-react';
import { Project, Client } from '../types';

interface InsightItem {
  title: string;
  description: string;
  category: string;
  iconType: 'trending' | 'users' | 'price';
}

interface AdviceResponse {
  insights: InsightItem[];
  summary: string;
}

interface AIEarningsAdvisorProps {
  projects: Project[];
  clients: Client[];
}

export default function AIEarningsAdvisor({ projects, clients }: AIEarningsAdvisorProps) {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<AdviceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetchAdvice = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai-earnings-advise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projects, clients }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل الاتصال بمستشار الأرباح الذكي.');
      }

      const data: AdviceResponse = await response.json();
      setAdvice(data);
    } catch (err: any) {
      console.error(err);
      const errMsg = err.message || 'حدث خطأ غير متوقع أثناء تحميل البيانات.';
      setError(errMsg);
      if ((window as any).logError) {
        (window as any).logError(
          'مستشار الأرباح الذكي (AI Advisor)',
          `فشل في توليد التحليل التلقائي للأرباح بسبب خطأ في الخادم أو الشبكة.`,
          err
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const hasData = projects.length > 0;

  return (
    <div id="ai-earnings-advisor" className="bg-zinc-950/40 rounded-3xl p-6 border border-zinc-800/60 backdrop-blur-md space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-brand-gold/10 text-brand-gold rounded-xl border border-brand-gold/15">
              <Brain className="w-5 h-5 animate-pulse" />
            </span>
            <h3 className="text-sm font-black text-white sm:text-base">مستشار الأرباح والنمو الذكي (Gemini AI)</h3>
            <span className="bg-emerald-500/10 text-emerald-400 text-[9px] px-2 py-0.5 rounded-full font-black.5 font-bold border border-emerald-500/10">محرك نشط</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed max-w-2xl">
            يستخدم هذا المكون الذكاء الاصطناعي التوليدي والبيانات لتشخيص قاعدة بيانات أعمالك وتحليل أسعار البنود ومعدل بقاء العملاء للشركة لتقديم نصائح دقيقة لرفع هوامش ربحيتك.
          </p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleFetchAdvice}
          disabled={loading}
          className="px-5 py-2.5 bg-brand-gold hover:bg-amber-500 disabled:bg-zinc-800 text-brand-bg disabled:text-zinc-500 font-extrabold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg disabled:cursor-not-allowed self-start shrink-0"
        >
          {loading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-brand-bg border-t-transparent rounded-full animate-spin"></span>
              <span>جاري التحليل الإحصائي...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>استشارة مستشار الأرباح الذكي</span>
            </>
          )}
        </button>
      </div>

      {/* Info indicator if state is empty */}
      {!advice && !loading && !error && (
        <div className="bg-zinc-900/30 p-4.5 rounded-xl border border-zinc-800/80 flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <p className="font-bold text-zinc-300">كيف يعمل مستشار النمو الذكي؟</p>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              {hasData 
                ? `لقد رصدنا عدد (${projects.length}) مشروعاً و (${clients.length}) عملاء مسجلين بنجاح. انقر على الزر أعلاه لإخبار المستشار بدراسة متوسطات الأسعار وإخبارك بأسرار تحسين أرباحك.`
                : 'نظامك فارغ حالياً من المشاريع الحقيقية. يمكنك تنشيط البيانات التجريبية من "ترس الإعدادات" في أعلى يسار الصفحة لتجربة التحليل، أو انقر على الزر الآن للحصول على نصائح تمهيدية عامّة للمبتدئين في السوق الجزائري!'
              }
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-rose-500/10 p-4.5 rounded-xl border border-rose-500/20 flex items-start gap-3 text-rose-400 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-extrabold">فشل الاتصال بالذكاء الاصطناعي</p>
            <p className="text-rose-300/90 text-[11px] leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Loading state placeholders - High quality skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="bg-zinc-900/40 border border-zinc-800/50 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-16 h-4 bg-zinc-800 rounded"></div>
                <div className="w-8 h-8 bg-zinc-800 rounded-lg"></div>
              </div>
              <div className="w-3/4 h-5 bg-zinc-800 rounded"></div>
              <div className="space-y-2">
                <div className="w-full h-3 bg-zinc-800 rounded"></div>
                <div className="w-5/6 h-3 bg-zinc-800 rounded"></div>
                <div className="w-2/3 h-3 bg-zinc-800 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Advice output */}
      {advice && !loading && !error && (
        <div className="space-y-6 animate-fade-in text-xs">
          {/* Grid of exactly 3 Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {advice.insights.map((insight, idx) => {
              // Custom icon based on Gemini feedback type
              const Icon = insight.iconType === 'trending' ? TrendingUp 
                         : insight.iconType === 'users' ? Users 
                         : Coins;
              
              const iconColor = insight.iconType === 'trending' ? 'text-amber-400'
                              : insight.iconType === 'users' ? 'text-blue-400'
                              : 'text-emerald-400';

              const iconBg = insight.iconType === 'trending' ? 'bg-amber-400/5 border-amber-400/10'
                           : insight.iconType === 'users' ? 'bg-blue-400/5 border-blue-400/10'
                           : 'bg-emerald-400/5 border-emerald-400/10';

              return (
                <div 
                  key={idx} 
                  className="bg-zinc-900/65 hover:bg-zinc-900/90 border border-zinc-800 hover:border-brand-gold/30 p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between gap-4 group"
                >
                  <div className="space-y-3">
                    {/* Top Row with Badge & Icon */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-black tracking-wider uppercase bg-zinc-950 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md">
                        {insight.category}
                      </span>
                      <span className={`p-1.5 rounded-lg border ${iconBg} ${iconColor} transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className="w-4 h-4" />
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-white text-xs sm:text-[13px] leading-tight group-hover:text-brand-gold transition-colors">
                      {insight.title}
                    </h4>

                    {/* Description */}
                    <p className="text-zinc-400 leading-relaxed text-[11px] text-justify selection:bg-brand-gold/35">
                      {insight.description}
                    </p>
                  </div>

                  {/* Strategic Bottom Label */}
                  <div className="pt-2 border-t border-zinc-900/60 flex items-center justify-between text-[10px] text-zinc-500 font-semibold">
                    <span>خطوة تنفيذية تالية</span>
                    <Zap className="w-3.5 h-3.5 text-brand-gold/70 animate-bounce" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Combined Summary at footer */}
          <div className="bg-brand-gold/5 p-4 rounded-2xl border border-brand-gold/15 flex items-start gap-3">
            <Sparkles className="w-4.5 h-4.5 text-brand-gold shrink-0 mt-0.5 animate-spin" />
            <div className="space-y-1">
              <p className="font-black text-brand-gold uppercase text-[10px] tracking-wider font-sans">توجيه التميز الاستراتيجي العام</p>
              <p className="text-zinc-300 leading-relaxed text-[11.5px]">
                {advice.summary}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
