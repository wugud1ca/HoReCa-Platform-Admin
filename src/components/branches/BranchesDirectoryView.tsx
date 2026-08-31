import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MapPin,
  Search,
  Building2,
  Store,
  Play,
  Pause,
  AlertTriangle,
  QrCode,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { ExportButton } from '../common/ExportButton';

export const BranchesDirectoryView: React.FC = () => {
  const {
    establishments,
    toggleBranchStop,
    setSelectedEstablishmentId,
    navigateTo,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Flatten all branches across all establishments
  const allBranches = establishments.flatMap(est =>
    est.branches.map(b => ({
      ...b,
      establishmentId: est.id,
      establishmentBrand: est.brandName,
      establishmentLegal: est.legalName,
      establishmentInn: est.inn,
      establishmentStatus: est.status,
      establishmentRisk: est.riskStatus,
      city: est.city,
    }))
  );

  const filteredBranches = allBranches.filter(b => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      b.name.toLowerCase().includes(q) ||
      b.address.toLowerCase().includes(q) ||
      b.establishmentBrand.toLowerCase().includes(q) ||
      b.establishmentInn.includes(q) ||
      b.id.toLowerCase().includes(q);

    const matchCity = cityFilter === 'all' || b.city === cityFilter;
    const matchStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'stopped'
        ? b.isTemporarilyStopped
        : !b.isTemporarilyStopped;

    return matchQuery && matchCity && matchStatus;
  });

  const cities = Array.from(new Set(allBranches.map(b => b.city)));

  const exportData = filteredBranches.map(b => ({
    'ID Точки': b.id,
    'Название': b.name,
    'Сеть / Бренд': b.establishmentBrand,
    'ИНН': b.establishmentInn,
    'Город': b.city,
    'Адрес': b.address,
    'Часы работы': b.workingHours,
    'Статус': b.isTemporarilyStopped ? 'Остановлена' : 'Работает',
    'Причина остановки': b.stopReason || '',
    'Выручка сегодня (₽)': b.todayGmv,
    'Активных заказов': b.activeOrdersCount,
  }));

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Инфраструктура</span>
            <span>/</span>
            <span className="text-indigo-600 font-medium">Справочник точек продаж</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2.5">
            Все филиалы, точки обслуживания и кофейни
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton data={exportData} filename="horeca_branches.csv" label="Экспорт точек" />
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto flex-1">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск по адресу, названию, сети..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <select
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Все города</option>
            {cities.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Все статусы ({allBranches.length})</option>
            <option value="active">Только активные</option>
            <option value="stopped">Временно остановленные</option>
          </select>
        </div>

        <div className="text-slate-500 self-end md:self-auto">
          Найдено точек: <span className="font-bold text-slate-900">{filteredBranches.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-3.5">ID / Точка</th>
                <th className="py-3 px-3.5">Сеть / Заведение</th>
                <th className="py-3 px-3.5">Город / Адрес</th>
                <th className="py-3 px-3.5">График</th>
                <th className="py-3 px-3.5">Каналы обслуживания</th>
                <th className="py-3 px-3.5 text-right">Выручка сегодня</th>
                <th className="py-3 px-3.5">Статус</th>
                <th className="py-3 px-3.5 text-right">Управление</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredBranches.map(b => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3.5">
                    <div className="font-bold text-slate-900">{b.name}</div>
                    <div className="font-mono text-[10px] text-slate-500">{b.id}</div>
                  </td>

                  <td className="py-3 px-3.5">
                    <button
                      onClick={() => {
                        setSelectedEstablishmentId(b.establishmentId);
                        navigateTo('establishments', b.establishmentId);
                      }}
                      className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline text-left block transition-colors"
                    >
                      {b.establishmentBrand}
                    </button>
                    <div className="text-[11px] text-slate-500 font-mono">ИНН: {b.establishmentInn}</div>
                  </td>

                  <td className="py-3 px-3.5 text-slate-700 max-w-xs">
                    <div className="font-medium text-slate-900">{b.city}</div>
                    <div className="text-[11px] text-slate-500 truncate">{b.address}</div>
                  </td>

                  <td className="py-3 px-3.5 text-slate-700 font-mono text-[11px]">
                    {b.workingHours}
                  </td>

                  <td className="py-3 px-3.5">
                    <div className="flex flex-wrap items-center gap-1 text-[10px]">
                      {b.serviceChannels.qrTable && (
                        <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                          QR Стол
                        </span>
                      )}
                      {b.serviceChannels.qrTakeaway && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                          Навынос
                        </span>
                      )}
                      {b.serviceChannels.counterOrder && (
                        <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-medium">
                          Стойка
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900">
                    {b.todayGmv.toLocaleString()} ₽
                  </td>

                  <td className="py-3 px-3.5">
                    {b.isTemporarilyStopped ? (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200 font-semibold">
                        <AlertTriangle className="w-3 h-3" />
                        Стоп: {b.stopReason || 'Вручную'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                        ✓ Работает
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3.5 text-right">
                    {b.isTemporarilyStopped ? (
                      <button
                        onClick={() => toggleBranchStop(b.establishmentId, b.id, false)}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-2xs transition-colors"
                      >
                        Запустить
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleBranchStop(b.establishmentId, b.id, true, 'Оперативная остановка')}
                        className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 font-semibold text-[11px] transition-colors shadow-2xs"
                      >
                        Остановить
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
