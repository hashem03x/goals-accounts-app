/**
 * Custom hook for accounts CRUD backed by localStorage (no backend).
 * Handles search, filtering, sorting, and pagination on the client.
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { readData, writeData, generateId, type Account } from '@/lib/localData';

export interface AccountsFilters {
  type?: string;
  search?: string;
  from?: string;
  to?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export function useAccounts(initialFilters: AccountsFilters = {}) {
  const [filters, setFilters] = useState<AccountsFilters>(initialFilters);
  const [data, setData] = useState<Account[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      const allAccounts = readData().accounts;
      let list = [...allAccounts];

      // Filtering
      if (filters.type) {
        list = list.filter((a) => a.type === filters.type);
      }
      if (filters.search) {
        const q = filters.search.trim().toLowerCase();
        if (q) {
          list = list.filter(
            (a) =>
              a.personName.toLowerCase().includes(q) ||
              (a.notes ?? '').toLowerCase().includes(q)
          );
        }
      }
      if (filters.from) {
        list = list.filter((a) => a.date >= filters.from!);
      }
      if (filters.to) {
        list = list.filter((a) => a.date <= filters.to!);
      }

      // Sorting
      const sort = filters.sort || '-date';
      list.sort((a, b) => {
        switch (sort) {
          case 'date':
            return a.date.localeCompare(b.date);
          case '-date':
            return b.date.localeCompare(a.date);
          case 'amount':
            return a.amount - b.amount;
          case '-amount':
            return b.amount - a.amount;
          case 'personName':
            return a.personName.localeCompare(b.personName, 'ar');
          case '-personName':
            return b.personName.localeCompare(a.personName, 'ar');
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
      setError(e instanceof Error ? e.message : 'فشل تحميل السجلات');
    } finally {
      setLoading(false);
    }
  }, [filters.type, filters.search, filters.from, filters.to, filters.sort, filters.page, filters.limit]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const createAccount = useCallback(
    async (body: Partial<Account>) => {
      const now = new Date().toISOString();
      const dataAll = readData();
      const account: Account = {
        _id: generateId(),
        personName: body.personName?.trim() || '',
        amount: Number(body.amount ?? 0),
        phone: body.phone?.trim() || '',
        type: body.type || 'incoming',
        notes: body.notes?.trim() || '',
        date: body.date || now,
        createdAt: now,
        updatedAt: now,
      };
      dataAll.accounts.unshift(account);
      writeData(dataAll);
      fetchAccounts();
    },
    [fetchAccounts]
  );

  const updateAccount = useCallback(
    async (id: string, body: Partial<Account>) => {
      const dataAll = readData();
      const idx = dataAll.accounts.findIndex((a) => a._id === id);
      if (idx === -1) return;
      const current = dataAll.accounts[idx];
      const updated: Account = {
        ...current,
        ...body,
        personName:
          body.personName !== undefined
            ? body.personName.trim()
            : current.personName,
        phone:
          body.phone !== undefined ? body.phone.trim() : current.phone,
        notes:
          body.notes !== undefined ? body.notes.trim() : current.notes,
        amount:
          body.amount !== undefined ? Number(body.amount) : current.amount,
        updatedAt: new Date().toISOString(),
      };
      dataAll.accounts[idx] = updated;
      writeData(dataAll);
      fetchAccounts();
    },
    [fetchAccounts]
  );

  const deleteAccount = useCallback(
    async (id: string) => {
      const dataAll = readData();
      dataAll.accounts = dataAll.accounts.filter((a) => a._id !== id);
      writeData(dataAll);
      fetchAccounts();
    },
    [fetchAccounts]
  );

  return {
    accounts: data,
    pagination,
    loading,
    error,
    setFilters,
    refetch: fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
  };
}
