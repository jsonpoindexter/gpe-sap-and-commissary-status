import { getSheetDetails } from './dao'

// Apps Script uses the global object; `globalThis` is the safest alias.
const g = globalThis as any
g.doGet = () => {
    const htmlTemplate = HtmlService.createTemplateFromFile('index')
    return htmlTemplate.evaluate().setTitle('Commissary and SAP Status').setSandboxMode(HtmlService.SandboxMode.IFRAME)
}

g.doPost = (e: GoogleAppsScript.Events.DoPost) =>doPost(e)


interface PostData {
    secretKey: string
    postProcessLastUpdate: string
}
function doPost(e: GoogleAppsScript.Events.DoPost): GoogleAppsScript.Content.TextOutput {
    // Logger.log('doPost called')
    const properties: GoogleAppsScript.Properties.Properties =
        PropertiesService.getScriptProperties()
    if (e.postData.type === 'application/json') {
        const postData: PostData = JSON.parse(e.postData.contents)
        const { secretKey, postProcessLastUpdate } = postData
        if (secretKey !== properties.getProperty('secretKey')) {
            // Logger.log('Unauthorized doPost request')
            return ContentService.createTextOutput('Error: Unauthorized')
        }
        if (postProcessLastUpdate) {
            // Logger.log('Post Data: ', JSON.stringify(postData))
            properties.setProperty('postProcessLastUpdate', postProcessLastUpdate)
            return ContentService.createTextOutput('Update stored successfully.')
        }
    }

    return ContentService.createTextOutput('Error: Invalid Content Type')
}
