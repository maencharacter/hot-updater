import type { DetoxScenarioDefinition } from "./types.ts";

export const renderErrorPromotionScenario: DetoxScenarioDefinition = {
  name: "render-error-promotion",
  run: async (app) => {
    await app.control(
      "capture built-in bundle id",
      "/e2e/capture-built-in-bundle-id",
      {},
      {
        saveResultAs: "builtInBundleId",
      },
    );
    await app.control(
      "deploy render-error stable bundle",
      "/e2e/jobs/deploy-bundle",
      {
        channel: "production",
        marker: "render-error-stable-detox",
        mode: "reset",
        safeBundleIds: [],
        targetAppVersion: "1.0.x",
      },
      {
        saveResultAs: "stableBundleId",
      },
    );
    await app.launch("launch render-error stable installer");
    await app.tap(
      "install render-error stable",
      "action-install-current-channel-update",
    );
    await app.assertText(
      "assert render-error stable installed",
      "update-action-result",
      "current-channel -> installed $stableBundleId",
      { exactText: true },
    );
    await app.control(
      "wait render-error stable installed",
      "/e2e/jobs/wait-for-metadata",
      {
        bundleId: "$stableBundleId",
        verificationPending: true,
      },
    );
    await app.reload("load render-error stable");
    await app.control(
      "wait render-error stable promoted",
      "/e2e/jobs/wait-for-metadata",
      {
        bundleId: "$stableBundleId",
        verificationPending: false,
      },
    );

    await app.control(
      "deploy render-error bundle",
      "/e2e/jobs/deploy-bundle",
      {
        channel: "production",
        marker: "render-error-detox",
        mode: "render-error",
        safeBundleIds: ["$builtInBundleId", "$stableBundleId"],
        targetAppVersion: "1.0.x",
      },
      {
        saveResultAs: "renderErrorBundleId",
      },
    );
    await app.launch("refresh render-error update check");
    await app.tap(
      "install render-error bundle",
      "action-install-current-channel-update",
    );
    await app.assertText(
      "assert render-error bundle installed",
      "update-action-result",
      "current-channel -> installed $renderErrorBundleId",
      { exactText: true },
    );
    await app.control(
      "wait render-error bundle installed",
      "/e2e/jobs/wait-for-metadata",
      {
        bundleId: "$renderErrorBundleId",
        verificationPending: true,
      },
    );
    await app.reload("load render-error bundle");
    await app.assertText(
      "error boundary caught the render error",
      "render-error-fallback",
      "render error caught",
    );
    await app.control(
      "render-error bundle is promoted anyway",
      "/e2e/jobs/wait-for-metadata",
      {
        bundleId: "$renderErrorBundleId",
        verificationPending: false,
      },
    );
    await app.control("capture render-error promotion", "/e2e/capture-state", {
      prefix: "render-error-promoted",
    });

    await app.terminate("stop render-error process");
    await app.launch("cold start after render-error launch");
    await app.assertText(
      "render-error bundle still runs after a cold start",
      "render-error-fallback",
      "render error caught",
    );
    await app.control(
      "render-error bundle is still active",
      "/e2e/assert-metadata-active",
      {
        bundleId: "$renderErrorBundleId",
      },
    );
    await app.control(
      "capture render-error after cold start",
      "/e2e/capture-state",
      {
        prefix: "render-error-cold-start",
      },
    );
  },
};
