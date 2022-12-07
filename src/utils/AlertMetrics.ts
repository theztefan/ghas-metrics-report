import * as core from "@actions/core";
import { DependancyAlert, CodeScanningAlert } from "../types/common/main";

// Metrics
interface AlertsMetrics {
  fixedYesterday: number;
  fixedLastWeek: number;
  openVulnerabilities: number;
  top10: any[];
  mttr: MTTRMetrics;
}
interface MTTRMetrics {
  mttr: number;
  count: number;
}

export const AlertsMetrics = (
  alerts: any[],
  dateField: string,
  state: string
): AlertsMetrics => {
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const today = todayDate.getDate();

  const yesterdayDate = new Date();
  yesterdayDate.setHours(0, 0, 0, 0);
  const yesterday = yesterdayDate.setDate(yesterdayDate.getDate() - 1);

  const lastWeekDate = new Date();
  lastWeekDate.setHours(0, 0, 0, 0);
  const lastWeek = lastWeekDate.setDate(lastWeekDate.getDate() - 7);

  const fixedAlerts = alerts.filter((a) => a.state === state);
  const fixedAlertsYesterday = fixedAlerts.filter((a) =>
    FilterBetweenDates(a[dateField], yesterday, today)
  );
  const fixedAlertsLastWeek = fixedAlerts.filter((a) =>
    FilterBetweenDates(a[dateField], lastWeek, today)
  );

  //get Top 10 by criticality
  const openAlerts = alerts.filter((a) => a.state === "open");
  const top10Alerts = openAlerts.sort(compareAlertSeverity).slice(0, 10);

  //get MTTR
  const mttr = CalculateMTTR(alerts, dateField, state);

  const result: AlertsMetrics = {
    fixedYesterday: fixedAlertsYesterday.length,
    fixedLastWeek: fixedAlertsLastWeek.length,
    openVulnerabilities: alerts.filter((a) => a.state === "open").length,
    top10: top10Alerts,
    mttr: mttr,
  };

  return result;
};

export const PrintAlertsMetrics = (
  category: string,
  alertsMetrics: AlertsMetrics
): void => {
  for (const metric in alertsMetrics) {
    core.debug(
      `[🔎] ${category} - ${metric}: ` +
        alertsMetrics[metric as keyof AlertsMetrics]
    );
  }
};

export const CalculateMTTR = (
  alerts: any[],
  dateField: string,
  state: string
): MTTRMetrics => {
  let alert_count = 0;
  let total_time_to_remediate_seconds = 0;

  for (const alert of alerts.filter((a) => a.state === state)) {
    const fixedDate: number = Date.parse(alert[dateField]);
    const openDate: number = Date.parse(alert.created_at);

    const time_to_remediate = fixedDate - openDate;
    total_time_to_remediate_seconds += time_to_remediate / 1000;
    alert_count += 1;
  }

  const result: MTTRMetrics = {
    mttr: alert_count === 0 ? 0 : total_time_to_remediate_seconds / alert_count,
    count: alert_count,
  };

  return result;
};

const FilterBetweenDates = (
  stringDate: string,
  minDate: number,
  maxDate: number
): boolean => {
  const date: number = Date.parse(stringDate);
  return date >= minDate && date < maxDate;
};

function compareAlertSeverity(a: any, b: any) {
  //critical, high, medium, low, warning, note, error
  const weight: { [key: string]: number } = {
    critical: 7,
    high: 6,
    medium: 5,
    low: 4,
    warning: 3,
    note: 2,
    error: 1,
    none: 0,
  };
  let comparison = 0;
  let severity1 = "none";
  let severity2 = "none";

  // different comparisons depending on alert type alerts
  if (isDependancyAlert(a) && isDependancyAlert(b)) {
    severity1 = a.security_advisory.severity.toLowerCase();
    severity2 = b.security_advisory.severity.toLowerCase();
  } else if (isCodeScanningAlert(a) && isCodeScanningAlert(b)) {
    severity1 = a.rule.severity.toLowerCase();
    severity2 = b.rule.severity.toLowerCase();
  }

  if (weight[severity1] < weight[severity2]) {
    comparison = 1;
  } else if (weight[severity1] > weight[severity2]) {
    comparison = -1;
  }

  return comparison;
}

function isDependancyAlert(alert: DependancyAlert): alert is DependancyAlert {
  return "security_advisory" in alert;
}
function isCodeScanningAlert(
  alert: CodeScanningAlert
): alert is CodeScanningAlert {
  return "rule" in alert && "severity" in alert.rule;
}
