import React, { useState } from 'react';
import { Establishment, Branch, PwaSettings } from '../../../types';
import { useApp } from '../../../context/AppContext';
import {
  QrCode,
  Smartphone,
  CreditCard,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Flame,
  CheckCircle2,
  Percent,
  Sliders,
  DollarSign
} from 'lucide-react';

interface PwaAcquiringTabProps {
  establishment: Establishment;
}

export const PwaAcquiringTab: React.FC<PwaAcquiringTabProps> = ({ establishment }) => {
  const { simulatePwaGuestOrder, updatePwaSettings, bumpKdsOrder } = useApp();
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    establishment.branches[0]?.id || ''
  );
  const [tableNumber, setTableNumber] = useState<number>(4);
  const [copiedLink, setCopiedLink] = useState(false);

  // Quick simulator state
  const [selectedItemIdx, setSelectedItemIdx] = useState<number>(0);
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulatedOrderNum, setSimulatedOrderNum] = useState<string | null>(null);

  const currentBranch =
    establishment.branches.find(b => b.id === selectedBranchId) ||
    establishment.branches[0];

  const pwaSettings: PwaSettings = currentBranch?.pwaSettings || {
    qrTableEnabled: true,
    qrTakeawayEnabled: true,
    accentColor: '#4f46e5',
    logoUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=120',
    welcomeMessage: 'Добро пожаловать! Заказывайте без очередей.',
    bannerText: 'Скидка 10% на первый заказ через СБП',
    tipPercentages: [5, 10, 15],
    minOrderAmount: 0,
    acquiringProvider: 'sbp_agent',
    acquiringFeeRate: establishment.commercialTerms.commissionRate,
  };

  const pwaUrl = `https://order.horeca.app/${establishment.id}/${selectedBranchId}?table=${tableNumber}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(pwaUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCreateTestOrder = () => {
    if (!establishment.menuItems || establishment.menuItems.length === 0) return;
    const menuItem = establishment.menuItems[selectedItemIdx] || establishment.menuItems[0];
    setIsSimulating(true);

    setTimeout(() => {
      const order = simulatePwaGuestOrder(
        establishment.id,
        selectedBranchId,
        [
          {
            name: menuItem.name,
            quantity: itemQuantity,
            price: menuItem.price,
          },
        ],
        tableNumber,
        'qr_table'
      );
      setIsSimulating(false);
      setSimulatedOrderNum(order.orderNumber);
    }, 400);
  };

  const menuItems = establishment.menuItems || [];

  return (
    <div className="space-y-6 text-xs">
      {/* Header Info Banner: Agent Business Model */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-sky-50 border border-indigo-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-bold text-[10px] tracking-wide uppercase">
              Агентский эквайринг и PWA
            </span>
            <span className="font-semibold text-slate-900 text-sm">HoReCa Order PWA</span>
          </div>
          <p className="text-slate-600 text-xs max-w-2xl leading-relaxed">
            Гости переходят по QR-коду в веб-приложение, заказывают и оплачивают через наш шлюз{' '}
            <strong className="text-indigo-900">СБП / Эквайринга</strong>. Мы выступаем Агентом заведения:
            принимаем платежи, удерживаем агентскую комиссию ({establishment.commercialTerms.commissionRate}%) и
            передаем заказы в реальном времени на кухонные экраны <strong className="text-indigo-900">KDS 2 Remix</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 rounded-lg bg-white border border-indigo-200 text-center shadow-2xs">
            <div className="text-[10px] text-slate-500">Комиссия Агента</div>
            <div className="text-sm font-bold font-mono text-indigo-700">
              {establishment.commercialTerms.commissionRate}%
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-center shadow-2xs">
            <div className="text-[10px] text-emerald-700 font-semibold">СБП Эквайринг</div>
            <div className="text-xs font-bold text-emerald-800">0 сек холд • ФЗ-54</div>
          </div>
        </div>
      </div>

      {/* Branch Selector */}
      {establishment.branches.length > 1 && (
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <span className="text-slate-600 font-medium px-2">Точка обслуживания:</span>
          {establishment.branches.map(br => (
            <button
              key={br.id}
              onClick={() => setSelectedBranchId(br.id)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                selectedBranchId === br.id
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {br.name}
            </button>
          ))}
        </div>
      )}

      {/* Main Grid: Left QR & Simulator, Right PWA & Acquiring Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 1: QR & Live Guest Simulator */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">QR-коды и витрина гостя</h3>
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              ✓ Витрина онлайн
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {/* Visual QR Card */}
            <div className="w-32 h-32 bg-white p-2.5 rounded-xl border-2 border-slate-900 shadow-sm flex flex-col items-center justify-between shrink-0">
              <div className="text-[9px] font-bold tracking-wider text-slate-800 uppercase">
                {establishment.brandName}
              </div>
              <div className="w-20 h-20 bg-slate-900 flex items-center justify-center rounded-lg p-1 text-white">
                <QrCode className="w-16 h-16 text-white" />
              </div>
              <div className="text-[9px] font-mono font-bold text-indigo-700">
                Стол #{tableNumber}
              </div>
            </div>

            <div className="space-y-2.5 flex-1 min-w-0">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Номер стола для генерации QR:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={tableNumber}
                    onChange={e => setTableNumber(Number(e.target.value))}
                    className="w-20 p-1.5 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 text-center focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[11px] text-slate-500">или Навынос (Takeaway)</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-500">Прямая ссылка на PWA заказ:</span>
                <div className="mt-1 flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={pwaUrl}
                    className="w-full p-1.5 rounded-lg bg-white border border-slate-300 text-[11px] font-mono text-slate-700"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 shrink-0 transition-colors"
                    title="Скопировать ссылку"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Guest Order Simulator */}
          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Эмулятор гостя: Тестовый заказ через PWA (СБП)</span>
              </div>
              <span className="text-[10px] text-indigo-700 font-mono">1-Click Test</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Проверьте сквозную цепочку: оплата через СБП Агента ➔ моментальная фискализация ➔ автоматическая передача заказа на станцию KDS 2 Remix.
            </p>

            {menuItems.length > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-[10px] text-slate-600 font-medium block mb-0.5">Выберите блюдо:</label>
                    <select
                      value={selectedItemIdx}
                      onChange={e => setSelectedItemIdx(Number(e.target.value))}
                      className="w-full p-1.5 rounded-lg bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-indigo-500"
                    >
                      {menuItems.map((item, idx) => (
                        <option key={item.id} value={idx} disabled={item.isStopList}>
                          {item.name} — {item.price} ₽ {item.isStopList ? '(СТОП-ЛИСТ)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 font-medium block mb-0.5">Кол-во:</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={itemQuantity}
                      onChange={e => setItemQuantity(Number(e.target.value))}
                      className="w-full p-1.5 rounded-lg bg-white border border-slate-300 text-slate-800 text-center font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-slate-700">
                    Сумма заказа:{' '}
                    <strong className="text-slate-900 font-mono">
                      {((menuItems[selectedItemIdx]?.price || 0) * itemQuantity)} ₽
                    </strong>
                    <span className="text-emerald-700 text-[10px] ml-1 font-mono">
                      (+{(((menuItems[selectedItemIdx]?.price || 0) * itemQuantity * establishment.commercialTerms.commissionRate) / 100).toFixed(1)} ₽ комиссия)
                    </span>
                  </div>

                  <button
                    onClick={handleCreateTestOrder}
                    disabled={isSimulating}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>{isSimulating ? 'Оплата СБП...' : 'Оплатить по СБП и отправить в KDS'}</span>
                  </button>
                </div>

                {simulatedOrderNum && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-[11px] animate-in fade-in">
                    <span className="font-semibold">✓ Заказ {simulatedOrderNum} успешно создан и передан в KDS 2 Remix!</span>
                    <span className="text-slate-500 font-mono text-[10px]">RRN: SBP-AUTOTEST</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-slate-500 italic py-1">Меню заведения еще не заполнено</div>
            )}
          </div>
        </div>

        {/* Card 2: PWA Settings & Acquiring Config */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Параметры витрины PWA и Эквайринга</h3>
            </div>
            <span className="font-mono text-slate-500 text-[11px]">Шлюз: СБП Агент</span>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-600 font-medium block mb-1">Приветственное сообщение:</label>
                <input
                  type="text"
                  defaultValue={pwaSettings.welcomeMessage}
                  className="w-full p-2 rounded-lg border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-slate-600 font-medium block mb-1">Промо-баннер в PWA:</label>
                <input
                  type="text"
                  defaultValue={pwaSettings.bannerText}
                  className="w-full p-2 rounded-lg border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-600 font-medium block mb-1">Минимальный чек:</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    defaultValue={pwaSettings.minOrderAmount || 0}
                    className="w-full p-2 rounded-lg border border-slate-300 text-slate-900 text-xs font-mono"
                  />
                  <span className="text-slate-500 -ml-6">₽</span>
                </div>
              </div>
              <div>
                <label className="text-slate-600 font-medium block mb-1">Опции чаевых гостя:</label>
                <input
                  type="text"
                  defaultValue={pwaSettings.tipPercentages?.join(', ') || '5, 10, 15'}
                  className="w-full p-2 rounded-lg border border-slate-300 text-slate-900 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-slate-600 font-medium block mb-1">Каналы обслуживания:</label>
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                    Столы + Навынос
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                Шлюз интернет-эквайринга и фискализации
              </h4>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-600">Провайдер эквайринга:</span>
                  <span className="font-bold text-slate-900">СБП (Национальная система платежных карт)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Эмитент фискальных чеков (ФЗ-54):</span>
                  <span className="font-bold text-indigo-700">Облачная касса Агента (HoReCa Agent Cloud)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Формирование выплат партнеру:</span>
                  <span className="font-medium text-slate-800">Еженедельный автоматический взаимозачет</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Агентское вознаграждение с чека:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {establishment.commercialTerms.commissionRate}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
