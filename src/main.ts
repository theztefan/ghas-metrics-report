import * as core from "@actions/core";
import {
  inputs as getInput,
  DependabotAlerts,
  CodeScanningAlerts,
  SecretScanningAlerts,
  AlertsMetrics,
  PrintAlertsMetrics,
  syncWriteFile as writeReportToFile,
  preparePdfAndWriteToFile as writeReportToPdf,
  prepareSummary,
  preparePdf,
  GetCommitDate,
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
  } as Report;

  // get dependabot alerts
  if (inputs.features.includes("dependabot")) {
    const dependabotRes = await DependabotAlerts(
      inputs.org as string,
      inputs.repo as string
    );
    core.debug(`[🔎] Dependabot alerts: ` + dependabotRes.length);
    core.info(`[✅] Dependabot alerts fetched`);

    const dependabotAlertsMetrics = AlertsMetrics(
      dependabotRes,
      inputs.frequency,
      "fixed_at",
      "fixed",
      false
    );
    PrintAlertsMetrics("Dependabot", dependabotAlertsMetrics);
    core.debug(`[🔎] Dependabot - MTTR: ` + dependabotAlertsMetrics.mttr.mttr);
    core.info(`[✅] Dependabot metrics calculated`);
    output.dependabot_metrics = dependabotAlertsMetrics;
  }

  // get code scanning alerts
  if (inputs.features.includes("code-scanning")) {
    const codeScanningRes = await CodeScanningAlerts(
      inputs.org as string,
      inputs.repo as string
    );
    core.debug(`[🔎] Code Scanning alerts: ` + codeScanningRes.length);
    core.info(`[✅] Code Scanning alerts fetched`);

    await GetCommitDate(
      inputs.org as string,
      inputs.repo as string,
      codeScanningRes,
      "most_recent_instance.commit_sha"
    );

    const codeScanningAlertsMetrics = AlertsMetrics(
      codeScanningRes,
      inputs.frequency,
      "fixed_at",
      "fixed",
      true,
      "commitDate",
      "created_at"
    );
    PrintAlertsMetrics("Code Scanning", codeScanningAlertsMetrics);
    core.debug(
      `[🔎] Code Scanning - MTTR: ` +
        JSON.stringify(codeScanningAlertsMetrics.mttr.mttr)
    );
    core.debug(
      `[🔎] Code Scanning - MTTD: ` +
        JSON.stringify(codeScanningAlertsMetrics.mttd?.mttd)
    );

    core.info(`[✅] Code Scanning metrics calculated`);

    output.code_scanning_metrics = codeScanningAlertsMetrics;
  }

  // get secret scanning alerts
  if (inputs.features.includes("secret-scanning")) {
    const secretScanningRes = await SecretScanningAlerts(
      inputs.org as string,
      inputs.repo as string
    );
    core.debug(`[🔎] Secret Scanning alerts ` + secretScanningRes.length);
    core.debug(`[✅] Secret Scanning alerts fetched`);

    await GetCommitDate(
      inputs.org as string,
      inputs.repo as string,
      secretScanningRes,
      "commitsSha"
    );

    const secretScanningAlertsMetrics = AlertsMetrics(
      secretScanningRes,
      inputs.frequency,
      "resolved_at",
      "resolved",
      true,
      "commitDate",
      "created_at"
    );
    PrintAlertsMetrics("Secret Scanning", secretScanningAlertsMetrics);
    core.debug(
      `[🔎] Secret Scanning - MTTR: ` + secretScanningAlertsMetrics.mttr.mttr
    );
    core.debug(
      `[🔎] Secret Scanning - MTTD: ` + secretScanningAlertsMetrics.mttd?.mttd
    );

    core.info(`[✅] Secret scanning metrics calculated`);
    output.secret_scanning_metrics = secretScanningAlertsMetrics;
  }

  // prepare output
  core.setOutput("report-json", JSON.stringify(output, null, 2));
  core.info(`[✅] Report written output 'report-json' variable`);

  if (inputs.outputFormat.includes("json")) {
    writeReportToFile("ghas-report.json", JSON.stringify(output, null, 2));
    core.info(`[✅] JSON Report written to file`);
  }

  if (inputs.outputFormat.includes("pdf")) {
    writeReportToPdf("ghas-report.pdf", preparePdf(output));
    core.info(`[✅] PDF Report written to file`);
  }

  if (process.env.RUN_USING_ACT !== "true") {
    prepareSummary(output);
    core.summary.write();
    core.info(`[✅] Report written to summary`);
  }

  return;
};

run();
