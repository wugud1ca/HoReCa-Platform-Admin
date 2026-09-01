import React, { useState, useRef, useEffect } from 'react';
import { useApp, TimePeriod } from '../../context/AppContext';
import { ROLE_DEFINITIONS } from '../../lib/permissions';
import { UserRole } from '../../types';
import {
  Search,
  Plus,
  Bell,
  Calendar,
  RefreshCw,
  Menu,
  ShieldAlert,
  Inbox,
  HandCoins,
  ChevronDown,
  Sparkles,
  LogOut,
  User,
  KeyRound,
  ShieldCheck
} from 'lucide-react';

interface TopBarProps {
  setMobileOpen: (open: boolean) => void;
  onOpenCreateAppModal: () => void;
  onOpenCreateEstModal: () => void;
  onOpenCreateRiskModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  setMobileOpen,
  onOpenCreateAppModal,
  onOpenCreateEstModal,
  onOpenCreateRiskModal,
}) => {
  const {
    currentUser,
    switchUserRole,
    logout,
    timePeriod,
    setTimePeriod,
    setIsGlobalSearchOpen,
    applications,
    payouts,
    riskCases,
    navigateTo,
    calculatePayoutsForPeriod,
    resetAllData,
  } = useApp();

  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const roleMenuRef = useRef<HTMLDivElement>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setIsRoleMenuOpen(false);
      }
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setIsActionsMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleMeta = ROLE_DEFINITIONS[currentUser.role] || {
    title: currentUser.role,
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
    description: 'Пользователь системы'
  };

  // Urgent notifications
  const pendingApps = applications.filter(a => a.status === 'new' || a.status === 'in_verification');
  const activeRisks = riskCases.filter(r => r.status === 'open' || r.status === 'action_applied');
  const pendingPayouts = payouts.filter(p => p.status === 'ready_to_pay' || p.status === 'frozen_by_risk');
  const totalNotifications = pendingApps.length + activeRisks.length + pendingPayouts.length;

  const periods: { id: TimePeriod; label: string }[] = [
    { id: 'today', label: 'Сегодня' },
    { id: '7days', label: '7 дней' },
    { id: 'month', label: 'Месяц' },
    { id: 'quarter', label: 'Квартал' },
  ];

  const rolesList: UserRole[] = [
    'super_admin',
    'admin_manager',
    'moderator',
    'support',
    'demo_user'
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 flex items-center justify-between gap-3 shadow-2xs">
      {/* Left: Mobile Toggle & Global Search Trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <button
          onClick={() => setIsGlobalSearchOpen(true)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-500 hover:text-slate-800 hover:border-slate-400 transition-all text-xs w-48 sm:w-72 md:w-96 text-left group shadow-2xs"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
          <span className="truncate">Поиск по заведениям, ИНН, заказам, чекам...</span>
          <kbd className="hidden sm:inline-block ml-auto px-1.5 py-0.5 text-[10px] text-slate-500 bg-white rounded border border-slate-200 font-mono shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Period Switcher, Quick Actions, Notifications, Role Switcher */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Period Switcher */}
        <div className="hidden xl:flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-1" />
          {periods.map(p => (
            <button
              key={p.id}
              onClick={() => setTimePeriod(p.id)}
              className={`px-2.5 py-1 rounded-md transition-all text-[11px] ${
                timePeriod === p.id
                  ? 'bg-white text-emerald-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Quick Actions Dropdown */}
        <div className="relative" ref={actionsMenuRef}>
          <button
            onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Действие</span>
            <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-80" />
          </button>

          {isActionsMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[10px] uppercase font-mono font-bold text-slate-400 border-b border-slate-100">
                Быстрое создание
              </div>
              <button
                onClick={() => {
                  setIsActionsMenuOpen(false);
                  onOpenCreateAppModal();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors text-left"
              >
                <Inbox className="w-4 h-4 text-emerald-600" />
                <span>Новая заявка на подключение</span>
              </button>
              {(currentUser.role === 'super_admin' || currentUser.role === 'admin_manager' || currentUser.role === 'admin') && (
                <button
                  onClick={() => {
                    setIsActionsMenuOpen(false);
                    onOpenCreateEstModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-teal-50 hover:text-teal-800 transition-colors text-left"
                >
                  <Plus className="w-4 h-4 text-teal-600" />
                  <span>Создать карточку заведения</span>
                </button>
              )}
              <button
                onClick={() => {
                  setIsActionsMenuOpen(false);
                  onOpenCreateRiskModal();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-rose-50 hover:text-rose-800 transition-colors text-left"
              >
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Зафиксировать инцидент риска</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifMenuRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Очередь задач и уведомления"
          >
            <Bell className="w-4 h-4" />
            {totalNotifications > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white"></span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="font-semibold text-slate-900">Операционные задачи</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[10px] font-bold">
                  {totalNotifications} в работе
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {pendingApps.length > 0 && (
                  <div
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      navigateTo('applications');
                    }}
                    className="p-3 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-2.5"
                  >
                    <Inbox className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-slate-900">
                        {pendingApps.length} новых заявок на онбординг
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Требуется проверка юрлица и договоров
                      </div>
                    </div>
                  </div>
                )}
                {activeRisks.length > 0 && (
                  <div
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      navigateTo('risks');
                    }}
                    className="p-3 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-2.5"
                  >
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-rose-700">
                        {activeRisks.length} активных риск-инцидентов
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Проверьте блокировки выплат и операций
                      </div>
                    </div>
                  </div>
                )}
                {pendingPayouts.length > 0 && (
                  <div
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      navigateTo('payouts');
                    }}
                    className="p-3 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-2.5"
                  >
                    <HandCoins className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-slate-900">
                        {pendingPayouts.length} выплат требуют утверждения
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Реестры для отправки в банк
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Interactive Role Switcher & User Profile */}
        <div className="relative" ref={roleMenuRef}>
          <button
            onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 hover:border-slate-400 transition-all group shadow-2xs"
          >
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt="" className="w-6 h-6 rounded-full object-cover border border-slate-300" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-700 border border-slate-300">
                {currentUser.name.substring(0, 1)}
              </div>
            )}
            <div className="text-left hidden sm:block">
              <div className="text-[11px] font-semibold text-slate-800 flex items-center gap-1.5">
                <span>{currentUser.name.split(' ')[0]}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium border ${roleMeta.badgeColor}`}>
                  {roleMeta.title.split(' ')[0]}
                </span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
          </button>

          {isRoleMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl p-2.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2 py-2 border-b border-slate-100 flex items-start space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUser.name.substring(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900 truncate">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                  <div className="text-[10px] text-emerald-700 font-medium mt-0.5">{currentUser.team || 'Платформа'}</div>
                </div>
              </div>

              <div className="px-2 pt-2.5 pb-1">
                <div className="text-[10px] uppercase font-mono font-bold text-slate-400 flex items-center justify-between">
                  <span>Переключение роли (RBAC)</span>
                  <Sparkles className="w-3 h-3 text-amber-500" />
                </div>
              </div>

              <div className="space-y-1 mt-1">
                {rolesList.map(r => {
                  const meta = ROLE_DEFINITIONS[r];
                  const isCurrent = currentUser.role === r;
                  return (
                    <button
                      key={r}
                      onClick={() => {
                        switchUserRole(r);
                        setIsRoleMenuOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg transition-colors flex items-start justify-between ${
                        isCurrent
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-950'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-xs flex items-center gap-1.5">
                          <span>{meta.title}</span>
                          {isCurrent && <span className="text-emerald-600 text-[10px]">● Активен</span>}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                          {meta.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-slate-100 mt-2 pt-2 space-y-1">
                <button
                  onClick={() => {
                    resetAllData();
                    setIsRoleMenuOpen(false);
                  }}
                  className="w-full p-2 text-left text-[11px] text-slate-600 hover:text-amber-700 hover:bg-amber-50/50 rounded-lg flex items-center gap-2 transition-colors font-medium"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Сбросить демо-данные</span>
                </button>

                <button
                  id="topbar-logout-btn"
                  onClick={() => {
                    setIsRoleMenuOpen(false);
                    logout();
                  }}
                  className="w-full p-2 text-left text-[11px] text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 transition-colors font-medium"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Выйти из учетной записи</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
