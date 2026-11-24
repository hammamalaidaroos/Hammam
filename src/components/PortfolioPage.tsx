import { useEffect, useState } from 'react';
import {
  ArrowUpLeft,
  Check,
  Copy,
  ExternalLink,
  Github,
  Lock,
  Menu,
  MessageCircle,
  Moon,
  Sun,
  X,
} from 'lucide-react';
import {
  CONTACT_INFO,
  PortfolioProject,
  SKILLS_LIST,
  SkillItem,
} from '../data/portfolioDefaults';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { ThemeMode } from '../hooks/useTheme';
import { ResilientImage } from './ResilientImage';

type SkillFilter = 'all' | SkillItem['categoryKey'];

interface PortfolioPageProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onNavigateAdmin: () => void;
}

export function PortfolioPage({
  theme,
  onToggleTheme,
  onNavigateAdmin,
}: PortfolioPageProps) {
  const { profile, projects, loading } = usePortfolioData();
  const [skillFilter, setSkillFilter] = useState<SkillFilter>('all');
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedProject(null);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredSkills =
    skillFilter === 'all'
      ? SKILLS_LIST
      : SKILLS_LIST.filter((s) => s.categoryKey === skillFilter);

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_INFO.whatsappNumber);
      setCopiedPhone(true);
      window.setTimeout(() => setCopiedPhone(false), 2200);
    } catch {
      // Clipboard API might be unavailable in restricted contexts
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen overflow-x-hidden bg-[#FAF7F2] dark:bg-[#0B0A09] text-[#1B1713] dark:text-[#F5EFE6] transition-colors duration-200"
    >
      {/* Top Bar Contract: 1 row, 3 clean zones separated by gap-8 */}
      <header className="sticky top-0 z-40 border-b border-[#E4DACD]/90 dark:border-[#2A241E]/80 bg-[#FAF7F2]/90 dark:bg-[#0B0A09]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            className="font-display text-lg sm:text-xl font-bold tracking-tight text-[#1B1713] dark:text-[#F5EFE6] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A66824] dark:focus-visible:ring-[#D49B54] rounded"
          >
            همام العيدروس
          </a>

          {/* Zone 2: 4 concise single-line text nav links */}
          <nav
            aria-label="التنقل الرئيسي"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#574E44] dark:text-[#A89F94]"
          >
            <a
              href="#about"
              className="hover:text-[#1B1713] dark:hover:text-[#F5EFE6] hover:underline underline-offset-8 decoration-[#A66824] dark:decoration-[#D49B54] transition-colors whitespace-nowrap shrink-0"
            >
              نبذة عني
            </a>
            <a
              href="#skills"
              className="hover:text-[#1B1713] dark:hover:text-[#F5EFE6] hover:underline underline-offset-8 decoration-[#A66824] dark:decoration-[#D49B54] transition-colors whitespace-nowrap shrink-0"
            >
              المهارات
            </a>
            <a
              href="#projects"
              className="hover:text-[#1B1713] dark:hover:text-[#F5EFE6] hover:underline underline-offset-8 decoration-[#A66824] dark:decoration-[#D49B54] transition-colors whitespace-nowrap shrink-0"
            >
              المشاريع
            </a>
            <a
              href="#contact"
              className="hover:text-[#1B1713] dark:hover:text-[#F5EFE6] hover:underline underline-offset-8 decoration-[#A66824] dark:decoration-[#D49B54] transition-colors whitespace-nowrap shrink-0"
            >
              تواصل معي
            </a>
          </nav>

          {/* Zone 3: 1 primary action + mobile menu trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={CONTACT_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#A66824] dark:bg-[#D49B54] text-white dark:text-[#0B0A09] text-sm font-semibold hover:bg-[#8E571C] dark:hover:bg-[#E0AC69] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A66824] dark:focus-visible:ring-[#E0AC69]"
            >
              <span>تواصل مباشر</span>
            </a>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
              className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-[#E4DACD] dark:border-[#2A241E] text-[#1B1713] dark:text-[#F5EFE6] hover:border-[#A66824]/60 dark:hover:border-[#D49B54]/60 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <nav
            aria-label="قائمة الجوال"
            className="md:hidden border-t border-[#E4DACD] dark:border-[#2A241E] bg-white dark:bg-[#141210] px-4 py-4 flex flex-col gap-2"
          >
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-lg text-sm font-medium text-[#1B1713] dark:text-[#F5EFE6] hover:bg-[#F3EDE4] dark:hover:bg-[#1E1A16]"
            >
              نبذة عني
            </a>
            <a
              href="#skills"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-lg text-sm font-medium text-[#1B1713] dark:text-[#F5EFE6] hover:bg-[#F3EDE4] dark:hover:bg-[#1E1A16]"
            >
              المهارات
            </a>
            <a
              href="#projects"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-lg text-sm font-medium text-[#1B1713] dark:text-[#F5EFE6] hover:bg-[#F3EDE4] dark:hover:bg-[#1E1A16]"
            >
              المشاريع
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-lg text-sm font-medium text-[#1B1713] dark:text-[#F5EFE6] hover:bg-[#F3EDE4] dark:hover:bg-[#1E1A16]"
            >
              تواصل معي
            </a>
            <a
              href={CONTACT_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 py-2.5 px-4 rounded-lg bg-[#A66824] dark:bg-[#D49B54] text-white dark:text-[#0B0A09] text-sm font-semibold text-center"
            >
              تواصل عبر واتساب
            </a>
          </nav>
        )}
      </header>

      <main id="top">
        {/* 1. HERO SECTION */}
        <section className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-6 pb-12 sm:pt-14 sm:pb-20">
          {/* Hero Utility Toolbar: Theme Switcher */}
          <div className="mb-8 flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-[#A66824] dark:text-[#D49B54] tracking-wide">
              <span>تقنية معلومات</span>
              <span className="mx-2 text-[#B8AC9E] dark:text-[#6B5F52]" aria-hidden="true">
                ·
              </span>
              <span dir="ltr" className="font-mono-tech text-xs sm:text-sm">
                IT Specialist
              </span>
            </p>

            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#E4DACD] dark:border-[#2A241E] bg-white dark:bg-[#141210] text-[#1B1713] dark:text-[#F5EFE6] text-xs sm:text-sm font-medium hover:border-[#A66824] dark:hover:border-[#D49B54] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A66824] dark:focus-visible:ring-[#D49B54]"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-[#D49B54]" />
                  <span>الوضع النهاري</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-[#A66824]" />
                  <span>الوضع الليلي</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Typographic Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <h1 className="font-display text-3xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-[#1B1713] dark:text-[#F5EFE6] leading-[1.2] text-balance">
                  همام عبد القادر علي العيدروس
                </h1>
                <p
                  dir="ltr"
                  className="text-right font-mono-tech text-sm sm:text-base text-[#574E44] dark:text-[#A89F94]"
                >
                  Hammam Abdulqader Ali Al-Aidaroos
                </p>
              </div>

              <p className="text-base sm:text-lg text-[#433B33] dark:text-[#C8BEB2] leading-[1.75] max-w-2xl">
                متخصص في تقنية المعلومات أعمل بشغف على التطوير المستمر وبناء المواقع الإلكترونية
                والأنظمة البرمجية العملية وتطبيقات الهواتف الذكية بأسلوب هندسي منظم يركز على
                الجودة وقابلية التوسع.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a
                  href="#projects"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#A66824] dark:bg-[#D49B54] text-white dark:text-[#0B0A09] text-sm sm:text-base font-bold hover:bg-[#8E571C] dark:hover:bg-[#E0AC69] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A66824] dark:focus-visible:ring-[#E0AC69]"
                >
                  <span>استعراض المشاريع</span>
                  <ArrowUpLeft className="w-4 h-4" />
                </a>

                <a
                  href={CONTACT_INFO.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-[#E4DACD] dark:border-[#2A241E] bg-white dark:bg-[#141210] text-[#1B1713] dark:text-[#F5EFE6] text-sm sm:text-base font-medium hover:border-[#A66824] dark:hover:border-[#D49B54]/60 hover:text-[#A66824] dark:hover:text-[#D49B54] transition-colors whitespace-nowrap shrink-0"
                >
                  <Github className="w-4 h-4" />
                  <span dir="ltr">GitHub</span>
                </a>
              </div>
            </div>

            {/* Dynamic Profile Portrait Column with Subtle Glowing Border & Floating Shadow */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-[22rem] lg:h-[22rem]">
                {/* Animated warm copper-gold glowing aura */}
                <div
                  aria-hidden="true"
                  className="animate-aura-pulse absolute -inset-3 rounded-[2rem] bg-gradient-to-tr from-[#C88A4B]/30 via-[#D49B54]/15 to-[#8C5828]/25 blur-2xl pointer-events-none"
                />

                {/* Subtle floating portrait container */}
                <div className="animate-portrait-float relative w-full h-full rounded-[1.75rem] p-[2px] bg-gradient-to-br from-[#B87832]/70 via-[#D49B54]/30 to-[#8C5828]/60 dark:from-[#D49B54]/70 dark:via-[#D49B54]/20 dark:to-[#8C5828]/60 shadow-[0_24px_60px_-14px_rgba(166,104,36,0.28)] dark:shadow-[0_24px_60px_-14px_rgba(212,155,84,0.3)]">
                  <div className="w-full h-full rounded-[calc(1.75rem-2px)] overflow-hidden bg-white dark:bg-[#141210]">
                    <ResilientImage
                      src={profile.photoUrl}
                      alt={profile.altText}
                      title="Hammam Al-Aidaroos"
                      className="w-full h-full"
                      imgClassName="object-cover object-top"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full-width structural summary strip below hero split */}
          <div className="mt-10 pt-6 sm:mt-14 sm:pt-8 border-t border-[#E4DACD] dark:border-[#2A241E] grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-8">
            <div className="space-y-1.5">
              <p className="font-mono-tech text-xs text-[#A66824] dark:text-[#D49B54]">01</p>
              <h2 className="font-display text-base font-bold text-[#1B1713] dark:text-[#F5EFE6]">
                تطوير الويب والأنظمة
              </h2>
              <p className="text-sm text-[#574E44] dark:text-[#A89F94] leading-relaxed">
                بناء مواقع متجاوبة وأنظمة مكتبية وقواعد بيانات متكاملة تلبي احتياجات العمل.
              </p>
            </div>
            <div className="space-y-1.5">
              <p className="font-mono-tech text-xs text-[#A66824] dark:text-[#D49B54]">02</p>
              <h2 className="font-display text-base font-bold text-[#1B1713] dark:text-[#F5EFE6]">
                تطبيقات Flutter والهواتف
              </h2>
              <p className="text-sm text-[#574E44] dark:text-[#A89F94] leading-relaxed">
                تصميم وبرمجة تطبيقات جوال عملية بواجهات حديثة وسرعة استجابة عالية.
              </p>
            </div>
            <div className="space-y-1.5">
              <p className="font-mono-tech text-xs text-[#A66824] dark:text-[#D49B54]">03</p>
              <h2 className="font-display text-base font-bold text-[#1B1713] dark:text-[#F5EFE6]">
                تعلم وتكيف مستمر
              </h2>
              <p className="text-sm text-[#574E44] dark:text-[#A89F94] leading-relaxed">
                مرونة عالية في استيعاب الأدوات التقنية الجديدة وتوظيفها في مشاريع واقعية.
              </p>
            </div>
          </div>
        </section>

        {/* 2. ABOUT SECTION */}
        <section
          id="about"
          className="border-t border-[#E4DACD] dark:border-[#2A241E] bg-[#F3EDE4] dark:bg-[#100E0C]"
        >
          <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 py-12 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              <div className="lg:col-span-4 space-y-2">
                <p className="text-xs font-mono-tech text-[#A66824] dark:text-[#D49B54]">About</p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1B1713] dark:text-[#F5EFE6]">
                  نبذة عني
                </h2>
              </div>
              <div className="lg:col-span-8 space-y-5 text-base sm:text-lg text-[#433B33] dark:text-[#C8BEB2] leading-[1.85]">
                <p>
                  أؤمن بأن مجال تقنية المعلومات يتطلب فضولاً دائماً وشغفاً حقيقياً بالتعلم
                  المستمر. أركز في عملي على فهم المشكلات التقنية بعمق وتحويلها إلى حلول برمجية
                  واضحة وموثوقة، سواء في تطوير مواقع الويب، أو بناء تطبيقات الهواتف الذكية، أو
                  تصميم الأنظمة الإدارية وقواعد البيانات.
                </p>
                <p className="text-[#574E44] dark:text-[#A89F94]">
                  أمتلك قدرة عالية على التكيف مع بيئات العمل وأدوات التطوير المتنوعة، مع اهتمام
                  دقيق بالتفاصيل وجودة الكود البرمجي وتجربة المستخدم النهائية.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SKILLS SECTION */}
        <section id="skills" className="border-t border-[#E4DACD] dark:border-[#2A241E]">
          <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-8 sm:space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
              <div className="space-y-2">
                <p className="text-xs font-mono-tech text-[#A66824] dark:text-[#D49B54]">
                  Skills &amp; Stack
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1B1713] dark:text-[#F5EFE6]">
                  المهارات والتقنيات
                </h2>
              </div>

              {/* Functional Interactive Filter Controls */}
              <div
                role="tablist"
                aria-label="تصفية المهارات"
                className="flex flex-wrap items-center gap-1 p-1 bg-[#F3EDE4] dark:bg-[#141210] border border-[#E4DACD] dark:border-[#2A241E] rounded-xl"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={skillFilter === 'all'}
                  onClick={() => setSkillFilter('all')}
                  className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    skillFilter === 'all'
                      ? 'bg-[#A66824] dark:bg-[#D49B54] text-white dark:text-[#0B0A09] font-bold'
                      : 'text-[#574E44] dark:text-[#A89F94] hover:text-[#1B1713] dark:hover:text-[#F5EFE6]'
                  }`}
                >
                  الكل ({SKILLS_LIST.length})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={skillFilter === 'web_mobile'}
                  onClick={() => setSkillFilter('web_mobile')}
                  className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    skillFilter === 'web_mobile'
                      ? 'bg-[#A66824] dark:bg-[#D49B54] text-white dark:text-[#0B0A09] font-bold'
                      : 'text-[#574E44] dark:text-[#A89F94] hover:text-[#1B1713] dark:hover:text-[#F5EFE6]'
                  }`}
                >
                  الويب والموبايل
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={skillFilter === 'software'}
                  onClick={() => setSkillFilter('software')}
                  className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    skillFilter === 'software'
                      ? 'bg-[#A66824] dark:bg-[#D49B54] text-white dark:text-[#0B0A09] font-bold'
                      : 'text-[#574E44] dark:text-[#A89F94] hover:text-[#1B1713] dark:hover:text-[#F5EFE6]'
                  }`}
                >
                  البرمجة والأنظمة
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={skillFilter === 'data_cloud'}
                  onClick={() => setSkillFilter('data_cloud')}
                  className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    skillFilter === 'data_cloud'
                      ? 'bg-[#A66824] dark:bg-[#D49B54] text-white dark:text-[#0B0A09] font-bold'
                      : 'text-[#574E44] dark:text-[#A89F94] hover:text-[#1B1713] dark:hover:text-[#F5EFE6]'
                  }`}
                >
                  البيانات والسحابة والشبكات
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredSkills.map((skill) => (
                <div
                  key={skill.id}
                  className="group bg-white dark:bg-[#141210] border border-[#E4DACD] dark:border-[#2A241E] hover:border-[#A66824]/60 dark:hover:border-[#D49B54]/50 rounded-xl p-3.5 sm:p-5 transition-colors flex flex-col justify-between gap-2 sm:gap-3 last:odd:col-span-2 md:last:odd:col-span-1"
                >
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <span className="font-mono-tech text-[11px] sm:text-xs text-[#73685C] dark:text-[#7B7267] group-hover:text-[#A66824] dark:group-hover:text-[#D49B54] transition-colors shrink-0">
                      {skill.id}
                    </span>
                    <span
                      dir="ltr"
                      className="font-mono-tech text-sm sm:text-lg font-semibold text-[#1B1713] dark:text-[#F5EFE6] tracking-tight truncate"
                    >
                      {skill.name}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-sm text-[#574E44] dark:text-[#A89F94] text-right">
                    {skill.categoryLabel}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. PROJECTS SECTION */}
        <section
          id="projects"
          className="border-t border-[#E4DACD] dark:border-[#2A241E] bg-[#F3EDE4] dark:bg-[#100E0C]"
        >
          <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-8 sm:space-y-10">
            <div className="flex items-end justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-mono-tech text-[#A66824] dark:text-[#D49B54]">
                  Selected Works
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1B1713] dark:text-[#F5EFE6]">
                  المشاريع
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#574E44] dark:text-[#A89F94] font-mono-tech">
                {loading ? '...' : `${projects.length} Projects`}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-6">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="bg-white dark:bg-[#141210] border border-[#E4DACD] dark:border-[#2A241E] rounded-xl sm:rounded-2xl overflow-hidden animate-pulse"
                  >
                    <div className="aspect-[4/3] bg-[#E8DFD3] dark:bg-[#1B1815]" />
                    <div className="p-3 sm:p-6 space-y-2.5 sm:space-y-3">
                      <div className="h-3 w-20 sm:w-28 bg-[#E4DACD] dark:bg-[#241F1B] rounded" />
                      <div className="h-5 sm:h-6 w-28 sm:w-44 bg-[#E4DACD] dark:bg-[#241F1B] rounded" />
                      <div className="h-3.5 sm:h-4 w-full bg-[#E4DACD] dark:bg-[#241F1B] rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-6">
                {projects.map((project) => (
                  <article
                    key={project.id}
                    className="group bg-white dark:bg-[#141210] border border-[#E4DACD] dark:border-[#2A241E] hover:border-[#A66824]/60 dark:hover:border-[#D49B54]/50 rounded-xl sm:rounded-2xl overflow-hidden flex flex-col transition-colors min-w-0"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedProject(project)}
                      className="block w-full text-right cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A66824] dark:focus-visible:ring-[#D49B54]"
                    >
                      <ResilientImage
                        src={project.imageUrl}
                        alt={`صورة معاينة مشروع ${project.title}`}
                        title={project.title}
                        className="aspect-[4/3] w-full border-b border-[#E4DACD] dark:border-[#2A241E]"
                        imgClassName="transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    </button>

                    <div className="p-3 sm:p-6 flex-1 flex flex-col justify-between gap-3 sm:gap-5 min-w-0">
                      <div className="space-y-1.5 sm:space-y-3 min-w-0">
                        {/* Unboxed metadata with typographic separator */}
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-[#574E44] dark:text-[#A89F94] min-w-0">
                          <span className="text-[#A66824] dark:text-[#D49B54] font-medium truncate">
                            {project.category}
                          </span>
                          <span className="hidden sm:inline" aria-hidden="true">
                            ·
                          </span>
                          <span
                            dir="ltr"
                            className="hidden sm:inline font-mono-tech truncate max-w-full"
                          >
                            {project.techStack}
                          </span>
                        </div>

                        <h3
                          dir="ltr"
                          className="text-right font-display text-sm sm:text-xl font-bold text-[#1B1713] dark:text-[#F5EFE6] truncate"
                        >
                          {project.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-[#433B33] dark:text-[#C8BEB2] leading-relaxed line-clamp-2 sm:line-clamp-3">
                          {project.description}
                        </p>
                      </div>

                      <div className="pt-2.5 sm:pt-4 border-t border-[#E4DACD] dark:border-[#2A241E] flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedProject(project)}
                          className="text-xs sm:text-sm font-semibold text-[#A66824] dark:text-[#D49B54] hover:text-[#8E571C] dark:hover:text-[#E0AC69] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                        >
                          التفاصيل
                        </button>

                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`مستودع GitHub لمشروع ${project.title}`}
                            className="inline-flex items-center gap-1 text-[11px] sm:text-sm text-[#574E44] dark:text-[#A89F94] hover:text-[#1B1713] dark:hover:text-[#F5EFE6] transition-colors whitespace-nowrap shrink-0"
                          >
                            <Github className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span dir="ltr" className="hidden sm:inline">
                              GitHub
                            </span>
                            <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                ))}

                {/* Symmetrical 2-column filler card when project count is odd so zero empty space remains */}
                {projects.length % 2 !== 0 && (
                  <div className="bg-white/60 dark:bg-[#141210]/70 border border-dashed border-[#D4C5B2] dark:border-[#342C24] rounded-xl sm:rounded-2xl p-4 sm:p-8 flex flex-col items-center justify-center text-center gap-3 sm:gap-4 min-h-[210px] sm:min-h-[320px]">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#FAF7F2] dark:bg-[#1B1815] border border-[#E4DACD] dark:border-[#2A241E] flex items-center justify-center text-[#A66824] dark:text-[#D49B54]">
                      <Github className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="space-y-1.5 max-w-xs">
                      <h3 className="font-display text-sm sm:text-lg font-bold text-[#1B1713] dark:text-[#F5EFE6]">
                        المزيد من المشاريع قريباً
                      </h3>
                      <p className="text-[11px] sm:text-sm text-[#574E44] dark:text-[#A89F94] leading-relaxed">
                        أعمل باستمرار على تطوير أنظمة وتطبيقات جديدة ومشاركتها هنا.
                      </p>
                    </div>
                    <a
                      href={CONTACT_INFO.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-[#E4DACD] dark:border-[#2A241E] bg-white dark:bg-[#191613] text-[11px] sm:text-xs font-semibold text-[#A66824] dark:text-[#D49B54] hover:border-[#A66824] dark:hover:border-[#D49B54] transition-colors whitespace-nowrap"
                    >
                      <span dir="ltr">GitHub</span>
                      <ArrowUpLeft className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {projects.length % 2 === 0 && (
              <div className="pt-4 border-t border-[#E4DACD] dark:border-[#2A241E]/70 flex items-center justify-between text-sm text-[#574E44] dark:text-[#A89F94]">
                <p>المزيد من المشاريع قريباً</p>
                <span dir="ltr" className="font-mono-tech text-xs text-[#73685C] dark:text-[#7B7267]">
                  More projects coming soon
                </span>
              </div>
            )}
          </div>
        </section>

        {/* 5. CONTACT SECTION */}
        <section id="contact" className="border-t border-[#E4DACD] dark:border-[#2A241E]">
          <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-8 sm:space-y-10">
            <div className="space-y-2">
              <p className="text-xs font-mono-tech text-[#A66824] dark:text-[#D49B54]">Contact</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1B1713] dark:text-[#F5EFE6]">
                تواصل معي
              </h2>
              <p className="text-base text-[#574E44] dark:text-[#A89F94] max-w-xl">
                يسعدني تواصلكم لمناقشة المشاريع البرمجية أو فرص التعاون في تطوير المواقع
                والتطبيقات والأنظمة.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* WhatsApp Card */}
              <div className="bg-white dark:bg-[#141210] border border-[#E4DACD] dark:border-[#2A241E] rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#A66824] dark:text-[#D49B54]">
                      مراسلة فورية
                    </span>
                    <MessageCircle className="w-5 h-5 text-[#A66824] dark:text-[#D49B54]" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-[#1B1713] dark:text-[#F5EFE6]">
                    WhatsApp
                  </h3>
                  <p
                    dir="ltr"
                    className="text-right font-mono-tech text-lg text-[#433B33] dark:text-[#C8BEB2]"
                  >
                    {CONTACT_INFO.whatsappNumber}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={CONTACT_INFO.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#A66824] dark:bg-[#D49B54] text-white dark:text-[#0B0A09] text-sm font-bold hover:bg-[#8E571C] dark:hover:bg-[#E0AC69] transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>فتح محادثة واتساب</span>
                    <ArrowUpLeft className="w-4 h-4" />
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#E4DACD] dark:border-[#2A241E] text-sm font-medium text-[#433B33] dark:text-[#C8BEB2] hover:border-[#A66824] dark:hover:border-[#D49B54]/60 hover:text-[#1B1713] dark:hover:text-[#F5EFE6] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {copiedPhone ? (
                      <>
                        <Check className="w-4 h-4 text-[#A66824] dark:text-[#D49B54]" />
                        <span>تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>نسخ الرقم</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* GitHub Card */}
              <div className="bg-white dark:bg-[#141210] border border-[#E4DACD] dark:border-[#2A241E] rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#A66824] dark:text-[#D49B54]">
                      المستودعات البرمجية
                    </span>
                    <Github className="w-5 h-5 text-[#A66824] dark:text-[#D49B54]" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-[#1B1713] dark:text-[#F5EFE6]">
                    GitHub
                  </h3>
                  <p
                    dir="ltr"
                    className="text-right font-mono-tech text-lg text-[#433B33] dark:text-[#C8BEB2]"
                  >
                    @{CONTACT_INFO.githubHandle}
                  </p>
                </div>

                <div>
                  <a
                    href={CONTACT_INFO.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#E4DACD] dark:border-[#2A241E] bg-[#FAF7F2] dark:bg-[#191613] text-[#1B1713] dark:text-[#F5EFE6] text-sm font-semibold hover:border-[#A66824] dark:hover:border-[#D49B54]/70 hover:text-[#A66824] dark:hover:text-[#D49B54] transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>زيارة حساب GitHub</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Editorial Footer with Admin Dashboard & Theme Switcher */}
      <footer className="border-t border-[#E4DACD] dark:border-[#2A241E] bg-[#FAF7F2] dark:bg-[#0B0A09]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-[#73685C] dark:text-[#7B7267]">
          <p>© {new Date().getFullYear()} همام عبد القادر علي العيدروس · تقنية معلومات</p>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <a
              href={CONTACT_INFO.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#A66824] dark:hover:text-[#D49B54] transition-colors whitespace-nowrap"
            >
              GitHub
            </a>
            <a
              href={CONTACT_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#A66824] dark:hover:text-[#D49B54] transition-colors whitespace-nowrap"
            >
              WhatsApp
            </a>
            <button
              type="button"
              onClick={onNavigateAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E4DACD] dark:border-[#2A241E] bg-white dark:bg-[#141210] text-[#574E44] dark:text-[#A89F94] hover:border-[#A66824] dark:hover:border-[#D49B54] hover:text-[#1B1713] dark:hover:text-[#F5EFE6] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Lock className="w-3.5 h-3.5 text-[#A66824] dark:text-[#D49B54]" />
              <span>لوحة التحكم</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Project Detail Lightbox Modal */}
      {selectedProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-white dark:bg-[#141210] border border-[#E4DACD] dark:border-[#2A241E] rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedProject(null)}
              aria-label="إغلاق النافذة"
              className="absolute top-4 left-4 z-20 w-10 h-10 rounded-lg bg-white/90 dark:bg-[#0B0A09]/85 border border-[#E4DACD] dark:border-[#2A241E] text-[#1B1713] dark:text-[#F5EFE6] hover:border-[#A66824] dark:hover:border-[#D49B54] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <ResilientImage
              src={selectedProject.imageUrl}
              alt={`صورة تفصيلية لمشروع ${selectedProject.title}`}
              title={selectedProject.title}
              className="aspect-[16/10] w-full border-b border-[#E4DACD] dark:border-[#2A241E]"
            />

            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#574E44] dark:text-[#A89F94]">
                <span className="text-[#A66824] dark:text-[#D49B54] font-medium">
                  {selectedProject.category}
                </span>
                <span aria-hidden="true">·</span>
                <span dir="ltr" className="font-mono-tech">
                  {selectedProject.techStack}
                </span>
              </div>

              <h3
                id="project-modal-title"
                dir="ltr"
                className="text-right font-display text-2xl font-bold text-[#1B1713] dark:text-[#F5EFE6]"
              >
                {selectedProject.title}
              </h3>

              <p className="text-sm sm:text-base text-[#433B33] dark:text-[#C8BEB2] leading-relaxed">
                {selectedProject.description}
              </p>

              <div className="pt-4 border-t border-[#E4DACD] dark:border-[#2A241E] flex flex-wrap items-center justify-between gap-4">
                {selectedProject.githubUrl ? (
                  <a
                    href={selectedProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#A66824] dark:bg-[#D49B54] text-white dark:text-[#0B0A09] text-sm font-bold hover:bg-[#8E571C] dark:hover:bg-[#E0AC69] transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    <span dir="ltr">GitHub Repository</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <span className="text-xs text-[#73685C] dark:text-[#7B7267]">
                    لا يوجد رابط مستودع مرفق
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2 rounded-lg border border-[#E4DACD] dark:border-[#2A241E] text-sm text-[#574E44] dark:text-[#A89F94] hover:text-[#1B1713] dark:hover:text-[#F5EFE6] transition-colors cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
