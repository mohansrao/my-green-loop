import { createRepository, getAuthenticatedUser } from '../server/github';

async function main() {
  try {
    console.log('Getting authenticated user...');
    const user = await getAuthenticatedUser();
    console.log(`Authenticated as: ${user.login}`);
    
    const repoName = 'my-green-loop';
    const description = 'Eco-friendly dining rental service - sustainable tableware rentals for events';
    
    console.log(`Creating repository: ${repoName}...`);
    const repo = await createRepository(repoName, description, false);
    
    console.log('Repository created successfully!');
    console.log(`URL: ${repo.html_url}`);
    console.log(`Clone URL: ${repo.clone_url}`);
    console.log(`\nTo push your code, run:`);
    console.log(`git remote add origin ${repo.clone_url}`);
    console.log(`git push -u origin main`);
    
    return repo;
  } catch (error: any) {
    if (error.status === 422) {
      console.log('Repository may already exist. Getting user info...');
      const user = await getAuthenticatedUser();
      console.log(`Check: https://github.com/${user.login}/my-green-loop`);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}

main();
