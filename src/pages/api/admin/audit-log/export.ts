/**
 * Admin API: Export Audit Logs
 * Export audit log to CSV
 */

import type { APIRoute } from 'astro';
import { getRecentAuditLogs, formatAuditAction, formatResourceType } from '../../../../lib/auditLog';

export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;

  // Check admin permission
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Fetch all recent audit logs (limit to 1000 for performance)
    const result = await getRecentAuditLogs(1000, 1);
    const logs = result.items;

    // Generate CSV
    const headers = [
      'Timestamp',
      'Admin User',
      'Admin Email',
      'Action',
      'Resource Type',
      'Resource ID',
      'IP Address',
      'Changes',
      'Metadata',
    ];

    const rows = logs.map((log) => {
      const timestamp = new Date(log.created).toISOString();
      const adminUser = log.expand?.userId?.username || 'Unknown';
      const adminEmail = log.expand?.userId?.email || 'Unknown';
      const action = formatAuditAction(log.action);
      const resourceType = formatResourceType(log.resourceType);
      const resourceId = log.resourceId;
      const ipAddress = log.ipAddress || '';
      const changes = JSON.stringify(log.changes || {});
      const metadata = JSON.stringify(log.metadata || {});

      return [
        timestamp,
        adminUser,
        adminEmail,
        action,
        resourceType,
        resourceId,
        ipAddress,
        changes,
        metadata,
      ]
        .map((field) => `"${String(field).replace(/"/g, '""')}"`)
        .join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');

    const filename = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Failed to export audit logs:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to export audit logs',
        details: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
