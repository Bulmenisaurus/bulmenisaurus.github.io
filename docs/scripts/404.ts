let additionalMessage: string[] = [];
let candidateEmoji: string[] = [
    '🥲',
    '😔',
    '☹️',
    '🥺',
    '🥹',
    '😓',
    '😞',
    '😖',
    '😭',
    '😢',
    '😥',
    '😟',
    '👌',
    '🤯',
    '😶‍🌫️',
    '😏',
    '🤨',
];

for (let i = 0; i < Math.random() * 10; i++) {
    let randomEmoji = candidateEmoji[Math.floor(Math.random() * candidateEmoji.length)];
    additionalMessage.push(randomEmoji);
}

const messageElem = document.getElementById('404-message')!;

messageElem.innerText += additionalMessage.join('');

/* getting the "did you mean foo" section
Steps:

1. get all the github files using github api
2. filter out all the HTML files
3. M̶a̶k̶e̶ Copt a str simiarity function that uses levenshtein distance
4. Sort files by their relevancy by comparing similarity between current path and files
5. Find most likely of these files, make sure it is above a certain thereshold
6. Create a <div> or some textbox saying the suggested url
*/

interface GithubFile {
    path: string;
    mode: string;
    type: string;
    size: number;
    url: string;
}

interface GithubTree {
    sha: string;
    url: string;
    tree: GithubFile[];
}

const repositoryFile = async (owner: string, repo: string) => {
    // https://stackoverflow.com/questions/25022016/get-all-file-names-from-a-github-repo-through-the-github-api
    const repsonse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`
    );
    return <Promise<GithubTree>>repsonse.json();
};

// https://stackoverflow.com/a/36566052/13996389

const similarity = (s1: string, s2: string): number => {
    const [shorter, longer] = [s1, s2].sort((a, b) => a.length - b.length);

    if (longer.length == 0) {
        return 1.0;
    }

    const editDistance = (s1: string, s2: string) => {
        var costs = new Array();
        for (var i = 0; i <= s1.length; i++) {
            var lastValue = i;
            for (var j = 0; j <= s2.length; j++) {
                if (i == 0) costs[j] = j;
                else {
                    if (j > 0) {
                        var newValue = costs[j - 1];
                        if (s1.charAt(i - 1) != s2.charAt(j - 1))
                            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
            }
            if (i > 0) costs[s2.length] = lastValue;
        }
        return costs[s2.length];
    };

    return (
        (longer.length - editDistance(longer.toLowerCase(), shorter.toLowerCase())) / longer.length
    );
};

const mostSimilarSitePage = async (pathname: string) => {
    const pages = (await repositoryFile('Bulmenisaurus', 'bulmenisaurus.github.io')).tree
        .filter((file) => file.path.endsWith('.html'))
        .map((file) => file.path.split('.').slice(0, -1).join('.'))
        .sort((a, b) => similarity(a, pathname) - similarity(b, pathname))
        .reverse();

    return { pathname: pages[0], similarity: similarity(pages[0], pathname) };
};

const displayReccomenedUrl = async () => {
    const recommendedUrl = await mostSimilarSitePage(window.location.pathname);

    if (recommendedUrl.similarity > 0.6) {
        const textbox = `<p id="recommended-url">Did you mean <code><a href="${recommendedUrl.pathname}">${recommendedUrl.pathname}</a></code>?<p>`;
        document.body.innerHTML += textbox;
    }
};

displayReccomenedUrl();
