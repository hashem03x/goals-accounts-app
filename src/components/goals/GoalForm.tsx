'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Goal } from '@/lib/localData';

interface GoalFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialValues?: Goal | null;
  onSubmit: (values: Partial<Goal>) => Promise<void>;
}

const defaultValues = {
  title: '',
  description: '',
  type: 'short-term' as const,
  deadline: '',
  status: 'pending' as const,
};

export function GoalForm({ isOpen, onClose, initialValues, onSubmit }: GoalFormProps) {
  const [title, setTitle] = useState(defaultValues.title);
  const [description, setDescription] = useState(defaultValues.description);
  const [type, setType] = useState<Goal['type']>(defaultValues.type);
  const [deadline, setDeadline] = useState(defaultValues.deadline);
  const [status, setStatus] = useState<Goal['status']>(defaultValues.status);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialValues) {
      setTitle(initialValues.title);
      setDescription(initialValues.description ?? '');
      setType(initialValues.type);
      setDeadline(initialValues.deadline ? initialValues.deadline.slice(0, 10) : '');
      setStatus(initialValues.status);
    } else {
      setTitle(defaultValues.title);
      setDescription(defaultValues.description);
      setType(defaultValues.type);
      setDeadline(defaultValues.deadline);
      setStatus(defaultValues.status);
    }
  }, [initialValues, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        status,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialValues ? 'تعديل الهدف' : 'إضافة هدف'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">العنوان *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-surface-200 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
            maxLength={200}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">الوصف</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-surface-200 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            rows={3}
            maxLength={2000}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">النوع</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as Goal['type'])}
              className="w-full rounded-lg border border-surface-200 px-3 py-2"
            >
              <option value="short-term">قصير المدى</option>
              <option value="long-term">طويل المدى</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">الحالة</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Goal['status'])}
              className="w-full rounded-lg border border-surface-200 px-3 py-2"
            >
              <option value="pending">معلقة</option>
              <option value="in-progress">قيد التنفيذ</option>
              <option value="completed">مكتملة</option>
              <option value="cancelled">ملغاة</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">الموعد النهائي</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full rounded-lg border border-surface-200 px-3 py-2"
          />
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" loading={loading} disabled={!title.trim()}>
            {initialValues ? 'حفظ التعديلات' : 'إضافة'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
