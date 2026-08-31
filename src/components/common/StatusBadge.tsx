import React from 'react';
import {
  EstablishmentStatus,
  ApplicationStatus,
  RiskLevel,
  OrderStatus,
} from '../../types';

interface StatusBadgeProps {
  type: 'establishment' | 'application' | 'risk' | 'order' | 'payout' | 'document' | 'payment';
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, status, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs font-medium' : 'px-2.5 py-1 text-xs font-semibold';

  if (type === 'establishment') {
    switch (status as EstablishmentStatus) {
      case 'active':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Активно
          </span>
        );
      case 'approved':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Одобрено
          </span>
        );
      case 'onboarding':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-md bg-cyan-50 text-cyan-700 border border-cyan-200 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
            Подключается
          </span>
        );
      case 'in_review':
      case 'new_application':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            На проверке
          </span>
        );
      case 'temporarily_stopped':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-md bg-orange-50 text-orange-800 border border-orange-200 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
            Временно остановлено
          </span>
        );
      case 'risk_limited':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Ограничено по риску
          </span>
        );
      case 'blocked':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-md bg-red-100 text-red-800 border border-red-300 font-semibold ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
            Заблокировано
          </span>
        );
      case 'terminated':
      case 'archived':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Расторгнуто
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
            {status}
          </span>
        );
    }
  }

  if (type === 'risk') {
    switch (status as RiskLevel) {
      case 'critical':
        return (
          <span className={`inline-flex items-center gap-1 rounded-md bg-red-100 text-red-800 border border-red-300 font-mono font-bold ${sizeClasses}`}>
            ⚠️ Критический
          </span>
        );
      case 'high':
        return (
          <span className={`inline-flex items-center gap-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-mono font-medium ${sizeClasses}`}>
            ⚡ Высокий
          </span>
        );
      case 'medium':
        return (
          <span className={`inline-flex items-center gap-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-mono ${sizeClasses}`}>
            🟡 Средний
          </span>
        );
      case 'low':
        return (
          <span className={`inline-flex items-center gap-1 rounded-md bg-sky-50 text-sky-700 border border-sky-200 font-mono ${sizeClasses}`}>
            🔵 Низкий
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center gap-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono ${sizeClasses}`}>
            ✓ Чисто
          </span>
        );
    }
  }

  if (type === 'application') {
    switch (status as ApplicationStatus) {
      case 'new':
        return (
          <span className={`inline-flex items-center rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 ${sizeClasses}`}>
            Новая
          </span>
        );
      case 'in_verification':
        return (
          <span className={`inline-flex items-center rounded-md bg-sky-50 text-sky-700 border border-sky-200 ${sizeClasses}`}>
            Первичная проверка
          </span>
        );
      case 'legal_check':
        return (
          <span className={`inline-flex items-center rounded-md bg-purple-50 text-purple-700 border border-purple-200 ${sizeClasses}`}>
            Юр. проверка
          </span>
        );
      case 'finance_check':
        return (
          <span className={`inline-flex items-center rounded-md bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses}`}>
            Фин. скоринг
          </span>
        );
      case 'approved':
        return (
          <span className={`inline-flex items-center rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
            Одобрена
          </span>
        );
      case 'converted':
        return (
          <span className={`inline-flex items-center rounded-md bg-teal-50 text-teal-700 border border-teal-200 ${sizeClasses}`}>
            Подключено
          </span>
        );
      case 'rejected':
        return (
          <span className={`inline-flex items-center rounded-md bg-red-50 text-red-700 border border-red-200 ${sizeClasses}`}>
            Отклонена
          </span>
        );
      default:
        return <span className={`inline-flex items-center rounded-md bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>{status}</span>;
    }
  }

  if (type === 'order') {
    switch (status as OrderStatus) {
      case 'preparing':
        return (
          <span className={`inline-flex items-center rounded-md bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses}`}>
            Готовится
          </span>
        );
      case 'ready_for_pickup':
        return (
          <span className={`inline-flex items-center rounded-md bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
            Готов к выдаче
          </span>
        );
      case 'completed':
        return (
          <span className={`inline-flex items-center rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
            Выдан
          </span>
        );
      case 'cancelled':
        return (
          <span className={`inline-flex items-center rounded-md bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
            Отменен
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center rounded-md bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
            {status}
          </span>
        );
    }
  }

  if (type === 'payout') {
    switch (status) {
      case 'calculated':
        return (
          <span className={`inline-flex items-center rounded-md bg-sky-50 text-sky-700 border border-sky-200 ${sizeClasses}`}>
            Рассчитано
          </span>
        );
      case 'approved':
        return (
          <span className={`inline-flex items-center rounded-md bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
            Согласовано
          </span>
        );
      case 'ready_to_pay':
        return (
          <span className={`inline-flex items-center rounded-md bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses}`}>
            К выплате
          </span>
        );
      case 'paid':
        return (
          <span className={`inline-flex items-center rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
            Оплачено
          </span>
        );
      case 'frozen_by_risk':
        return (
          <span className={`inline-flex items-center rounded-md bg-red-50 text-red-700 border border-red-200 ${sizeClasses}`}>
            Заморожено (Риск)
          </span>
        );
      default:
        return <span className={`inline-flex items-center rounded-md bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>{status}</span>;
    }
  }

  return (
    <span className={`inline-flex items-center rounded-md bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
      {status}
    </span>
  );
};
