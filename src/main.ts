import * as core from "@actions/core";
import {
  inputs as getInput,
  PrintAlertsMetrics,
  syncWriteFile as writeReportToFile,
  preparePdfAndWriteToFile as writeReportToPdf,
  prepareSummary,
  preparePdf,
} from "./utils";
import { Alert, AlertsMetrics, Report } from "./types/common/main";
import { randomUUID } from "crypto";
import { Context } from "./context/Context";

const run = async (): Promise<void> => {
  // get inputs
  const inputs = await getInput();
  core.debug(`[✅] Inputs parsed]`);

  const id = randomUUID();
  const output: Report = {
    id: id,
    created_at: new Date().toISOString(),
    inputs: inputs,
    features: [],
  } as Report;

  for (const feature of inputs.features) {
    const context = new Context(feature);
    core.info(`[🔎] Fetching ${context.prettyName} alerts`);

    const alerts: Alert[] = await context.alerts(
      inputs.org as string,
      inputs.repo as string
    );

    core.debug(`[🔎] ${context.prettyName} alerts: ` + alerts.length);
    core.info(`[✅] ${context.prettyName} alerts fetched`);

    const metrics: AlertsMetrics = await context.alertsMetrics(
      inputs.frequency,
      alerts,
      inputs.org as string,
      inputs.repo as string
    );

    PrintAlertsMetrics(`${context.prettyName}`, metrics);

    core.debug(
      `[🔎] ${context.prettyName} - MTTR: ` + JSON.stringify(metrics.mttr.mttr)
    );
    core.debug(
      `[🔎] ${context.prettyName} - MTTD: ` + JSON.stringify(metrics.mttd?.mttd)
    );

    core.info(`[✅] ${context.prettyName} metrics calculated`);

    output.features.push(context.feature);
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
