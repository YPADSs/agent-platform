import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import {
  getUserPreferencesByEmail,
  upsertUserPreferencesByEmail,
  SUPPORTED_LOCALES,
  SUPPORTED_ONBOARDING_STATUSES,
  SUPPORTED_UNIT_SYSTEMS,
  type SupportedLocale,
  type SupportedOnboardingStatus,
  type SupportedUnitSystem,
} from '@/lib/preferences';

type PreferencesRequestBody = {
  goalCode?: unknown;
  locale?: unknown;
  unitSystem?: unknown;
  onboardingStatus?: unknown;
};

function asOptionalString(value: unknown) {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }

  return value === null ? null : undefined;
}

function isSupportedLocale(value: unknown): value is SupportedLocale {
  return typeof value === 'string' && SUPPORTED_LOCALES.includes(value as SupportedLocale);
}

function isSupportedUnitSystem(value: unknown): value is SupportedUnitSystem {
  return typeof value === 'string' && SUPPORTED_UNIT_SYSTEMS.includes(value as SupportedUnitSystem);
}

function isSupportedOnboardingStatus(value: unknown): value is SupportedOnboardingStatus {
  return (
    typeof value === 'string' &&
    SUPPORTED_ONBOARDING_STATUSES.includes(value as SupportedOnboardingStatus)
  );
}

export async function GET() {
  try {
    const session = await requireSession();
    const email = session.user?.email;

    if (!email) {
      return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
    }

    const preferences = await getUserPreferencesByEmail(email);
    return NextResponse.json({ preferences });
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 401;
    const code = status === 404 ? 'USER_NOT_FOUND' : 'UNAUTHENTICATED';
    return NextResponse.json({ error: code }, { status });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requireSession();
    const email = session.user?.email;

    if (!email) {
      return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
    }

    const body: PreferencesRequestBody = await req.json().catch(() => ({}));
    const goalCode = asOptionalString(body.goalCode);

    if (body.locale !== undefined && !isSupportedLocale(body.locale)) {
      return NextResponse.json({ error: 'INVALID_LOCALE' }, { status: 422 });
    }

    if (body.unitSystem !== undefined && !isSupportedUnitSystem(body.unitSystem)) {
      return NextResponse.json({ error: 'INVALID_UNIT_SYSTEM' }, { status: 422 });
    }

    if (
      body.onboardingStatus !== undefined &&
      !isSupportedOnboardingStatus(body.onboardingStatus)
    ) {
      return NextResponse.json({ error: 'INVALID_ONBOARDING_STATUS' }, { status: 422 });
    }

    const preferences = await upsertUserPreferencesByEmail(email, {
      ...(goalCode !== undefined ? { goalCode } : {}),
      ...(body.locale !== undefined ? { locale: body.locale } : {}),
      ...(body.unitSystem !== undefined ? { unitSystem: body.unitSystem } : {}),
      ...(body.onboardingStatus !== undefined
        ? { onboardingStatus: body.onboardingStatus }
        : {}),
    });

    return NextResponse.json({ ok: true, preferences });
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 401;
    const code = status === 404 ? 'USER_NOT_FOUND' : 'UNAUTHENTICATED';
    return NextResponse.json({ error: code }, { status });
  }
}
