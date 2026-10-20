class Visualizer3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);
        this.scene.fog = new THREE.FogExp2(0x1a1a2e, 0.02);

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.controls = null;

        this.bars = [];
        this.values = [];
        this.materials = {
            default: new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.1 }),
            compare: new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2, metalness: 0.1 }), // Yellow
            swap: new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2, metalness: 0.1 }),    // Red
            sorted: new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.2, metalness: 0.1 })   // Green
        };

        this.init();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(20, 40, 20);
        dirLight.castShadow = true;
        dirLight.shadow.camera.left = -30;
        dirLight.shadow.camera.right = 30;
        dirLight.shadow.camera.top = 30;
        dirLight.shadow.camera.bottom = -30;
        this.scene.add(dirLight);

        const pointLight = new THREE.PointLight(0x38bdf8, 0.5, 100);
        pointLight.position.set(0, 10, 10);
        this.scene.add(pointLight);

        // Floor
        const floorGeometry = new THREE.PlaneGeometry(200, 200);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x0f172a,
            roughness: 0.8,
            metalness: 0.2
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Camera positioning
        this.camera.position.set(0, 15, 30);

        // Orbit Controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below floor

        window.addEventListener('resize', () => this.onWindowResize(), false);

        this.animate();
    }

    generateBars(values) {
        this.values = [...values];

        // Remove existing bars
        this.bars.forEach(bar => {
            this.scene.remove(bar);
            bar.geometry.dispose();
        });
        this.bars = [];

        const n = values.length;
        const barWidth = 1;
        const spacing = 0.5;
        const totalWidth = n * barWidth + (n - 1) * spacing;
        const startX = -totalWidth / 2 + barWidth / 2;

        const maxVal = Math.max(...values);
        const heightScale = 20 / maxVal; // Max height of 20 units

        for (let i = 0; i < n; i++) {
            const height = Math.max(values[i] * heightScale, 0.1); // Ensure minimum height

            // Using BoxGeometry for bars
            const geometry = new THREE.BoxGeometry(barWidth, height, barWidth);
            const mesh = new THREE.Mesh(geometry, this.materials.default.clone());

            // Position: Set bottom to y=0
            mesh.position.x = startX + i * (barWidth + spacing);
            mesh.position.y = height / 2;
            mesh.position.z = 0;

            mesh.castShadow = true;
            mesh.receiveShadow = true;

            // Store original value and index
            mesh.userData = { value: values[i], heightScale: heightScale };

            this.scene.add(mesh);
            this.bars.push(mesh);
        }

        // Adjust camera to fit
        this.camera.position.set(0, Math.max(15, maxVal * heightScale * 0.8), totalWidth * 0.8 + 10);
        this.controls.target.set(0, 5, 0);
        this.controls.update();
    }

    // Animation Helpers
    async setColor(indices, colorType) {
        indices.forEach(idx => {
            if (this.bars[idx]) {
                this.bars[idx].material.color.copy(this.materials[colorType].color);
            }
        });
    }

    async resetColor(indices) {
        indices.forEach(idx => {
            if (this.bars[idx]) {
                this.bars[idx].material.color.copy(this.materials.default.color);
            }
        });
    }

    async swapBars(idx1, idx2) {
        const bar1 = this.bars[idx1];
        const bar2 = this.bars[idx2];

        // Swap positions in array
        this.bars[idx1] = bar2;
        this.bars[idx2] = bar1;

        // Visual swap (X positions)
        const tempX = bar1.position.x;
        bar1.position.x = bar2.position.x;
        bar2.position.x = tempX;
    }

    async setHeight(idx, value) {
        const bar = this.bars[idx];
        const heightScale = bar.userData.heightScale;
        const newHeight = Math.max(value * heightScale, 0.1);

        bar.geometry.dispose(); // Dispose old geometry to prevent memory leaks
        bar.geometry = new THREE.BoxGeometry(1, newHeight, 1);
        bar.position.y = newHeight / 2;
        bar.userData.value = value;
    }

    markSorted(indices) {
        indices.forEach(idx => {
            if(this.bars[idx]){
                this.bars[idx].material.color.copy(this.materials.sorted.color);
            }
        });
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        if (this.controls) this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}
