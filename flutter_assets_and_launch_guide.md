# TIMELINE: Ultimate App Icon & Splash Screen Assets Guide

This guide details the precise configurations and tools required to generate high-fidelity, adaptive launchers and native splash screens for the Flutter version of **TIMELINE: Mind Battle**.

---

## 🎨 Asset Guidelines

To preserve the elite, high-contrast, eye-safe design system of TIMELINE, we recommend the following parameters for production assets:

*   **Primary Dark Palette (Obsidian):** `#0D1117` (Deepest Charcoal Dark Canvas)
*   **Accent Brand Color:** `#58A6FF` (Vibrant Cyber Blue)
*   **Secondary Indicator Color:** `#3FB950` (Tactical Green)
*   **Display Typography:** Inter / Space Grotesk
*   **Safe Margins:** Always keep safe zones of at least 40% margin on adaptive launchers to prevent unwanted clipping on Google Pixel or Samsung OneUI devices.

---

## 📱 PART 1: App Launch Icons

We use the industry-standard `flutter_launcher_icons` dependency. This generates correct multi-resolution directories for:
*   **Android:** Adaptive XML vectors, round / square fallback shapes, notification bar variants.
*   **iOS:** Full universal app icon sheets for iPad, iPhone, and Spotlight searches.

### 1. Configure `pubspec.yaml`
Add this section to the bottom of your `pubspec.yaml` file:

```yaml
dev_dependencies:
  flutter_launcher_icons: ^0.13.1

flutter_launcher_icons:
  android: "launcher_icon"
  ios: true
  
  # Crucial for Android 8.5+ Adaptive Launchers
  adaptive_icon_background: "#0D1117"
  adaptive_icon_foreground: "assets/icons/app_icon_foreground.png"
  
  # Fallback image parameter for legacy Android OS & iOS
  image_path: "assets/icons/app_icon_fallback.png"
  
  # Apple Web Manifest configuration
  web:
    generate: true
    image_path: "assets/icons/app_icon_fallback.png"
    background_color: "#0D1117"
    theme_color: "#0D1117"
```

### 2. Prepare the Canvas Dimensions
*   **Foreground (`app_icon_foreground.png`):** Create a 512x512 PNG with a transparent background. Center the sharp serif or mono **T** logo within the middle 288x288 safe viewport.
*   **Fallback Icon (`app_icon_fallback.png`):** Create a 1024x1024 flat PNG with `#0D1117` as the hard background and the logo centered inside.

### 3. Generate Launch Assets
Run this terminal chain in your native project root:
```bash
flutter pub get
flutter pub run flutter_launcher_icons:main
```

---

## 🌅 PART 2: Native Splash Screen

Prevent white flashing during cold app boot on Android and iOS using `flutter_native_splash`.

### 1. Configure `pubspec.yaml`
Add this structure to your dependencies:

```yaml
dev_dependencies:
  flutter_native_splash: ^2.4.0

flutter_native_splash:
  color: "#0D1117"
  image: "assets/splash/splash_logo.png"
  
  # Platform Specific Hooks
  android: true
  ios: true
  web: false
  
  # Dark-Mode configuration matching OS states
  color_dark: "#0D1117"
  image_dark: "assets/splash/splash_logo.png"
  
  # Immersive full-screen (hides notification tray during boot)
  fullscreen: true
  
  # Keeps launcher on splash for Android 12+ compatibility
  android_12:
    image: "assets/splash/splash_logo.png"
    icon_background_color: "#0D1117"
```

### 2. Generate Native Boot Files
Run the setup generator script to rewrite native directories automatically:
```bash
flutter pub get
flutter pub run flutter_native_splash:create
```

*Note: If you ever want to revert and use the default system blank screens:*
```bash
flutter pub run flutter_native_splash:remove
```

---

## 🎯 Pro Production Tips for Deployment

1.  **Android Notification Silhouette Tint:** To make the tasktray notification counter icon look incredibly premium, create a completely transparent PNG filled with pure white pixel silhouettes of your logo (`assets/icons/notification_silhouette.png`) so Android can color-tint it dynamically based on focus state.
2.  **iOS Asset Compiling:** When compiling for Apple Store Connect, ensure that the launch storyboards are refreshed in Xcode by executing `Product -> Clean Build Folder` to prevent iOS from caching your old splash assets.
3.  **Color Space Optimization:** Run all exported PNG graphics through an optimizer tool (e.g. TinyPNG or pngquant) before generating splash files to decrease core compilation sizes by up to 70%!
