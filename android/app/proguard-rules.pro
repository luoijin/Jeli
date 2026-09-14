# ==============================================================================
# Jeli Quest Journal - R8 / ProGuard Configuration
# ==============================================================================

# Preserve line numbers and source file names for crash stack traces
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# ------------------------------------------------------------------------------
# Capacitor Core & Plugin Bridges
# ------------------------------------------------------------------------------
# Prevent R8 from stripping or obfuscating Capacitor's reflection-based bridge
-keep public class com.getcapacitor.** { *; }
-keep public class * extends com.getcapacitor.Plugin { *; }
-keep public class * extends com.getcapacitor.Bridge { *; }
-keep public class * extends com.getcapacitor.BridgeActivity { *; }

# Preserve JavascriptInterface annotations and methods for WebView JS bindings
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Preserve Capacitor annotations used for runtime reflection
-keepattributes *Annotation*
-keepclassmembers class * {
    @com.getcapacitor.PluginMethod public *;
    @com.getcapacitor.annotation.CapacitorPlugin public *;
    @com.getcapacitor.annotation.Permission public *;
}

# ------------------------------------------------------------------------------
# Capacitor Plugins (@capacitor/preferences)
# ------------------------------------------------------------------------------
-keep class com.capacitorjs.plugins.** { *; }
-keep class com.capacitorjs.plugins.preferences.** { *; }

# ------------------------------------------------------------------------------
# Android WebView Clients
# ------------------------------------------------------------------------------
-keepclassmembers class * extends android.webkit.WebViewClient {
    public *;
}
-keepclassmembers class * extends android.webkit.WebChromeClient {
    public *;
}
