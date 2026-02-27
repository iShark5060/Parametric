import type { AppAccountProfile } from '../auth/types';

const PROFILE_STORAGE_KEY = 'parametric.profile.v1';

interface StoredProfile {
  displayName: string;
  email: string;
}

function readProfileStorage(): Record<string, StoredProfile> {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') {
      return {};
    }
    return parsed as Record<string, StoredProfile>;
  } catch {
    return {};
  }
}

function writeProfileStorage(profiles: Record<string, StoredProfile>): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profiles));
}

export function getStoredProfile(userId: number): StoredProfile | undefined {
  return readProfileStorage()[String(userId)];
}

export function mergeStoredProfile(
  profile: AppAccountProfile,
  updates: Partial<Pick<AppAccountProfile, 'displayName' | 'email'>>,
): AppAccountProfile {
  const nextProfile: AppAccountProfile = {
    ...profile,
    ...updates,
  };
  const storage = readProfileStorage();
  storage[String(nextProfile.userId)] = {
    displayName: nextProfile.displayName,
    email: nextProfile.email,
  };
  writeProfileStorage(storage);
  return nextProfile;
}
