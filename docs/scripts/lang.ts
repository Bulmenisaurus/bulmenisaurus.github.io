const codeInput = document.getElementsByTagName('textarea')[0];
const runCodeButton = document.getElementsByTagName('button')[0];

interface Variable {
    type: 'string';
    value: string;
}

runCodeButton.onclick = () => {
    runCode(codeInput.value);
};

class LangConsole {
    private output: HTMLDivElement;

    constructor() {
        this.output = <HTMLDivElement>document.getElementById('output');
    }

    print(thing: string, newline = true) {
        const printContainer = document.createElement('div');
        printContainer.innerText = thing + (newline ? '\n' : '');

        this.output.appendChild(printContainer);
    }

    error(error: string) {
        const errContainer = document.createElement('div');

        errContainer.innerText = error;
        errContainer.classList.add('error');

        this.output.appendChild(errContainer);
    }

    clear() {
        this.output.innerText = '';
    }
}

const langConsole = new LangConsole();

const runCode = (code: string) => {
    langConsole.clear();
    const lines = code.split(';').map((l) => l.trim());
    const variables: { [key: string]: Variable } = {};

    lines.forEach((i) => {
        const tokens = i.split(' ');

        if (tokens.length <= 1) return;

        const [name, ...args] = tokens;

        handleInstruction(name.toLowerCase(), args, variables, langConsole);
    });
};

const formatStr = (str: string, variables: { [key: string]: Variable }) => {
    // TODO: make this not work if there is a backslash

    // + means just "{}" is ignored
    const variableInterpolationRegex = /\{(\w+)\}/;

    return str.replace(variableInterpolationRegex, (substring: string, ...args) => {
        const varName = <string>args[0];

        const variable = variables[varName];

        if (!variable) {
            debugger;
            langConsole.error(`could not find variable ${varName}`);
            return substring;
        }

        return variable.value;
    });
};

const handleInstruction = (
    name: string,
    instructionArguments: string[],
    variables: { [key: string]: Variable },
    langConsole: LangConsole
) => {
    if (name === 'print') {
        langConsole.print(instructionArguments.join(' '));
    } else if (name === 'printf') {
        const res = formatStr(instructionArguments.join(' '), variables);

        langConsole.print(res);
    } else if (name === '#') {
        return;
    } else if (name === 'set') {
        if (instructionArguments.length < 1) {
            langConsole.print('provide variable name pls');
        }

        variables[instructionArguments[0]] = {
            type: 'string',
            value: instructionArguments.slice(1).join(' '),
        };
    } else {
        langConsole.error(`Unknown instruction: \`${name}\``);
    }
};
