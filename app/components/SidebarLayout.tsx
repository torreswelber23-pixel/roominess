// Copyright (c) Meta Platforms, Inc. and affiliates.
//
// This source code is licensed under the MIT license found in the
// LICENSE file in the root directory of this source tree.

'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Settings,
  Webhook,
  MessageSquare,
  Building2,
  Mail,
  LayoutDashboard,
  Users,
  History,
  PhoneCall,
  CalendarDays,
} from 'lucide-react';

import { cn } from '@/lib/utils';

interface SidebarLayoutProps {
  children: ReactNode;
  userId: string;
  logoUrl?: string;
  appName: string;
}

const navSections = [
  {
    title: 'Operacao',
    items: [
      {
        label: 'Visao geral',
        description: 'Funil, conversas e proximas acoes',
        href: '/overview',
        Icon: LayoutDashboard,
      },
      {
        label: 'Inbox WhatsApp',
        description: 'Mensagens e chamadas em tempo real',
        href: '/my-inbox',
        Icon: MessageSquare,
      },
      {
        label: 'Leads',
        description: 'Qualificacao e pipeline comercial',
        href: '/leads',
        Icon: Users,
      },
      {
        label: 'Historico',
        description: 'Linha do tempo das conversas',
        href: '/history',
        Icon: History,
      },
      {
        label: 'Voz e chamadas',
        description: 'Permissoes, chamadas e agente de voz',
        href: '/voice',
        Icon: PhoneCall,
      },
      {
        label: 'Agendamentos',
        description: 'Estrutura preparada para visitas',
        href: '/appointments',
        Icon: CalendarDays,
      },
    ],
  },
  {
    title: 'Configuracao',
    items: [
      {
        label: 'Meta e onboarding',
        description: 'Embedded Signup e ativos conectados',
        href: '/',
        Icon: Settings,
      },
      {
        label: 'Webhooks',
        description: 'Inspecao tecnica de eventos recebidos',
        href: '/my-webhooks',
        Icon: Webhook,
      },
      {
        label: 'Templates',
        description: 'Mensagens aprovadas e campanhas',
        href: '/paid_messaging',
        Icon: Mail,
      },
      {
        label: 'Contas WhatsApp',
        description: 'WABAs e numeros conectados',
        href: '/my-wabas',
        Icon: Building2,
      },
    ],
  },
];

export default function SidebarLayout({ children, userId, appName }: SidebarLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="h-screen flex flex-col bg-[#f6f7f5] overflow-hidden">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-slate-900 focus:shadow-lg">
        Pular para o conteudo
      </a>
      {/* Top Header Bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          {/* Inline SVG logo — chat bubble + centered lightning bolt */}
          <svg
            width="27"
            height="27"
            viewBox="0 0 256 256"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label={appName}
            className="flex-shrink-0"
          >
            <defs>
              <linearGradient id="logo-grad" x1="37" y1="37" x2="219" y2="219" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366F1" />
                <stop offset="1" stopColor="#7C3AED" />
              </linearGradient>
            </defs>
            {/* Rounded-rect chat bubble */}
            <path
              d="M37 55C37 44.8 44.8 37 55 37H201C211.2 37 219 44.8 219 55V165C219 175.2 211.2 183 201 183H146L101 219V183H55C44.8 183 37 175.2 37 165V55Z"
              fill="url(#logo-grad)"
            />
            {/* Lightning bolt — centered */}
            <path d="M137 55L96 119H128L110 165L160 101H128L137 55Z" fill="white" />
          </svg>
          <div>
            <span className="block font-semibold text-slate-800 tracking-tight">Homes AI</span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-700">Roominess</span>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <a href="/privacy" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
            Privacidade
          </a>
          <span className="text-sm font-medium text-slate-600">{userId}</span>

          <a
            href="/auth/logout"
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Sair
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </a>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 bg-[#eef1ed] border-r border-[#dfe5de] flex flex-col flex-shrink-0">
          <nav className="flex-1 py-4 overflow-y-auto">
            {navSections.map((section) => (
              <div key={section.title} className="mb-4">
                <h3 className="px-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  {section.title}
                </h3>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-start gap-3 px-5 py-2 text-sm transition-colors',
                          isActive ? 'bg-white shadow-sm' : 'hover:bg-white/70',
                        )}
                      >
                        <span className={cn('mt-0.5 flex-shrink-0', isActive ? 'text-emerald-700' : 'text-slate-500')}>
                          <item.Icon className="w-4 h-4" />
                        </span>
                        <div>
                          <span className="text-[14px] font-semibold text-slate-700 block leading-snug">
                            {item.label}
                          </span>
                          {item.description && (
                            <p className="text-[12px] text-gray-400 mt-0.5 leading-snug">{item.description}</p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main id="main-content" className="flex-1 min-w-0 min-h-0 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
