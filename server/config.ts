import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const parentName = path.basename(path.resolve(__dirname, '..'));
export const PROJECT_ROOT = path.resolve(
  __dirname,
  parentName === 'dist' ? '../..' : '..',
);
export const DATA_DIR = path.join(PROJECT_ROOT, 'data');
export const EXPORTS_DIR = path.join(DATA_DIR, 'exports');
export const IMAGES_DIR = path.join(DATA_DIR, 'images');
export const DB_PATH = path.join(DATA_DIR, 'parametric.db');
export const CORPUS_DB_PATH = path.join(DATA_DIR, 'corpus.db');
export const CENTRAL_DB_PATH =
  process.env.CENTRAL_DB_PATH || path.join(DATA_DIR, 'central.db');

const _port = parseInt(process.env.PORT || '3001', 10);
export const PORT = Number.isFinite(_port) && _port > 0 ? _port : 3001;
export const HOST = process.env.HOST || '127.0.0.1';
export const NODE_ENV = process.env.NODE_ENV || 'development';
const rawSessionSecret =
  process.env.SESSION_SECRET?.trim() ||
  (NODE_ENV === 'production' ? '' : 'parametric-nonprod-secret');
if (!rawSessionSecret && NODE_ENV === 'production') {
  throw new Error('[FATAL] SESSION_SECRET must be set.');
}
export const SESSION_SECRET = rawSessionSecret;

export const APP_NAME = 'Parametric';

export const MANIFEST_URL =
  'https://origin.warframe.com/PublicExport/index_en.txt.lzma';
export const CONTENT_BASE_URL =
  'https://content.warframe.com/PublicExport/Manifest/';
export const IMAGE_BASE_URL = 'https://content.warframe.com/PublicExport';

export const REQUIRED_EXPORTS = [
  'ExportCustoms',
  'ExportDrones',
  'ExportFlavour',
  'ExportFusionBundles',
  'ExportGear',
  'ExportKeys',
  'ExportManifest',
  'ExportRecipes',
  'ExportRegions',
  'ExportRelicArcane',
  'ExportResources',
  'ExportSentinels',
  'ExportSortieRewards',
  'ExportUpgrades',
  'ExportWarframes',
  'ExportWeapons',
] as const;

export const TRUST_PROXY =
  process.env.TRUST_PROXY === '1' || process.env.TRUST_PROXY === 'true';
export const SECURE_COOKIES =
  process.env.SECURE_COOKIES === '1' || process.env.SECURE_COOKIES === 'true';
export const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;
export const GAME_ID = 'parametric';

export function ensureDataDirs(): void {
  for (const dir of [DATA_DIR, EXPORTS_DIR, IMAGES_DIR]) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}
