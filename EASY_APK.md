# ⚡ EASIEST APK METHOD - Just Copy & Paste!

## Step 1: Download These (5 minutes)
- **Java**: https://www.oracle.com/java/technologies/downloads/ → Download Java 17
- **Android Studio**: https://developer.android.com/studio → Download & Install

## Step 2: Open PowerShell in Your Project Folder
Right-click in `c:\Users\salma\Documents\Raza Traders App` → Open in Terminal

## Step 3: Copy & Paste These 5 Commands (One at a time)

### Command 1 - Install Capacitor
```
npm install @capacitor/core @capacitor/cli
```

### Command 2 - Build Frontend
```
npm run build
```
*(Wait for this to finish - takes 2-3 minutes)*

### Command 3 - Initialize Capacitor
```
npx cap init --web-dir build
```
When it asks:
- **App name:** Raza Traders
- **App ID:** com.razatraders.app

### Command 4 - Add Android
```
npm install @capacitor/android && npx cap add android && npx cap sync android
```

### Command 5 - Open Android Studio & Build
```
npx cap open android
```

## Step 4: In Android Studio (the GUI app that opened)

1. Wait for it to load (takes 1-2 minutes)
2. At the top: Click **Build** → **Build Bundles(s) / APK(s)** → **Build APK(s)**
3. Wait for "BUILD SUCCESSFUL" message (2-3 minutes)
4. Find your APK file at: `frontend/android/app/release/app-release.apk`

## Done! 🎉
Your APK is ready to install on any Android phone!

### To Install on Phone:
1. Connect Android phone via USB cable
2. Enable USB Debugging on phone (Settings → Developer Options)
3. In Android Studio: Click **Run** button
4. Select your phone → Click OK
5. App installs automatically!

---

## ⚠️ IMPORTANT - First Time ONLY:
After **Command 1**, you need to set these environment variables (Windows):

1. Search Windows for: **Environment Variables**
2. Click **Edit the system environment variables**
3. Click **Environment Variables** button
4. Click **New** → Add this:
   - **Variable name:** JAVA_HOME
   - **Variable value:** `C:\Program Files\Java\jdk-17.0.x` (or wherever you installed Java)
5. Click **New** → Add this:
   - **Variable name:** ANDROID_HOME
   - **Variable value:** `C:\Users\salma\AppData\Local\Android\Sdk`
6. Click OK → Close everything
7. **Restart PowerShell** (close and reopen)

Then continue with Commands 2-5.

---

## Troubleshooting:

**"npm: command not found"**
→ Install Node.js from nodejs.org first

**"java: command not found"**
→ Set JAVA_HOME environment variable (see above)

**"BUILD FAILED"**
→ Android Studio GUI will show error at bottom
→ Most common: JAVA_HOME not set correctly

**APK file not found**
→ Check: `frontend/android/app/release/` folder
→ If not there, check Android Studio for errors

---

## Size & First Run:
- **APK size:** 10-15 MB
- **Installation:** ~30 seconds
- **First launch:** ~5 seconds
- **All features:** Work perfectly offline! ✅

That's it! You now have a mobile app! 🚀
