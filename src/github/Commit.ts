import * as core from "@actions/core";
import { Octokit } from "@octokit/action";
import { MyOctokit } from "./MyOctokit";

export const GetCommitDate = async (
  owner: string,
  repository: string,
  alerts: unknown[],
  commitShaField: string
): Promise<unknown[]> => {
  try {
    for (const alert of alerts) {
      const commitsSha: string[] | string = commitShaField
        .split(".")
        .filter((s) => s)
        .reduce((acc, val) => acc && acc[val], alert) as string[] | string;

      if (commitsSha instanceof Array) {
        for (const commitSha of commitsSha) {
          const commitData = await GetCommitData(owner, repository, commitSha);
          if (
            !alert["commitDate"] ||
            commitData.commit.author.date < alert["commitDate"]
          ) {
            alert["commitDate"] = commitData.commit.author.date;
          }
        }
      } else {
        const commitData = await GetCommitData(owner, repository, commitsSha);
        alert["commitDate"] = commitData.commit.author.date;
      }
    }
  } catch (error) {
    core.setFailed("There was an error. Please check the logs" + error);
  }

  return alerts;
};

export const GetCommitData = async (
  owner: string,
  repository: string,
  commitSha: string
): Promise<{ commit: { author: { date: string } } }> => {
  const octokit = new MyOctokit();

  const { data: commitData } = await octokit.request(
    "GET /repos/{owner}/{repo}/commits/{commitSha}",
    {
      owner: owner,
      repo: repository,
      commitSha: commitSha,
      per_page: 100,
    }
  );

  return commitData;
};
