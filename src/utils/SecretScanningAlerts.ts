import * as core from "@actions/core";
import { Octokit } from "@octokit/action";
import { readFile } from "fs/promises";


export const SecretScanningAlerts = async (owner: string, repository: string): Promise<void> => {
    try {
        const octokit = new Octokit();
        let response = await octokit.request('GET /repos/{owner}/{repo}/secret-scanning/alerts', {
            owner: owner,
            repo: repository
          })
        console.log(
            `Alerts` + JSON.stringify(response)
        );
        
    } catch (error) {
        console.log(error);
        core.setFailed(
            "There was an erron. Please check the logs"
        );
    }
};
