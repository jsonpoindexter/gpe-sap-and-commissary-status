namespace Loaders {
    export interface Snapshot {
        lastUpdate: string | null
        headers: string[]
        rows: Record<string, (string | null)[]>
    }

    export function buildSnapshot(
        cfg: Constants.SheetConfig,
        lastUpdate: string | null,
    ): Snapshot {
        Logger.log(`Building snapshot for ${cfg.name} with lastUpdate: ${lastUpdate}`)
        const sheet = SpreadsheetApp.openById(Constants.SPREADSHEET_ID).getSheetByName(
            cfg.name,
        )

        const allCols = [cfg.nicknameCol, ...cfg.dataCols]
        const minCol = Math.min(...allCols)
        const maxCol = Math.max(...allCols)
        const width = maxCol - minCol + 1

        const headerRow = sheet
            .getRange(1, minCol + 1, 1, width)
            .getValues()[0] as string[]
        const body = sheet
            .getRange(2, minCol + 1, sheet.getLastRow() - 1, width)
            .getValues()

        const rows: Snapshot['rows'] = {}

        body.forEach(row => {
            const nick = (row[cfg.nicknameCol - minCol] as string).toLowerCase().trim()
            if (!nick) return

            rows[nick] = cfg.dataCols.map(colIdx => {
                const value = row[colIdx - minCol]
                if (value instanceof Date) return value.toLocaleDateString('en-US')
                if (Utils.isBoolString(value)) return value.toString().toUpperCase()
                return value?.toString() ?? null
            })
        })

        // Re-map headerRow back to absolute indexes so callers don’t change
        const headersAbsolute: string[] = []
        headerRow.forEach((h, i) => (headersAbsolute[minCol + i] = h))

        return { lastUpdate, headers: headersAbsolute, rows }
    }
}
