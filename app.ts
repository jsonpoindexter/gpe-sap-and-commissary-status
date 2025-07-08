const SHEET_ID = '1uLIgvMFH1mQCqGy4hg4FkV30SBu6AUEJvj4Yu6HKJho'
const SHEET_NAME = 'Dashboard'
const NICKNAME_ROW = 4
const RESULT_COLUMNS = [4, 14, 15, 19, 20, 21]

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
    Logger.log(`getUserDetails called with nickname:  ${nickname}`)
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME)
    const data = sheet.getDataRange().getValues()
    const headers = data[0] // Fetch the headers
    Logger.log(`Headers: ${JSON.stringify(headers)}`)
    const resultString = data.find(
        row => row[NICKNAME_ROW].toLowerCase().trim() === nickname.toLowerCase().trim(),
    )
    Logger.log(`Result String: ${JSON.stringify(resultString)}`)
    const resultObj = {
        userDetails: null,
        lastUpdate: PropertiesService.getScriptProperties().getProperty(
            'postProcessLastUpdate',
        ),
    }
    if (resultString) {
        resultObj.userDetails = {}
        RESULT_COLUMNS.forEach(i => {
            if (resultString[i] instanceof Date) {
                resultString[i] = `${resultString[i].toLocaleDateString('en-US')}`
            } else if (isBoolString(resultString[i])) {
                resultString[i] = resultString[i].toString().toUpperCase()
            }
            resultObj.userDetails[headers[i]] = resultString[i]
        })
    }
    return resultObj
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
