# SAP and Commissary Status

A Google Apps Script web application that provides a simple interface to search and display SAP and Commissary status information for users based on their email address.

## Overview

This project is a Google Apps Script web application that reads data from a Google Sheets spreadsheet and presents it through a clean, user-friendly web interface. Users can search for their status information by entering their email address, and the application retrieves and displays relevant details from the spreadsheet.

## Features

- **Email-based Search**: Search for user status information using Babalooey email addresses
- **Google Sheets Integration**: Reads data directly from a configured Google Sheets spreadsheet
- **Responsive Web Interface**: Clean, dark-themed UI with loading indicators
- **Real-time Updates**: Displays last update timestamp for data freshness
- **Secure API Endpoint**: POST endpoint to update the last process timestamp with secret key authentication

## Prerequisites

Before deploying this application, you need:

- A Google account with access to Google Apps Script
- [Node.js](https://nodejs.org/) (for development and deployment)
- [clasp](https://github.com/google/clasp) - Google Apps Script CLI tool
- A Google Sheets spreadsheet with the appropriate data structure

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jsonpoindexter/gpe-sap-and-commissary-status.git
   cd gpe-sap-and-commissary-status
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure clasp**
   - Login to clasp (if not already logged in):
     ```bash
     npx clasp login
     ```
   - Update `.clasp.json` with your script ID and root directory

4. **Set up Google Sheets**
   - Create or configure a Google Sheets spreadsheet
   - Update the `SHEET_ID` constant in `app.ts` with your spreadsheet ID
   - Ensure the sheet has the required columns and structure

## Configuration

### App Configuration (`app.ts`)

Update these constants to match your setup:

```typescript
const SHEET_ID = 'your-spreadsheet-id';
const SHEET_NAME = 'Dashboard';
const EMAIL_ROW = 4; // Column index for email
const RESULT_COLUMNS = [4, 15, 19, 20, 21]; // Columns to display
```

### OAuth Scopes

The application requires the following Google OAuth scopes (configured in `appsscript.json`):
- `https://www.googleapis.com/auth/spreadsheets.readonly`
- `https://www.googleapis.com/auth/spreadsheets`

### Script Properties

The application uses Script Properties to store:
- `secretKey`: Secret key for authenticating POST requests
- `postProcessLastUpdate`: Timestamp of the last data update

Set these properties in your Google Apps Script project:
1. Open the script in the Apps Script editor
2. Go to Project Settings → Script Properties
3. Add the required properties

## Deployment

Deploy the application using clasp:

```bash
# Push code to Google Apps Script
npx clasp push

# Deploy as a web app
npx clasp deploy
```

After deployment:
1. Open the script in the Apps Script editor: `npx clasp open`
2. Deploy → New deployment
3. Select type: Web app
4. Configure access settings as needed
5. Deploy and copy the web app URL

## Usage

### Web Interface

1. Navigate to the deployed web app URL
2. Enter a Babalooey email address in the search field
3. Click "Search" to retrieve user status information
4. View the displayed results including SAP and commissary status details

### API Endpoint

The application provides a POST endpoint to update the last process timestamp:

```bash
curl -X POST [your-web-app-url] \
  -H "Content-Type: application/json" \
  -d '{"secretKey": "your-secret-key", "postProcessLastUpdate": "2024-01-01T12:00:00Z"}'
```

## Data Structure

The Google Sheets spreadsheet should have:
- Row 1: Headers
- Column at index `EMAIL_ROW`: User email addresses
- Columns at indices specified in `RESULT_COLUMNS`: Status information to display

## Development

### Code Style

The project uses:
- **TypeScript** for type-safe code
- **Prettier** for code formatting
- **ESLint** for linting

### Development Workflow

1. Make changes to `app.ts` or `index.html`
2. Format code: `npx prettier --write .`
3. Push to Apps Script: `npx clasp push`
4. Test in the Apps Script editor or web app

### Project Structure

```
.
├── app.ts              # Main TypeScript application logic
├── index.html          # Web interface HTML/CSS/JavaScript
├── appsscript.json     # Apps Script manifest
├── package.json        # Node.js dependencies
├── tsconfig.json       # TypeScript configuration
├── .clasp.json         # Clasp configuration
├── .prettierrc.json    # Prettier configuration
└── .gitignore          # Git ignore rules
```

## Technologies Used

- **Google Apps Script**: Server-side runtime environment
- **TypeScript**: Type-safe JavaScript development
- **HTML/CSS/JavaScript**: Web interface
- **Google Sheets API**: Data source
- **clasp**: Google Apps Script CLI tool

## License

ISC

## Author

Jason Poindexter
