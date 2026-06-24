/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Phone, 
  Mail, 
  Layers, 
  Coins,
  MessageCircle
} from 'lucide-react';
import { Client, Project } from '../types';
import { fmt, safe } from '../utils';

interface ClientsListProps {
  clients: Client[];
  projects: Project[];
  onOpenClientModal: (id?: string) => void;
  onDeleteClient: (id: string) => void;
}

export default function ClientsList({
  clients,
  projects,
  onOpenClientModal,
  onDeleteClient,
}: ClientsListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter((c) => {
    return (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.notes.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header sections */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-gold" />
            <span>قاعدة بيانات العملاء</span>
          </h2>
          <p className="text-zinc-400 text-xs mt-1">تتبع تواصل العملاء والمشاريع وقيمة المعاملات المالية المكتملة</p>
        </div>
        <button 
          type="button"
          onClick={() => onOpenClientModal()}
          className="flex items-center justify-center gap-2 bg-brand-gold hover:bg-amber-500 text-brand-bg font-bold px-5 py-2.5 rounded-xl transition cursor-pointer shadow w-full sm:w-auto"
        >
          <Plus className="w-5 h-5 animate-bounce" />
          <span>إضافة عميل جديد</span>
        </button>
      </div>

      {/* Search Input bar */}
      <div className="relative pt-2">
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="البحث عن اسم العميل، الهاتف، البريد، ملاحظات..."
          className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl py-2.5 pr-11 pl-4 text-sm focus:border-brand-gold focus:outline-none transition font-sans"
        />
        <Search className="w-5 h-5 text-zinc-500 absolute top-5 right-4" />
      </div>

      {/* Clients lists */}
      {filteredClients.length > 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow">
          {/* Table header (visible on tablet and up) */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-zinc-950 text-[11px] font-black uppercase text-zinc-500 tracking-wider">
            <span className="col-span-3">العميل والملاحظات</span>
            <span className="col-span-3">بيانات الاتصال والتواصل</span>
            <span className="col-span-2 text-center">المشاريع المسجلة</span>
            <span className="col-span-2 text-left">إجمالي المبيعات</span>
            <span className="col-span-2 text-left">إجراءات</span>
          </div>

          <div className="divide-y divide-zinc-800/80">
            {filteredClients.map((c) => {
              // Calculate specific clients counts & earnings
              const clientProjects = projects.filter((p) => p.clientId === c.id);
              const clientTotalEarnings = clientProjects.reduce((sum, p) => sum + (Number(p.price) || 0), 0);

              return (
                <div 
                  key={c.id} 
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4.5 items-center hover:bg-zinc-800/20 transition group"
                >
                  {/* Name and notes column */}
                  <div className="md:col-span-3 space-y-1">
                    <h4 className="text-white font-extrabold text-sm group-hover:text-brand-gold transition duration-150">
                      {safe(c.name)}
                    </h4>
                    {c.notes && (
                      <p className="text-xs text-zinc-400 font-sans leading-relaxed truncate max-w-xs">{safe(c.notes)}</p>
                    )}
                  </div>

                  {/* Contacts column */}
                  <div className="md:col-span-3 space-y-1 text-xs text-zinc-400 font-mono">
                    {c.phone && (
                      <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 hover:text-brand-gold inline-flex">
                        <Phone className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{c.phone}</span>
                      </a>
                    )}
                    {c.email && (
                      <div>
                        <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 hover:text-brand-gold inline-flex">
                          <Mail className="w-3.5 h-3.5 text-zinc-500" />
                          <span className="truncate max-w-[170px]">{c.email}</span>
                        </a>
                      </div>
                    )}
                    {!c.phone && !c.email && <span className="text-zinc-600 font-sans italic">لا توجد وسيلة تواصل</span>}
                  </div>

                  {/* Active Projects counter */}
                  <div className="md:col-span-2 text-right md:text-center">
                    <div className="md:hidden text-[10px] text-zinc-500 uppercase font-bold mb-1">المشاريع</div>
                    <span className="bg-zinc-800 text-zinc-300 font-bold px-3 py-1 rounded-full text-xs border border-zinc-700/50 inline-flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-brand-gold" />
                      <span>{clientProjects.length}</span>
                    </span>
                  </div>

                  {/* Total Value spent by Client */}
                  <div className="md:col-span-2 text-right md:text-left">
                    <div className="md:hidden text-[10px] text-zinc-500 uppercase font-bold mb-1">المبيعات</div>
                    <span className="text-sm font-black text-brand-gold font-mono">
                      {fmt(clientTotalEarnings, 0)} <small className="text-[10px] font-sans font-normal text-zinc-400">دج</small>
                    </span>
                  </div>

                  {/* Actions column */}
                  <div className="md:col-span-2 flex gap-2 justify-end self-center">
                    {c.phone && (
                      <a
                        href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        title="مراسلة واتساب"
                        className="w-8.5 h-8.5 border border-emerald-900/30 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-xl flex items-center justify-center transition cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      type="button"
                      title="تعديل العميل"
                      onClick={() => onOpenClientModal(c.id)}
                      className="w-8.5 h-8.5 border border-zinc-800 hover:border-brand-gold bg-zinc-800/50 hover:bg-brand-gold/10 text-zinc-300 hover:text-brand-gold rounded-xl flex items-center justify-center transition cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="حذف العميل"
                      onClick={() => onDeleteClient(c.id)}
                      className="w-8.5 h-8.5 border border-zinc-800 hover:border-rose-500 bg-zinc-800/50 hover:bg-rose-500/10 text-zinc-300 hover:text-rose-500 rounded-xl flex items-center justify-center transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 bg-zinc-800/60 text-zinc-500 rounded-full flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-extrabold text-base">لم نعثر على أي عملاء مسجلين</h4>
            <p className="text-zinc-500 text-xs px-4">
              {searchTerm 
                ? 'جرب البحث باسم آخر، او تفقد سلامة الحروف التي دونتها.' 
                : 'قائمة العملاء فارغة تماماً. قم بتسجيل عميلك الأول لربطه بحاسبة التسعير والمشاريع.'
              }
            </p>
          </div>
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
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
