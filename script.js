/**
 * Ivan Herdianto Portfolio - Spatial 3D / Floating Card Architecture
 * Deep Navy Technical Sans Edition.
 */

/**
 * Terminal boot screen. Fixed timeline (~2.7s): it does not wait for the network.
 * Click or any key skips it. Fires "boot:done" when the page should be revealed.
 */
(function runBootSequence() {
    const screen = document.getElementById("boot-screen");
    const reveal = () => {
        document.body.classList.remove("is-booting");
        document.dispatchEvent(new Event("boot:done"));
    };
    if (!screen) {
        reveal();
        return;
    }

    const output = document.getElementById("boot-output");
    const cmdEl = document.getElementById("boot-cmd");
    const caret = document.getElementById("boot-caret");
    const bar = document.getElementById("boot-bar");
    const percent = document.getElementById("boot-percent");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const COMMAND = "boot --portfolio";
    const STEPS = [
        "initializing 3d globe renderer",
        "mounting sections: skills, experience, projects, contact",
        "locating origin at 7.47\u00b0 S, 112.43\u00b0 E",
        "loading stack: laravel, react, vue, inertia.js",
    ];
    const READY = "ready. welcome to ivan herdianto's portfolio.";

    // Timeline in ms
    const TYPE_STEP = 50;
    const FIRST_STEP_AT = 1000;
    const STEP_GAP = 1350;
    const READY_AT = FIRST_STEP_AT + STEPS.length * STEP_GAP; // 2300
    const END_AT = READY_AT + 2000; // fade starts, ~2.65s total

    const timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    let tick = null;
    let finished = false;

    const addLine = (text, readyLine) => {
        const p = document.createElement("p");
        p.className = "boot-line" + (readyLine ? " boot-ready" : "");
        if (!readyLine) {
            const ok = document.createElement("span");
            ok.className = "boot-ok";
            ok.textContent = "[ ok ]";
            p.append(ok, " " + text);
        } else {
            p.textContent = text;
        }
        p.append(caret);
        output.appendChild(p);
    };

    const setProgress = (p) => {
        bar.style.transform = "scaleX(" + p + ")";
        percent.textContent = Math.round(p * 100) + "%";
    };

    function finish() {
        if (finished) return;
        finished = true;
        timers.forEach(clearTimeout);
        clearInterval(tick);
        setProgress(1);
        screen.classList.add("is-done");
        reveal();
        setTimeout(() => screen.remove(), 500);
    }

    if (reduceMotion) {
        cmdEl.textContent = COMMAND;
        STEPS.forEach((s) => addLine(s));
        addLine(READY, true);
        setProgress(1);
        later(finish, 700);
    } else {
        // Type the command
        for (let i = 1; i <= COMMAND.length; i++) {
            later(() => (cmdEl.textContent = COMMAND.slice(0, i)), 150 + i * TYPE_STEP);
        }
        // Log lines
        STEPS.forEach((s, i) => later(() => addLine(s), FIRST_STEP_AT + i * STEP_GAP));
        later(() => addLine(READY, true), READY_AT);
        later(finish, END_AT);

        // Progress bar
        const t0 = performance.now();
        tick = setInterval(() => setProgress(Math.min(1, (performance.now() - t0) / READY_AT)), 40);
    }

    screen.addEventListener("click", finish);
    document.addEventListener("keydown", finish, { once: true });
})();

