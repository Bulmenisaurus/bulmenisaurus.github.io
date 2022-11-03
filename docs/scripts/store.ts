let urlHidden: string = '';

// reloads iframe because for some reason the iframe contents are kept through reloads
// even though the src is different. Bug? Probably!
// @ts-ignore
document.querySelector('#preview-iframe').src = document.querySelector('#preview-iframe').src;

const listToQuery = (formData: string[]) => {
    return formData
        .map((x) => `${encodeURIComponent(x[0]) || 1}=${encodeURIComponent(x[1]) || ''}`)
        .join('&');
};

function generateFormLink() {
    const form = document.getElementById('card-form') as HTMLFormElement;
    let formData = new FormData(form);
    //@ts-ignore
    let parsedFormData = listToQuery([...(formData.entries() as string[])]);

    const url = 'https://bulmenisaurus.github.io/storeresult?' + parsedFormData;
    return url;
}

function updateLink() {
    const url = generateFormLink();
    const hideLinkUrl = new URL(url);
    // Maybe I should just do url + '&hide=true'....
    hideLinkUrl.searchParams.set('hide', 'true');
    urlHidden = hideLinkUrl.toString();

    document.getElementById('link-preview')!.innerText = url;
    (document.querySelector('#copy-link-input') as HTMLInputElement).value = url;
}

function copyLink() {
    const copyInput = document.querySelector('#copy-link-input') as HTMLInputElement;

    /* Select the text field */
    copyInput.select();
    copyInput.setSelectionRange(0, 999);

    document.execCommand('copy');
}

/* Modal section */
const modal = document.querySelector('#modal-preview') as HTMLElement;
const modalClose = document.querySelector('#close-preview') as HTMLElement;
const modalTrigger = document.querySelector('#open-preview') as HTMLButtonElement;

modalTrigger.onclick = function () {
    (document.getElementById('preview-iframe') as HTMLIFrameElement).src = urlHidden;
    document.getElementById('preview-iframe')!.addEventListener(
        'load',
        () => {
            modal.style.display = 'block';
            modal.setAttribute('aria-hidden', 'false');
            (document.getElementById('preview-iframe') as HTMLIFrameElement).contentWindow!.focus();
        },
        { once: true }
    );
};

modalClose.onclick = function () {
    modal.style.display = 'none';
    (document.getElementById('preview-iframe') as HTMLIFrameElement).src = '';
    modal.setAttribute('aria-hidden', 'true');
};

const updateLen = function () {
    const length = (document.querySelector('#text') as HTMLInputElement).value.length;
    (document.querySelector('#chars-left') as HTMLElement).innerHTML = `(${length}/150)`;
};

updateLen();
updateLink();
modal.style.display = 'none';

document.querySelector('#text')!.addEventListener('keyup', updateLen);
document.querySelector('#text')!.addEventListener('keydown', updateLen);
/*
document.getElementById('choose-image').addEventListener('click', function chooseImage() {
    const imageUrl = prompt('Enter your image url here:', 'https://');
    if (checkImage(imageUrl)) {
        document.querySelector('#image-container > div:nth-child(2) > div > div').remove(); // removes the
        document.querySelector('#choose-image img').src = imageUrl;
    } else {
        alert('');
    }


});

function checkImage(url) {
    const image = new Image();
    if (url) return true;
    image.onload = function() {
        if (this.width > 0) {
            return true;
        }
    };
    image.onerror = function() {
        return false;
    };
    image.src = url;
}
*/
const radios = Array.from(document.querySelectorAll('input[name="h"]'));
for (const radioButton of radios) {
    radioButton.addEventListener('click', function () {
        const imageValue = parseInt(
            (document.querySelector('input[name="h"]:checked') as HTMLInputElement).value
        );
        (document.querySelector('#text') as HTMLTextAreaElement).value =
            (
                {
                    1: 'You are a fox',
                    2: 'You are as delicate as a butterfly',
                    3: 'You have a tail and I do too <3 <3 <3',
                    4: 'You are my chicken and I am your rooster',
                    5: 'I fly to you',
                    6: "We are dandelions (if that's ok with you)",
                    7: 'Meow',
                    8: 'I am not complete without you!',
                    9: 'You are my snake and I am your dot',
                } as { [key: number]: string }
            )[imageValue] + ' ❤️';
    });
}

const form = document.getElementById('card-form')!;
form.onkeyup = form.onchange = updateLink;

document.getElementById('copy-link')!.onclick = copyLink;
