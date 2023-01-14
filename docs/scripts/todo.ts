const removeAllChildren = (element: Node) => {
    while (element.firstChild) {
        element.firstChild.remove();
    }
};

interface GitHubSearchResponse {
    incomplete_results: boolean;
    items: {
        name: string;
        path: string;
        html_url: string;
        repository: {
            full_name: string;
        };
    }[];
}

const filterOnlyNeededValues = (searchResponse: GitHubSearchResponse): GitHubSearchResponse => ({
    incomplete_results: searchResponse.incomplete_results,
    items: searchResponse.items.map((item) => ({
        name: item.name,
        path: item.path,
        html_url: item.html_url,
        repository: {
            full_name: item.repository.full_name,
        },
    })),
});

// https://docs.github.com/en/rest/search?apiVersion=2022-11-28
const GitHubSearchForKeyWord = async (
    user: string,
    keyword: string
): Promise<GitHubSearchResponse> => {
    const cacheKey = `${keyword},${user}`;
    const cachedStorage = localStorage.getItem(cacheKey);

    if (cachedStorage !== null) {
        try {
            return JSON.parse(cachedStorage);
        } catch {
            console.error('failed to parse cached value, clearing');
            localStorage.clear();
        }
    }

    const searchUrl = `https://api.github.com/search/code?q=${encodeURIComponent(
        `${keyword} user:${user}`
    )}`;

    const response = (await (await fetch(searchUrl)).json()) as GitHubSearchResponse;

    if (response.incomplete_results) {
        console.warn(
            'Warning: results may be incomplete, but I (the JavaScript runtime) do not know how to fix this'
        );
    }

    try {
        localStorage.setItem(cacheKey, JSON.stringify(filterOnlyNeededValues(response)));
    } catch (e) {
        console.warn(`could not cache response with key ${cacheKey}`);
        console.error(e);
    }

    return response;
};

const createSearchResultDisplay = (
    searchResult: GitHubSearchResponse['items'][number]
): HTMLDivElement => {
    const searchResultContainer = document.createElement('div');

    const repositoryNameContainer = document.createElement('code');
    repositoryNameContainer.innerText = searchResult.repository.full_name;

    const fileNameContainer = document.createElement('a');
    fileNameContainer.innerText = searchResult.name;
    fileNameContainer.href = searchResult.html_url;

    searchResultContainer.append(repositoryNameContainer, ', in file ', fileNameContainer);

    return searchResultContainer;
};

const displayResults = (searchResults: GitHubSearchResponse, resultContainer: HTMLDivElement) => {
    const numResults = searchResults.items.length;
    const numUniqueRepos = Array.from(
        new Set(searchResults.items.map((r) => r.repository.full_name))
    ).length;
    const numUniqueFiles = Array.from(new Set(searchResults.items.map((r) => r.path))).length;
    const resultSimpleMessage = `Found ${numResults} results across ${numUniqueRepos} repositories and ${numUniqueFiles} files`;
    const simpleMessageContainer = resultContainer.querySelector(
        '#simple-message'
    ) as HTMLDivElement;
    simpleMessageContainer.innerText = resultSimpleMessage;

    const allResultsContainer = resultContainer.querySelector('#results') as HTMLDivElement;

    removeAllChildren(allResultsContainer);
    allResultsContainer.append(
        ...searchResults.items.map((result) => createSearchResultDisplay(result))
    );
};

const filterResults = (
    searchResponse: GitHubSearchResponse,
    repoFilterStr: string
): GitHubSearchResponse => {
    const filterRepos = repoFilterStr.split(',').map((r) => r.trim());

    const newResponse: GitHubSearchResponse = {
        ...searchResponse,
        items: searchResponse.items.filter((searchResult) => {
            const repositoryName = searchResult.repository.full_name.split('/')[1];

            const filteredOut = filterRepos.includes(repositoryName);

            return !filteredOut;
        }),
    };

    return newResponse;
};

const main = () => {
    const userNameInput = document.getElementById('user-input') as HTMLInputElement;
    const submitButton = document.getElementById('run-query') as HTMLButtonElement;
    const clearCacheButton = document.getElementById('clear-cache') as HTMLButtonElement;
    const resultsContainer = document.getElementById('results-container') as HTMLDivElement;
    const filterRepoInput = document.getElementById('ignore-repo') as HTMLInputElement;

    let lastResults: GitHubSearchResponse | undefined = undefined;

    submitButton.addEventListener('click', async () => {
        const userName = userNameInput.value;

        let response: GitHubSearchResponse;
        try {
            response = await GitHubSearchForKeyWord(userName, 'TODO');
        } catch (e) {
            console.error(e);
            alert(`Error encountered when trying to get results: ${e}`);
            throw e;
        }

        lastResults = response;
        displayResults(filterResults(response, filterRepoInput.value), resultsContainer);
    });

    clearCacheButton.addEventListener('click', () => localStorage.clear());

    filterRepoInput.addEventListener('input', () => {
        if (lastResults === undefined) {
            return;
        }

        displayResults(filterResults(lastResults, filterRepoInput.value), resultsContainer);
    });
};

main();

export {};
