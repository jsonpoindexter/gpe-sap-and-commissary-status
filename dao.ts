namespace Dao {
    function getSnapshot(which: keyof typeof Constants.SHEETS): Loaders.Snapshot {
        const cfg = Constants.SHEETS[which]
        const key = cfg.cacheKey

        const currentLastUpdate = PropertiesService.getScriptProperties().getProperty(
            'postProcessLastUpdate',
        )

        const cached = Cache.read<Loaders.Snapshot>(key)
        if (cached && cached.lastUpdate === currentLastUpdate) {
            Logger.log(`Using cached snapshot for ${cfg.name}`)
            return cached
        } else {
            Logger.log(`Cache miss for ${cfg.name}, building fresh snapshot`)
        }

        const fresh = Loaders.buildSnapshot(cfg, currentLastUpdate)
        Cache.write(key, fresh)
        return fresh
    }

    export function getSheetDetails(
        nickname: string,
        which: keyof typeof Constants.SHEETS,
    ) {
        const sheetConfig = Constants.SHEETS[which]
        const snapshot = getSnapshot(which)
        const row = snapshot.rows[nickname]
        if (!row)
            return {
                [`${sheetConfig.propertyName}`]: null,
                lastUpdate: snapshot.lastUpdate,
            }

        const details: Record<string, string> = {}
        sheetConfig.dataCols.forEach((column, index) => {
            details[snapshot.headers[column]] = row[index] ?? ''
        })

        if (which === 'SAP')
            details.mainEventShiftsRequired =
                sheetConfig.mainEventShiftsRequired.toString()

        return {
            [`${sheetConfig.propertyName}`]: details,
            lastUpdate: snapshot.lastUpdate,
        }
    }
}

export function onSearch(uniqueId: string) {
    const normalizedId = uniqueId.toLowerCase().trim()

    const dashboardDetails = Dao.getSheetDetails(normalizedId, 'DASHBOARD')
    const sapDetails = Dao.getSheetDetails(normalizedId, 'SAP')
    const eatsDetails = Dao.getSheetDetails(normalizedId, 'EATS')

    const response = {
        ...dashboardDetails,
        ...sapDetails,
        ...eatsDetails,
        lastUpdate: dashboardDetails.lastUpdate || sapDetails.lastUpdate,
    }
    Logger.log(`onSearch response: ${JSON.stringify(response)}`)
    return response
}
