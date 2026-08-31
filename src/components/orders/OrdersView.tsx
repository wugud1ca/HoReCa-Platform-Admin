import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  RotateCcw,
  XCircle,
  Phone,
  User,
  MapPin,
  QrCode,
  Smartphone,
  CreditCard,
  AlertTriangle,
  X,
  ExternalLink,
  Receipt,
  Monitor,
  ChefHat
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { ExportButton } from '../common/ExportButton';

export const OrdersView: React.FC = () => {
  const {
    orders,
    establishments,
    updateOrderStatus,
    cancelOrder,
    bumpKdsOrder,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [stationFilter, setStationFilter] = useState<string>('all');
  const [estFilter, setEstFilter] = useState<string>('all');
  const [slaFilter, setSlaFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Cancellation modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReasonInput, setCancelReasonInput] = useState('');

  const filteredOrders = orders.filter(ord => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      ord.orderNumber.toLowerCase().includes(q) ||
      ord.establishmentName.toLowerCase().includes(q) ||
      ord.customerName.toLowerCase().includes(q) ||
      ord.customerPhone.includes(q) ||
      (ord.acquiringRrn && ord.acquiringRrn.toLowerCase().includes(q)) ||
      ord.items.some(i => i.name.toLowerCase().includes(q));

    const matchStatus = statusFilter === 'all' || ord.status === statusFilter;
    const matchChannel = channelFilter === 'all' || ord.channel === channelFilter;
    const matchStation = stationFilter === 'all' || ord.kdsStation === stationFilter;
    const matchEst = estFilter === 'all' || ord.establishmentId === estFilter;
    const matchSla =
      slaFilter === 'all'
        ? true
        : slaFilter === 'breached'
        ? ord.slaBreached
        : !ord.slaBreached;

    return matchQuery && matchStatus && matchChannel && matchStation && matchEst && matchSla;
  });

  const exportData = filteredOrders.map(o => ({
    'Номер заказа': o.orderNumber,
    'Дата': o.createdAt,
    'Заведение': o.establishmentName,
    'Точка': o.branchName,
    'Канал': o.channel,
    'RRN СБП': o.acquiringRrn || '—',
    'KDS Станция': o.kdsStation || 'kitchen',
    'Клиент': o.customerName,
    'Телефон': o.customerPhone,
    'Сумма (₽)': o.totalAmount,
    'Комиссия (₽)': o.platformCommission,
    'Статус': o.status,
    'Оплата': o.paymentMethod,
    'SLA Нарушен': o.slaBreached ? 'Да' : 'Нет',
  }));

  const handleApplyStatusChange = (newStatus: OrderStatus) => {
    if (!selectedOrder) return;
    updateOrderStatus(selectedOrder.id, newStatus);
    setSelectedOrder({ ...selectedOrder, status: newStatus });
  };

  const handleConfirmCancel = () => {
    if (!selectedOrder) return;
    cancelOrder(selectedOrder.id, cancelReasonInput || 'Отмена по запросу клиента');
    setIsCancelModalOpen(false);
    setSelectedOrder({ ...selectedOrder, status: 'cancelled' });
  };

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Операции</span>
            <span>/</span>
            <span className="text-indigo-600 font-medium">Реестр заказов</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2.5">
            Мониторинг PWA заказов, СБП Эквайринга и KDS 2 Remix
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton data={exportData} filename="horeca_orders.csv" label="Экспорт заказов" />
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
              placeholder="Поиск по №, RRN СБП, заведению, клиенту..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Все статусы ({orders.length})</option>
            <option value="created">Создан</option>
            <option value="paid">Оплачен</option>
            <option value="accepted">Принят заведением</option>
            <option value="preparing">Готовится на KDS</option>
            <option value="ready_for_pickup">Готов к выдаче</option>
            <option value="completed">Выдан (Завершен)</option>
            <option value="cancelled">Отменен</option>
            <option value="refunded">Возврат</option>
          </select>

          <select
            value={stationFilter}
            onChange={e => setStationFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Все KDS Станции</option>
            <option value="bar">☕ KDS Бар</option>
            <option value="kitchen">🍳 KDS Кухня</option>
            <option value="assembly">📦 KDS Сборка</option>
          </select>

          <select
            value={channelFilter}
            onChange={e => setChannelFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Все каналы</option>
            <option value="qr_table">PWA QR за столом</option>
            <option value="qr_takeaway">PWA QR навынос</option>
            <option value="mobile_app">Мобильное приложение</option>
          </select>

          <select
            value={slaFilter}
            onChange={e => setSlaFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Любой SLA</option>
            <option value="ok">В норме</option>
            <option value="breached">⚠️ Нарушен SLA</option>
          </select>
        </div>

        <div className="text-slate-500 self-end md:self-auto">
          Заказов: <span className="font-bold text-slate-900">{filteredOrders.length}</span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-3.5">Номер / Дата</th>
                <th className="py-3 px-3.5">Заведение / Точка</th>
                <th className="py-3 px-3.5">Канал / Стол</th>
                <th className="py-3 px-3.5">KDS Станция</th>
                <th className="py-3 px-3.5">Эквайринг СБП</th>
                <th className="py-3 px-3.5 text-right">Сумма</th>
                <th className="py-3 px-3.5 text-right">Комиссия Агента</th>
                <th className="py-3 px-3.5">Статус</th>
                <th className="py-3 px-3.5">SLA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    Заказов по заданным фильтрам не найдено
                  </td>
                </tr>
              ) : (
                filteredOrders.map(ord => (
                  <tr
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3.5">
                      <div className="font-mono font-bold text-slate-900">{ord.orderNumber}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{ord.createdAt}</div>
                    </td>

                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-slate-900">{ord.establishmentName}</div>
                      <div className="text-[11px] text-slate-500">{ord.branchName}</div>
                    </td>

                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        {ord.channel === 'mobile_app' ? (
                          <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                        ) : (
                          <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        <span>
                          {ord.channel === 'mobile_app'
                            ? 'Приложение'
                            : ord.channel === 'qr_table'
                            ? `PWA Стол #${ord.tableNumber || 1}`
                            : `PWA Навынос #${ord.pickupCode || '42'}`}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3.5">
                      <span className="px-2 py-0.5 rounded font-mono font-semibold text-[10px] bg-slate-100 text-slate-800 border border-slate-200">
                        {ord.kdsStation === 'bar' ? '☕ Бар' : ord.kdsStation === 'kitchen' ? '🍳 Кухня' : '📦 Сборка'}
                      </span>
                    </td>

                    <td className="py-3 px-3.5">
                      <div className="font-mono text-[11px] font-semibold text-emerald-700">
                        {ord.acquiringRrn ? ord.acquiringRrn : 'СБП-АКТИВЕН'}
                      </div>
                      <div className="text-[10px] text-slate-500">Чек ФЗ-54 сформирован</div>
                    </td>

                    <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900">
                      {ord.totalAmount} ₽
                    </td>

                    <td className="py-3 px-3.5 text-right font-mono font-medium text-emerald-700">
                      +{ord.platformCommission.toFixed(1)} ₽
                    </td>

                    <td className="py-3 px-3.5">
                      <StatusBadge type="order" status={ord.status} />
                    </td>

                    <td className="py-3 px-3.5">
                      {ord.slaBreached ? (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200 font-semibold">
                          ⚠️ Задержка
                        </span>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-medium">✓ В норме</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-slate-900">{selectedOrder.orderNumber}</span>
                  <StatusBadge type="order" status={selectedOrder.status} />
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {selectedOrder.establishmentName} • {selectedOrder.branchName}
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Guest & Channel & Acquiring Info */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500">Гость:</span>
                <div className="font-medium text-slate-900 mt-0.5">{selectedOrder.customerName}</div>
                <div className="text-[11px] text-slate-500 font-mono">{selectedOrder.customerPhone}</div>
              </div>
              <div>
                <span className="text-slate-500">Канал &amp; Станция:</span>
                <div className="text-slate-900 mt-0.5 font-medium">
                  {selectedOrder.channel === 'mobile_app'
                    ? 'Мобильное приложение'
                    : selectedOrder.channel === 'qr_table'
                    ? `PWA QR за столом #${selectedOrder.tableNumber}`
                    : `PWA Навынос (Код #${selectedOrder.pickupCode || '42'})`}
                </div>
                <div className="text-[11px] text-indigo-700 font-mono">
                  Станция: {selectedOrder.kdsStation === 'bar' ? 'Бар' : selectedOrder.kdsStation === 'kitchen' ? 'Кухня' : 'Сборка'}
                </div>
              </div>

              <div className="col-span-2 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                <div>
                  <span className="text-slate-500">RRN СБП: </span>
                  <span className="font-mono font-bold text-emerald-800">
                    {selectedOrder.acquiringRrn || 'SBP-991827461234'}
                  </span>
                </div>
                <a
                  href={selectedOrder.fiscalReceiptUrl || 'https://receipt.horeca.app/mock-fn-54'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Чек ФЗ-54 онлайн</span>
                </a>
              </div>
            </div>

            {/* Items Receipt */}
            <div className="space-y-2 text-xs">
              <div className="font-semibold text-slate-600 uppercase tracking-wider text-[10px]">
                Состав чека
              </div>
              <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                {selectedOrder.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between text-slate-800">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-slate-500 ml-1.5">x{item.quantity}</span>
                      {item.modifiers && item.modifiers.length > 0 && (
                        <div className="text-[11px] text-slate-500">{item.modifiers.join(', ')}</div>
                      )}
                    </div>
                    <div className="font-mono font-bold text-slate-900">{item.price * item.quantity} ₽</div>
                  </div>
                ))}

                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                  <span>Итого к оплате:</span>
                  <span className="font-mono text-indigo-700">{selectedOrder.totalAmount} ₽</span>
                </div>
                <div className="flex justify-between text-[11px] text-emerald-700 font-mono">
                  <span>Комиссия платформы:</span>
                  <span>+{selectedOrder.platformCommission.toFixed(1)} ₽</span>
                </div>
              </div>
            </div>

            {/* Status Transition Controls */}
            <div className="pt-2 space-y-2">
              <div className="text-[10px] font-semibold uppercase text-slate-600">
                Смена операционного статуса / KDS 2 Remix:
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => handleApplyStatusChange('preparing')}
                  className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 text-xs font-semibold shadow-2xs transition-colors"
                >
                  Готовится
                </button>
                <button
                  onClick={() => handleApplyStatusChange('ready_for_pickup')}
                  className="px-2.5 py-1 rounded bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-800 text-xs font-semibold shadow-2xs transition-colors"
                >
                  Готов к выдаче
                </button>
                <button
                  onClick={() => handleApplyStatusChange('completed')}
                  className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors"
                >
                  Выдан (Завершить)
                </button>
                {selectedOrder.status !== 'cancelled' && (
                  <button
                    onClick={() => setIsCancelModalOpen(true)}
                    className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 text-xs font-semibold shadow-2xs ml-auto transition-colors"
                  >
                    Отменить заказ
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Отмена заказа</h3>
            <p className="text-xs text-slate-500 mt-1">
              Укажите причину отмены. Средства будут автоматически поставлены на возврат клиенту по СБП.
            </p>
            <textarea
              value={cancelReasonInput}
              onChange={e => setCancelReasonInput(e.target.value)}
              placeholder="Причина отмены (нет ингредиентов, клиент отказался)..."
              className="w-full mt-3 p-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              rows={3}
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
              >
                Назад
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-2xs transition-colors"
              >
                Подтвердить отмену
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
