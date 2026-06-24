/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FolderKanban, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar, 
  Coins, 
  Tag
} from 'lucide-react';
import { Project, ProjectStatus } from '../types';
import { fmt, safe } from '../utils';

interface ProjectsProps {
  projects: Project[];
  onOpenProjectModal: (id?: string) => void;
  onDeleteProject: (id: string) => void;
}

export default function Projects({
  projects,
  onOpenProjectModal,
  onDeleteProject,
}: ProjectsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.type.toLowerCase().includes(searchTerm.toLowerCase());
      
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'active') return matchesSearch && p.status !== 'done' && p.status !== 'cancelled';
    return matchesSearch && p.status === statusFilter;
  });

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'new':
        return { label: 'جديد', class: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
      case 'progress':
        return { label: 'قيد الإنجاز', class: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      case 'waiting':
        return { label: 'بانتظار رد العميل', class: 'text-purple-400 bg-purple-500/10 border-purple-500/20' };
      case 'done':
        return { label: 'مكتمل بنجاح', class: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'cancelled':
        return { label: 'ملغى', class: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-brand-gold" />
            <span>إدارة وتتبع المشاريع</span>
          </h2>
          <p className="text-zinc-400 text-xs mt-1">المحفظة الكاملة لأعمال التصميم وحالات الإنجاز والمدفوعات</p>
        </div>
        <button 
          type="button"
          onClick={() => onOpenProjectModal()}
          className="flex items-center justify-center gap-2 bg-brand-gold hover:bg-amber-500 text-brand-bg font-bold px-5 py-2.5 rounded-xl transition cursor-pointer shadow self-start sm:self-auto w-full sm:w-auto"
        >
          <Plus className="w-5 h-5 animate-pulse" />
          <span>إضافة مشروع جديد</span>
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col md:flex-row gap-3 pt-2">
        {/* Search input */}
        <div className="relative flex-1">
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث عن اسم المشروع، العميل، أو نوع التصميم..."
            className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl py-2.5 pr-11 pl-4 text-sm focus:border-brand-gold focus:outline-none transition font-sans"
          />
          <Search className="w-5 h-5 text-zinc-500 absolute top-3 right-4" />
        </div>

        {/* Tab filters */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-950/70 border border-zinc-800 rounded-xl">
          {[
            { value: 'all', label: 'الكل' },
            { value: 'active', label: 'النشطة' },
            { value: 'new', label: 'جديد' },
            { value: 'progress', label: 'قيد الإنجاز' },
            { value: 'waiting', label: 'بانتظار العميل' },
            { value: 'done', label: 'المكتملة' },
            { value: 'cancelled', label: 'الملغاة' },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                statusFilter === tab.value 
                  ? 'bg-zinc-800 text-brand-gold shadow' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects list/grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((p) => {
            const badge = getStatusBadge(p.status);
            return (
              <div 
                key={p.id} 
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 flex flex-col justify-between transition group hover:-translate-y-0.5 duration-200"
              >
                {/* Header card of project */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-white font-extrabold text-base group-hover:text-brand-gold transition duration-150 line-clamp-1">
                        {safe(p.name)}
                      </h3>
                      <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
                        <span className="font-semibold text-zinc-300">👤 {safe(p.clientName || 'بدون عميل')}</span>
                      </p>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border shrink-0 ${badge?.class}`}>
                      {badge?.label}
                    </span>
                  </div>

                  {/* Metadata labels */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="text-[11px] font-semibold text-zinc-400 bg-zinc-800 border border-zinc-800 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-brand-gold" />
                      <span>{safe(p.type || 'تصميم')}</span>
                    </span>
                    {p.start && (
                      <span className="text-[11px] font-semibold text-zinc-400 bg-zinc-800 border border-zinc-800 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        <span>البدء: {p.start}</span>
                      </span>
                    )}
                    {(() => {
                      if (p.status === 'done' || p.status === 'cancelled') return null;
                      if (!p.start) return null;

                      const targetDeadlineStr = p.deadline || (() => {
                        const startDate = new Date(p.start);
                        startDate.setDate(startDate.getDate() + 10);
                        return startDate.toISOString().slice(0, 10);
                      })();

                      const todayStr = new Date().toISOString().slice(0, 10);
                      const todayTime = new Date(todayStr).getTime();
                      const deadlineTime = new Date(targetDeadlineStr).getTime();
                      const diffMs = deadlineTime - todayTime;
                      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

                      let colorClass = 'text-[#00C2FF] bg-cyan-500/5 border-cyan-500/10';
                      let labelText = `⏳ متبقي ${diffDays} يوم`;

                      if (diffDays <= 0) {
                        colorClass = 'text-rose-400 bg-rose-500/5 border-rose-500/10 font-bold';
                        labelText = `⚠️ متأخر بـ ${Math.abs(diffDays)} يوم!`;
                      } else if (diffDays <= 3) {
                        colorClass = 'text-[#FFB347] bg-amber-500/5 border-amber-500/10 font-bold';
                        labelText = `⏳ متبقي ${diffDays} أيام فقط!`;
                      }

                      return (
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border flex items-center gap-1 ${colorClass}`} title="تاريخ التسليم المتوقع">
                          <span>{labelText}</span>
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Footer values and action buttons */}
                <div className="flex items-center justify-between border-t border-zinc-800/80 mt-4 pt-3.5">
                  <div className="space-y-0.5">
                    <div className="text-[10px] text-zinc-500 uppercase font-bold">التكلفة المالية</div>
                    <div className="text-lg font-black text-brand-gold font-mono leading-none">
                      {fmt(p.price, 0)} <small className="text-[10px] font-sans font-normal text-zinc-400">دج</small>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      title="تعديل المشروع"
                      onClick={() => onOpenProjectModal(p.id)}
                      className="w-8.5 h-8.5 border border-zinc-800 hover:border-brand-gold bg-zinc-800/50 hover:bg-brand-gold/10 text-zinc-300 hover:text-brand-gold rounded-xl flex items-center justify-center transition cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="حذف المشروع"
                      onClick={() => onDeleteProject(p.id)}
                      className="w-8.5 h-8.5 border border-zinc-800 hover:border-rose-500 bg-zinc-800/50 hover:bg-rose-500/10 text-zinc-300 hover:text-rose-500 rounded-xl flex items-center justify-center transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 bg-zinc-800/60 text-zinc-500 rounded-full flex items-center justify-center mx-auto">
            <FolderKanban className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-extrabold text-base">لم نعثر على أي تطابق للمشاريع</h4>
            <p className="text-zinc-500 text-xs px-4">
              {searchTerm 
                ? 'جرب البحث بكلمات دلالية أخرى، أو قم بتغيير الفلتر الحالي لعرض المزيد من النتائج.' 
                : 'القائمة فارغة تماماً، ابدأ المشروع البرمجي والتصميمي بإضافة بيانات حقيقية.'
              }
            </p>
          </div>
          {searchTerm && (
            <button
              type="button"
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
            >
              إلغاء صفحة تصفية البحث
            </button>
          )}
        </div>
      )}
    </div>
  );
}
