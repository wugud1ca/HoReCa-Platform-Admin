import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CircleDollarSign,
  HandCoins,
  TrendingUp,
  Receipt,
  Download,
  Filter,
  CheckCircle2,
  Calendar,
  Building2,
  Scale
} from 'lucide-react';
import { ExportButton } from '../common/ExportButton';

export const FinanceLedgerView: React.FC = () => {
  const {
    establishments,
    orders,
    payouts,
    calculatePayoutsForPeriod,
    navigateTo,
    currentUser
  } = useApp();

  const [filterPeriod, setFilterPeriod] = useState<'all' | 'current_month' | 'prev_month'>('current_month');
  const [selectedEstablishment, setSelectedEstablishment] = useState<string>('all');

  // Calculations
  const totalGmv = establishments.reduce((acc, curr) => acc + curr.metrics.totalGmv, 0);
  const totalCommission = establishments.reduce((acc, curr) => acc + curr.metrics.platformCommissionEarned, 0);
  const totalPaidOut = payouts
    .filter(p => p.status === 'paid')
    .reduce((acc, curr) => acc + curr.finalPayoutAmount, 0);
  const totalPendingPayout = payouts
    .filter(p => p.status === 'ready_to_pay' || p.status === 'calculated' || p.status === 'approved')
    .reduce((acc, curr) => acc + curr.finalPayoutAmount, 0);
  const totalFrozenPayout = payouts
    .filter(p => p.status === 'frozen_by_risk')
    .reduce((acc, curr) => acc + curr.finalPayoutAmount, 0);

  const exportData = establishments.map(e => ({
    'ID Заведения': e.id,
    'Бренд': e.brandName,
    'Юр. Лицо': e.legalName,
    'ИНН': e.inn,
    'Ставка комиссии (%)': `${e.commercialTerms.commissionRate}%`,
    'Схема выплат': e.commercialTerms.payoutFrequency,
    'Всего GMV (руб)': e.metrics.totalGmv,
    'Комиссия сервиса (руб)': e.metrics.platformCommissionEarned,
    'Заморожено выплат (руб)': e.isStopPayouts ? e.metrics.pendingPayout : 0,
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span onClick={() => navigateTo('dashboard')} className="hover:text-slate-800 cursor-pointer">
              Главная
            </span>
            <span>/</span>
            <span className="text-indigo-600 font-medium">Финансовый учет</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2.5">
            Финансовый баланс, комиссии и взаиморасчеты
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(currentUser.role === 'admin' || currentUser.role === 'financier' || currentUser.role === 'accountant') && (
            <button
              onClick={() => {
                calculatePayoutsForPeriod('16.08.2026 - 31.08.2026');
                navigateTo('payouts');
              }}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
            >
              <HandCoins className="w-3.5 h-3.5" />
              <span>Расчет реестра выплат</span>
            </button>
          )}
          <ExportButton data={exportData} filename="financial_summary_ledger.csv" label="Экспорт сводки" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Суммарный оборот сети (GMV)</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">
            {totalGmv.toLocaleString('ru-RU')} ₽
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Всего {orders.length} фискализированных чеков</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Валовая комиссия платформы</span>
            <CircleDollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700 font-mono">
            {Math.round(totalCommission).toLocaleString('ru-RU')} ₽
          </div>
          <div className="text-[11px] text-emerald-700 mt-1">Чистый доход до эквайринга</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Выплачено партнерам</span>
            <CheckCircle2 className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-sky-700 font-mono">
            {Math.round(totalPaidOut).toLocaleString('ru-RU')} ₽
          </div>
          <div className="text-[11px] text-slate-500 mt-1">По утвержденным платежным реестрам</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">В очереди / Заморожено</span>
            <Scale className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700 font-mono">
            {Math.round(totalPendingPayout).toLocaleString('ru-RU')} ₽
          </div>
          <div className="text-[11px] text-rose-700 mt-1">
            Заблокировано рисками: {Math.round(totalFrozenPayout).toLocaleString('ru-RU')} ₽
          </div>
        </div>
      </div>

      {/* Financial Matrix Table */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-indigo-600" />
              Финансовый реестр по заведениям
            </h3>
            <p className="text-xs text-slate-500">
              Ставки комиссии, индивидуальные агентские условия, НДС и статус взаиморасчетов
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedEstablishment}
              onChange={e => setSelectedEstablishment(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Все заведения сети</option>
              {establishments.map(est => (
                <option key={est.id} value={est.id}>
                  {est.brandName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 font-semibold bg-slate-50">
                <th className="py-3 px-3">Заведение / Юрлицо</th>
                <th className="py-3 px-3">ИНН / КПП</th>
                <th className="py-3 px-3">Тариф / Ставка</th>
                <th className="py-3 px-3">График выплат</th>
                <th className="py-3 px-3 text-right">GMV (Оборот)</th>
                <th className="py-3 px-3 text-right">Комиссия сервиса</th>
                <th className="py-3 px-3 text-right">К выплате</th>
                <th className="py-3 px-3 text-center">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {establishments
                .filter(est => selectedEstablishment === 'all' || est.id === selectedEstablishment)
                .map(est => {
                  const netDue = est.metrics.totalGmv - est.metrics.platformCommissionEarned;

                  return (
                    <tr key={est.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{est.brandName}</div>
                        <div className="text-[11px] text-slate-500">{est.legalName}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-800">
                        <div>{est.inn}</div>
                        <div className="text-[10px] text-slate-500">{est.kpp || '—'}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono font-bold border border-indigo-200">
                          {est.commercialTerms.commissionRate}%
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {est.bankDetails.taxSystem === 'USN_INCOME' ? 'УСН Доходы' : 'ОСНО (с НДС)'}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {est.commercialTerms.payoutFrequency === 'daily'
                          ? 'Ежедневно'
                          : est.commercialTerms.payoutFrequency === 'weekly'
                          ? 'Еженедельно'
                          : 'Дважды в месяц'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">
                        {est.metrics.totalGmv.toLocaleString('ru-RU')} ₽
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-700 font-medium">
                        {Math.round(est.metrics.platformCommissionEarned).toLocaleString('ru-RU')} ₽
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-sky-700">
                        {Math.round(netDue).toLocaleString('ru-RU')} ₽
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => navigateTo('establishments', est.id)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] border border-slate-300 shadow-2xs transition-colors"
                        >
                          Карточка
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
