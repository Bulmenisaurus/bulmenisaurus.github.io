"use strict";
///////////////////
// Date Helpers //
///////////////////
// get the date object for tomorrow's date
const tomorrow = (date) => {
    const tomorrowDate = date;
    tomorrowDate.setDate(date.getDate() + 1);
    return tomorrowDate;
};
// get yyyy-mm-dd for a date
const simpleDate = (date) => date.toISOString().slice(0, 10);
const readableDaysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
// human-readable day of the week
const dayOfWeek = (date) => readableDaysOfWeek[date.getDay()];
//////////////////////
// Show time to run //
//////////////////////
let minutesToRun = 13;
let DateI = new Date(2021, 8, 28);
while (simpleDate(new Date()) !== simpleDate(DateI)) {
    DateI = tomorrow(DateI);
    if (dayOfWeek(DateI) === 'Wed') {
        minutesToRun += 1;
    }
}
const runAmountElem = document.getElementById('js-run-amount');
if (runAmountElem)
    runAmountElem.innerText = minutesToRun.toString();
/////////////////////////
// Inspirational quote //
////////////////////////
const quoteElem = document.getElementById('js-inspirational-quote');
if (quoteElem) {
    fetch('https://type.fit/api/quotes')
        .then((response) => response.json())
        .then((quotes) => {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        quoteElem.innerText = randomQuote.text + '\n\n - ' + randomQuote.author;
    });
}
//# sourceMappingURL=run.js.map