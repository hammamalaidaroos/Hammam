/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useEffect, useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PortfolioPage } from './components/PortfolioPage';
import { useTheme } from './hooks/useTheme';

const AdminDashboard = lazy(() =>
  import('./components/AdminDashboard').then((mod) => ({ default: mod.AdminDashboard }))
);

function isAdminPath(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, '');
  return normalized === '/admin';
}

export default function App() {
  const [pathname, setPathname] = useState<string>(() => window.location.pathname);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const isAdmin = isAdminPath(pathname);

  useEffect(() => {
    const robotsMeta = document.querySelector('meta[name="robots"]');
    if (robotsMeta) {
      robotsMeta.setAttribute('content', isAdmin ? 'noindex, nofollow' : 'index, follow');
    }
  }, [isAdmin]);

  const navigate = (targetPath: string) => {
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
      setPathname(targetPath);
      window.scrollTo({ top: 0 });
    }
  };

  return (
    <ErrorBoundary>
      {isAdmin ? (
        <Suspense
          fallback={
            <div
              dir="rtl"
              className="min-h-screen bg-[#FAF7F2] dark:bg-[#0B0A09] text-[#574E44] dark:text-[#A89F94] flex items-center justify-center p-6 text-sm"
            >
              جاري تحميل لوحة التحكم...
            </div>
          }
        >
          <AdminDashboard
            theme={theme}
            onToggleTheme={toggleTheme}
            onNavigateHome={() => navigate('/')}
          />
        </Suspense>
      ) : (
        <PortfolioPage
          theme={theme}
          onToggleTheme={toggleTheme}
          onNavigateAdmin={() => navigate('/admin')}
        />
      )}
    </ErrorBoundary>
  );
}
