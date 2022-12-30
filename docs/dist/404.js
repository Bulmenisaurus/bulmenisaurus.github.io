"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let additionalMessage = [];
let candidateEmoji = [
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
const messageElem = document.getElementById('404-message');
messageElem.innerText += additionalMessage.join('');
const repositoryFile = (owner, repo) => __awaiter(void 0, void 0, void 0, function* () {
    // https://stackoverflow.com/questions/25022016/get-all-file-names-from-a-github-repo-through-the-github-api
    const repsonse = yield fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`);
    return repsonse.json();
});
// https://stackoverflow.com/a/36566052/13996389
const similarity = (s1, s2) => {
    const [shorter, longer] = [s1, s2].sort((a, b) => a.length - b.length);
    if (longer.length == 0) {
        return 1.0;
    }
    const editDistance = (s1, s2) => {
        var costs = new Array();
        for (var i = 0; i <= s1.length; i++) {
            var lastValue = i;
            for (var j = 0; j <= s2.length; j++) {
                if (i == 0)
                    costs[j] = j;
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
            if (i > 0)
                costs[s2.length] = lastValue;
        }
        return costs[s2.length];
    };
    return ((longer.length - editDistance(longer.toLowerCase(), shorter.toLowerCase())) / longer.length);
};
const mostSimilarSitePage = (pathname) => __awaiter(void 0, void 0, void 0, function* () {
    const pages = (yield repositoryFile('Bulmenisaurus', 'bulmenisaurus.github.io')).tree
        .filter((file) => file.path.endsWith('.html'))
        .map((file) => file.path.split('.').slice(0, -1).join('.'))
        .sort((a, b) => similarity(a, pathname) - similarity(b, pathname))
        .reverse();
    return { pathname: pages[0], similarity: similarity(pages[0], pathname) };
});
const displayReccomenedUrl = () => __awaiter(void 0, void 0, void 0, function* () {
    const recommendedUrl = yield mostSimilarSitePage(window.location.pathname);
    if (recommendedUrl.similarity > 0.6) {
        const textbox = `<p id="recommended-url">Did you mean <code><a href="${recommendedUrl.pathname}">${recommendedUrl.pathname}</a></code>?<p>`;
        document.body.innerHTML += textbox;
    }
});
displayReccomenedUrl();
//# sourceMappingURL=404.js.map