import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { hasPermission } from '../../lib/permissions';
import { Establishment, EstablishmentStatus, RiskLevel } from '../../types';
import {
  Store,
  Search,
  Plus,
  Filter,
  MapPin,
  Building2,
  Phone,
  ShieldAlert,
  ArrowRight,
  LayoutGrid,
  List,
  AlertTriangle,
  Ban,
  CircleDollarSign,
  TrendingUp,
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { ExportButton } from '../common/ExportButton';
import { EstablishmentDetailView } from './EstablishmentDetailView';

interface EstablishmentsViewProps {
  onOpenCreateEstModal: () => void;
}

export const EstablishmentsView: React.FC<EstablishmentsViewProps> = ({
  onOpenCreateEstModal,
}) => {
  const {
    establishments,
    currentUser,
    selectedEstablishmentId,
    setSelectedEstablishmentId,
    navigateTo,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // If an establishment is selected, render the detailed 12-tab view
  if (selectedEstablishmentId) {
    return (
      <EstablishmentDetailView
        establishmentId={selectedEstablishmentId}
        onBack={() => setSelectedEstablishmentId(null)}
      />
    );
  }

  // Filter establishments
  const filteredEsts = establishments.filter(est => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      est.brandName.toLowerCase().includes(q) ||
      est.legalName.toLowerCase().includes(q) ||
      est.inn.includes(q) ||
      est.id.toLowerCase().includes(q) ||
      est.responsibleManager.toLowerCase().includes(q) ||
      est.city.toLowerCase().includes(q);

    const matchStatus = statusFilter === 'all' || est.status === statusFilter;
    const matchRisk = riskFilter === 'all' || est.riskStatus === riskFilter;
    const matchCity = cityFilter === 'all' || est.city === cityFilter;

    return matchQuery && matchStatus && matchRisk && matchCity;
  });

  const cities = Array.from(new Set(establishments.map(e => e.city)));

  const exportData = filteredEsts.map(e => ({
    'ID Заведения': e.id,
    'Бренд': e.brandName,
    'Юр. Лицо': e.legalName,
    'ИНН': e.inn,
    'КПП': e.kpp || '',
    'ОГРН': e.ogrn,
    'Город': e.city,
    'Тип': e.type,
    'Точек': e.branches.length,
    'Статус': e.status,
    'Риск': e.riskStatus,
    'Заблокирован': e.isBlocked ? 'Да' : 'Нет',
    'Комиссия (%)': e.commercialTerms.commissionRate,
    'Выручка (GMV)': e.metrics.totalGmv,
    'Менеджер': e.responsibleManager,
  }));

  return (
    <div className="space-y-5 pb-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Реестр партнеров</span>
            <span>/</span>
            <span className="text-indigo-600 font-medium">Заведения HoReCa</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2.5">
            Единый реестр кофеен, кафе и ресторанов сети
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hasPermission.canCreateEstablishment(currentUser.role) && (
            <button
              onClick={onOpenCreateEstModal}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Создать заведение</span>
            </button>
          )}
          <ExportButton data={exportData} filename="horeca_establishments.csv" label="Экспорт" />
        </div>
      </div>

      {/* Filter and View Mode Toolbar */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto flex-1">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск по бренду, ИНН, менеджеру..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Все статусы ({establishments.length})</option>
            <option value="active">Активные</option>
            <option value="approved">Одобрено к подключению</option>
            <option value="temporarily_stopped">Временно остановлено</option>
            <option value="risk_limited">Ограничено по риску</option>
            <option value="blocked">Заблокировано</option>
          </select>

          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Все риск-статусы</option>
            <option value="none">Чисто</option>
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
            <option value="critical">Критический</option>
          </select>

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
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
          <span className="text-slate-500">
            Заведений: <span className="font-bold text-slate-900">{filteredEsts.length}</span>
          </span>

          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1 rounded ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
              title="Табличный вид"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
              title="Сетка карточек"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-3.5">ID</th>
                  <th className="py-3 px-3.5">Бренд / Юрлицо</th>
                  <th className="py-3 px-3.5">ИНН / Регион</th>
                  <th className="py-3 px-3.5">Филиалов</th>
                  <th className="py-3 px-3.5">Статус</th>
                  <th className="py-3 px-3.5">Риск-статус</th>
                  <th className="py-3 px-3.5 text-right">Выручка (GMV)</th>
                  <th className="py-3 px-3.5 text-right">Комиссия</th>
                  <th className="py-3 px-3.5 text-right">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredEsts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500">
                      Заведений по выбранным критериям не найдено
                    </td>
                  </tr>
                ) : (
                  filteredEsts.map(est => (
                    <tr
                      key={est.id}
                      onClick={() => setSelectedEstablishmentId(est.id)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-3.5 font-mono font-bold text-slate-900">{est.id}</td>

                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span>{est.brandName}</span>
                          {est.isBlocked && <span className="text-[9px] bg-red-50 text-red-700 px-1 py-0.2 rounded font-mono font-bold border border-red-200">БЛОК</span>}
                        </div>
                        <div className="text-[11px] text-slate-500">{est.legalName}</div>
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="font-mono text-slate-800">{est.inn}</div>
                        <div className="text-[11px] text-slate-500">{est.city}</div>
                      </td>

                      <td className="py-3 px-3.5">
                        <span className="font-mono text-slate-900 font-semibold">{est.branches.length}</span>
                        <span className="text-[11px] text-slate-500 ml-1">точек</span>
                      </td>

                      <td className="py-3 px-3.5">
                        <StatusBadge type="establishment" status={est.status} />
                      </td>

                      <td className="py-3 px-3.5">
                        <StatusBadge type="risk" status={est.riskStatus} />
                      </td>

                      <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900">
                        {est.metrics.totalGmv.toLocaleString()} ₽
                      </td>

                      <td className="py-3 px-3.5 text-right font-mono font-semibold text-indigo-700">
                        {est.commercialTerms.commissionRate}%
                      </td>

                      <td className="py-3 px-3.5 text-right" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedEstablishmentId(est.id)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-[11px] border border-slate-300 transition-colors inline-flex items-center gap-1 shadow-2xs"
                        >
                          <span>Карточка</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEsts.map(est => (
            <div
              key={est.id}
              onClick={() => setSelectedEstablishmentId(est.id)}
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 cursor-pointer shadow-xs hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    {est.brandName}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{est.legalName}</div>
                </div>
                <StatusBadge type="establishment" status={est.status} />
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="flex justify-between">
                  <span>ИНН / ОГРН:</span>
                  <span className="font-mono text-slate-900">{est.inn}</span>
                </div>
                <div className="flex justify-between">
                  <span>Город / Точек:</span>
                  <span className="text-slate-900 font-medium">{est.city} ({est.branches.length} точек)</span>
                </div>
                <div className="flex justify-between">
                  <span>Тариф платформы:</span>
                  <span className="font-mono text-indigo-700 font-semibold">{est.commercialTerms.commissionRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Выручка (GMV):</span>
                  <span className="font-mono font-bold text-slate-900">{est.metrics.totalGmv.toLocaleString()} ₽</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <StatusBadge type="risk" status={est.riskStatus} />
                <span className="text-indigo-600 text-xs font-semibold flex items-center gap-1">
                  <span>Подробнее</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
