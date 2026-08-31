import React, { useState } from 'react';
import { Establishment, Order, KdsTerminal } from '../../../types';
import { useApp } from '../../../context/AppContext';
import {
  Monitor,
  ChefHat,
  Coffee,
  CheckCircle2,
  Clock,
  Key,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Laptop,
  Flame,
  Check,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { StatusBadge } from '../../common/StatusBadge';

interface KdsTerminalsTabProps {
  establishment: Establishment;
}

export const KdsTerminalsTab: React.FC<KdsTerminalsTabProps> = ({ establishment }) => {
  const { orders, bumpKdsOrder, updateOrderStatus } = useApp();
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    establishment.branches[0]?.id || ''
  );
  const [activeStationFilter, setActiveStationFilter] = useState<'all' | 'bar' | 'kitchen' | 'assembly' | 'delivery_screen'>('all');

  const currentBranch =
    establishment.branches.find(b => b.id === selectedBranchId) ||
    establishment.branches[0];

  const terminals: KdsTerminal[] = currentBranch?.kdsTerminals || [
    {
      id: 'term-bar-1',
      name: 'KDS Бар / Напитки',
      station: 'bar',
      stationType: 'bar',
      ipAddress: '192.168.1.41',
      isOnline: true,
      activeTicketsCount: 2,
      lastPingAt: '1 мин назад',
      appVersion: '2.4.1-remix',
    },
    {
      id: 'term-kitchen-1',
      name: 'KDS Горячий и Холодный цех',
      station: 'kitchen',
      stationType: 'kitchen',
      ipAddress: '192.168.1.42',
      isOnline: true,
      activeTicketsCount: 3,
      lastPingAt: 'Только что',
      appVersion: '2.4.1-remix',
    },
    {
      id: 'term-assembly-1',
      name: 'KDS Экран сборщика и выдачи',
      station: 'assembly',
      stationType: 'assembly',
      ipAddress: '192.168.1.43',
      isOnline: true,
      activeTicketsCount: 1,
      lastPingAt: '3 мин назад',
      appVersion: '2.4.1-remix',
    },
  ];

  // Orders linked to this establishment
  const branchOrders = orders.filter(
    o => o.establishmentId === establishment.id && o.branchId === selectedBranchId
  );

  // Active KDS tickets (accepted, preparing, ready_for_pickup)
  const activeKdsTickets = branchOrders.filter(
    o => o.status === 'accepted' || o.status === 'preparing' || o.status === 'ready_for_pickup'
  );

  const filteredTickets = activeKdsTickets.filter(o => {
    if (activeStationFilter === 'all') return true;
    return o.kdsStation === activeStationFilter;
  });

  const lkAccess = establishment.lkCafeAccess || {
    portalUrl: 'https://lk.horeca.app/login',
    loginUsername: establishment.email,
    assignedRoles: ['Управляющий', 'Старший Бариста', 'Шеф-повар'],
    lastLoginAt: 'Сегодня, 15:40',
    is2faActive: true,
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Header Banner: KDS 2 Remix & LK Cafe Overview */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-indigo-500 text-white font-bold text-[10px] uppercase">
              KDS 2 Remix & ЛК Кафе
            </span>
            <span className="font-semibold text-sm">Управление производством и выдачей по номеру</span>
          </div>
          <p className="text-slate-300 text-xs max-w-2xl leading-relaxed">
            Заказы с клиентских PWA мгновенно маршрутизируются на терминалы KDS (Кухня / Бар / Выдача).
            Персонал заведения отслеживает таймеры приготовления, а гости видят свой номер заказа на табло готовности.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-center">
            <div className="text-[10px] text-slate-300">Тикетов в работе</div>
            <div className="text-sm font-bold font-mono text-emerald-400">
              {activeKdsTickets.length} зак.
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-center">
            <div className="text-[10px] text-slate-300">Терминалов онлайн</div>
            <div className="text-sm font-bold font-mono text-indigo-300">
              {terminals.filter(t => t.isOnline).length} / {terminals.length}
            </div>
          </div>
        </div>
      </div>

      {/* Branch Selector if multiple */}
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

      {/* Grid: Terminals List & LK Cafe Credentials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Terminals list (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Подключенные экраны KDS 2 Remix</h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Протокол: WebSocket Real-time</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {terminals.map(term => (
              <div
                key={term.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-xs truncate">{term.name}</div>
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      term.isOnline ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-rose-500'
                    }`}
                    title={term.isOnline ? 'Онлайн' : 'Офлайн'}
                  />
                </div>

                <div className="space-y-1 text-[11px] text-slate-600">
                  <div className="flex justify-between">
                    <span>IP адрес:</span>
                    <span className="font-mono text-slate-800">{term.ipAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Версия KDS:</span>
                    <span className="font-mono text-indigo-700 font-semibold">{term.appVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Пинг:</span>
                    <span className="text-slate-500">{term.lastPingAt}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Активных тикетов:</span>
                  <span className="font-bold font-mono text-slate-900 px-1.5 py-0.5 rounded bg-white border border-slate-200">
                    {term.activeTicketsCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LK Cafe Access & Partner Account (1 col) */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Доступ в ЛК Кафе</h3>
            </div>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Активен
            </span>
          </div>

          <div className="space-y-3 text-[11px]">
            <div>
              <span className="text-slate-500">Логин администратора:</span>
              <div className="p-2 mt-1 rounded-lg bg-slate-50 border border-slate-200 font-mono font-medium text-slate-900 truncate">
                {lkAccess.loginUsername}
              </div>
            </div>

            <div>
              <span className="text-slate-500">Назначенные роли персонала:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {lkAccess.assignedRoles.map((role, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium text-[10px] border border-indigo-200"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>2FA Аутентификация:</span>
                <span className="font-semibold text-emerald-700">✓ Включена</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Последний вход:</span>
                <span className="text-slate-800">{lkAccess.lastLoginAt}</span>
              </div>
            </div>

            <a
              href={lkAccess.portalUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 w-full py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-center flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Открыть ЛК Кафе</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>
          </div>
        </div>
      </div>

      {/* Live KDS Screen Simulator: Active Orders in Kitchen */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Интерактивный экран KDS 2 Remix (Текущие тикеты)
              </h3>
              <p className="text-slate-500 text-[11px]">
                Нажмите на карточку заказа для перевода на следующий шаг приготовления
              </p>
            </div>
          </div>

          {/* Station Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveStationFilter('all')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                activeStationFilter === 'all'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Все цеха ({activeKdsTickets.length})
            </button>
            <button
              onClick={() => setActiveStationFilter('bar')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                activeStationFilter === 'bar'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ☕ Бар / Напитки
            </button>
            <button
              onClick={() => setActiveStationFilter('kitchen')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                activeStationFilter === 'kitchen'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🍳 Кухня
            </button>
            <button
              onClick={() => setActiveStationFilter('assembly')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                activeStationFilter === 'assembly'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📦 Сборка и Выдача
            </button>
          </div>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="py-10 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 opacity-80" />
            <div className="font-semibold text-slate-800 text-sm">Все заказы приготовлены и выданы!</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Оформите тестовый заказ на вкладке &quot;PWA & Эквайринг&quot;, чтобы увидеть его появление на экране KDS.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredTickets.map(ticket => {
              const isPreparing = ticket.status === 'preparing';
              const isAccepted = ticket.status === 'accepted';
              const isReady = ticket.status === 'ready_for_pickup';

              return (
                <div
                  key={ticket.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isReady
                      ? 'bg-emerald-50/50 border-emerald-300'
                      : isPreparing
                      ? 'bg-amber-50/40 border-amber-300'
                      : 'bg-indigo-50/40 border-indigo-200'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-base text-slate-900">
                        {ticket.orderNumber}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-white border border-slate-200 text-slate-700">
                        {ticket.channel === 'qr_table' ? `Стол #${ticket.tableNumber || 1}` : 'Навынос'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 font-mono text-[11px] text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{ticket.createdAt}</span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="py-2.5 space-y-1.5 text-slate-800">
                    {ticket.items.map(item => (
                      <div key={item.id} className="flex justify-between items-center text-xs">
                        <span className="font-medium">{item.name}</span>
                        <span className="font-mono font-bold text-slate-900 ml-2">x{item.quantity}</span>
                      </div>
                    ))}
                    {ticket.clientComment && (
                      <div className="text-[10px] text-indigo-700 bg-white/70 p-1.5 rounded border border-indigo-100 italic">
                        &quot;{ticket.clientComment}&quot;
                      </div>
                    )}
                  </div>

                  {/* Station & Status Action */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <div className="text-[10px] text-slate-500">
                      Станция:{' '}
                      <strong className="text-slate-800 uppercase font-mono">
                        {ticket.kdsStation === 'bar' ? 'Бар' : ticket.kdsStation === 'kitchen' ? 'Кухня' : 'Сборка'}
                      </strong>
                    </div>

                    <button
                      onClick={() => bumpKdsOrder(ticket.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold shadow-2xs transition-colors flex items-center gap-1 ${
                        isAccepted
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          : isPreparing
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {isAccepted && <span>Взять в работу ➔</span>}
                      {isPreparing && <span>Готово к выдаче ✓</span>}
                      {isReady && <span>Выдано гостю ✓</span>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
