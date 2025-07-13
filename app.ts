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
            ScriptApp.newTrigger('hydrateAllCachesOnDoPost')
                .timeBased()
                .after(10 * 1000) // run ~10 s from now
                .create()
            return ContentService.createTextOutput('Update stored successfully.')
        }
    }

    return ContentService.createTextOutput('Error: Invalid Content Type')
}

/**
 * One‑shot wrapper used by the “after 10s” trigger created in doPost().
 * It rebuilds the caches and then removes its own trigger so the
 * maintenance logic (ensureHydrateTrigger) won’t mistake it for the 5‑hour recurring trigger.
 */
function hydrateAllCachesOnDoPost(e?: GoogleAppsScript.Events.TimeDriven) {
    try {
        hydrateAllCaches()
    } finally {
        // Delete this very trigger so it never fires again
        const thisId = e?.triggerUid
        if (thisId) {
            ScriptApp.getProjectTriggers()
                .filter(t => t.getUniqueId() === thisId)
                .forEach(t => ScriptApp.deleteTrigger(t))
        }
    }
}

/**

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

/**
 * Ensure there is a recurring time‑driven trigger that re‑hydrates the caches
 * before the 6‑hour ScriptCache TTL expires. We choose every 5h so the data
 * is always refreshed in the background and users never wait for a cold build.
 */
function ensureHydrateTrigger(): void {
    const exists = ScriptApp.getProjectTriggers().some(
        t => t.getHandlerFunction() === 'hydrateAllCaches',
    )
    if (!exists) {
        Logger.log('No hydrateAllCaches trigger found, creating one...')
        ScriptApp.newTrigger('hydrateAllCaches')
            .timeBased()
            .everyHours(5) // ≈1h sooner than CACHE_TTL
            .create()
        Logger.log('Created recurring hydrateAllCaches trigger (every 5h)')
    } else {
        Logger.log(
            'Recurring hydrateAllCachesRecurring trigger already exists, skipping creation.',
        )
    }
}

// Make sure the background refresh trigger is set up when the script first loads.
ensureHydrateTrigger()
