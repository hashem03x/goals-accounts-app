'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const STATUS_LABELS: Record<string, string> = {
  pending: 'معلقة',
  'in-progress': 'قيد التنفيذ',
  completed: 'مكتملة',
  cancelled: 'ملغاة',
};

const COLORS = ['#0ea5e9', '#f59e0b', '#22c55e', '#94a3b8'];

interface ChartGoalsStatusProps {
  data: { status: string; count: number }[];
}

export function ChartGoalsStatus({ data }: ChartGoalsStatusProps) {
  if (!data?.length) {
    return <p className="text-surface-500 text-sm py-4">لا توجد بيانات</p>;
  }
  const chartData = data.map((d) => ({
    name: STATUS_LABELS[d.status] || d.status,
    value: d.count,
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, value }) => `${name}: ${value}`}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
