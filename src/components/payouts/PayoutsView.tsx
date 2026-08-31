import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { hasPermission } from '../../lib/permissions';
import { PartnerPayout } from '../../types';
import {
  HandCoins,
  Search,
  CheckCircle2,
  Lock,
  Unlock,
  AlertTriangle,
  FileSpreadsheet,
  Building2,
  Calendar,
  CreditCard,
  CircleDollarSign,
  ArrowRight,
  TrendingDown,
  Percent,
  X,
  Sparkles,
  Edit3,
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { ExportButton } from '../common/ExportButton';

export const PayoutsView: React.FC = () => {
  const {
    payouts,
    establishments,
    currentUser,
    approvePayout,
    freezePayout,
    executePayoutPayment,
    calculatePayoutsForPeriod,
    adjustPayout,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPayout, setSelectedPayout] = useState<PartnerPayout | null>(null);

  // Freeze Modal State
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
  const [freezeReasonInput, setFreezeReasonInput] = useState('');

  // Payment Execution Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [paymentDocInput, setPaymentDocInput] = useState('');

  // Adjustment Modal State
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustAmountInput, setAdjustAmountInput] = useState<number>(0);
  const [adjustReasonInput, setAdjustReasonInput] = useState('');

  const filteredPayouts = payouts.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      p.establishmentName.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.period.toLowerCase().includes(q);

    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchQuery && matchStatus;
  });

  const totalCalculated = payouts
    .filter(p => p.status === 'calculated' || p.status === 'ready_to_pay' || p.status === 'approved')
    .reduce((acc, curr) => acc + curr.finalPayoutAmount, 0);

  const totalFrozen = payouts
    .filter(p => p.status === 'frozen_by_risk' || p.isFrozen)
    .reduce((acc, curr) => acc + curr.finalPayoutAmount, 0);

  const totalPaid = payouts
    .filter(p => p.status === 'paid')
    .reduce((acc, curr) => acc + curr.finalPayoutAmount, 0);

  const exportData = filteredPayouts.map(p => ({
    'ID Реестра': p.id,
    'Заведение': p.establishmentName,
    'Период': p.period,
    'Заказов': p.ordersCount,
    'Оборот GMV (₽)': p.totalGmv,
    'Комиссия сервиса (₽)': p.platformFeeAmount,
    'Ставка комиссии (%)': p.platformFeeRate,
    'Корректировки (₽)': p.adjustmentsAmount,
    'Сумма к перечислению (₽)': p.finalPayoutAmount,
    'Статус': p.status,
    'Срок выплаты': p.dueDate,
    'Номер ПП': p.paymentDocNumber || '',
    'Причина заморозки': p.frozenReason || '',
  }));

  const handleConfirmFreeze = () => {
    if (!selectedPayout) return;
    freezePayout(selectedPayout.id, freezeReasonInput || 'Заморожено службой финансового контроля');
    setIsFreezeModalOpen(false);
    setSelectedPayout({
      ...selectedPayout,
      status: 'frozen_by_risk',
      isFrozen: true,
      frozenReason: freezeReasonInput,
    });
  };

  const handleConfirmPayment = () => {
    if (!selectedPayout) return;
    const docNo = paymentDocInput || `ПП-${Date.now().toString().slice(-5)}`;
    executePayoutPayment(selectedPayout.id, docNo);
    setIsPayModalOpen(false);
    setSelectedPayout({
      ...selectedPayout,
      status: 'paid',
      isFrozen: false,
      paymentDocNumber: docNo,
      paidDate: new Date().toISOString().substring(0, 10),
    });
  };

  const handleConfirmAdjustment = () => {
    if (!selectedPayout) return;
    adjustPayout(selectedPayout.id, Number(adjustAmountInput), adjustReasonInput);
    setIsAdjustModalOpen(false);
    setSelectedPayout({
      ...selectedPayout,
      adjustmentsAmount: Number(adjustAmountInput),
      adjustmentsReason: adjustReasonInput,
      finalPayoutAmount: Math.max(0, selectedPayout.totalGmv - selectedPayout.platformFeeAmount + Number(adjustAmountInput)),
    });
  };

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Финансы и расчеты</span>
            <span>/</span>
            <span className="text-indigo-600 font-medium">Агентские выплаты</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2.5">
            Реестры агентских выплат и взаиморасчеты с партнерами
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hasPermission.canChangeFinancialTerms(currentUser.role) && (
            <button
              onClick={() => calculatePayoutsForPeriod('16.08.2026 - 31.08.2026')}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Сформировать реестры за период</span>
            </button>
          )}
          <ExportButton data={exportData} filename="horeca_payouts_registry.csv" label="Выгрузка в 1С / Банк" />
        </div>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">К перечислению (На проверке)</div>
            <div className="text-2xl font-bold font-mono text-sky-700 mt-1">
              {Math.round(totalCalculated).toLocaleString('ru-RU')} ₽
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Ожидают согласования финансиста</div>
          </div>
          <div className="p-3 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
            <HandCoins className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Заморожено по рискам</div>
            <div className="text-2xl font-bold font-mono text-rose-700 mt-1">
              {Math.round(totalFrozen).toLocaleString('ru-RU')} ₽
            </div>
            <div className="text-[11px] text-rose-600 mt-0.5">Приостановлено до решения инцидентов</div>
          </div>
          <div className="p-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
            <Lock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Успешно выплачено за период</div>
            <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
              {Math.round(totalPaid).toLocaleString('ru-RU')} ₽
            </div>
            <div className="text-[11px] text-emerald-600 mt-0.5">Платежные поручения исполнены</div>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto flex-1">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск по заведению, номеру, периоду..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Все статусы выплат ({payouts.length})</option>
            <option value="calculated">1. Рассчитано</option>
            <option value="ready_to_pay">2. Готово к выплате</option>
            <option value="approved">3. Утверждено финансистом</option>
            <option value="paid">4. Исполнено (Выплачено)</option>
            <option value="frozen_by_risk">🔒 Заморожено по риску</option>
          </select>
        </div>

        <div className="text-slate-500 self-end md:self-auto">
          Реестров: <span className="font-bold text-slate-900">{filteredPayouts.length}</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-3.5">ID / Период</th>
                <th className="py-3 px-3.5">Заведение</th>
                <th className="py-3 px-3.5 text-right">GMV Оборот</th>
                <th className="py-3 px-3.5 text-right">Комиссия сервиса</th>
                <th className="py-3 px-3.5 text-right">Корректировки</th>
                <th className="py-3 px-3.5 text-right">К выплате</th>
                <th className="py-3 px-3.5">Статус</th>
                <th className="py-3 px-3.5">Срок</th>
                <th className="py-3 px-3.5 text-right">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredPayouts.map(p => (
                <tr
                  key={p.id}
                  onClick={() => setSelectedPayout(p)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3.5">
                    <div className="font-mono font-bold text-slate-900">{p.id}</div>
                    <div className="text-[11px] text-slate-500">{p.period}</div>
                  </td>

                  <td className="py-3 px-3.5">
                    <div className="font-semibold text-slate-900">{p.establishmentName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">Заказов: {p.ordersCount}</div>
                  </td>

                  <td className="py-3 px-3.5 text-right font-mono text-slate-800">
                    {p.totalGmv.toLocaleString()} ₽
                  </td>

                  <td className="py-3 px-3.5 text-right font-mono text-rose-700 font-medium">
                    -{p.platformFeeAmount.toLocaleString()} ₽ ({p.platformFeeRate}%)
                  </td>

                  <td className="py-3 px-3.5 text-right font-mono text-slate-700">
                    {p.adjustmentsAmount > 0 ? `+${p.adjustmentsAmount.toLocaleString()}` : p.adjustmentsAmount.toLocaleString()} ₽
                  </td>

                  <td className="py-3 px-3.5 text-right font-mono font-bold text-emerald-700 text-sm">
                    {p.finalPayoutAmount.toLocaleString()} ₽
                  </td>

                  <td className="py-3 px-3.5">
                    <StatusBadge type="payout" status={p.status} />
                  </td>

                  <td className="py-3 px-3.5 font-mono text-slate-500 text-[11px]">
                    {p.dueDate}
                  </td>

                  <td className="py-3 px-3.5 text-right" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedPayout(p)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-[11px] border border-slate-300 transition-colors shadow-2xs"
                    >
                      Расчет
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout Details & Approval Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-slate-900">{selectedPayout.id}</span>
                  <StatusBadge type="payout" status={selectedPayout.status} />
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {selectedPayout.establishmentName} • Период {selectedPayout.period}
                </div>
              </div>
              <button
                onClick={() => setSelectedPayout(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Calculation Breakdown Formula */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                Акт сверки и детализация расчета
              </div>

              <div className="flex justify-between text-slate-700">
                <span>Общий оборот заказов (GMV, {selectedPayout.ordersCount} шт):</span>
                <span className="font-mono font-bold text-slate-900">{selectedPayout.totalGmv.toLocaleString()} ₽</span>
              </div>

              <div className="flex justify-between text-rose-700">
                <span>Комиссия сервиса ({selectedPayout.platformFeeRate}%):</span>
                <span className="font-mono font-bold">-{selectedPayout.platformFeeAmount.toLocaleString()} ₽</span>
              </div>

              {selectedPayout.adjustmentsAmount !== 0 && (
                <div className="flex justify-between text-amber-800">
                  <span>Корректировки / штрафы:</span>
                  <span className="font-mono">
                    {selectedPayout.adjustmentsAmount > 0 ? `+${selectedPayout.adjustmentsAmount}` : selectedPayout.adjustmentsAmount} ₽
                  </span>
                </div>
              )}

              {selectedPayout.adjustmentsReason && (
                <div className="text-[11px] text-slate-500 italic">
                  Основание корректировки: {selectedPayout.adjustmentsReason}
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-base text-emerald-700">
                <span>Итого к перечислению:</span>
                <span className="font-mono">{selectedPayout.finalPayoutAmount.toLocaleString()} ₽</span>
              </div>
            </div>

            {selectedPayout.frozenReason && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs">
                <div className="font-bold flex items-center gap-1 text-rose-700">
                  <AlertTriangle className="w-4 h-4" />
                  Причина заморозки:
                </div>
                <div className="mt-1">{selectedPayout.frozenReason}</div>
              </div>
            )}

            {selectedPayout.paymentDocNumber && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                <div className="font-bold">Платеж исполнен:</div>
                <div className="mt-0.5">Платежное поручение № <span className="font-mono font-bold">{selectedPayout.paymentDocNumber}</span> от {selectedPayout.paidDate}</div>
              </div>
            )}

            {/* Workflow Actions */}
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              {/* Adjust Payout Button */}
              {selectedPayout.status !== 'paid' && hasPermission.canAdjustPayout(currentUser.role) && (
                <button
                  onClick={() => {
                    setAdjustAmountInput(selectedPayout.adjustmentsAmount);
                    setAdjustReasonInput(selectedPayout.adjustmentsReason || '');
                    setIsAdjustModalOpen(true);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1 border border-slate-300 shadow-2xs transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Корректировать</span>
                </button>
              )}

              {/* Risk Freeze / Unfreeze */}
              {selectedPayout.status === 'frozen_by_risk' || selectedPayout.isFrozen ? (
                hasPermission.canApplyRiskStop(currentUser.role) && (
                  <button
                    onClick={() => {
                      approvePayout(selectedPayout.id);
                      setSelectedPayout({ ...selectedPayout, status: 'ready_to_pay', isFrozen: false, frozenReason: undefined });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Разморозить выплату</span>
                  </button>
                )
              ) : (
                hasPermission.canApplyRiskStop(currentUser.role) && selectedPayout.status !== 'paid' && (
                  <button
                    onClick={() => {
                      setFreezeReasonInput('');
                      setIsFreezeModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Заморозить (Риск)</span>
                  </button>
                )
              )}

              {/* Approve Payout */}
              {(selectedPayout.status === 'calculated' || selectedPayout.status === 'draft') && (
                hasPermission.canApprovePayout(currentUser.role) && (
                  <button
                    onClick={() => {
                      approvePayout(selectedPayout.id);
                      setSelectedPayout({ ...selectedPayout, status: 'ready_to_pay' });
                    }}
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 ml-auto transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Согласовать к выплате</span>
                  </button>
                )
              )}

              {/* Execute Payment in Bank */}
              {(selectedPayout.status === 'ready_to_pay' || selectedPayout.status === 'approved') && (
                hasPermission.canExecutePaymentDoc(currentUser.role) && (
                  <button
                    onClick={() => {
                      setPaymentDocInput(`ПП-${Date.now().toString().slice(-4)}`);
                      setIsPayModalOpen(true);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 ml-auto transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Исполнить платеж в банк</span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Adjust Modal */}
      {isAdjustModalOpen && selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Корректировка суммы реестра</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 block mb-1">Сумма корректировки (₽, со знаком + или -):</label>
                <input
                  type="number"
                  value={adjustAmountInput}
                  onChange={e => setAdjustAmountInput(Number(e.target.value))}
                  className="w-full p-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-slate-700 block mb-1">Основание / Причина корректировки:</label>
                <input
                  type="text"
                  value={adjustReasonInput}
                  onChange={e => setAdjustReasonInput(e.target.value)}
                  placeholder="Компенсация сбоя эквайринга, штраф за SLA..."
                  className="w-full p-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmAdjustment}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pay Modal */}
      {isPayModalOpen && selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Исполнение банковского платежа</h3>
            <p className="text-xs text-slate-500">
              Введите номер платежного поручения из банковской выписки / Клиент-Банка.
            </p>
            <input
              type="text"
              value={paymentDocInput}
              onChange={e => setPaymentDocInput(e.target.value)}
              placeholder="ПП-104928"
              className="w-full p-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs font-mono font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmPayment}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Подтвердить исполнение
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Freeze Reason Modal */}
      {isFreezeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Заморозка выплаты</h3>
            <p className="text-xs text-slate-500 mt-1">
              Укажите регламентную причину блокировки средств партнеру.
            </p>
            <textarea
              value={freezeReasonInput}
              onChange={e => setFreezeReasonInput(e.target.value)}
              placeholder="Причина заморозки (налоговая проверка, судебный арест счета, подозрение на фрод)..."
              className="w-full mt-3 p-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              rows={3}
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsFreezeModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmFreeze}
                disabled={!freezeReasonInput.trim()}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-semibold shadow-2xs transition-colors"
              >
                Заморозить средства
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
