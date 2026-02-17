'use client';

import { useRef } from 'react';
import toast from 'react-hot-toast';
import { backupData, restoreData } from '@/lib/localData';
import { Button } from '@/components/ui/Button';

/**
 * Small control in the navbar to backup/restore all app data.
 * Backup: downloads a JSON file containing goals + accounts.
 * Restore: uploads a JSON file and replaces local data, then reloads the page.
 */
export function BackupControls() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleBackup = () => {
    try {
      const json = backupData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      a.href = url;
      a.download = `goals-accounts-backup-${ts}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('تم إنشاء ملف النسخ الاحتياطي');
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'فشل إنشاء ملف النسخ الاحتياطي'
      );
    }
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      restoreData(text);
      toast.success('تم استعادة البيانات بنجاح، سيتم تحديث الصفحة');
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'فشل استعادة البيانات من الملف'
      );
    } finally {
      // reset so same file can be re-selected if needed
      event.target.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={handleBackup}
      >
        نسخ احتياطي
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={handleRestoreClick}>
        استعادة البيانات من ملف
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

