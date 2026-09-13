# Capacitor Android Packaging Guide (CLI-only, no Android Studio GUI)

This produces a release `.apk` using the terminal and Gradle CLI. Android
Studio is not required — only the Android command-line tools + a JDK.

## 0. Prerequisites (one-time machine setup)

```bash
# JDK 17 (required by current Android Gradle Plugin)
sudo apt install -y openjdk-17-jdk

# Android command-line tools
mkdir -p ~/android-sdk/cmdline-tools
cd ~/android-sdk/cmdline-tools
curl -o tools.zip https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
unzip tools.zip && mv cmdline-tools latest
export ANDROID_HOME=~/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

# Accept licenses and install the platform + build tools Capacitor needs
yes | sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
```

Add the exports above to `~/.bashrc` (or `~/.zshrc`) so they persist across
terminal sessions.

## 1. Install dependencies and build the web bundle

```bash
cd jeli-app
npm install
npm run build          # outputs static bundle to ./dist
```

## 2. Add the Android platform (first time only)

```bash
npx cap add android
```

This generates the `android/` Gradle project. `capacitor.config.ts`
already sets `webDir: "dist"` and the app id `com.jeli.questjournal`, so
no manual config edits are needed.

## 3. Sync the web bundle into the native project

Run this every time you rebuild the web app:

```bash
npx cap sync android
```

## 4. Generate a signing keystore (first time only)

```bash
keytool -genkey -v \
  -keystore jeli-release.keystore \
  -alias jeli \
  -keyalg RSA -keysize 2048 -validity 10000
```

Follow the prompts (name, org, password). **Keep this keystore file and
its password safe** — you need the same one for every future update to
the same app listing.

Move the keystore into `android/app/` and reference it from
`android/app/build.gradle` (or supply signing properties via CLI flags as
shown in step 6 to avoid committing secrets).

## 5. Build the unsigned release APK via Gradle CLI

```bash
cd android
./gradlew assembleRelease
```

Output lands at:

```
android/app/build/outputs/apk/release/app-release-unsigned.apk
```

## 6. Sign and align the APK

```bash
# Sign
apksigner sign \
  --ks ../jeli-release.keystore \
  --ks-key-alias jeli \
  --out app-release-signed.apk \
  app/build/outputs/apk/release/app-release-unsigned.apk

# Verify
apksigner verify app-release-signed.apk
```

`apksigner` (bundled with Android build-tools) also zip-aligns as part of
signing in modern build-tools versions; if using an older toolchain, run
`zipalign` before signing instead:

```bash
zipalign -v 4 app-release-unsigned.apk app-release-aligned.apk
apksigner sign --ks ../jeli-release.keystore --ks-key-alias jeli \
  --out app-release-signed.apk app-release-aligned.apk
```

## 7. Install directly to a connected device for testing (optional)

```bash
adb install -r app-release-signed.apk
```

## 8. One-shot rebuild script

Save as `scripts/build-apk.sh` for repeatable releases:

```bash
#!/usr/bin/env bash
set -e
npm run build
npx cap sync android
cd android
./gradlew assembleRelease
cd app/build/outputs/apk/release
apksigner sign --ks ../../../../jeli-release.keystore --ks-key-alias jeli \
  --out app-release-signed.apk app-release-unsigned.apk
echo "Signed APK ready at: $(pwd)/app-release-signed.apk"
```

Make it executable with `chmod +x scripts/build-apk.sh`, then run
`./scripts/build-apk.sh` for every subsequent release build.
