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

  for (const feature of inputs.features) {
    core.info(`[🔎] Fetching ${feature} alerts`);
    let alerts;
    if (feature === "dependabot") {
      alerts = await DependabotAlerts(
        inputs.org as string,
        inputs.repo as string
      );
    } else if (feature === "code-scanning") {
      alerts = await CodeScanningAlerts(
        inputs.org as string,
        inputs.repo as string
      );
    } else if (feature === "secret-scanning") {
      alerts = await SecretScanningAlerts(
        inputs.org as string,
        inputs.repo as string
      );
    }

    core.debug(`[🔎] ${feature} alerts: ` + alerts.length);
    core.info(`[✅] ${feature} alerts fetched`);

    let metrics;
    if (feature === "dependabot") {
      metrics = AlertsMetrics(
        alerts,
        inputs.frequency,
        "fixed_at",
        "fixed",
        false
      );

      output.dependabot_metrics = metrics;
    } else if (feature === "code-scanning") {
      await GetCommitDate(
        inputs.org as string,
        inputs.repo as string,
        alerts,
        "most_recent_instance.commit_sha"
      );

      metrics = AlertsMetrics(
        alerts,
        inputs.frequency,
        "fixed_at",
        "fixed",
        true,
        "commitDate",
        "created_at"
      );

      output.code_scanning_metrics = metrics;
    } else if (feature === "secret-scanning") {
      await GetCommitDate(
        inputs.org as string,
        inputs.repo as string,
        alerts,
        "commitsSha"
      );

      metrics = AlertsMetrics(
        alerts,
        inputs.frequency,
        "resolved_at",
        "resolved",
        true,
        "commitDate",
        "created_at"
      );

      output.secret_scanning_metrics = metrics;
    }

    PrintAlertsMetrics(`${feature}`, metrics);
    core.debug(`[🔎] ${feature} - MTTR: ` + JSON.stringify(metrics.mttr.mttr));
    core.debug(`[🔎] ${feature} - MTTD: ` + JSON.stringify(metrics.mttd?.mttd));

    core.info(`[✅] ${feature} metrics calculated`);
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
