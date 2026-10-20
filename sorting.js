// Utility sleep function controlled by global state
const sleep = () => new Promise(resolve => setTimeout(resolve, window.appState.speed));

class SortingAlgorithms {
    constructor(visualizer) {
        this.vis = visualizer;
    }

    async checkHalt() {
        if (window.appState.isHalted) {
            throw new Error("Sorting Halted");
        }
    }

    async bubbleSort(arr) {
        const n = arr.length;
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                await this.checkHalt();

                await this.vis.setColor([j, j + 1], 'compare');
                await sleep();

                if (arr[j] > arr[j + 1]) {
                    await this.vis.setColor([j, j + 1], 'swap');
                    await sleep();

                    // Swap logic
                    let temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;

                    await this.vis.swapBars(j, j + 1);
                }

                await this.vis.resetColor([j, j + 1]);
            }
            this.vis.markSorted([n - 1 - i]);
        }
        this.vis.markSorted([0]); // Mark the first element as sorted at the end
    }

    async selectionSort(arr) {
        const n = arr.length;
        for (let i = 0; i < n; i++) {
            let min_idx = i;
            await this.vis.setColor([min_idx], 'swap');

            for (let j = i + 1; j < n; j++) {
                await this.checkHalt();
                await this.vis.setColor([j], 'compare');
                await sleep();

                if (arr[j] < arr[min_idx]) {
                    await this.vis.resetColor([min_idx]); // Reset old min
                    min_idx = j;
                    await this.vis.setColor([min_idx], 'swap'); // Set new min
                } else {
                    await this.vis.resetColor([j]);
                }
            }

            if (min_idx !== i) {
                await this.vis.setColor([i, min_idx], 'swap');
                await sleep();

                let temp = arr[i];
                arr[i] = arr[min_idx];
                arr[min_idx] = temp;

                await this.vis.swapBars(i, min_idx);
            }

            await this.vis.resetColor([i, min_idx]);
            this.vis.markSorted([i]);
        }
    }

    async insertionSort(arr) {
        const n = arr.length;
        this.vis.markSorted([0]); // First element is considered sorted

        for (let i = 1; i < n; i++) {
            let key = arr[i];
            let j = i - 1;

            await this.vis.setColor([i], 'swap');
            await sleep();

            while (j >= 0 && arr[j] > key) {
                await this.checkHalt();
                await this.vis.setColor([j, j + 1], 'compare');
                await sleep();

                arr[j + 1] = arr[j];
                // In insertion sort, shifting involves changing heights
                await this.vis.setHeight(j + 1, arr[j]);

                await this.vis.resetColor([j, j + 1]);
                this.vis.markSorted([j + 1, j]); // Keep previous part green
                j = j - 1;
            }
            arr[j + 1] = key;
            await this.vis.setHeight(j + 1, key);
            this.vis.markSorted([j + 1]);
        }
        // Ensure all are marked green
        for(let k=0; k<n; k++) this.vis.markSorted([k]);
    }

    async quickSort(arr, left = 0, right = arr.length - 1) {
        if (left >= right) {
            if(left === right) this.vis.markSorted([left]);
            return;
        }

        let pivotIndex = await this.partition(arr, left, right);
        this.vis.markSorted([pivotIndex]);

        await this.quickSort(arr, left, pivotIndex - 1);
        await this.quickSort(arr, pivotIndex + 1, right);
    }

    async partition(arr, left, right) {
        let pivotValue = arr[right];
        let pivotIndex = left;

        await this.vis.setColor([right], 'swap'); // Highlight pivot

        for (let i = left; i < right; i++) {
            await this.checkHalt();
            await this.vis.setColor([i], 'compare');
            await sleep();

            if (arr[i] < pivotValue) {
                await this.vis.setColor([i, pivotIndex], 'swap');
                await sleep();

                let temp = arr[i];
                arr[i] = arr[pivotIndex];
                arr[pivotIndex] = temp;

                await this.vis.swapBars(i, pivotIndex);
                await this.vis.resetColor([i, pivotIndex]);

                pivotIndex++;
            } else {
                await this.vis.resetColor([i]);
            }
        }

        await this.vis.setColor([pivotIndex, right], 'swap');
        await sleep();

        let temp = arr[pivotIndex];
        arr[pivotIndex] = arr[right];
        arr[right] = temp;

        await this.vis.swapBars(pivotIndex, right);
        await this.vis.resetColor([pivotIndex, right]);

        return pivotIndex;
    }


    async mergeSort(arr, l = 0, r = arr.length - 1) {
        if (l >= r) {
            return;
        }
        const m = l + Math.floor((r - l) / 2);
        await this.mergeSort(arr, l, m);
        await this.mergeSort(arr, m + 1, r);
        await this.merge(arr, l, m, r);
    }

    async merge(arr, l, m, r) {
        let n1 = m - l + 1;
        let n2 = r - m;

        let L = new Array(n1);
        let R = new Array(n2);

        for (let i = 0; i < n1; i++) L[i] = arr[l + i];
        for (let j = 0; j < n2; j++) R[j] = arr[m + 1 + j];

        let i = 0, j = 0, k = l;

        while (i < n1 && j < n2) {
            await this.checkHalt();
            await this.vis.setColor([k], 'compare');
            await sleep();

            if (L[i] <= R[j]) {
                arr[k] = L[i];
                await this.vis.setHeight(k, L[i]);
                i++;
            } else {
                arr[k] = R[j];
                await this.vis.setHeight(k, R[j]);
                j++;
            }
            this.vis.markSorted([k]);
            k++;
        }

        while (i < n1) {
            await this.checkHalt();
            arr[k] = L[i];
            await this.vis.setColor([k], 'swap');
            await sleep();
            await this.vis.setHeight(k, L[i]);
            this.vis.markSorted([k]);
            i++;
            k++;
        }

        while (j < n2) {
            await this.checkHalt();
            arr[k] = R[j];
            await this.vis.setColor([k], 'swap');
            await sleep();
            await this.vis.setHeight(k, R[j]);
            this.vis.markSorted([k]);
            j++;
            k++;
        }
    }
}
