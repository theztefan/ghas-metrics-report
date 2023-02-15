import { Octokit } from "@octokit/action";
import { Issue } from "../types/common/main";

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
      const octokit = new Octokit();
      const issue_result = await octokit.rest.issues.create({
        owner: issue.owner,
        repo: issue.repo,
        title: issue.title,
        body: issue.body,
      });
      res.push(issue_result.data.number);
    }
    return res;
  }

  // async function to create issue
  async createIssue(issue: Issue): Promise<number> {
    // create issue
    const octokit = new Octokit();
    const issue_report = await octokit.rest.issues.create({
      owner: issue.owner,
      repo: issue.repo,
      title: issue.title,
      body: issue.body,
    });
    return issue_report.data.number;
  }

  async getAllIssues(org: string, repo: string): Promise<any[]> {
    const octokit = new Octokit();
    const res = await octokit.rest.issues.listForRepo({
      owner: org,
      repo: repo,
      state: "open",
    });
    return res.data;
  }
}
