const fs = require('fs');
const path = require('path');

// Resolve @expo/config-plugins via expo to work under pnpm (non-hoisted deps).
const expoRoot = path.dirname(require.resolve('expo/package.json'));
const { withDangerousMod } = require(
  require.resolve('@expo/config-plugins', { paths: [expoRoot] })
);

// Patch 1 — useFrameworks static alignment
// expo-build-properties sets ios.useFrameworks = "static" → CocoaPods generates
// `use_frameworks! :linkage => :static`. Without this global the RNFBApp and
// RNFBAuth podspecs default to static_framework = false, breaking
// <React/RCTBridgeModule.h> resolution.
const FIREBASE_STATIC_PATCH = '$RNFirebaseAsStaticFramework = true\n\n';
const STATIC_ANCHOR = 'prepare_react_native_project!';

// Patch 2 — CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES for RNFirebase pods
// With useFrameworks: static, Clang compiles each pod as a framework module.
// RNFBApp and RNFBAuth include React headers non-modularly, which triggers:
//   "include of non-modular header inside framework module"
// This flag suppresses the error for the affected targets.
const NON_MODULAR_PATCH = `
    installer.pods_project.targets.each do |target|
      next unless ['RNFBApp', 'RNFBAuth'].include?(target.name)
      target.build_configurations.each do |config|
        config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
      end
    end
`;
const POST_INSTALL_ANCHOR = '    react_native_post_install(';

const withFirebaseStaticFramework = (config) =>
  withDangerousMod(config, [
    'ios',
    (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        'Podfile'
      );
      let contents = fs.readFileSync(podfilePath, 'utf8');

      if (!contents.includes('$RNFirebaseAsStaticFramework')) {
        contents = contents.replace(STATIC_ANCHOR, FIREBASE_STATIC_PATCH + STATIC_ANCHOR);
      }

      if (!contents.includes("'CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'")) {
        contents = contents.replace(POST_INSTALL_ANCHOR, NON_MODULAR_PATCH + POST_INSTALL_ANCHOR);
      }

      fs.writeFileSync(podfilePath, contents, 'utf8');
      return config;
    },
  ]);

module.exports = withFirebaseStaticFramework;
