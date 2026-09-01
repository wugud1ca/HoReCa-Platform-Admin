import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ROLE_DEFINITIONS, hasPermission } from '../../lib/permissions';
import { UserRole, InternalUser, Invite } from '../../types';
import {
  Users,
  ShieldCheck,
  UserPlus,
  KeyRound,
  Lock,
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
  Copy,
  Check,
  RefreshCw,
  Search,
  Filter,
  ShieldAlert,
  Sliders,
  Send,
  XCircle,
  Eye,
  LogOut,
  Sparkles,
  Layers,
  History,
  Activity,
  Laptop
} from 'lucide-react';

export const UsersRolesView: React.FC = () => {
  const {
    allUsers,
    allInvites,
    authLogs,
    currentUser,
    switchUserRole,
    createInvite,
    revokeInvite,
    resendInvite,
    toggleUserBlock,
    changeUserRole,
    showToast,
    setAuthScreenMode,
    setActiveInviteToken,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'employees' | 'invites' | 'matrix' | 'logs'>('employees');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  // Create invite modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('moderator');
  const [inviteTeam, setInviteTeam] = useState('Операционный контур');
  const [inviteFirstName, setInviteFirstName] = useState('');
  const [inviteLastName, setInviteLastName] = useState('');

  // Role edit modal
  const [editingUser, setEditingUser] = useState<InternalUser | null>(null);
  const [newRoleForUser, setNewRoleForUser] = useState<UserRole>('moderator');

  const rolesList: UserRole[] = [
    'super_admin',
    'admin_manager',
    'moderator',
    'support',
    'demo_user',
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTokenId(id);
    showToast({
      type: 'success',
      title: 'Скопировано в буфер',
      message: 'Ссылка-приглашение готова для отправки сотруднику.',
    });
    setTimeout(() => setCopiedTokenId(null), 2000);
  };

  const handleCreateInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    createInvite({
      email: inviteEmail,
      role: inviteRole,
      team: inviteTeam,
      firstName: inviteFirstName,
      lastName: inviteLastName,
    });

    setIsInviteModalOpen(false);
    setInviteEmail('');
    setInviteFirstName('');
    setInviteLastName('');
    setActiveSubTab('invites');
  };

  const handleSaveRoleChange = () => {
    if (!editingUser) return;
    changeUserRole(editingUser.id, newRoleForUser);
    setEditingUser(null);
  };

  // Filter users
  const filteredUsers = allUsers.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.team && u.team.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Администрирование</span>
            <span>/</span>
            <span className="text-emerald-700 font-medium">Пользователи, Инвайты и RBAC</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2.5">
            Управление персоналом и матрицей доступа платформы
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Двухуровневая модель: HoReCa Order PWA (клиенты/эквайринг) + ЛК кафе & KDS 2 Remix (кухня/заказы)
          </p>
        </div>

        {hasPermission.canManageUsers(currentUser.role) && (
          <button
            id="open-invite-modal-btn"
            onClick={() => setIsInviteModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Пригласить сотрудника</span>
          </button>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200 text-xs font-medium w-full sm:w-auto overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('employees')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all ${
            activeSubTab === 'employees'
              ? 'bg-white text-emerald-800 font-semibold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Сотрудники ({allUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('invites')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all ${
            activeSubTab === 'invites'
              ? 'bg-white text-emerald-800 font-semibold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Инвайты ({allInvites.filter(i => i.status === 'pending').length} активных)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('matrix')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all ${
            activeSubTab === 'matrix'
              ? 'bg-white text-emerald-800 font-semibold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Матрица прав доступа (RBAC)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('logs')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all ${
            activeSubTab === 'logs'
              ? 'bg-white text-emerald-800 font-semibold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Журнал авторизаций & Аудит</span>
        </button>
      </div>

      {/* TAB 1: EMPLOYEES DIRECTORY */}
      {activeSubTab === 'employees' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Поиск по имени, email или отделу..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedRoleFilter}
                onChange={e => setSelectedRoleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">Все роли ({allUsers.length})</option>
                {rolesList.map(r => (
                  <option key={r} value={r}>
                    {ROLE_DEFINITIONS[r]?.title || r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-medium bg-slate-50/80">
                    <th className="py-3 px-4">Сотрудник</th>
                    <th className="py-3 px-3">Email & Отдел</th>
                    <th className="py-3 px-3">Роль в системе</th>
                    <th className="py-3 px-3">Статус аккаунта</th>
                    <th className="py-3 px-3">2FA Защита</th>
                    <th className="py-3 px-3">Последний вход</th>
                    <th className="py-3 px-4 text-right">Управление</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredUsers.map(user => {
                    const meta = ROLE_DEFINITIONS[user.role] || {
                      title: user.role,
                      badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
                      description: ''
                    };
                    const isBlocked = user.isBlocked || user.status === 'blocked';
                    const isMe = currentUser.id === user.id;

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt=""
                                className="w-8 h-8 rounded-full object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700 border border-slate-300">
                                {user.name.substring(0, 1)}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                <span>{user.name}</span>
                                {isMe && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                                    Вы
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">ID: {user.id}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="text-slate-800 font-medium">{user.email}</div>
                          <div className="text-[11px] text-slate-500">{user.team || 'Платформа'}</div>
                        </td>

                        <td className="py-3 px-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${meta.badgeColor}`}>
                            {meta.title}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          {isBlocked ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                              <ShieldAlert className="w-3 h-3 text-rose-600" />
                              <span>Заблокирован</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Активен</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-600">
                            <Lock className="w-3 h-3 text-emerald-600" />
                            <span>TOTP 2FA</span>
                          </span>
                        </td>

                        <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' }) : 'Сегодня, 11:20'}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => {
                                switchUserRole(user.role);
                                showToast({
                                  type: 'info',
                                  title: 'Эмуляция сессии',
                                  message: `Авторизован как ${user.name} (${meta.title})`,
                                });
                              }}
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium border border-slate-300 transition-colors"
                              title="Войти под правами пользователя"
                            >
                              Войти как
                            </button>

                            {hasPermission.canManageUsers(currentUser.role) && !isMe && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingUser(user);
                                    setNewRoleForUser(user.role);
                                  }}
                                  className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                                  title="Изменить роль"
                                >
                                  <Sliders className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => toggleUserBlock(user.id, !isBlocked, isBlocked ? 'Разблокировано администратором' : 'Заблокировано администратором')}
                                  className={`p-1 rounded transition-colors ${
                                    isBlocked
                                      ? 'text-emerald-600 hover:bg-emerald-50'
                                      : 'text-rose-500 hover:bg-rose-50'
                                  }`}
                                  title={isBlocked ? 'Разблокировать аккаунт' : 'Заблокировать доступ'}
                                >
                                  <ShieldAlert className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVITE REGISTRY */}
      {activeSubTab === 'invites' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-sm">Система безопасных одноразовых инвайтов</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  TTL: 24 Часа
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl">
                Ссылка содержит уникальный крипто-токен. Сотрудник переходит по ссылке, подтверждает ФИО и задает собственный пароль с проверкой сложности.
              </p>
            </div>

            {hasPermission.canManageUsers(currentUser.role) && (
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors shrink-0 flex items-center space-x-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Создать приглашение</span>
              </button>
            )}
          </div>

          {/* Invites Cards / Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allInvites.map(inv => {
              const roleMeta = ROLE_DEFINITIONS[inv.role] || {
                title: inv.role,
                badgeColor: 'bg-slate-100 text-slate-700',
                description: '',
              };
              const isExpired = new Date(inv.expiresAt).getTime() < Date.now();
              const isCopied = copiedTokenId === inv.id;

              return (
                <div
                  key={inv.id}
                  className={`p-4 rounded-xl border transition-all ${
                    inv.status === 'pending'
                      ? 'bg-white border-slate-200 shadow-2xs'
                      : inv.status === 'used'
                      ? 'bg-slate-50/70 border-slate-200 opacity-75'
                      : 'bg-rose-50/40 border-rose-200 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-xs text-slate-900">{inv.email}</span>
                        {inv.status === 'pending' && !isExpired && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                            Ожидает активации
                          </span>
                        )}
                        {inv.status === 'used' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                            Активирован
                          </span>
                        )}
                        {inv.status === 'revoked' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-50 text-rose-800 border border-rose-200 font-medium">
                            Отозван
                          </span>
                        )}
                        {isExpired && inv.status === 'pending' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-medium">
                            Срок истек
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 mt-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${roleMeta.badgeColor}`}>
                          {roleMeta.title}
                        </span>
                        <span className="text-xs text-slate-500">• {inv.team || 'Операции'}</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 text-right">
                      <div>Создан: {new Date(inv.createdAt).toLocaleDateString('ru-RU')}</div>
                      <div className="text-amber-700 font-mono">До: {new Date(inv.expiresAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>

                  {/* Token Box */}
                  <div className="mt-3 p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                    <div className="font-mono text-[11px] text-slate-600 truncate select-all">
                      https://admin.horeca-agent.ru/auth/invite?token={inv.token}
                    </div>
                    <button
                      onClick={() => handleCopy(`https://admin.horeca-agent.ru/auth/invite?token=${inv.token}`, inv.id)}
                      className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-[10px] font-medium flex items-center space-x-1 shrink-0 transition-colors"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Скопировано</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-500" />
                          <span>Копировать</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Actions for Invites */}
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => {
                        setActiveInviteToken(inv.token);
                        setAuthScreenMode('invite_activation');
                        showToast({
                          type: 'info',
                          title: 'Тест активации',
                          message: 'Открыт экран ввода пароля по выбранному инвайту.',
                        });
                      }}
                      className="text-emerald-700 hover:text-emerald-800 font-medium flex items-center space-x-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Открыть экран активации</span>
                    </button>

                    {inv.status === 'pending' && hasPermission.canManageUsers(currentUser.role) && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => resendInvite(inv.id)}
                          className="text-slate-500 hover:text-slate-800 text-[11px]"
                          title="Продлить на 24 часа"
                        >
                          Продлить 24ч
                        </button>
                        <button
                          onClick={() => revokeInvite(inv.id)}
                          className="text-rose-600 hover:text-rose-700 text-[11px]"
                        >
                          Отозвать
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: RBAC PERMISSIONS MATRIX */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Матрица разграничения доступа (RBAC)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Сравнительная таблица привилегий для ролей оператора агентской платформы и кухонного контура.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700 font-semibold bg-slate-50">
                    <th className="py-3 px-4 w-72">Модуль / Функция платформы</th>
                    <th className="py-3 px-3 text-center">Super Admin (Владелец)</th>
                    <th className="py-3 px-3 text-center">Admin Manager (Руководитель)</th>
                    <th className="py-3 px-3 text-center">Moderator (Кафе/Меню)</th>
                    <th className="py-3 px-3 text-center">Support (Оператор)</th>
                    <th className="py-3 px-3 text-center">Demo User (Презентация)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-slate-800">HoReCa Order PWA (QR Меню, Каталог)</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Полный</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Полный</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Редактирование</td>
                    <td className="py-2.5 px-3 text-center text-slate-600">Просмотр</td>
                    <td className="py-2.5 px-3 text-center text-slate-400">Только чтение</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-slate-800">ЛК Кафе & KDS 2 Remix (Статусы кухни)</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Полный</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Полный</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Управление</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Управление</td>
                    <td className="py-2.5 px-3 text-center text-slate-400">Только чтение</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-slate-800">СБП Эквайринг & Финансовый реестр</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Полный</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Полный</td>
                    <td className="py-2.5 px-3 text-center text-rose-500 font-medium">Нет доступа</td>
                    <td className="py-2.5 px-3 text-center text-slate-600">Чеки заказов</td>
                    <td className="py-2.5 px-3 text-center text-slate-400">Демо-цифры</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-slate-800">Выплаты кафе и агентские комиссии</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Утверждение</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Утверждение</td>
                    <td className="py-2.5 px-3 text-center text-rose-500 font-medium">Нет доступа</td>
                    <td className="py-2.5 px-3 text-center text-rose-500 font-medium">Нет доступа</td>
                    <td className="py-2.5 px-3 text-center text-slate-400">Только чтение</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-slate-800">Онбординг & Договоры агента</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Полный</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Полный</td>
                    <td className="py-2.5 px-3 text-center text-slate-600">Верификация</td>
                    <td className="py-2.5 px-3 text-center text-slate-600">Просмотр</td>
                    <td className="py-2.5 px-3 text-center text-slate-400">Только чтение</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-slate-800">Управление сотрудниками & Инвайты</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Полный</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Создание инвайтов</td>
                    <td className="py-2.5 px-3 text-center text-rose-500 font-medium">Нет доступа</td>
                    <td className="py-2.5 px-3 text-center text-rose-500 font-medium">Нет доступа</td>
                    <td className="py-2.5 px-3 text-center text-slate-400">Только чтение</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT & SECURITY LOGS */}
      {activeSubTab === 'logs' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Журнал событий безопасности и входов</span>
              </h3>
              <p className="text-xs text-slate-500">Автоматическая фиксация IP-адресов, сессий и смены прав</p>
            </div>
            <span className="text-xs font-mono text-slate-500">{authLogs.length} записей</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-medium bg-slate-50">
                    <th className="py-3 px-4">Время</th>
                    <th className="py-3 px-3">Событие</th>
                    <th className="py-3 px-3">Email пользователя</th>
                    <th className="py-3 px-3">IP Адрес</th>
                    <th className="py-3 px-3">Детали</th>
                    <th className="py-3 px-4 text-right">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {authLogs.map(log => {
                    const isSuccess = log.status === 'success';
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString('ru-RU')}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-slate-800">{log.event}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">{log.email}</td>
                        <td className="py-2.5 px-3 text-slate-500">{log.ip}</td>
                        <td className="py-2.5 px-3 text-slate-600 font-sans text-xs">{log.details || '—'}</td>
                        <td className="py-2.5 px-4 text-right">
                          {isSuccess ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              SUCCESS
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              FAILED
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE INVITE */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Пригласить сотрудника</h3>
                  <p className="text-xs text-slate-500">Генерация ссылки с ограниченным сроком действия</p>
                </div>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInviteSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Рабочий email сотрудника *</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="colleague@horeca-platform.ru"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Имя (Опционально)</label>
                  <input
                    type="text"
                    value={inviteFirstName}
                    onChange={e => setInviteFirstName(e.target.value)}
                    placeholder="Дмитрий"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Фамилия</label>
                  <input
                    type="text"
                    value={inviteLastName}
                    onChange={e => setInviteLastName(e.target.value)}
                    placeholder="Морозов"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Назначить роль в системе *</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as UserRole)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="admin_manager">Руководитель (Admin Manager) — Управление онбордингом и выплатами</option>
                  <option value="moderator">Модератор заведений — Каталог HoReCa Order PWA & KDS</option>
                  <option value="support">Оператор поддержки — Чеки, статусы заказов кухни</option>
                  <option value="demo_user">Демо-пользователь — Презентационный просмотр</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Отдел / Контур</label>
                <input
                  type="text"
                  value={inviteTeam}
                  onChange={e => setInviteTeam(e.target.value)}
                  placeholder="Операционный отдел"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center space-x-2">
                <Clock className="w-4 h-4 shrink-0" />
                <span>Ссылка будет активна 24 часа. Пароль создается сотрудником при активации.</span>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center space-x-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Создать инвайт</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT USER ROLE */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Изменение роли сотрудника</h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="text-xs space-y-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-semibold text-slate-900">{editingUser.name}</div>
                <div className="text-slate-500">{editingUser.email}</div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Новая роль</label>
                <select
                  value={newRoleForUser}
                  onChange={e => setNewRoleForUser(e.target.value as UserRole)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {rolesList.map(r => (
                    <option key={r} value={r}>
                      {ROLE_DEFINITIONS[r]?.title || r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEditingUser(null)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveRoleChange}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
