import * as THREE from '../vendor/three/three.module.js';

const stage = document.getElementById('training-intro-logo-stage');
const canvas = document.getElementById('training-intro-logo-canvas');
const intro = document.getElementById('training-intro');

if (stage && canvas && intro) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    try {
        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
        });
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(36, 774 / 743, 0.1, 20);
        camera.position.z = 3.35;

        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
            'assets/branding/bee-logo.png',
            (texture) => {
                if (stage.classList.contains('three-unavailable')) {
                    texture.dispose();
                    renderer.dispose();
                    return;
                }

                texture.colorSpace = THREE.SRGBColorSpace;
                texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

                const material = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    opacity: reducedMotion ? 1 : 0,
                    side: THREE.DoubleSide,
                    depthWrite: false,
                    toneMapped: false,
                });
                const geometry = new THREE.PlaneGeometry((774 / 743) * 2, 2);
                const logo = new THREE.Mesh(geometry, material);
                scene.add(logo);

                function resizeRenderer() {
                    const width = Math.max(1, stage.clientWidth);
                    const height = Math.max(1, stage.clientHeight);
                    renderer.setSize(width, height, false);
                    camera.aspect = width / height;
                    camera.updateProjectionMatrix();
                }

                resizeRenderer();
                const resizeObserver = new ResizeObserver(resizeRenderer);
                resizeObserver.observe(stage);
                stage.classList.add('is-three-ready');

                if (reducedMotion) {
                    logo.rotation.set(0, 0, 0);
                    logo.scale.setScalar(1);
                    renderer.render(scene, camera);
                    return;
                }

                const duration = 2600;
                const startDelay = 680;
                let frameId = 0;
                let animationStarted = false;

                const clamp01 = (value) => Math.min(1, Math.max(0, value));
                const easeInOutSine = (value) => -(Math.cos(Math.PI * value) - 1) / 2;
                const easeOutBack = (value) => {
                    const overshoot = 1.18;
                    const shifted = value - 1;
                    return 1 + (overshoot + 1) * Math.pow(shifted, 3) + overshoot * Math.pow(shifted, 2);
                };
                const smoothstep = (value) => value * value * (3 - 2 * value);

                function startLogoAnimation() {
                    if (animationStarted) return;
                    animationStarted = true;
                    const startTime = performance.now() + startDelay;

                    function renderFrame(now) {
                        const progress = clamp01((now - startTime) / duration);
                        const rotationProgress = easeInOutSine(progress);
                        const scaleProgress = easeOutBack(progress);
                        const opacityProgress = smoothstep(clamp01(progress / 0.16));

                        logo.rotation.y = -Math.PI * 4 * (1 - rotationProgress);
                        logo.rotation.z = THREE.MathUtils.degToRad(-7) * (1 - rotationProgress);
                        logo.scale.setScalar(0.08 + (0.92 * scaleProgress));
                        material.opacity = opacityProgress;

                        renderer.render(scene, camera);

                        if (progress < 1 && !intro.classList.contains('is-complete')) {
                            frameId = window.requestAnimationFrame(renderFrame);
                        } else {
                            logo.rotation.set(0, 0, 0);
                            logo.scale.setScalar(1);
                            material.opacity = 1;
                            renderer.render(scene, camera);
                        }
                    }

                    frameId = window.requestAnimationFrame(renderFrame);
                }

                if (intro.classList.contains('intro-started')) {
                    startLogoAnimation();
                } else {
                    intro.addEventListener('training-intro-start', startLogoAnimation, { once: true });
                }

                window.addEventListener('pagehide', () => {
                    window.cancelAnimationFrame(frameId);
                    resizeObserver.disconnect();
                    geometry.dispose();
                    material.dispose();
                    texture.dispose();
                    renderer.dispose();
                }, { once: true });
            },
            undefined,
            () => {
                stage.classList.add('three-unavailable');
            },
        );
    } catch (error) {
        stage.classList.add('three-unavailable');
    }
}
