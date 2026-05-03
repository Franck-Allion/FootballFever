import Dexie, { type Table } from 'dexie';
// eslint-disable-next-line no-restricted-imports -- Story 2.1 requires validating persistence with shared domain schemas.
import { 
    PlayerSchema, 
    TeamSchema, 
    GameStateSchema, 
    type Player, 
    type Team, 
    type GameStateData 
} from '@domains/shared/schemas/EntitySchemas';

export class FootballFeverDB extends Dexie {
    players!: Table<Player>;
    teams!: Table<Team>;
    gameState!: Table<GameStateData>;

    constructor(options?: { indexedDB?: IDBFactory; IDBKeyRange?: typeof IDBKeyRange }) {
        super('FootballFeverDB', options);
        this.version(1).stores({
            players: 'id, name, rarity',
            teams: 'id, name',
            gameState: 'id'
        });
    }
}

export class DatabaseService {
    private static instance: DatabaseService | null = null;
    private db: FootballFeverDB;

    private constructor(options?: { indexedDB?: IDBFactory; IDBKeyRange?: typeof IDBKeyRange }) {
        this.db = new FootballFeverDB(options);
    }

    public static getInstance(options?: { indexedDB?: IDBFactory; IDBKeyRange?: typeof IDBKeyRange }): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService(options);
        }
        return DatabaseService.instance;
    }

    public static resetInstanceForTests(): void {
        DatabaseService.instance = null;
    }


    // Players
    public async savePlayer(player: Player): Promise<void> {
        const validated = PlayerSchema.parse(player);
        await this.db.players.put(validated);
    }

    public async loadPlayer(id: string): Promise<Player | undefined> {
        const data = await this.db.players.get(id);
        return data ? PlayerSchema.parse(data) : undefined;
    }

    public async loadAllPlayers(): Promise<Player[]> {
        const data = await this.db.players.toArray();
        return data.map(p => PlayerSchema.parse(p));
    }

    public async deletePlayer(id: string): Promise<void> {
        await this.db.players.delete(id);
    }

    // Teams
    public async saveTeam(team: Team): Promise<void> {
        const validated = TeamSchema.parse(team);
        await this.db.teams.put(validated);
    }

    public async loadTeam(id: string): Promise<Team | undefined> {
        const data = await this.db.teams.get(id);
        return data ? TeamSchema.parse(data) : undefined;
    }

    public async loadAllTeams(): Promise<Team[]> {
        const data = await this.db.teams.toArray();
        return data.map(t => TeamSchema.parse(t));
    }

    // Global Game State
    public async saveGlobalState(state: GameStateData): Promise<void> {
        const validated = GameStateSchema.parse(state);
        await this.db.gameState.put(validated);
    }

    public async loadGlobalState(id: string = 'current_session'): Promise<GameStateData | undefined> {
        const data = await this.db.gameState.get(id);
        return data ? GameStateSchema.parse(data) : undefined;
    }

    // Utility
    public async clearAll(): Promise<void> {
        await Promise.all([
            this.db.players.clear(),
            this.db.teams.clear(),
            this.db.gameState.clear()
        ]);
    }

    public async close(): Promise<void> {
        await this.db.close();
    }
}
