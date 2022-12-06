import * as core from "@actions/core";
import {
  inputs as getInput,
  DependabotAlerts,
  CodeScanningAlerts,
  SecretScanningAlerts
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
  }


  // get code scanning alerts
  if (inputs.features.includes("code-scanning")) {
    let codeScanningRes = await (CodeScanningAlerts("advanced-security-demo", "srdemo-demo"));
    core.debug(`[🔎] Code Scanning alerts: ` + codeScanningRes.length);
    core.debug(`[✅] Code Scanning alerts fetched`);
  }


  // get secret scanning alerts
  if (inputs.features.includes("secret-scanning")) {
    let secretScanningRes = await (SecretScanningAlerts("advanced-security-demo", "srdemo-demo"));
    core.debug(`[🔎] Secret Scanning alerts ` + secretScanningRes.length);
    core.debug(`[✅] Secret Scanning alerts fetched`);

  }

  // do our metrics, calculations, etc

  // prepare output

  return;
};

run();
