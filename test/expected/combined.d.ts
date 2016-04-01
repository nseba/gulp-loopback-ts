interface Primary {
    primaryId: string;
}

interface Injected {
    id: number;
    someProperty?: number;
}

interface Related {
    relationship1Id: string;
    relationship2Id: number;
}