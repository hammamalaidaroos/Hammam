import React, { useEffect, useRef, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import {
  ArrowRight,
  CheckCircle2,
  Edit3,
  ExternalLink,
  FolderPlus,
  ImagePlus,
  LogOut,
  Moon,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sun,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  ADMIN_EMAIL,
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  storage,
} from '../firebase';
import {
  DEFAULT_PROFILE,
  DEFAULT_PROJECTS,
  PortfolioProject,
  VALIDATION_LIMITS,
} from '../data/portfolioDefaults';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { ThemeMode } from '../hooks/useTheme';
import { ResilientImage } from './ResilientImage';

interface AdminDashboardProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onNavigateHome: () => void;
}

interface ProjectFormState {
  title: string;
  category: string;
  techStack: string;
  description: string;
  githubUrl: string;
  imageUrl: string;
  sortOrder: number;
}

const EMPTY_FORM: ProjectFormState = {
  title: '',
  category: 'تطوير الويب',
  techStack: '',
  description: '',
  githubUrl: '',
  imageUrl: '',
  sortOrder: 1,
};

const BUILTIN_PROJECT_COVERS = [
  {
    label: 'غلاف أثاث / ويب',
    url: '/src/assets/images/project_deep_sleep_1795528739742.jpg',
  },
  {
    label: 'غلاف تطبيق جوال',
    url: '/src/assets/images/project_task_manager_1795528739335.jpg',
  },
  {
    label: 'غلاف نظام مكتبي',
    url: '/src/assets/images/project_supermarket_system_1795528740072.jpg',
  },
];

