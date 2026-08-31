import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EstablishmentType, ServiceFormat } from '../../types';
import { X, Inbox, Plus, Building2 } from 'lucide-react';

interface CreateApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateApplicationModal: React.FC<CreateApplicationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { createApplication } = useApp();

  const [brandName, setBrandName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [inn, setInn] = useState('');
  const [city, setCity] = useState('Москва');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('+7 (9');
  const [email, setEmail] = useState('');
  const [type, setType] = useState<EstablishmentType>('coffee_shop');
  const [branchCount, setBranchCount] = useState(1);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName || !inn || !contactPerson) return;

    createApplication({
      brandName,
      legalName: legalName || `ООО "${brandName}"`,
      inn,
      city,
      type,
      branchCount: Number(branchCount),
      contactPerson,
      phone,
      email: email || `${brandName.toLowerCase().replace(/\s+/g, '')}@partner.horeca.ru`,
      source: 'website',
      legalForm: 'OOO',
      serviceFormat: 'mixed',
      attachedDocs: [
        { id: `doc-1`, title: 'Выписка из ЕГРЮЛ/ЕГРИП', type: 'egrul', verified: false },
        { id: `doc-2`, title: 'Карточка предприятия с реквизитами', type: 'bank_card', verified: false },
      ],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Inbox className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Новая заявка на онбординг</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-medium block mb-1">Коммерческий бренд:*</label>
              <input
                type="text"
                required
                value={brandName}
                onChange={e => setBrandName(e.target.value)}
                placeholder="Surf Coffee, Surf Bakery..."
                className="w-full p-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-slate-700 font-medium block mb-1">Юридическое лицо:</label>
              <input
                type="text"
                value={legalName}
                onChange={e => setLegalName(e.target.value)}
                placeholder="ООО 'Кофе Про', ИП Иванов..."
                className="w-full p-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-medium block mb-1">ИНН предприятия:*</label>
              <input
                type="text"
                required
                value={inn}
                onChange={e => setInn(e.target.value)}
                placeholder="7701234567"
                className="w-full p-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-slate-700 font-medium block mb-1">Город присутствия:</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Москва, Санкт-Петербург..."
                className="w-full p-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-medium block mb-1">Тип заведения:</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as EstablishmentType)}
                className="w-full p-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="coffee_shop">Кофейня (Спешелти/Сеть)</option>
                <option value="bakery">Пекарня / Кондитерская</option>
                <option value="restaurant">Ресторан / Бистро</option>
                <option value="dark_kitchen">Dark Kitchen (Цех доставки)</option>
                <option value="bar">Бар / Лаунж</option>
              </select>
            </div>

            <div>
              <label className="text-slate-700 font-medium block mb-1">Количество точек (филиалов):</label>
              <input
                type="number"
                min="1"
                max="100"
                value={branchCount}
                onChange={e => setBranchCount(Number(e.target.value))}
                className="w-full p-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 mb-2">Контактное лицо</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="text-slate-700 font-medium block mb-1">ФИО:*</label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={e => setContactPerson(e.target.value)}
                  placeholder="Иванов Петр"
                  className="w-full p-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">Телефон:</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full p-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="partner@mail.ru"
                  className="w-full p-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
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
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              Зарегистрировать заявку
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
