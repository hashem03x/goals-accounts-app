/**
 * Custom hook for goals CRUD backed by localStorage (no backend).
 * Handles filtering, sorting, and pagination on the client.
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { readData, writeData, generateId, type Goal } from '@/lib/localData';

export interface GoalsFilters {
  type?: string;
  status?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export function useGoals(initialFilters: GoalsFilters = {}) {
  const [filters, setFilters] = useState<GoalsFilters>(initialFilters);
  const [data, setData] = useState<Goal[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      const allGoals = readData().goals;
      let list = [...allGoals];

      // Filtering
      if (filters.type) {
        list = list.filter((g) => g.type === filters.type);
      }
      if (filters.status) {
        list = list.filter((g) => g.status === filters.status);
      }

      // Sorting
      const sort = filters.sort || '-createdAt';
      list.sort((a, b) => {
        switch (sort) {
          case 'createdAt':
            return a.createdAt.localeCompare(b.createdAt);
          case '-createdAt':
            return b.createdAt.localeCompare(a.createdAt);
          case 'deadline':
            return (a.deadline || '').localeCompare(b.deadline || '');
          case '-deadline':
            return (b.deadline || '').localeCompare(a.deadline || '');
          case 'title':
            return a.title.localeCompare(b.title, 'ar');
          case '-title':
            return b.title.localeCompare(a.title, 'ar');
          default:
            return 0;
        }
      });

      // Pagination
      const page = filters.page && filters.page > 0 ? filters.page : 1;
      const limit = filters.limit && filters.limit > 0 ? filters.limit : 20;
      const total = list.length;
      const pages = total === 0 ? 0 : Math.ceil(total / limit);
      const start = (page - 1) * limit;
      const items = list.slice(start, start + limit);

      setData(items);
      setPagination({ page, limit, total, pages });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل تحميل الأهداف');
    } finally {
      setLoading(false);
    }
  }, [filters.type, filters.status, filters.sort, filters.page, filters.limit]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const createGoal = useCallback(
    async (body: Partial<Goal>) => {
      const now = new Date().toISOString();
      const data = readData();
      const goal: Goal = {
        _id: generateId(),
        title: body.title?.trim() || '',
        description: body.description?.trim() || '',
        type: body.type || 'short-term',
        deadline: body.deadline,
        status: body.status || 'pending',
        createdAt: now,
        updatedAt: now,
      };
      data.goals.unshift(goal);
      writeData(data);
      fetchGoals();
    },
    [fetchGoals]
  );

  const updateGoal = useCallback(
    async (id: string, body: Partial<Goal>) => {
      const dataAll = readData();
      const idx = dataAll.goals.findIndex((g) => g._id === id);
      if (idx === -1) return;
      const current = dataAll.goals[idx];
      const updated: Goal = {
        ...current,
        ...body,
        title: body.title !== undefined ? body.title.trim() : current.title,
        description:
          body.description !== undefined
            ? body.description.trim()
            : current.description,
        updatedAt: new Date().toISOString(),
      };
      dataAll.goals[idx] = updated;
      writeData(dataAll);
      fetchGoals();
    },
    [fetchGoals]
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      const dataAll = readData();
      dataAll.goals = dataAll.goals.filter((g) => g._id !== id);
      writeData(dataAll);
      fetchGoals();
    },
    [fetchGoals]
  );

  return {
    goals: data,
    pagination,
    loading,
    error,
    setFilters,
    refetch: fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
  };
}
