@echo off
echo Creating Android bundle...

mkdir -p android\app\src\main\assets

npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

echo Bundle created successfully!
echo Now you can build the release APK by running 'cd android && gradlew assembleRelease' 