document.addEventListener("DOMContentLoaded", () => {
    // 1. Data Definitions for Sections & Nodes
    const sections = {
        home: {
            id: "home",
            eyebrow: "Spatial Datum",
            title: "Overview",
            lat: -7.47,
            lon: 112.43,
            tagEl: document.getElementById("tag-home"),
            panelEl: document.getElementById("panel-home"),
            isAccent: false,
        },
        skills: {
            id: "skills",
            eyebrow: "01 / Expertise",
            title: "Core Skills",
            lat: 35.0,
            lon: 139.0,
            tagEl: document.getElementById("tag-skills"),
            panelEl: document.getElementById("panel-skills"),
            isAccent: true,
        },
        experience: {
            id: "experience",
            eyebrow: "02 / Journey",
            title: "Experience",
            lat: 51.5,
            lon: 0.0,
            tagEl: document.getElementById("tag-experience"),
            panelEl: document.getElementById("panel-experience"),
            isAccent: true,
        },
        projects: {
            id: "projects",
            eyebrow: "03 / Portfolio",
            title: "Recent Projects",
            lat: 37.7,
            lon: -102.0,
            tagEl: document.getElementById("tag-projects"),
            panelEl: document.getElementById("panel-projects"),
            isAccent: true,
        },
        contact: {
            id: "contact",
            eyebrow: "04 / Inquiry",
            title: "Contact",
            lat: -23.5,
            lon: -46.5,
            tagEl: document.getElementById("tag-contact"),
            panelEl: document.getElementById("panel-contact"),
            isAccent: true,
        },
    };

    // UI Elements
    const sectionCard = document.getElementById("section-card");
    const cardCloseBtn = document.getElementById("card-close-btn");
    const cardEyebrow = document.getElementById("card-eyebrow");
    const cardTitle = document.getElementById("card-title");
    const cardBody = document.getElementById("card-body");
    const dockButtons = document.querySelectorAll(".globe-dock-btn");
    const headerBrandBtn = document.getElementById("header-brand-btn");

    let isCardOpen = false;
    let activeSectionId = null;

    // 2. Three.js Full-Viewport Spatial Scene
    const viewport = document.getElementById("globe-viewport");
    const container = document.getElementById("globe-canvas-mount");
    if (!viewport || !container || typeof THREE === "undefined") return;

    // Deep Navy & Electric Sky Palette
    const colors = {
        rule: 0x1e293b,
        muted: 0x475569,
        ink: 0xf8fafc,
        accent: 0x38bdf8,   // Electric Sky Blue
        stars: 0x64748b,
    };

    let width = viewport.clientWidth || window.innerWidth;
    let height = viewport.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);

    // Zoom: multiplier on camera distance (smaller = closer). Eased toward zoomTarget each frame.
    const ZOOM_MIN = 0.55;
    const ZOOM_MAX = 1.5;
    let zoom = 1;
    let zoomTarget = 1;
    let baseCamZ = 5.8;

    function setZoom(value) {
        zoomTarget = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value));
    }

    function updateCameraPosition() {
        if (camera.aspect < 1) {
            // Mobile portrait adjustment: push camera back so the globe fits comfortably
            baseCamZ = Math.min(14, 5.8 / camera.aspect); // globe spans ~92% of the screen width
        } else {
            baseCamZ = 5.8;
        }
        camera.position.z = baseCamZ * zoom;
    }
    updateCameraPosition();

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Subtle Deep Space Stars Field
    const starsCount = 700;
    const starsPositions = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount; i++) {
        const r = 25 + Math.random() * 35;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        starsPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        starsPositions[i * 3 + 1] = r * Math.cos(phi);
        starsPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const starsGeo = new THREE.BufferGeometry();
    starsGeo.setAttribute("position", new THREE.BufferAttribute(starsPositions, 3));
    const starsMat = new THREE.PointsMaterial({
        color: colors.stars,
        size: 0.08,
        transparent: true,
        opacity: 0.5,
    });
    const starsMesh = new THREE.Points(starsGeo, starsMat);
    scene.add(starsMesh);

    // Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    globeGroup.rotation.x = 0.28;
    globeGroup.rotation.z = -0.08;

    const sphereRadius = 1.95;

    // A. Graticule Sphere (Navy Blueprint Lines)
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, 32, 20);
    const sphereMat = new THREE.MeshBasicMaterial({
        color: colors.rule,
        wireframe: true,
        transparent: true,
        opacity: 0.55,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(sphereMesh);

    // B. Equator Loop
    const equatorPoints = [];
    for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        equatorPoints.push(new THREE.Vector3(Math.cos(angle) * sphereRadius, 0, Math.sin(angle) * sphereRadius));
    }
    const equatorGeo = new THREE.BufferGeometry().setFromPoints(equatorPoints);
    const equatorMat = new THREE.LineBasicMaterial({
        color: colors.muted,
        transparent: true,
        opacity: 0.7,
    });
    const equatorLine = new THREE.Line(equatorGeo, equatorMat);
    globeGroup.add(equatorLine);

    // C. Point Cloud (Fibonacci Nodes)
    const nodeCount = 550;
    const nodePositions = new Float32Array(nodeCount * 3);
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    for (let i = 0; i < nodeCount; i++) {
        const theta = 2 * Math.PI * i / goldenRatio;
        const phi = Math.acos(1 - 2 * (i + 0.5) / nodeCount);
        const r = sphereRadius * 1.004;

        nodePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        nodePositions[i * 3 + 1] = r * Math.cos(phi);
        nodePositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const nodesGeo = new THREE.BufferGeometry();
    nodesGeo.setAttribute("position", new THREE.BufferAttribute(nodePositions, 3));
    const nodesMat = new THREE.PointsMaterial({
        color: 0x64748b,
        size: 0.04,
        transparent: true,
        opacity: 0.8,
    });
    const nodesMesh = new THREE.Points(nodesGeo, nodesMat);
    globeGroup.add(nodesMesh);

    // D. Build Section Hotspot Nodes
    function latLonToVector3(lat, lon, radius) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const z = radius * Math.sin(phi) * Math.sin(theta);
        const y = radius * Math.cos(phi);
        return new THREE.Vector3(x, y, z);
    }

    const datumMeshes = [];
    const pulseRings = [];

    Object.values(sections).forEach((datum) => {
        const pos = latLonToVector3(datum.lat, datum.lon, sphereRadius * 1.01);
        datum.localPos = pos;

        const pinColor = datum.isAccent ? colors.accent : colors.ink;

        const pinGeo = new THREE.SphereGeometry(0.08, 16, 16);
        const pinMat = new THREE.MeshBasicMaterial({ color: pinColor });
        const pinMesh = new THREE.Mesh(pinGeo, pinMat);
        pinMesh.position.copy(pos);
        globeGroup.add(pinMesh);

        const ringGeo = new THREE.RingGeometry(0.12, 0.17, 32);
        const ringMat = new THREE.MeshBasicMaterial({
            color: pinColor,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.copy(pos);
        ringMesh.lookAt(pos.clone().multiplyScalar(2));
        globeGroup.add(ringMesh);

        datumMeshes.push(pinMesh);
        pulseRings.push(ringMesh);

        if (datum.tagEl) {
            datum.tagEl.addEventListener("click", () => toggleCard(datum.id));
        }
    });

    // E. Arcs from the origin (Mojokerto) to every section node
    const arcMat = new THREE.LineBasicMaterial({ color: colors.accent, transparent: true, opacity: 0.35 });
    Object.values(sections).forEach((d) => {
        if (d.id === "home") return;
        const from = sections.home.localPos;
        const to = d.localPos;
        const lift = 1.1 + 0.4 * (from.angleTo(to) / Math.PI);
        const mid = from.clone().add(to).normalize().multiplyScalar(sphereRadius * lift);
        const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
        globeGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(48)), arcMat));
    });

    // 3. Card State Management & Lock Mechanism
    let targetRotX = 0.28;
    let targetRotY = -0.55; // Initial framing facing Indonesia / SE Asia
    // Globe screen offset in px (x right, y down). Idle: leave room for the hero. Open: leave room for the card.
    const globeOffset = { x: 0, y: 0 };
    const globeOffsetTarget = { x: 0, y: 0 };
    const hero = document.getElementById("hero");
    let isBooting = document.body.classList.contains("is-booting");
    globeGroup.rotation.y = targetRotY;

    // Desktop: while the card is open, shift the globe left so its center sits in the
    // middle of the free space to the left of the card (the card never covers the globe).
    // Card position is read from the DOM, so changing --card-width / --card-offset-right
    // in styles.css needs no change here.
    const CARD_GLOBE_GAP_PX = 24;

    function updateGlobeTargets() {
        if (isBooting) {
            globeOffsetTarget.x = 0;
            globeOffsetTarget.y = 0;
            return;
        }

        // Landscape: hero (idle) and card (open) sit beside the globe.
        if (camera.aspect >= 1) {
            globeOffsetTarget.y = 0;
            if (isCardOpen) {
                const cardLeft = sectionCard.getBoundingClientRect().left;
                globeOffsetTarget.x = -(window.innerWidth - cardLeft + CARD_GLOBE_GAP_PX) / 2;
            } else {
                globeOffsetTarget.x = Math.min(260, width * 0.16);
            }
            return;
        }

        // Portrait: center the globe in the free band below the hero (idle)
        // or between the header and the bottom sheet (card open).
        globeOffsetTarget.x = 0;
        let freeTop;
        let freeBottom;
        if (isCardOpen) {
            const headerEl = document.querySelector("header");
            freeTop = (headerEl ? headerEl.offsetHeight : 0) + 8;
            freeBottom = height - sectionCard.offsetHeight - 8;
        } else {
            freeTop = (hero ? hero.getBoundingClientRect().bottom : 0) + 8;
            freeBottom = height - 40;
        }
        globeOffsetTarget.y = (freeTop + freeBottom) / 2 - height / 2;
    }

    function openCard(sectionId) {
        const section = sections[sectionId];
        if (!section) return;

        // Works for both first open and switching from another section
        isCardOpen = true;
        activeSectionId = sectionId;

        // A. Align Globe to Face Target Node Directly
        const lonRad = (section.lon + 180) * (Math.PI / 180);
        const latRad = section.lat * (Math.PI / 180);

        targetRotY = -lonRad + Math.PI / 2;
        targetRotX = latRad * 0.75;
        targetRotX = Math.max(-1.1, Math.min(1.1, targetRotX));

        // B. Offset the globe so it stays visible beside the card; hide the hero
        updateGlobeTargets();
        if (hero) hero.classList.add("is-hidden");

        // C. Update Card Header & Show Selected Panel
        cardEyebrow.textContent = section.eyebrow;
        cardTitle.textContent = section.title;
        cardBody.scrollTop = 0;

        Object.values(sections).forEach((s) => {
            if (s.panelEl) {
                s.panelEl.classList.toggle("hidden", s.id !== sectionId);
            }
        });

        // D. Show the card (CSS handles the fade-in)
        sectionCard.classList.add("is-open");
        sectionCard.setAttribute("aria-hidden", "false");

        // E. Update UI Active States (dock buttons + globe tags)
        dockButtons.forEach((btn) => {
            btn.classList.toggle("is-active", btn.dataset.section === sectionId);
        });
        Object.values(sections).forEach((s) => {
            if (s.tagEl) s.tagEl.classList.toggle("is-active", s.id === sectionId);
        });

        // Re-measure now that the panel content (and so the sheet height) is final
        updateGlobeTargets();
    }

    function closeCard() {
        isCardOpen = false;
        activeSectionId = null;

        sectionCard.classList.remove("is-open");
        sectionCard.setAttribute("aria-hidden", "true");

        // Return globe to its idle position (idle rotation resumes automatically) and show the hero
        updateGlobeTargets();
        if (hero) hero.classList.remove("is-hidden");

        // Unset active states
        dockButtons.forEach((btn) => btn.classList.remove("is-active"));
        Object.values(sections).forEach((s) => {
            if (s.tagEl) s.tagEl.classList.remove("is-active");
        });
    }

    // Same section clicked again closes the card; a different one swaps the content.
    function toggleCard(sectionId) {
        if (isCardOpen && activeSectionId === sectionId) {
            closeCard();
        } else {
            openCard(sectionId);
        }
    }

    cardCloseBtn.addEventListener("click", closeCard);

    // Click outside the card closes it. Hotspot tags, dock buttons and the header/footer
    // bars are ignored here because they have their own click behavior.
    document.addEventListener("click", (e) => {
        if (!isCardOpen) return;
        if (e.target.closest("#section-card, .globe-hotspot-tag, .globe-dock-btn, header, footer")) return;
        closeCard();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && isCardOpen) {
            closeCard();
        }
    });

    dockButtons.forEach((btn) => {
        btn.addEventListener("click", () => toggleCard(btn.dataset.section));
    });

    if (headerBrandBtn) {
        headerBrandBtn.addEventListener("click", () => openCard("home"));
    }

    updateGlobeTargets();
    document.addEventListener("boot:done", () => {
        isBooting = false;
        updateGlobeTargets();
    });

    // 4. Pointer Controls: drag to rotate (locked while card is open), wheel / pinch to zoom
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    const pointers = new Map();
    let pinchStartDist = 0;
    let pinchStartZoom = 1;

    const pinchDistance = () => {
        const [p1, p2] = [...pointers.values()];
        return Math.hypot(p1.x - p2.x, p1.y - p2.y);
    };

    viewport.addEventListener("pointerdown", (e) => {
        if (e.target.closest("button") || e.target.closest("a")) return;
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        viewport.setPointerCapture?.(e.pointerId);

        if (pointers.size === 2) {
            // Second finger: switch from rotate to pinch-zoom
            isDragging = false;
            pinchStartDist = pinchDistance();
            pinchStartZoom = zoomTarget;
        } else if (pointers.size === 1 && !isCardOpen) {
            isDragging = true;
            prevX = e.clientX;
            prevY = e.clientY;
        }
    });

    window.addEventListener("pointermove", (e) => {
        if (!pointers.has(e.pointerId)) return;
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (pointers.size === 2) {
            // Fingers apart = zoom in (shorter camera distance)
            if (pinchStartDist > 0) setZoom(pinchStartZoom * (pinchStartDist / pinchDistance()));
            return;
        }

        if (!isDragging || isCardOpen) return;
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;

        targetRotY += dx * 0.006;
        targetRotX += dy * 0.006;
        targetRotX = Math.max(-1.15, Math.min(1.15, targetRotX));

        prevX = e.clientX;
        prevY = e.clientY;
    });

    const endPointer = (e) => {
        pointers.delete(e.pointerId);
        if (pointers.size === 0) {
            isDragging = false;
        } else if (pointers.size === 1) {
            // One finger left after a pinch: continue rotating from where it is, without a jump
            const [rest] = [...pointers.values()];
            prevX = rest.x;
            prevY = rest.y;
            isDragging = !isCardOpen;
        }
    };
    window.addEventListener("pointerup", endPointer);
    window.addEventListener("pointercancel", endPointer);

    // Mouse wheel and trackpad pinch (ctrlKey) zoom
    viewport.addEventListener(
        "wheel",
        (e) => {
            e.preventDefault();
            const unit = e.deltaMode === 1 ? 16 : 1;
            const speed = e.ctrlKey ? 0.01 : 0.0015;
            setZoom(zoomTarget * Math.exp(e.deltaY * unit * speed));
        },
        { passive: false }
    );

    // 5. Responsive Resize
    function resizeApp() {
        if (!viewport) return;
        width = viewport.clientWidth || window.innerWidth;
        height = viewport.clientHeight || window.innerHeight;
        camera.aspect = width / height;
        updateCameraPosition();
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);

        updateGlobeTargets();
    }
    window.addEventListener("resize", resizeApp);

    // 6. Hotspot Tag Screen Coordinate Projection
    const worldPos = new THREE.Vector3();
    const cameraDir = new THREE.Vector3();

    function updateHotspotTags() {
        camera.getWorldDirection(cameraDir);

        Object.values(sections).forEach((datum) => {
            if (!datum.tagEl) return;

            worldPos.copy(datum.localPos);
            worldPos.applyMatrix4(globeGroup.matrixWorld);

            const normal = worldPos.clone().normalize();
            const nodeToCam = camera.position.clone().sub(worldPos).normalize();
            const dotProduct = normal.dot(nodeToCam);

            // Backface Culling: only show when facing towards camera
            if (dotProduct > 0.12) {
                const projected = worldPos.clone().project(camera);
                const screenX = (projected.x * 0.5 + 0.5) * width;
                const screenY = (-projected.y * 0.5 + 0.5) * height;

                datum.tagEl.style.display = "flex";
                datum.tagEl.style.left = `${screenX}px`;
                datum.tagEl.style.top = `${screenY}px`;
                datum.tagEl.style.opacity = Math.min(1, Math.max(0.35, dotProduct * 1.3));
            } else {
                datum.tagEl.style.display = "none";
            }
        });
    }

    // 7. Main Render Loop
    let pulseScale = 1;
    let pulseDelta = 0.012;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function renderLoop() {
        // Continuous idle spin ONLY when card is CLOSED and not dragging
        if (!isCardOpen && !isDragging && !prefersReducedMotion) {
            targetRotY += 0.002;
        }

        // Smooth Damping to Target Rotation & Position
        globeGroup.rotation.y += (targetRotY - globeGroup.rotation.y) * 0.08;
        globeGroup.rotation.x += (targetRotX - globeGroup.rotation.x) * 0.08;

        zoom += (zoomTarget - zoom) * 0.12;
        camera.position.z = baseCamZ * zoom;

        // Convert the px offset to world units at the globe's depth, so it stays put while zooming
        const unitsPerPx = (2 * camera.position.z * Math.tan((camera.fov / 2) * (Math.PI / 180))) / height;
        globeOffset.x += (globeOffsetTarget.x - globeOffset.x) * 0.08;
        globeOffset.y += (globeOffsetTarget.y - globeOffset.y) * 0.08;
        globeGroup.position.x = globeOffset.x * unitsPerPx;
        globeGroup.position.y = -globeOffset.y * unitsPerPx;
        globeGroup.updateMatrixWorld();

        // Pulsing Rings
        if (!prefersReducedMotion) {
            pulseScale += pulseDelta;
            if (pulseScale > 1.35 || pulseScale < 0.95) pulseDelta *= -1;
            pulseRings.forEach((ring) => ring.scale.set(pulseScale, pulseScale, 1));
        }

        // Update Tag Positions
        updateHotspotTags();

        renderer.render(scene, camera);
        requestAnimationFrame(renderLoop);
    }

    renderLoop();

    // 8. URL Deep-Linking (e.g. ?section=projects)
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const initialSection = urlParams.get("section");
        if (initialSection && sections[initialSection]) {
            openCard(initialSection);
        }
    } catch (e) {}
});