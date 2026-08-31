import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Store,
  Inbox,
  ShieldAlert,
  ShoppingBag,
  CircleDollarSign,
  HandCoins,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Ban,
  FileCheck2,
  Users2,
  Sparkles,
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

export const DashboardView: React.FC = () => {
  const {
    establishments,
    applications,
    orders,
    payouts,
    riskCases,
    currentUser,
    navigateTo,
    approvePayout,
    updateApplicationStatus,
  } = useApp();

  // Metrics calculations
  const totalEst = establishments.length;
  const activeEst = establishments.filter(e => e.status === 'active').length;
  const inReviewEst = applications.filter(a => a.status !== 'converted' && a.status !== 'rejected').length;
  const inRiskEst = establishments.filter(e => e.riskStatus === 'high' || e.riskStatus === 'critical' || e.status === 'risk_limited').length;
  const blockedEst = establishments.filter(e => e.isBlocked || e.status === 'blocked').length;

  const totalOrders = orders.length;
  const totalGmv = establishments.reduce((acc, curr) => acc + curr.metrics.totalGmv, 0);
  const totalCommission = establishments.reduce((acc, curr) => acc + curr.metrics.platformCommissionEarned, 0);
  const pendingPayoutTotal = payouts
    .filter(p => p.status === 'ready_to_pay' || p.status === 'approved' || p.status === 'calculated')
    .reduce((acc, curr) => acc + curr.finalPayoutAmount, 0);
  const frozenPayoutTotal = payouts
    .filter(p => p.status === 'frozen_by_risk')
    .reduce((acc, curr) => acc + curr.finalPayoutAmount, 0);

  // Urgent problem items requiring attention
  const urgentRisks = riskCases.filter(r => (r.level === 'critical' || r.level === 'high') && r.status !== 'resolved');
  const pendingAppsQueue = applications.filter(a => a.status === 'new' || a.status === 'in_verification' || a.status === 'legal_check');
  const readyPayoutsQueue = payouts.filter(p => p.status === 'ready_to_pay' || p.status === 'approved');

  // Chart data simulation
  const gmvTrendData = [
    { period: '24 Авг', gmv: 420000, fee: 39900, orders: 930 },
    { period: '25 Авг', gmv: 510000, fee: 48450, orders: 1120 },
    { period: '26 Авг', gmv: 480000, fee: 45600, orders: 1040 },
    { period: '27 Авг', gmv: 610000, fee: 57950, orders: 1350 },
    { period: '28 Авг', gmv: 740000, fee: 70300, orders: 1620 },
    { period: '29 Авг', gmv: 890000, fee: 84550, orders: 1940 },
    { period: '30 Авг', gmv: 960000, fee: 91200, orders: 2110 },
  ];

  const cityDistributionData = [
    { city: 'Москва', active: 4, inReview: 2, risks: 1 },
    { city: 'Санкт-Петербург', active: 2, inReview: 1, risks: 1 },
    { city: 'Казань', active: 1, inReview: 1, risks: 1 },
    { city: 'Новосибирск', active: 1, inReview: 0, risks: 0 },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Центральная консоль</span>
            <span>/</span>
            <span className="text-indigo-600 font-medium">Главный Дашборд</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1 flex flex-wrap items-center gap-2.5">
            Сводные операционные показатели HoReCa
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono font-semibold border border-indigo-200">
              Live Monitor
            </span>
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigateTo('applications')}
            className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Inbox className="w-3.5 h-3.5 text-emerald-600" />
            <span>Заявки ({inReviewEst})</span>
          </button>
          <button
            onClick={() => navigateTo('risks')}
            className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>Риски ({urgentRisks.length})</span>
          </button>
        </div>
      </div>

      {/* Row 1: Top KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* KPI 1 */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Всего заведений</span>
            <Store className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 font-mono">{totalEst}</div>
            <div className="text-[11px] text-emerald-700 flex items-center gap-1 mt-0.5">
              <span className="font-semibold">{activeEst} активных</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">{inReviewEst} заявки</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">GMV Оборот</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-emerald-700 font-mono">
              {(totalGmv / 1000000).toFixed(2)}M ₽
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              За весь период сети
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Комиссия сервиса</span>
            <CircleDollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-amber-700 font-mono">
              {Math.round(totalCommission).toLocaleString('ru-RU')} ₽
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Средняя ставка: ~9.2%
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">К выплате партнерам</span>
            <HandCoins className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-sky-700 font-mono">
              {Math.round(pendingPayoutTotal).toLocaleString('ru-RU')} ₽
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              В расчете: {readyPayoutsQueue.length} заведений
            </div>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Заморожено (Риски)</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-rose-700 font-mono">
              {Math.round(frozenPayoutTotal).toLocaleString('ru-RU')} ₽
            </div>
            <div className="text-[11px] text-rose-600 font-semibold mt-0.5">
              {urgentRisks.length} активных флага
            </div>
          </div>
        </div>

        {/* KPI 6 */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Заблокировано</span>
            <Ban className="w-4 h-4 text-red-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-red-700 font-mono">{blockedEst}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Заведений со stop operations
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Charts (GMV Trend + Branch Geography) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Динамика выручки (GMV) и комиссии платформы
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Посуточный объем заказов через приложение клиента и QR на столах
              </p>
            </div>
            <span className="text-xs font-mono text-indigo-700 font-semibold px-2.5 py-1 rounded bg-indigo-50 border border-indigo-200">
              +18.4% к прошлой неделе
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={gmvTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorFee" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="period" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={v => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${value.toLocaleString()} ₽`, '']}
                />
                <Area type="monotone" dataKey="gmv" name="Оборот (GMV)" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGmv)" />
                <Area type="monotone" dataKey="fee" name="Комиссия сервиса" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorFee)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Breakdown */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">География сети и статус точек</h3>
              <p className="text-xs text-slate-500 mt-0.5">Распределение по ключевым регионам РФ</p>
            </div>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityDistributionData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="city" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="active" name="Активные" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="inReview" name="На проверке" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="risks" name="Риски" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Всего регионов присутствия: 4</span>
            <button
              onClick={() => navigateTo('branches')}
              className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Справочник точек</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Actionable Task Queues (Role specific queues) & Urgent Attention Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Queue 1: Applications awaiting moderation */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Inbox className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Очередь онбординга новых заведений</h3>
                <p className="text-xs text-slate-500">Заявки, требующие проверки юристом и менеджером</p>
              </div>
            </div>
            <button
              onClick={() => navigateTo('applications')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
            >
              <span>Все заявки</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 flex-1">
            {pendingAppsQueue.slice(0, 3).map(app => (
              <div
                key={app.id}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs hover:border-slate-300 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900">{app.brandName}</span>
                    <span className="text-[11px] text-slate-500">({app.legalName})</span>
                    {app.isDuplicateSuspected && (
                      <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.2 rounded border border-rose-200 font-semibold">
                        Подозрение на дубликат
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                    <span>ИНН: {app.inn}</span>
                    <span>•</span>
                    <span>{app.city}</span>
                    <span>•</span>
                    <span>Ответственный: {app.assignedTo}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge type="application" status={app.status} />
                  <button
                    onClick={() => navigateTo('applications', app.id)}
                    className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors shadow-2xs"
                  >
                    Проверить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Queue 2: Urgent Risk Incidents & Compliance Cases */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Требуют внимания: Риски и инциденты</h3>
                <p className="text-xs text-slate-500">Претензии ФНС, срывы SLA, подозрения на фрод</p>
              </div>
            </div>
            <button
              onClick={() => navigateTo('risks')}
              className="text-xs text-rose-700 hover:text-rose-900 font-semibold flex items-center gap-1"
            >
              <span>Все риски</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 flex-1">
            {urgentRisks.slice(0, 3).map(rc => (
              <div
                key={rc.id}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs hover:border-slate-300 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-rose-700">{rc.id}: {rc.establishmentName}</span>
                    <StatusBadge type="risk" status={rc.level} />
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 truncate max-w-sm">
                    {rc.description}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigateTo('risks')}
                    className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold transition-colors shadow-2xs"
                  >
                    Решение
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Recent Live Orders Stream */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-sky-600" />
              Последние операционные заказы по сети
            </h3>
            <p className="text-xs text-slate-500">Мониторинг соблюдения времени сборки и выдачи в реальном времени</p>
          </div>
          <button
            onClick={() => navigateTo('orders')}
            className="text-xs text-sky-700 hover:text-sky-900 font-semibold flex items-center gap-1"
          >
            <span>Реестр заказов</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Номер</th>
                <th className="py-2.5 px-3">Заведение / Точка</th>
                <th className="py-2.5 px-3">Канал</th>
                <th className="py-2.5 px-3">Состав</th>
                <th className="py-2.5 px-3 text-right">Сумма</th>
                <th className="py-2.5 px-3 text-right">Комиссия</th>
                <th className="py-2.5 px-3">Статус</th>
                <th className="py-2.5 px-3">SLA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {orders.slice(0, 5).map(ord => (
                <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{ord.orderNumber}</td>
                  <td className="py-2.5 px-3">
                    <div className="font-medium text-slate-900">{ord.establishmentName}</div>
                    <div className="text-[11px] text-slate-500">{ord.branchName}</div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {ord.channel === 'mobile_app' ? 'Приложение' : ord.channel === 'qr_table' ? 'QR Стол' : 'QR Навынос'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 max-w-xs truncate">
                    {ord.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {ord.totalAmount} ₽
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium text-emerald-700">
                    +{ord.platformCommission.toFixed(1)} ₽
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge type="order" status={ord.status} />
                  </td>
                  <td className="py-2.5 px-3">
                    {ord.slaBreached ? (
                      <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        ⚠️ Нарушен
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ✓ В норме
                      </span>
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
