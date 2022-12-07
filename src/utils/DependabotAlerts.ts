import * as core from "@actions/core";
import { Octokit } from "@octokit/action";
import { DependancyAlert } from "../types/common/main";


export const DependabotAlerts  = async (owner: string, repository: string): Promise<DependancyAlert[]> => {
    let res: Array<DependancyAlert> = []
    try {
        const octokit = new Octokit();
        const iterator = await octokit.paginate('GET /repos/{owner}/{repo}/dependabot/alerts', {
            owner: owner,
            repo: repository,
            per_page: 100,
        },
            (response) => {
                return response.data
            }

        );
        res = iterator as DependancyAlert[];
    } catch (error) {
        core.setFailed(
            "There was an error. Please check the logs" + error
        );
    }
    return res
};
