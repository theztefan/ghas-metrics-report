import * as core from "@actions/core";
import {
  inputs as getInput,
  DependabotAlerts,
  CodeScanningAlerts,
  SecretScanningAlerts,
  AlertsMetrics,
  PrintAlertsMetrics,
  syncWriteFile as writeReportToFile,
  prepareSummary,
} from "./utils";
import { Report } from "./types/common/main";
import { randomUUID } from "crypto";

const run = async (): Promise<void> => {
  // get inputs
  const inputs = await getInput();
  core.debug(`[✅] Inputs parsed]`);

  const id = randomUUID();

  const output: Report = {
    id: id,
    created_at: new Date().toISOString(),
    inputs: inputs,
    dependabot_metrics: null,
    code_scanning_metrics: null,
    secret_scanning_metrics: null,
  };

  // get dependabot alerts
  if (inputs.features.includes("dependabot")) {
    const dependabotRes = await DependabotAlerts(
      "advanced-security-demo",
      "srdemo-demo"
    );
    core.debug(`[🔎] Dependabot alerts: ` + dependabotRes.length);
    core.info(`[✅] Dependabot alerts fetched`);

    const dependabotAlertsMetrics = AlertsMetrics(
      dependabotRes,
      "fixed_at",
      "fixed"
    );
    PrintAlertsMetrics("Dependabot", dependabotAlertsMetrics);
    core.debug(`[🔎] Dependabot - MTTR: ` + dependabotAlertsMetrics.mttr.mttr);
    core.info(`[✅] Dependabot metrics calculated`);
    output.dependabot_metrics = dependabotAlertsMetrics;
  }

  // get code scanning alerts
  if (inputs.features.includes("code-scanning")) {
    const codeScanningRes = await CodeScanningAlerts(
      "advanced-security-demo",
      "srdemo-demo"
    );
    core.debug(`[🔎] Code Scanning alerts: ` + codeScanningRes.length);
    core.info(`[✅] Code Scanning alerts fetched`);

    const codeScanningAlertsMetrics = AlertsMetrics(
      codeScanningRes,
      "fixed_at",
      "fixed"
    );
    PrintAlertsMetrics("Code Scanning", codeScanningAlertsMetrics);
    core.debug(
      `[🔎] Code Scanning - MTTR: ` + codeScanningAlertsMetrics.mttr.mttr
    );
    core.info(`[✅] Code Scanning metrics calculated`);

    output.code_scanning_metrics = codeScanningAlertsMetrics;
  }

  // get secret scanning alerts
  if (inputs.features.includes("secret-scanning")) {
    const secretScanningRes = await SecretScanningAlerts(
      "advanced-security-demo",
      "srdemo-demo"
    );
    core.debug(`[🔎] Secret Scanning alerts ` + secretScanningRes.length);
    core.debug(`[✅] Secret Scanning alerts fetched`);

    const secretScanningAlertsMetrics = AlertsMetrics(
      secretScanningRes,
      "resolved_at",
      "resolved"
    );
    PrintAlertsMetrics("Secret Scanning", secretScanningAlertsMetrics);
    core.debug(
      `[🔎] Secret Scanning - MTTR: ` + secretScanningAlertsMetrics.mttr.mttr
    );
    core.info(`[✅] Secret scanning metrics calculated`);
    output.secret_scanning_metrics = secretScanningAlertsMetrics;
  }

  // prepare output
  core.setOutput("report-json", output);
  writeReportToFile("report.json", JSON.stringify(output, null, 2));
  core.info(`[✅] Report written to file`);


  prepareSummary(output);
  core.summary.write();
  core.info(`[✅] Report written to summary`);
  return;
};

run();
