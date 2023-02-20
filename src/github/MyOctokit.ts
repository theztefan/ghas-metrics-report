import { Octokit } from "@octokit/action";
import { throttling } from "@octokit/plugin-throttling";

export class MyOctokit extends Octokit {
  constructor() {
    super({
      baseUrl: process.env.GITHUB_API_URL ?? "https://api.github.com",
      auth: process.env.GITHUB_TOKEN,
      throttle: {
        onRateLimit: (retryAfter, options, octokit) => {
          octokit.log.warn(
            `Request quota exhausted for request ${options.method} ${options.url}`
          );
          if (options.request.retryCount <= 2) {
            console.log(`Retrying after ${retryAfter} seconds!`);
            return true;
          }
        },
        onSecondaryRateLimit: (retryAfter, options, octokit) => {
          octokit.log.warn(
            `Secondary rate limit for request ${options.method} ${options.url}`
          );
          if (options.request.retryCount <= 2) {
            console.log(
              `Secondary Limit - Retrying after ${retryAfter} seconds!`
            );
            return true;
          }
        },
      },
    });
  }
}
