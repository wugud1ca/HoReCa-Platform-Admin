import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Store, FileText, ShoppingBag, ShieldAlert, X, ArrowRight } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export const GlobalSearchModal: React.FC = () => {
  const {
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    establishments,
    applications,
    orders,
    riskCases,
    navigateTo,
  } = useApp();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(!isGlobalSearchOpen);
      }
      if (e.key === 'Escape' && isGlobalSearchOpen) {
        setIsGlobalSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGlobalSearchOpen, setIsGlobalSearchOpen]);

  useEffect(() => {
    if (isGlobalSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isGlobalSearchOpen]);

  if (!isGlobalSearchOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedEstablishments = q
    ? establishments.filter(
        e =>
          e.brandName.toLowerCase().includes(q) ||
          e.legalName.toLowerCase().includes(q) ||
          e.inn.includes(q) ||
          e.id.toLowerCase().includes(q) ||
          e.city.toLowerCase().includes(q)
      )
    : establishments.slice(0, 4);

  const matchedApplications = q
    ? applications.filter(
        a =>
          a.brandName.toLowerCase().includes(q) ||
          a.legalName.toLowerCase().includes(q) ||
          a.inn.includes(q) ||
          a.id.toLowerCase().includes(q)
      )
    : [];

  const matchedOrders = q
    ? orders.filter(
        o =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.establishmentName.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q)
      )
    : [];

  const matchedRisks = q
    ? riskCases.filter(
        r =>
          r.id.toLowerCase().includes(q) ||
          r.establishmentName.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 bg-slate-50 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Поиск по названию, ИНН, ID заведения, заявке или номеру заказа..."
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1 text-xs"
            >
              Очистить
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs text-slate-500 bg-white rounded border border-slate-200 font-mono shadow-2xs">
            ESC
          </kbd>
          <button
            onClick={() => setIsGlobalSearchOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="overflow-y-auto p-3 space-y-4 text-xs divide-y divide-slate-100">
          {/* Establishments */}
          {matchedEstablishments.length > 0 && (
            <div className="pt-2 first:pt-0">
              <div className="px-2 py-1 text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                <Store className="w-3.5 h-3.5 text-indigo-600" />
                Заведения ({matchedEstablishments.length})
              </div>
              <div className="space-y-1 mt-1">
                {matchedEstablishments.map(est => (
                  <button
                    key={est.id}
                    onClick={() => {
                      setIsGlobalSearchOpen(false);
                      navigateTo('establishments', est.id);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-md bg-indigo-50 border border-indigo-200 flex items-center justify-center font-bold text-indigo-700 text-xs">
                        {est.brandName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-slate-900 font-medium truncate group-hover:text-indigo-600">
                          {est.brandName}
                          <span className="ml-2 text-[11px] text-slate-500 font-normal">
                            ({est.legalName})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>ИНН: {est.inn}</span>
                          <span>•</span>
                          <span>{est.city}</span>
                          <span>•</span>
                          <span>{est.branches.length} точек</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge type="establishment" status={est.status} />
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Applications */}
          {matchedApplications.length > 0 && (
            <div className="pt-3">
              <div className="px-2 py-1 text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                Заявки на подключение ({matchedApplications.length})
              </div>
              <div className="space-y-1 mt-1">
                {matchedApplications.map(app => (
                  <button
                    key={app.id}
                    onClick={() => {
                      setIsGlobalSearchOpen(false);
                      navigateTo('applications', app.id);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors text-left group"
                  >
                    <div>
                      <div className="text-slate-900 font-medium group-hover:text-emerald-700">
                        Заявка #{app.id} — {app.brandName}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        ИНН: {app.inn} • {app.city} • Менеджер: {app.assignedTo}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge type="application" status={app.status} />
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Orders */}
          {matchedOrders.length > 0 && (
            <div className="pt-3">
              <div className="px-2 py-1 text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                <ShoppingBag className="w-3.5 h-3.5 text-sky-600" />
                Заказы ({matchedOrders.length})
              </div>
              <div className="space-y-1 mt-1">
                {matchedOrders.map(ord => (
                  <button
                    key={ord.id}
                    onClick={() => {
                      setIsGlobalSearchOpen(false);
                      navigateTo('orders');
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors text-left group"
                  >
                    <div>
                      <div className="text-slate-900 font-medium group-hover:text-sky-700">
                        Заказ {ord.orderNumber} • {ord.totalAmount} ₽
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {ord.establishmentName} ({ord.branchName}) • {ord.createdAt}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge type="order" status={ord.status} />
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Risk Cases */}
          {matchedRisks.length > 0 && (
            <div className="pt-3">
              <div className="px-2 py-1 text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                Риск-инциденты ({matchedRisks.length})
              </div>
              <div className="space-y-1 mt-1">
                {matchedRisks.map(r => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setIsGlobalSearchOpen(false);
                      navigateTo('risks');
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors text-left group"
                  >
                    <div>
                      <div className="text-slate-900 font-medium group-hover:text-rose-700">
                        {r.id}: {r.establishmentName}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-md">
                        {r.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge type="risk" status={r.level} />
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {q &&
            matchedEstablishments.length === 0 &&
            matchedApplications.length === 0 &&
            matchedOrders.length === 0 &&
            matchedRisks.length === 0 && (
              <div className="py-8 text-center text-slate-500">
                Ничего не найдено по запросу &quot;{query}&quot;
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
