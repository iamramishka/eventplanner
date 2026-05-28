import { NextRequest, NextResponse } from 'next/server';
import { addVendorRegistration, getVendorByEmail } from '@/lib/vendorStore';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

type VendorPackageInput = {
  name?: unknown;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // --- Required field validation ---
    const required = ['ownerFirstName', 'ownerLastName', 'email', 'phone', 'password',
      'businessName', 'category', 'description', 'location', 'businessRegNumber', 'basePrice'];

    for (const field of required) {
      if (!body[field] || String(body[field]).trim() === '') {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // --- Email format ---
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email || ''))) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    // --- Duplicate email check ---
    const normalizedEmail = String(body.email).trim().toLowerCase();
    const existing = getVendorByEmail(normalizedEmail);
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing || existingUser) {
      return NextResponse.json({ error: 'A vendor with this email already exists.' }, { status: 409 });
    }

    // --- Password length ---
    if (String(body.password || '').length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    // --- Description min length ---
    if (String(body.description || '').trim().length < 30) {
      return NextResponse.json({ error: 'Description must be at least 30 characters.' }, { status: 400 });
    }

    // --- Base price ---
    const basePrice = Number(body.basePrice);
    if (!Number.isFinite(basePrice) || basePrice < 0) {
      return NextResponse.json({ error: 'Starting price must be a non-negative number.' }, { status: 400 });
    }

    // --- Create vendor registration ---
    const passwordHash = await bcrypt.hash(String(body.password), 10);
    const createdUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: passwordHash,
        name: `${String(body.ownerFirstName).trim()} ${String(body.ownerLastName).trim()}`.trim(),
        role: 'VENDOR',
      },
    });

    let vendor;
    try {
      vendor = addVendorRegistration({
        ownerFirstName: String(body.ownerFirstName).trim(),
        ownerLastName: String(body.ownerLastName).trim(),
        email: normalizedEmail,
        phone: String(body.phone).trim(),
        passwordHash,
        businessName: String(body.businessName).trim(),
        category: String(body.category).trim(),
        subcategory: String(body.subcategory || '').trim(),
        description: String(body.description).trim(),
        yearsInBusiness: body.yearsInBusiness ? Number(body.yearsInBusiness) : null,
        website: String(body.website || '').trim(),
        location: String(body.location).trim(),
        serviceArea: String(body.serviceArea || '').trim(),
        logoBase64: body.logoBase64 || null,
        portfolioImages: Array.isArray(body.portfolioImages) ? body.portfolioImages : [],
        businessRegNumber: String(body.businessRegNumber).trim(),
        taxIdNumber: String(body.taxIdNumber || '').trim(),
        businessRegDocBase64: body.businessRegDocBase64 || null,
        basePrice,
        currency: String(body.currency || 'LKR'),
        pricingNotes: String(body.pricingNotes || '').trim(),
        packages: Array.isArray(body.packages)
          ? body.packages.filter((p: VendorPackageInput) => String(p.name || '').trim())
          : [],
      });
    } catch (storeError) {
      await prisma.user.delete({ where: { id: createdUser.id } }).catch(() => {});
      throw storeError;
    }

    // Return safe response (no password or sensitive docs)
    return NextResponse.json({
      id: vendor.id,
      businessName: vendor.businessName,
      category: vendor.category,
      email: vendor.email,
      status: vendor.status,
      onboardingStep: vendor.onboardingStep,
      createdAt: vendor.createdAt,
    }, { status: 201 });

  } catch (err: unknown) {
    console.error('[POST /api/vendors/register]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to register a vendor.' },
    { status: 405 }
  );
}
