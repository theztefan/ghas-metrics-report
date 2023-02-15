import * as core from "@actions/core";
import { Octokit } from "@octokit/action";
import {
  Issue
} from "../types/common/main";

// export class to Issues class
export class Issues {

    // async function to itterate over alerts and create issues
    
    async createIssues(issues: Issue[]) : Promise<Number[]>{
        let res: Number[] = [];
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
            res.push(issue_result.data.number)
   
        }
        return res;
    }

    // async function to create issue
    async createIssue(issue: Issue) {
        // create issue
        const octokit = new Octokit();
        const issue_report = await octokit.rest.issues.create({
            owner: issue.owner,
            repo: issue.repo,
            title: issue.title,
            body: issue.body,
        });
    }

} 