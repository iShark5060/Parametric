import { useState, useEffect, useCallback } from 'react';

import { apiFetch } from '../utils/api';

const LEGACY_STORAGE_KEY = 'parametric_loadouts';
const MIGRATED_KEY = 'parametric_loadouts_migrated_v1';
const MIGRATION_MAP_KEY = 'parametric_build_id_map_v1';

export interface LoadoutBuild {
  build_id: string;
  slot_type: string;
}

export interface Loadout {
  id: string;
  name: string;
  builds: LoadoutBuild[];
  created_at: string;
  updated_at: string;
}

export const LOADOUT_SLOT_TYPES = [
  { key: 'warframe', label: 'Warframe' },
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'melee', label: 'Melee' },
  { key: 'companion', label: 'Companion' },
  { key: 'companion_weapon', label: 'Companion Weapon' },
  { key: 'archwing', label: 'Archwing' },
  { key: 'archgun', label: 'Arch-Gun' },
  { key: 'archmelee', label: 'Arch-Melee' },
] as const;

function readLegacyLoadouts(): Loadout[] {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useLoadoutStorage() {
  const [loadouts, setLoadouts] = useState<Loadout[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await apiFetch('/api/loadouts');
      if (!response.ok) {
        setLoadouts([]);
        return;
      }
      const body = (await response.json()) as {
        loadouts?: Array<Record<string, unknown>>;
      };
      const rows = Array.isArray(body.loadouts) ? body.loadouts : [];
      const mapped = rows.map((row) => ({
        id: String(row.id ?? ''),
        name: typeof row.name === 'string' ? row.name : 'Loadout',
        builds: Array.isArray(row.builds)
          ? (row.builds as Array<Record<string, unknown>>).map((build) => ({
              build_id: String(build.build_id ?? ''),
              slot_type: String(build.slot_type ?? ''),
            }))
          : [],
        created_at: String(row.created_at ?? new Date().toISOString()),
        updated_at: String(row.updated_at ?? new Date().toISOString()),
      })) as Loadout[];
      setLoadouts(mapped.filter((loadout) => loadout.id.length > 0));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function migrateLegacyLoadouts(): Promise<void> {
      if (localStorage.getItem(MIGRATED_KEY) === '1') {
        return;
      }
      const legacyLoadouts = readLegacyLoadouts();
      if (legacyLoadouts.length === 0) {
        localStorage.setItem(MIGRATED_KEY, '1');
        return;
      }
      const idMapRaw = localStorage.getItem(MIGRATION_MAP_KEY);
      const idMap = idMapRaw
        ? (JSON.parse(idMapRaw) as Record<string, string>)
        : {};
      for (const loadout of legacyLoadouts) {
        try {
          const createRes = await apiFetch('/api/loadouts', {
            method: 'POST',
            body: JSON.stringify({ name: loadout.name }),
          });
          if (!createRes.ok) {
            continue;
          }
          const createBody = (await createRes.json()) as {
            id?: string | number;
          };
          const newLoadoutId =
            createBody.id !== undefined ? String(createBody.id) : null;
          if (!newLoadoutId) {
            continue;
          }
          for (const buildLink of loadout.builds) {
            const mappedBuildId = idMap[buildLink.build_id];
            if (!mappedBuildId) {
              continue;
            }
            await apiFetch(`/api/loadouts/${newLoadoutId}/builds`, {
              method: 'POST',
              body: JSON.stringify({
                build_id: mappedBuildId,
                slot_type: buildLink.slot_type,
              }),
            });
          }
        } catch {
          // keep migrating best-effort
        }
      }
      localStorage.setItem(MIGRATED_KEY, '1');
    }

    void (async () => {
      await migrateLegacyLoadouts();
      await refresh();
    })();
  }, [refresh]);

  const createLoadout = useCallback(
    async (name: string): Promise<Loadout> => {
      const response = await apiFetch('/api/loadouts', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      if (!response.ok) {
        throw new Error('Failed to create loadout');
      }
      const body = (await response.json()) as { id?: string | number };
      const loadout: Loadout = {
        id: String(body.id ?? crypto.randomUUID()),
        name,
        builds: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await refresh();
      return loadout;
    },
    [refresh],
  );

  const deleteLoadout = useCallback(
    async (id: string) => {
      await apiFetch(`/api/loadouts/${id}`, { method: 'DELETE' });
      await refresh();
    },
    [refresh],
  );

  const linkBuild = useCallback(
    async (loadoutId: string, buildId: string, slotType: string) => {
      await apiFetch(`/api/loadouts/${loadoutId}/builds`, {
        method: 'POST',
        body: JSON.stringify({
          build_id: buildId,
          slot_type: slotType,
        }),
      });
      await refresh();
    },
    [refresh],
  );

  const unlinkBuild = useCallback(
    async (loadoutId: string, slotType: string) => {
      await apiFetch(`/api/loadouts/${loadoutId}/builds/${slotType}`, {
        method: 'DELETE',
      });
      await refresh();
    },
    [refresh],
  );

  const getLoadout = useCallback(
    (id: string): Loadout | undefined => {
      return loadouts.find((loadout) => loadout.id === id);
    },
    [loadouts],
  );

  return {
    loadouts,
    loading,
    createLoadout,
    deleteLoadout,
    linkBuild,
    unlinkBuild,
    getLoadout,
    refresh,
  };
}
