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
} from "../types/common/main";
import { SecretScanningAlerts } from "./SecretScanningAlerts";

export const AlertsMetrics = (
  alerts: Alert[],
  frequency: reportFrequency,
  fixedDateField: string,
  state: string,
  calculateMTTD: boolean,
  introducedDateField?: string,
  detectedDateField?: string
): AlertsMetricsType => {
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const today = todayDate.getDate();

  const fixedAlerts = alerts.filter((a) => a.state === state);

  let fixedLastXDays = [];

  if (frequency === "daily") {
    const yesterdayDate = new Date();
    yesterdayDate.setHours(0, 0, 0, 0);
    const yesterday = yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    fixedLastXDays = fixedAlerts.filter((a) =>
      FilterBetweenDates(a[fixedDateField], yesterday, today)
    );
  } else if (frequency === "weekly") {
    const lastWeekDate = new Date();
    lastWeekDate.setHours(0, 0, 0, 0);
    const lastWeek = lastWeekDate.setDate(lastWeekDate.getDate() - 7);

    fixedLastXDays = fixedAlerts.filter((a) =>
      FilterBetweenDates(a[fixedDateField], lastWeek, today)
    );
  } else if (frequency === "monthly") {
    const lastMonthDate = new Date();
    lastMonthDate.setHours(0, 0, 0, 0);
    const lastMonth = lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    core.debug(`last Month: ` + lastMonth);
    fixedLastXDays = fixedAlerts.filter((a) =>
      !(a instanceof SecretScanningAlerts)
        ? FilterBetweenDates(
            (a as DependencyOrCodeAlert).dismissed_at,
            lastMonth,
            today
          )
        : true
    );
  }

  //get Top 10 by criticality
  const openAlerts = alerts.filter((a) => a.state === "open");
  const top10Alerts = openAlerts.sort(compareAlertSeverity).slice(0, 10);

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
    openVulnerabilities: alerts.filter((a) => a.state === "open").length,
    top10: top10Alerts,
    mttr: mttr,
    mttd: mttd,
  };

  return result;
};

export const PrintAlertsMetrics = (
  category: string,
  alertsMetrics: AlertsMetricsType
): void => {
  for (const metric in alertsMetrics) {
    core.debug(
      `[🔎] ${category} - ${metric}: ` +
        alertsMetrics[metric as keyof AlertsMetricsType]
    );
  }
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
  minDate: number,
  maxDate: number
): boolean => {
  const date: number = Date.parse(stringDate);
  return date >= minDate && date < maxDate;
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

function isDependancyAlert(alert: Alert): alert is DependancyAlert {
  return "security_advisory" in alert;
}
