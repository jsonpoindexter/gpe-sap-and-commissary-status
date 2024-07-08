const SHEET_ID = '1xYW4FNVTQ3UoyiUqY83t5CKOqT9cCjAxg_XESSViGZo';
const SHEET_NAME = 'Dashboard';
const EMAIL_ROW = 4;
const RESULT_COLUMNS = [4, 15, 19, 20, 21];

function doGet() {
    Logger.log("doGet called")
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

function getUserDetails(email: string): UserDetails {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME)
    const data = sheet.getDataRange().getValues()
    const headers = data[0] // Fetch the headers
    const resultString = data.find(row => row[EMAIL_ROW].toLowerCase() === email.toLowerCase()) // Assuming details are in the 5th column\
    const resultObj = { userDetails: null, lastUpdate: PropertiesService.getScriptProperties().getProperty('postProcessLastUpdate')}
    if (resultString) {
        resultObj.userDetails = {}
        RESULT_COLUMNS.forEach(i => {
            if (resultString[i] instanceof Date) {
                resultString[i] = `${resultString[i].toLocaleDateString('en-US')}`
            }
            resultObj.userDetails[headers[i]] = resultString[i]
        })
    }
    return resultObj
}


interface PostData {
    secretKey: string
    postProcessLastUpdate: string
}
function doPost(e: GoogleAppsScript.Events.DoPost): GoogleAppsScript.Content.TextOutput {
    Logger.log("doPost called")
    const properties: GoogleAppsScript.Properties.Properties = PropertiesService.getScriptProperties();
    if (e.postData.type === 'application/json') {
        const postData: PostData = JSON.parse(e.postData.contents);
        const {secretKey, postProcessLastUpdate} = postData;
        if (secretKey !== properties.getProperty('secretKey')) {
            Logger.log("Unauthorized doPost request")
            return ContentService.createTextOutput("Error: Unauthorized");
        }
        if (postProcessLastUpdate) {
            Logger.log("Post Data: ", JSON.stringify(postData));
            properties.setProperty('postProcessLastUpdate', postProcessLastUpdate);
            return ContentService.createTextOutput("Update stored successfully.");
        }
    }

    return ContentService.createTextOutput("Error: Invalid Content Type");
}