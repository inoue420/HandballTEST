/* eslint-disable @typescript-eslint/no-var-requires */
const {
  AndroidConfig,
  withAndroidManifest,
  withInfoPlist,
  createRunOncePlugin,
} = require("expo/config-plugins");

const pkg = { name: "with-google-mobile-ads", version: "1.0.0" };

/**
 * <application> 直下に meta-data を「同名があれば置換」する形で追加
 * （tools:replace を付けつつ、重複も避ける）
 */
function addReplacingMainApplicationMetaDataItem(manifest, itemName, itemValue) {
  AndroidConfig.Manifest.ensureToolsAvailable(manifest);

  const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
  mainApplication["meta-data"] = mainApplication["meta-data"] ?? [];

  // 既存の同名 meta-data があれば削除して重複を避ける
  mainApplication["meta-data"] = mainApplication["meta-data"].filter(
    (md) => md?.$?.["android:name"] !== itemName
  );

  mainApplication["meta-data"].push({
    $: {
      "android:name": itemName,
      "android:value": String(itemValue),
      "tools:replace": "android:value",
    },
  });

  return manifest;
}

const withGoogleMobileAds = (config, props = {}) => {
  const {
    androidAppId,
    iosAppId,
    delayAppMeasurementInit,
    optimizeInitialization,
    optimizeAdLoading,
    userTrackingUsageDescription,
  } = props;

  // --- Android: AndroidManifest.xml ---
  config = withAndroidManifest(config, (config) => {
    if (androidAppId) {
      addReplacingMainApplicationMetaDataItem(
        config.modResults,
        "com.google.android.gms.ads.APPLICATION_ID",
        androidAppId
      );
    }

    if (typeof delayAppMeasurementInit === "boolean") {
      addReplacingMainApplicationMetaDataItem(
        config.modResults,
        "com.google.android.gms.ads.DELAY_APP_MEASUREMENT_INIT",
        delayAppMeasurementInit
      );
    }

    if (typeof optimizeInitialization === "boolean") {
      addReplacingMainApplicationMetaDataItem(
        config.modResults,
        "com.google.android.gms.ads.flag.OPTIMIZE_INITIALIZATION",
        optimizeInitialization
      );
    }

    if (typeof optimizeAdLoading === "boolean") {
      addReplacingMainApplicationMetaDataItem(
        config.modResults,
        "com.google.android.gms.ads.flag.OPTIMIZE_AD_LOADING",
        optimizeAdLoading
      );
    }

    return config;
  });

  // --- iOS: Info.plist ---
  config = withInfoPlist(config, (config) => {
    if (iosAppId) {
      config.modResults.GADApplicationIdentifier = iosAppId;
    }

    // 公式plugin同様、指定があれば GADDelayAppMeasurementInit を設定
    if (typeof delayAppMeasurementInit === "boolean") {
      config.modResults.GADDelayAppMeasurementInit = delayAppMeasurementInit;
    }

    // ATTの文言（NSUserTrackingUsageDescription）を上書きしたい場合に使用
    if (userTrackingUsageDescription) {
      config.modResults.NSUserTrackingUsageDescription = userTrackingUsageDescription;
    }

    return config;
  });

  return config;
};

module.exports = createRunOncePlugin(withGoogleMobileAds, pkg.name, pkg.version);
