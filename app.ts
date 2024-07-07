const SHEET_ID = '1z7vKyVMcpmJJsMXODARWSg-yM5FmA7NbYuySTn_AU0M'
const SHEET_NAME = 'Dashboard'
const EMAIL_ROW = 4

function doGet() {
    const template = HtmlService.createTemplateFromFile('index')
    template.data = null
    return template
        .evaluate()
        .setTitle('User Details Fetcher')
        .setSandboxMode(HtmlService.SandboxMode.IFRAME)
}

function getUserDetails(email: string) {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME)
    const data = sheet.getDataRange().getValues()
    const result = data.find(row => row[EMAIL_ROW] === email) // Assuming details are in the 5th column\
    Logger.log(`[getUserDetails] results: ${result}`)
    if (result) {
        return JSON.stringify(result) // Return the first matching row
    }
    return JSON.stringify(null) // Return null if no match is found
}

function processForm(formObject: { searchString: string }) {
    const template = HtmlService.createTemplateFromFile('index')
    template.data = getUserDetails(formObject.searchString)
    return template.evaluate().getContent()
}
