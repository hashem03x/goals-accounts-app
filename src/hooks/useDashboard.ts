/**
 * Custom hook for dashboard data computed from localStorage.
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { readData } from '@/lib/localData';

export interface DashboardData {
  summary: {
    totalIncoming: number;
    totalOutgoing: number;
    balance: number;
    pendingGoals: number;
    completedGoals: number;
  };
  charts: {
    incomingByMonth: { label: string; value: number }[];
    outgoingByMonth: { label: string; value: number }[];
    goalsByStatus: { status: string; count: number }[];
  };
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const all = readData();
      const { goals, accounts } = all;

      const totalIncoming = accounts
        .filter((a) => a.type === 'incoming')
        .reduce((sum, a) => sum + a.amount, 0);
      const totalOutgoing = accounts
        .filter((a) => a.type === 'outgoing')
        .reduce((sum, a) => sum + a.amount, 0);

      const pendingGoals = goals.filter(
        (g) => g.status === 'pending' || g.status === 'in-progress'
      ).length;
      const completedGoals = goals.filter(
        (g) => g.status === 'completed'
      ).length;

      // Group accounts by month (YYYY-MM)
      const incomingByMonthMap = new Map<string, number>();
      const outgoingByMonthMap = new Map<string, number>();

      for (const acc of accounts) {
        const d = new Date(acc.date);
        if (Number.isNaN(d.getTime())) continue;
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          '0'
        )}`;
        if (acc.type === 'incoming') {
          incomingByMonthMap.set(
            key,
            (incomingByMonthMap.get(key) ?? 0) + acc.amount
          );
        } else {
          outgoingByMonthMap.set(
            key,
            (outgoingByMonthMap.get(key) ?? 0) + acc.amount
          );
        }
      }

      const incomingByMonth = Array.from(incomingByMonthMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([label, value]) => ({ label, value }));

      const outgoingByMonth = Array.from(outgoingByMonthMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([label, value]) => ({ label, value }));

      // Goals by status
      const statusCounts = new Map<string, number>();
      for (const g of goals) {
        statusCounts.set(g.status, (statusCounts.get(g.status) ?? 0) + 1);
      }
      const goalsByStatus = Array.from(statusCounts.entries()).map(
        ([status, count]) => ({ status, count })
      );

      setData({
        summary: {
          totalIncoming,
          totalOutgoing,
          balance: totalIncoming - totalOutgoing,
          pendingGoals,
          completedGoals,
        },
        charts: {
          incomingByMonth,
          outgoingByMonth,
          goalsByStatus,
        },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل تحميل لوحة التحكم');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { data, loading, error, refetch: fetchDashboard };
}
