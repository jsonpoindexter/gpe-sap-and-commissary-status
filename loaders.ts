namespace Loaders {

    export interface Snapshot {
        lastUpdate: string | null
        headers: string[]
        rows: Record<string, (string | null)[]>
    }

    export function buildSnapshot(cfg: Constants.SheetConfig, lastUpdate: string | null): Snapshot {
        const sheet = SpreadsheetApp.openById(Constants.SPREADSHEET_ID).getSheetByName(cfg.name)
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] as string[]

        const data = sheet
            .getRange(2, 1, sheet.getLastRow() - 1, headers.length)
            .getValues()

        const rows: Snapshot['rows'] = {}

        data.forEach(row => {
            const nick = (row[cfg.nicknameCol] as string).toLowerCase().trim()
            if (!nick) return

            rows[nick] = cfg.dataCols.map(i => {
                const value = row[i]
                if (value instanceof Date) return value.toLocaleDateString('en-US')
                if (Utils.isBoolString(value)) return value.toString().toUpperCase()
                return value?.toString() ?? null
            })
        })

        return { lastUpdate, headers, rows }
    }

}