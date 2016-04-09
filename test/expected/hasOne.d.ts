interface Relation<T> {
    (err: any, item: T): void;
    build(data: T | any): void;
    create(data: T | any, callback: (err: any, item: T) => void): void;
    destroy(callback: (err: any) => void): void;
    update(data: T | any, callback: (err: any, item: T) => void): void;
}

interface Primary {
    primaryId: string;
    relatedId: number;
}

interface Injected {
    id: number;
    someProperty?: number;
}

interface Related {
    id: number;
    hasOneRelation: Relation<Primary>;
}