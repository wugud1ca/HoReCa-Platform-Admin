import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RiskLevel, RiskCase } from '../../types';
import { X, ShieldAlert } from 'lucide-react';

interface CreateRiskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateRiskModal: React.FC<CreateRiskModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { createRiskCase, establishments, navigateTo } = useApp();

  const [estId, setEstId] = useState(establishments[0]?.id || '');
  const [level, setLevel] = useState<RiskLevel>('high');
  const [category, setCategory] = useState<RiskCase['category']>('sla_breach');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const selectedEst = establishments.find(e => e.id === estId);
    if (!selectedEst) return;

    createRiskCase({
      establishmentId: selectedEst.id,
      establishmentName: selectedEst.brandName,
      level,
      category,
      description: description.trim(),
    });

    onClose();
    navigateTo('risks');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h3 className="text-base font-bold text-slate-900">Фиксация инцидента риска</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-slate-700 font-medium block mb-1">Заведение:*</label>
            <select
              value={estId}
              onChange={e => setEstId(e.target.value)}
              className="w-full p-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            >
              {establishments.map(e => (
                <option key={e.id} value={e.id}>{e.brandName} ({e.legalName}, ИНН: {e.inn})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-medium block mb-1">Уровень риска:</label>
              <select
                value={level}
                onChange={e => setLevel(e.target.value as RiskLevel)}
                className="w-full p-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              >
                <option value="critical">Критический</option>
                <option value="high">Высокий</option>
                <option value="medium">Средний</option>
                <option value="low">Низкий</option>
              </select>
            </div>

            <div>
              <label className="text-slate-700 font-medium block mb-1">Категория:</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as RiskCase['category'])}
                className="w-full p-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              >
                <option value="tax_risk">Проверки ФНС / Налоги</option>
                <option value="high_chargeback">Чарджбэки и возвраты</option>
                <option value="sla_breach">Срывы SLA и таймингов</option>
                <option value="financial_fraud">Подозрения на фрод</option>
                <option value="customer_complaints">Жалобы клиентов</option>
                <option value="legal_sanction">Юридические санкции</option>
                <option value="license_expired">Истекли лицензии</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-700 font-medium block mb-1">Фабула / Суть инцидента:*</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Опишите обнаруженные нарушения, блокировки счетов или срывы регламентов..."
              className="w-full p-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              Зафиксировать кейс
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
