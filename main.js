// Global State
window.appState = {
    speed: 100,
    isHalted: false,
    isSorting: false
};

document.addEventListener('DOMContentLoaded', () => {
    const visualizer = new Visualizer3D('canvas-container');
    const sorter = new SortingAlgorithms(visualizer);

    let currentArray = [];

    // UI Elements
    const algorithmSelect = document.getElementById('algorithm-select');
    const customInput = document.getElementById('custom-input');
    const speedSlider = document.getElementById('speed-slider');
    const generateBtn = document.getElementById('generate-btn');
    const applyCustomBtn = document.getElementById('apply-custom-btn');
    const startBtn = document.getElementById('start-btn');

    // Initialization
    generateRandomArray();

    // Event Listeners
    speedSlider.addEventListener('input', (e) => {
        window.appState.speed = parseInt(e.target.value);
    });

    generateBtn.addEventListener('click', () => {
        if (window.appState.isSorting) {
            haltSorting();
            setTimeout(generateRandomArray, window.appState.speed + 50);
        } else {
            generateRandomArray();
        }
    });

    applyCustomBtn.addEventListener('click', () => {
        const valStr = customInput.value;
        const vals = valStr.split(',')
                           .map(v => parseInt(v.trim()))
                           .filter(v => !isNaN(v) && v > 0);

        if (vals.length > 0) {
            if (window.appState.isSorting) {
                haltSorting();
                setTimeout(() => {
                    currentArray = vals;
                    visualizer.generateBars(currentArray);
                }, window.appState.speed + 50);
            } else {
                currentArray = vals;
                visualizer.generateBars(currentArray);
            }
        } else {
            alert("Por favor, insira números válidos separados por vírgula.");
        }
    });

    startBtn.addEventListener('click', async () => {
        if (window.appState.isSorting) return;

        const algorithm = algorithmSelect.value;
        setSortingState(true);

        try {
            // Create a copy of the array for sorting
            const arrayToSort = [...currentArray];

            switch (algorithm) {
                case 'bubble':
                    await sorter.bubbleSort(arrayToSort);
                    break;
                case 'selection':
                    await sorter.selectionSort(arrayToSort);
                    break;
                case 'insertion':
                    await sorter.insertionSort(arrayToSort);
                    break;
                case 'quick':
                    await sorter.quickSort(arrayToSort);
                    break;
                case 'merge':
                    await sorter.mergeSort(arrayToSort);
                    break;
            }
            // Update current array if finished successfully
            currentArray = arrayToSort;
        } catch (e) {
            if (e.message !== "Sorting Halted") {
                console.error(e);
            }
        } finally {
            setSortingState(false);
        }
    });

    // Helpers
    function generateRandomArray(size = 20, max = 50) {
        currentArray = [];
        for (let i = 0; i < size; i++) {
            currentArray.push(Math.floor(Math.random() * max) + 5);
        }
        visualizer.generateBars(currentArray);
        customInput.value = currentArray.join(', ');
    }

    function haltSorting() {
        window.appState.isHalted = true;
    }

    function setSortingState(isSorting) {
        window.appState.isSorting = isSorting;
        if (isSorting) {
            window.appState.isHalted = false;
            startBtn.disabled = true;
            generateBtn.disabled = true;
            applyCustomBtn.disabled = true;
            startBtn.textContent = "Ordenando...";
        } else {
            startBtn.disabled = false;
            generateBtn.disabled = false;
            applyCustomBtn.disabled = false;
            startBtn.textContent = "Iniciar Ordenação";
        }
    }
});
