declare var hljs: typeof import('highlight.js').default;

interface SiteError {
    name: string;
    title: string;
    codeLang?: string;
    description?: string;
    codeBlockContent: string;
}

const ERRORS: SiteError[] = [
    {
        name: 'py-error',
        title: 'Unexpected Error',
        description: 'Python encountered a fatal error',
        codeBlockContent: `\
        # twitter access token
        TOKEN = '2Bf3418c515d7b378E98ef197'

        return App(token, config.url.href)
"""     ${'^'.repeat(34)}
AttributeError: 'SiteUser' object has no attribute 'googleAds'
"""`,
        codeLang: 'python',
    },
    {
        name: 'segfault',
        title: '',
        codeBlockContent: 'segmentation fault',
    },
    {
        name: 'js-error',
        title: '',
        codeBlockContent: `Error: ((![]) + [])[(+ (!(+ [])))] is not a function`,
    },
    {
        name: 'block-chain',
        title: 'Error connecting to blockchain',
        codeBlockContent: ``,
    },
];

const hashCode = (str: string) => {
    let hash = 0;
    let i: number;
    let chr: number;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

const handleError = (error: SiteError) => {
    document.body.dataset.error = error.name;

    const title = document.createElement('h1');
    title.innerHTML = error.title;

    const description = document.createElement('p');
    if (error.description) {
        description.innerText = error.description;
    }

    const codeBlock = document.createElement('pre');
    const code = document.createElement('code');
    // for some reason does not work with innerText
    // probably because innerText uses <br>?
    code.textContent = error.codeBlockContent;

    //* did not know that null coalescing worked with any falsy value!
    if (error.codeLang) {
        code.classList.add(`language-${error.codeLang}`);
    } else {
        code.classList.add(`no-highlight`);
    }

    codeBlock.appendChild(code);

    const container = document.createElement('div');
    container.classList.add('error-container');

    container.appendChild(title);
    container.appendChild(description);
    container.appendChild(codeBlock);

    hljs.highlightElement(code);

    return container;
};

const hash = hashCode(window.navigator.userAgent).toString();
const errorIdx = parseInt(hash[1]) % ERRORS.length;
const error = ERRORS[errorIdx];

document.body.appendChild(handleError(error));
