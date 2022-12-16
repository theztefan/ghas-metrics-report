# GitHub Advanced Security - Metrics Report Action

## Introduction

A GitHub Action for generating scheduled reports for GitHub Advanced Security alerts.

The action is currently intended to be used on a repository level. The way to setup is adding a new Actions workflow file that runs this action on a scheduled interval once a day. 

This action will generate GHAS Metric report for the previous day. The report is generated in the form of a JSON file which we upload as an Action run artifact. Additionally it prints the summarized report as an Action run Summary.

The report will include the following metrics for Dependabot, Code Scanning and Secret scanning:
- Open alerts
- Fixed alerts yesterday
- Fixed alerts in the past 7 days
- Total MTTR (Mean Time To Remediate)

## Usage

This action uses the GitHub API and requires a GitHub access token. The suggested way to do it is by using `peter-murray/workflow-application-token-action@v2`. Follow the [steps described](https://github.com/peter-murray/workflow-application-token-action#creating-a-github-application) in the README of the action to set up a GitHub App and use it with the Action. 

Official documentation on how to create a GitHub App can also be found on: [Creating a GitHub App](https://docs.github.com/en/developers/apps/creating-a-github-app)

Invoking GHAS Metrics Report action is as simple as:

```yaml
  - name: Generate GHAS Metrics Report
        uses: theztefan/ghas-metric-report
        env:
          GITHUB_TOKEN: ${{ steps.get_workflow_token.outputs.token }}
        with:
          repo: "Repo-name"
          org: "Organization-name"
          features: "dependabot, code-scanning, secret-scanning" # comma separated list of features.
```


### Example workflow using the action

```yaml
name: "GitHub Advanced Security - Metrics Report Action"
on:
  schedule:
    - cron: "30 5 * * *" # Run every day at 5.30

jobs:
  ghas-metrics-report:
    name: GitHub Advanced Security - Metrics Report Action
    runs-on: ubuntu-20.04
    steps:
      - name: Git Checkout
        uses: actions/checkout@v3
        with:
          path: ghas-metrics-report
      - name: Get Token
        id: get_workflow_token
        uses: peter-murray/workflow-application-token-action@v2
        with:
          application_id: ${{ secrets.APPLICATION_ID }}
          application_private_key: ${{ secrets.APPLICATION_PRIVATE_KEY }}
      - name: Generate GHAS Metrics Report
        uses: theztefan/ghas-metrics-report
        env:
          GITHUB_TOKEN: ${{ steps.get_workflow_token.outputs.token }}
        with:
          repo: "ghas-metrics-report"
          org: "advanced-security-demo"
          features: "dependabot, code-scanning, secret-scanning"
      - name: Upload GHAS metrics report as artifact
        uses: actions/upload-artifact@v3
        with:
          name: ghas-metrics-report
          path: ghas-metrics-report/dist/report.json
```

### Available option

Currently the action supports the following configuration options:
- `repo` - The name of the repository to generate the report for. This is a required field.
-  `org` - The name of the organization to generate the report for. This is a required field.
-  `features` - A comma separated list of features to generate the report for. This is a required field. The supported values are: `dependabot`, `code-scanning` and `secret-scanning`.

### Output
![Sample report output](ghas-metrics-report-sample-summary.png)


## Contrubting

- Create an issue to the repo with suggestions and bugs
- Raise a pull request :) 
