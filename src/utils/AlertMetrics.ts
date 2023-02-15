import * as core from "@actions/core";
import {
  DependancyAlert,
  CodeScanningAlert,
  reportFrequency,
  AlertsMetrics as AlertsMetricsType,
  MTTRMetrics,
  MTTDMetrics,
  DependencyOrCodeAlert,
  Alert,
  SecretScanningAlert,
} from "../types/common/main";

export const AlertsMetrics = (
  alerts: Alert[],
  frequency: reportFrequency,
  fixedDateField: string,
  state: string,
  calculateMTTD: boolean,
  introducedDateField?: string,
  detectedDateField?: string
): AlertsMetricsType => {
  const todayDate: Date = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const fixedAlerts = alerts.filter((a) => a.state === state);

  let fixedLastXDays = [];
  let openedLastXDays = [];

  const pastDate = new Date();
  pastDate.setHours(0, 0, 0, 0);
  if (frequency === "daily") {
    pastDate.setDate(pastDate.getDate() - 1);
  } else if (frequency === "weekly") {
    pastDate.setDate(pastDate.getDate() - 7);
  } else if (frequency === "monthly") {
    pastDate.setMonth(pastDate.getMonth() - 1);
  }

  core.debug(`past date: ` + pastDate);
  fixedLastXDays = fixedAlerts.filter(
    (a: CodeScanningAlert | DependencyOrCodeAlert) =>
      !isCodeScanningAlert(a)
        ? FilterBetweenDates(
            (a as DependencyOrCodeAlert).dismissed_at,
            pastDate,
            todayDate
          )
        : (fixedLastXDays = fixedAlerts.filter((a) =>
            FilterBetweenDates(a[fixedDateField], pastDate, todayDate)
          ))
  );

  //get Top 10 by criticality
  const openAlerts = alerts.filter((a) => a.state === "open");
  const top10Alerts = openAlerts.sort(compareAlertSeverity).slice(0, 10);

  openedLastXDays = openAlerts.filter(
    (a: CodeScanningAlert | DependencyOrCodeAlert | SecretScanningAlert) => {
      return FilterBetweenDates(a.created_at, pastDate, todayDate);
    }
  );

  //get MTTR
  const mttr = CalculateMTTR(alerts, fixedDateField, state);

  let mttd = undefined;
  if (calculateMTTD) {
    mttd = CalculateMTTD(
      alerts as DependencyOrCodeAlert[],
      introducedDateField,
      detectedDateField
    );
  }

  const result: AlertsMetricsType = {
    fixedLastXDays: fixedLastXDays.length,
    openedLastXDays: openedLastXDays.length,
    openVulnerabilities: alerts.filter((a) => a.state === "open").length,
    top10: top10Alerts,
    newOpenAlerts: openedLastXDays,
    mttr: mttr,
    mttd: mttd,
  };

  return result;
};

export const CalculateMTTR = (
  alerts: Alert[],
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

export const CalculateMTTD = (
  alerts: DependencyOrCodeAlert[],
  introducedDateField: string,
  detectedDateField: string
): MTTDMetrics => {
  let alert_count = 0;
  let total_time_to_detect_seconds = 0;

  for (const alert of alerts) {
    const introducedDate: number = Date.parse(
      introducedDateField
        .split(".")
        .filter((s) => s)
        .reduce((acc, val) => acc && acc[val], alert)
    );
    const detectedDate: number = Date.parse(
      detectedDateField
        .split(".")
        .filter((s) => s)
        .reduce((acc, val) => acc && acc[val], alert)
    );

    const time_to_remediate = detectedDate - introducedDate;
    total_time_to_detect_seconds += time_to_remediate / 1000;

    alert_count += 1;
  }

  const result: MTTDMetrics = {
    mttd: alert_count === 0 ? 0 : total_time_to_detect_seconds / alert_count,
  };

  return result;
};

const FilterBetweenDates = (
  stringDate: string,
  minDate: Date,
  maxDate: Date
): boolean => {
  const date: number = Date.parse(stringDate);
  return date >= minDate.getTime() && date < maxDate.getTime();
};

function compareAlertSeverity(a: Alert, b: Alert) {
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

  severity1 = isDependancyAlert(a)
    ? a.security_advisory.severity.toLowerCase()
    : (a as CodeScanningAlert).rule?.severity.toLowerCase();
  severity2 = isDependancyAlert(b)
    ? b.security_advisory.severity.toLowerCase()
    : (b as CodeScanningAlert).rule?.severity.toLowerCase();

  if (weight[severity1] < weight[severity2]) {
    comparison = 1;
  } else if (weight[severity1] > weight[severity2]) {
    comparison = -1;
  }

  return comparison;
}

export function isDependancyAlert(alert: Alert): alert is DependancyAlert {
  return "security_advisory" in alert;
}

export function isCodeScanningAlert(
  alert: CodeScanningAlert | DependencyOrCodeAlert | Alert
): alert is CodeScanningAlert {
  return "rule" in alert && "severity" in alert.rule;
}

export function isSecretScanningAlert(
  alert: SecretScanningAlert | Alert
): alert is SecretScanningAlert {
  return "secret_type_display_name" in alert;
}
