import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Shield,
  CreditCard,
  Bell,
  Save,
  RotateCcw,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

export const SystemSettingsView: React.FC = () => {
  const { settings, updateSettings, showToast, resetAllData } = useApp();

  const [formState, setFormState] = useState(settings);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formState);
    showToast({
      type: 'success',
      title: 'Настройки сохранены',
      message: 'Параметры платформы успешно обновлены.',
    });
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Администрирование</span>
            <span>/</span>
            <span className="text-indigo-600 font-medium">Системные параметры</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2.5">
            Глобальные финансовые и операционные настройки
          </h1>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Сохранить изменения</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Commission & Tariffs */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            Базовые тарифы и финансовые пороги
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Базовая ставка комиссии сервиса по умолчанию (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={formState.platformDefaultCommission}
                onChange={e =>
                  setFormState({ ...formState, platformDefaultCommission: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Минимальная сумма агентского вознаграждения в месяц (руб)
              </label>
              <input
                type="number"
                value={formState.minCommissionRub}
                onChange={e =>
                  setFormState({ ...formState, minCommissionRub: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Порог двойного согласования выплат (руб)
              </label>
              <input
                type="number"
                value={formState.requireDualApprovalForPayoutOver}
                onChange={e =>
                  setFormState({ ...formState, requireDualApprovalForPayoutOver: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Срок холда выплат при фиксации риска (дней)
              </label>
              <input
                type="number"
                value={formState.payoutHoldDaysOnRisk}
                onChange={e =>
                  setFormState({ ...formState, payoutHoldDaysOnRisk: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Operational Filters */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-600" />
            Автоматическая приостановка и лимиты
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Порог необработанных заказов для автостопа точки
              </label>
              <input
                type="number"
                value={formState.autoStopOrdersThreshold}
                onChange={e =>
                  setFormState({
                    ...formState,
                    autoStopOrdersThreshold: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Порог балла риска для автоблокировки
              </label>
              <input
                type="number"
                value={formState.autoRiskThresholdScore}
                onChange={e =>
                  setFormState({
                    ...formState,
                    autoRiskThresholdScore: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Maintenance & Reset */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">Сброс состояния до заводского демо</div>
            <div className="text-xs text-slate-500 mt-0.5">
              Восстанавливает исходный набор заведений, заявок и транзакций
            </div>
          </div>

          <button
            type="button"
            onClick={resetAllData}
            className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-amber-800 hover:text-amber-900 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-300 shadow-2xs self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Сбросить демо</span>
          </button>
        </div>
      </form>
    </div>
  );
};
