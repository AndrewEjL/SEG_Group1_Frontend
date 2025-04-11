# GreenTech E-Waste Management App

## Download and Installation

### Android APK

1. Download the APK from one of these hosting services:
   - [Google Drive](https://drive.google.com/file/d/YOUR_FILE_ID/view?usp=sharing) (Replace with your actual Google Drive link)
   - [Dropbox](https://www.dropbox.com/s/YOUR_FILE_PATH/GreenTech-v0.1.apk?dl=0) (Replace with your actual Dropbox link)
   - [GitHub Releases](https://github.com/YOUR_USERNAME/SEG_Group1_Frontend/releases/download/v0.1/GreenTech-v0.1.apk) (If you use GitHub Releases feature)

   [How to host the APK](./HOSTING.md) - Instructions for setting up these hosting options

2. Transfer the APK to your Android device (if downloading on a computer)
3. On your Android device, navigate to the APK file using a file manager
4. Tap the APK file to begin installation
5. You may need to allow installation from "Unknown Sources" in your device settings:
   - Go to Settings > Security > Unknown Sources (or Settings > Apps > Special access > Install unknown apps)
   - Enable installation for the file manager app you're using

### Alternative: View Demo Video

If you prefer not to install the APK, you can:
- Record a [demo video](./DEMO_VIDEO.md) of the app in action
- Share the video link with potential employers

## Test Accounts

You can use the following test accounts to explore different aspects of the application:

### Regular User
- **Email**: john@example.com
- **Password**: password

### Organization User
- **Email**: org@example.com
- **Password**: password 

## Features

- **User-side features**:
  - List electronic waste items for pickup
  - Track the status of your listed items
  - View history of previous recycling activity
  - Manage your user profile and account settings

- **Organization-side features**:
  - View available items for pickup
  - Schedule and manage pickups
  - Assign collectors to routes
  - Process and track e-waste collection

- **Collector features**:
  - View optimized pickup routes
  - Navigate between pickup locations
  - Mark pickups as complete

## Technical Information

- Built with React Native and TypeScript
- Uses React Navigation for navigation
- Incorporates OpenStreetMap and OSRM for mapping and routing
- Implements Context API for state management

## Development Notes

This is a debug build intended for demonstration purposes. In a production environment, the app would connect to actual backend services rather than using mock data. 