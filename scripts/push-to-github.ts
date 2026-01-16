// GitHub Integration - Push code to repository
import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

async function main() {
  const repoName = 'knx-smart-home';
  const description = 'KNX Smart Home Landing Page for namosistemos.lt';
  
  try {
    const octokit = await getUncachableGitHubClient();
    
    // Get authenticated user
    const { data: user } = await octokit.users.getAuthenticated();
    console.log(`Authenticated as: ${user.login}`);
    
    // Check if repo exists
    let repoExists = false;
    try {
      await octokit.repos.get({
        owner: user.login,
        repo: repoName
      });
      repoExists = true;
      console.log(`Repository ${repoName} already exists`);
    } catch (e: any) {
      if (e.status !== 404) throw e;
    }
    
    // Create repo if it doesn't exist
    if (!repoExists) {
      const { data: repo } = await octokit.repos.createForAuthenticatedUser({
        name: repoName,
        description,
        private: false,
        auto_init: false
      });
      console.log(`Created repository: ${repo.html_url}`);
    }
    
    console.log(`\n✅ Repository ready: https://github.com/${user.login}/${repoName}`);
    console.log(`\nTo push your code, run these commands in your terminal:`);
    console.log(`\n  git remote add github https://github.com/${user.login}/${repoName}.git`);
    console.log(`  git push github main`);
    console.log(`\nOr if 'github' remote already exists:`);
    console.log(`  git push github main --force`);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
