// Client-side admin permission utilities
import React from 'react';

export interface AdminPermissionResponse {
  hasPermission: boolean;
  isAdmin: boolean;
  permissions?: string[];
  role?: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  error?: string;
}

// بررسی مجوز خاص
export async function checkClientPermission(permission: string): Promise<boolean> {
  try {
    const response = await fetch('/api/admin/auth/permissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ permission }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.hasPermission || false;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

// دریافت اطلاعات کامل مجوزهای ادمین
export async function getAdminPermissions(): Promise<AdminPermissionResponse> {
  try {
    const response = await fetch('/api/admin/auth/permissions');

    if (!response.ok) {
      return { hasPermission: false, isAdmin: false };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting admin permissions:', error);
    return { hasPermission: false, isAdmin: false, error: 'خطا در دریافت مجوزها' };
  }
}

// بررسی مجوز مشاهده اطلاعات مالی
export async function checkFinancialPermission(): Promise<boolean> {
  try {
    const [payments, financialReports, accounting] = await Promise.all([
      checkClientPermission('payments'),
      checkClientPermission('financial_reports'),
      checkClientPermission('accounting'),
    ]);

    return payments || financialReports || accounting;
  } catch (error) {
    console.error('Error checking financial permission:', error);
    return false;
  }
}

// هوک برای استفاده در React components
export function useAdminPermissions() {
  const [permissions, setPermissions] = React.useState<AdminPermissionResponse>({
    hasPermission: false,
    isAdmin: false,
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getAdminPermissions().then((data) => {
      setPermissions(data);
      setLoading(false);
    });
  }, []);

  const hasPermission = (permission: string): boolean => {
    if (!permissions.permissions) return false;
    return permissions.permissions.includes('all') || permissions.permissions.includes(permission);
  };

  const canViewFinancial = (): boolean => {
    return hasPermission('payments') || hasPermission('financial_reports') || hasPermission('accounting');
  };

  return {
    ...permissions,
    loading,
    hasPermission,
    canViewFinancial,
  };
} 