/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Gemini AI Design & Pricing Suggestion
  app.post('/api/ai-suggest', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: 'مفتاح API الخاص بـ Gemini غير مهيأ. يرجى إعداده في الإعدادات.' 
        });
      }

      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'الرجاء إدخال تفاصيل المشروع لتوليد الاقتراح.' });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `أنت مستشار احترافي لتسعير وتصميم أعمال الجرافيك في الجزائر والوطن العربي لتطبيق ماركا برو (MARKA PRO).
المستخدم يبحث عن تفصيل وتسعير لمشروع التصميم التالي: "${prompt}".

اقترح عليه خطة عمل تسعيرية مقسمة إلى عناصر تصميم بأسعار معقولة بالدينار الجزائري (دج - DZD) تناسب السوق المحلي، مع نصيحة للتفاوض، ومسودة عرض سعر ممتازة ليرسلها للعميل.

يرجى إرجاع النتيجة بصيغة JSON نظيفة تماماً بدون أي علامات markdown (مثل \`\`\`json) أو تجميل نصي غير ضروري كالتالي:
{
  "suggested_items": [
    {
      "desc": "شرح العنصر الأول (مثال: تصميم الشعار الأساسي والهوية البصرية)",
      "length": 1000,
      "width": 1000,
      "unit": "px",
      "priceUnit": "fixed",
      "price": 30000,
      "copies": 1
    }
  ],
  "negotiation_tip": "اكتب نصيحة ذكية هنا للتفاوض مع العميل وشرح جودة العمل الخاص بالمصمم لتفادي تخفيض السعر بشكل جائر.",
  "client_proposal": "اكتب نص مسودة عرض السعر بطريقة تسويقية راقية لمشاركتها مع العميل تشتمل على التقييم المبدئي والترحيب."
}`
      });

      const responseText = response.text || '';
      // Strip markdown code block wrappers if any
      const cleanJson = responseText
        .replace(/```json/gi, '')
        .replace(/```/gi, '')
        .trim();

      const resultObj = JSON.parse(cleanJson);
      res.json(resultObj);
    } catch (error: any) {
      console.error('Gemini AI Suggestion Error:', error);
      res.status(500).json({ 
        error: 'حدث خطأ أثناء التواصل مع خادم الذكاء الاصطناعي: ' + (error.message || error) 
      });
    }
  });

  // API Route for Gemini AI Profit & Earnings Business Advisor
  app.post('/api/ai-earnings-advise', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: 'مفتاح API الخاص بـ Gemini غير مهيأ. يرجى إعداده أولاً عبر قائمة الإعدادات.' 
        });
      }

      const { projects, clients } = req.body;
      if (!projects || !Array.isArray(projects)) {
        return res.status(400).json({ error: 'الرجاء توفير قائمة بالمشاريع للتحليل الذكي.' });
      }

      // Format a dense, readable representation of projects and clients for the AI
      const projectsText = projects.map((p, i) => 
        `- مشروع ${i+1}: الاسم "${p.name}"، النوع/التصنيف "${p.type}"، السعر الدائم ${p.price} دج، اسم العميل "${p.clientName}"، الحالة "${p.status}"`
      ).join('\n');

      const clientsText = (clients || []).map((c, i) => 
        `- عميل ${i+1}: الاسم "${c.name}"، ملاحظات العميل "${c.notes || 'لا يوجد'}"`
      ).join('\n');

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `أنت مستشار مالي ومسؤول تطوير أعمال (Business and Business Development Consultant) عبقري، متخصص في أرباح مصممي الجرافيك وصانعي الهويات البصرية المستقلين والوكالات الإبداعية الرقمية في الجزائر ودول المغرب العربي وتطبيق ماركا برو (MARKA PRO).

يرجى تحليل قاعدة بيانات المصمم الحالية المحددة أدناه لتقديم 3 نصائح ذكية للغاية وعملية موجهة لزيادة الدخل الصافي وتنمية الأرباح السريعة والمدى البعيد بناءً على:
1. أنواع المشاريع الأعلى قيمة وإنتاجاً للأرباح الإجمالية (Revenue Density).
2. العملاء الأكثر ارتباطاً وتكراراً للأعمال والطلبيات (High Retention Clients).
3. فجوات التسعير المتاحة أو التحول نحو باقات التصميم الفاخرة ذات الكفاءة الأعلى.

من فضلك قم بإجراء التحليلات الإحصائية والحسابية في خلفية تفكيرك (لحساب مثلاً مجموع إيرادات وتكرار كل فئة من المشاريع، وحساب نسبة تكرار العملاء المميزين)، ثم صغ هذه النصائح بأسلوب اقتصادي راقٍ ولبق يحفز المصمم على التقدم المهني والتنفيذي.

إذا قُدّمت بيانات فارغة أو مشاريع عينة قصيرة، صغ النصائح بشكل ذكي يبنى على توصية بإنشاء أولى الهويات البصرية الراقية والتركيز على باقات "تصميم الهوية المتكاملة" بدلاً من تسعير البنود الأحادية، وطريقة استهداف الشركات الجزائرية النشطة في التجارة الإلكترونية حالياً لرفع السعر.

بيانات المصمم الحالية:
=== قائمة المشاريع ===
${projectsText || 'لا توجد مشاريع مسجلة بعد في المنصة.'}

=== قائمة العملاء المسجلين ===
${clientsText || 'لا يوجد عملاء مسجلون بعد في المنصة.'}

يرجى تزويدي بالنتيجة على شكل كائن JSON صالح تماماً وبدون أي أحرف تمثيلية أو علامات markdown (لا تكلف نفسك عناء إضافة \`\`\`json أو \`\`\`) ليكون الهيكل كالتالي تماماً كقائمة:
{
  "insights": [
    {
      "title": "عنوان النصيحة الأولى (مثال: التركيز المطلق على باقات الهوية الراقية DZD)",
      "description": "تفصيل مالي واقتصادي دقيق ومبسط يبرز الفائدة بالأرقام والنسب بناءً على أنواع المشاريع الأكثر ربحاً في نظامهم مع آلية لزيادة تكلفتها 25% إضافية.",
      "category": "إدارة الأرباح والخدمات",
      "iconType": "trending"
    },
    {
      "title": "عنوان النصيحة الثانية (مثال: صياغة عروض ولاء مخصصة للعملاء المميزين)",
      "description": "استكشاف العميل الأكثر تكراراً بالاسم إن وجد وكتابة خطة عمل لتحويله إلى دفعة شهرية مستدامة (Retainer) بدلاً من التعامل بالقطعة.",
      "category": "تنمية ولاء العملاء",
      "iconType": "users"
    },
    {
      "title": "عنوان النصيحة الثالثة (مثال: رفع هامش ربح بنود المطبوعات المستعجلة)",
      "description": "استخدام استراتيجية تسعير مرنة تناسب ضغط المواعيد، وتقديم باقة تسعير سريعة لخدمات التغليف مع كسب 15% ربح طارئ.",
      "category": "استراتيجيات التسعير الذكي",
      "iconType": "price"
    }
  ],
  "summary": "توليفة عامة وملخص إرشادي مكثف يلهم المصمم لتطبيق الخطوة الأولى غداً لزيادة كفاءة مشاريعه الفردية والمؤسساتية."
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt
      });

      const responseText = response.text || '';
      const cleanJson = responseText
        .replace(/```json/gi, '')
        .replace(/```/gi, '')
        .trim();

      const resultObj = JSON.parse(cleanJson);
      res.json(resultObj);
    } catch (error: any) {
      console.error('Gemini Earning Advice Error:', error);
      res.status(500).json({ 
        error: 'حدث خطأ أثناء تحليل بيانات أرباحك وتوليد نصيحتك الذكية: ' + (error.message || error) 
      });
    }
  });

  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MARKA PRO] Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
