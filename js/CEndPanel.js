function CEndPanel(oSpriteBg){
    
    var _oBg;
    var _oGroup;
    
    var _oMsgTextBack;
    var _oMsgText;
    var _oScoreTextBack;
    var _oScoreText;
    var _oButExit;
    
    this._init = function(oSpriteBg){
        _oGroup = new createjs.Container();
        _oGroup.alpha = 0;
        _oGroup.visible=false;
        
        _oBg = createBitmap(oSpriteBg);
        
	_oMsgTextBack = new createjs.Text("","bold 60px "+PRIMARY_FONT, "#000000");
        _oMsgTextBack.x = CANVAS_WIDTH/2 +4;
        _oMsgTextBack.y = (CANVAS_HEIGHT/2)-160;
        _oMsgTextBack.textAlign = "center";

        _oMsgText = new createjs.Text("","bold 60px "+PRIMARY_FONT, "#fcff00");
        _oMsgText.x = CANVAS_WIDTH/2;
        _oMsgText.y = (CANVAS_HEIGHT/2)-164;
        _oMsgText.textAlign = "center";
        
        _oScoreTextBack = new createjs.Text("","bold 40px "+PRIMARY_FONT, "#000000");
        _oScoreTextBack.x = CANVAS_WIDTH/2 +4;
        _oScoreTextBack.y = (CANVAS_HEIGHT/2) + 54;
        _oScoreTextBack.textAlign = "center";
        
        _oScoreText = new createjs.Text("","bold 40px "+PRIMARY_FONT, "#fcff00");
        _oScoreText.x = CANVAS_WIDTH/2;
        _oScoreText.y = (CANVAS_HEIGHT/2) + 50;
        _oScoreText.textAlign = "center";
        
        _oGroup.addChild(_oBg, _oScoreTextBack,_oScoreText,_oMsgTextBack,_oMsgText);
        
        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
        _oButExit = new CGfxButton(770, 232, oSprite,true,_oGroup);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);


        s_oStage.addChild(_oGroup);
    };
    
    this.unload = function(){
       _oButExit.unload();
    };
    
    this.show = function(iScore){
        
        playSound("game_over",1,0);

        
        s_oGame.onGameOver();
        
        _oMsgTextBack.text = TEXT_GAMEOVER;
        _oMsgText.text = TEXT_GAMEOVER;
        
        _oScoreTextBack.text = iScore;
        _oScoreText.text = iScore;
        
        _oGroup.visible = true;
        
        var oParent = this;
        createjs.Tween.get(_oGroup).to({alpha:1 }, 500);
        
        IkemuStatsAPI.gameComplete(iScore);/*
        $(s_oMain).trigger("save_score",[iScore]);
        $(s_oMain).trigger("end_level",s_iCurLevel);
        $(s_oMain).trigger("share_event", iScore); 
*/
    };
    
    this._onExit = function(){
        _oGroup.off("mousedown",this._onExit);
        //s_oStage.removeChild(_oGroup);    
        IkemuStatsAPI.gameClose();
    };
    
    this._init(oSpriteBg);
    
    return this;
}
