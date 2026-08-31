import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EstablishmentType } from '../../types';
import { X, Store, Plus } from 'lucide-react';

interface CreateEstablishmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateEstablishmentModal: React.FC<CreateEstablishmentModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { createEstablishment, navigateTo } = useApp();

  const [brandName, setBrandName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [inn, setInn] = useState('');
  const [kpp, setKpp] = useState('');
  const [ogrn, setOgrn] = useState('');
  const [city, setCity] = useState('Москва');
  const [address, setAddress] = useState('');
  const [type, setType] = useState<EstablishmentType>('coffee_shop');
  const [commissionRate, setCommissionRate] = useState(9.0);
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('+7 (9');
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName || !inn || !legalName) return;

    const newEst = createEstablishment({
      brandName,
      legalName,
      inn,
      kpp: kpp || undefined,
      ogrn: ogrn || '1237700000000',
      type,
      city,
      contactPerson: contactPerson || 'Управляющий',
      phone: phone || '+7 (999) 000-00-00',
      email: email || `${brandName.toLowerCase().replace(/\s+/g, '')}@horeca.ru`,
      bankDetails: {
        bankName: 'ПАО Сбербанк',
        bik: '044525225',
        accountNumber: '40702810938000000000',
        corrAccount: '30101810400000000225',
        taxSystem: 'USN_INCOME',
      },
      commercialTerms: {
        type: 'agent',
        commissionRate: Number(commissionRate),
        fixedFeePerOrder: 0,
        minCommissionMonth: 0,
        payoutFrequency: 'biweekly',
        payoutBasis: 'orders_delivered',
        freezePayoutsOnRisk: true,
        validFrom: new Date().toISOString().substring(0, 10),
        contractNumber: `AG-${new Date().getFullYear()}/${Date.now().toString().slice(-4)}`,
        contractDate: new Date().toISOString().substring(0, 10),
        contractStatus: 'active',
      },
      operationalSettings: {
        orderModes: {
          preorder: true,
          onSite: true,
          takeaway: true,
          tableDelivery: false,
        },
        pickupMethod: 'order_number',
        slaPrepTimeMin: 7,
        slaAssemblyTimeMin: 12,
        orderAvailabilityWindows: '08:00 - 22:00',
        integrations: {
          cashRegister: 'iiko',
          crm: true,
          acquiring: 'sberbank',
          telegramBot: true,
          pushNotifications: true,
          smsNotifications: false,
        },
        autoStopRules: {
          maxUnprocessedOrders: 10,
          maxSlaBreachesPerHour: 5,
          stopOnPaymentErrorStreak: 3,
        },
      },
      branches: [
        {
          id: `br-${Date.now().toString().slice(-4)}`,
          establishmentId: '',
          name: `${brandName} — Главная`,
          address: address || `г. ${city}, ул. Центральная, д. 1`,
          city,
          workingHours: '08:00 - 22:00',
          status: 'active',
          isTemporarilyStopped: false,
          serviceChannels: {
            qrTable: true,
            qrTakeaway: true,
            counterOrder: true,
            delivery: false,
          },
          activeOrdersCount: 0,
          todayGmv: 0,
          managerName: contactPerson || 'Управляющий',
          managerPhone: phone || '+7 (999) 000-00-00',
        },
      ],
    });

    onClose();
    navigateTo('establishments', newEst.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-xl w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Создание заведения (Прямое добавление)</h3>
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
                placeholder="Surf Coffee, Rockets Roasters..."
                className="w-full p-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-slate-700 font-medium block mb-1">Юридическое лицо:*</label>
              <input
                type="text"
                required
                value={legalName}
                onChange={e => setLegalName(e.target.value)}
                placeholder="ООО 'Кофе Инвестментс'"
                className="w-full p-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-700 font-medium block mb-1">ИНН:*</label>
              <input
                type="text"
                required
                value={inn}
                onChange={e => setInn(e.target.value)}
                placeholder="7701928374"
                className="w-full p-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-slate-700 font-medium block mb-1">КПП:</label>
              <input
                type="text"
                value={kpp}
                onChange={e => setKpp(e.target.value)}
                placeholder="770101001"
                className="w-full p-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-slate-700 font-medium block mb-1">ОГРН:</label>
              <input
                type="text"
                value={ogrn}
                onChange={e => setOgrn(e.target.value)}
                placeholder="1197746000000"
                className="w-full p-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
              <label className="text-slate-700 font-medium block mb-1">Комиссия сервиса (%):</label>
              <input
                type="number"
                step="0.1"
                value={commissionRate}
                onChange={e => setCommissionRate(Number(e.target.value))}
                className="w-full p-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-medium block mb-1">Город присутствия:</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full p-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-slate-700 font-medium block mb-1">Адрес флагманской точки:</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="ул. Никольская, 10"
                className="w-full p-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 mb-2">Контакты управляющего</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="text-slate-700 font-medium block mb-1">ФИО:</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={e => setContactPerson(e.target.value)}
                  placeholder="Смирнов Алексей"
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
                  placeholder="manager@brand.ru"
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
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              Зарегистрировать заведение
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
