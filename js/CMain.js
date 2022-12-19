window.GLOBAL_AUDIO_SWITCH = false;

Howler.volume(0);

function CMain(oData){
    var _bUpdate;
    var _iCurResource = 0;
    var RESOURCE_TO_LOAD = 0;
    var _iState = STATE_LOADING;
    var _oData;
    
    var _oPreloader;
    var _oMenu;
    var _oModeMenu;
    var _oHelp;
    var _oGame;

    this.initContainer = function(){
        this.handleVisibility();

        s_oCanvas = document.getElementById("canvas");
        s_oStage = new createjs.Stage(s_oCanvas);
        s_oStage.preventSelection = false;
        createjs.Touch.enable(s_oStage);
		
	s_bMobile = jQuery.browser.mobile;
        if(s_bMobile === false){
            s_oStage.enableMouseOver(20);  
            $('body').on('contextmenu', '#canvas', function(e){ return false; });
        }
		
        s_iPrevTime = new Date().getTime();

	createjs.Ticker.addEventListener("tick", this._update);
        createjs.Ticker.setFPS(24);
        
        if(navigator.userAgent.match(/Windows Phone/i)){
                DISABLE_SOUND_MOBILE = false;
        }
        
        s_oSpriteLibrary  = new CSpriteLibrary();

        //ADD PRELOADER
        _oPreloader = new CPreloader();
		
	
    };
    
    this.preloaderReady = function(){
        //if(DISABLE_SOUND_MOBILE === false){
        this._initSounds();
        //}
        
        this._loadImages();
        _bUpdate = true;
    };

    this.handleVisibility = function () {
        var hidden, visibilityChange; 
        if (typeof document.hidden !== "undefined") {
            hidden = "hidden";
            visibilityChange = "visibilitychange";
        } else if (typeof document.msHidden !== "undefined") {
            hidden = "msHidden";
            visibilityChange = "msvisibilitychange";
        } else if (typeof document.webkitHidden !== "undefined") {
            hidden = "webkitHidden";
            visibilityChange = "webkitvisibilitychange";
        }
 
        var blurred = false;
        var visible = true;

        function handleVisibilityChange() {
            visible = !document[hidden];
            console.log("Visibility change", visible);
            updateHowlerVolume();
        }

        function updateHowlerVolume (){
            if(blurred || !visible || !window.GLOBAL_AUDIO_SWITCH) {
                Howler.volume(0);
            } else {
                Howler.volume(1);
            }
        }

        window.addEventListener("blur", ()=>{
            console.log("Blur!");
            blurred = true;
            updateHowlerVolume();
        });
        
        window.addEventListener("focus", ()=>{
            console.log("Focus!");
            blurred = false;
            updateHowlerVolume();
        });

        document.addEventListener("blur", ()=>{
            console.log("Blur!");
            blurred = true;
            updateHowlerVolume();
        });
        
        document.addEventListener("focus", ()=>{
            console.log("Focus!");
            blurred = false;
            updateHowlerVolume();
        });
        
        document.addEventListener(visibilityChange, handleVisibilityChange, false);
    };
    
    this.soundLoaded = function(){
        _iCurResource++;
        var iPerc = Math.floor(_iCurResource/RESOURCE_TO_LOAD *100);
        _oPreloader.refreshLoader(iPerc);

         if(_iCurResource === RESOURCE_TO_LOAD){
             _oPreloader.unload();

            s_oSoundtrack = playSound("soundtrack",1,-1);
            
            IkemuStatsAPI.init();
            this.gotoMenu();
         }
    };

    this._loadSound = function (path, name) {
        var sound = new Howl({
            src: [path + '.webm', path + '.ogg', path + '.m4a', path + '.mp3']
        });
        var self = this;
          
        sound.once('load', function(){
            window.audios[name] = sound;
            self.soundLoaded();
        });
          
    };

    this._initSounds = function () {
        window.audios = [];

        this._loadSound("./sounds/fr_soundtrack", "soundtrack");
        this._loadSound("./sounds/press_button", "click");
        this._loadSound("./sounds/fr_game_over", "game_over");                
        this._loadSound("./sounds/fr_frog_arrived", "frog_arrived");
        this._loadSound("./sounds/fr_frog_death_road", "splat");
        this._loadSound("./sounds/fr_frog_death_water", "drown");
        this._loadSound("./sounds/fr_frog_jump", "jump", 5);
        this._loadSound("./sounds/fr_power_up", "eat_fly");
        this._loadSound("./sounds/fr_win_level", "win_level");
        this._loadSound("./sounds/fr_horn_1", "big_hornet");
        this._loadSound("./sounds/fr_horn_2", "small_hornet");

        RESOURCE_TO_LOAD += 11;

    }
    
    this._initSoundsOLD = function(){
         if (!createjs.Sound.initializeDefaultPlugins()) {
             return;
         }

        if(navigator.userAgent.indexOf("Opera")>0 || navigator.userAgent.indexOf("OPR")>0){
                createjs.Sound.alternateExtensions = ["mp3"];
                createjs.Sound.addEventListener("fileload", createjs.proxy(this.soundLoaded, this));

                createjs.Sound.registerSound("./sounds/fr_soundtrack.ogg", "soundtrack");
                createjs.Sound.registerSound("./sounds/press_button.ogg", "click");
                createjs.Sound.registerSound("./sounds/fr_game_over.ogg", "game_over");                
                createjs.Sound.registerSound("./sounds/fr_frog_arrived.ogg", "frog_arrived");
                createjs.Sound.registerSound("./sounds/fr_frog_death_road.ogg", "splat");
                createjs.Sound.registerSound("./sounds/fr_frog_death_water.ogg", "drown");
                createjs.Sound.registerSound("./sounds/fr_frog_jump.ogg", "jump", 5);
                createjs.Sound.registerSound("./sounds/fr_power_up.ogg", "eat_fly");
                createjs.Sound.registerSound("./sounds/fr_win_level.ogg", "win_level");
                createjs.Sound.registerSound("./sounds/fr_horn_1.ogg", "big_hornet");
                createjs.Sound.registerSound("./sounds/fr_horn_2.ogg", "small_hornet");
            
        }else{
                createjs.Sound.alternateExtensions = ["ogg"];
                createjs.Sound.addEventListener("fileload", createjs.proxy(this.soundLoaded, this));
                
                createjs.Sound.registerSound("./sounds/fr_soundtrack.mp3", "soundtrack");
                createjs.Sound.registerSound("./sounds/press_button.mp3", "click");
                createjs.Sound.registerSound("./sounds/fr_game_over.mp3", "game_over");
                createjs.Sound.registerSound("./sounds/fr_frog_arrived.mp3", "frog_arrived");
                createjs.Sound.registerSound("./sounds/fr_frog_death_road.mp3", "splat");
                createjs.Sound.registerSound("./sounds/fr_frog_death_water.mp3", "drown");
                createjs.Sound.registerSound("./sounds/fr_frog_jump.mp3", "jump", 5);
                createjs.Sound.registerSound("./sounds/fr_power_up.mp3", "eat_fly");
                createjs.Sound.registerSound("./sounds/fr_win_level.mp3", "win_level");
                createjs.Sound.registerSound("./sounds/fr_horn_1.mp3", "big_hornet");
                createjs.Sound.registerSound("./sounds/fr_horn_2.mp3", "small_hornet");

        }
        
        RESOURCE_TO_LOAD += 11;
        
    };

    this._loadImages = function(){
        s_oSpriteLibrary.init( this._onImagesLoaded,this._onAllImagesLoaded, this );

        s_oSpriteLibrary.addSprite("but_play","./images/but_play.png");
        s_oSpriteLibrary.addSprite("msg_box","./images/msg_box.png");
        
        s_oSpriteLibrary.addSprite("bg_menu","./images/bg_menu.jpg"); 
        s_oSpriteLibrary.addSprite("bg_game","./images/bg_game.png");        
        s_oSpriteLibrary.addSprite("gui_panel_bottom","./images/gui_panel_bottom.png");
        s_oSpriteLibrary.addSprite("gui_panel_top","./images/gui_panel_top.png");
        s_oSpriteLibrary.addSprite("life","./images/life.png");
        s_oSpriteLibrary.addSprite("time_bar_frame","./images/time_bar_frame.png");
        s_oSpriteLibrary.addSprite("time_bar_fill","./images/time_bar_fill.png");
        s_oSpriteLibrary.addSprite("bg_help","./images/bg_help.png");
        s_oSpriteLibrary.addSprite("bg_help_desktop","./images/bg_help_desktop.png");
        
        s_oSpriteLibrary.addSprite("but_exit","./images/but_exit.png");
        s_oSpriteLibrary.addSprite("audio_icon","./images/audio_icon.png");
        s_oSpriteLibrary.addSprite("but_up","./images/but_up.png");
        s_oSpriteLibrary.addSprite("but_down","./images/but_down.png");
        s_oSpriteLibrary.addSprite("but_left","./images/but_left.png");
        s_oSpriteLibrary.addSprite("but_right","./images/but_right.png");
        s_oSpriteLibrary.addSprite("skid_rows","./images/skid_rows.png");
        s_oSpriteLibrary.addSprite("bridge","./images/bridge.png");
        
                
        var szTag;
        for(var i=0; i<10; i++){
            szTag = "water_anim_"+i;
            s_oSpriteLibrary.addSprite(szTag,"./images/"+szTag+".jpg");
        }
        var szTag2;
        for(var i=1; i<11; i++){
            szTag = "car_"+i;
            szTag2 = "car_"+(i-1);
            s_oSpriteLibrary.addSprite(szTag2,"./images/"+szTag+".png");
        }
        
        s_oSpriteLibrary.addSprite("trunk","./images/trunk.png");
        s_oSpriteLibrary.addSprite("turtle","./images/turtle.png");
        s_oSpriteLibrary.addSprite("fly","./images/fly.png");
        
        s_oSpriteLibrary.addSprite("frog","./images/frog.png");
        
        RESOURCE_TO_LOAD += s_oSpriteLibrary.getNumSprites();
        s_oSpriteLibrary.loadSprites();
    };
    
    this._onImagesLoaded = function(){
        _iCurResource++;
        var iPerc = Math.floor(_iCurResource/RESOURCE_TO_LOAD *100);
        _oPreloader.refreshLoader(iPerc);
        
        if(_iCurResource === RESOURCE_TO_LOAD){
            _oPreloader.unload();
            
            s_oSoundtrack = playSound("soundtrack",1,-1);

            IkemuStatsAPI.init();
            this.gotoMenu();
        }
    };
    
    this._onAllImagesLoaded = function(){
        
    };
    
    this.onAllPreloaderImagesLoaded = function(){
        this._loadImages();
    };
    
    this.gotoMenu = function(){
        _oMenu = new CMenu();
        _iState = STATE_MENU;
    };

    this.gotoGame = function(bEasyMode){
        s_bEasyMode=bEasyMode;
        IkemuStatsAPI.gameStart();
        _oGame = new CGame(_oData);   						
        _iState = STATE_GAME;

        $(s_oMain).trigger("game_start");
    };
    
    this.gotoHelp = function(){
        _oHelp = new CHelp();
        _iState = STATE_HELP;
    };
	
    this.stopUpdate=function(){
        _bUpdate = false;
        createjs.Ticker.paused= true;
        $("#block_game").css("display","block");
    };
        
    this.startUpdate = function(){
        s_iPrevTime = (new Date).getTime();
        _bUpdate= true;
        createjs.Ticker.paused = false;
        $("#block_game").css("display","none");
    };
    
    this._update = function(event){
        if(_bUpdate === false){
                return;
        }
        var iCurTime = new Date().getTime();
        s_iTimeElaps = iCurTime - s_iPrevTime;
        s_iCntTime += s_iTimeElaps;
        s_iCntFps++;
        s_iPrevTime = iCurTime;
        
        if ( s_iCntTime >= 1000 ){
            s_iCurFps = s_iCntFps;
            s_iCntTime-=1000;
            s_iCntFps = 0;
        }
                
        if(_iState === STATE_GAME){
            _oGame.update();
        }
        
        s_oStage.update(event);

    };
    
    s_oMain = this;
    
    _oData = oData;
    
    this.initContainer();
}
var s_bMobile;
var s_bEasyMode;
var s_bAudioActive = true;
var s_iCntTime = 0;
var s_iTimeElaps = 0;
var s_iPrevTime = 0;
var s_iCntFps = 0;
var s_iCurFps = 0;
var s_iCurLevel = 0;
var s_iScore=0;

var s_oDrawLayer;
var s_oStage;
var s_oMain;
var s_oSpriteLibrary;
var s_oCanvas;
var s_oSoundtrack;
