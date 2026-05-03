import path from "node:path";
import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";

Config.overrideWebpackConfig((currentConfiguration) => {
  const tailwindConfiguration = enableTailwind(currentConfiguration);

  return {
    ...tailwindConfiguration,
    resolve: {
      ...tailwindConfiguration.resolve,
      alias: {
        ...(tailwindConfiguration.resolve?.alias ?? {}),
        "@": path.join(process.cwd()),
      },
    },
  };
});
