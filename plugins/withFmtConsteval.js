const fs = require('fs');
const path = require('path');

// Resolve @expo/config-plugins via expo to work under pnpm (non-hoisted deps).
const expoRoot = path.dirname(require.resolve('expo/package.json'));
const { withDangerousMod } = require(
  require.resolve('@expo/config-plugins', { paths: [expoRoot] })
);

// fmt 11.x: base.h redefines FMT_USE_CONSTEVAL internally based on compiler
// feature macros, so GCC_PREPROCESSOR_DEFINITIONS cannot override it.
// Xcode 26.4's Clang defines __cpp_consteval, which causes the detection block
// (lines ~114-132 of base.h) to set FMT_USE_CONSTEVAL 1.
// Fix: patch the header file directly after pod install, inserting an
// unconditional #undef + #define 0 immediately before the first usage.
const FMT_PATCH = `\
    # fmt 11.x consteval fix — Xcode 26.4 / Clang 17.
    # Patches fmt/base.h directly because the header redefines FMT_USE_CONSTEVAL
    # internally; a preprocessor flag cannot override it.
    fmt_base_h = "#{installer.sandbox.root}/fmt/include/fmt/base.h"
    if File.exist?(fmt_base_h)
      contents = File.read(fmt_base_h)
      unless contents.include?('#undef FMT_USE_CONSTEVAL')
        File.write(
          fmt_base_h,
          contents.sub(
            /^(#if FMT_USE_CONSTEVAL)/,
            "#undef FMT_USE_CONSTEVAL\\n#define FMT_USE_CONSTEVAL 0\\n\\\\1"
          )
        )
      end
    end
`;

const ANCHOR = '    react_native_post_install(';

const withFmtConsteval = (config) =>
  withDangerousMod(config, [
    'ios',
    (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        'Podfile'
      );
      const contents = fs.readFileSync(podfilePath, 'utf8');
      if (!contents.includes('FMT_USE_CONSTEVAL')) {
        fs.writeFileSync(
          podfilePath,
          contents.replace(ANCHOR, FMT_PATCH + ANCHOR),
          'utf8'
        );
      }
      return config;
    },
  ]);

module.exports = withFmtConsteval;
