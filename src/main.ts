import * as core from "@actions/core";
import {
  inputs as getInput,
  DependabotAlerts,
  CodeScanningAlerts,
  SecretScanningAlerts,
  AlertsMetrics,
  PrintAlertsMetrics,
  CalculateMTTR
} from "./utils";
import { Octokit } from "@octokit/action";


const run = async (): Promise<void> => {

  // get inputs
  const inputs = await getInput();
  core.debug(`[✅] Inputs parsed]`);

  // get dependabot alerts
  if (inputs.features.includes("dependabot")) {
    let dependabotRes = await (DependabotAlerts("advanced-security-demo", "srdemo-demo"));
    core.debug(`[🔎] Dependabot alerts: ` + dependabotRes.length);
    core.debug(`[✅] Dependabot alerts fetched`);

    const dependabotAlertsMetrics = AlertsMetrics(dependabotRes, "fixed_at", "fixed");
    const dependabotMttr = CalculateMTTR(dependabotRes, "fixed_at", "fixed");
    PrintAlertsMetrics("Dependabot", dependabotAlertsMetrics);
    core.debug(`[🔎] Dependabot - MTTR: ` + dependabotMttr.mttr);
  }


  // get code scanning alerts
  if (inputs.features.includes("code-scanning")) {
    let codeScanningRes = await (CodeScanningAlerts("advanced-security-demo", "srdemo-demo"));
    core.debug(`[🔎] Code Scanning alerts: ` + codeScanningRes.length);
    core.debug(`[✅] Code Scanning alerts fetched`);

    const codeScanningAlertsMetrics = AlertsMetrics(codeScanningRes, "fixed_at", "fixed");
    const codeScanningMttr = CalculateMTTR(codeScanningRes, "fixed_at", "fixed");
    PrintAlertsMetrics("Code Scanning", codeScanningAlertsMetrics);
    core.debug(`[🔎] Code Scanning - MTTR: ` + codeScanningMttr.mttr);
  }


  // get secret scanning alerts
  if (inputs.features.includes("secret-scanning")) {
    let secretScanningRes = await (SecretScanningAlerts("advanced-security-demo", "srdemo-demo"));
    core.debug(`[🔎] Secret Scanning alerts ` + secretScanningRes.length);
    core.debug(`[✅] Secret Scanning alerts fetched`);

    const secretScanningAlertsMetrics = AlertsMetrics(secretScanningRes, "resolved_at", "resolved");
    const secretScanningMttr = CalculateMTTR(secretScanningRes, "resolved_at", "resolved");
    PrintAlertsMetrics("Secret Scanning", secretScanningAlertsMetrics);
    core.debug(`[🔎] Secret Scanning - MTTR: ` + secretScanningMttr.mttr);
  }

  // prepare output

  return;
};

run();
