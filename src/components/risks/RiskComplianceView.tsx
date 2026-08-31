import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { hasPermission } from '../../lib/permissions';
import { RiskCase, RiskLevel } from '../../types';
import {
  ShieldAlert,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Lock,
  Unlock,
  Building2,
  Calendar,
  User,
  ArrowRight,
  X,
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { ExportButton } from '../common/ExportButton';

interface RiskComplianceViewProps {
  onOpenCreateRiskModal: () => void;
}

export const RiskComplianceView: React.FC<RiskComplianceViewProps> = ({
  onOpenCreateRiskModal,
}) => {
  const {
    riskCases,
    currentUser,
    applyRiskActions,
    resolveRiskCase,
    setSelectedEstablishmentId,
    navigateTo,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCase, setSelectedCase] = useState<RiskCase | null>(null);

  // Resolution Modal State
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolutionNotesInput, setResolutionNotesInput] = useState('');

  // Sanctions Modal State
  const [isSanctionModalOpen, setIsSanctionModalOpen] = useState(false);
  const [stopOpsChecked, setStopOpsChecked] = useState(true);
  const [stopPayoutsChecked, setStopPayoutsChecked] = useState(true);
  const [sanctionReasonInput, setSanctionReasonInput] = useState('');

  const filteredCases = riskCases.filter(rc => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      rc.establishmentName.toLowerCase().includes(q) ||
      rc.id.toLowerCase().includes(q) ||
      rc.description.toLowerCase().includes(q) ||
      rc.responsibleUser.toLowerCase().includes(q);

    const matchLevel = levelFilter === 'all' || rc.level === levelFilter;
    const matchCategory = categoryFilter === 'all' || rc.category === categoryFilter;
    const matchStatus = statusFilter === 'all' || rc.status === statusFilter;

    return matchQuery && matchLevel && matchCategory && matchStatus;
  });

  const exportData = filteredCases.map(r => ({
    'ID Инцидента': r.id,
    'Дата': r.detectedAt,
    'Заведение': r.establishmentName,
    'Категория': r.category,
    'Уровень риска': r.level,
    'Статус': r.status,
    'Описание': r.description,
    'Ответственный': r.responsibleUser,
    'Решение': r.lawyerComment || '',
  }));

  const handleConfirmResolve = () => {
    if (!selectedCase) return;
    resolveRiskCase(selectedCase.id, resolutionNotesInput || 'Инцидент урегулирован');
    setIsResolveModalOpen(false);
    setSelectedCase({
      ...selectedCase,
      status: 'resolved',
      lawyerComment: resolutionNotesInput,
    });
  };

  const handleConfirmSanctions = () => {
    if (!selectedCase) return;
    applyRiskActions(
      selectedCase.id,
      stopOpsChecked,
      stopPayoutsChecked,
      sanctionReasonInput || 'Применены операционные санкции комплаенс'
    );
    setIsSanctionModalOpen(false);
    setSelectedCase({
      ...selectedCase,
      status: 'action_applied',
      isStopOperationsApplied: stopOpsChecked,
      isStopPayoutsApplied: stopPayoutsChecked,
      blockReason: sanctionReasonInput,
    });
  };

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Безопасность</span>
            <span>/</span>
            <span className="text-rose-600 font-medium">Центр комплаенс и рисков</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2.5">
            Управление рисками, инцидентами и операционными блокировками
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hasPermission.canInitiateRiskCase(currentUser.role) && (
            <button
              onClick={onOpenCreateRiskModal}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Зафиксировать инцидент</span>
            </button>
          )}
          <ExportButton data={exportData} filename="horeca_risk_cases.csv" label="Экспорт инцидентов" />
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
              placeholder="Поиск по заведению, причине..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <select
            value={levelFilter}
            onChange={e => setLevelFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 focus:outline-none focus:border-rose-500"
          >
            <option value="all">Все уровни риска</option>
            <option value="critical">Критический</option>
            <option value="high">Высокий</option>
            <option value="medium">Средний</option>
            <option value="low">Низкий</option>
          </select>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 focus:outline-none focus:border-rose-500"
          >
            <option value="all">Все категории инцидентов</option>
            <option value="tax_risk">Проверки ФНС / Налоги</option>
            <option value="high_chargeback">Чарджбэки и возвраты</option>
            <option value="sla_breach">Срывы SLA и таймингов</option>
            <option value="financial_fraud">Подозрения на фрод</option>
            <option value="customer_complaints">Жалобы клиентов</option>
            <option value="legal_sanction">Юридические санкции</option>
            <option value="license_expired">Истекли лицензии</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 focus:outline-none focus:border-rose-500"
          >
            <option value="all">Все статусы ({riskCases.length})</option>
            <option value="open">Открыт</option>
            <option value="action_applied">Ограничения наложены</option>
            <option value="under_investigation">На расследовании</option>
            <option value="resolved">Урегулирован (Закрыт)</option>
          </select>
        </div>

        <div className="text-slate-500 self-end md:self-auto">
          Кейсов: <span className="font-bold text-slate-900">{filteredCases.length}</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-3.5">ID / Дата</th>
                <th className="py-3 px-3.5">Заведение</th>
                <th className="py-3 px-3.5">Категория</th>
                <th className="py-3 px-3.5">Уровень риска</th>
                <th className="py-3 px-3.5">Описание инцидента</th>
                <th className="py-3 px-3.5">Статус</th>
                <th className="py-3 px-3.5">Ответственный</th>
                <th className="py-3 px-3.5 text-right">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredCases.map(rc => (
                <tr
                  key={rc.id}
                  onClick={() => setSelectedCase(rc)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3.5">
                    <div className="font-mono font-bold text-slate-900">{rc.id}</div>
                    <div className="text-[11px] text-slate-500">{rc.detectedAt}</div>
                  </td>

                  <td className="py-3 px-3.5">
                    <div className="font-semibold text-slate-900">{rc.establishmentName}</div>
                    <div className="font-mono text-[10px] text-slate-500">{rc.establishmentId}</div>
                  </td>

                  <td className="py-3 px-3.5 text-slate-700">
                    {rc.category === 'tax_risk'
                      ? 'ФНС / Налоги'
                      : rc.category === 'high_chargeback'
                      ? 'Чарджбэки'
                      : rc.category === 'sla_breach'
                      ? 'Срыв SLA'
                      : rc.category === 'financial_fraud'
                      ? 'Фрод'
                      : rc.category === 'customer_complaints'
                      ? 'Жалобы'
                      : 'Юридический'}
                  </td>

                  <td className="py-3 px-3.5">
                    <StatusBadge type="risk" status={rc.level} />
                  </td>

                  <td className="py-3 px-3.5 text-slate-700 max-w-sm">
                    <div className="truncate">{rc.description}</div>
                  </td>

                  <td className="py-3 px-3.5">
                    <span className={`px-2 py-0.5 rounded font-semibold text-[10px] border ${
                      rc.status === 'resolved'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : rc.status === 'action_applied'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {rc.status === 'resolved'
                        ? '✓ Закрыт'
                        : rc.status === 'action_applied'
                        ? 'Ограничен'
                        : 'В работе'}
                    </span>
                  </td>

                  <td className="py-3 px-3.5 text-slate-700">
                    {rc.responsibleUser}
                  </td>

                  <td className="py-3 px-3.5 text-right" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedCase(rc)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-[11px] border border-slate-300 transition-colors shadow-2xs"
                    >
                      Решение
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk Case Detail & Action Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-rose-700">{selectedCase.id}</span>
                  <StatusBadge type="risk" status={selectedCase.level} />
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {selectedCase.establishmentName} • Обнаружено: {selectedCase.detectedAt}
                </div>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="font-semibold text-slate-700">Фабула инцидента:</div>
              <p className="text-slate-800 leading-relaxed">{selectedCase.description}</p>
            </div>

            {selectedCase.lawyerComment && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                <div className="font-bold">Решение комплаенс:</div>
                <div className="mt-1">{selectedCase.lawyerComment}</div>
              </div>
            )}

            {/* Quick Link to Establishment */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <button
                onClick={() => {
                  setSelectedEstablishmentId(selectedCase.establishmentId);
                  navigateTo('establishments', selectedCase.establishmentId);
                }}
                className="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 font-medium transition-colors"
              >
                <span>Перейти в карточку заведения {selectedCase.establishmentName}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
              {selectedCase.status !== 'resolved' ? (
                <>
                  {hasPermission.canApplyRiskStop(currentUser.role) && (
                    <button
                      onClick={() => {
                        setSanctionReasonInput('');
                        setIsSanctionModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Применить ограничения</span>
                    </button>
                  )}

                  {hasPermission.canApplyRiskStop(currentUser.role) && (
                    <button
                      onClick={() => {
                        setResolutionNotesInput('');
                        setIsResolveModalOpen(true);
                      }}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 ml-auto transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Закрыть инцидент</span>
                    </button>
                  )}
                </>
              ) : (
                <span className="text-xs text-emerald-700 font-semibold">Инцидент полностью закрыт</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Apply Sanctions Modal */}
      {isSanctionModalOpen && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Ban className="w-5 h-5 text-rose-600" />
              Наложение ограничений по кейсу #{selectedCase.id}
            </h3>
            <p className="text-xs text-slate-500">
              Выберите меры воздействия на заведение {selectedCase.establishmentName}:
            </p>

            <div className="space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={stopOpsChecked}
                  onChange={e => setStopOpsChecked(e.target.checked)}
                  className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <span className="font-semibold">Stop Operations (Остановить прием заказов)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={stopPayoutsChecked}
                  onChange={e => setStopPayoutsChecked(e.target.checked)}
                  className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <span className="font-semibold">Stop Payouts (Заморозить агентские выплаты)</span>
              </label>

              <div>
                <label className="text-slate-700 block mb-1 text-xs font-medium">Основание / Причина:</label>
                <input
                  type="text"
                  value={sanctionReasonInput}
                  onChange={e => setSanctionReasonInput(e.target.value)}
                  placeholder="Превышение лимита чарджбэков, проверка ФНС..."
                  className="w-full p-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsSanctionModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmSanctions}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-2xs transition-colors"
              >
                Применить санкции
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Incident Modal */}
      {isResolveModalOpen && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Закрытие инцидента #{selectedCase.id}
            </h3>
            <p className="text-xs text-slate-500">
              Укажите итоги проверки и основание для снятия риска.
            </p>

            <textarea
              value={resolutionNotesInput}
              onChange={e => setResolutionNotesInput(e.target.value)}
              placeholder="Итоги проверки (документы предоставлены, штраф оплачен, замечания устранены)..."
              className="w-full p-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              rows={3}
            />

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsResolveModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmResolve}
                disabled={!resolutionNotesInput.trim()}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Подтвердить закрытие
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
