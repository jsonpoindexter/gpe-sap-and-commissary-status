namespace Constants {
    export const SPREADSHEET_ID = '1uLIgvMFH1mQCqGy4hg4FkV30SBu6AUEJvj4Yu6HKJho'

    export interface SheetConfig {
        name: string
        propertyName: string // Optional, derived from name
        nicknameCol: number // 0-based
        dataCols: number[] // 0-based
        cacheKey: string // ScriptCache key
        mainEventShiftsRequired?: number // Optional, used for SAP sheet
    }

    function nameToPropertyName(name: string): string {
        return `${name.toLowerCase()}Details`
    }

    export const SHEETS: Record<'DASHBOARD' | 'SAP' | 'EATS', SheetConfig> = {
        DASHBOARD: {
            name: 'Dashboard',
            propertyName: nameToPropertyName('Dashboard'),
            nicknameCol: 4,
            dataCols: [4, 14, 15, 19, 20, 21],
            cacheKey: 'cache_dashboard',
        },
        SAP: {
            name: 'SAP',
            propertyName: nameToPropertyName('SAP'),
            nicknameCol: 1, // column B => index 1
            dataCols: [4, 5, 6, 7, 8, 9, 10], // E–K
            cacheKey: 'cache_sap',
            mainEventShiftsRequired: 3,
        },
        EATS: {
            name: 'Eats',
            propertyName: nameToPropertyName('EATS'),
            nicknameCol: 1, // column B => index 4
            dataCols: [7, 8, 9, 15, 16, 17], // H-J, P-R
            cacheKey: 'cache_eats',
        },
    }

    export const CACHE_TTL = 21600 // 6 h
}
