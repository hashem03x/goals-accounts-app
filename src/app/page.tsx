/**
 * Dashboard - summary cards and charts (lazy-loaded).
 */
'use client';

import dynamic from 'next/dynamic';
import { Nav } from '@/components/layout/Nav';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useDashboard } from '@/hooks/useDashboard';

const ChartIncoming = dynamic(
  () => import('@/components/dashboard/ChartIncoming').then((m) => m.ChartIncoming),
  { ssr: false, loading: () => <LoadingSpinner /> }
);
const ChartGoalsStatus = dynamic(
  () => import('@/components/dashboard/ChartGoalsStatus').then((m) => m.ChartGoalsStatus),
  { ssr: false, loading: () => <LoadingSpinner /> }
);

function formatMoney(n: number) {
  return new Intl.NumberFormat('ar-EG', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export default function DashboardPage() {
  const { data, loading, error } = useDashboard();

  if (loading) {
    return (
      <>
        <Nav />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <LoadingSpinner className="min-h-[40vh]" />
        </main>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Nav />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-red-600">{error || 'فشل تحميل البيانات'}</p>
        </main>
      </>
    );
  }

  const { summary, charts } = data;

  return (
    <>
      <Nav />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-surface-800 mb-6">لوحة التحكم</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm text-surface-500 mb-1">إجمالي الوارد</p>
              <p className="text-2xl font-bold text-green-600">{formatMoney(summary.totalIncoming)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm text-surface-500 mb-1">إجمالي الصادر</p>
              <p className="text-2xl font-bold text-red-600">{formatMoney(summary.totalOutgoing)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm text-surface-500 mb-1">الرصيد</p>
              <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-primary-600' : 'text-red-600'}`}>
                {formatMoney(summary.balance)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm text-surface-500 mb-1">الأهداف المعلقة</p>
              <p className="text-2xl font-bold text-primary-600">{summary.pendingGoals}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm text-surface-500 mb-1">الأهداف المكتملة</p>
              <p className="text-2xl font-bold text-surface-700">{summary.completedGoals}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-surface-800">الوارد حسب الشهر</h2>
            </CardHeader>
            <CardContent>
              <ChartIncoming data={charts.incomingByMonth} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-surface-800">الصادر حسب الشهر</h2>
            </CardHeader>
            <CardContent>
              <ChartIncoming data={charts.outgoingByMonth} color="#dc2626" />
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <h2 className="font-semibold text-surface-800">الأهداف حسب الحالة</h2>
          </CardHeader>
          <CardContent>
            <ChartGoalsStatus data={charts.goalsByStatus} />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
