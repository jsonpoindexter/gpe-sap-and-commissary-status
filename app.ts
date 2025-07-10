function doGet() {
    const htmlTemplate = HtmlService.createTemplateFromFile('index')
    return htmlTemplate
        .evaluate()
        .setTitle('SAP, Eats, and Showers Status')
        .setSandboxMode(HtmlService.SandboxMode.IFRAME)
}

interface PostData {
    secretKey: string
    postProcessLastUpdate: string
}

function doPost(e: GoogleAppsScript.Events.DoPost): GoogleAppsScript.Content.TextOutput {
    Logger.log('doPost called')
    const properties: GoogleAppsScript.Properties.Properties =
        PropertiesService.getScriptProperties()
    if (e.postData.type === 'application/json') {
        const postData: PostData = JSON.parse(e.postData.contents)
        const { secretKey, postProcessLastUpdate } = postData
        if (secretKey !== properties.getProperty('secretKey')) {
            Logger.log('Unauthorized doPost request')
            return ContentService.createTextOutput('Error: Unauthorized')
        }
        if (postProcessLastUpdate) {
            Logger.log('Post Data: ', JSON.stringify(postData))
            properties.setProperty('postProcessLastUpdate', postProcessLastUpdate)
            // queue cache rebuild in the background
            ScriptApp.newTrigger('hydrateAllCaches')
                .timeBased()
                .after(10 * 1000) // run ~10 s from now
                .create()
            return ContentService.createTextOutput('Update stored successfully.')
        }
    }

    return ContentService.createTextOutput('Error: Invalid Content Type')
}

/**
 * Hydrates all caches by fetching the latest data from the sheets and storing it in the cache.
 */
export function hydrateAllCaches() {
    Logger.log('Hydrating all caches...')
    const lock = LockService.getScriptLock()
    if (!lock.tryLock(20_000)) return // another run is already busy

    try {
        const last = PropertiesService.getScriptProperties().getProperty(
            'postProcessLastUpdate',
        )

        Object.values(Constants.SHEETS).forEach(cfg => {
            const snap = Loaders.buildSnapshot(cfg, last)
            Cache.write(cfg.cacheKey, snap) // overwrite even if unchanged
        })
    } finally {
        lock.releaseLock()
    }
}
