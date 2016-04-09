interface Primary {
    primaryId: string;
}

interface Injected {
    id: number;
    someProperty?: number;
}

interface Related {
    id: number;
    relationship1Id: string;
    relationship2Id: number;
    noForeignKeyId: number;
}