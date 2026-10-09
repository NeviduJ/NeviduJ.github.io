export async function getTopRepos(username: string) {
    try {
        const response = await fetch(
            `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
            {
                next: { revalidate: 3600 }, // Cache for 1 hour
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                },
            }
        );

        if (!response.ok) {
            console.error('GitHub API error:', response.status);
            return [];
        }

        const repos = await response.json();

        // GitHub's popular repos prioritize recent activity heavily
        // when stars/forks are similar (or all zero)
        const scoredRepos = repos
            .filter((repo: any) =>
                !repo.fork &&
                !repo.private &&
                repo.name !== 'NeviduJ.github.io' // Exclude website repo
            )
            .map((repo: any) => {
                const daysSinceUpdate = Math.floor(
                    (Date.now() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24)
                );
                // Higher recency score for more recent updates
                const recencyScore = Math.max(0, 180 - daysSinceUpdate); // Decay over 180 days

                // When most repos have 0 stars/forks, prioritize recency heavily
                // Weighted score: stars (20%) + forks (10%) + recency (70%)
                const popularityScore =
                    (repo.stargazers_count * 20) +
                    (repo.forks_count * 10) +
                    recencyScore;

                return { ...repo, popularityScore };
            })
            .sort((a: any, b: any) => b.popularityScore - a.popularityScore);

        // Add diversity - limit repos with similar prefixes (e.g., MLB-)
        const diverseRepos: any[] = [];
        const prefixCount: { [key: string]: number } = {};

        for (const repo of scoredRepos) {
            // Extract prefix (e.g., "MLB" from "MLB-Score-Predictor")
            const prefix = repo.name.split('-')[0];

            // Limit to 1 repo per prefix for diversity
            if (!prefixCount[prefix] || prefixCount[prefix] < 1) {
                diverseRepos.push(repo);
                prefixCount[prefix] = (prefixCount[prefix] || 0) + 1;
            }

            if (diverseRepos.length >= 6) break;
        }

        return diverseRepos;
    } catch (error) {
        console.error('Error fetching GitHub repos:', error);
        return [];
    }
}
