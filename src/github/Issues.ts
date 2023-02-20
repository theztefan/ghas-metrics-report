import { Issue } from "../types/common/main";
import { MyOctokit } from "./MyOctokit";

// export class to Issues class
export class Issues {
  private octokit = new MyOctokit();
  // async function to itterate over alerts and create issues excluding matching issues
  async createIssues(issues: Issue[]): Promise<number[]> {
    const res: number[] = [];
    // Expensive call to get all issues in order to filter out duplicates
    // TODO: Find a better way to do this!
    const all_issues = await this.getAllIssues(issues[0].owner, issues[0].repo);

    issues = issues.filter((issue) => {
      return !all_issues.find((i) => i.title === issue.title);
    });

    // itterate over alerts
    for (const issue of issues) {
      // create issue
      const issue_result = await this.octokit.rest.issues.create({
        owner: issue.owner,
        repo: issue.repo,
        title: issue.title,
        body: issue.body,
      });
      await this.octokit.rest.issues.addLabels({
        owner: issue.owner,
        repo: issue.repo,
        issue_number: issue_result.data.number,
        labels: issue.labels,
      });
      res.push(issue_result.data.number);
    }
    return res;
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
