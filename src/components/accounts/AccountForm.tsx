'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { Account } from '@/hooks/useAccounts';

interface AccountFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialValues?: Account | null;
  onSubmit: (values: Partial<Account>) => Promise<void>;
}

const defaultValues = {
  personName: '',
  amount: 0,
  phone: '',
  type: 'incoming' as const,
  notes: '',
  date: new Date().toISOString().slice(0, 10),
};

export function AccountForm({ isOpen, onClose, initialValues, onSubmit }: AccountFormProps) {
  const [personName, setPersonName] = useState(defaultValues.personName);
  const [amount, setAmount] = useState(defaultValues.amount);
  const [phone, setPhone] = useState(defaultValues.phone);
  const [type, setType] = useState<Account['type']>(defaultValues.type);
  const [notes, setNotes] = useState(defaultValues.notes);
  const [date, setDate] = useState(defaultValues.date);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialValues) {
      setPersonName(initialValues.personName);
      setAmount(initialValues.amount);
      setPhone(initialValues.phone ?? '');
      setType(initialValues.type);
      setNotes(initialValues.notes ?? '');
      setDate(initialValues.date ? initialValues.date.slice(0, 10) : defaultValues.date);
    } else {
      setPersonName(defaultValues.personName);
      setAmount(defaultValues.amount);
      setPhone(defaultValues.phone);
      setType(defaultValues.type);
      setNotes(defaultValues.notes);
      setDate(defaultValues.date);
    }
  }, [initialValues, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim() || amount < 0) return;
    setLoading(true);
    try {
      await onSubmit({
        personName: personName.trim(),
        amount: Number(amount),
        phone: phone.trim() || undefined,
        type,
        notes: notes.trim() || undefined,
        date: new Date(date).toISOString(),
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
      title={initialValues ? 'تعديل السجل' : 'إضافة سجل'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">اسم الشخص *</label>
          <input
            type="text"
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            className="w-full rounded-lg border border-surface-200 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
            maxLength={150}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">المبلغ *</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              className="w-full rounded-lg border border-surface-200 px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">النوع</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as Account['type'])}
              className="w-full rounded-lg border border-surface-200 px-3 py-2"
            >
              <option value="incoming">وارد</option>
              <option value="outgoing">صادر</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">الهاتف</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-surface-200 px-3 py-2"
            maxLength={20}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">التاريخ</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-surface-200 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">ملاحظات</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-surface-200 px-3 py-2"
            rows={2}
            maxLength={1000}
          />
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" loading={loading} disabled={!personName.trim() || amount < 0}>
            {initialValues ? 'حفظ التعديلات' : 'إضافة'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
