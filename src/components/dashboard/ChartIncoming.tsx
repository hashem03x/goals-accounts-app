'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartIncomingProps {
  data: { label: string; value: number }[];
  color?: string;
}

export function ChartIncoming({ data, color = '#0ea5e9' }: ChartIncomingProps) {
  if (!data?.length) {
    return <p className="text-surface-500 text-sm py-4">لا توجد بيانات</p>;
  }
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}`} />
          <Tooltip formatter={(value: number) => [value, 'المبلغ']} />
          <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} name="المبلغ" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
