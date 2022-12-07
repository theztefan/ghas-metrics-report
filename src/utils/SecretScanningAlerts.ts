import * as core from "@actions/core";
import { Octokit } from "@octokit/action";
import { SecretScanningAlert } from "../types/common/main";


export const SecretScanningAlerts  = async (owner: string, repository: string): Promise<SecretScanningAlert[]> => {
    let res: Array<SecretScanningAlert> = []
    try {
        const octokit = new Octokit();
        const iterator = await octokit.paginate('GET /repos/{owner}/{repo}/secret-scanning/alerts', {
            owner: owner,
            repo: repository,
            per_page: 100,
        },
            (response) => {
                return response.data
            }

        );
        res = iterator as SecretScanningAlert[];
    } catch (error) {
        core.setFailed(
            "There was an error. Please check the logs" + error
        );
    }
    return res
};
