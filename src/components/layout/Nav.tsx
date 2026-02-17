'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { BackupControls } from '@/components/settings/BackupControls';

const links = [
  { href: '/', label: 'لوحة التحكم' },
  { href: '/goals', label: 'الأهداف' },
  { href: '/accounts', label: 'الحسابات' },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="bg-white border-b border-surface-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link
            href="/"
            className="text-lg sm:text-xl font-bold text-primary-600"
          >
            أهدافي وحساباتي
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <ul className="flex gap-1">
              {links.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive(href)
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-surface-600 hover:bg-surface-100 hover:text-surface-800'}
                    `}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            <BackupControls />
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg
                       text-surface-600 hover:bg-surface-100 transition"
            aria-label="Toggle Menu"
          >
            <div className="space-y-1.5">
              <span className={`block h-0.5 w-6 bg-current transition ${open ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 w-6 bg-current transition ${open ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-6 bg-current transition ${open ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`
          md:hidden overflow-hidden transition-all duration-300
          ${open ? 'max-h-96 border-t border-surface-200' : 'max-h-0'}
        `}
      >
        <div className="px-4 py-3 space-y-2 bg-white">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`
                block px-4 py-3 rounded-lg text-sm font-medium transition
                ${isActive(href)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-surface-600 hover:bg-surface-100'}
              `}
            >
              {label}
            </Link>
          ))}

          {/* Divider */}
          <div className="pt-3 border-t border-surface-200">
            <BackupControls />
          </div>
        </div>
      </div>
    </nav>
  );
}
