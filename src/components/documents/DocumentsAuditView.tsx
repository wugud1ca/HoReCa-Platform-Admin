import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentItem, AuditLogEntry } from '../../types';
import {
  FileText,
  History,
  Search,
  CheckCircle2,
  Calendar,
  Building2,
  User,
  ShieldCheck,
  Eye,
  Plus,
  X,
} from 'lucide-react';
import { ExportButton } from '../common/ExportButton';

export const DocumentsAuditView: React.FC = () => {
  const {
    documents,
    auditLogs,
    establishments,
    currentUser,
    addDocument,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'documents' | 'audit'>('documents');
  const [docSearch, setDocSearch] = useState('');
  const [auditSearch, setAuditSearch] = useState('');
  const [docCategoryFilter, setDocCategoryFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // New Document Modal
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [docEstId, setDocEstId] = useState(establishments[0]?.id || '');
  const [docCategory, setDocCategory] = useState<DocumentItem['category']>('contract');

  // Filter Documents
  const filteredDocs = documents.filter(d => {
    const q = docSearch.toLowerCase().trim();
    const matchQuery =
      !q ||
      d.title.toLowerCase().includes(q) ||
      d.docNumber.toLowerCase().includes(q) ||
      d.establishmentName.toLowerCase().includes(q);

    const matchCategory = docCategoryFilter === 'all' || d.category === docCategoryFilter;
    return matchQuery && matchCategory;
  });

  // Filter Audit Logs
  const filteredAudit = auditLogs.filter(a => {
    const q = auditSearch.toLowerCase().trim();
    const matchQuery =
      !q ||
      a.action.toLowerCase().includes(q) ||
      a.userName.toLowerCase().includes(q) ||
      a.entityName.toLowerCase().includes(q) ||
      (a.reason && a.reason.toLowerCase().includes(q));

    const matchRole = roleFilter === 'all' || a.userRole === roleFilter;
    return matchQuery && matchRole;
  });

  const exportDocsData = filteredDocs.map(d => ({
    'ID Документа': d.id,
    'Название': d.title,
    'Номер': d.docNumber,
    'Категория': d.category,
    'Заведение': d.establishmentName,
    'Дата': d.issueDate,
    'Статус': d.status,
    'Размер': d.fileSize,
  }));

  const exportAuditData = filteredAudit.map(a => ({
    'ID': a.id,
    'Время': a.timestamp,
    'Сотрудник': a.userName,
    'Роль': a.userRole,
    'Действие': a.action,
    'Объект': `${a.entityType} - ${a.entityName}`,
    'Основание / Причина': a.reason || '',
  }));

  const handleCreateDocument = () => {
    if (!docTitle || !docNumber) return;
    const targetEst = establishments.find(e => e.id === docEstId);
    if (!targetEst) return;

    addDocument({
      establishmentId: targetEst.id,
      establishmentName: targetEst.brandName,
      title: docTitle,
      category: docCategory,
      docNumber: docNumber,
      fileSize: '1.2 MB',
      issueDate: new Date().toISOString().substring(0, 10),
      status: 'valid',
      uploadedBy: currentUser.name,
      version: 1,
    });

    setIsNewDocModalOpen(false);
    setDocTitle('');
    setDocNumber('');
  };

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Комплаенс и контроль</span>
            <span>/</span>
            <span className="text-indigo-600 font-medium">
              {activeSubTab === 'documents' ? 'Реестр документов' : 'Журнал действий (Audit Log)'}
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2.5">
            Юридический архив и аудит действий сотрудников
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeSubTab === 'documents' && (
            <>
              <button
                onClick={() => setIsNewDocModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Загрузить документ</span>
              </button>
              <ExportButton data={exportDocsData} filename="horeca_documents.csv" label="Экспорт архива" />
            </>
          )}
          {activeSubTab === 'audit' && (
            <ExportButton data={exportAuditData} filename="horeca_system_audit.csv" label="Выгрузить лог аудита" />
          )}
        </div>
      </div>

      {/* Sub-Tab Navigation Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('documents')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'documents'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Электронный документооборот ({documents.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'audit'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Журнал безопасности и аудита ({auditLogs.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: DOCUMENTS REPOSITORY */}
      {activeSubTab === 'documents' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto flex-1">
              <div className="relative flex-1 min-w-[220px] max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={docSearch}
                  onChange={e => setDocSearch(e.target.value)}
                  placeholder="Поиск по номеру, названию, заведению..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <select
                value={docCategoryFilter}
                onChange={e => setDocCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">Все типы документов</option>
                <option value="contract">Агентские договоры</option>
                <option value="act">Акты взаиморасчетов</option>
                <option value="supplementary_agreement">Дополнительные соглашения</option>
                <option value="statutory_document">Учредительные документы (ЕГРЮЛ)</option>
                <option value="nda_offer">Оферты и регламенты</option>
              </select>
            </div>

            <div className="text-slate-500 self-end md:self-auto">
              Документов: <span className="font-bold text-slate-900">{filteredDocs.length}</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-3.5">Документ / Номер</th>
                    <th className="py-3 px-3.5">Заведение / Партнер</th>
                    <th className="py-3 px-3.5">Категория</th>
                    <th className="py-3 px-3.5">Дата подписания</th>
                    <th className="py-3 px-3.5">Статус</th>
                    <th className="py-3 px-3.5">Размер</th>
                    <th className="py-3 px-3.5 text-right">Файл</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredDocs.map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span>{doc.title}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono pl-6">№ {doc.docNumber}</div>
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-slate-900">{doc.establishmentName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{doc.establishmentId}</div>
                      </td>

                      <td className="py-3 px-3.5 text-slate-700">
                        {doc.category === 'contract'
                          ? 'Агентский договор'
                          : doc.category === 'act'
                          ? 'Акт сверки'
                          : doc.category === 'supplementary_agreement'
                          ? 'Доп. соглашение'
                          : 'Учредительный'}
                      </td>

                      <td className="py-3 px-3.5 font-mono text-slate-800">
                        {doc.issueDate}
                      </td>

                      <td className="py-3 px-3.5">
                        <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {doc.status === 'valid' ? 'Действует' : doc.status}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 text-slate-500 font-mono">
                        {doc.fileSize}
                      </td>

                      <td className="py-3 px-3.5 text-right">
                        <button
                          onClick={() => alert(`Просмотр документа: ${doc.title} (№ ${doc.docNumber})`)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-indigo-700 font-semibold text-[11px] border border-slate-300 transition-colors inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Открыть</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: SYSTEM AUDIT LOG */}
      {activeSubTab === 'audit' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto flex-1">
              <div className="relative flex-1 min-w-[220px] max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={e => setAuditSearch(e.target.value)}
                  placeholder="Поиск по действию, сотруднику, объекту..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">Все роли сотрудников</option>
                <option value="admin">Администратор</option>
                <option value="manager">Менеджер онбординга</option>
                <option value="accountant">Бухгалтер</option>
                <option value="financier">Финансист</option>
                <option value="lawyer">Юрист / Комплаенс</option>
              </select>
            </div>

            <div className="text-slate-500 self-end md:self-auto">
              Записей аудита: <span className="font-bold text-slate-900">{filteredAudit.length}</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-3.5">Время</th>
                    <th className="py-3 px-3.5">Сотрудник / Роль</th>
                    <th className="py-3 px-3.5">Действие</th>
                    <th className="py-3 px-3.5">Объект</th>
                    <th className="py-3 px-3.5">Основание / Причина</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredAudit.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3.5 font-mono text-slate-500 whitespace-nowrap">
                        {log.timestamp}
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-slate-900">{log.userName}</div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200 inline-block mt-0.5">
                          {log.userRole}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 font-medium text-slate-900">
                        {log.action}
                      </td>

                      <td className="py-3 px-3.5 text-indigo-700 font-mono font-medium">
                        {log.entityType}: {log.entityName}
                      </td>

                      <td className="py-3 px-3.5 text-slate-500 italic">
                        {log.reason ? `"${log.reason}"` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* New Document Modal */}
      {isNewDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Загрузка документа в архив</h3>
              <button onClick={() => setIsNewDocModalOpen(false)} className="text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-medium block mb-1">Заведение:</label>
                <select
                  value={docEstId}
                  onChange={e => setDocEstId(e.target.value)}
                  className="w-full p-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  {establishments.map(e => (
                    <option key={e.id} value={e.id}>{e.brandName} ({e.legalName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">Категория документа:</label>
                <select
                  value={docCategory}
                  onChange={e => setDocCategory(e.target.value as DocumentItem['category'])}
                  className="w-full p-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="contract">Агентский договор</option>
                  <option value="act">Акт сверки / взаиморасчетов</option>
                  <option value="supplementary_agreement">Дополнительное соглашение</option>
                  <option value="statutory_document">Учредительный документ (ЕГРЮЛ)</option>
                  <option value="nda_offer">Оферта / NDA</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">Название документа:</label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={e => setDocTitle(e.target.value)}
                  placeholder="Например: Дополнительное соглашение о снижении комиссии"
                  className="w-full p-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">Номер документа:</label>
                <input
                  type="text"
                  value={docNumber}
                  onChange={e => setDocNumber(e.target.value)}
                  placeholder="Например: ДС-2026/08-1"
                  className="w-full p-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsNewDocModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleCreateDocument}
                disabled={!docTitle.trim() || !docNumber.trim()}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Сохранить в архив
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
