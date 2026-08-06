const {
  AndroidConfig,
  withAndroidManifest,
  withDangerousMod,
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const WIDGET_RECEIVER = '.HoraWidgetReceiver';

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeIfMissing(filePath, contents) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, contents);
  }
}

function withAndroidHoraWidget(config) {
  config = withAndroidManifest(config, (modConfig) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(
      modConfig.modResults,
    );
    const receiver = {
      $: {
        'android:name': WIDGET_RECEIVER,
        'android:exported': 'true',
        'android:label': 'Horashtak',
      },
      'intent-filter': [
        {
          action: [
            {
              $: {
                'android:name': 'android.appwidget.action.APPWIDGET_UPDATE',
              },
            },
          ],
        },
      ],
      'meta-data': [
        {
          $: {
            'android:name': 'android.appwidget.provider',
            'android:resource': '@xml/hora_widget_info',
          },
        },
      ],
    };

    mainApplication.receiver = mainApplication.receiver ?? [];

    const hasReceiver = mainApplication.receiver.some(
      (item) => item.$?.['android:name'] === WIDGET_RECEIVER,
    );

    if (!hasReceiver) {
      mainApplication.receiver.push(receiver);
    }

    return modConfig;
  });

  return withDangerousMod(config, [
    'android',
    async (modConfig) => {
      const projectRoot = modConfig.modRequest.platformProjectRoot;
      const resDir = path.join(projectRoot, 'app', 'src', 'main', 'res');
      const xmlDir = path.join(resDir, 'xml');
      const layoutDir = path.join(resDir, 'layout');
      const valuesDir = path.join(resDir, 'values');
      const drawableDir = path.join(resDir, 'drawable');

      ensureDir(xmlDir);
      ensureDir(layoutDir);
      ensureDir(valuesDir);
      ensureDir(drawableDir);

      writeIfMissing(
        path.join(xmlDir, 'hora_widget_info.xml'),
        `<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="90dp"
    android:minHeight="90dp"
    android:targetCellWidth="2"
    android:targetCellHeight="2"
    android:updatePeriodMillis="1800000"
    android:initialLayout="@layout/hora_widget"
    android:resizeMode="horizontal|vertical"
    android:widgetCategory="home_screen" />
`,
      );

      writeIfMissing(
        path.join(layoutDir, 'hora_widget.xml'),
        `<?xml version="1.0" encoding="utf-8"?>
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/hora_widget_root"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@drawable/hora_widget_background"
    android:clickable="true"
    android:focusable="true">

    <!-- Background Icon on the right side -->
    <TextView
        android:id="@+id/hora_widget_background_icon"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:text="@string/hora_widget_icon_placeholder"
        android:textSize="80sp"
        android:textColor="#2A2119"
        android:alpha="0.15"
        android:gravity="end|center_vertical"
        android:paddingEnd="8dp"
        android:fontFamily="sans-serif"
        android:clickable="false"
        android:focusable="false" />

    <!-- Main content -->
    <LinearLayout
        android:id="@+id/hora_widget_content"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:orientation="vertical"
        android:gravity="center_vertical"
        android:padding="12dp"
        android:clickable="false"
        android:focusable="false">

        <TextView
            android:id="@+id/hora_widget_title"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:text="@string/hora_widget_title"
            android:textColor="#2A2119"
            android:textSize="11sp"
            android:textStyle="bold"
            android:clickable="false"
            android:focusable="false" />

        <TextView
            android:id="@+id/hora_widget_hora"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="2dp"
            android:text="@string/hora_widget_placeholder"
            android:textColor="#2A2119"
            android:textSize="28sp"
            android:textStyle="bold"
            android:clickable="false"
            android:focusable="false" />

        <TextView
            android:id="@+id/hora_widget_time"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="2dp"
            android:text="@string/hora_widget_time_placeholder"
            android:textColor="#806C55"
            android:textSize="11sp"
            android:clickable="false"
            android:focusable="false" />
    </LinearLayout>
</FrameLayout>
`,
      );

      writeIfMissing(
        path.join(drawableDir, 'hora_widget_background.xml'),
        `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <solid android:color="#FFF8EA" />
    <corners android:radius="20dp" />
</shape>
`,
      );

      const stringsPath = path.join(valuesDir, 'strings.xml');
      if (fs.existsSync(stringsPath)) {
        const strings = fs.readFileSync(stringsPath, 'utf8');
        let nextStrings = strings;

        if (!strings.includes('name="hora_widget_title"')) {
          nextStrings = nextStrings.replace(
            '</resources>',
            '    <string name="hora_widget_title">Current Hora</string>\n</resources>',
          );
        }

        if (!nextStrings.includes('name="hora_widget_placeholder"')) {
          nextStrings = nextStrings.replace(
            '</resources>',
            '    <string name="hora_widget_placeholder">Horashtak</string>\n</resources>',
          );
        }

        if (!nextStrings.includes('name="hora_widget_time_placeholder"')) {
          nextStrings = nextStrings.replace(
            '</resources>',
            '    <string name="hora_widget_time_placeholder">Open app to update</string>\n</resources>',
          );
        }

        if (!nextStrings.includes('name="hora_widget_icon_placeholder"')) {
          nextStrings = nextStrings.replace(
            '</resources>',
            '    <string name="hora_widget_icon_placeholder">☉</string>\n</resources>',
          );
        }

        fs.writeFileSync(stringsPath, nextStrings);
      }

      // Add Native Widget implementation (Kotlin / Java)
      const packageName = config.android?.package || 'com.venomhare.horashtak';
      const packagePath = packageName.replace(/\./g, '/');
      const javaDir = path.join(projectRoot, 'app', 'src', 'main', 'java', packagePath);
      ensureDir(javaDir);

      // Write HoraWidgetReceiver.kt
      const receiverContent = `package ${packageName}

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.widget.RemoteViews
import ${packageName}.R
import android.os.Build

class HoraWidgetReceiver : AppWidgetProvider() {
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        val prefs = context.getSharedPreferences("hora_widget_prefs", Context.MODE_PRIVATE)
        val title = prefs.getString("title", "Current Hora")
        val grahaName = prefs.getString("graha_name", "Horashtak")
        val grahaSymbol = prefs.getString("graha_symbol", "")
        val timeRange = prefs.getString("time_range", "Open app to update")
        val highlighted = prefs.getBoolean("highlighted", false)
        val backgroundIcon = prefs.getString("background_icon", "☉")
        val isDarkTheme = prefs.getBoolean("is_dark_theme", false)

        for (appWidgetId in appWidgetIds) {
            val views = RemoteViews(context.packageName, R.layout.hora_widget)
            
            views.setTextViewText(R.id.hora_widget_title, title)
            views.setTextViewText(R.id.hora_widget_background_icon, backgroundIcon)
            
            val displayHora = if (!grahaSymbol.isNullOrEmpty()) "$grahaSymbol $grahaName" else grahaName
            views.setTextViewText(R.id.hora_widget_hora, displayHora)
            views.setTextViewText(R.id.hora_widget_time, timeRange)

            // Theme-aware colors
            if (isDarkTheme) {
                views.setTextColor(R.id.hora_widget_title, Color.parseColor("#FFF8EA"))
                views.setTextColor(R.id.hora_widget_hora, Color.parseColor("#FFF8EA"))
                views.setTextColor(R.id.hora_widget_time, Color.parseColor("#806C55"))
                views.setTextColor(R.id.hora_widget_background_icon, Color.parseColor("#FFF8EA"))
                views.setInt(R.id.hora_widget_background_icon, "setAlpha", 25) // 0.15 * 255 ≈ 38
            } else {
                views.setTextColor(R.id.hora_widget_title, Color.parseColor("#2A2119"))
                views.setTextColor(R.id.hora_widget_hora, Color.parseColor("#2A2119"))
                views.setTextColor(R.id.hora_widget_time, Color.parseColor("#806C55"))
                views.setTextColor(R.id.hora_widget_background_icon, Color.parseColor("#2A2119"))
                views.setInt(R.id.hora_widget_background_icon, "setAlpha", 38) // 0.15 * 255 ≈ 38
            }

            if (highlighted) {
                views.setTextColor(R.id.hora_widget_time, Color.parseColor("#F0A51A"))
            }

            // Create click intent to open app
            val intent = context.packageManager.getLaunchIntentForPackage(context.packageName)
            val pendingIntent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                PendingIntent.getActivity(
                    context,
                    0,
                    intent,
                    PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
                )
            } else {
                PendingIntent.getActivity(
                    context,
                    0,
                    intent,
                    PendingIntent.FLAG_UPDATE_CURRENT
                )
            }
            
            views.setOnClickPendingIntent(R.id.hora_widget_root, pendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
`;
      fs.writeFileSync(path.join(javaDir, 'HoraWidgetReceiver.kt'), receiverContent);

      // Write HoraWidgetModule.kt
      const moduleContent = `package ${packageName}

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class HoraWidgetModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String {
        return "HoraWidgetModule"
    }

    @ReactMethod
    fun syncWidget(title: String, grahaName: String, grahaSymbol: String, timeRange: String, highlighted: Boolean, backgroundIcon: String, isDarkTheme: Boolean) {
        val context = reactApplicationContext
        val prefs = context.getSharedPreferences("hora_widget_prefs", Context.MODE_PRIVATE)
        prefs.edit().apply {
            putString("title", title)
            putString("graha_name", grahaName)
            putString("graha_symbol", grahaSymbol)
            putString("time_range", timeRange)
            putBoolean("highlighted", highlighted)
            putString("background_icon", backgroundIcon)
            putBoolean("is_dark_theme", isDarkTheme)
            apply()
        }

        // Trigger widget update
        val intent = Intent(context, HoraWidgetReceiver::class.java).apply {
            action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
        }
        val ids = AppWidgetManager.getInstance(context).getAppWidgetIds(
            ComponentName(context, HoraWidgetReceiver::class.java)
        )
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
        context.sendBroadcast(intent)
    }
}
`;
      fs.writeFileSync(path.join(javaDir, 'HoraWidgetModule.kt'), moduleContent);

      // Write HoraWidgetPackage.kt
      const packageContent = `package ${packageName}

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class HoraWidgetPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(HoraWidgetModule(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}
`;
      fs.writeFileSync(path.join(javaDir, 'HoraWidgetPackage.kt'), packageContent);

      // Modify MainApplication.kt to register the package
      const mainAppKtPath = path.join(javaDir, 'MainApplication.kt');
      if (fs.existsSync(mainAppKtPath)) {
        let content = fs.readFileSync(mainAppKtPath, 'utf8');
        if (!content.includes('HoraWidgetPackage()')) {
          const packageImport = `import ${packageName}.HoraWidgetPackage`;
          if (!content.includes(packageImport)) {
            content = content.replace(/package .*/, `$&\n\n${packageImport}`);
          }
          
          if (content.includes('// add(MyReactNativePackage())')) {
            content = content.replace(
              '// add(MyReactNativePackage())',
              `// add(MyReactNativePackage())\n              add(HoraWidgetPackage())`
            );
          } else {
            content = content.replace(
              /(PackageList\(this\)\.packages.*?\.apply\s*\{)/,
              `$&\n              add(HoraWidgetPackage())`
            );
          }
          fs.writeFileSync(mainAppKtPath, content);
        }
      }

      // Modify MainApplication.java (fallback)
      const mainAppJavaPath = path.join(javaDir, 'MainApplication.java');
      if (fs.existsSync(mainAppJavaPath)) {
        let content = fs.readFileSync(mainAppJavaPath, 'utf8');
        if (!content.includes('HoraWidgetPackage()')) {
          const packageImport = `import ${packageName}.HoraWidgetPackage;`;
          if (!content.includes(packageImport)) {
            content = content.replace(/package .*/, `$&\n\n${packageImport}`);
          }

          if (content.includes('// packages.add(new MyReactNativePackage());')) {
            content = content.replace(
              '// packages.add(new MyReactNativePackage());',
              `// packages.add(new MyReactNativePackage());\n      packages.add(new HoraWidgetPackage());`
            );
          } else {
            content = content.replace(
              /(List<ReactPackage>\s*packages\s*=\s*new\s*PackageList\(this\)\.getPackages\(\);)/,
              `$&\n      packages.add(new HoraWidgetPackage());`
            );
          }
          fs.writeFileSync(mainAppJavaPath, content);
        }
      }

      return modConfig;
    },
  ]);
}

module.exports = withAndroidHoraWidget;
