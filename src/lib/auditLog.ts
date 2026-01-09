/**
 * Audit Log Utilities
 * Tracks all admin actions for security and compliance
 */

import { getPocketBase } from './pocketbase';
import type { User } from './auth';

export interface AuditLogEntry {
  id?: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  created?: string;
  expand?: {
    userId?: User;
  };
}

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'publish'
  | 'unpublish'
  | 'approve'
  | 'reject'
  | 'ban'
  | 'unban'
  | 'feature'
  | 'unfeature'
  | 'bulk_delete'
  | 'bulk_update'
  | 'role_change'
  | 'restore'
  | 'export';

export type ResourceType =
  | 'user'
  | 'post'
  | 'comment'
  | 'category'
  | 'tag'
  | 'settings';

/**
 * Log an admin action to the audit log
 */
export async function logAdminAction(
  userId: string,
  action: AuditAction,
  resourceType: ResourceType,
  resourceId: string,
  changes?: Record<string, any>,
  metadata?: Record<string, any>,
  request?: Request
): Promise<void> {
  try {
    const pb = getPocketBase();

    // Extract IP and user agent if request provided
    const ipAddress = request?.headers.get('x-forwarded-for') || 
                     request?.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request?.headers.get('user-agent') || 'unknown';

    const logData = {
      userId,
      action,
      resourceType,
      resourceId,
      changes: changes || {},
      metadata: metadata || {},
      ipAddress,
      userAgent,
    };

    await pb.collection('audit_logs').create(logData);
    console.log(`[Audit Log] ${action} ${resourceType} ${resourceId} by user ${userId}`);
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging should never break the main operation
  }
}

/**
 * Get audit logs for a specific resource
 */
export async function getResourceAuditLogs(
  resourceType: ResourceType,
  resourceId: string,
  limit = 50
): Promise<AuditLogEntry[]> {
  try {
    const pb = getPocketBase();
    const records = await pb.collection('audit_logs').getList(1, limit, {
      filter: `resourceType = "${resourceType}" && resourceId = "${resourceId}"`,
      sort: '-created',
      expand: 'userId',
    });

    return records.items as unknown as AuditLogEntry[];
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return [];
  }
}

/**
 * Get recent audit logs for the admin dashboard
 */
export async function getRecentAuditLogs(
  limit = 100,
  page = 1
): Promise<{ items: AuditLogEntry[]; totalPages: number; totalItems: number }> {
  try {
    const pb = getPocketBase();
    const records = await pb.collection('audit_logs').getList(page, limit, {
      sort: '-created',
      expand: 'userId',
    });

    return {
      items: records.items as unknown as AuditLogEntry[],
      totalPages: records.totalPages,
      totalItems: records.totalItems,
    };
  } catch (error) {
    console.error('Failed to fetch recent audit logs:', error);
    return { items: [], totalPages: 0, totalItems: 0 };
  }
}

/**
 * Get audit logs by user
 */
export async function getUserAuditLogs(
  userId: string,
  limit = 50,
  page = 1
): Promise<{ items: AuditLogEntry[]; totalPages: number; totalItems: number }> {
  try {
    const pb = getPocketBase();
    const records = await pb.collection('audit_logs').getList(page, limit, {
      filter: `userId = "${userId}"`,
      sort: '-created',
      expand: 'userId',
    });

    return {
      items: records.items as unknown as AuditLogEntry[],
      totalPages: records.totalPages,
      totalItems: records.totalItems,
    };
  } catch (error) {
    console.error('Failed to fetch user audit logs:', error);
    return { items: [], totalPages: 0, totalItems: 0 };
  }
}

/**
 * Search audit logs
 */
export async function searchAuditLogs(
  query: string,
  filters?: {
    action?: AuditAction;
    resourceType?: ResourceType;
    userId?: string;
    startDate?: string;
    endDate?: string;
  },
  limit = 50,
  page = 1
): Promise<{ items: AuditLogEntry[]; totalPages: number; totalItems: number }> {
  try {
    const pb = getPocketBase();
    
    // Build filter conditions
    const conditions: string[] = [];
    
    if (filters?.action) {
      conditions.push(`action = "${filters.action}"`);
    }
    
    if (filters?.resourceType) {
      conditions.push(`resourceType = "${filters.resourceType}"`);
    }
    
    if (filters?.userId) {
      conditions.push(`userId = "${filters.userId}"`);
    }
    
    if (filters?.startDate) {
      conditions.push(`created >= "${filters.startDate}"`);
    }
    
    if (filters?.endDate) {
      conditions.push(`created <= "${filters.endDate}"`);
    }
    
    if (query) {
      conditions.push(`resourceId ~ "${query}"`);
    }
    
    const filterString = conditions.length > 0 ? conditions.join(' && ') : '';
    
    const records = await pb.collection('audit_logs').getList(page, limit, {
      filter: filterString,
      sort: '-created',
      expand: 'userId',
    });

    return {
      items: records.items as unknown as AuditLogEntry[],
      totalPages: records.totalPages,
      totalItems: records.totalItems,
    };
  } catch (error) {
    console.error('Failed to search audit logs:', error);
    return { items: [], totalPages: 0, totalItems: 0 };
  }
}

/**
 * Format audit log action for display
 */
export function formatAuditAction(action: string): string {
  const actionMap: Record<string, string> = {
    create: 'Created',
    update: 'Updated',
    delete: 'Deleted',
    publish: 'Published',
    unpublish: 'Unpublished',
    approve: 'Approved',
    reject: 'Rejected',
    ban: 'Banned',
    unban: 'Unbanned',
    feature: 'Featured',
    unfeature: 'Unfeatured',
    bulk_delete: 'Bulk Deleted',
    bulk_update: 'Bulk Updated',
    role_change: 'Changed Role',
    restore: 'Restored',
    export: 'Exported',
  };
  
  return actionMap[action] || action;
}

/**
 * Format resource type for display
 */
export function formatResourceType(type: string): string {
  const typeMap: Record<string, string> = {
    user: 'User',
    post: 'Post',
    comment: 'Comment',
    category: 'Category',
    tag: 'Tag',
    settings: 'Settings',
  };
  
  return typeMap[type] || type;
}
