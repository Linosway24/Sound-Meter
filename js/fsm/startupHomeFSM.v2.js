// /js/fsm/startupHomeFSM.v2.js
(() => {
    'use strict';

    const MENU_ITEMS = [
        "VIEW PAST STUDIES",
        "VIEW CURRENT STUDY",
        "VIEW SESSION",
        "SETUP",
        "UNIT INFO",
    ];
    const MEASURE_TYPES = ["SLM", "1/1", "1/3"];
    
    // Meter Set items (example structure - adjust based on actual device)
    const METER_SET_ITEMS = [
        { title: "Weighting", value: "A", options: ["A", "C", "Z"] },
        { title: "Time Constant", value: "Slow", options: ["Slow", "Fast", "Impulse"] },
        { title: "Range", value: 80, min: 30, max: 130, step: 10 },
    ];
    
    // SLM View menu items
    const SLM_VIEW_ITEMS = [
        "VIEW PAST STUDIES",
        "VIEW CURRENT STUDY",
        "VIEW SESSION",
    ];
    
    let _state = {
        viewId: "OFF",
        backlight: false,
        menu: { selectedIndex: 1 }, // highlight "VIEW CURRENT STUDY" by default
        ui: { measureTypeIndex: 0, measureTypeLabel: MEASURE_TYPES[0] },
        history: { hasPast: false },
        measurement: { 
            runtime: 0,
            state: "stopped", // "running", "paused", "stopped"
            isRunning: false
        },
        // SLM View menu state
        slmViewMenu: {
            visible: false,
            selectedIndex: 0
        },
        // Meter Set state
        meterSet: {
            visible: false,
            selectedIndex: 0,
            editMode: false,
            editFocus: "value", // "value" or "title"
            items: METER_SET_ITEMS.map(item => ({ ...item })) // deep copy
        },
        // Stop confirmation state
        stopConfirm: {
            visible: false,
            holdStartTime: null,
            holdDuration: 0,
            requiredHoldMs: 3000 // 3 seconds
        }
    };
    
    const _subs = new Set();
    function _emit(){ _subs.forEach(cb => cb(getStartupState())); }
    
    // Stop button hold tracking
    let stopButtonHoldTimer = null;
    let stopButtonHoldStart = null;
    
    function initStartupFSM(){
        _state = { 
            viewId: "OFF", 
            backlight: false,
            menu: { selectedIndex: 1 },
            ui: { measureTypeIndex: 0, measureTypeLabel: MEASURE_TYPES[0] },
            history: { hasPast: false },
            measurement: { runtime: 0, state: "stopped", isRunning: false },
            slmViewMenu: { visible: false, selectedIndex: 0 },
            meterSet: { visible: false, selectedIndex: 0, editMode: false, editFocus: "value", items: METER_SET_ITEMS.map(item => ({ ...item })) },
            stopConfirm: { visible: false, holdStartTime: null, holdDuration: 0, requiredHoldMs: 3000 }
        };
        _clearStopHoldTimer();
        _emit();
    }
    
    function subscribeStartup(cb){ _subs.add(cb); return ()=>_subs.delete(cb); }
    function getStartupState(){ return JSON.parse(JSON.stringify(_state)); }
    
    function _clearStopHoldTimer(){
        if(stopButtonHoldTimer){
            clearInterval(stopButtonHoldTimer);
            stopButtonHoldTimer = null;
        }
        stopButtonHoldStart = null;
    }
    
    function _startStopHoldTimer(){
        _clearStopHoldTimer();
        stopButtonHoldStart = Date.now();
        _state.stopConfirm.visible = true;
        _state.stopConfirm.holdStartTime = stopButtonHoldStart;
        _emit();
        
        stopButtonHoldTimer = setInterval(() => {
            if(!stopButtonHoldStart) return;
            const elapsed = Date.now() - stopButtonHoldStart;
            _state.stopConfirm.holdDuration = elapsed;
            
            if(elapsed >= _state.stopConfirm.requiredHoldMs){
                // 3 seconds elapsed - confirm stop
                _clearStopHoldTimer();
                _state.measurement.state = "stopped";
                _state.measurement.isRunning = false;
                _state.stopConfirm.visible = false;
                _state.stopConfirm.holdDuration = 0;
                _state.viewId = "slm_home_stopped";
                _emit();
            } else {
                _emit(); // Update progress
            }
        }, 50); // Update every 50ms for smooth progress
    }
    
    function dispatchStartup(evt){
        switch(evt.type){
            case "POWER":
                if(_state.viewId === "OFF"){
                    _state.viewId = "boot_screen"; _state.backlight = false; _emit();
                    setTimeout(()=>{ _state.viewId = "home_screen_dim"; _emit(); }, 1500);
                }
                break;
    
            case "BACKLIGHT":
                if(_state.viewId === "home_screen_dim"){
                    console.log('[FSM v2] Backlight: home_screen_dim → home_screen (backlight ON)');
                    _state.viewId = "home_screen"; _state.backlight = true; _emit();
                }
                else if(_state.viewId === "home_screen"){
                    console.log('[FSM v2] Backlight: home_screen → home_screen_dim (backlight OFF)');
                    _state.viewId = "home_screen_dim"; _state.backlight = false; _emit();
                }
                break;
    
            case "UP":
                if(_isInMeterSetEdit()){
                    _handleMeterSetUp();
                } else if(_state.slmViewMenu.visible){
                    _state.slmViewMenu.selectedIndex = (_state.slmViewMenu.selectedIndex + SLM_VIEW_ITEMS.length - 1) % SLM_VIEW_ITEMS.length;
                    _emit();
                } else if(isHome()){
                    _state.menu.selectedIndex = (_state.menu.selectedIndex + MENU_ITEMS.length - 1) % MENU_ITEMS.length;
                    _emit();
                }
                break;
    
            case "DOWN":
                if(_isInMeterSetEdit()){
                    _handleMeterSetDown();
                } else if(_state.slmViewMenu.visible){
                    _state.slmViewMenu.selectedIndex = (_state.slmViewMenu.selectedIndex + 1) % SLM_VIEW_ITEMS.length;
                    _emit();
                } else if(isHome()){
                    _state.menu.selectedIndex = (_state.menu.selectedIndex + 1) % MENU_ITEMS.length;
                    _emit();
                }
                break;
            
            case "LEFT":
                if(_isInMeterSetEdit() && _state.meterSet.editFocus === "value"){
                    // Move focus from value to title
                    _state.meterSet.editFocus = "title";
                    _emit();
                }
                break;
            
            case "RIGHT":
                if(_isInMeterSetEdit() && _state.meterSet.editFocus === "title"){
                    // Move focus from title to value
                    _state.meterSet.editFocus = "value";
                    _emit();
                }
                break;
    
            case "ENTER":
                if(_state.stopConfirm.visible){
                    // Cancel stop confirmation
                    _clearStopHoldTimer();
                    _state.stopConfirm.visible = false;
                    _state.stopConfirm.holdDuration = 0;
                    _emit();
                } else if(_isInMeterSetEdit()){
                    _handleMeterSetEnter();
                } else if(_state.slmViewMenu.visible){
                    _handleSlmViewMenuEnter();
                } else if(_state.meterSet.visible){
                    _handleMeterSetMenuEnter();
                } else if(_state.viewId === "setup_menu"){
                    // In setup menu - navigate to Meter Set (for now, assume first item is Meter Set)
                    // TODO: Add proper setup menu item selection logic
                    navigateToMeterSet();
                } else if(isHome()){
                    routeFromHome();
                } else if(_isSlmRunning()){
                    // Pause measurement
                    _state.measurement.state = "paused";
                    _state.measurement.isRunning = false;
                    _state.viewId = "slm_home_paused";
                    _emit();
                } else if(_isSlmPaused()){
                    // Resume measurement
                    _state.measurement.state = "running";
                    _state.measurement.isRunning = true;
                    _state.viewId = "slm_home";
                    _emit();
                } else if(_isSlmStopped()){
                    // Start measurement
                    _state.measurement.state = "running";
                    _state.measurement.isRunning = true;
                    _state.viewId = "slm_home";
                    _emit();
                }
                break;
            
            case "ESC":
                if(_state.stopConfirm.visible){
                    // Cancel stop confirmation
                    _clearStopHoldTimer();
                    _state.stopConfirm.visible = false;
                    _state.stopConfirm.holdDuration = 0;
                    _emit();
                } else if(_isInMeterSetEdit()){
                    // Cancel meter set edit - return to meter set menu
                    _state.meterSet.editMode = false;
                    _state.meterSet.editFocus = "value";
                    _emit();
                } else if(_state.meterSet.visible){
                    // Exit meter set menu - return to setup menu
                    _state.meterSet.visible = false;
                    _state.meterSet.selectedIndex = 0;
                    _state.viewId = "setup_menu";
                    _emit();
                } else if(_state.slmViewMenu.visible){
                    // Close SLM view menu
                    _state.slmViewMenu.visible = false;
                    _state.slmViewMenu.selectedIndex = 0;
                    if(_isSlmRunning() || _isSlmPaused() || _isSlmStopped()){
                        // Return to SLM screen
                        _state.viewId = _state.measurement.state === "running" ? "slm_home" : 
                                       _state.measurement.state === "paused" ? "slm_home_paused" : 
                                       "slm_home_stopped";
                    } else {
                        _state.viewId = "home_screen";
                    }
                    _emit();
                } else if(_state.viewId === "setup_menu"){
                    // Exit setup menu - return to home
                    _state.viewId = "home_screen";
                    _emit();
                } else if(_isSlmRunning() || _isSlmPaused() || _isSlmStopped()){
                    // Exit SLM - return to home
                    _state.measurement.state = "stopped";
                    _state.measurement.isRunning = false;
                    _state.viewId = "home_screen";
                    _emit();
                }
                break;
    
            case "SOFT1": // cycle SLM → 1/1 → 1/3
                if(isHome()){
                    _state.ui.measureTypeIndex = (_state.ui.measureTypeIndex + 1) % MEASURE_TYPES.length;
                    _state.ui.measureTypeLabel = MEASURE_TYPES[_state.ui.measureTypeIndex];
                    _emit();
                }
                break;
            
            case "SOFT2": // View menu (👓) - only when in SLM screens
                if(_isSlmRunning() || _isSlmPaused() || _isSlmStopped()){
                    _state.slmViewMenu.visible = true;
                    _state.slmViewMenu.selectedIndex = 0;
                    _state.viewId = "slm_view_menu";
                    _emit();
                }
                break;
            
            case "RUNPAUSE":
                if(_isSlmRunning()){
                    // Pause
                    _state.measurement.state = "paused";
                    _state.measurement.isRunning = false;
                    _state.viewId = "slm_home_paused";
                    _emit();
                } else if(_isSlmPaused()){
                    // Resume
                    _state.measurement.state = "running";
                    _state.measurement.isRunning = true;
                    _state.viewId = "slm_home";
                    _emit();
                } else if(_isSlmStopped() || isHome()){
                    // Start measurement
                    _state.measurement.state = "running";
                    _state.measurement.isRunning = true;
                    _state.viewId = "slm_home";
                    _emit();
                }
                break;
            
            case "STOP_DOWN":
                if(_isSlmRunning() || _isSlmPaused()){
                    _startStopHoldTimer();
                }
                break;
            
            case "STOP_UP":
                if(_state.stopConfirm.visible){
                    // Button released before 3 seconds - cancel
                    _clearStopHoldTimer();
                    _state.stopConfirm.visible = false;
                    _state.stopConfirm.holdDuration = 0;
                    _emit();
                }
                break;
        }
    }
    
    function isHome(){ return _state.viewId === "home_screen" || _state.viewId === "home_screen_dim"; }
    
    function _isSlmRunning(){ return _state.viewId === "slm_home" && _state.measurement.state === "running"; }
    function _isSlmPaused(){ return _state.viewId === "slm_home_paused" && _state.measurement.state === "paused"; }
    function _isSlmStopped(){ return _state.viewId === "slm_home_stopped" && _state.measurement.state === "stopped"; }
    
    function _isInMeterSetEdit(){ return _state.meterSet.visible && _state.meterSet.editMode; }
    
    function routeFromHome(){
		const index = _state.menu.selectedIndex;
		switch(index){
			case 0: {
				// VIEW PAST STUDIES → toast only (no screen change)
				try {
					if(typeof window !== 'undefined' && typeof window.showToast === 'function'){
						window.showToast("No studies yet");
					} else {
						console.log('[FSM v2] No studies yet');
					}
				} catch(_) {}
				break;
			}
			case 1: {
				// VIEW CURRENT STUDY → home_screen_running
				_state.measurement.state = "running";
				_state.measurement.isRunning = true;
				_state.viewId = "home_screen_running";
				_emit();
				break;
			}
			case 2: {
				// VIEW SESSION → slm_home (enter SLM running)
				_state.measurement.state = "running";
				_state.measurement.isRunning = true;
				_state.viewId = "slm_home";
				_emit();
				break;
			}
			case 3: {
				// SETUP → setup_menu
				_state.viewId = "setup_menu";
				_emit();
				break;
			}
			case 4: {
				// UNIT INFO → unit_info
				_state.viewId = "unit_info";
				_emit();
				break;
			}
		}
    }
    
    function _handleSlmViewMenuEnter(){
        const item = SLM_VIEW_ITEMS[_state.slmViewMenu.selectedIndex];
        _state.slmViewMenu.visible = false;
        _state.slmViewMenu.selectedIndex = 0;
        
        if(item === "VIEW PAST STUDIES"){
            _state.viewId = "view_past_studies";
        } else if(item === "VIEW CURRENT STUDY"){
            _state.viewId = "view_current_study";
        } else if(item === "VIEW SESSION"){
            _state.viewId = "view_session";
        }
        _emit();
    }
    
    function _handleMeterSetMenuEnter(){
        // Enter meter set edit mode
        _state.meterSet.editMode = true;
        _state.meterSet.editFocus = "value";
        _state.viewId = "meter_set_edit";
        _emit();
    }
    
    function _handleMeterSetEnter(){
        if(_state.meterSet.editFocus === "value"){
            // Save value and move focus to title
            _state.meterSet.editFocus = "title";
            _emit();
        } else if(_state.meterSet.editFocus === "title"){
            // Exit edit mode and return to setup menu
            _state.meterSet.editMode = false;
            _state.meterSet.editFocus = "value";
            _state.meterSet.visible = false;
            _state.viewId = "setup_menu";
            _emit();
        }
    }
    
    function _handleMeterSetUp(){
        const item = _state.meterSet.items[_state.meterSet.selectedIndex];
        if(_state.meterSet.editFocus === "value"){
            if(item.options){
                // Cycle through options
                const currentIndex = item.options.indexOf(item.value);
                const newIndex = (currentIndex + item.options.length - 1) % item.options.length;
                item.value = item.options[newIndex];
            } else if(item.min !== undefined){
                // Increment numeric value
                item.value = Math.min(item.max, item.value + (item.step || 1));
            }
            _emit();
        }
    }
    
    function _handleMeterSetDown(){
        const item = _state.meterSet.items[_state.meterSet.selectedIndex];
        if(_state.meterSet.editFocus === "value"){
            if(item.options){
                // Cycle through options
                const currentIndex = item.options.indexOf(item.value);
                const newIndex = (currentIndex + 1) % item.options.length;
                item.value = item.options[newIndex];
            } else if(item.min !== undefined){
                // Decrement numeric value
                item.value = Math.max(item.min, item.value - (item.step || 1));
            }
            _emit();
        }
    }
    
    // Handle navigation to Meter Set from Setup menu
    function navigateToMeterSet(){
        _state.meterSet.visible = true;
        _state.meterSet.selectedIndex = 0;
        _state.meterSet.editMode = false;
        _state.viewId = "meter_set_menu";
        _emit();
    }

	// Optional debug overlay for home menu selection (sandbox only)
	(function setupHomeMenuDebugOverlay(){
		let overlayEl = null;

		function isSandboxPage(){
			return typeof window !== 'undefined' && (window.location.pathname.includes('/test/') || window.location.pathname.includes('/sandbox/'));
		}

		function shouldShowOverlay(){
			if(typeof window === 'undefined') return false;
			const qs = new URLSearchParams(window.location.search);
			const viaQuery = qs.get('debugMenu') === '1';
			return (window.DEBUG_HOME_MENU_OVERLAY === true) || viaQuery;
		}

		function removeOverlay(){
			if(overlayEl && overlayEl.parentNode){ overlayEl.parentNode.removeChild(overlayEl); }
			overlayEl = null;
		}

		function ensureOverlay(root){
			if(overlayEl) return overlayEl;
			overlayEl = document.createElement('div');
			overlayEl.id = 'home-menu-debug-overlay';
			overlayEl.style.position = 'absolute';
			overlayEl.style.background = 'rgba(0, 255, 0, 0.2)';
			overlayEl.style.outline = '2px solid rgba(0, 180, 0, 0.6)';
			overlayEl.style.pointerEvents = 'none';
			overlayEl.style.zIndex = '2000';
			root.appendChild(overlayEl);
			return overlayEl;
		}

		function updateOverlayPosition(state){
			if(!isSandboxPage() || !shouldShowOverlay()){
				removeOverlay();
				return;
			}
			if(!state || !(state.viewId === 'home_screen' || state.viewId === 'home_screen_dim')){
				removeOverlay();
				return;
			}
			const overlayRoot = document.querySelector('.overlay-layer');
			const lcdMain = document.querySelector('.lcd__main');
			if(!overlayRoot || !lcdMain){
				removeOverlay();
				return;
			}
			// Find selected menu item in rendered DOM
			const selected = lcdMain.querySelector('.menu-item.menu-item--selected');
			const anyItem = lcdMain.querySelector('.menu-item');
			if(!selected && !anyItem){
				removeOverlay();
				return;
			}
			const rootRect = overlayRoot.getBoundingClientRect();
			let targetRect = selected ? selected.getBoundingClientRect() : anyItem.getBoundingClientRect();
			// Create/update overlay element
			const el = ensureOverlay(overlayRoot);
			// Position overlay to cover the current line
			const left = Math.max(0, targetRect.left - rootRect.left);
			const top = Math.max(0, targetRect.top - rootRect.top);
			const width = Math.max(0, targetRect.width);
			const height = Math.max(0, targetRect.height || 24);
			el.style.left = left + 'px';
			el.style.top = top + 'px';
			el.style.width = width + 'px';
			el.style.height = height + 'px';
		}

		// Subscribe to FSM updates to drive overlay
		subscribeStartup((state) => {
			// Defer to next frame to ensure the DOM for the screen is rendered
			if(typeof requestAnimationFrame === 'function'){
				requestAnimationFrame(() => updateOverlayPosition(state));
			} else {
				setTimeout(() => updateOverlayPosition(state), 0);
			}
		});
	})();

    // Export to window
    window.initStartupFSM = initStartupFSM;
    window.subscribeStartup = subscribeStartup;
    window.getStartupState = getStartupState;
    window.dispatchStartup = dispatchStartup;
    window.navigateToMeterSet = navigateToMeterSet;
})();

