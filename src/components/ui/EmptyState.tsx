'use client';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div className="mb-4 text-surface-300 text-5xl" aria-hidden>
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-surface-700 mb-1">{title}</h3>
      {description && <p className="text-surface-500 text-sm max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
