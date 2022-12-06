import * as core from "@actions/core";
import { DependancyAlert, CodeScanningAlert, SecretScanningAlert } from "../../types/common/main";

interface AlertsMetrics {
    fixedYesterday: number,
    fixedLastWeek: number
    openVulnerabilities: number,
}

interface MTTRMetrics {
    mttr: number,
    count: number
}

export const AlertsMetrics = (alerts: any[], dateField: string, state: string): AlertsMetrics => {
  
    const todayDate = new Date();
    todayDate.setHours(0,0,0,0);
    const today = todayDate.getDate();

    const yesterdayDate = new Date();
    yesterdayDate.setHours(0,0,0,0);
    const yesterday = yesterdayDate.setDate(yesterdayDate.getDate() - 1);

    const lastWeekDate = new Date();
    lastWeekDate.setHours(0,0,0,0);
    const lastWeek = lastWeekDate.setDate(lastWeekDate.getDate() - 7);

    const fixedAlerts = alerts.filter(a => a.state === state);
    const fixedAlertsYesterday = fixedAlerts.filter(a => FilterBetweenDates(a[dateField], yesterday, today));
    const fixedAlertsLastWeek = fixedAlerts.filter(a => FilterBetweenDates(a[dateField], lastWeek, today));

    const result:AlertsMetrics = {
        fixedYesterday: fixedAlertsYesterday.length, 
        fixedLastWeek: fixedAlertsLastWeek.length,
        openVulnerabilities: alerts.filter(a => a.state === "open").length
    };

    return result;
}

export const PrintAlertsMetrics = (category:string, alertsMetrics:AlertsMetrics): void => {
    for (const metric in alertsMetrics) {
        core.debug(`[🔎] ${category} - ${metric}: ` + alertsMetrics[metric as keyof AlertsMetrics]);
    }
}

export const CalculateMTTR = (alerts: any[], dateField: string, state: string):MTTRMetrics => {
    let alert_count = 0
    let total_time_to_remediate_seconds = 0

    for (const alert of alerts.filter(a => a.state === state)) {
        const fixedDate:number = Date.parse(alert[dateField]);
        const openDate:number = Date.parse(alert.created_at);

        const time_to_remediate = fixedDate - openDate;
        total_time_to_remediate_seconds += (time_to_remediate / 1000);
        alert_count += 1    
    }
    

    const result:MTTRMetrics = {
        mttr: alert_count === 0 ? 0 : (total_time_to_remediate_seconds/alert_count),
        count: alert_count
    };

    return result;
}

const FilterBetweenDates = (stringDate:string, minDate:number, maxDate:number): boolean => {
    const date:number = Date.parse(stringDate);
    return date >= minDate //&& date < maxDate
}