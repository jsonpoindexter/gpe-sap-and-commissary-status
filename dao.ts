function getSnapshot(which: keyof typeof Constants.SHEETS): Loaders.Snapshot {
    const cfg = Constants.SHEETS[which]
    const key = cfg.cacheKey

    const currentLastUpdate =
        PropertiesService.getScriptProperties().getProperty('postProcessLastUpdate')

    const cached = Cache.read<Loaders.Snapshot>(key)
    if (cached && cached.lastUpdate === currentLastUpdate) return cached

    const fresh = Loaders.buildSnapshot(cfg, currentLastUpdate)
    Cache.write(key, fresh)
    return fresh
}

export function onSearch(uniqueId: string) {
    const normalizedId = uniqueId.toLowerCase().trim()
    const dashboardDetails = getSheetDetails(normalizedId, 'DASHBOARD')
    const sapDetails = getSheetDetails(normalizedId, 'SAP')
    return {
        ...dashboardDetails,
        ...sapDetails,
        lastUpdate: dashboardDetails.lastUpdate || sapDetails.lastUpdate,
    }
}

export function getSheetDetails(
    nickname: string,
    which: keyof typeof Constants.SHEETS
) {
    const sheetConfig = Constants.SHEETS[which]
    const snapshot = getSnapshot(which)
    const row = snapshot.rows[nickname]
    if (!row) return { [`${sheetConfig.propertyName}`]: null, lastUpdate: snapshot.lastUpdate }


    const details: Record<string,string> = {}
    sheetConfig.dataCols.forEach((column, index)=>{
        details[snapshot.headers[column]] = row[index] ?? ''
    })
    return { [`${sheetConfig.propertyName}`]: details, lastUpdate: snapshot.lastUpdate }
}
