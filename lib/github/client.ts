/* ============================================================
 * GitHub API Client
 * Creates and exports an authenticated Octokit instance.
 * All GitHub operations should use this client.
 * ============================================================ */

import { Octokit } from '@octokit/rest';

/** GitHub configuration from environment variables */
export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  baseBranch: string;
}

/**
 * Reads GitHub configuration from environment variables.
 * Throws descriptive errors if required vars are missing.
 */
export function getGitHubConfig(): GitHubConfig {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;
  const baseBranch = process.env.GITHUB_BASE_BRANCH || 'main';

  if (!token) throw new Error('GITHUB_TOKEN environment variable is not set');
  if (!owner) throw new Error('GITHUB_REPO_OWNER environment variable is not set');
  if (!repo) throw new Error('GITHUB_REPO_NAME environment variable is not set');

  return { token, owner, repo, baseBranch };
}

/**
 * Creates an authenticated Octokit instance.
 */
export function createOctokitClient(config?: GitHubConfig): Octokit {
  const cfg = config || getGitHubConfig();
  return new Octokit({ auth: cfg.token });
}
