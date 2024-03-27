import * as core from "@actions/core";
import {
  AlertsMetrics as AlertsMetricsUtils,
  inputs as getInput,
  secondsToReadable,
} from "./utils";
import { Alert, AlertsMetrics, Issue, ReportType } from "./types/common/main";
import { randomUUID } from "crypto";
import { Context } from "./context/Context";
import {
  getRepository,
  getRepositoriesForOrg,
  getRepositoriesForTeamAsAdmin,
} from "./github/Repositories";
import { JSONReport } from "./report/JSONReport";
import { PDFReport } from "./report/PDFReport";
import { SummaryReport } from "./report/SummaryReport";
import { Issues } from "./github/Issues";
import {
  isCodeScanningAlert,
  isDependancyAlert,
  isSecretScanningAlert,
} from "./utils/AlertMetrics";

const run = async (): Promise<void> => {
  // get inputs
  const inputs = await getInput();
  core.debug(`[✅] Inputs parsed]`);

  const id = randomUUID();

  const repositories = [];
  if (inputs.team) {
    core.info(
      `[🔎] Fetching repositories for team ${inputs.team} in org ${inputs.org}`,
    );
    repositories.push(
      ...(await getRepositoriesForTeamAsAdmin(inputs.org, inputs.team)),
    );
  } else if (inputs.repo) {
    core.info(`[🔎] Fetching repository ${inputs.repo} in org ${inputs.org}`);
    repositories.push(await getRepository(inputs.org, inputs.repo));
  } else {
    core.info(`[🔎] Fetching repositories for org ${inputs.org}`);
    repositories.push(...(await getRepositoriesForOrg(inputs.org)));
  }

  core.info(`[✅] Repositories fetched`);
  core.info(`[🔎] Found ${repositories.length} repositories`);

  const output: ReportType = {
    id: id,
    created_at: new Date().toISOString(),
    inputs: inputs,
    repositories: [],
  } as ReportType;

  for (const repository of repositories) {
    core.info(`[🔎] Fetching alerts for repository ${repository.name}`);
    const features = [];
    for (const feature of inputs.features) {
      const context = new Context(feature);
      core.info(`[🔎] Fetching ${context.prettyName} alerts`);

      const alerts: Alert[] = await context.alerts(
        inputs.org as string,
        repository.name,
      );

      core.debug(`[🔎] ${context.prettyName} alerts: ` + alerts.length);
      core.info(`[✅] ${context.prettyName} alerts fetched`);

      const metrics: AlertsMetrics = await context.alertsMetrics(
        inputs.frequency,
        alerts,
        inputs.org as string,
        repository.name,
      );

      core.debug(
        `[🔎] ${context.prettyName} - MTTR: ` +
          JSON.stringify(metrics.mttr.mttr),
      );
      core.debug(
        `[🔎] ${context.prettyName} - MTTD: ` +
          JSON.stringify(metrics.mttd?.mttd),
      );

      core.info(`[✅] ${context.prettyName} metrics calculated`);

      if (context.feature.metrics.openVulnerabilities > 0)
        features.push(context.feature);
    }

    output.repositories.push({
      owner: inputs.org,
      name: repository.name,
      features: features,
    });
  }

  if (process.env.RUN_USING_ACT !== "true") {
    inputs.outputFormat.push("github-output");
  }

  // Always write Summary Report
  const summaryReport = new SummaryReport();
  summaryReport.prepare();

  output.repositories.forEach((repository) => {
    if (repository.features.length === 0) return;

    summaryReport.addHeader(
      summaryReport.addHeading(repository.owner, repository.name),
    );

    repository.features.forEach((feature) => {
      summaryReport.addSection(
        feature.prettyName,
        `${feature.prettyName} - top 10`,
        summaryReport.addList(feature, inputs.frequency),
        feature.attributes,
        feature.summaryTop10(),
      );
    });
  });

  summaryReport.write();
  core.info(`[✅] Summary Report written`);

  const outputWithoutMetadata = {
    ...output,
    repositories: output.repositories.map((repository) => ({
      ...repository,
      features: repository.features.map((feature) =>
        feature.printable(feature.prettyName, feature.metrics),
      ),
    })),
  };

  inputs.outputFormat.forEach(async (format) => {
    switch (format) {
      case "json": {
        JSONReport.write(
          "ghas-report.json",
          JSON.stringify(outputWithoutMetadata, null, 2),
        );
        break;
      }
      case "pdf": {
        const report = new PDFReport();
        report.prepare();

        output.repositories.forEach((repository) => {
          if (repository.features.length === 0) return;
          report.addHeader(
            report.addHeading(repository.owner, repository.name),
          );
          repository.features.forEach((feature) => {
            report.addSection(
              feature.prettyName,
              `${feature.prettyName} - top 10`,
              report.addList(feature, inputs.frequency),
              feature.attributes,
              feature.summaryTop10(),
            );
          });
        });

        report.write();
        break;
      }
      case "github-output": {
        core.setOutput(
          "report-json",
          JSON.stringify(outputWithoutMetadata, null, 2),
        );
        core.info(`[✅] Report written output 'report-json' variable`);
        break;
      }
      case "issues": {
        const issues: Issue[] = [];
        const github_issues = new Issues();
        output.repositories.forEach((repository) => {
          if (repository.features.length === 0) return;

          // Create an issue for the Summary Report
          const summaryReportIssue: Issue = {
            owner: inputs.org,
            repo: repository.name,
            title:
              "GHAS Summary Report" +
              " - " +
              new Date(Date.now()).toDateString(),
            body: summaryReport.stringify(),
            labels: ["GHAS", "Summary Report"],
          };
          issues.push(summaryReportIssue);

          repository.features.forEach((feature) => {
            feature.metrics.newOpenAlerts.forEach((alert) => {
              let title = "";
              if (isDependancyAlert(alert)) {
                title = alert.security_advisory.summary;
              } else if (isCodeScanningAlert(alert)) {
                title = alert.rule.description;
              } else if (isSecretScanningAlert(alert)) {
                title = alert.secret_type_display_name;
              }
              const issue: Issue = {
                owner: repository.owner,
                repo: repository.name,
                title: feature.prettyName + " - " + title,
                body: "Tracking issue for:\n" + alert.html_url,
                labels: ["GHAS", feature.prettyName],
              };
              issues.push(issue);
            });
          });
        });
        if (issues.length === 0) {
          core.info(`[✅] No issues to create`);
          break;
        }
        const issue_ids = await github_issues.createIssues(issues);

        core.setOutput(
          "created-issues-ids",
          JSON.stringify(issue_ids, null, 2),
        );
        core.info(`[✅] Issues created: ${JSON.stringify(issue_ids, null, 2)}`);
        break;
      }
      default: {
        core.warning(`[⚠️] Unknown output format ${format}`);
        break;
      }
    }
    core.info(`[✅] ${format.toUpperCase()} Report written`);
  });

  return;
};

run();
