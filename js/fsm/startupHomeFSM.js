// /js/fsm/startupHomeFSM.js
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
    
    let _state = {
        viewId: "OFF",
        backlight: false,
        menu: { selectedIndex: 1 }, // highlight "VIEW CURRENT STUDY" by default
        ui: { measureTypeIndex: 0, measureTypeLabel: MEASURE_TYPES[0] },
        history: { hasPast: false },
        measurement: { runtime: 0 }
    };
    
    const _subs = new Set();
    function _emit(){ _subs.forEach(cb => cb(getStartupState())); }
    
    function initStartupFSM(){
        _state = { ..._state, viewId: "OFF", backlight: false };
        _emit();
    }
    
    function subscribeStartup(cb){ _subs.add(cb); return ()=>_subs.delete(cb); }
    function getStartupState(){ return JSON.parse(JSON.stringify(_state)); }
    
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
                    console.log('[FSM] Backlight: home_screen_dim → home_screen (backlight ON)');
                    _state.viewId = "home_screen"; _state.backlight = true; _emit();
                }
                else if(_state.viewId === "home_screen"){
                    console.log('[FSM] Backlight: home_screen → home_screen_dim (backlight OFF)');
                    _state.viewId = "home_screen_dim"; _state.backlight = false; _emit();
                }
                break;
    
            case "UP":
                if(isHome()){ _state.menu.selectedIndex = (_state.menu.selectedIndex + MENU_ITEMS.length - 1) % MENU_ITEMS.length; _emit(); }
                break;
    
            case "DOWN":
                if(isHome()){ _state.menu.selectedIndex = (_state.menu.selectedIndex + 1) % MENU_ITEMS.length; _emit(); }
                break;
    
            case "ENTER":
                if(!isHome()) break;
                routeFromHome();
                break;
    
            case "SOFT1": // cycle SLM → 1/1 → 1/3
                if(isHome()){
                    _state.ui.measureTypeIndex = (_state.ui.measureTypeIndex + 1) % MEASURE_TYPES.length;
                    _state.ui.measureTypeLabel = MEASURE_TYPES[_state.ui.measureTypeIndex];
                    _emit();
                }
                break;
        }
    }
    
    function isHome(){ return _state.viewId === "home_screen" || _state.viewId === "home_screen_dim"; }
    function routeFromHome(){
        const item = MENU_ITEMS[_state.menu.selectedIndex];
        if(item === "VIEW PAST STUDIES"){
            if(!_state.history.hasPast){ return; } // no-op for now
            _state.viewId = "view_past_studies";
        } else if(item === "VIEW CURRENT STUDY"){
            _state.viewId = "view_current_study";
        } else if(item === "VIEW SESSION"){
            _state.viewId = "view_session";
        } else if(item === "SETUP"){
            _state.viewId = "setup_menu";
        } else if(item === "UNIT INFO"){
            _state.viewId = "unit_info";
        }
        _emit();
    }

    // Export to window
    window.initStartupFSM = initStartupFSM;
    window.subscribeStartup = subscribeStartup;
    window.getStartupState = getStartupState;
    window.dispatchStartup = dispatchStartup;
})();