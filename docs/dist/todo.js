var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const removeAllChildren = (element) => {
    while (element.firstChild) {
        element.firstChild.remove();
    }
};
const filterOnlyNeededValues = (searchResponse) => ({
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
const GitHubSearchForKeyWord = (user, keyword) => __awaiter(void 0, void 0, void 0, function* () {
    const cacheKey = `${keyword},${user}`;
    const cachedStorage = localStorage.getItem(cacheKey);
    if (cachedStorage !== null) {
        try {
            return JSON.parse(cachedStorage);
        }
        catch (_a) {
            console.error('failed to parse cached value, clearing');
            localStorage.clear();
        }
    }
    const searchUrl = `https://api.github.com/search/code?q=${encodeURIComponent(`${keyword} user:${user}`)}`;
    const response = (yield (yield fetch(searchUrl)).json());
    if (response.incomplete_results) {
        console.warn('Warning: results may be incomplete, but I (the JavaScript runtime) do not know how to fix this');
    }
    try {
        localStorage.setItem(cacheKey, JSON.stringify(filterOnlyNeededValues(response)));
    }
    catch (e) {
        console.warn(`could not cache response with key ${cacheKey}`);
        console.error(e);
    }
    return response;
});
const createSearchResultDisplay = (searchResult) => {
    const searchResultContainer = document.createElement('div');
    const repositoryNameContainer = document.createElement('code');
    repositoryNameContainer.innerText = searchResult.repository.full_name;
    const fileNameContainer = document.createElement('a');
    fileNameContainer.innerText = searchResult.name;
    fileNameContainer.href = searchResult.html_url;
    searchResultContainer.append(repositoryNameContainer, ', in file ', fileNameContainer);
    return searchResultContainer;
};
const displayResults = (searchResults, resultContainer) => {
    const numResults = searchResults.items.length;
    const numUniqueRepos = Array.from(new Set(searchResults.items.map((r) => r.repository.full_name))).length;
    const numUniqueFiles = Array.from(new Set(searchResults.items.map((r) => r.path))).length;
    const resultSimpleMessage = `Found ${numResults} results across ${numUniqueRepos} repositories and ${numUniqueFiles} files`;
    const simpleMessageContainer = resultContainer.querySelector('#simple-message');
    simpleMessageContainer.innerText = resultSimpleMessage;
    const allResultsContainer = resultContainer.querySelector('#results');
    removeAllChildren(allResultsContainer);
    allResultsContainer.append(...searchResults.items.map((result) => createSearchResultDisplay(result)));
};
const filterResults = (searchResponse, repoFilterStr) => {
    const filterRepos = repoFilterStr.split(',').map((r) => r.trim());
    const newResponse = Object.assign(Object.assign({}, searchResponse), { items: searchResponse.items.filter((searchResult) => {
            const repositoryName = searchResult.repository.full_name.split('/')[1];
            const filteredOut = filterRepos.includes(repositoryName);
            return !filteredOut;
        }) });
    return newResponse;
};
const main = () => {
    const userNameInput = document.getElementById('user-input');
    const submitButton = document.getElementById('run-query');
    const clearCacheButton = document.getElementById('clear-cache');
    const resultsContainer = document.getElementById('results-container');
    const filterRepoInput = document.getElementById('ignore-repo');
    let lastResults = undefined;
    submitButton.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
        const userName = userNameInput.value;
        let response;
        try {
            response = yield GitHubSearchForKeyWord(userName, 'TODO');
        }
        catch (e) {
            console.error(e);
            alert(`Error encountered when trying to get results: ${e}`);
            throw e;
        }
        lastResults = response;
        displayResults(filterResults(response, filterRepoInput.value), resultsContainer);
    }));
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
//# sourceMappingURL=todo.js.map