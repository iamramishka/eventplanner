import { NextResponse } from 'next/server';
import { getAdminSettings, saveAdminSettings } from '@/lib/adminSettings';
import { auditLog } from '@/lib/audit';
import { requireSuperAdmin } from '@/lib/adminAuth';

export async function GET() {
  const forbidden = await requireSuperAdmin();
  if (forbidden) return forbidden;
  return NextResponse.json({ ok: true, data: getAdminSettings() });
}

export async function PUT(req: Request) {
  try {
    const forbidden = await requireSuperAdmin();
    if (forbidden) return forbidden;
    const body = await req.json();
    const patch = body?.settings && typeof body.settings === 'object' ? body.settings : body && typeof body === 'object' ? body : {};
    const updated = saveAdminSettings(patch);
    await auditLog({
      action: 'admin-settings-update',
      targetId: 'platform',
      data: {
        sections: Object.keys(patch).filter((key) => ['branding', 'contact', 'publicSite', 'cmsBlocks', 'templates'].includes(key)),
        templateCount: updated.settings.templates.length,
        updatedAt: updated.updatedAt,
      },
    });
    return NextResponse.json({ ok: true, data: updated });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
