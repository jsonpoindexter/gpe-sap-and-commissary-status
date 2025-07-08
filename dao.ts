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
    const which = 'DASHBOARD';
    const snap = getSnapshot(which)
    const norm = nickname.toLowerCase().trim()
    const row = snap.rows[norm]

    if (!row) return { userDetails: null, lastUpdate: snap.lastUpdate }

    const cfg = Constants.SHEETS[which]
    const userDetails: Record<string,string> = {}
    cfg.dataCols.forEach((colIdx, j)=>{
        userDetails[snap.headers[colIdx]] = row[j] ?? ''
    })
    return { userDetails, lastUpdate: snap.lastUpdate }
}
