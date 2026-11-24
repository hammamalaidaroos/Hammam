/**
 * Dirty Dozen Security Rule Verification Specification
 * Each payload verifies that unauthorized, spoofed, oversized, or shadow-field
 * operations are rejected by firestore.rules.
 */

export interface SecurityTestCase {
  id: number;
  name: string;
  operation: 'create' | 'update' | 'delete' | 'get' | 'list';
  path: string;
  auth: { uid: string; email: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_CASES: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Unauthenticated project create',
    operation: 'create',
    path: '/projects/proj_1',
    auth: null,
    payload: { title: 'Test', description: 'Desc' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Non-admin authenticated project create',
    operation: 'create',
    path: '/projects/proj_2',
    auth: { uid: 'user_123', email: 'visitor@example.com', email_verified: true },
    payload: { title: 'Test', description: 'Desc' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Unverified admin email spoofing',
    operation: 'create',
    path: '/projects/proj_3',
    auth: { uid: 'spoof_1', email: 'hamamalidrose@gmail.com', email_verified: false },
    payload: { title: 'Test', description: 'Desc' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Shadow field injection on project create',
    operation: 'create',
    path: '/projects/proj_4',
    auth: { uid: 'admin_1', email: 'hamamalidrose@gmail.com', email_verified: true },
    payload: {
      title: 'Deep Sleep',
      description: 'Valid desc',
      category: 'Web',
      techStack: 'HTML, CSS',
      sortOrder: 1,
      createdBy: 'admin_1',
      isFeatured: true,
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Identity spoofing createdBy mismatch',
    operation: 'create',
    path: '/projects/proj_5',
    auth: { uid: 'admin_1', email: 'hamamalidrose@gmail.com', email_verified: true },
    payload: {
      title: 'Deep Sleep',
      description: 'Valid desc',
      category: 'Web',
      techStack: 'HTML, CSS',
      sortOrder: 1,
      createdBy: 'other_uid',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Client-forged createdAt timestamp',
    operation: 'create',
    path: '/projects/proj_6',
    auth: { uid: 'admin_1', email: 'hamamalidrose@gmail.com', email_verified: true },
    payload: {
      title: 'Deep Sleep',
      description: 'Valid desc',
      category: 'Web',
      techStack: 'HTML, CSS',
      sortOrder: 1,
      createdBy: 'admin_1',
      createdAt: '2020-01-01T00:00:00Z',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Mutating immutable createdBy on update',
    operation: 'update',
    path: '/projects/proj_1',
    auth: { uid: 'admin_1', email: 'hamamalidrose@gmail.com', email_verified: true },
    payload: { createdBy: 'another_uid' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Oversized title value poisoning',
    operation: 'update',
    path: '/projects/proj_1',
    auth: { uid: 'admin_1', email: 'hamamalidrose@gmail.com', email_verified: true },
    payload: { title: 'A'.repeat(200) },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Invalid document ID characters',
    operation: 'create',
    path: '/projects/bad$id',
    auth: { uid: 'admin_1', email: 'hamamalidrose@gmail.com', email_verified: true },
    payload: { title: 'Test' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Non-admin project delete',
    operation: 'delete',
    path: '/projects/proj_1',
    auth: { uid: 'user_123', email: 'visitor@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Self-assigned admin privilege escalation',
    operation: 'create',
    path: '/admins/user_123',
    auth: { uid: 'user_123', email: 'visitor@example.com', email_verified: true },
    payload: { email: 'visitor@example.com', role: 'admin' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Deleting siteSettings profile document',
    operation: 'delete',
    path: '/siteSettings/profile',
    auth: { uid: 'admin_1', email: 'hamamalidrose@gmail.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
];
