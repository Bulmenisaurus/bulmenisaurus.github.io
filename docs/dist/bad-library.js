"use strict";
//! LIBRARY
// utils
const merge = (source, target) => {
    Object.keys(source).forEach((key) => {
        if (typeof source[key] === 'object') {
            target[key] = {};
            merge(source[key], target[key]);
        }
        else {
            target[key] = source[key];
        }
    });
};
// rest of library
document.createElement('a');
const _elementFactory = (name) => {
    return (options = {}) => {
        const elem = document.createElement(name);
        try {
            merge(options, elem);
        }
        catch (e) {
            console.error(`Error assigning props: ${e}`);
        }
        return (...args) => {
            elem.append(...args);
            if (options && 'onrender' in options && typeof options.onrender === 'function') {
                options.onrender(elem);
            }
            return elem;
        };
    };
};
const aElem = _elementFactory('a');
const abbrElem = _elementFactory('abbr');
const addressElem = _elementFactory('address');
const areaElem = _elementFactory('area');
const articleElem = _elementFactory('article');
const asideElem = _elementFactory('aside');
const audioElem = _elementFactory('audio');
const bElem = _elementFactory('b');
const baseElem = _elementFactory('base');
const bdiElem = _elementFactory('bdi');
const bdoElem = _elementFactory('bdo');
const blockquoteElem = _elementFactory('blockquote');
const bodyElem = _elementFactory('body');
const brElem = _elementFactory('br');
const buttonElem = _elementFactory('button');
const canvasElem = _elementFactory('canvas');
const captionElem = _elementFactory('caption');
const citeElem = _elementFactory('cite');
const codeElem = _elementFactory('code');
const colElem = _elementFactory('col');
const colgroupElem = _elementFactory('colgroup');
const dataElem = _elementFactory('data');
const datalistElem = _elementFactory('datalist');
const ddElem = _elementFactory('dd');
const delElem = _elementFactory('del');
const detailsElem = _elementFactory('details');
const dfnElem = _elementFactory('dfn');
const dialogElem = _elementFactory('dialog');
const dirElem = _elementFactory('dir');
const divElem = _elementFactory('div');
const dlElem = _elementFactory('dl');
const dtElem = _elementFactory('dt');
const emElem = _elementFactory('em');
const embedElem = _elementFactory('embed');
const fieldsetElem = _elementFactory('fieldset');
const figcaptionElem = _elementFactory('figcaption');
const figureElem = _elementFactory('figure');
const fontElem = _elementFactory('font');
const footerElem = _elementFactory('footer');
const formElem = _elementFactory('form');
const frameElem = _elementFactory('frame');
const framesetElem = _elementFactory('frameset');
const h1Elem = _elementFactory('h1');
const h2Elem = _elementFactory('h2');
const h3Elem = _elementFactory('h3');
const h4Elem = _elementFactory('h4');
const h5Elem = _elementFactory('h5');
const h6Elem = _elementFactory('h6');
const headElem = _elementFactory('head');
const headerElem = _elementFactory('header');
const hgroupElem = _elementFactory('hgroup');
const hrElem = _elementFactory('hr');
const htmlElem = _elementFactory('html');
const iElem = _elementFactory('i');
const iframeElem = _elementFactory('iframe');
const imgElem = _elementFactory('img');
const inputElem = _elementFactory('input');
const insElem = _elementFactory('ins');
const kbdElem = _elementFactory('kbd');
const labelElem = _elementFactory('label');
const legendElem = _elementFactory('legend');
const liElem = _elementFactory('li');
const linkElem = _elementFactory('link');
const mainElem = _elementFactory('main');
const mapElem = _elementFactory('map');
const markElem = _elementFactory('mark');
const marqueeElem = _elementFactory('marquee');
const menuElem = _elementFactory('menu');
const metaElem = _elementFactory('meta');
const meterElem = _elementFactory('meter');
const navElem = _elementFactory('nav');
const noscriptElem = _elementFactory('noscript');
const objectElem = _elementFactory('object');
const olElem = _elementFactory('ol');
const optgroupElem = _elementFactory('optgroup');
const optionElem = _elementFactory('option');
const outputElem = _elementFactory('output');
const pElem = _elementFactory('p');
const paramElem = _elementFactory('param');
const pictureElem = _elementFactory('picture');
const preElem = _elementFactory('pre');
const progressElem = _elementFactory('progress');
const qElem = _elementFactory('q');
const rpElem = _elementFactory('rp');
const rtElem = _elementFactory('rt');
const rubyElem = _elementFactory('ruby');
const sElem = _elementFactory('s');
const sampElem = _elementFactory('samp');
const scriptElem = _elementFactory('script');
const sectionElem = _elementFactory('section');
const selectElem = _elementFactory('select');
const slotElem = _elementFactory('slot');
const smallElem = _elementFactory('small');
const sourceElem = _elementFactory('source');
const spanElem = _elementFactory('span');
const strongElem = _elementFactory('strong');
const styleElem = _elementFactory('style');
const subElem = _elementFactory('sub');
const summaryElem = _elementFactory('summary');
const supElem = _elementFactory('sup');
const tableElem = _elementFactory('table');
const tbodyElem = _elementFactory('tbody');
const tdElem = _elementFactory('td');
const templateElem = _elementFactory('template');
const textareaElem = _elementFactory('textarea');
const tfootElem = _elementFactory('tfoot');
const thElem = _elementFactory('th');
const theadElem = _elementFactory('thead');
const timeElem = _elementFactory('time');
const titleElem = _elementFactory('title');
const trElem = _elementFactory('tr');
const trackElem = _elementFactory('track');
const uElem = _elementFactory('u');
const ulElem = _elementFactory('ul');
const varElem = _elementFactory('var');
const videoElem = _elementFactory('video');
const wbrElem = _elementFactory('wbr');
const e = _elementFactory;
const body = (...elements) => {
    document.body.append(...elements);
};
const define = (defaultProps, renderFunction) => {
    return (options = {}) => {
        return (...args) => {
            // in-place merge is a little wonky :/
            merge(options, defaultProps);
            return renderFunction(defaultProps, args);
        };
    };
};
//! LIBRARY END
const dedent = (text) => {
    const value = text.raw.join('').trimEnd();
    const lines = value.split('\n');
    if (lines[0].trim() === '')
        lines.shift();
    let smallestIndent = undefined;
    for (const line of lines) {
        let indent = line.length - line.trimStart().length;
        if (smallestIndent === undefined || indent < smallestIndent) {
            smallestIndent = indent;
        }
    }
    if (smallestIndent === undefined)
        return value;
    return lines.map((l) => l.slice(smallestIndent)).join('\n');
};
const main = () => {
    const codeBlock = define({ lang: 'javascript' }, (props, children) => {
        return preElem()(codeElem({
            className: `language-${props.lang}`,
            style: { whiteSpace: '' },
            onrender: (e) => {
                hljs.highlightElement(e);
            },
        })(...children));
    });
    const tip = define({}, (props, children) => {
        return divElem({ className: 'tip' })(pElem({ className: 'tip-header' })('Tip'), pElem()(...children));
    });
    const marquee = define({}, (props, children) => {
        return divElem({ className: 'marquee-container', style: {} })(divElem({ className: 'marquee' })(...children));
    });
    body(h1Elem({ style: { fontWeight: 'bold' } })('Hello, World'), pElem()('bad-library.js is a bad library for making bad things! Here is the code for this page, for example: '), codeBlock()(main.toString()), pElem()('Everything starts with the ', codeElem()('body'), ' function, which is the entrypoint for your program'), codeBlock()(dedent `
        body(
            h1Elem()("Hello, World!")
        )`), tip()('You could just use ', codeElem()('document.body.append'), ", but it's a bad practice."), pElem()('Using html elements is simple as well! To find the function name you need,'), olElem()(liElem()('Find out the name of the element you want to use'), liElem()('Stick ', codeElem()('-elem'), ' on to the end'), liElem()('done!')), pElem()('To use your function, first call it with your attributes (such as style, href, etc)'), tip()("If you don't have any properties you can pass in an empty object or nothing at all, such as ", codeElem()('divElem()("don\'t look!")')), pElem()("Then, call the result of that with the content that the element has. This can be strings or other elements. Don't forget to separate it with commas! Here is an example:"), codeElem()("divElem({style: {color: 'red'}})('foo', strongElem()('bar'), emElem({style: {color: 'blue'}})('baz'))"), pElem()('This results in', divElem({ style: { color: 'red' } })('foo', strongElem()('bar'), emElem({ style: { color: 'blue' } })('baz'))), marquee()('And thats all for today folks!'));
};
main();
//# sourceMappingURL=bad-library.js.map