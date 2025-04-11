# Hosting the APK

## Using GitHub Releases (Recommended)

GitHub Releases is the most professional way to host your APK. It keeps the file associated with your repository but doesn't count against repository size limits.

1. From your GitHub repository page, click on "Releases" in the right sidebar
2. Click "Create a new release"
3. Fill in the details:
   - Tag version: v0.1
   - Release title: GreenTech E-Waste App v0.1
   - Description: Include key features and test account info
4. Drag and drop the APK file to the "Attach binaries" section
5. Click "Publish release"

After publishing, the APK will be available at:
```
https://github.com/YOUR_USERNAME/SEG_Group1_Frontend/releases/download/v0.1/GreenTech-v0.1.apk
```

## Using Google Drive

1. Upload the APK to Google Drive
2. Right-click the file and select "Share"
3. Change permissions to "Anyone with the link can view"
4. Click "Copy link"
5. Use this link in your README

For a direct download link that doesn't require Google Drive approval screen:
```
https://drive.google.com/uc?export=download&id=YOUR_FILE_ID
```
(Replace YOUR_FILE_ID with the ID from your Google Drive link)

## Using Dropbox

1. Upload the APK to Dropbox
2. Create a shared link
3. Change the end of the URL from `?dl=0` to `?dl=1` to make it a direct download link
4. Use this link in your README

## Remember to Update README Links

After hosting your APK, be sure to update the download links in:
1. `releases/README.md`
2. Main `README.md` 