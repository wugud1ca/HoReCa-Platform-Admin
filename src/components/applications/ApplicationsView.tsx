import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { hasPermission } from '../../lib/permissions';
import { OnboardingApplication, ApplicationStatus } from '../../types';
import {
  Inbox,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Building2,
  Phone,
  Mail,
  User,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Scale,
  BadgeDollarSign,
  Store,
  X,
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { ExportButton } from '../common/ExportButton';

export const ApplicationsView: React.FC = () => {
  const {
    applications,
    currentUser,
    selectedApplicationId,
    setSelectedApplicationId,
    updateApplicationStatus,
    convertApplicationToEstablishment,
    navigateTo,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [rejectModalApp, setRejectModalApp] = useState<OnboardingApplication | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [lawyerNoteInput, setLawyerNoteInput] = useState('');
  const [managerNoteInput, setManagerNoteInput] = useState('');

  const selectedApp = applications.find(a => a.id === selectedApplicationId);

  // Filtered applications
  const filteredApps = applications.filter(app => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      app.brandName.toLowerCase().includes(q) ||
      app.legalName.toLowerCase().includes(q) ||
      app.inn.includes(q) ||
      app.id.toLowerCase().includes(q) ||
      app.contactPerson.toLowerCase().includes(q);

    const matchStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchCity = cityFilter === 'all' || app.city === cityFilter;

    return matchQuery && matchStatus && matchCity;
  });

  const cities = Array.from(new Set(applications.map(a => a.city)));

  // Export prepared data
  const exportData = filteredApps.map(a => ({
    'ID Заявки': a.id,
    'Дата': a.createdAt,
    'Бренд': a.brandName,
    'Юр. Лицо': a.legalName,
    'ИНН': a.inn,
    'Город': a.city,
    'Формат': a.type,
    'Точек': a.branchCount,
    'Статус': a.status,
    'Ответственный': a.assignedTo,
    'Риски': a.foundRisks.join('; '),
  }));

  const handleOpenDrawer = (app: OnboardingApplication) => {
    setSelectedApplicationId(app.id);
    setLawyerNoteInput(app.lawyerNote || '');
    setManagerNoteInput(app.managerNote || '');
  };

  const handleConvert = (appId: string) => {
    const newEst = convertApplicationToEstablishment(appId);
    if (newEst) {
      setSelectedApplicationId(null);
      navigateTo('establishments', newEst.id);
    }
  };

  const handleSaveNotes = () => {
    if (!selectedApp) return;
    updateApplicationStatus(selectedApp.id, selectedApp.status, {
      lawyer: lawyerNoteInput,
      manager: managerNoteInput,
    });
  };

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Онбординг клиентов</span>
            <span>/</span>
            <span className="text-indigo-600 font-medium">Реестр входящих заявок</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2.5">
            Модерация и проверка новых заведений HoReCa
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton data={exportData} filename="horeca_applications.csv" label="Экспорт заявок" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto flex-1">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию, ИНН, контакту..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Все статусы ({applications.length})</option>
              <option value="new">Новые</option>
              <option value="in_verification">На первичной проверке</option>
              <option value="legal_check">Юридическая проверка</option>
              <option value="finance_check">Финансовый скоринг</option>
              <option value="approved">Одобренные</option>
              <option value="converted">Подключенные (в реестре)</option>
              <option value="rejected">Отклоненные</option>
            </select>

            <select
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Все города</option>
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-slate-500 text-xs self-end md:self-auto">
          Найдено заявок: <span className="font-bold text-slate-900">{filteredApps.length}</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-3.5">ID / Дата</th>
                <th className="py-3 px-3.5">Заведение / Юрлицо</th>
                <th className="py-3 px-3.5">ИНН / Город</th>
                <th className="py-3 px-3.5">Формат / Точек</th>
                <th className="py-3 px-3.5">Статус / Этап</th>
                <th className="py-3 px-3.5">Риски и дубли</th>
                <th className="py-3 px-3.5">Ответственный</th>
                <th className="py-3 px-3.5 text-right">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Заявок с заданными параметрами не найдено
                  </td>
                </tr>
              ) : (
                filteredApps.map(app => {
                  const isConverted = app.status === 'converted';

                  return (
                    <tr
                      key={app.id}
                      onClick={() => handleOpenDrawer(app)}
                      className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                        selectedApplicationId === app.id ? 'bg-indigo-50/50' : ''
                      }`}
                    >
                      <td className="py-3 px-3.5">
                        <div className="font-mono font-bold text-slate-900">{app.id}</div>
                        <div className="text-[11px] text-slate-500">{app.createdAt}</div>
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-slate-900">{app.brandName}</div>
                        <div className="text-[11px] text-slate-500">{app.legalName}</div>
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="font-mono text-slate-800">{app.inn}</div>
                        <div className="text-[11px] text-slate-500">{app.city}</div>
                      </td>

                      <td className="py-3 px-3.5 text-slate-700">
                        <div>
                          {app.type === 'coffee_shop'
                            ? 'Кофейня'
                            : app.type === 'bakery'
                            ? 'Пекарня'
                            : app.type === 'restaurant'
                            ? 'Ресторан'
                            : 'Dark Kitchen'}
                        </div>
                        <div className="text-[11px] text-slate-500">{app.branchCount} точек продаж</div>
                      </td>

                      <td className="py-3 px-3.5">
                        <StatusBadge type="application" status={app.status} />
                      </td>

                      <td className="py-3 px-3.5">
                        {app.isDuplicateSuspected ? (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200 font-semibold">
                            <AlertTriangle className="w-3 h-3" />
                            Дубликат ИНН!
                          </span>
                        ) : app.foundRisks.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                            ⚠️ {app.foundRisks.length} риска
                          </span>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-medium">✓ Без замечаний</span>
                        )}
                      </td>

                      <td className="py-3 px-3.5 text-slate-700">
                        {app.assignedTo}
                      </td>

                      <td className="py-3 px-3.5 text-right" onClick={e => e.stopPropagation()}>
                        {app.status === 'approved' ? (
                          hasPermission.canConvertApplicationToEstablishment(currentUser.role) && (
                            <button
                              onClick={() => handleConvert(app.id)}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-2xs transition-all"
                            >
                              Подключить
                            </button>
                          )
                        ) : isConverted ? (
                          <span className="text-[11px] text-teal-700 font-semibold font-mono">Подключено</span>
                        ) : (
                          <button
                            onClick={() => handleOpenDrawer(app)}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-[11px] border border-slate-300 transition-colors shadow-2xs"
                          >
                            Модерация
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Moderation Detail Drawer */}
      {selectedApp && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-indigo-700 font-bold">Заявка #{selectedApp.id}</span>
                <StatusBadge type="application" status={selectedApp.status} />
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">{selectedApp.brandName}</h2>
            </div>
            <button
              onClick={() => setSelectedApplicationId(null)}
              className="p-1.5 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
            {/* Timeline Stages */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Этапы онбординга и верификации
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                <div className="p-1.5 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                  1. Первичная
                </div>
                <div className={`p-1.5 rounded font-semibold border ${
                  selectedApp.status === 'legal_check' || selectedApp.status === 'finance_check' || selectedApp.status === 'approved' || selectedApp.status === 'converted'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-100 text-slate-400 border-slate-200'
                }`}>
                  2. Юрист
                </div>
                <div className={`p-1.5 rounded font-semibold border ${
                  selectedApp.status === 'finance_check' || selectedApp.status === 'approved' || selectedApp.status === 'converted'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-100 text-slate-400 border-slate-200'
                }`}>
                  3. Фин. скоринг
                </div>
                <div className={`p-1.5 rounded font-semibold border ${
                  selectedApp.status === 'approved' || selectedApp.status === 'converted'
                    ? 'bg-teal-50 text-teal-800 border-teal-200'
                    : 'bg-slate-100 text-slate-400 border-slate-200'
                }`}>
                  4. Одобрено
                </div>
              </div>
            </div>

            {/* Warnings / Duplicate alerts */}
            {selectedApp.isDuplicateSuspected && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900">
                <div className="font-bold flex items-center gap-1.5 text-rose-700 text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Внимание: Обнаружен дубликат реквизитов!
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-rose-800">
                  ИНН {selectedApp.inn} уже зарегистрирован за действующим заведением в базе. Проверьте карточку перед согласованием.
                </p>
              </div>
            )}

            {/* General Info */}
            <div className="space-y-3">
              <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                Реквизиты и контакты
              </div>
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500">Юр. лицо:</span>
                  <div className="font-medium text-slate-900 mt-0.5">{selectedApp.legalName}</div>
                </div>
                <div>
                  <span className="text-slate-500">ИНН:</span>
                  <div className="font-mono font-medium text-slate-900 mt-0.5">{selectedApp.inn}</div>
                </div>
                <div>
                  <span className="text-slate-500">Контактное лицо:</span>
                  <div className="font-medium text-slate-900 mt-0.5">{selectedApp.contactPerson}</div>
                </div>
                <div>
                  <span className="text-slate-500">Телефон:</span>
                  <div className="font-mono text-slate-900 mt-0.5">{selectedApp.phone}</div>
                </div>
                <div>
                  <span className="text-slate-500">Email:</span>
                  <div className="text-slate-900 mt-0.5">{selectedApp.email}</div>
                </div>
                <div>
                  <span className="text-slate-500">Город / Филиалов:</span>
                  <div className="text-slate-900 mt-0.5">{selectedApp.city} • {selectedApp.branchCount} точек</div>
                </div>
              </div>
            </div>

            {/* Attached Documents */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                Прикрепленные документы ({selectedApp.attachedDocs.length})
              </div>
              <div className="space-y-1.5">
                {selectedApp.attachedDocs.map(doc => (
                  <div
                    key={doc.id}
                    className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span className="text-slate-900 font-medium">{doc.title}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      doc.verified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {doc.verified ? '✓ Проверен' : 'Ожидает проверки'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Notes */}
            <div className="space-y-3">
              <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                Заключения отделов
              </div>
              <div>
                <label className="text-slate-700 font-medium block mb-1">Заметка юриста (комплаенс):</label>
                <textarea
                  value={lawyerNoteInput}
                  onChange={e => setLawyerNoteInput(e.target.value)}
                  placeholder="Юридические замечания по договору, проверке по СПАРК..."
                  className="w-full p-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  rows={2}
                />
              </div>
              <div>
                <label className="text-slate-700 font-medium block mb-1">Комментарий менеджера онбординга:</label>
                <textarea
                  value={managerNoteInput}
                  onChange={e => setManagerNoteInput(e.target.value)}
                  placeholder="Операционные детали, договоренности по комиссии..."
                  className="w-full p-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  rows={2}
                />
              </div>
              <button
                onClick={handleSaveNotes}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-300 transition-colors shadow-2xs"
              >
                Сохранить заметки
              </button>
            </div>
          </div>

          {/* Drawer Actions (RBAC enforced) */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Send to Lawyer */}
              {hasPermission.canLegalReviewApplication(currentUser.role) && selectedApp.status !== 'approved' && selectedApp.status !== 'converted' && (
                <button
                  onClick={() => updateApplicationStatus(selectedApp.id, 'legal_check')}
                  className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-800 text-xs font-semibold shadow-2xs"
                >
                  Юристу
                </button>
              )}

              {/* Send to Finance */}
              {hasPermission.canFinanceReviewApplication(currentUser.role) && selectedApp.status !== 'approved' && selectedApp.status !== 'converted' && (
                <button
                  onClick={() => updateApplicationStatus(selectedApp.id, 'finance_check')}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 text-xs font-semibold shadow-2xs"
                >
                  Фин. скоринг
                </button>
              )}

              {/* Reject */}
              {selectedApp.status !== 'converted' && (
                <button
                  onClick={() => {
                    setRejectModalApp(selectedApp);
                    setRejectionReasonInput('');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 text-xs font-semibold shadow-2xs"
                >
                  Отклонить
                </button>
              )}
            </div>

            {/* Approval / Conversion */}
            {selectedApp.status === 'approved' ? (
              hasPermission.canConvertApplicationToEstablishment(currentUser.role) && (
                <button
                  onClick={() => handleConvert(selectedApp.id)}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Создать заведение в реестре</span>
                </button>
              )
            ) : selectedApp.status !== 'converted' ? (
              hasPermission.canProcessApplication(currentUser.role) && (
                <button
                  onClick={() => updateApplicationStatus(selectedApp.id, 'approved')}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Одобрить подключение</span>
                </button>
              )
            ) : (
              <span className="text-teal-700 text-xs font-semibold">Заведение уже в реестре</span>
            )}
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Отклонение заявки #{rejectModalApp.id}</h3>
            <p className="text-xs text-slate-500 mt-1">
              Укажите причину отклонения для заведения &quot;{rejectModalApp.brandName}&quot;. Это действие будет зафиксировано в аудите.
            </p>

            <div className="mt-4">
              <label className="text-xs text-slate-700 font-medium block mb-1">Причина отклонения:</label>
              <textarea
                value={rejectionReasonInput}
                onChange={e => setRejectionReasonInput(e.target.value)}
                placeholder="Например: Недействительные учредительные документы, задолженность перед ФНС..."
                className="w-full p-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                rows={3}
              />
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setRejectModalApp(null)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  updateApplicationStatus(rejectModalApp.id, 'rejected', undefined, rejectionReasonInput || 'Отклонено модератором');
                  setRejectModalApp(null);
                }}
                disabled={!rejectionReasonInput.trim()}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors shadow-2xs"
              >
                Подтвердить отклонение
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
