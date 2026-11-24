export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  category: string;
  techStack: string;
  githubUrl?: string;
  imageUrl?: string;
  sortOrder: number;
  isDefaultFallback?: boolean;
}

export interface SiteProfileSettings {
  photoUrl: string;
  photoStoragePath?: string;
  altText: string;
}

export interface SkillItem {
  id: string;
  name: string;
  categoryKey: 'software' | 'web_mobile' | 'data_cloud';
  categoryLabel: string;
}

export const DEFAULT_PROFILE: SiteProfileSettings = {
  photoUrl: '/src/assets/images/hammam_portrait_default_1795528738693.jpg',
  altText: 'صورة شخصية للمهندس همام عبد القادر علي العيدروس - متخصص تقنية معلومات',
};

export const DEFAULT_PROJECTS: PortfolioProject[] = [
  {
    id: 'deep-sleep',
    title: 'Deep Sleep',
    description:
      'موقع إلكتروني متخصص في عرض وتسويق الأثاث المنزلي وغرف النوم بتصميم عصري متجاوب وتجربة تصفح مريحة تبرز جودة المنتجات.',
    category: 'تطوير الويب',
    techStack: 'HTML · CSS · JavaScript',
    githubUrl: 'https://github.com/hammamalaidaroos',
    imageUrl: '/src/assets/images/project_deep_sleep_1795528739742.jpg',
    sortOrder: 1,
    isDefaultFallback: true,
  },
  {
    id: 'task-manager-app',
    title: 'Task Manager App',
    description:
      'تطبيق جوال لإدارة المهام اليومية وتنظيم الأولويات ومتابعة الإنجاز، مبني باستخدام Flutter ليقدم واجهة سلسة وأداءً مستقراً.',
    category: 'تطبيقات الجوال',
    techStack: 'Flutter · Dart',
    githubUrl: 'https://github.com/hammamalaidaroos',
    imageUrl: '/src/assets/images/project_task_manager_1795528739335.jpg',
    sortOrder: 2,
    isDefaultFallback: true,
  },
  {
    id: 'supermarket-system',
    title: 'Supermarket System',
    description:
      'نظام مكتبي متكامل لإدارة السوبرماركت يشمل نقاط البيع، متابعة المخزون، والفواتير، مبني بلغة C# لرفع كفاءة التشغيل.',
    category: 'أنظمة سطح المكتب',
    techStack: 'C# · SQL Server',
    githubUrl: 'https://github.com/hammamalaidaroos',
    imageUrl: '/src/assets/images/project_supermarket_system_1795528740072.jpg',
    sortOrder: 3,
    isDefaultFallback: true,
  },
];

export const SKILLS_LIST: SkillItem[] = [
  { id: '01', name: 'Android Studio', categoryKey: 'web_mobile', categoryLabel: 'تطوير تطبيقات أندرويد' },
  { id: '02', name: 'Packet Tracer', categoryKey: 'data_cloud', categoryLabel: 'محاكاة الشبكات' },
  { id: '03', name: 'SQL Server', categoryKey: 'data_cloud', categoryLabel: 'إدارة قواعد البيانات' },
  { id: '04', name: 'Python', categoryKey: 'software', categoryLabel: 'البرمجة وتحليل البيانات' },
  { id: '05', name: 'C++', categoryKey: 'software', categoryLabel: 'برمجة الأنظمة والخوارزميات' },
  { id: '06', name: 'HTML', categoryKey: 'web_mobile', categoryLabel: 'هيكلة صفحات الويب' },
  { id: '07', name: 'CSS', categoryKey: 'web_mobile', categoryLabel: 'تصميم وتنسيق الواجهات' },
  { id: '08', name: 'JavaScript', categoryKey: 'web_mobile', categoryLabel: 'تطوير واجهات الويب التفاعلية' },
  { id: '09', name: 'Dart', categoryKey: 'web_mobile', categoryLabel: 'لغة تطوير تطبيقات Flutter' },
  { id: '10', name: 'Flutter', categoryKey: 'web_mobile', categoryLabel: 'تطوير تطبيقات متعددة المنصات' },
  { id: '11', name: 'Google Colab', categoryKey: 'data_cloud', categoryLabel: 'البيئة السحابية للبرمجة' },
  { id: '12', name: 'Cloud Storage', categoryKey: 'data_cloud', categoryLabel: 'التخزين السحابي وإدارة الملفات' },
  { id: '13', name: 'C#', categoryKey: 'software', categoryLabel: 'تطوير الأنظمة والتطبيقات' },
];

export const CONTACT_INFO = {
  githubUrl: 'https://github.com/hammamalaidaroos',
  githubHandle: 'hammamalaidaroos',
  whatsappNumber: '713405438',
  whatsappUrl: 'https://wa.me/967713405438',
};

export const VALIDATION_LIMITS = {
  titleMax: 120,
  descriptionMax: 1000,
  categoryMax: 60,
  techStackMax: 200,
  githubUrlMax: 500,
  imageUrlMax: 2048,
  altTextMax: 200,
};
