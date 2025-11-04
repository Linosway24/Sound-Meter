// Button Handler System

const Buttons = {
    // Press detection state
    pressState: {
        powerPressStart: null,
        powerPressThreshold: 800, // milliseconds
        activePress: null
    },
    
    /**
     * Initialize button handlers
     */
    init() {
        this.setupSoftKeys();
        this.setupNavigation();
        this.setupFunctionButtons();
        this.setupKeyboard();
    },
    
    /**
     * Setup soft key buttons (1-4)
     */
    setupSoftKeys() {
        for (let i = 1; i <= 4; i++) {
            const key = document.querySelector(`.soft-key[data-key="${i}"]`);
            if (key) {
                key.addEventListener('click', () => this.handleSoftKey(i));
            }
        }
    },
    
    /**
     * Setup navigation cluster
     */
    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-button');
        navButtons.forEach(btn => {
            const action = btn.getAttribute('data-action');
            btn.addEventListener('click', () => this.handleNavigation(action));
        });
    },
    
    /**
     * Setup function buttons
     */
    setupFunctionButtons() {
        // Alt f button
        const altF = getEl('btn-alt-f');
        altF.addEventListener('click', () => this.handleAltF());
        
        // Backlight button
        const backlight = getEl('btn-backlight');
        backlight.addEventListener('mousedown', (e) => {
            this.pressState.activePress = 'backlight';
            this.pressState.powerPressStart = Date.now();
        });
        backlight.addEventListener('mouseup', () => {
            const duration = Date.now() - this.pressState.powerPressStart;
            if (duration < this.pressState.powerPressThreshold) {
                this.handleBacklight();
            }
            this.pressState.activePress = null;
        });
        
        // Run/Pause button
        const runPause = getEl('btn-run-pause');
        runPause.addEventListener('click', () => this.handleRunPause());
        
        // Stop button
        const stop = getEl('btn-stop');
        stop.addEventListener('click', () => this.handleStop());
        
        // Power button (long press detection)
        const power = getEl('btn-power');
        power.addEventListener('mousedown', () => {
            this.pressState.powerPressStart = Date.now();
            this.pressState.activePress = 'power';
        });
        power.addEventListener('mouseup', () => {
            const duration = Date.now() - this.pressState.powerPressStart;
            if (duration < this.pressState.powerPressThreshold) {
                this.handleEsc(); // Short press = Esc
            } else {
                this.handlePower(); // Long press = Power
            }
            this.pressState.activePress = null;
            this.pressState.powerPressStart = null;
        });
    },
    
    /**
     * Setup keyboard handlers
     */
    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.handleNavigation('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.handleNavigation('down');
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.handleNavigation('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.handleNavigation('right');
                    break;
                case 'Enter':
                    e.preventDefault();
                    this.handleNavigation('enter');
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.handleEsc();
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                    e.preventDefault();
                    this.handleSoftKey(parseInt(e.key));
                    break;
                case 'f':
                case 'F':
                    e.preventDefault();
                    this.handleAltF();
                    break;
            }
        });
    },
    
    /**
     * Handle soft key press
     * @param {number} key - Soft key number (1-4)
     */
    handleSoftKey(key) {
        if (!Device.state.powered) return;
        
        Menu.handleSoftKey(key);
    },
    
    /**
     * Handle navigation input
     * @param {string} direction - 'up', 'down', 'left', 'right', 'enter'
     */
    handleNavigation(direction) {
        if (!Device.state.powered) return;
        
        Menu.handleNavigation(direction);
    },
    
    /**
     * Handle Alt f button
     */
    handleAltF() {
        if (!Device.state.powered) return;
        
        Menu.toggleAltMenu();
    },
    
    /**
     * Handle backlight button (short press = toggle)
     */
    handleBacklight() {
        if (!Device.state.powered) return;
        
        const newState = Config.toggleBacklight();
        if (newState !== null) {
            Display.updateBacklight();
        }
    },
    
    /**
     * Handle Run/Pause button
     */
    handleRunPause() {
        if (!Device.state.powered) return;
        
        if (Simulator.state.running) {
            if (Simulator.state.paused) {
                Simulator.start(); // Resume
            } else {
                Simulator.pause(); // Pause
            }
        } else {
            Simulator.start(); // Start
            Display.setScreen('measurement');
        }
        
        Display.render();
    },
    
    /**
     * Handle Stop button
     */
    handleStop() {
        if (!Device.state.powered) return;
        
        Simulator.stop();
        Display.render();
    },
    
    /**
     * Handle Esc (short press on power button)
     */
    handleEsc() {
        if (!Device.state.powered) return;
        
        Menu.handleEsc();
    },
    
    /**
     * Handle Power (long press on power button)
     */
    handlePower() {
        Device.togglePower();
    }
};

