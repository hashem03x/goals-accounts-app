'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Nav } from '@/components/layout/Nav';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAccounts  } from '@/hooks/useAccounts';
import { AccountForm } from '@/components/accounts/AccountForm';
import { Account } from '@/lib/localData';

const TYPE_LABELS: Record<string, string> = {
  incoming: 'وارد',
  outgoing: 'صادر',
};

function formatMoney(n: number) {
  return new Intl.NumberFormat('ar-EG', { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

export default function AccountsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const {
    accounts,
    pagination,
    loading,
    error,
    setFilters,
    createAccount,
    updateAccount,
    deleteAccount,
  } = useAccounts({ sort: '-date', limit: 20 });

  const handleSearch = () => {
    setFilters((f) => ({ ...f, search: searchInput.trim() || undefined, page: 1 }));
  };

  const handleSubmit = async (values: Partial<Account>) => {
    try {
      if (editingAccount) {
        await updateAccount(editingAccount._id, values);
        toast.success('تم تحديث السجل');
      } else {
        await createAccount(values);
        toast.success('تم إضافة السجل');
      }
      setModalOpen(false);
      setEditingAccount(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'حدث خطأ');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await deleteAccount(deleteId);
      toast.success('تم الحذف');
      setDeleteId(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'فشل الحذف');
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEdit = (account: Account) => {
    setEditingAccount(account);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingAccount(null);
  };

  return (
    <>
      <Nav />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-surface-800">الحسابات</h1>
          <Button onClick={() => { setEditingAccount(null); setModalOpen(true); }}>
            إضافة سجل
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-2 items-center">
              <input
                type="search"
                placeholder="بحث (الاسم أو الملاحظات)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="rounded-lg border border-surface-200 px-3 py-2 text-sm min-w-[180px]"
              />
              <Button variant="secondary" size="sm" onClick={handleSearch}>بحث</Button>
              <select
                className="rounded-lg border border-surface-200 px-3 py-2 text-sm"
                onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value || undefined }))}
              >
                <option value="">كل النوع</option>
                <option value="incoming">وارد</option>
                <option value="outgoing">صادر</option>
              </select>
              <select
                className="rounded-lg border border-surface-200 px-3 py-2 text-sm"
                onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value || '-date' }))}
              >
                <option value="-date">الأحدث تاريخاً</option>
                <option value="date">الأقدم تاريخاً</option>
                <option value="-amount">الأعلى مبلغاً</option>
                <option value="amount">الأقل مبلغاً</option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading && <LoadingSpinner />}
            {error && <p className="p-4 text-red-600">{error}</p>}
            {!loading && !error && accounts.length === 0 && (
              <EmptyState
                title="لا توجد سجلات"
                description="أضف سجلاً وارداً أو صادراً للبدء."
                action={
                  <Button onClick={() => setModalOpen(true)}>إضافة سجل</Button>
                }
              />
            )}
            {!loading && !error && accounts.length > 0 && (
              <ul className="divide-y divide-surface-100">
                {accounts.map((acc) => (
                  <li
                    key={acc._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-surface-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-surface-800">{acc.personName}</h3>
                      {acc.phone && <p className="text-sm text-surface-500">{acc.phone}</p>}
                      {acc.notes && <p className="text-sm text-surface-500 mt-0.5 line-clamp-1">{acc.notes}</p>}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${acc.type === 'incoming' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {TYPE_LABELS[acc.type]}
                        </span>
                        <span className="text-xs text-surface-500">
                          {new Date(acc.date).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`font-semibold ${acc.type === 'incoming' ? 'text-green-600' : 'text-red-600'}`}>
                        {acc.type === 'incoming' ? '+' : '-'}{formatMoney(acc.amount)}
                      </span>
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => openEdit(acc)}>
                          تعديل
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => setDeleteId(acc._id)}>
                          حذف
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {pagination.pages > 1 && (
              <div className="p-4 border-t border-surface-100 text-sm text-surface-500">
                صفحة {pagination.page} من {pagination.pages} (إجمالي {pagination.total})
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <AccountForm
        isOpen={modalOpen}
        onClose={closeModal}
        initialValues={editingAccount ?? undefined}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="تأكيد الحذف"
        message="هل أنت متأكد من حذف هذا السجل؟"
        confirmLabel="حذف"
        loading={deleteLoading}
      />
    </>
  );
}
