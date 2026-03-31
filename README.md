# MCGI DRRT Bohol - Attendance Monitoring System

## Step-by-Step Installation Guide

### Step 1: Download the Files
1. Download the `mcgi_drrt_attendance_system.zip` file
2. Extract the ZIP file to a folder on your computer (e.g., `C:\MCGI_DRRT` on Windows or `/home/yourname/MCGI_DRRT` on Linux/Mac)

### Step 2: What's Inside the Folder
After extracting, you should see these files:
```
mcgi_drrt_web/
├── index.html      (Main application file)
├── app.js          (JavaScript logic)
├── logo.png        (MCGI DRRT logo)
├── database.sql    (SQL database structure)
├── import_data.py  (Python import script)
└── README.md       (This file)
```

### Step 3: How to Run the Application

#### Method A: Double-Click (Easiest)
1. Open the `mcgi_drrt_web` folder
2. Double-click on `index.html`
3. The application will open in your default web browser (Chrome, Firefox, Edge, etc.)

#### Method B: Using a Local Server (Recommended for Best Performance)

**For Windows:**
1. Open Command Prompt (press Win+R, type `cmd`, press Enter)
2. Navigate to the folder:
   ```
   cd C:\MCGI_DRRT\mcgi_drrt_web
   ```
3. Start a local server using Python (if installed):
   ```
   python -m http.server 8080
   ```
4. Open your browser and go to: `http://localhost:8080`

**For Mac/Linux:**
1. Open Terminal
2. Navigate to the folder:
   ```
   cd ~/MCGI_DRRT/mcgi_drrt_web
   ```
3. Start a local server:
   ```
   python3 -m http.server 8080
   ```
4. Open your browser and go to: `http://localhost:8080`

### Step 4: First-Time Setup
1. When you first open the application, you'll see a "Create Admin Account" screen
2. Enter your:
   - Name (e.g., "DRRT Admin")
   - Email (e.g., "admin@mcgi.org")
   - Password (choose a secure password)
3. Click "Create Account"
4. Login with your new credentials

### Step 5: Adding Members
1. Click "Members" in the sidebar
2. Click "Add New Member" button
3. Fill in the member details:
   - **Name** (required)
   - **Church ID** (required, unique identifier)
   - **Local** (required, their home locale)
   - **Age**
   - **Date of Birth**
   - **Date of Baptism**
   - **Phone Number**
   - **Skills** (e.g., First Aid, Driving)
   - **Vehicle** (e.g., Motorcycle, Car)
   - **Photo** (optional)
4. Click "Save Member"

### Step 6: Creating a Gathering
1. Click "Gatherings" in the sidebar
2. Click "Create New Gathering"
3. Enter:
   - **Title** (e.g., "Sunday Prayer Meeting")
   - **Date**
   - **Batch** (optional)
   - **Local/Event Location** (optional)
4. Click "Create Gathering"
5. You'll be taken to the attendance page automatically

### Step 7: Recording Attendance
1. For each gathering, you can:
   - Check/uncheck members who are on duty
   - Set their **Time In** (when they started duty)
   - Set their **Time Out** (when they finished duty)
   - Set their **Duty Local** (if different from their origin)
   - Set **Condition** (Normal or Not Normal)
   - Add **Reason** if condition is Not Normal
   - Set **Weather** condition
2. Use "Mark All On Duty" or "Mark All Off" for quick selection
3. Click "Save Attendance" when done

### Step 8: Exporting to Excel
1. Go to "Gatherings" and find the gathering you want to export
2. Click the Excel icon (green spreadsheet icon)
3. An Excel file will be downloaded with:
   - All members grouped by local
   - Color coding (green for on duty, red for not on duty, yellow for not normal)
   - Complete attendance details

---

## Features

### Member Management
- Add, edit, delete members
- Store: Name, Church ID, Local, Age, DOB, Baptism Date, Phone, Skills, Vehicle, Photo
- View member profiles with duty history

### Gathering Management
- Create gatherings with title, date, batch, venue, weather
- Automatic status tracking (Inactive, On-Off, Active, Active Confirmed)
- All members are automatically added to new gatherings

### Attendance Tracking
- Mark members on/off duty
- Record time in and time out
- Track duty location (if different from origin)
- Condition tracking (Normal/Not Normal with reason)
- Weather condition at duty area

### Duty Status Calculation
- **Inactive**: No duty in the last 3 weeks
- **On-Off**: 1-2 duties in the last 3 weeks
- **Active**: Consistent duty participation
- **Active (Confirmed)**: 5 consecutive duties

### Export Features
- Export to Excel with colors
- Grouped by local
- Complete attendance details
- Summary statistics

---

## Troubleshooting

### Application not opening?
- Make sure you're using a modern browser (Chrome, Firefox, Edge, Safari)
- Try right-clicking `index.html` and selecting "Open with" > choose your browser

### Data not saving?
- The application uses localStorage (browser storage)
- Make sure you're not in private/incognito mode
- Check if cookies/storage are enabled in your browser

### Lost admin password?
- Open browser Developer Tools (F12)
- Go to Console tab
- Type: `localStorage.clear()`
- Press Enter
- Refresh the page
- You'll need to create a new admin account

### How to backup data?
- Open browser Developer Tools (F12)
- Go to Console tab
- Type: `console.log(localStorage.getItem('members'))`
- Copy the output and save to a text file
- Do the same for 'gatherings' and 'admin'

### How to restore data?
- Open browser Developer Tools (F12)
- Go to Console tab
- Type: `localStorage.setItem('members', '[paste your data here]')`
- Do the same for 'gatherings' and 'admin'
- Refresh the page

---

## System Requirements
- Any modern web browser (Chrome 80+, Firefox 75+, Edge 80+, Safari 13+)
- JavaScript must be enabled
- No internet connection required (works offline after first load)
- No server required (runs entirely in browser)

---

## Support
For questions or issues, contact your DRRT Administrator.

**MCGI DRRT Bohol Province**
Disaster Response & Rescue Team
Riders' Assistance & Community Services