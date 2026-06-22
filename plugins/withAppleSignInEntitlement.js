const path = require('path');

// Resolve @expo/config-plugins via expo to work under pnpm (non-hoisted deps).
const expoRoot = path.dirname(require.resolve('expo/package.json'));
const { withEntitlementsPlist } = require(
  require.resolve('@expo/config-plugins', { paths: [expoRoot] })
);

// Adds the Sign In with Apple entitlement to the iOS build.
//
// `ios.usesAppleSignIn: true` in app.json did not emit this key during
// `expo prebuild` for this project, so the generated entitlements file lacked
// `com.apple.developer.applesignin`. Without it the native AuthenticationServices
// request fails with error 1000 (ASAuthorizationError.unknown) before Firebase
// is ever reached. Setting it explicitly here guarantees the entitlement is
// present and survives prebuild regeneration.
const withAppleSignInEntitlement = (config) =>
  withEntitlementsPlist(config, (config) => {
    config.modResults['com.apple.developer.applesignin'] = ['Default'];
    return config;
  });

module.exports = withAppleSignInEntitlement;
