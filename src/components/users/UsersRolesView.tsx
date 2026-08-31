import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ROLE_DEFINITIONS } from '../../lib/permissions';
import { UserRole, InternalUser } from '../../types';
import {
  Users,
  ShieldCheck,
  UserPlus,
  KeyRound,
  Lock,
  Mail,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const UsersRolesView: React.FC = () => {
  const { allUsers, currentUser, switchUserRole, showToast } = useApp();
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');

  const rolesList: UserRole[] = ['admin', 'manager', 'accountant', 'financier', 'lawyer'];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Администрирование</span>
            <span>/</span>
            <span className="text-indigo-600 font-medium">Пользователи и роли (RBAC)</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2.5">
            Управление внутренними ролями и матрицей доступа
          </h1>
        </div>

        <button
          onClick={() => {
            showToast({
              type: 'info',
              title: 'Добавление пользователя',
              message: 'Интеграция с корпоративным SSO / Active Directory активна.',
            });
          }}
          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Пригласить сотрудника</span>
        </button>
      </div>

      {/* Role Matrix Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rolesList.map(r => {
          const meta = ROLE_DEFINITIONS[r];
          const isCurrent = currentUser.role === r;

          return (
            <div
              key={r}
              className={`p-4 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-indigo-50/60 border-indigo-300 shadow-xs ring-1 ring-indigo-500/20'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded border ${meta.badgeColor}`}>
                    {meta.title}
                  </span>
                  <p className="text-xs text-slate-600 mt-2">{meta.description}</p>
                </div>
                {isCurrent && (
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                    Текущая роль
                  </span>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    switchUserRole(r);
                    showToast({
                      type: 'success',
                      title: 'Роль переключена',
                      message: `Вы переключились на роль: ${meta.title}`,
                    });
                  }}
                  className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isCurrent
                      ? 'bg-indigo-600 text-white shadow-xs cursor-default'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  {isCurrent ? 'Активный режим' : 'Переключиться в демо'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* User Directory Table */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Сотрудники бэк-офиса платформы
            </h3>
            <p className="text-xs text-slate-500">Список авторизованных аккаунтов с двухфакторной защитой 2FA</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 font-medium bg-slate-50">
                <th className="py-3 px-3">Сотрудник</th>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Назначенная роль</th>
                <th className="py-3 px-3">2FA Статус</th>
                <th className="py-3 px-3">Последний вход</th>
                <th className="py-3 px-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {allUsers.map(user => {
                const meta = ROLE_DEFINITIONS[user.role];
                return (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700 border border-slate-300">
                          {user.name.substring(0, 1)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{user.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-700">{user.email}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${meta.badgeColor}`}>
                        {meta.title}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Включен</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                      Сегодня, 14:32 (МСК)
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          switchUserRole(user.role);
                          showToast({
                            type: 'info',
                            title: 'Эмуляция сессии',
                            message: `Авторизован как ${user.name} (${meta.title})`,
                          });
                        }}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors text-[11px] font-medium border border-slate-300 shadow-2xs"
                      >
                        Войти как
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