export function AdminDashboard({
  theme,
  onToggleTheme,
  onNavigateHome,
}: AdminDashboardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthorizedAdmin, setIsAuthorizedAdmin] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const { profile, projects, usingFallbackProjects, loading: dataLoading } = usePortfolioData();

  // Profile photo state
  const [altTextInput, setAltTextInput] = useState(DEFAULT_PROFILE.altText);
  const [photoProgress, setPhotoProgress] = useState<number | null>(null);
  const [photoStatus, setPhotoStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const photoFileRef = useRef<HTMLInputElement>(null);

  // Project CRUD state
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [formState, setFormState] = useState<ProjectFormState>(EMPTY_FORM);
  const [savingProject, setSavingProject] = useState(false);
  const [seedingDefaults, setSeedingDefaults] = useState(false);
  const [coverUploadProgress, setCoverUploadProgress] = useState<number | null>(null);
  const [projectStatus, setProjectStatus] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAltTextInput(profile.altText);
  }, [profile.altText]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthError(null);

      if (!currentUser || !currentUser.emailVerified) {
        setIsAuthorizedAdmin(false);
        setAuthLoading(false);
        return;
      }

      const authorized = currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      setIsAuthorizedAdmin(authorized);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const message =
        err instanceof Error && err.message.includes('popup-closed-by-user')
          ? 'تم إغلاق نافذة تسجيل الدخول قبل إتمام العملية.'
          : 'تعذر تسجيل الدخول عبر Google. تأكد من السماح بالنوافذ المنبثقة وحاول مجدداً.';
      setAuthError(message);
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const uploadImageToStorage = (
    file: File,
    folder: 'profile' | 'projects',
    onProgress: (pct: number) => void
  ): Promise<{ url: string; storagePath: string }> => {
    return new Promise((resolve, reject) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        reject(new Error('يرجى اختيار صورة بصيغة JPG أو PNG أو WebP فقط.'));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('حجم الصورة يجب ألا يتجاوز 5 ميجابايت.'));
        return;
      }

      const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
      const storagePath = `${folder}/${folder === 'profile' ? 'avatar' : 'cover'}_${Date.now()}.${ext}`;
      const storageRef = ref(storage, storagePath);
      const task = uploadBytesResumable(storageRef, file, {
        contentType: file.type,
      });

      task.on(
        'state_changed',
        (snapshot) => {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress(pct);
        },
        (error) => {
          reject(error);
        },
        async () => {
          try {
            const url = await getDownloadURL(task.snapshot.ref);
            resolve({ url, storagePath });
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  };

  const handleProfilePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setPhotoStatus(null);
    setPhotoProgress(0);

    try {
      const { url, storagePath } = await uploadImageToStorage(file, 'profile', setPhotoProgress);
      const previousStoragePath = profile.photoStoragePath;

      const sanitizedAlt =
        altTextInput.trim().slice(0, VALIDATION_LIMITS.altTextMax) || DEFAULT_PROFILE.altText;

      const path = 'siteSettings/profile';
      try {
        await setDoc(doc(db, 'siteSettings', 'profile'), {
          photoUrl: url.slice(0, VALIDATION_LIMITS.imageUrlMax),
          photoStoragePath: storagePath.slice(0, 512),
          altText: sanitizedAlt,
          updatedBy: user.uid,
          updatedAt: serverTimestamp(),
        });
      } catch (firestoreErr) {
        handleFirestoreError(firestoreErr, OperationType.WRITE, path);
      }

      if (previousStoragePath && previousStoragePath !== storagePath) {
        try {
          await deleteObject(ref(storage, previousStoragePath));
        } catch {
          // Non-blocking cleanup
        }
      }

      setPhotoStatus({
        type: 'success',
        text: 'تم رفع الصورة الشخصية وتحديثها مباشرة في الصفحة الرئيسية.',
      });
    } catch (err) {
      const msg =
        err instanceof Error && err.message.includes('storage/unauthorized')
          ? 'صلاحيات Firebase Storage تمنع الرفع حالياً. يرجى تفعيل قواعد Storage في لوحة Firebase Console.'
          : err instanceof Error
            ? err.message
            : 'حدث خطأ أثناء رفع الصورة.';
      setPhotoStatus({ type: 'error', text: msg });
    } finally {
      setPhotoProgress(null);
      if (photoFileRef.current) {
        photoFileRef.current.value = '';
      }
    }
  };

  const handleResetDefaultPhoto = async () => {
    if (!user) return;
    setPhotoStatus(null);
    const path = 'siteSettings/profile';
    try {
      await setDoc(doc(db, 'siteSettings', 'profile'), {
        photoUrl: DEFAULT_PROFILE.photoUrl,
        altText:
          altTextInput.trim().slice(0, VALIDATION_LIMITS.altTextMax) || DEFAULT_PROFILE.altText,
        updatedBy: user.uid,
        updatedAt: serverTimestamp(),
      });
      setPhotoStatus({
        type: 'success',
        text: 'تمت استعادة الصورة الشخصية الافتراضية.',
      });
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, path);
      } catch {
        setPhotoStatus({ type: 'error', text: 'تعذر تحديث إعدادات الصورة الشخصية.' });
      }
    }
  };

  const handleSaveAltText = async () => {
    if (!user) return;
    const trimmed = altTextInput.trim();
    if (!trimmed) {
      setPhotoStatus({ type: 'error', text: 'يرجى إدخال نص بديل مناسب للصورة.' });
      return;
    }

    const path = 'siteSettings/profile';
    try {
      const payload: Record<string, unknown> = {
        photoUrl: profile.photoUrl.slice(0, VALIDATION_LIMITS.imageUrlMax),
        altText: trimmed.slice(0, VALIDATION_LIMITS.altTextMax),
        updatedBy: user.uid,
        updatedAt: serverTimestamp(),
      };
      if (profile.photoStoragePath) {
        payload.photoStoragePath = profile.photoStoragePath.slice(0, 512);
      }
      await setDoc(doc(db, 'siteSettings', 'profile'), payload);
      setPhotoStatus({ type: 'success', text: 'تم حفظ النص البديل للصورة بنجاح.' });
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, path);
      } catch {
        setPhotoStatus({ type: 'error', text: 'تعذر حفظ النص البديل.' });
      }
    }
  };

  const handleSeedDefaultProjects = async () => {
    if (!user) return;
    setSeedingDefaults(true);
    setProjectStatus(null);

    try {
      const batch = writeBatch(db);
      DEFAULT_PROJECTS.forEach((proj, idx) => {
        const refDoc = doc(db, 'projects', proj.id);
        batch.set(refDoc, {
          title: proj.title.slice(0, VALIDATION_LIMITS.titleMax),
          description: proj.description.slice(0, VALIDATION_LIMITS.descriptionMax),
          category: proj.category.slice(0, VALIDATION_LIMITS.categoryMax),
          techStack: proj.techStack.slice(0, VALIDATION_LIMITS.techStackMax),
          githubUrl: (proj.githubUrl ?? '').slice(0, VALIDATION_LIMITS.githubUrlMax),
          imageUrl: (proj.imageUrl ?? '').slice(0, VALIDATION_LIMITS.imageUrlMax),
          sortOrder: idx + 1,
          createdBy: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
      await batch.commit();
      setProjectStatus({
        type: 'success',
        text: 'تم استيراد المشاريع الافتراضية الثلاثة إلى قاعدة البيانات ويمكنك تعديلها الآن.',
      });
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, 'projects');
      } catch {
        setProjectStatus({ type: 'error', text: 'تعذر استيراد المشاريع الافتراضية.' });
      }
    } finally {
      setSeedingDefaults(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProjectStatus(null);
    setCoverUploadProgress(0);
    try {
      const { url } = await uploadImageToStorage(file, 'projects', setCoverUploadProgress);
      setFormState((prev) => ({
        ...prev,
        imageUrl: url.slice(0, VALIDATION_LIMITS.imageUrlMax),
      }));
      setProjectStatus({ type: 'success', text: 'تم رفع صورة المشروع بنجاح.' });
    } catch (err) {
      setProjectStatus({
        type: 'error',
        text: err instanceof Error ? err.message : 'تعذر رفع صورة المشروع.',
      });
    } finally {
      setCoverUploadProgress(null);
      if (coverFileRef.current) {
        coverFileRef.current.value = '';
      }
    }
  };

  const startEditProject = (project: PortfolioProject) => {
    setEditingProjectId(project.id);
    setFormState({
      title: project.title,
      category: project.category,
      techStack: project.techStack,
      description: project.description,
      githubUrl: project.githubUrl ?? '',
      imageUrl: project.imageUrl ?? '',
      sortOrder: project.sortOrder,
    });
    setProjectStatus(null);
  };

  const cancelEditProject = () => {
    setEditingProjectId(null);
    setFormState({
      ...EMPTY_FORM,
      sortOrder: projects.length + 1,
    });
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const title = formState.title.trim();
    const category = formState.category.trim();
    const techStack = formState.techStack.trim();
    const description = formState.description.trim();
    const githubUrl = formState.githubUrl.trim();
    const imageUrl = formState.imageUrl.trim();
    const sortOrder = Math.max(0, Math.min(10000, Math.round(Number(formState.sortOrder) || 0)));

    if (!title || !category || !techStack || !description) {
      setProjectStatus({
        type: 'error',
        text: 'يرجى تعبئة اسم المشروع والتصنيف والتقنيات والوصف.',
      });
      return;
    }

    if (githubUrl && !/^https?:\/\//i.test(githubUrl)) {
      setProjectStatus({
        type: 'error',
        text: 'رابط GitHub يجب أن يبدأ بـ https:// أو http://',
      });
      return;
    }

    setSavingProject(true);
    setProjectStatus(null);

    try {
      if (editingProjectId) {
        const docPath = `projects/${editingProjectId}`;
        try {
          await updateDoc(doc(db, 'projects', editingProjectId), {
            title: title.slice(0, VALIDATION_LIMITS.titleMax),
            category: category.slice(0, VALIDATION_LIMITS.categoryMax),
            techStack: techStack.slice(0, VALIDATION_LIMITS.techStackMax),
            description: description.slice(0, VALIDATION_LIMITS.descriptionMax),
            githubUrl: githubUrl.slice(0, VALIDATION_LIMITS.githubUrlMax),
            imageUrl: imageUrl.slice(0, VALIDATION_LIMITS.imageUrlMax),
            sortOrder,
            updatedAt: serverTimestamp(),
          });
          setProjectStatus({ type: 'success', text: `تم تحديث مشروع ${title} بنجاح.` });
          cancelEditProject();
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, docPath);
        }
      } else {
        const colPath = 'projects';
        try {
          await addDoc(collection(db, 'projects'), {
            title: title.slice(0, VALIDATION_LIMITS.titleMax),
            category: category.slice(0, VALIDATION_LIMITS.categoryMax),
            techStack: techStack.slice(0, VALIDATION_LIMITS.techStackMax),
            description: description.slice(0, VALIDATION_LIMITS.descriptionMax),
            githubUrl: githubUrl.slice(0, VALIDATION_LIMITS.githubUrlMax),
            imageUrl: imageUrl.slice(0, VALIDATION_LIMITS.imageUrlMax),
            sortOrder,
            createdBy: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          setProjectStatus({ type: 'success', text: `تمت إضافة مشروع ${title} ونشره فوراً.` });
          setFormState({
            ...EMPTY_FORM,
            sortOrder: projects.length + 2,
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, colPath);
        }
      }
    } catch {
      setProjectStatus({
        type: 'error',
        text: 'تعذر حفظ المشروع. تأكد من صلاحيات المشرف وصحة البيانات.',
      });
    } finally {
      setSavingProject(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const docPath = `projects/${projectId}`;
    setProjectStatus(null);
    try {
      await deleteDoc(doc(db, 'projects', projectId));
      setConfirmDeleteId(null);
      if (editingProjectId === projectId) {
        cancelEditProject();
      }
      setProjectStatus({ type: 'success', text: 'تم حذف المشروع بنجاح.' });
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, docPath);
      } catch {
        setProjectStatus({ type: 'error', text: 'تعذر حذف المشروع.' });
      }
    }
  };

  if (authLoading) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-[#FAF7F2] dark:bg-[#0B0A09] text-[#1B1713] dark:text-[#F5EFE6] flex items-center justify-center p-6"
      >
        <p className="text-sm text-[#574E44] dark:text-[#A89F94]">جاري التحقق من جلسة المشرف...</p>
      </div>
    );
  }

  // Unauthenticated View
  if (!user) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-[#FAF7F2] dark:bg-[#0B0A09] text-[#1B1713] dark:text-[#F5EFE6] flex items-center justify-center p-6 transition-colors duration-200"
      >
        <div className="max-w-md w-full bg-white dark:bg-[#141210] border border-[#E4DACD] dark:border-[#2A241E] rounded-2xl p-8 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <p className="font-mono-tech text-xs text-[#A66824] dark:text-[#D49B54]">
              Admin Access
            </p>
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E4DACD] dark:border-[#2A241E] text-xs text-[#574E44] dark:text-[#A89F94] hover:border-[#A66824] dark:hover:border-[#D49B54] cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-[#D49B54]" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-[#A66824]" />
              )}
              <span>{theme === 'dark' ? 'نهاري' : 'ليلي'}</span>
            </button>
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold text-[#1B1713] dark:text-[#F5EFE6]">
              لوحة تحكم الموقع
            </h1>
            <p className="text-sm text-[#574E44] dark:text-[#A89F94] leading-relaxed">
              الوصول مقتصر على الحساب المصرّح له فقط (
              <span dir="ltr" className="font-mono-tech text-[#1B1713] dark:text-[#F5EFE6]">
                {ADMIN_EMAIL}
              </span>
              ) لإدارة الصورة الشخصية والمشاريع.
            </p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs sm:text-sm text-red-700 dark:text-red-200">
              {authError}
            </div>
          )}

          <div className="space-y-3">
            <button
              type="button"
              disabled={signingIn}
              onClick={handleGoogleSignIn}
              className="w-full py-3 px-5 rounded-xl bg-[#A66824] dark:bg-[#D49B54] text-white dark:text-[#0B0A09] font-bold text-sm hover:bg-[#8E571C] dark:hover:bg-[#E0AC69] disabled:opacity-60 transition-colors inline-flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z"
                />
              </svg>
              <span>{signingIn ? 'جاري التحقق من الحساب...' : 'المتابعة بحساب Google'}</span>
            </button>

            <button
              type="button"
              onClick={onNavigateHome}
              className="w-full py-2.5 px-5 rounded-xl border border-[#E4DACD] dark:border-[#2A241E] text-sm text-[#574E44] dark:text-[#A89F94] hover:text-[#1B1713] dark:hover:text-[#F5EFE6] hover:border-[#A66824]/40 dark:hover:border-[#D49B54]/40 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة للموقع الرئيسي</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Signed in, but not authorized admin
  if (!isAuthorizedAdmin) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-[#FAF7F2] dark:bg-[#0B0A09] text-[#1B1713] dark:text-[#F5EFE6] flex items-center justify-center p-6 transition-colors duration-200"
      >
        <div className="max-w-md w-full bg-white dark:bg-[#141210] border border-[#E4DACD] dark:border-[#2A241E] rounded-2xl p-8 space-y-6 text-center">
          <ShieldAlert className="w-10 h-10 text-[#A66824] dark:text-[#D49B54] mx-auto" />
          <div className="space-y-2">
            <h1 className="font-display text-xl font-bold text-[#1B1713] dark:text-[#F5EFE6]">
              هذا الحساب غير مصرح له بالإدارة
            </h1>
            <p className="text-sm text-[#574E44] dark:text-[#A89F94] leading-relaxed">
              تم تسجيل الدخول بواسطة{' '}
              <span dir="ltr" className="font-mono-tech text-[#1B1713] dark:text-[#F5EFE6]">
                {user.email}
              </span>
              . الدخول متاح حصرياً للحساب المصرّح له{' '}
              <span dir="ltr" className="font-mono-tech text-[#A66824] dark:text-[#D49B54]">
                {ADMIN_EMAIL}
              </span>
              .
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full py-2.5 px-5 rounded-xl bg-[#A66824] dark:bg-[#D49B54] text-white dark:text-[#0B0A09] font-bold text-sm hover:bg-[#8E571C] dark:hover:bg-[#E0AC69] transition-colors cursor-pointer"
            >
              تسجيل الخروج وتبديل الحساب
            </button>
            <button
              type="button"
              onClick={onNavigateHome}
              className="w-full py-2.5 px-5 rounded-xl border border-[#E4DACD] dark:border-[#2A241E] text-sm text-[#574E44] dark:text-[#A89F94] hover:text-[#1B1713] dark:hover:text-[#F5EFE6] transition-colors cursor-pointer"
            >
              العودة للموقع الرئيسي
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Workspace
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#FAF7F2] dark:bg-[#0B0A09] text-[#1B1713] dark:text-[#F5EFE6] transition-colors duration-200"
    >
      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b border-[#E4DACD] dark:border-[#2A241E] bg-[#FAF7F2]/95 dark:bg-[#0B0A09]/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 min-w-0">
            <ShieldCheck className="w-5 h-5 text-[#A66824] dark:text-[#D49B54] shrink-0" />
            <h1 className="font-display text-base sm:text-lg font-bold text-[#1B1713] dark:text-[#F5EFE6] whitespace-nowrap truncate">
              لوحة تحكم الموقع
            </h1>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
              className="px-3 py-2 rounded-lg border border-[#E4DACD] dark:border-[#2A241E] text-xs sm:text-sm text-[#433B33] dark:text-[#C8BEB2] hover:border-[#A66824] dark:hover:border-[#D49B54] transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#D49B54]" />
                  <span className="hidden sm:inline">نهاري</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#A66824]" />
                  <span className="hidden sm:inline">ليلي</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onNavigateHome}
              className="px-3.5 py-2 rounded-lg border border-[#E4DACD] dark:border-[#2A241E] text-xs sm:text-sm text-[#433B33] dark:text-[#C8BEB2] hover:border-[#A66824] dark:hover:border-[#D49B54]/60 hover:text-[#1B1713] dark:hover:text-[#F5EFE6] transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>معاينة الموقع</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="px-3.5 py-2 rounded-lg bg-[#F3EDE4] dark:bg-[#191613] border border-[#E4DACD] dark:border-[#2A241E] text-xs sm:text-sm text-[#574E44] dark:text-[#A89F94] hover:text-red-600 dark:hover:text-red-300 hover:border-red-300 dark:hover:border-red-900/60 transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* SECTION 1: PROFILE PHOTO MANAGER */}
        <section className="bg-white dark:bg-[#141210] border border-[#E4DACD] dark:border-[#2A241E] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4DACD] dark:border-[#2A241E] pb-4">
            <div>
              <h2 className="font-display text-xl font-bold text-[#1B1713] dark:text-[#F5EFE6]">
                الصورة الشخصية في الصفحة الرئيسية
              </h2>
              <p className="text-sm text-[#574E44] dark:text-[#A89F94]">
                يتم حفظ الصورة في Firebase Storage وتحديث الصفحة الرئيسية فوراً.
              </p>
            </div>
            <span dir="ltr" className="font-mono-tech text-xs text-[#73685C] dark:text-[#7B7267]">
              {user.email}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Animated Preview */}
            <div className="md:col-span-4 flex justify-center">
              <div className="relative w-48 h-48">
                <div
                  aria-hidden="true"
                  className="animate-aura-pulse absolute -inset-2 rounded-3xl bg-gradient-to-tr from-[#C88A4B]/35 to-[#D49B54]/15 blur-xl"
                />
                <div className="animate-portrait-float relative w-full h-full rounded-2xl p-[2px] bg-gradient-to-br from-[#A66824]/70 dark:from-[#D49B54]/70 to-[#8C5828]/50">
                  <ResilientImage
                    src={profile.photoUrl}
                    alt={profile.altText}
                    title="Profile Portrait"
                    className="w-full h-full rounded-[14px]"
                    imgClassName="object-cover object-top"
                  />
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="md:col-span-8 space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#A66824] dark:bg-[#D49B54] text-white dark:text-[#0B0A09] text-sm font-bold hover:bg-[#8E571C] dark:hover:bg-[#E0AC69] transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>رفع / استبدال الصورة</span>
                  <input
                    ref={photoFileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleProfilePhotoChange}
                    className="sr-only"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleResetDefaultPhoto}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#E4DACD] dark:border-[#2A241E] text-sm text-[#433B33] dark:text-[#C8BEB2] hover:border-[#A66824] dark:hover:border-[#D49B54]/50 hover:text-[#1B1713] dark:hover:text-[#F5EFE6] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>استعادة الصورة الافتراضية</span>
                </button>
              </div>

              {photoProgress !== null && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-[#574E44] dark:text-[#A89F94]">
                    <span>جاري الرفع إلى Firebase Storage...</span>
                    <span className="font-mono-tech">{photoProgress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#E4DACD] dark:bg-[#241F1B] overflow-hidden">
                    <div
                      className="h-full bg-[#A66824] dark:bg-[#D49B54] transition-all duration-150"
                      style={{ width: `${photoProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="alt-text-input"
                  className="block text-xs font-medium text-[#574E44] dark:text-[#A89F94]"
                >
                  النص البديل للصورة (SEO Alt Text)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="alt-text-input"
                    type="text"
                    maxLength={VALIDATION_LIMITS.altTextMax}
                    value={altTextInput}
                    onChange={(e) => setAltTextInput(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-lg bg-[#FAF7F2] dark:bg-[#0B0A09] border border-[#E4DACD] dark:border-[#2A241E] text-sm text-[#1B1713] dark:text-[#F5EFE6] focus:outline-none focus:border-[#A66824] dark:focus:border-[#D49B54]"
                  />
                  <button
                    type="button"
                    onClick={handleSaveAltText}
                    className="px-4 py-2.5 rounded-lg border border-[#E4DACD] dark:border-[#2A241E] bg-[#F3EDE4] dark:bg-[#191613] text-sm font-medium text-[#1B1713] dark:text-[#F5EFE6] hover:border-[#A66824] dark:hover:border-[#D49B54]/60 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    حفظ الوصف
                  </button>
                </div>
              </div>

              {photoStatus && (
                <div
                  className={`p-3 rounded-xl text-xs sm:text-sm flex items-center gap-2 ${
                    photoStatus.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-200'
                      : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{photoStatus.text}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 2: PROJECTS MANAGER */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-[#1B1713] dark:text-[#F5EFE6]">
                إدارة المشاريع
              </h2>
              <p className="text-sm text-[#574E44] dark:text-[#A89F94]">
                أضف أو عدّل أو احذف المشاريع لتظهر فوراً في الصفحة الرئيسية.
              </p>
            </div>

            {usingFallbackProjects && !dataLoading && (
              <button
                type="button"
                disabled={seedingDefaults}
                onClick={handleSeedDefaultProjects}
                className="px-4 py-2.5 rounded-lg border border-[#A66824]/60 dark:border-[#D49B54]/60 bg-[#A66824]/10 dark:bg-[#D49B54]/10 text-[#A66824] dark:text-[#D49B54] text-xs sm:text-sm font-semibold hover:bg-[#A66824]/20 dark:hover:bg-[#D49B54]/20 disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap"
              >
                {seedingDefaults
                  ? 'جاري الاستيراد...'
                  : 'استيراد المشاريع الافتراضية الثلاثة للتعديل'}
              </button>
            )}
          </div>

          {projectStatus && (
            <div
              className={`p-3.5 rounded-xl text-xs sm:text-sm ${
                projectStatus.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-200'
                  : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-200'
              }`}
            >
              {projectStatus.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Add / Edit Form */}
            <form
              onSubmit={handleSaveProject}
              className="lg:col-span-5 bg-white dark:bg-[#141210] border border-[#E4DACD] dark:border-[#2A241E] rounded-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#E4DACD] dark:border-[#2A241E] pb-3">
                <h3 className="font-display text-lg font-bold text-[#1B1713] dark:text-[#F5EFE6] inline-flex items-center gap-2">
                  <FolderPlus className="w-4 h-4 text-[#A66824] dark:text-[#D49B54]" />
                  <span>{editingProjectId ? 'تعديل المشروع' : 'إضافة مشروع جديد'}</span>
                </h3>
                {editingProjectId && (
                  <button
                    type="button"
                    onClick={cancelEditProject}
                    className="text-xs text-[#574E44] dark:text-[#A89F94] hover:text-[#1B1713] dark:hover:text-[#F5EFE6] cursor-pointer"
                  >
                    إلغاء التعديل
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="proj-title" className="block text-xs text-[#574E44] dark:text-[#A89F94]">
                  اسم المشروع (بالإنجليزية) *
                </label>
                <input
                  id="proj-title"
                  type="text"
                  dir="ltr"
                  required
                  maxLength={VALIDATION_LIMITS.titleMax}
                  placeholder="e.g. Deep Sleep"
                  value={formState.title}
                  onChange={(e) => setFormState((p) => ({ ...p, title: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF7F2] dark:bg-[#0B0A09] border border-[#E4DACD] dark:border-[#2A241E] text-sm text-[#1B1713] dark:text-[#F5EFE6] focus:outline-none focus:border-[#A66824] dark:focus:border-[#D49B54]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="proj-category"
                    className="block text-xs text-[#574E44] dark:text-[#A89F94]"
                  >
                    التصنيف *
                  </label>
                  <input
                    id="proj-category"
                    type="text"
                    required
                    maxLength={VALIDATION_LIMITS.categoryMax}
                    placeholder="تطوير الويب"
                    value={formState.category}
                    onChange={(e) => setFormState((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF7F2] dark:bg-[#0B0A09] border border-[#E4DACD] dark:border-[#2A241E] text-sm text-[#1B1713] dark:text-[#F5EFE6] focus:outline-none focus:border-[#A66824] dark:focus:border-[#D49B54]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="proj-order"
                    className="block text-xs text-[#574E44] dark:text-[#A89F94]"
                  >
                    ترتيب العرض
                  </label>
                  <input
                    id="proj-order"
                    type="number"
                    min={0}
                    max={10000}
                    value={formState.sortOrder}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, sortOrder: Number(e.target.value) }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF7F2] dark:bg-[#0B0A09] border border-[#E4DACD] dark:border-[#2A241E] text-sm font-mono-tech text-[#1B1713] dark:text-[#F5EFE6] focus:outline-none focus:border-[#A66824] dark:focus:border-[#D49B54]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="proj-tech" className="block text-xs text-[#574E44] dark:text-[#A89F94]">
                  التقنيات المستخدمة *
                </label>
                <input
                  id="proj-tech"
                  type="text"
                  dir="ltr"
                  required
                  maxLength={VALIDATION_LIMITS.techStackMax}
                  placeholder="Flutter · Dart"
                  value={formState.techStack}
                  onChange={(e) => setFormState((p) => ({ ...p, techStack: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF7F2] dark:bg-[#0B0A09] border border-[#E4DACD] dark:border-[#2A241E] text-sm font-mono-tech text-[#1B1713] dark:text-[#F5EFE6] focus:outline-none focus:border-[#A66824] dark:focus:border-[#D49B54]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="proj-desc" className="block text-xs text-[#574E44] dark:text-[#A89F94]">
                  وصف المشروع *
                </label>
                <textarea
                  id="proj-desc"
                  rows={4}
                  required
                  maxLength={VALIDATION_LIMITS.descriptionMax}
                  placeholder="اكتب وصفاً مختصراً وواضحاً عن فكرة المشروع وأهم ميزاته..."
                  value={formState.description}
                  onChange={(e) => setFormState((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF7F2] dark:bg-[#0B0A09] border border-[#E4DACD] dark:border-[#2A241E] text-sm text-[#1B1713] dark:text-[#F5EFE6] leading-relaxed focus:outline-none focus:border-[#A66824] dark:focus:border-[#D49B54]"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="proj-github"
                  className="block text-xs text-[#574E44] dark:text-[#A89F94]"
                >
                  رابط GitHub (اختياري)
                </label>
                <input
                  id="proj-github"
                  type="url"
                  dir="ltr"
                  maxLength={VALIDATION_LIMITS.githubUrlMax}
                  placeholder="https://github.com/hammamalaidaroos/..."
                  value={formState.githubUrl}
                  onChange={(e) => setFormState((p) => ({ ...p, githubUrl: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF7F2] dark:bg-[#0B0A09] border border-[#E4DACD] dark:border-[#2A241E] text-sm font-mono-tech text-[#1B1713] dark:text-[#F5EFE6] focus:outline-none focus:border-[#A66824] dark:focus:border-[#D49B54]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="proj-image"
                    className="block text-xs text-[#574E44] dark:text-[#A89F94]"
                  >
                    صورة الغلاف (اختياري)
                  </label>
                  <label className="inline-flex items-center gap-1 text-xs text-[#A66824] dark:text-[#D49B54] hover:text-[#8E571C] dark:hover:text-[#E0AC69] cursor-pointer">
                    <ImagePlus className="w-3.5 h-3.5" />
                    <span>رفع صورة</span>
                    <input
                      ref={coverFileRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleCoverUpload}
                      className="sr-only"
                    />
                  </label>
                </div>

                {coverUploadProgress !== null && (
                  <p className="text-xs text-[#A66824] dark:text-[#D49B54] font-mono-tech">
                    Uploading cover: {coverUploadProgress}%
                  </p>
                )}

                <input
                  id="proj-image"
                  type="text"
                  dir="ltr"
                  maxLength={VALIDATION_LIMITS.imageUrlMax}
                  placeholder="https://... أو اختر من الأغلفة الجاهزة"
                  value={formState.imageUrl}
                  onChange={(e) => setFormState((p) => ({ ...p, imageUrl: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#FAF7F2] dark:bg-[#0B0A09] border border-[#E4DACD] dark:border-[#2A241E] text-xs font-mono-tech text-[#1B1713] dark:text-[#F5EFE6] focus:outline-none focus:border-[#A66824] dark:focus:border-[#D49B54]"
                />

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {BUILTIN_PROJECT_COVERS.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setFormState((p) => ({ ...p, imageUrl: preset.url }))}
                      className="px-2.5 py-1 rounded bg-[#F3EDE4] dark:bg-[#191613] border border-[#E4DACD] dark:border-[#2A241E] text-[11px] text-[#574E44] dark:text-[#A89F94] hover:border-[#A66824] dark:hover:border-[#D49B54]/60 hover:text-[#1B1713] dark:hover:text-[#F5EFE6] cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProject}
                className="w-full py-3 px-5 rounded-xl bg-[#A66824] dark:bg-[#D49B54] text-white dark:text-[#0B0A09] font-bold text-sm hover:bg-[#8E571C] dark:hover:bg-[#E0AC69] disabled:opacity-60 transition-colors cursor-pointer"
              >
                {savingProject
                  ? 'جاري الحفظ...'
                  : editingProjectId
                    ? 'حفظ التعديلات'
                    : 'نشر المشروع الآن'}
              </button>
            </form>

            {/* Current Projects List */}
            <div className="lg:col-span-7 space-y-4">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-white dark:bg-[#141210] border border-[#E4DACD] dark:border-[#2A241E] rounded-2xl p-5 flex flex-col sm:flex-row gap-5 items-start"
                >
                  <ResilientImage
                    src={proj.imageUrl}
                    alt={proj.title}
                    title={proj.title}
                    className="w-full sm:w-36 aspect-[4/3] rounded-xl border border-[#E4DACD] dark:border-[#2A241E] shrink-0"
                  />

                  <div className="flex-1 min-w-0 space-y-2 w-full">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3
                        dir="ltr"
                        className="font-display text-lg font-bold text-[#1B1713] dark:text-[#F5EFE6]"
                      >
                        {proj.title}
                      </h3>
                      <span className="font-mono-tech text-xs text-[#73685C] dark:text-[#7B7267]">
                        #{proj.sortOrder}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#574E44] dark:text-[#A89F94]">
                      <span className="text-[#A66824] dark:text-[#D49B54]">{proj.category}</span>
                      <span aria-hidden="true">·</span>
                      <span dir="ltr" className="font-mono-tech">
                        {proj.techStack}
                      </span>
                    </div>

                    <p className="text-sm text-[#433B33] dark:text-[#C8BEB2] leading-relaxed line-clamp-2">
                      {proj.description}
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      {proj.isDefaultFallback ? (
                        <span className="text-xs text-[#73685C] dark:text-[#7B7267]">
                          مشروع افتراضي (اضغط استيراد أعلاه للتعديل والحذف)
                        </span>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => startEditProject(proj)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E4DACD] dark:border-[#2A241E] text-xs font-medium text-[#1B1713] dark:text-[#F5EFE6] hover:border-[#A66824] dark:hover:border-[#D49B54] transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#A66824] dark:text-[#D49B54]" />
                            <span>تعديل</span>
                          </button>

                          {confirmDeleteId === proj.id ? (
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleDeleteProject(proj.id)}
                                className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-500 transition-colors cursor-pointer"
                              >
                                تأكيد الحذف
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2.5 py-1.5 rounded-lg border border-[#E4DACD] dark:border-[#2A241E] text-xs text-[#574E44] dark:text-[#A89F94] hover:text-[#1B1713] dark:hover:text-[#F5EFE6] cursor-pointer"
                              >
                                إلغاء
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(proj.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E4DACD] dark:border-[#2A241E] text-xs font-medium text-red-600 dark:text-red-300 hover:border-red-400 dark:hover:border-red-800/70 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>حذف</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
