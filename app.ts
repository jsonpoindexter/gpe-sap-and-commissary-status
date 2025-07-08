const SPREADSHEET_ID = '1uLIgvMFH1mQCqGy4hg4FkV30SBu6AUEJvj4Yu6HKJho'
const SHEET_NAME = 'Dashboard'
const NICKNAME_ROW = 4

const RESULT_COLUMNS = [4, 14, 15, 19, 20, 21]

/**
 * One‑shot cache of the whole Dashboard (only the columns we care about),
 * keyed by lowercase nickname → array of selected column values.
 * We refresh it only when `postProcessLastUpdate` changes.
 *
 * CacheService limits entries to 100 KB; 500 rows × 6 columns of short strings
 * ≈ 30–40 KB so we’re safe.
 */
const CACHE_KEY_DASHBOARD = 'dashboardCache'

interface DashboardCache {
    lastUpdate: string | null
    data: Record<string, (string | null)[]>
}

/**
 * Read the sheet once and prepare the cache payload.
 */
function refreshDashboardCache(): DashboardCache {
    const props = PropertiesService.getScriptProperties()
    const lastUpdate = props.getProperty('postProcessLastUpdate')

    const headers = getDashboardHeaders()
    const lastRow = DASHBOARD_SHEET.getLastRow()
    const values = DASHBOARD_SHEET
        .getRange(2, 1, lastRow - 1, headers.length)
        .getValues()

    const data: Record<string, (string | null)[]> = {}

    values.forEach(row => {
        const nick = (row[NICKNAME_ROW] as string).toLowerCase().trim()
        if (!nick) return

        const cols: (string | null)[] = RESULT_COLUMNS.map(i => {
            const raw = row[i]
            if (raw instanceof Date) return raw.toLocaleDateString('en-US')
            if (isBoolString(raw)) return raw.toString().toUpperCase()
            return raw?.toString() ?? null
        })
        data[nick] = cols
    })

    return { lastUpdate, data }
}

/**
 * Return cached snapshot, refreshing if `postProcessLastUpdate` has changed.
 */
function getDashboardCache(): DashboardCache {
    const cache = CacheService.getScriptCache()
    const cachedStr = cache.get(CACHE_KEY_DASHBOARD)
    const currentLastUpdate = PropertiesService.getScriptProperties().getProperty(
        'postProcessLastUpdate',
    )

    if (cachedStr) {
        Logger.log('Cache hit for dashboard data')
        const cached = JSON.parse(cachedStr) as DashboardCache
        Logger.log(`Cache size: ${cachedStr.length} bytes`)
        Logger.log(`Cache last update: ${cached.lastUpdate}, currentLastUpdate: ${currentLastUpdate}`)
        if (cached.lastUpdate === currentLastUpdate) {
            return cached
        }
    }

    const fresh = refreshDashboardCache()
    // Store for up to 6 h (max TTL). 21600 s.
    cache.put(CACHE_KEY_DASHBOARD, JSON.stringify(fresh), 21600)
    Logger.log(`Dashboard cache updated, size: ${JSON.stringify(fresh).length} bytes`)
    return fresh
}

/**
 * Cache the Dashboard sheet reference so we don’t re‑open the spreadsheet on every call.
 * Apps Script keeps global variables alive for the life of the execution context.
 */
const DASHBOARD_SHEET = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME)

/**
 * Fetch the header row once per execution context.
 */
let DASHBOARD_HEADERS: string[] | null = null
function getDashboardHeaders(): string[] {
    if (DASHBOARD_HEADERS === null) {
        DASHBOARD_HEADERS = DASHBOARD_SHEET
            .getRange(1, 1, 1, DASHBOARD_SHEET.getLastColumn())
            .getValues()[0] as string[]
    }
    return DASHBOARD_HEADERS
}

// 1. If you can build a tool that will tell them what additional shifts they need to get that would be great
// 2. you can show weekly shifts / food credits, those are in GPE 3035 in Eats tab. this will let people know what they need to add if any.

function doGet() {
    Logger.log('doGet called')
    const template = HtmlService.createTemplateFromFile('index')
    template.data = null
    return template
        .evaluate()
        .setTitle('SAP and Commissary Status.')
        .setSandboxMode(HtmlService.SandboxMode.IFRAME)
}

interface UserDetails {
    userDetails?: Record<string, string>
    lastUpdate?: string
}

function getUserDetails(nickname: string): UserDetails {
    const normalizedNick = nickname.toLowerCase().trim()

    Logger.log(`getUserDetails called for: ${normalizedNick}`)

    const cache = getDashboardCache()

    const result: UserDetails = {
        userDetails: null,
        lastUpdate: cache.lastUpdate ?? undefined,
    }

    const rowValues = cache.data[normalizedNick]
    if (rowValues) {
        const headers = getDashboardHeaders()
        const userDetails: Record<string, string> = {}
        RESULT_COLUMNS.forEach((colIdx, j) => {
            const value = rowValues[j]
            userDetails[headers[colIdx]] = value ?? ''
        })
        result.userDetails = userDetails
    }

    return result
}

function isBoolString(value: string): boolean {
    return (
        value !== undefined &&
        value !== null &&
        (typeof value === 'string' || typeof value === 'boolean') &&
        (value.toString().toLowerCase() === 'true' || value.toString().toLowerCase() === 'false')
    )
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
            return ContentService.createTextOutput('Update stored successfully.')
        }
    }

    return ContentService.createTextOutput('Error: Invalid Content Type')
}
