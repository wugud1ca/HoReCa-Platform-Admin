import React, { useState } from 'react';
import { Establishment, MenuItem } from '../../../types';
import { useApp } from '../../../context/AppContext';
import {
  UtensilsCrossed,
  Search,
  CheckCircle2,
  Ban,
  Clock,
  Flame,
  Coffee,
  Plus,
  Filter,
  Sliders,
  DollarSign
} from 'lucide-react';

interface MenuStopListTabProps {
  establishment: Establishment;
}

export const MenuStopListTab: React.FC<MenuStopListTabProps> = ({ establishment }) => {
  const { toggleMenuItemStopList } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stopListFilter, setStopListFilter] = useState<string>('all');

  const menuItems: MenuItem[] = establishment.menuItems || [];

  // Extract unique categories
  const categories = Array.from(new Set(menuItems.map(m => m.category)));

  const filteredItems = menuItems.filter(item => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q));

    const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
    const matchStop =
      stopListFilter === 'all'
        ? true
        : stopListFilter === 'stopped'
        ? item.isStopList
        : !item.isStopList;

    return matchQuery && matchCat && matchStop;
  });

  const stopListCount = menuItems.filter(m => m.isStopList).length;

  return (
    <div className="space-y-6 text-xs">
      {/* Header Info Banner */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Меню заведения и управление стоп-листом</h3>
          </div>
          <p className="text-slate-600 text-xs max-w-2xl leading-relaxed">
            Позиции меню автоматически синхронизируются с клиентским приложением{' '}
            <strong className="text-slate-900">HoReCa Order PWA</strong> и кухонными станциями{' '}
            <strong className="text-slate-900">KDS 2 Remix</strong>. Включение стоп-листа мгновенно блокирует заказ блюда гостем.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-center shadow-2xs">
            <div className="text-[10px] text-slate-500">Всего позиций</div>
            <div className="text-sm font-bold font-mono text-slate-900">{menuItems.length}</div>
          </div>
          <div className={`px-3 py-1.5 rounded-lg border text-center shadow-2xs ${
            stopListCount > 0 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'
          }`}>
            <div className={`text-[10px] font-medium ${stopListCount > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
              В стоп-листе
            </div>
            <div className={`text-sm font-bold font-mono ${stopListCount > 0 ? 'text-rose-800' : 'text-emerald-800'}`}>
              {stopListCount} блюд
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию или категории..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Все категории ({categories.length})</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={stopListFilter}
            onChange={e => setStopListFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Любой статус</option>
            <option value="active">В продаже (Доступно)</option>
            <option value="stopped">⛔ Только Стоп-лист</option>
          </select>
        </div>

        <div className="text-slate-500 self-end md:self-auto">
          Найдено: <span className="font-bold text-slate-900">{filteredItems.length}</span>
        </div>
      </div>

      {/* Menu Items Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-3.5">Блюдо / Напиток</th>
                <th className="py-3 px-3.5">Категория</th>
                <th className="py-3 px-3.5">Выход (вес/объем)</th>
                <th className="py-3 px-3.5">KDS Станция</th>
                <th className="py-3 px-3.5">Время готовки</th>
                <th className="py-3 px-3.5 text-right">Цена в PWA</th>
                <th className="py-3 px-3.5 text-center">Стоп-Лист</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Позиций по заданным критериям не найдено
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      item.isStopList ? 'bg-rose-50/30 hover:bg-rose-50/50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      {item.description && (
                        <div className="text-[11px] text-slate-500 max-w-xs truncate">
                          {item.description}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3.5 text-slate-700">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3 px-3.5 font-mono text-slate-600">
                      {item.weightGram ? `${item.weightGram} г` : item.volumeMl ? `${item.volumeMl} мл` : '—'}
                    </td>

                    <td className="py-3 px-3.5">
                      <span className="px-2 py-0.5 rounded font-mono font-medium text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {item.kdsStation === 'bar' ? '☕ Бар' : item.kdsStation === 'kitchen' ? '🍳 Кухня' : '🍰 Сборка'}
                      </span>
                    </td>

                    <td className="py-3 px-3.5 text-slate-700 font-mono">
                      ~{item.prepTimeMin} мин
                    </td>

                    <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900">
                      {item.price} ₽
                    </td>

                    <td className="py-3 px-3.5 text-center">
                      <button
                        onClick={() => toggleMenuItemStopList(establishment.id, item.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          item.isStopList
                            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {item.isStopList ? '⛔ В стоп-листе' : '✓ В продаже'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
