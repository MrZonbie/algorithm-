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
            infoContainer.classList.remove('hidden');
        } else {
            infoContainer.classList.add('hidden');
        }
    }

    // Initialization
    generateRandomArray();
    updateAlgorithmInfo();

    // Event Listeners
    algorithmSelect.addEventListener('change', updateAlgorithmInfo);

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
                case 'heap':
                    await sorter.heapSort(arrayToSort);
                    break;
                case 'shell':
                    await sorter.shellSort(arrayToSort);
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
