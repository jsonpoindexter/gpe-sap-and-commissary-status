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

function getUserDetails(email: string) {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME)
    const data = sheet.getDataRange().getValues()
    const headers = data[0] // Fetch the headers
    const resultString = data.find(row => row[EMAIL_ROW].toLowerCase() === email.toLowerCase()) // Assuming details are in the 5th column\
    // Create a resultObj that contains the headers as keys and the values as values from RESULT_COLLUMNS
    const resultObj = {}
    if (resultString) {
        RESULT_COLUMNS.forEach(i => {
            // If value is of Date type then format it to local  military time string. example: 7/7/2024 00:00
            if (resultString[i] instanceof Date) {
                resultString[i] = `${resultString[i].toLocaleDateString('en-US')}`
            }
            resultObj[headers[i]] = resultString[i]
        })
        return JSON.stringify(resultObj)
    } else {
        return null
    }
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