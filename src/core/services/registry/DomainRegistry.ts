import type { ZodType } from 'zod';

type EntityWithId = {
    id: string;
};

type RegistrySchema<T extends EntityWithId> = ZodType<T>;

type RegistryConfig = {
    playerSchema: RegistrySchema<EntityWithId>;
    teamSchema: RegistrySchema<EntityWithId>;
};

export class DomainRegistry {
    private static instance: DomainRegistry | null = null;

    private readonly schemas = new Map<string, RegistrySchema<EntityWithId>>();
    private readonly collections = new Map<string, Map<string, EntityWithId>>();

    private constructor() {}

    public static getInstance(): DomainRegistry {
        if (!DomainRegistry.instance) {
            DomainRegistry.instance = new DomainRegistry();
        }

        return DomainRegistry.instance;
    }

    public static resetInstance(): void {
        DomainRegistry.instance = null;
    }

    public configureSchemas(config: RegistryConfig): void {
        this.registerSchema('player', config.playerSchema);
        this.registerSchema('team', config.teamSchema);
    }

    public registerSchema<T extends EntityWithId>(type: string, schema: RegistrySchema<T>): void {
        this.schemas.set(type, schema as RegistrySchema<EntityWithId>);

        if (!this.collections.has(type)) {
            this.collections.set(type, new Map<string, EntityWithId>());
        }
    }

    public register<T extends EntityWithId>(type: string, entity: T): Readonly<T> {
        return this.registerEntity(type, entity);
    }

    public get<T extends EntityWithId>(type: string, id: string): Readonly<T> | undefined {
        return this.getEntity<T>(type, id);
    }

    public registerPlayer<T extends EntityWithId>(player: T): Readonly<T> {
        return this.register('player', player);
    }

    public getPlayer<T extends EntityWithId>(id: string): Readonly<T> | undefined {
        return this.get<T>('player', id);
    }

    public registerTeam<T extends EntityWithId>(team: T): Readonly<T> {
        return this.register('team', team);
    }

    public getTeam<T extends EntityWithId>(id: string): Readonly<T> | undefined {
        return this.get<T>('team', id);
    }

    public clear(): void {
        for (const collection of this.collections.values()) {
            collection.clear();
        }
    }

    private registerEntity<T extends EntityWithId>(type: string, entity: T): Readonly<T> {
        const activeSchema = this.requireSchema(type);
        const collection = this.requireCollection(type);
        const parsedEntity = activeSchema.parse(entity) as T;
        const frozenEntity = this.freezeClone(parsedEntity);

        collection.set(frozenEntity.id, frozenEntity);

        return this.freezeClone(frozenEntity);
    }

    private getEntity<T extends EntityWithId>(type: string, id: string): Readonly<T> | undefined {
        const collection = this.requireCollection(type);
        const entity = collection.get(id);

        if (!entity) {
            return undefined;
        }

        return this.freezeClone(entity as T);
    }

    private requireSchema(type: string): RegistrySchema<EntityWithId> {
        const schema = this.schemas.get(type);

        if (!schema) {
            throw new Error(`DomainRegistry schema "${type}" has not been configured.`);
        }

        return schema;
    }

    private requireCollection(type: string): Map<string, EntityWithId> {
        const collection = this.collections.get(type);

        if (!collection) {
            throw new Error(`DomainRegistry collection "${type}" has not been configured.`);
        }

        return collection;
    }

    private freezeClone<T>(value: T): Readonly<T> {
        return this.deepFreeze(this.cloneValue(value));
    }

    private cloneValue<T>(value: T): T {
        if (typeof structuredClone === 'function') {
            return structuredClone(value);
        }

        if (Array.isArray(value)) {
            return value.map((item) => this.cloneValue(item)) as T;
        }

        if (value && typeof value === 'object') {
            return Object.fromEntries(
                Object.entries(value).map(([key, entryValue]) => [key, this.cloneValue(entryValue)])
            ) as T;
        }

        return value;
    }

    private deepFreeze<T>(value: T): Readonly<T> {
        if (!value || typeof value !== 'object') {
            return value;
        }

        Object.freeze(value);

        for (const entryValue of Object.values(value)) {
            if (entryValue && typeof entryValue === 'object' && !Object.isFrozen(entryValue)) {
                this.deepFreeze(entryValue);
            }
        }

        return value;
    }
}
