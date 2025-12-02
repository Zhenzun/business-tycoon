const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Hubungkan NativeWind ke file CSS utama kamu
module.exports = withNativeWind(config, { input: "./global.css" });