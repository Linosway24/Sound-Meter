// LCD Display Management

const Display = {
    // Display state
    state: {
        powered: false,
        backlightOn: false,
        currentScreen: 'home', // 'home', 'menu', 'measurement', etc.
        softKeyLabels: ['', '', '', '']
    },
    
    /**
     * Initialize display
     */
    init() {
        this.updateBacklight();
        this.updateSoftKeyLabels();
        this.render();
    },
    
    /**
     * Update backlight state
     */
    updateBacklight() {
        const lcd = getEl('lcd-display');
        const state = Config.BACKLIGHT.STATE;
        
        this.state.backlightOn = state;
        
        if (state) {
            lcd.classList.add('backlight-on');
            lcd.classList.remove('backlight-off');
        } else {
            lcd.classList.remove('backlight-on');
            lcd.classList.add('backlight-off');
        }
    },
    
    /**
     * Set current screen
     * @param {string} screen - Screen identifier
     */
    setScreen(screen) {
        this.state.currentScreen = screen;
        this.render();
    },
    
    /**
     * Update soft key labels
     * @param {Array<string>} labels - Array of 4 labels
     */
    updateSoftKeyLabels(labels = ['', '', '', '']) {
        this.state.softKeyLabels = labels;
        for (let i = 0; i < 4; i++) {
            const labelEl = getEl(`soft-key-${i + 1}-label`);
            labelEl.textContent = labels[i] || '';
        }
    },
    
    /**
     * Render current display content
     */
    render() {
        const mainEl = getEl('display-main');
        const statusEl = getEl('display-status');
        
        if (!this.state.powered) {
            mainEl.innerHTML = '<div style="text-align: center; font-size: 32px; margin-top: 250px;">OFF</div>';
            statusEl.innerHTML = '';
            return;
        }
        
        switch (this.state.currentScreen) {
            case 'home':
                this.renderHome();
                break;
            case 'menu':
                this.renderMenu();
                break;
            case 'measurement':
                this.renderMeasurement();
                break;
            default:
                this.renderHome();
        }
    },
    
    /**
     * Render home screen
     */
    renderHome() {
        const mainEl = getEl('display-main');
        const statusEl = getEl('display-status');
        
        mainEl.innerHTML = `
            <div style="text-align: center; font-size: 28px; margin-bottom: 30px;">
                Quest SoundPro SE-DL
            </div>
            <div style="text-align: center; font-size: 20px; color: #888;">
                Firmware R.13J
            </div>
        `;
        
        statusEl.innerHTML = `
            <div>W: ${Config.current.weighting}</div>
            <div>T: ${Config.current.timeConstant}</div>
            <div>R: ${Config.current.range} dB</div>
        `;
        
        this.updateSoftKeyLabels(['Menu', '', '', '']);
    },
    
    /**
     * Render menu screen
     */
    renderMenu() {
        // Menu rendering is handled by Menu module
        // This is a placeholder
        const mainEl = getEl('display-main');
        mainEl.innerHTML = '<div style="padding: 20px;">Menu</div>';
    },
    
    /**
     * Render measurement screen
     */
    renderMeasurement() {
        const mainEl = getEl('display-main');
        const statusEl = getEl('display-status');
        const results = Simulator.getResults();
        
        if (!results.running && !results.paused) {
            // Not running - show ready state
            mainEl.innerHTML = `
                <div style="text-align: center; font-size: 24px; margin-top: 200px;">
                    Ready to Measure
                </div>
            `;
        } else {
            // Running or paused - show measurements
            const timeConstant = Config.current.timeConstant;
            let primaryValue = results.currentSPL || 0;
            let primaryLabel = 'SPL';
            
            if (results.running && !results.paused) {
                primaryValue = results.leq !== null ? results.leq : results.currentSPL;
            }
            
            mainEl.innerHTML = `
                <div class="measurement-display">
                    <div class="measurement-label">${primaryLabel}</div>
                    <div class="measurement-value">${formatSPL(primaryValue)} dB</div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px; font-size: 20px;">
                    <div>
                        <div style="color: #888;">Lmax</div>
                        <div>${formatSPL(results.lmax)}</div>
                    </div>
                    <div>
                        <div style="color: #888;">Lmin</div>
                        <div>${formatSPL(results.lmin)}</div>
                    </div>
                </div>
            `;
        }
        
        statusEl.innerHTML = `
            <div>${results.running ? (results.paused ? 'PAUSED' : 'RUNNING') : 'STOPPED'}</div>
            <div>${formatTime(results.elapsedTime || 0)}</div>
            <div>W:${Config.current.weighting} T:${Config.current.timeConstant}</div>
        `;
        
        if (results.dose !== null) {
            statusEl.innerHTML += `<div>Dose: ${formatSPL(results.dose, 1)}%</div>`;
        }
        
        this.updateSoftKeyLabels(['', '', 'Pause', 'Stop']);
    },
    
    /**
     * Power on display
     */
    powerOn() {
        this.state.powered = true;
        this.state.currentScreen = 'home';
        this.render();
    },
    
    /**
     * Power off display
     */
    powerOff() {
        this.state.powered = false;
        this.state.currentScreen = 'home';
        this.render();
    }
};

