import * as core from "@actions/core";
import {
  DependabotAlerts,
  CodeScanningAlerts,
  SecretScanningAlerts
} from "./utils";
import { Octokit } from "@octokit/action";


const run = async (): Promise<void> => {
  // get dependabot alerts
  let dependabotRes = await (DependabotAlerts("advanced-security-demo", "srdemo-demo"));
  core.debug(`[🔎] Dependabot alerts: ` + dependabotRes.length);
  core.debug(`[✅] Dependabot alerts fetched`);

  // get code scanning alerts
  let codeScanningRes = await (CodeScanningAlerts("advanced-security-demo", "srdemo-demo"));
  core.debug(`[🔎] Code Scanning alerts: ` + codeScanningRes.length);
  core.debug(`[✅] Code Scanning alerts fetched`);

  // get secret scanning alerts
  let secretScanningRes = await (SecretScanningAlerts("advanced-security-demo", "srdemo-demo"));
  core.debug(`[🔎] Secret Scanning alerts ` + secretScanningRes.length);
  core.debug(`[✅] Secret Scanning alerts fetched`);

  // do our metrics, calculations, etc

  // prepare output

  return;
};

run();
