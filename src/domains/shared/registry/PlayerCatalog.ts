import { PLAYER_CATALOG_D1 } from './PlayerCatalog.d1';
import { PLAYER_CATALOG_D2 } from './PlayerCatalog.d2';
import { PLAYER_CATALOG_D3 } from './PlayerCatalog.d3';
import { PLAYER_CATALOG_D4 } from './PlayerCatalog.d4';
import type { CatalogPlayer } from './PlayerCatalog.types';

export type { CatalogPlayer } from './PlayerCatalog.types';

export const PLAYER_CATALOG: CatalogPlayer[] = [
    ...PLAYER_CATALOG_D4,
    ...PLAYER_CATALOG_D3,
    ...PLAYER_CATALOG_D2,
    ...PLAYER_CATALOG_D1
];
