# SAP, Eats, and Showers Status - Google Apps Script

A Google Apps Script web application that provides real-time status tracking for SAP (Self-Arranged Placement),
commissary/eats, and showers requirements for event participants.

## Features

- **User Search**: Search by Babalooey nickname to view individual status
- **SAP Status Tracking**: Pre-event and main-event shift requirements and progress with color-coded indicators
- **Commissary Status**: Eats requirements for pre-week, event week, and post-event periods
- **Showers Status**: Build week and event week shower assignments
- **Real-time Data**: Automatic cache refresh when source data is updated via webhook
- **Responsive UI**: Dark theme with loading states and comprehensive error handling

## Prerequisites

1. **Google Account** with access to Google Apps Script
2. **Google Sheets** containing the source data with proper read permissions
3. **Node.js and npm** for local development
4. **clasp CLI** for deployment: `npm install -g @google/clasp`

## Setup Instructions

### 1. Clone and Setup Local Environment

~~~bash
git clone git@github.com:jsonpoindexter/gpe-sap-and-commissary-status.git
cd gpe-sap-and-commissary-status
npm install
~~~

### 2. Configure clasp

~~~bash
# Login to Google Apps Script
clasp login

# Link to the existing project (script ID from .clasp.json)
clasp clone 1Wo2Z3P9AIEJOAfuiSRTGnWsYNx4eG283CjxUcCs5b-wDIa25lLZB0-r7
~~~

### 3. Configure Script Properties

In the Google Apps Script editor, go to **Project Settings** > **Script Properties** and add:

- `secretKey`: A secure random string for webhook authentication (required for doPost)
- `postProcessLastUpdate`: Initial timestamp for cache management (can be empty initially)

### 4. Required OAuth Permissions

The script requires these OAuth scopes (defined in `appsscript.json`):

- `https://www.googleapis.com/auth/spreadsheets.readonly` - Read Google Sheets data
- `https://www.googleapis.com/auth/spreadsheets` - Full sheets access for caching operations
- `https://www.googleapis.com/auth/script.scriptapp` - Trigger management for background cache updates

**Important**: After initial setup, you may need to authorize the script to apply these permissions by clicking the *
*Run** button in the Apps Script editor.

### 5. Configure Source Data

Update `constants.ts` with your Google Sheets configuration:

- `SPREADSHEET_ID`: Your source spreadsheet ID
- Sheet configurations for DASHBOARD, SAP, and EATS tabs
- Column mappings for nickname and data columns

### 6. Deploy the Application

**NOTE:** For the first deployment, you must manually deploy a web app in the Apps Script editor:

1. Go to the Apps Script editor: clasp open
2. Click Deploy > New Deployment
3. Choose Web app as the type
4. Set Execute as: Me
5. Set Who has access: Anyone
6. Click Deploy

Then you can either use `clasp` to push updates or continue using the Apps Script editor for further deployments.
**NOTE**: Subsequent deployments using the `clasp` command and the same description will change the deployment to a
Library and not a Web App. This will not happen if you use a different description each time.

~~~bash
# Push code to Google Apps Script
clasp push # use --project  to specify project ie: `--project .clasp.jasons-test.json` for Test environment

# Deploy as web app
clasp deployclasp deploy --deploymentId <deployment-id> --description "Prod"
~~~

**Web App Configuration**:

- Execute as: **Me** (the deploying user)
- Access: **Anyone** (current setting in `.clasp.json`)

### 7. Configure Webhook for Cache Updates (Optional)

For automatic cache updates when source data changes, set up a webhook to call the `doPost` endpoint:

~~~bash
curl -X POST <your-web-app-url> \
  -H "Content-Type: application/json" \
  -d '{
    "secretKey": "<your-secret-key>",
    "postProcessLastUpdate": "<timestamp>"
  }'
~~~

## How It Works

### Architecture Overview

1. **Frontend (`index.html`)**: Single-page web application with search interface and dark theme
2. **Backend (`app.ts`)**: Main entry points for web requests and cache management
3. **Data Access (`dao.ts`)**: Search functionality and data aggregation
4. **Data Loading (`loaders.ts`)**: Sheet data loading with snapshot creation
5. **Configuration (`constants.ts`)**: Sheet mappings and column definitions

### Data Flow

1. **User searches** by nickname through the web interface
2. **`onSearch()`** function in `dao.ts` processes the request
3. **Smart cache system** checks for fresh data or rebuilds from Google Sheets
4. **Data aggregation** combines dashboard, SAP, and eats information from multiple sheets
5. **Response formatting** returns structured JSON data to frontend
6. **UI rendering** displays status tables with color-coded progress indicators

### Caching System

- **Smart caching**: Only rebuilds when source data timestamp changes via `postProcessLastUpdate`
- **Background refresh**: Webhook triggers `doPost` which schedules `hydrateAllCaches()` asynchronously
- **Lock mechanism**: Uses `LockService` to prevent concurrent cache operations
- **Property storage**: Uses script properties for cache keys and timestamps
- **Snapshot format**: Stores normalized data with headers and nickname-indexed rows

### Status Color Indicators

- **Green**: Requirements met (100% progress or TRUE values)
- **Yellow**: Partial progress (50%+ for numeric requirements)
- **Red**: Requirements not met or incomplete

### Key Functions

- **`doGet()`**: Serves the main HTML interface
- **`doPost()`**: Webhook endpoint for cache invalidation
- **`onSearch(nickname)`**: Main search function returning aggregated user data
- **`hydrateAllCaches()`**: Background function to rebuild all data snapshots
- **`buildSnapshot()`**: Creates normalized data snapshot from Google Sheets

## File Structure

~~~
├── app.ts              # Main entry points (doGet, doPost, hydrateAllCaches)
├── dao.ts              # Data access and search functionality
├── loaders.ts          # Sheet data loading and snapshot creation
├── constants.ts        # Configuration and sheet mappings
├── cache.ts            # Caching utilities (referenced but not shown)
├── utils.ts            # Helper functions (referenced but not shown)
├── index.html          # Frontend web application with embedded CSS/JS
├── appsscript.json     # Apps Script configuration and OAuth scopes
├── .clasp.json         # clasp deployment configuration
└── package.json        # Node.js dependencies for development
~~~

