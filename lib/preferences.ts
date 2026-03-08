import { getPrisma } from '@/lib/prisma';

export const SUPPORTED_LOCALES = ['en', 'fr', 'de', 'es', 'it'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const SUPPORTED_UNIT_SYSTEMS = ['metric', 'imperial'] as const;
export type SupportedUnitSystem = (typeof SUPPORTED_UNIT_SYSTEMS)[number];

export const SUPPORTED_ONBOARDING_STATUSES = [
  'not_started',
  'in_progress',
  'completed',
  'skipped',
] as const;
export type SupportedOnboardingStatus = (typeof SUPPORTED_ONBOARDING_STATUSES)[number];

export type UserPreferencesInput = {
  goalCode?: string | null;
  locale?: SupportedLocale;
  unitSystem?: SupportedUnitSystem;
  onboardingStatus?: SupportedOnboardingStatus;
};

const localeToDb = {
  en: 'EN',
  fr: 'FR',
  de: 'DE',
  es: 'ES',
  it: 'IT',
} as const;

const unitSystemToDb = {
  metric: 'METRIC',
  imperial: 'IMPERIAL',
} as const;

const onboardingStatusToDb = {
  not_started: 'NOT_STARTED',
  in_progress: 'IN_PROGRESS',
  completed: 'COMPLETED',
  skipped: 'SKIPPED',
} as const;

const localeFromDb = {
  EN: 'en',
  FR: 'fr',
  DE: 'de',
  ES: 'es',
  IT: 'it',
} as const;

const unitSystemFromDb = {
  METRIC: 'metric',
  IMPERIAL: 'imperial',
} as const;

const onboardingStatusFromDb = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  SKIPPED: 'skipped',
} as const;

async function getUserByEmailOrThrow(email: string) {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true, email: true },
  });

  if (!user) {
    const err = new Error('USER_NOT_FOUND') as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  return user;
}

export async function getUserPreferencesByEmail(email: string) {
  const prisma = getPrisma();
  const user = await getUserByEmailOrThrow(email);

  const preferences = await prisma.userPreferences.findUnique({
    where: { userId: user.id },
  });

  return {
    userId: user.id,
    goalCode: preferences?.goalCode ?? null,
    locale: preferences ? localeFromDb[preferences.locale] : 'en',
    unitSystem: preferences ? unitSystemFromDb[preferences.unitSystem] : 'metric',
    onboardingStatus: preferences ? onboardingStatusFromDb[preferences.onboardingStatus] : 'not_started',
    onboardingCompletedAt: preferences?.onboardingCompletedAt?.toISOString() ?? null,
  };
}

export async function upsertUserPreferencesByEmail(email: string, input: UserPreferencesInput) {
  const prisma = getPrisma();
  const user = await getUserByEmailOrThrow(email);

  const onboardingCompletedAt =
    input.onboardingStatus === 'completed'
      ? new Date()
      : input.onboardingStatus && input.onboardingStatus !== 'completed'
        ? null
        : undefined;

  await prisma.userPreferences.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      goalCode: input.goalCode ?? null,
      locale: input.locale ? localeToDb[input.locale] : 'EN',
      unitSystem: input.unitSystem ? unitSystemToDb[input.unitSystem] : 'METRIC',
      onboardingStatus: input.onboardingStatus
        ? onboardingStatusToDb[input.onboardingStatus]
        : 'NOT_STARTED',
      onboardingCompletedAt:
        onboardingCompletedAt === undefined ? null : onboardingCompletedAt,
    },
    update: {
      ...(input.goalCode !== undefined ? { goalCode: input.goalCode } : {}),
      ...(input.locale ? { locale: localeToDb[input.locale] } : {}),
      ...(input.unitSystem ? { unitSystem: unitSystemToDb[input.unitSystem] } : {}),
      ...(input.onboardingStatus
        ? { onboardingStatus: onboardingStatusToDb[input.onboardingStatus] }
        : {}),
      ...(onboardingCompletedAt !== undefined ? { onboardingCompletedAt } : {}),
    },
  });

  return getUserPreferencesByEmail(email);
}
