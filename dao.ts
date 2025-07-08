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

export function getUserDetails(
    nickname: string,
) {
    const normalizedNickname = nickname.toLowerCase().trim()

    let which = 'DASHBOARD';
    const dashboardSnapshot = getSnapshot(which as keyof typeof Constants.SHEETS)
    const dashboardRow = dashboardSnapshot.rows[normalizedNickname]
    if (!dashboardRow) return { userDetails: null, lastUpdate: dashboardSnapshot.lastUpdate }

    const dashboardConfig = Constants.SHEETS[which]
    const userDetails: Record<string,string> = {}
    dashboardConfig.dataCols.forEach((colIdx, j)=>{
        userDetails[dashboardSnapshot.headers[colIdx]] = dashboardRow[j] ?? ''
    })

    // Add SAP details to userDetails
    which = 'SAP';
    const sapSnap = getSnapshot(which as keyof typeof Constants.SHEETS)
    const sapRow = sapSnap.rows[normalizedNickname]
    Logger.log(`SAP Row for ${normalizedNickname}:  ${JSON.stringify(sapRow)}`)
    Logger.log(`SAP Headers: ${JSON.stringify(sapSnap.headers)}`)
    if (sapRow) {
        const sapConfig = Constants.SHEETS[which]
        // Add SAP details to userDetails
        sapConfig.dataCols.forEach((colIdx, j) => {
            userDetails[sapSnap.headers[colIdx]] = sapRow[j] ?? ''
        })
    }


    return { userDetails, lastUpdate: dashboardSnapshot.lastUpdate }
}
