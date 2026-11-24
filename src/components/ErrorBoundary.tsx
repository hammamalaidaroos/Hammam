import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'حدث خطأ غير متوقع في التطبيق.',
    };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Application ErrorBoundary caught:', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          className="min-h-screen bg-[#FAF7F2] dark:bg-[#0B0A09] text-[#1B1713] dark:text-[#F5EFE6] flex items-center justify-center p-6"
        >
          <div className="max-w-md w-full bg-white dark:bg-[#141210] border border-[#E4DACD] dark:border-[#2A241E] rounded-2xl p-8 text-center space-y-5">
            <h1 className="font-display text-2xl font-bold text-[#A66824] dark:text-[#D49B54]">
              تعذر تحميل الصفحة
            </h1>
            <p className="text-sm text-[#574E44] dark:text-[#A89F94] leading-relaxed">
              حدث خلل تقني أثناء الاتصال بالبيانات. يمكنك إعادة تحميل الصفحة للمحاولة مجدداً.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-lg bg-[#A66824] dark:bg-[#D49B54] text-white dark:text-[#0B0A09] font-semibold text-sm hover:bg-[#8E571C] dark:hover:bg-[#E0AC69] transition-colors cursor-pointer"
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
