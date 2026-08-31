import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { hasPermission } from '../../lib/permissions';
import { Establishment, EstablishmentStatus, RiskLevel } from '../../types';
import {
  Store,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  CreditCard,
  Sliders,
  ShoppingBag,
  CircleDollarSign,
  HandCoins,
  FileText,
  ShieldAlert,
  History,
  MessageSquare,
  ArrowLeft,
  Ban,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Play,
  Pause,
  ExternalLink,
  Save,
  Lock,
  Unlock,
  QrCode,
  Monitor,
  UtensilsCrossed,
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { PwaAcquiringTab } from './tabs/PwaAcquiringTab';
import { KdsTerminalsTab } from './tabs/KdsTerminalsTab';
import { MenuStopListTab } from './tabs/MenuStopListTab';

interface EstablishmentDetailViewProps {
  establishmentId: string;
  onBack: () => void;
}

export const EstablishmentDetailView: React.FC<EstablishmentDetailViewProps> = ({
  establishmentId,
  onBack,
}) => {
  const {
    establishments,
    orders,
    payouts,
    riskCases,
    documents,
    auditLogs,
    currentUser,
    updateEstablishment,
    toggleEstablishmentBlock,
    toggleBranchStop,
    createRiskCase,
    navigateTo,
  } = useApp();

  const est = establishments.find(e => e.id === establishmentId);

  const [activeTab, setActiveTab] = useState<
    | 'general'
    | 'pwa_settings'
    | 'kds_terminals'
    | 'menu'
    | 'legal'
    | 'contacts'
    | 'branches'
    | 'settings'
    | 'orders'
    | 'finance'
    | 'payouts'
    | 'documents'
    | 'risks'
    | 'audit'
    | 'comments'
  >('general');

  // Edit states for editable fields
  const [editableBrand, setEditableBrand] = useState(est?.brandName || '');
  const [editableLegal, setEditableLegal] = useState(est?.legalName || '');
  const [editableCommission, setEditableCommission] = useState(est?.commercialTerms.commissionRate || 9);
  const [editableManager, setEditableManager] = useState(est?.responsibleManager || '');
  const [newCommentText, setNewCommentText] = useState('');

  // Modals for Stop / Block
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockReasonInput, setBlockReasonInput] = useState('');
  const [isStopOpsSelected, setIsStopOpsSelected] = useState(true);
  const [isStopPayoutsSelected, setIsStopPayoutsSelected] = useState(true);

  if (!est) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm">
        <Store className="w-12 h-12 mx-auto mb-3 text-slate-400" />
        <div className="text-base font-semibold text-slate-900">Заведение не найдено</div>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
        >
          Вернуться в реестр
        </button>
      </div>
    );
  }

  // Filter linked data for this establishment
  const linkedOrders = orders.filter(o => o.establishmentId === est.id);
  const linkedPayouts = payouts.filter(p => p.establishmentId === est.id);
  const linkedRisks = riskCases.filter(r => r.establishmentId === est.id);
  const linkedDocs = documents.filter(d => d.establishmentId === est.id);
  const linkedAudit = auditLogs.filter(a => a.entityId === est.id || a.entityName.includes(est.brandName));

  const handleSaveChanges = () => {
    const updated: Establishment = {
      ...est,
      brandName: editableBrand,
      legalName: editableLegal,
      responsibleManager: editableManager,
      commercialTerms: {
        ...est.commercialTerms,
        commissionRate: Number(editableCommission),
      },
    };
    updateEstablishment(updated, 'Обновление параметров заведения из карточки');
  };

  const handleAddComment = () => {
    if (!newCommentText.trim()) return;
    const note = `[${new Date().toISOString().substring(0, 10)} ${currentUser.name}]: ${newCommentText.trim()}`;
    const updated: Establishment = {
      ...est,
      internalNotes: [note, ...est.internalNotes],
    };
    updateEstablishment(updated, 'Добавлен внутренний комментарий');
    setNewCommentText('');
  };

  const handleApplyBlockOrStop = () => {
    toggleEstablishmentBlock(
      est.id,
      isStopOpsSelected && isStopPayoutsSelected,
      blockReasonInput || 'Решение службы комплаенс',
      isStopOpsSelected,
      isStopPayoutsSelected
    );
    setIsBlockModalOpen(false);
  };

  const handleUnblock = () => {
    toggleEstablishmentBlock(est.id, false, 'Снятие ограничений и возобновление работы', false, false);
  };

  const tabs = [
    { id: 'general', label: '1. Общие сведения', icon: Store },
    { id: 'pwa_settings', label: '2. PWA & Эквайринг', icon: QrCode },
    { id: 'kds_terminals', label: '3. KDS 2 Remix & ЛК', icon: Monitor },
    { id: 'menu', label: `4. Меню (${est.menuItems?.length || 0})`, icon: UtensilsCrossed },
    { id: 'legal', label: '5. Юридические данные', icon: Building2 },
    { id: 'contacts', label: '6. Контакты', icon: Phone },
    { id: 'branches', label: `7. Точки (${est.branches.length})`, icon: MapPin },
    { id: 'settings', label: '8. Настройки и SLA', icon: Sliders },
    { id: 'orders', label: `9. Заказы (${linkedOrders.length})`, icon: ShoppingBag },
    { id: 'finance', label: '10. Финансы', icon: CircleDollarSign },
    { id: 'payouts', label: `11. Выплаты (${linkedPayouts.length})`, icon: HandCoins },
    { id: 'documents', label: `12. Документы (${linkedDocs.length})`, icon: FileText },
    { id: 'risks', label: `13. Риски (${linkedRisks.length})`, icon: ShieldAlert },
    { id: 'audit', label: `14. Аудит (${linkedAudit.length})`, icon: History },
    { id: 'comments', label: `15. Заметки (${est.internalNotes.length})`, icon: MessageSquare },
  ];

  return (
    <div className="space-y-5 pb-12">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 transition-colors shadow-2xs"
            title="Назад к реестру"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Реестр заведений</span>
              <span>/</span>
              <span className="text-indigo-600 font-medium">Карточка заведения</span>
              <span>/</span>
              <span className="font-mono text-slate-700 font-semibold">{est.id}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1 flex flex-wrap items-center gap-2.5">
              {est.brandName}
              <span className="text-xs text-slate-500 font-normal">({est.legalName})</span>
              <StatusBadge type="establishment" status={est.status} />
              <StatusBadge type="risk" status={est.riskStatus} />
            </h1>
          </div>
        </div>

        {/* Global Action Trigger Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {est.isBlocked || est.isStopOperations || est.isStopPayouts ? (
            hasPermission.canUnblockEstablishment(currentUser.role) && (
              <button
                onClick={handleUnblock}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Снять ограничения / Разблокировать</span>
              </button>
            )
          ) : (
            hasPermission.canBlockEstablishment(currentUser.role) && (
              <button
                onClick={() => {
                  setBlockReasonInput('');
                  setIsBlockModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Ban className="w-3.5 h-3.5 text-rose-600" />
                <span>Остановить / Заблокировать</span>
              </button>
            )
          )}
          <button
            onClick={() => {
              createRiskCase({
                establishmentId: est.id,
                establishmentName: est.brandName,
                level: 'medium',
                description: `Ручной инцидент, открытый сотрудником ${currentUser.name}`,
              });
              setActiveTab('risks');
            }}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Флаг риска</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Tabs & Tab Content + Right Sticky Summary Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Cols: Tabs and Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Responsive Flex-Wrap Tab Navigation without drag-scroll */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200 text-xs font-medium">
            {tabs.map(t => {
              const isActive = activeTab === t.id;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as typeof activeTab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-left ${
                    isActive
                      ? 'bg-white text-indigo-700 font-semibold shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: General Info */}
          {activeTab === 'general' && (
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Основные параметры заведения</h3>
                {hasPermission.canEditGeneralData(currentUser.role) && (
                  <button
                    onClick={handleSaveChanges}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Сохранить</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-600 font-medium block mb-1">Коммерческий бренд:</label>
                  <input
                    type="text"
                    value={editableBrand}
                    onChange={e => setEditableBrand(e.target.value)}
                    disabled={!hasPermission.canEditGeneralData(currentUser.role)}
                    className="w-full p-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-medium block mb-1">Юридическое наименование:</label>
                  <input
                    type="text"
                    value={editableLegal}
                    onChange={e => setEditableLegal(e.target.value)}
                    disabled={!hasPermission.canEditGeneralData(currentUser.role)}
                    className="w-full p-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-medium block mb-1">Тип заведения:</label>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-medium">
                    {est.type === 'coffee_shop'
                      ? 'Кофейня'
                      : est.type === 'bakery'
                      ? 'Пекарня'
                      : est.type === 'cafe'
                      ? 'Кафе'
                      : 'Ресторан'}
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 font-medium block mb-1">Формат обслуживания:</label>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800">
                    {est.serviceFormat === 'mixed'
                      ? 'Смешанный (у стойки + за столом)'
                      : est.serviceFormat === 'takeaway'
                      ? 'Только навынос'
                      : 'Обслуживание официантом'}
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 font-medium block mb-1">Ответственный менеджер:</label>
                  <input
                    type="text"
                    value={editableManager}
                    onChange={e => setEditableManager(e.target.value)}
                    disabled={!hasPermission.canEditGeneralData(currentUser.role)}
                    className="w-full p-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-medium block mb-1">Регион и город:</label>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800">
                    {est.region} • {est.city} ({est.timezone})
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 font-medium block mb-1">Дата регистрации в системе:</label>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 font-mono text-slate-800">
                    {est.registrationDate}
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 font-medium block mb-1">Дата активации:</label>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 font-mono text-slate-800">
                    {est.activationDate || 'Ожидает запуска'}
                  </div>
                </div>
              </div>

              {est.blockReason && (
                <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800">
                  <div className="font-bold flex items-center gap-2 text-rose-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Ограничение / Причина блокировки:</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed">{est.blockReason}</p>
                  <div className="text-[10px] text-rose-600 mt-1 font-mono">
                    Кем установлено: {est.blockedBy || 'Служба комплаенс'} ({est.blockedAt || 'Недавно'})
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: HoReCa Order PWA & Acquiring */}
          {activeTab === 'pwa_settings' && (
            <PwaAcquiringTab establishment={est} />
          )}

          {/* TAB 3: KDS 2 Remix & LK Cafe */}
          {activeTab === 'kds_terminals' && (
            <KdsTerminalsTab establishment={est} />
          )}

          {/* TAB 4: Menu and Stop List */}
          {activeTab === 'menu' && (
            <MenuStopListTab establishment={est} />
          )}

          {/* TAB 5: Legal Data */}
          {activeTab === 'legal' && (
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-5 text-xs">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                Юридические реквизиты и налоговый режим
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500">ИНН:</span>
                  <div className="p-2 mt-1 rounded-lg bg-slate-50 border border-slate-200 font-mono font-bold text-slate-900">
                    {est.inn}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500">КПП:</span>
                  <div className="p-2 mt-1 rounded-lg bg-slate-50 border border-slate-200 font-mono text-slate-800">
                    {est.kpp || 'Отсутствует (ИП)'}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500">ОГРН / ОГРНИП:</span>
                  <div className="p-2 mt-1 rounded-lg bg-slate-50 border border-slate-200 font-mono text-slate-800">
                    {est.ogrn}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500">Налоговая система:</span>
                  <div className="p-2 mt-1 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800">
                    {est.bankDetails.taxSystem} (УСН / Патент)
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Банковские расчетные реквизиты
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-500">Банк партнера:</span>
                    <div className="text-slate-900 font-medium mt-0.5">{est.bankDetails.bankName}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">БИК Банка:</span>
                    <div className="font-mono text-slate-800 mt-0.5">{est.bankDetails.bik}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Расчетный счет:</span>
                    <div className="font-mono text-slate-800 mt-0.5">{est.bankDetails.accountNumber}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Корр. счет:</span>
                    <div className="font-mono text-slate-800 mt-0.5">{est.bankDetails.corrAccount}</div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Агентский договор с платформой
                </h4>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div>
                    <div className="font-semibold text-slate-900">
                      Договор № {est.commercialTerms.contractNumber}
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Дата заключения: {est.commercialTerms.contractDate} • Статус: {est.commercialTerms.contractStatus}
                    </div>
                  </div>
                  <span className="text-emerald-700 font-semibold px-2.5 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                    Действует
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Contacts */}
          {activeTab === 'contacts' && (
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                Контактные лица и каналы связи
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <User className="w-4 h-4 text-indigo-600" />
                    <span>Основной контакт (Руководитель)</span>
                  </div>
                  <div>
                    <span className="text-slate-500">ФИО:</span>
                    <div className="text-slate-900 font-medium">{est.contactPerson}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Телефон:</span>
                    <div className="text-slate-900 font-mono">{est.phone}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Email:</span>
                    <div className="text-slate-900 font-mono">{est.email}</div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span>Управляющий сети / Менеджер</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Ответственный менеджер платформы:</span>
                    <div className="text-slate-900 font-medium">{est.responsibleManager}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Часовой пояс работы:</span>
                    <div className="text-slate-900 font-medium">{est.timezone}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Экстренный канал:</span>
                    <div className="text-emerald-700 font-medium">Telegram Bot & SMS-оповещения включены</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Branches */}
          {activeTab === 'branches' && (
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Филиалы и точки продаж</h3>
                  <p className="text-slate-500 text-xs">Управление каналами обслуживания и аварийной остановкой точек</p>
                </div>
                <span className="font-mono text-indigo-700 font-bold bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">
                  Всего: {est.branches.length} точек
                </span>
              </div>

              <div className="space-y-3">
                {est.branches.map(branch => (
                  <div
                    key={branch.id}
                    className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{branch.name}</span>
                        {branch.isTemporarilyStopped ? (
                          <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200 font-semibold">
                            ⛔ Остановлена ({branch.stopReason || 'Вручную'})
                          </span>
                        ) : (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                            ✓ Активна
                          </span>
                        )}
                      </div>
                      <div className="text-slate-600 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{branch.address}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2 pt-1">
                        <span>График: {branch.workingHours}</span>
                        <span>•</span>
                        <span className="text-indigo-700 font-mono font-medium">Выручка сегодня: {branch.todayGmv.toLocaleString()} ₽</span>
                        <span>•</span>
                        <span>Заказов в работе: {branch.activeOrdersCount}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      {/* Service channel tags */}
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className={`px-1.5 py-0.5 rounded border ${branch.serviceChannels.qrTable ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-medium' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                          QR Стол
                        </span>
                        <span className={`px-1.5 py-0.5 rounded border ${branch.serviceChannels.qrTakeaway ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-medium' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                          QR Навынос
                        </span>
                        <span className={`px-1.5 py-0.5 rounded border ${branch.serviceChannels.counterOrder ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-medium' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                          Стойка
                        </span>
                      </div>

                      {branch.isTemporarilyStopped ? (
                        <button
                          onClick={() => toggleBranchStop(est.id, branch.id, false)}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1 transition-colors shadow-2xs"
                        >
                          <Play className="w-3 h-3" />
                          <span>Запустить</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleBranchStop(est.id, branch.id, true, 'Остановка администратором')}
                          className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 font-semibold text-xs flex items-center gap-1 transition-colors"
                        >
                          <Pause className="w-3 h-3 text-rose-600" />
                          <span>Остановить</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Operational Settings & Integrations */}
          {activeTab === 'settings' && (
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-5 text-xs">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                Операционные настройки, SLA и интеграции
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    SLA и регламенты сборки
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Ориентир готовности напитков:</span>
                    <span className="font-mono font-bold text-slate-900">{est.operationalSettings.slaPrepTimeMin} мин</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">SLA сборки/выдачи заказа:</span>
                    <span className="font-mono font-bold text-slate-900">{est.operationalSettings.slaAssemblyTimeMin} мин</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Способ выдачи гостю:</span>
                    <span className="font-bold text-indigo-700">По номеру заказа (экран)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Окна приема заказов:</span>
                    <span className="font-mono text-slate-800">{est.operationalSettings.orderAvailabilityWindows}</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Подключенные интеграции
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Кассовая система (POS):</span>
                    <span className="font-mono font-bold text-emerald-700 uppercase">
                      {est.operationalSettings.integrations.cashRegister}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Интернет-эквайринг:</span>
                    <span className="font-bold text-slate-900 uppercase">
                      {est.operationalSettings.integrations.acquiring}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Telegram Бот оповещений:</span>
                    <span className="text-emerald-700 font-medium">✓ Активен</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Push-уведомления клиентам:</span>
                    <span className="text-emerald-700 font-medium">✓ Включены</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-amber-50/70 border border-amber-200 space-y-2">
                <h4 className="font-bold text-amber-900 uppercase tracking-wider text-[11px]">
                  Правила автостопа по рискам
                </h4>
                <div className="text-amber-800 leading-relaxed">
                  Автоматический перевод точки в стоп при накоплении более{' '}
                  <span className="font-mono text-amber-950 font-bold">{est.operationalSettings.autoStopRules.maxUnprocessedOrders} необработанных заказов</span>{' '}
                  или при более{' '}
                  <span className="font-mono text-amber-950 font-bold">{est.operationalSettings.autoStopRules.maxSlaBreachesPerHour} срывах SLA в час</span>.
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Orders */}
          {activeTab === 'orders' && (
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Заказы и продажи заведения</h3>
                <span className="text-slate-500 font-medium">Найдено заказов: {linkedOrders.length}</span>
              </div>

              {linkedOrders.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                  По данному заведению пока нет операционных заказов
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <th className="py-2.5 px-3">Номер</th>
                        <th className="py-2.5 px-3">Точка / Канал</th>
                        <th className="py-2.5 px-3">Дата / Время</th>
                        <th className="py-2.5 px-3">Состав</th>
                        <th className="py-2.5 px-3 text-right">Сумма</th>
                        <th className="py-2.5 px-3 text-right">Комиссия</th>
                        <th className="py-2.5 px-3">Статус</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {linkedOrders.map(ord => (
                        <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{ord.orderNumber}</td>
                          <td className="py-2.5 px-3 text-slate-700">{ord.branchName}</td>
                          <td className="py-2.5 px-3 text-slate-500">{ord.createdAt}</td>
                          <td className="py-2.5 px-3 text-slate-700 max-w-xs truncate">
                            {ord.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            {ord.totalAmount} ₽
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-medium text-emerald-700">
                            +{ord.platformCommission.toFixed(1)} ₽
                          </td>
                          <td className="py-2.5 px-3">
                            <StatusBadge type="order" status={ord.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: Finance */}
          {activeTab === 'finance' && (
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-5 text-xs">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                Финансовый баланс и P&L аналитика
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-slate-500">Совокупный GMV оборот:</div>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                    {est.metrics.totalGmv.toLocaleString()} ₽
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-slate-500">Комиссия сервиса:</div>
                  <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
                    {est.metrics.platformCommissionEarned.toLocaleString()} ₽
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-slate-500">Текущий баланс к выплате:</div>
                  <div className="text-xl font-bold font-mono text-sky-700 mt-1">
                    {est.metrics.pendingPayout.toLocaleString()} ₽
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                  Ставка комиссии и тариф
                </h4>
                <div className="flex flex-wrap items-center gap-4 text-slate-700">
                  <div>Агентская комиссия: <span className="font-mono font-bold text-indigo-700">{est.commercialTerms.commissionRate}%</span></div>
                  <div>•</div>
                  <div>Фикс с заказа: <span className="font-mono text-slate-900">{est.commercialTerms.fixedFeePerOrder} ₽</span></div>
                  <div>•</div>
                  <div>Мин. сумма в месяц: <span className="font-mono text-slate-900">{est.commercialTerms.minCommissionMonth} ₽</span></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: Payouts */}
          {activeTab === 'payouts' && (
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Реестры агентских выплат</h3>
                <span className="text-slate-500 font-medium">Всего периодов: {linkedPayouts.length}</span>
              </div>

              {linkedPayouts.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                  По данному заведению пока нет сформированных реестров выплат
                </div>
              ) : (
                <div className="space-y-3">
                  {linkedPayouts.map(payout => (
                    <div
                      key={payout.id}
                      className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-900 font-mono">#{payout.id}</span>
                          <span className="text-slate-600">Период: {payout.period}</span>
                          <StatusBadge type="payout" status={payout.status} />
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                          <span>Заказов: {payout.ordersCount}</span>
                          <span>Оборот: {payout.totalGmv.toLocaleString()} ₽</span>
                          <span>Комиссия: -{payout.platformFeeAmount.toLocaleString()} ₽</span>
                          {payout.adjustmentsAmount !== 0 && (
                            <span className="text-rose-700">Корректировки: {payout.adjustmentsAmount} ₽</span>
                          )}
                        </div>
                        {payout.frozenReason && (
                          <div className="text-[11px] text-rose-700 font-semibold mt-1">
                            ⚠️ {payout.frozenReason}
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="text-base font-bold font-mono text-emerald-700">
                          {payout.finalPayoutAmount.toLocaleString()} ₽
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Срок: {payout.dueDate}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 9: Documents */}
          {activeTab === 'documents' && (
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Документооборот заведения</h3>
                <span className="text-slate-500 font-medium">Документов: {linkedDocs.length}</span>
              </div>

              <div className="space-y-2">
                {linkedDocs.map(doc => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">{doc.title}</div>
                        <div className="text-[11px] text-slate-500">
                          № {doc.docNumber} • Дата: {doc.issueDate} • Размер: {doc.fileSize}
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[10px] border border-emerald-200">
                      ✓ Подписан
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: Risks */}
          {activeTab === 'risks' && (
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">История риск-инцидентов и блокировок</h3>
                <span className="text-rose-700 font-mono font-bold">Кейсов: {linkedRisks.length}</span>
              </div>

              {linkedRisks.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                  Инцидентов риска по данному заведению не зафиксировано
                </div>
              ) : (
                <div className="space-y-3">
                  {linkedRisks.map(rc => (
                    <div
                      key={rc.id}
                      className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold font-mono text-rose-700">{rc.id}</span>
                          <StatusBadge type="risk" status={rc.level} />
                          <span className="text-slate-500 text-[11px]">Категория: {rc.category}</span>
                        </div>
                        <span className="text-slate-500">{rc.detectedAt}</span>
                      </div>
                      <p className="text-slate-800 text-xs leading-relaxed">{rc.description}</p>
                      <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-600">
                        <span>Ответственный: {rc.responsibleUser}</span>
                        <span className="text-amber-800 font-medium">Статус: {rc.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 11: Audit Log */}
          {activeTab === 'audit' && (
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3 text-xs">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                Журнал действий по заведению
              </h3>

              <div className="space-y-2">
                {linkedAudit.map(log => (
                  <div key={log.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <History className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{log.action}</span>
                        <span className="font-mono text-[10px] text-slate-500">{log.timestamp}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        Сотрудник: <span className="text-slate-900 font-medium">{log.userName}</span> ({log.userRole})
                      </div>
                      {log.reason && (
                        <div className="text-[11px] text-slate-600 mt-1 italic">
                          Основание: &quot;{log.reason}&quot;
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 12: Internal Notes */}
          {activeTab === 'comments' && (
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                Внутренние заметки сотрудников
              </h3>

              <div className="space-y-2">
                <textarea
                  value={newCommentText}
                  onChange={e => setNewCommentText(e.target.value)}
                  placeholder="Оставьте служебный комментарий по заведению..."
                  className="w-full p-3 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  rows={2}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newCommentText.trim()}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs shadow-2xs transition-colors"
                >
                  Добавить комментарий
                </button>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100">
                {est.internalNotes.map((note, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800">
                    {note}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Sticky Summary Panel */}
        <div className="space-y-4">
          <div className="sticky top-20 p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Сводка заведения
              </span>
              <span className="font-mono text-indigo-700 font-bold">#{est.id}</span>
            </div>

            {/* Quick State Metrics */}
            <div className="space-y-3">
              <div>
                <span className="text-slate-500">Текущий статус:</span>
                <div className="mt-1">
                  <StatusBadge type="establishment" status={est.status} size="md" />
                </div>
              </div>

              <div>
                <span className="text-slate-500">Уровень риска:</span>
                <div className="mt-1">
                  <StatusBadge type="risk" status={est.riskStatus} size="md" />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Выручка (GMV):</span>
                  <span className="font-mono font-bold text-slate-900">
                    {(est.metrics.totalGmv / 1000).toFixed(0)}k ₽
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Заказов:</span>
                  <span className="font-mono text-slate-800">{est.metrics.totalOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Средний чек:</span>
                  <span className="font-mono text-slate-800">{est.metrics.avgCheck} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Соблюдение SLA:</span>
                  <span className="font-mono text-emerald-700 font-semibold">{est.metrics.slaComplianceRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">К выплате:</span>
                  <span className="font-mono font-bold text-sky-700">
                    {est.metrics.pendingPayout.toLocaleString()} ₽
                  </span>
                </div>
              </div>
            </div>

            {/* Emergency / Operational Badges */}
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Прием заказов:</span>
                {est.isStopOperations ? (
                  <span className="text-rose-700 font-bold text-[10px] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">⛔ ОСТАНОВЛЕН</span>
                ) : (
                  <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">✓ РАЗРЕШЕН</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Выплаты партнеру:</span>
                {est.isStopPayouts ? (
                  <span className="text-rose-700 font-bold text-[10px] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">🔒 ЗАМОРОЖЕНЫ</span>
                ) : (
                  <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">✓ РАЗРЕШЕНЫ</span>
                )}
              </div>
            </div>

            {/* Action Buttons in Sticky Panel */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              {hasPermission.canChangeFinancialTerms(currentUser.role) && (
                <button
                  onClick={() => setActiveTab('finance')}
                  className="w-full py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium transition-colors text-center shadow-2xs"
                >
                  Тарифы и комиссия
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stop / Block Confirmation Modal */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Ban className="w-5 h-5 text-rose-600" />
              Ограничение заведения {est.brandName}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Выберите тип ограничений и обязательно укажите регламентное основание для аудита.
            </p>

            <div className="mt-4 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isStopOpsSelected}
                  onChange={e => setIsStopOpsSelected(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-0"
                />
                <span className="text-xs text-slate-800 font-semibold">Stop Operations (Остановить прием заказов)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isStopPayoutsSelected}
                  onChange={e => setIsStopPayoutsSelected(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-0"
                />
                <span className="text-xs text-slate-800 font-semibold">Stop Payouts (Заморозить выплаты средств)</span>
              </label>

              <div>
                <label className="text-xs text-slate-700 font-medium block mb-1">Основание / Причина блокировки:</label>
                <textarea
                  value={blockReasonInput}
                  onChange={e => setBlockReasonInput(e.target.value)}
                  placeholder="Укажите причину (претензия ФНС, срыв SLA, подозрение на фрод)..."
                  className="w-full p-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsBlockModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleApplyBlockOrStop}
                disabled={!blockReasonInput.trim()}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Применить ограничения
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
