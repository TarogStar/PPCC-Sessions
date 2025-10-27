# Power Platform Conference Session Browser

An interactive web application to browse, filter, and track Power Platform Conference sessions. This app helps you identify overlapping sessions, highlight Microsoft speakers, and mark sessions of interest.

## Features

- **Session Browsing**: View all conference sessions organized by date and time
- **Microsoft Highlight**: Automatically highlights sessions with Microsoft speakers
- **Overlap Detection**: Identifies and displays sessions that overlap in time
- **Interest Tracking**: Mark sessions you're interested in (saved in browser)
- **Advanced Filtering**: Filter by Microsoft sessions, overlaps, interested sessions, and date
- **Search**: Search across titles, descriptions, and speaker names
- **Expandable Details**: Click any session to see full description, speaker bios, and locations
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Quick Start

### Option 1: Test Locally

1. Open a terminal in the `c:\temp\conference` directory
2. Start a simple local web server:

   **Using Python:**
   ```bash
   python -m http.server 8000
   ```

   **Using Node.js (if you have it installed):**
   ```bash
   npx serve
   ```

3. Open your browser and navigate to `http://localhost:8000`

### Option 2: Just Open the File

You can also simply open [index.html](index.html) directly in your browser by double-clicking it. However, some browsers may block loading the JSON file due to CORS restrictions. If you see a loading error, use Option 1 or Option 3 instead.

## Deploying to Azure Static Web Apps

Follow these steps to deploy the app to Azure so your coworkers can access it:

### Prerequisites

- An Azure account (create a free one at https://azure.microsoft.com/free/)
- Azure CLI installed (optional, or use Azure Portal)

### Deployment Steps

#### Method 1: Using Azure Portal (Easiest)

1. **Create a Static Web App**:
   - Go to the [Azure Portal](https://portal.azure.com)
   - Click "Create a resource"
   - Search for "Static Web App" and select it
   - Click "Create"

2. **Configure the Static Web App**:
   - **Subscription**: Select your Azure subscription
   - **Resource Group**: Create new or select existing
   - **Name**: Choose a unique name (e.g., `powerplatform-sessions`)
   - **Plan type**: Select "Free"
   - **Region**: Choose closest to you
   - **Deployment details**: Select "Other" (we'll upload manually)
   - Click "Review + Create", then "Create"

3. **Upload Your Files**:
   - After deployment completes, go to your Static Web App resource
   - In the left menu, click "Overview"
   - Copy the deployment token
   - Use the Azure CLI or GitHub to deploy:

   **Using Azure Static Web Apps CLI:**
   ```bash
   npm install -g @azure/static-web-apps-cli
   cd c:\temp\conference
   swa deploy . --deployment-token <YOUR_DEPLOYMENT_TOKEN> --no-use-keychain --env production
   ```

   If the deployment seems to hang, try:
   ```bash
   swa deploy . --deployment-token <YOUR_DEPLOYMENT_TOKEN> --env production --verbose
   ```

   Note: This is a static-only site with no API, so the default API settings can be ignored.

   **Alternative: Manual Upload via Azure Portal:**
   If the CLI isn't working, you can also:
   1. Create a ZIP file of all your files (index.html, app.js, styles.css, sessions.json)
   2. Use the Azure Portal's deployment center to upload the ZIP
   3. Or use GitHub (see Method 2 below)

4. **Access Your App**:
   - In the Azure Portal, go to your Static Web App
   - Copy the URL shown in the overview (e.g., `https://your-app-name.azurestaticapps.net`)
   - Share this URL with your coworkers!

#### Method 2: Using GitHub (Recommended for Teams)

1. **Create a GitHub Repository**:
   ```bash
   cd c:\temp\conference
   git init
   git add .
   git commit -m "Initial commit"
   gh repo create powerplatform-sessions --public --source=. --remote=origin --push
   ```

2. **Create Static Web App with GitHub Integration**:
   - Go to [Azure Portal](https://portal.azure.com)
   - Create a new Static Web App (as above)
   - For **Deployment details**: Select "GitHub"
   - Sign in to GitHub and authorize Azure
   - Select your repository
   - Build Presets: Select "Custom"
   - App location: `/`
   - Api location: (leave blank)
   - Output location: (leave blank)
   - Click "Review + Create"

3. **Automatic Deployment**:
   - Azure will create a GitHub Action workflow
   - Your app will automatically deploy
   - Future changes pushed to GitHub will auto-deploy

4. **Share the URL**:
   - Copy the URL from Azure Portal
   - Share with your team!

### Custom Domain (Optional)

If you want a custom domain like `sessions.yourcompany.com`:

1. In Azure Portal, go to your Static Web App
2. Click "Custom domains" in the left menu
3. Click "Add"
4. Follow the instructions to verify your domain
5. Azure will provide a CNAME record to add to your DNS

## Using the App

### Filters

- **Show only Microsoft sessions**: Toggle to see only sessions with Microsoft speakers
- **Show only overlapping sessions**: Toggle to see sessions that have time conflicts
- **Show only sessions I'm interested in**: Toggle to see your marked sessions
- **Date filter**: Dropdown to filter by specific conference dates
- **Search box**: Type to search across titles, descriptions, and speaker names

### Features

- **Star icon (☆/★)**: Click to mark/unmark a session as interesting
  - Your interests are saved in your browser
  - Each team member will have their own list
- **Expand arrow (▼/▲)**: Click anywhere on a card to see full details
- **Microsoft badge**: Sessions with Microsoft speakers
- **Overlap badge**: Shows how many sessions conflict with this one
- **Speaker details**: Expandable view shows photos, titles, affiliations, and locations

### Tips for Team Use

1. **Share Sessions**: Send specific session titles to your team
2. **Coordinate Attendance**: Compare which sessions you're each interested in
3. **Resolve Conflicts**: Use the overlap detection to plan which sessions to attend together
4. **Focus on Microsoft**: If you want Microsoft-only content, use the filter

## Files

- `index.html` - Main HTML structure
- `app.js` - Application logic and filtering
- `styles.css` - Styling and responsive design
- `sessions.json` - Conference session data
- `README.md` - This file

## Browser Support

- Chrome (recommended)
- Edge
- Firefox
- Safari

## Privacy

All session interests are stored locally in your browser using localStorage. No data is sent to any server.

## Troubleshooting

**Problem**: Sessions won't load locally
- **Solution**: Use a local web server (see Quick Start Option 1)

**Problem**: Can't see the Azure deployment token
- **Solution**: In Azure Portal, go to your Static Web App > Settings > API keys

**Problem**: GitHub Action failing
- **Solution**: Check the workflow file created by Azure - it should be in `.github/workflows/`

## Updates

To update the session data:
1. Replace `sessions.json` with the new file
2. If using GitHub: Commit and push the changes
3. If using manual deployment: Re-upload the files to Azure

## Support

For issues or questions about the app, contact your IT team or the app creator.

## License

This is an internal tool for conference planning. Not for redistribution.
