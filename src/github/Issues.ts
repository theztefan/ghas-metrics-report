import { Octokit } from "@octokit/action";
import { Issue } from "../types/common/main";
import { Octokit as Core } from "@octokit/core";
import { throttling } from "@octokit/plugin-throttling";
import { retry } from "@octokit/plugin-retry";
import { MyOctokit } from "./MyOctokit";
// export const PluggedOctokit = Octokit.plugin(retry, throttling);
// export const octokit = new PluggedOctokit({
//   throttle: {
//     onRateLimit: (retryAfter, options) => {
//       octokit.log.warn(
//         `Request quota exhausted for request ${options.method} ${options.url}`
//       );
//     },
//     onAbuseLimit: (retryAfter, options) => {
//       // does not retry, only logs a warning
//       octokit.log.warn(
//         `Abuse detected for request ${options.method} ${options.url}`
//       );
//     },
//     onSecondaryRateLimit: (retryAfter, options) => {
//       octokit.log.warn(
//         `Secondary rate limit for request ${options.method} ${options.url}`
//       );
//     },

//   },
//   retry: {
//     doNotRetry: [403, 404, 422],
//   },
// });

// export class to Issues class
export class Issues {
  // async function to itterate over alerts and create issues excluding matching issues
  async createIssues(issues: Issue[]): Promise<number[]> {
    const res: number[] = [];
    const all_issues = await this.getAllIssues(issues[0].owner, issues[0].repo);

    issues = issues.filter((issue) => {
      return !all_issues.find((i) => i.title === issue.title);
    });

    // itterate over alerts
    for (const issue of issues) {
      // create issue
      const octokit = new MyOctokit();
      const issue_result = await octokit.rest.issues.create({
        owner: issue.owner,
        repo: issue.repo,
        title: issue.title,
        body: issue.body,
      });
      await octokit.rest.issues.addLabels({
        owner: issue.owner,
        repo: issue.repo,
        issue_number: issue_result.data.number,
        labels: issue.labels,
      });
      res.push(issue_result.data.number);
    }
    return res;
  }

  // async function to create issue
  async createIssue(issue: Issue): Promise<number> {
    // create issue
    const octokit = new MyOctokit();

    const issue_report = await octokit.rest.issues.create({
      owner: issue.owner,
      repo: issue.repo,
      title: issue.title,
      body: issue.body,
    });
    return issue_report.data.number;
  }

  async getAllIssues(org: string, repo: string): Promise<any[]> {
    const octokit = new MyOctokit();
    const res = await octokit.rest.issues.listForRepo({
      owner: org,
      repo: repo,
      state: "open",
    });
    return res.data;
  }
}
