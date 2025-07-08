namespace Constants {
    export const SPREADSHEET_ID =
        '1uLIgvMFH1mQCqGy4hg4FkV30SBu6AUEJvj4Yu6HKJho'

    export interface SheetConfig {
        name: string
        nicknameCol: number         // 0-based
        dataCols: number[]          // 0-based
        cacheKey: string            // ScriptCache key
    }

    export const SHEETS: Record<'DASHBOARD' | 'SAP', SheetConfig> = {
        DASHBOARD: {
            name: 'Dashboard',
            nicknameCol: 4,
            dataCols: [4, 14, 15, 19, 20, 21],
            cacheKey: 'cache_dashboard',
        },
        SAP: {
            name: 'SAP',
            nicknameCol: 1,           // column B => index 1
            dataCols: [4, 5, 6, 7, 8, 9, 10], // E–K
            cacheKey: 'cache_sap',
        },
    };


    export const CACHE_TTL = 21600   // 6 h
}

