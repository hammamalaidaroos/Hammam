import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  DEFAULT_PROFILE,
  DEFAULT_PROJECTS,
  PortfolioProject,
  SiteProfileSettings,
} from '../data/portfolioDefaults';

export interface PortfolioDataState {
  profile: SiteProfileSettings;
  projects: PortfolioProject[];
  usingFallbackProjects: boolean;
  loading: boolean;
  error: string | null;
}

export function usePortfolioData(): PortfolioDataState {
  const [profile, setProfile] = useState<SiteProfileSettings>(DEFAULT_PROFILE);
  const [firestoreProjects, setFirestoreProjects] = useState<PortfolioProject[] | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const profilePath = 'siteSettings/profile';
    const unsubscribeProfile = onSnapshot(
      doc(db, 'siteSettings', 'profile'),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (typeof data.photoUrl === 'string' && data.photoUrl.trim().length > 0) {
            setProfile({
              photoUrl: data.photoUrl,
              photoStoragePath: typeof data.photoStoragePath === 'string' ? data.photoStoragePath : undefined,
              altText:
                typeof data.altText === 'string' && data.altText.trim().length > 0
                  ? data.altText
                  : DEFAULT_PROFILE.altText,
            });
          } else {
            setProfile(DEFAULT_PROFILE);
          }
        } else {
          setProfile(DEFAULT_PROFILE);
        }
        setProfileLoaded(true);
      },
      (err) => {
        setProfileLoaded(true);
        setError('تعذر مزامنة الصورة الشخصية من قاعدة البيانات.');
        try {
          handleFirestoreError(err, OperationType.GET, profilePath);
        } catch {
          // Handled via state so UI remains resilient
        }
      }
    );

    const projectsPath = 'projects';
    const projectsQuery = query(
      collection(db, 'projects'),
      where('sortOrder', '>=', 0),
      orderBy('sortOrder', 'asc')
    );

    const unsubscribeProjects = onSnapshot(
      projectsQuery,
      (snapshot) => {
        const items: PortfolioProject[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            title: String(data.title ?? ''),
            description: String(data.description ?? ''),
            category: String(data.category ?? ''),
            techStack: String(data.techStack ?? ''),
            githubUrl: typeof data.githubUrl === 'string' ? data.githubUrl : undefined,
            imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : undefined,
            sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
          };
        });
        setFirestoreProjects(items);
        setProjectsLoaded(true);
      },
      (err) => {
        setProjectsLoaded(true);
        setError('تعذر تحميل المشاريع من قاعدة البيانات.');
        try {
          handleFirestoreError(err, OperationType.LIST, projectsPath);
        } catch {
          // Handled via state so UI remains resilient
        }
      }
    );

    return () => {
      unsubscribeProfile();
      unsubscribeProjects();
    };
  }, []);

  const hasStoredProjects = firestoreProjects !== null && firestoreProjects.length > 0;
  const projects = hasStoredProjects ? firestoreProjects : DEFAULT_PROJECTS;

  return {
    profile,
    projects,
    usingFallbackProjects: !hasStoredProjects,
    loading: !(profileLoaded && projectsLoaded),
    error,
  };
}
