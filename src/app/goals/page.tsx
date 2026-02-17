'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Nav } from '@/components/layout/Nav';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useGoals, type Goal } from '@/hooks/useGoals';
import { GoalForm } from '@/components/goals/GoalForm';

const TYPE_LABELS: Record<string, string> = {
  'short-term': 'قصير المدى',
  'long-term': 'طويل المدى',
};
const STATUS_LABELS: Record<string, string> = {
  pending: 'معلقة',
  'in-progress': 'قيد التنفيذ',
  completed: 'مكتملة',
  cancelled: 'ملغاة',
};

export default function GoalsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const {
    goals,
    pagination,
    loading,
    error,
    setFilters,
    createGoal,
    updateGoal,
    deleteGoal,
  } = useGoals({ sort: '-createdAt', limit: 20 });

  const handleSubmit = async (values: Partial<Goal>) => {
    try {
      if (editingGoal) {
        await updateGoal(editingGoal._id, values);
        toast.success('تم تحديث الهدف');
      } else {
        await createGoal(values);
        toast.success('تم إضافة الهدف');
      }
      setModalOpen(false);
      setEditingGoal(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'حدث خطأ');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await deleteGoal(deleteId);
      toast.success('تم الحذف');
      setDeleteId(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'فشل الحذف');
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingGoal(null);
  };

  return (
    <>
      <Nav />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-surface-800">الأهداف</h1>
          <Button onClick={() => { setEditingGoal(null); setModalOpen(true); }}>
            إضافة هدف
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-surface-500">تصفية:</span>
              <select
                className="rounded-lg border border-surface-200 px-3 py-2 text-sm"
                onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value || undefined }))}
              >
                <option value="">كل النوع</option>
                <option value="short-term">قصير المدى</option>
                <option value="long-term">طويل المدى</option>
              </select>
              <select
                className="rounded-lg border border-surface-200 px-3 py-2 text-sm"
                onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value || undefined }))}
              >
                <option value="">كل الحالة</option>
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <select
                className="rounded-lg border border-surface-200 px-3 py-2 text-sm"
                onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value || '-createdAt' }))}
              >
                <option value="-createdAt">الأحدث</option>
                <option value="createdAt">الأقدم</option>
                <option value="-deadline">الموعد (قريب)</option>
                <option value="deadline">الموعد (بعيد)</option>
                <option value="title">العنوان (أ-ي)</option>
                <option value="-title">العنوان (ي-أ)</option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading && <LoadingSpinner />}
            {error && <p className="p-4 text-red-600">{error}</p>}
            {!loading && !error && goals.length === 0 && (
              <EmptyState
                title="لا توجد أهداف"
                description="أضف هدفاً قصير أو طويل المدى للبدء."
                action={
                  <Button onClick={() => setModalOpen(true)}>إضافة هدف</Button>
                }
              />
            )}
            {!loading && !error && goals.length > 0 && (
              <ul className="divide-y divide-surface-100">
                {goals.map((goal) => (
                  <li
                    key={goal._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-surface-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-surface-800 truncate">{goal.title}</h3>
                      {goal.description && (
                        <p className="text-sm text-surface-500 mt-0.5 line-clamp-2">{goal.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-primary-50 text-primary-700">
                          {TYPE_LABELS[goal.type]}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-surface-100 text-surface-600">
                          {STATUS_LABELS[goal.status]}
                        </span>
                        {goal.deadline && (
                          <span className="text-xs text-surface-500">
                            موعد: {new Date(goal.deadline).toLocaleDateString('ar-EG')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button variant="secondary" size="sm" onClick={() => openEdit(goal)}>
                        تعديل
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setDeleteId(goal._id)}>
                        حذف
                      </Button>
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

      <GoalForm
        isOpen={modalOpen}
        onClose={closeModal}
        initialValues={editingGoal ?? undefined}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="تأكيد الحذف"
        message="هل أنت متأكد من حذف هذا الهدف؟"
        confirmLabel="حذف"
        loading={deleteLoading}
      />
    </>
  );
}
