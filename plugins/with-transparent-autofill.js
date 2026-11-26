const {
  AndroidConfig,
  withAndroidStyles,
  withDangerousMod,
} = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const DRAWABLE_NAME = 'autofill_transparent';
const DRAWABLE_XML = `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <solid android:color="@android:color/transparent" />
</shape>
`;

/**
 * Overrides Android's default autofill highlight drawable on API 26+ with a
 * transparent shape so dark inputs keep their intended background color.
 */
function withTransparentAutofill(config) {
  config = withAndroidStyles(config, (modConfig) => {
    const resources = modConfig.modResults.resources ?? {};
    resources.$ = {
      ...resources.$,
      'xmlns:tools': resources.$?.['xmlns:tools'] || 'http://schemas.android.com/tools',
    };
    modConfig.modResults.resources = resources;

    modConfig.modResults = AndroidConfig.Styles.assignStylesValue(modConfig.modResults, {
      add: true,
      parent: AndroidConfig.Styles.getAppThemeGroup(),
      name: 'android:autofilledHighlight',
      targetApi: '26',
      value: `@drawable/${DRAWABLE_NAME}`,
    });

    return modConfig;
  });

  config = withDangerousMod(config, [
    'android',
    async (modConfig) => {
      const drawableDir = path.join(
        modConfig.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'res',
        'drawable',
      );
      await fs.promises.mkdir(drawableDir, { recursive: true });
      await fs.promises.writeFile(
        path.join(drawableDir, `${DRAWABLE_NAME}.xml`),
        DRAWABLE_XML,
        'utf8',
      );
      return modConfig;
    },
  ]);

  return config;
}

module.exports = withTransparentAutofill;
