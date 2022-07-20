async function newSort(arr, draw) {
    const n = arr.length;
    const chosen = [];

    for (let i = 0; i < n; i++) {
        /**
         * @type {number}
         */
        let max_i = undefined;
        /**
         * @type {number}
         */
        let max_v = undefined;
        for (let j = 0; j < n; j++) {
            if ((max_v === undefined || arr[j] > max_v) && !chosen.includes(j)) {
                max_i = j;
                max_v = arr[j];
            }
        }

        chosen.push(max_i);
        swap(arr, chosen.length, max_i);
        await draw(arr, 3);
    }
}
