import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  UserCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  KeyRound,
  RefreshCw,
  Building2,
  ChevronRight,
  ShieldAlert,
  HelpCircle,
  Layers,
  FileCheck2,
  Users,
  Store,
  QrCode
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ROLE_DEFINITIONS } from '../../lib/permissions';
import { UserRole } from '../../types';

export const AuthView: React.FC = () => {
  const {
    login,
    demoLogin,
    sendForgotPassword,
    resetPassword,
    acceptInvite,
    authScreenMode,
    setAuthScreenMode,
    activeInviteToken,
    setActiveInviteToken,
    allInvites,
    allUsers,
  } = useApp();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  // Invite lookup
  const currentInvite = allInvites.find(i => i.token === activeInviteToken) || allInvites[0];

  useEffect(() => {
    if (authScreenMode === 'invite_activation' && currentInvite) {
      setEmail(currentInvite.email);
      setFirstName(currentInvite.firstName || '');
      setLastName(currentInvite.lastName || '');
    }
  }, [authScreenMode, currentInvite]);

  // Clear errors when typing or changing modes
  const handleModeChange = (mode: typeof authScreenMode) => {
    setErrorMessage(null);
    setSuccessInfo(null);
    setAuthScreenMode(mode);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    setTimeout(() => {
      const res = login(email, password);
      setLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Ошибка авторизации');
      }
    }, 400);
  };

  const handleQuickLogin = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('admin123');
    setErrorMessage(null);
    setLoading(true);

    setTimeout(() => {
      const res = login(userEmail, 'admin123');
      setLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Ошибка входа');
      }
    }, 300);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Укажите email для восстановления');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const res = sendForgotPassword(email);
      setLoading(false);
      setSuccessInfo(res.message);
    }, 400);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage('Введенные пароли не совпадают');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const res = resetPassword(password);
      setLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Ошибка смены пароля');
      }
    }, 400);
  };

  const handleAcceptInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInviteToken && !currentInvite?.token) {
      setErrorMessage('Токен приглашения не указан');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Пароль должен быть не менее 8 символов');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Пароли не совпадают');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const tokenToUse = activeInviteToken || currentInvite.token;
      const res = acceptInvite(tokenToUse, password, { firstName, lastName });
      setLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Не удалось активировать приглашение');
      }
    }, 500);
  };

  // Password strength checks
  const hasMinLength = password.length >= 8;
  const hasLetters = /[a-zA-Zа-яА-Я]/.test(password);
  const hasNumbers = /\d/.test(password);

  return (
    <div className="min-h-screen w-full bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Bar with brand and demo shortcuts */}
      <header className="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-900/30">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold tracking-tight text-white text-base">HoReCa Agent Platform</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Security v2.4
              </span>
            </div>
            <p className="text-xs text-slate-400">Управление PWA меню, СБП эквайрингом & KDS 2 Remix</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            id="auth-demo-mode-btn"
            onClick={() => demoLogin('demo_user')}
            className="flex items-center space-x-2 px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all hover:border-slate-600"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Демо-режим (Без входа)</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6 my-auto">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Context & Architecture Overview */}
          <div className="lg:col-span-5 space-y-6 hidden lg:block pr-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ролевой доступ & Защита эквайринга</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight text-white leading-tight">
                Единая панель агента для заведений HoReCa
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                Безопасный доступ для руководства, модераторов и операторов. Контроль QR-заказов гостей, агентских выплат, стоп-листов и статусов KDS.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                  <QrCode className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-slate-200 block">HoReCa Order PWA (Клиентский контур)</span>
                  <span className="text-slate-400">QR-меню за столом и навынос, прием оплат через СБП и агентский эквайринг.</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 shrink-0">
                  <Store className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-slate-200 block">ЛК Кафе & KDS 2 Remix (Кухонный контур)</span>
                  <span className="text-slate-400">Маршрутизация чеков на бар/кухню, выдача по номерам и учет комиссий.</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-slate-200 block">Изолированный RBAC & Аудит</span>
                  <span className="text-slate-400">5 уровней доступа, 24ч срок действия инвайтов и логирование входов.</span>
                </div>
              </div>
            </div>

            {/* Security badge */}
            <div className="pt-2 text-xs text-slate-500 flex items-center space-x-2">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>TLS 1.3 Encryption • Rate-limiting • JWT Session Auth</span>
            </div>
          </div>

          {/* Right Column: Dynamic Auth Form Card */}
          <div className="lg:col-span-7">
            <div className="w-full bg-slate-950 border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/50 relative overflow-hidden">
              
              {/* Subtle background glow */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Error Message Display */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-start space-x-3"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">{errorMessage}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success Message Display */}
              <AnimatePresence>
                {successInfo && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-6 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs flex items-start space-x-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">{successInfo}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mode 1: LOGIN FORM */}
              {authScreenMode === 'login' && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-white tracking-tight">Вход в систему</h2>
                    <p className="text-xs text-slate-400">
                      Введите корпоративные учетные данные сотрудника платформы
                    </p>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300 block">Электронная почта</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          id="auth-email-input"
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="name@horeca-platform.ru"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-slate-300">Пароль</label>
                        <button
                          type="button"
                          id="auth-forgot-password-link"
                          onClick={() => handleModeChange('forgot_password')}
                          className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          Забыли пароль?
                        </button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          id="auth-password-input"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={e => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/20"
                        />
                        <span className="text-xs text-slate-400">Запомнить меня на 30 дней</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      id="auth-submit-login-btn"
                      disabled={loading}
                      className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-sm font-medium transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50"
                    >
                      {loading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>Войти в систему</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Test quick-login accounts */}
                  <div className="pt-4 border-t border-slate-900 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Быстрый вход для тестирования ролей
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        id="quick-login-super-admin"
                        onClick={() => handleQuickLogin('admin@horeca-platform.ru')}
                        className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left transition-all group"
                      >
                        <span className="text-xs font-medium text-slate-200 block group-hover:text-emerald-400">Владелец</span>
                        <span className="text-[10px] text-slate-500">Super Admin</span>
                      </button>

                      <button
                        type="button"
                        id="quick-login-manager"
                        onClick={() => handleQuickLogin('manager@horeca-platform.ru')}
                        className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left transition-all group"
                      >
                        <span className="text-xs font-medium text-slate-200 block group-hover:text-emerald-400">Руководитель</span>
                        <span className="text-[10px] text-slate-500">Admin Manager</span>
                      </button>

                      <button
                        type="button"
                        id="quick-login-moderator"
                        onClick={() => handleQuickLogin('moderator@horeca-platform.ru')}
                        className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left transition-all group"
                      >
                        <span className="text-xs font-medium text-slate-200 block group-hover:text-emerald-400">Модератор</span>
                        <span className="text-[10px] text-slate-500">Кафе & Меню</span>
                      </button>

                      <button
                        type="button"
                        id="quick-login-support"
                        onClick={() => handleQuickLogin('support@horeca-platform.ru')}
                        className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left transition-all group"
                      >
                        <span className="text-xs font-medium text-slate-200 block group-hover:text-emerald-400">Оператор</span>
                        <span className="text-[10px] text-slate-500">Support Lead</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        id="switch-to-invite-mode-btn"
                        onClick={() => {
                          setActiveInviteToken('tok-valid-abc12345');
                          handleModeChange('invite_activation');
                        }}
                        className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1 transition-colors"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                        <span>Есть ссылка-приглашение (Инвайт)?</span>
                      </button>

                      <button
                        type="button"
                        id="test-blocked-account-btn"
                        onClick={() => handleQuickLogin('blocked@horeca-platform.ru')}
                        className="text-xs text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        Тест заблокированного аккаунта
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Mode 2: INVITE ACTIVATION */}
              {authScreenMode === 'invite_activation' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center space-x-1">
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Активация приглашения сотрудника</span>
                      </span>
                      <h2 className="text-xl font-bold text-white tracking-tight">Добро пожаловать в команду!</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleModeChange('login')}
                      className="text-xs text-slate-400 hover:text-slate-200"
                    >
                      К авторизации
                    </button>
                  </div>

                  {/* Active Invite Info Banner */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Назначенная роль:</span>
                      <span className="font-semibold text-emerald-400">
                        {ROLE_DEFINITIONS[currentInvite?.role || 'moderator']?.title || 'Сотрудник'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Отдел/Контур:</span>
                      <span className="text-slate-200">{currentInvite?.team || 'Операционный контур'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Срок действия ссылки:</span>
                      <span className="text-amber-400 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>24 часа</span>
                      </span>
                    </div>
                  </div>

                  {/* Sample invite switcher for testing */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-slate-400 block">Выбрать тестовое приглашение из реестра:</label>
                    <select
                      value={activeInviteToken || currentInvite?.token}
                      onChange={e => setActiveInviteToken(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      {allInvites.map(inv => (
                        <option key={inv.id} value={inv.token}>
                          {inv.email} — {ROLE_DEFINITIONS[inv.role]?.title} ({inv.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <form onSubmit={handleAcceptInviteSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-300 block">Имя</label>
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={e => setFirstName(e.target.value)}
                          placeholder="Иван"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-300 block">Фамилия</label>
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={e => setLastName(e.target.value)}
                          placeholder="Соколов"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300 block">Рабочий email</label>
                      <input
                        type="email"
                        disabled
                        value={email}
                        className="w-full bg-slate-900/60 border border-slate-800/60 rounded-xl px-3.5 py-2 text-sm text-slate-400 cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300 block">Создайте пароль</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="Минимум 8 символов"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300 block">Повторите пароль</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Password criteria checklist */}
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 grid grid-cols-3 gap-2 text-[11px]">
                      <div className={`flex items-center space-x-1.5 ${hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>8+ символов</span>
                      </div>
                      <div className={`flex items-center space-x-1.5 ${hasLetters ? 'text-emerald-400' : 'text-slate-500'}`}>
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Буквы</span>
                      </div>
                      <div className={`flex items-center space-x-1.5 ${hasNumbers ? 'text-emerald-400' : 'text-slate-500'}`}>
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Цифры</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50"
                    >
                      {loading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" />
                          <span>Активировать аккаунт и войти</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* Mode 3: FORGOT PASSWORD */}
              {authScreenMode === 'forgot_password' && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-white tracking-tight">Восстановление доступа</h2>
                    <p className="text-xs text-slate-400">
                      Укажите рабочий email. Мы отправим ссылку для генерации нового пароля.
                    </p>
                  </div>

                  <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300 block">Рабочий email</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="name@horeca-platform.ru"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-all disabled:opacity-50"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Отправить ссылку для сброса</span>}
                    </button>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => handleModeChange('login')}
                        className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        ← Вернуться к форме входа
                      </button>

                      <button
                        type="button"
                        onClick={() => handleModeChange('reset_password')}
                        className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        Есть токен сброса?
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Mode 4: RESET PASSWORD */}
              {authScreenMode === 'reset_password' && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-white tracking-tight">Установка нового пароля</h2>
                    <p className="text-xs text-slate-400">
                      Придумайте надежный пароль для вашей учетной записи
                    </p>
                  </div>

                  <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300 block">Новый пароль</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Минимум 8 символов"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300 block">Повторите новый пароль</label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-all disabled:opacity-50"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Сохранить новый пароль</span>}
                    </button>

                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleModeChange('login')}
                        className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        ← Вернуться к авторизации
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950/60 px-6 py-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>
          © 2026 HoReCa Order PWA & KDS 2 Remix Platform. Все права защищены.
        </div>
        <div className="flex items-center space-x-4 text-slate-400">
          <span>СБП & Эквайринг</span>
          <span>•</span>
          <span>Агентский договор</span>
          <span>•</span>
          <span>Безопасность RBAC</span>
        </div>
      </footer>
    </div>
  );
};
