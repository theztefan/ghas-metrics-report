import * as core from "@actions/core";
import { Octokit } from "@octokit/action";
import { CodeScanningAlert } from "../types/common/main";
import { MyOctokit } from "./MyOctokit";

export const CodeScanningAlerts = async (
  owner: string,
  repository: string
): Promise<CodeScanningAlert[]> => {
  let res: Array<CodeScanningAlert> = [];
  try {
    const octokit = new MyOctokit();
    const iterator = await octokit.paginate(
      "GET /repos/{owner}/{repo}/code-scanning/alerts",
      {
        owner: owner,
        repo: repository,
        per_page: 100,
      },
      (response) => {
        return response.data;
      }
    );
    res = iterator as CodeScanningAlert[];
  } catch (error) {
    core.setFailed("There was an error. Please check the logs" + error);
  }
  return res;
};
