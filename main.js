// Global State
window.appState = {
    speed: 100,
    isHalted: false,
    isSorting: false
};

document.addEventListener('DOMContentLoaded', () => {
    const visualizer1 = new Visualizer3D('canvas-container-1');
    const visualizer2 = new Visualizer3D('canvas-container-2');
    const sorter1 = new SortingAlgorithms(visualizer1);
    const sorter2 = new SortingAlgorithms(visualizer2);

    let currentArray = [];
    let isCompareMode = false;

    // UI Elements
    const modeRadios = document.getElementsByName('mode');
    const algorithmSelect = document.getElementById('algorithm-select');
    const algorithmSelect2 = document.getElementById('algorithm-select-2');
    const algo2Group = document.getElementById('algo-2-group');
    const canvasWrapper2 = document.getElementById('canvas-wrapper-2');
    const canvasLabel1 = document.getElementById('canvas-label-1');
    const canvasLabel2 = document.getElementById('canvas-label-2');

    const customInput = document.getElementById('custom-input');
    const speedSlider = document.getElementById('speed-slider');
    const generateBtn = document.getElementById('generate-btn');
    const applyCustomBtn = document.getElementById('apply-custom-btn');
    const startBtn = document.getElementById('start-btn');

    // Info Elements
    const infoContainer = document.getElementById('info-container');
    const infoTitle = document.getElementById('info-title');
    const infoDesc = document.getElementById('info-description');
    const infoBest = document.getElementById('info-best');
    const infoAvg = document.getElementById('info-avg');
    const infoWorst = document.getElementById('info-worst');

    const algorithmInfo = {
        bubble: {
            title: "Bubble Sort",
            desc: "Um algoritmo simples que percorre a lista repetidas vezes, compara elementos adjacentes e os troca se estiverem na ordem errada. O maior elemento 'flutua' para o topo a cada iteração.",
            best: "O(n)",
            avg: "O(n²)",
            worst: "O(n²)"
        },
        selection: {
            title: "Selection Sort",
            desc: "Divide a lista em duas partes: a sublista ordenada e a sublista não ordenada. Encontra repetidamente o menor elemento da parte não ordenada e o move para o final da parte ordenada.",
            best: "O(n²)",
            avg: "O(n²)",
            worst: "O(n²)"
        },
        insertion: {
            title: "Insertion Sort",
            desc: "Constrói a matriz final classificada um item de cada vez. É muito mais eficiente em listas pequenas do que algoritmos mais avançados. Funciona movendo o elemento atual para sua posição correta na parte já ordenada.",
            best: "O(n)",
            avg: "O(n²)",
            worst: "O(n²)"
        },
        quick: {
            title: "Quick Sort",
            desc: "Um algoritmo de divisão e conquista que escolhe um elemento 'pivô' e particiona o array ao redor do pivô, colocando os menores à esquerda e os maiores à direita. É geralmente muito rápido na prática.",
            best: "O(n log n)",
            avg: "O(n log n)",
            worst: "O(n²)"
        },
        merge: {
            title: "Merge Sort",
            desc: "Um algoritmo eficiente, estável e de divisão e conquista. Divide a lista não ordenada em n sublistas e, em seguida, mescla repetidamente as sublistas para produzir novas listas ordenadas.",
            best: "O(n log n)",
            avg: "O(n log n)",
            worst: "O(n log n)"
        },
        heap: {
            title: "Heap Sort",
            desc: "Uma técnica de ordenação baseada em comparação que usa uma estrutura de dados de árvore binária chamada Max-Heap. O maior elemento é movido para o final e o processo se repete para os elementos restantes.",
            best: "O(n log n)",
            avg: "O(n log n)",
            worst: "O(n log n)"
        },
        shell: {
            title: "Shell Sort",
            desc: "Uma generalização do Insertion Sort que permite a troca de itens muito distantes. A ideia é organizar a lista de forma que, a partir de qualquer índice i, pegar os elementos com um intervalo g produza uma lista ordenada.",
            best: "O(n log n)",
            avg: "O(n(log n)²)",
            worst: "O(n²)"
        }
    };

    function updateAlgorithmInfo() {
        const algo = algorithmSelect.value;
        const info = algorithmInfo[algo];

        if (info) {
            infoTitle.textContent = info.title;
            infoDesc.textContent = info.desc;
            infoBest.textContent = info.best;
            infoAvg.textContent = info.avg;
            infoWorst.textContent = info.worst;

            // Only show info container in single mode
            if (!isCompareMode) {
                infoContainer.classList.remove('hidden');
            } else {
                infoContainer.classList.add('hidden');
            }
        } else {
            infoContainer.classList.add('hidden');
        }
        updateLabels();
    }

    function updateLabels() {
        if (isCompareMode) {
            canvasLabel1.textContent = algorithmInfo[algorithmSelect.value].title;
            canvasLabel2.textContent = algorithmInfo[algorithmSelect2.value].title;
        } else {
            canvasLabel1.textContent = "";
            canvasLabel2.textContent = "";
        }
    }

    // Initialization
    generateRandomArray();
    updateAlgorithmInfo();

    // Event Listeners
    modeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            isCompareMode = (e.target.value === 'compare');
            if (isCompareMode) {
                algo2Group.classList.remove('hidden');
                canvasWrapper2.classList.remove('hidden');
                infoContainer.classList.add('hidden');
            } else {
                algo2Group.classList.add('hidden');
                canvasWrapper2.classList.add('hidden');
                infoContainer.classList.remove('hidden');
            }

            // Trigger resize to fix WebGL renderer size
            window.dispatchEvent(new Event('resize'));

            // Re-generate bars to match new size
            visualizer1.generateBars(currentArray);
            if(isCompareMode) visualizer2.generateBars(currentArray);

            updateAlgorithmInfo();
        });
    });

    algorithmSelect.addEventListener('change', updateAlgorithmInfo);
    algorithmSelect2.addEventListener('change', updateLabels);

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
                    visualizer1.generateBars(currentArray);
                    if(isCompareMode) visualizer2.generateBars(currentArray);
                }, window.appState.speed + 50);
            } else {
                currentArray = vals;
                visualizer1.generateBars(currentArray);
                if(isCompareMode) visualizer2.generateBars(currentArray);
            }
        } else {
            alert("Por favor, insira números válidos separados por vírgula.");
        }
    });

    async function runAlgorithm(algoName, sorterInstance, arrayCopy) {
        switch (algoName) {
            case 'bubble': await sorterInstance.bubbleSort(arrayCopy); break;
            case 'selection': await sorterInstance.selectionSort(arrayCopy); break;
            case 'insertion': await sorterInstance.insertionSort(arrayCopy); break;
            case 'quick': await sorterInstance.quickSort(arrayCopy); break;
            case 'merge': await sorterInstance.mergeSort(arrayCopy); break;
            case 'heap': await sorterInstance.heapSort(arrayCopy); break;
            case 'shell': await sorterInstance.shellSort(arrayCopy); break;
        }
        return arrayCopy;
    }

    startBtn.addEventListener('click', async () => {
        if (window.appState.isSorting) return;

        setSortingState(true);

        try {
            const arr1 = [...currentArray];

            if (isCompareMode) {
                const arr2 = [...currentArray];
                const algo1 = algorithmSelect.value;
                const algo2 = algorithmSelect2.value;

                // Run both concurrently
                const [res1, res2] = await Promise.all([
                    runAlgorithm(algo1, sorter1, arr1),
                    runAlgorithm(algo2, sorter2, arr2)
                ]);

                // Keep the result of the first algorithm as the base state
                currentArray = res1;
            } else {
                currentArray = await runAlgorithm(algorithmSelect.value, sorter1, arr1);
            }

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
        visualizer1.generateBars(currentArray);
        if(isCompareMode) visualizer2.generateBars(currentArray);
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
            modeRadios.forEach(radio => radio.disabled = true);
            startBtn.textContent = "Ordenando...";
        } else {
            startBtn.disabled = false;
            generateBtn.disabled = false;
            applyCustomBtn.disabled = false;
            modeRadios.forEach(radio => radio.disabled = false);
            startBtn.textContent = "Iniciar Ordenação";
        }
    }
});
