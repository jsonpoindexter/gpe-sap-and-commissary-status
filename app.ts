const SHEET_ID = '1z7vKyVMcpmJJsMXODARWSg-yM5FmA7NbYuySTn_AU0M'
const SHEET_NAME = 'Dashboard'
const EMAIL_ROW = 4
const RESULT_COLUMNS = [4, 15, 19, 20, 21]

function doGet() {
    const template = HtmlService.createTemplateFromFile('index')
    template.data = null
    return template
        .evaluate()
        .setTitle('SAP and Commissary Status.')
        .setSandboxMode(HtmlService.SandboxMode.IFRAME)
}

function getUserDetails(email: string) {
    let startGetUserDetailsTime = new Date().getTime()
    let openSheetTime = new Date().getTime()
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME)
    let startFetchSheetTime = new Date().getTime()
    const data = sheet.getDataRange().getValues()
    const headers = data[0] // Fetch the headers
    let startFindTime = new Date().getTime()
    const resultString = data.find(row => row[EMAIL_ROW] === email) // Assuming details are in the 5th column\
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
