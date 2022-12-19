/**
 * Base64 encoder for javascript
 */
function encode64(e){var t="ABCDEFGHIJKLMNOP"+"QRSTUVWXYZabcdef"+"ghijklmnopqrstuv"+"wxyz0123456789+/"+"=";e=escape(e);var n="";var r,i,s="";var o,u,a,f="";var l=0;do{r=e.charCodeAt(l++);i=e.charCodeAt(l++);s=e.charCodeAt(l++);o=r>>2;u=(r&3)<<4|i>>4;a=(i&15)<<2|s>>6;f=s&63;if(isNaN(i)){a=f=64}else if(isNaN(s)){f=64}n=n+t.charAt(o)+t.charAt(u)+t.charAt(a)+t.charAt(f);r=i=s="";o=u=a=f=""}while(l<e.length);return n}
 
 /**
 * GetXmlHttpObject for vanilla javascript AJAX request
 */
function GetXmlHttpObject(){var e=null;try{e=new XMLHttpRequest}catch(t){try{e=new ActiveXObject("Msxml2.XMLHTTP")}catch(t){e=new ActiveXObject("Microsoft.XMLHTTP")}}return e}

/**
 * Get cookie for vanilla javascript
 * www.chirp.com.au
 */
function getCookie(name) { var re = new RegExp(name + "=([^;]+)"); var value = re.exec(document.cookie); return (value != null) ? unescape(value[1]) : null; }

/**
 * Delete cookie for vanilla javascript
 * Sets the 'expires' date of the cookie to something in the past.
 */
function deleteCookie(name) { document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;'; };

/**
 * IKEMU Javascript GAME API (v.1.0)
 * August 2, 2016
 */

var ikemuSettings, ikemuDomain = "https://private.gamify.com/", primaryDomain = "gamify.com", gaTrackingID = "UA-63683788-1", isWix = false,
	pingFunction, pingCounter = 0, pingInterval = 10, playTimeFunction, playTime = 0, isGamePaused = false, isWindowActive = true, pauseTime = 0, isSpecialEnd = false;

window.onfocus = function () { 
	isWindowActive = true; 
}; 

window.onblur = function () { 
	isWindowActive = false; 
}; 

var ikemuGameCompleteable = false,
	ikemuGameClosable = true,
	isAdmin = false,
	previewMode = false,
	apiCheckMode = false;
var ikemuMessages = { en : { GAME_ARCHIVED : "This game have ended already!", GAME_NO_BUDGET : "I'm sorry, I'm all played out. Come back and play with me tomorrow.", GAME_INACTIVE : "This game is temporarily unavailable.", ENCOURAGE_MESSAGE : "You can also check out the other games to win more rewards." }, 
                     jp : { GAME_UNAVAILABLE : "ãŠã£ã—ã€œï¼ã“ã®ã‚²ãƒ¼ãƒ ã¯çµ‚äº†ã—ã¡ã‚ƒã„ã¾ ã—ãŸã€‚ä»–ã®ã‚²ãƒ¼ãƒ ã‚’æ¥½ã—ã‚“ã§ãƒ—ãƒ©ã‚¤ã‚ºã‚’ã‚² ãƒƒãƒˆã—ã¡ã‚ƒãŠã†ï¼", GAME_NO_BUDGET : "æ®‹å¿µï¼ä»Šæ—¥ã¯çµ‚äº†ã—ã¡ã‚ƒã„ã¾ã—ãŸã€‚ã¾ãŸæ˜Žæ—¥æ¥ã¦ã­ï¼", GAME_INACTIVE : "ã‚ã‚Œã‚Œï¼ã‚²ãƒ¼ãƒ ãŒçŸ­æœŸçš„ã«åˆ©ç”¨ã§ã¾ã› ã‚“ã€‚ã¾ãŸå¾Œã§ãƒˆãƒ©ã‚¤ã—ã¦ã¿ã¦ã­", ENCOURAGE_MESSAGE : "ã‚ãªãŸã¯ã¾ãŸã€ã‚ˆã‚Šå¤šãã®å ±é…¬ã‚’ç²å¾—ã™ã‚‹ãŸã‚ã«ã€ä»–ã®ã‚²ãƒ¼ãƒ ã‚’ãƒã‚§ãƒƒã‚¯ã‚¢ã‚¦ãƒˆã™ã‚‹ã“ã¨ãŒã§ãã¾ã™ã€‚"}};
var wixHighScore = 0;


var IkemuStatsAPI = (function() {

    return {
        init : function(callbackAfterInit){
        	var refreshToken = false;
            IkemuStatsAPI.log('init method called!');

            /**
             * Needed for the same-origin policy.
             * Set the domain of S3 to match the domain of the Player Side...
             */
            try {
            	document.domain = primaryDomain;
			} catch(err) {
				isAdmin = true;
				IkemuStatsAPI.log('Failed to set S3 domain. Game will not be connect to the server.');
			}
			
			var apiCheck = UtilityService.getSearchParameters().apiCheck;
			if (apiCheck && (apiCheck === true || apiCheck === "true")) {
            	IkemuStatsAPI.log('We are on api check mode.');
				apiCheckMode = true;
			}
            
			/**
             * Check first if the game is just being previewed, if so. Let's not initialize the game.
             */
			var preview = UtilityService.getSearchParameters().preview;
			console.info("Preview parameter is " + UtilityService.getSearchParameters().preview);
            if(preview && (preview === true || preview === "true")) {
            	IkemuStatsAPI.log('We are on preview mode. No settings will be plugged.');
            	if (!apiCheckMode)
            		previewMode = true;

				ikemuAjax("init");
				if(callbackAfterInit) {
					callbackAfterInit();
				}
            } else {
				IkemuStatsAPI.log("ikemuDomain : " + ikemuDomain);
				IkemuStatsAPI.log("primaryDomain : " + primaryDomain);
				IkemuStatsAPI.log("Is Custom Play : " + UtilityService.isCustomPlay());

				/** Commented this to fix issue of a game redirecting to leaderboard of a different game  **/
				/*
				if(UtilityService.ikemuIsMobile() || UtilityService.isCustomPlay() == "true") { //If mobile, get settings from cookie
					IkemuStatsAPI.log('MOBILE Mode - Getting tokens from cookie.');
					var sessionTokens = JSON.parse(JSON.parse(getCookie("ikemu-session-tokens")));
					
					ikemuSettings = sessionTokens;
	
				} else { //If web, get settings from parent container
					IkemuStatsAPI.log('WEB Mode - Getting tokens from parent.');
					try {
						var $parent = parent.document.getElementById("game-iframe");
						if ($parent != null) {
							// If ikemuSettings create empty object...
							if(ikemuSettings == null)
								ikemuSettings = {};

							// Get all data attributes of game wrapper and set to ikemuSettings...
							for(var data in $parent.dataset){
								ikemuSettings[data] = $parent.dataset[data];
							}
						} else {
							isAdmin = true;
						}
					} catch(err) {
						isAdmin = true;
						IkemuStatsAPI.log('Failed to get tokens from parent.');
					}
				}
				*/

				//If still settings is still null
				if(ikemuSettings == null) {
					IkemuStatsAPI.log('Getting settings from API.');

					var callBack = function(data){
						ikemuSettings = JSON.parse(data);
						IkemuStatsAPI.log('Settings from API: ' + JSON.stringify(ikemuSettings));

						initSettings(ikemuSettings);
						if(callbackAfterInit) {
							callbackAfterInit();
						}
						ikemuAjax("init", checkGameStatus(data));
					}
					
					getIkemuSettings(callBack);
				} else {
					initSettings(ikemuSettings);
					if(callbackAfterInit) {
						callbackAfterInit();
					}
					ikemuAjax("init", checkGameStatus(JSON.stringify(ikemuSettings)));
            	}
            }
        },

        log : function(message){
            if (window.console && window.console.log){
                console.log("[gameAPI] " + message);
            }
        },

        getSessionToken: function(message){
            return ikemuSettings.playerSessionToken;
        },

        getPlayerInfo: function(){
            ikemuAjax("get-player-info");
        },

        getGameData: function(){
            ikemuAjax("get-game-data");
        },

        setGameData: function(gameData){
            ikemuAjax("set-game-data", function(){}, null, gameData);
        },

        gameStart: function(){
			console.log("step", 1);
			IkemuStatsAPI.log("GameStart called.");
			ikemuGameCompleteable = true;
			ikemuAjax("game-start", function(data){
					window.clearInterval(pingFunction);
					pingFunction = setInterval(function(){
						pingCountdown();
					}, 1000);

					checkGameStatus(data);
			});

			playTime = 0, pauseTime = 0, isGamePaused = false;
			window.clearInterval(playTimeFunction);
			playTimeFunction = setInterval(function(){
				countPlayTime();
			}, 1000);
        },

        gameLevelComplete: function(gameScore){
			console.log("step", 2);
            ikemuAjax("game-level-complete", function(){}, gameScore);
        },

        gameComplete: function(gameScore){
			console.log("gameComplete", 3);
			ikemuGameClosable = false;

        	if(gameScore > wixHighScore)
        		wixHighScore = gameScore;
        	
			IkemuStatsAPI.log("GameComplete called.");
			if(ikemuGameCompleteable) {
				ikemuGameCompleteable = false;
				ikemuAjax("game-complete", function(data){
					window.clearInterval(pingFunction);
					window.clearInterval(playTimeFunction);
					
					IkemuStatsAPI.log("playTime is: " + playTime);
					IkemuStatsAPI.log("pauseTime is: " + pauseTime);

					if (!isWix) {
						if(ikemuSettings && !ikemuSettings.isSpecialEnd)
							IkemuStatsAPI.gameClose(gameScore);
					}

					ikemuGameClosable = true;
					
				}, gameScore);
				
				if (UtilityService.isCustomPlay() == true) {
					IkemuStatsAPI.gameClose(gameScore);
				}
			} else {
				IkemuStatsAPI.log("Game start not yet called.");
			}
        },

        gameClose: function(gameScore){
            //send message to iframe to trigger GAME CLOSE events
			console.log("step", 4);
			if(!previewMode) {
				IkemuStatsAPI.log("Game will now close.");
				if (isWix) {
					window.clearInterval(sendGameCloseFunction);

					var sendGameCloseFunction =
						setInterval(function(){
							IkemuStatsAPI.log("Wix Game will now close, ikemuGameClosable: " + ikemuGameClosable);
							if(ikemuGameClosable){
								IkemuStatsAPI.log('Sending stat game-close to parent.');
								ikemuAjax("game-close");
								parent.ikemuReceiveStat('game-close', wixHighScore, ikemuSettings.playerSessionToken);
								wixHighScore = 0;

								window.clearInterval(sendGameCloseFunction);
							}
						}, 500);

				} else {
					ikemuSendStat("game-close");
					Analytics.trackEvent("game-close");
					if(!apiCheckMode){
						// loadGameOverScreen(gameScore);
						// location.reload()
    					s_oMain.gotoMenu();
					}

				}
			}
        },

        gameLevelUp: function(gameScore){
			console.log("step", 5);
            ikemuAjax("game-level-up", function(){}, gameScore);
        },

        gameRestart: function(){
			console.log("step", 6);

            playTime = 0, pauseTime = 0, isGamePaused = false, ikemuGameCompleteable = true;
            ikemuAjax("game-restart");
			
			window.clearInterval(playTimeFunction);
			playTimeFunction = setInterval(function(){
				countPlayTime();
			}, 1000);
        },

        gameLevelRestart: function(){
			console.log("step", 7);
            ikemuAjax("game-level-restart");
        },
		
        testConnection: function(){
			console.log("step", 8);

            ikemuAjax("test");
        },

        ping: function(){
			console.log("step", 9);

            ikemuAjax("ping", function() {});
        },

        gamePause: function(){
			console.log("step", 10);

        	ikemuSendStat("game-pause");
        	isGamePaused = true;
        },

        gameResume: function(){
			console.log("step", 11);

        	ikemuSendStat("game-resume");
        	isGamePaused = false;
		},
		
		saveNumberData: function(numberData, score, otherData) {
			console.log("step", 12);

			saveNumberValueAndScore(numberData, score, otherData);
		},

		getNumberValuesList: function(successCallback) {
			console.log("step", 13);

			getNumberValues(successCallback);
		},

		getChanceRewards: function(successCallback) {
			console.log("step", 14);

			getChanceRewardsFromAPI(successCallback);
		},

		saveReward: function(rewardName) {
			console.log("step", 15);

			saveRewardResult(rewardName);
		}

    }
})();

function checkGameStatus(data) {
	if(apiCheckMode || ikemuSettings == null) {
		return;
	}
	
	IkemuStatsAPI.log('checkGameStatus - Parsing ' + data);

    var game = JSON.parse(data);
    
    if (isWix) {
    	if(game.noBudget) {
            IkemuStatsAPI.log('Game is inactive. Checking status for redirect and message creation.');
            var message = UtilityService.getMessage("GAME_NO_BUDGET");
            
            if(!document.getElementById("ikemu-unavailable-popup")) {
    	        document.body.innerHTML = "<div id='ikemu-unavailable-popup' style='background: rgba(0,0,0,1) !important; width: 100% !important; height: 100% !important; display: block !important; z-index:2147483647  !important;" +
    	        	"position: absolute !important; top: 0 !important; left: 0 !important; color: #fff !important; text-align: center !important;'>" +
					"<div style='top: 50% !important;position: absolute !important; width: 100% !important;font-size: 18px !important;font-family: \"Open Sans\", sans-serif !important;'><p style='margin: 0 10px !important;'>"+message+"</p></div></div>";

			}
    	}
    } else {
	    if(!game.isActive) {
	        IkemuStatsAPI.log('Game is inactive. Checking status for redirect and message creation.');
	        var message = "";
	        if(game.isArchived) message = UtilityService.getMessage("GAME_ARCHIVED");
	        else {
	            IkemuStatsAPI.log('Game is not yet archived.');
	            if(game.noBudget) {
	                message = UtilityService.getMessage("GAME_NO_BUDGET");
	            } else {
	                message = UtilityService.getMessage("GAME_INACTIVE");
	            }
	        }
	
	        var redirectTo = ikemuDomain + "#/game-unavailable/" + game.gameId;
	        if(game.isCustomPlay) {
	            redirectTo = ikemuDomain + "custom-play/" + game.gameId;
	        } else {
	            // append message to encourage user to play another game
	            message += " " + UtilityService.getMessage("ENCOURAGE_MESSAGE");
	        }
	
	        alert(message);
	        IkemuStatsAPI.log('Redirecting to ' + redirectTo);
	        window.location.href = redirectTo;
	    }
    }
}

function pingCountdown() {
    if(pingInterval == pingCounter) {
        IkemuStatsAPI.ping();
    } else {
        pingCounter += 1;
    }

}

function countPlayTime() {
    if(!isGamePaused && isWindowActive) {
    	playTime += 1000;
    } else {
    	pauseTime += 1000;
    }
}

function initSettings(ikemuSettings) {
	if(ikemuSettings != null){
		getUrlPlayerParameters(ikemuSettings);
		IkemuStatsAPI.log('MOBILE Mode - Initialize Google Analytics with Tracking ID : ', gaTrackingID);
	
		pingInterval = ikemuSettings.pingInterval;
		Analytics.init(gaTrackingID);
		
		if(ikemuSettings.gameTitle) {
			IkemuStatsAPI.log("gameTitle : " + ikemuSettings.gameTitle);
			UtilityService.setTitle(ikemuSettings.gameTitle);
		}
		if(ikemuSettings.gameUrl) {
			IkemuStatsAPI.log("gameUrl : " + ikemuSettings.gameUrl);
		}
		if(ikemuSettings.gameId) {
			IkemuStatsAPI.log("gameId : " + ikemuSettings.gameId);
		}
		IkemuStatsAPI.log("gameSessionToken : " + ikemuSettings.gameSessionToken);
		IkemuStatsAPI.log("playerSessionToken : " + ikemuSettings.playerSessionToken);
		IkemuStatsAPI.log("pingInterval : " + pingInterval);
		
		IkemuStatsAPI.log('The iKEMU API is good to go!');
	} else {
        IkemuStatsAPI.log('No tokens received.');
        
        previewMode = true;
	}
}

function getIkemuSettings(successCallback){
	var xhr = GetXmlHttpObject();

	var isCustomPlay = UtilityService.getUrlParameter("isCustomPlay");
	var gameId = UtilityService.getUrlParameter("gameId");
	var playerSessionToken = UtilityService.getUrlParameter("playerSessionToken");
	var isSpecialEnd = UtilityService.getUrlParameter("isSpecialEnd");

	xhr.open('GET', ikemuDomain + "api/get-settings/" + gameId + "/" +
			playerSessionToken + "/" + isCustomPlay, true);
	//xhr.open('GET', ikemuDomain + "api/get-settings/" + UtilityService.getUrlParameter("gameId"), true);
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=utf-8");
	xhr.onreadystatechange = function(ev) {
		if (xhr.readyState != 4)  { return; }
		if (xhr.status == 200) {
			//IkemuStatsAPI.log("Server responded with response : " + xhr.response);
			if(successCallback) {
				pingCounter = 0;
				successCallback(xhr.response)
			}
		}
	}
	xhr.send();
}

function getUrlPlayerParameters(ikemuSettings) {
	if(ikemuSettings != null) {
		ikemuSettings.playerName = "";
		ikemuSettings.encodedPlayerName = "";
		let name = UtilityService.getUrlParameter("n");
		try {
			let decodedName = window.atob(name);
			ikemuSettings.playerName = decodedName;
			ikemuSettings.encodedPlayerName = name;
		} catch(err) {}
		
		ikemuSettings.memberId = "";
		let memberId = UtilityService.getUrlParameter("mid");
		try {
			let decodedMemberId = window.atob(memberId);
			ikemuSettings.memberId = decodedMemberId;
		} catch(err) {}

		ikemuSettings.code = "";
		let code = UtilityService.getUrlParameter("c");
		try {
			let decodedCode = window.atob(code);
			ikemuSettings.code = decodedCode;
		} catch(err) {}

		ikemuSettings.formBefore = false;
		let formBefore = UtilityService.getUrlParameter("formBefore");
		if (formBefore == '1') {
			ikemuSettings.formBefore = true;
		}

		ikemuSettings.isSpecialEnd = false;
		let isSpecialEnd = UtilityService.getUrlParameter("isSpecialEnd");
		if (isSpecialEnd === '1') {
			ikemuSettings.isSpecialEnd = true;
		}

		ikemuSettings.email = "";
		let email = UtilityService.getUrlParameter("em");
		try {
			let decodedEmail = window.atob(email);
			ikemuSettings.eEmail = decodedEmail;
			ikemuSettings.encodedEmail = email;
		} catch(err) {}

		ikemuSettings.gameSession = UtilityService.getUrlParameter("gs");
		
		ikemuSettings.randValue = "";
		let randValue = UtilityService.getUrlParameter("rand");
		if(randValue) {
			ikemuSettings.randValue = randValue;
		}

		ikemuSettings.lang = "en";
		let lang = UtilityService.getUrlParameter("lang");
		if (lang) {
			ikemuSettings.lang = lang;
		}

		ikemuSettings.pdId = "";
		let playerDetailsId = UtilityService.getUrlParameter("pdId");
		try {
			ikemuSettings.pdId = window.atob(playerDetailsId);
		} catch(err) {}
	}
}

/*
	Get the numberValues[] from Player Details
 */
function getNumberValues(successCallback) {
	if(apiCheckMode) {
		return;
	}
	console.log('Getting number values');
	var gameId = ikemuSettings.gameId ? ikemuSettings.gameId : "";
	// var name = ikemuSettings.playerName ? ikemuSettings.playerName : "";
	var memberId = ikemuSettings.memberId ? ikemuSettings.memberId : "";
	var code = ikemuSettings.code ? ikemuSettings.code : "";
	var params = "gameId=" + gameId + "&memberId=" + memberId + "&code=" + code;

	var xhr = GetXmlHttpObject();
	xhr.open('POST', ikemuDomain + "api/get-number-values", true);
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=utf-8");
	xhr.onreadystatechange = function(ev) {
		if (xhr.readyState != 4)  { return; }
		var responseData = JSON.parse(xhr.response);
		var numberValues = [];
		var otherData = {};
		// console.log('Response Data', responseData);
		if(responseData.numberValues) {
			numberValues = responseData.numberValues;
		}
		if(responseData.numberValue) {
			otherData.numberValue = responseData.numberValue;
		}
		if(responseData.score) {
			otherData.score = responseData.score;
		}
		if(responseData.numberValuesRecord) {
			otherData.numberValuesRecord = responseData.numberValuesRecord;
		}
		if(successCallback) {
			successCallback(numberValues, otherData);
		}
	}
	xhr.send(params);
}

function getChanceRewardsFromAPI(successCallback) {
	if(apiCheckMode) {
		return;
	}
	console.log('Getting chance rewards');
	if(!ikemuSettings || !ikemuSettings.gameId) {
		console.log('ikemuSettings is undefined or gameId doesn\'t exists');
		return;
	}
	var gameId = ikemuSettings.gameId ? ikemuSettings.gameId : "";
	var params = "gameId=" + gameId;

	var xhr = GetXmlHttpObject();
	xhr.open('POST', ikemuDomain + "api/get-chance-rewards", true);
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=utf-8");
	xhr.onreadystatechange = function(ev) {
		if (xhr.readyState != 4)  { return; }
		console.log('xhr', xhr);
		var responseData = JSON.parse(xhr.response);
		var chanceRewards = responseData;
		chanceRewards.sort(function(rewardA, rewardB) {
			return rewardA.winChance - rewardB.winChance;
		});

		if(successCallback) {
			successCallback(chanceRewards);
		}
	}
	xhr.send(params);
}

function saveRewardResult(rewardName) {
	if(apiCheckMode) {
		return;
	}
	console.log('Saving reward result ' + rewardName);
	var gameId = ikemuSettings.gameId ? ikemuSettings.gameId : "";
	var name = ikemuSettings.playerName ? ikemuSettings.playerName : "";
	var memberId = ikemuSettings.memberId ? ikemuSettings.memberId : "";
	var code = ikemuSettings.code ? ikemuSettings.code : "";
	var reward = rewardName ? rewardName : "";

	if(!reward) {
		console.log('Reward is empty. Skipping saving');
	}

	var data = {};
	data.gameId = gameId;
	data.playerName = name;
	data.memberId = memberId;
	data.code = code;
	data.reward = reward;

	var params = JSON.stringify(data);
	var xhr = GetXmlHttpObject();
	xhr.open('POST', ikemuDomain + "api/save-reward-result", true);
	xhr.setRequestHeader("Content-type", "text/plain");
	xhr.onreadystatechange = function(ev) {
		if (xhr.readyState != 4)  { return; }
		if (xhr.status == 200) {
			//IkemuStatsAPI.log("Server responded with response : " + xhr.response);
			console.log('Server responded with status code ' + xhr.status + ' and response:', xhr.response);
		}
		else {
			console.log('Error saving reward result', xhr.response);
		}
	}
	xhr.send(params);
}

/*
	Save number data using game id, player name, member id, and code to get the PlayerDetails entry from mongo
	Number data can be used for different things
	eg. For Audi campaign, it is the number of spins a player has
*/
function saveNumberValueAndScore(numberData, score, otherData) {
	if(apiCheckMode) {
		return;
	}
	console.log('Saving number value and score');
	var gameId = ikemuSettings.gameId ? ikemuSettings.gameId : "";
	// var name = ikemuSettings.playerName ? ikemuSettings.playerName : "";
	var memberId = ikemuSettings.memberId ? ikemuSettings.memberId : "";
	var code = ikemuSettings.code ? ikemuSettings.code : "";

	otherData = otherData ? otherData : {};
	otherData.numberValue = numberData;
	otherData.gameId = gameId;
	// otherData.name = name; // Audi client removed it
	otherData.memberId = memberId;
	otherData.code = code;
	otherData.playerSessionToken = ikemuSettings.playerSessionToken;
	otherData.score = score;
	
	var params = JSON.stringify(otherData);
	var xhr = GetXmlHttpObject();
	xhr.open('POST', ikemuDomain + "api/save-data", true);
	xhr.setRequestHeader("Content-type", "text/plain");
	xhr.onreadystatechange = function(ev) {
		if (xhr.readyState != 4)  { return; }
		if (xhr.status == 200) {
			//IkemuStatsAPI.log("Server responded with response : " + xhr.response);
			console.log('Server responded with status code ' + xhr.status + ' and response:', xhr.response);
		}
		else {
			console.log('Error saving value and score', xhr.response);
		}
	}
	xhr.send(params);
}

function ikemuAjax(route, successCallback, gameScore, gameData) {
	if(!previewMode && !apiCheckMode){
		IkemuStatsAPI.log(route + " ajax method called!");
		if(ikemuSettings != null) {
	        var data = "gameId=" + ikemuSettings.gameId + "&" +
	                    "gameSessionToken=" + ikemuSettings.gameSessionToken + "&" +
	                    "playerSessionToken=" + ikemuSettings.playerSessionToken + "&" + "isSpecialEnd=" + ikemuSettings.isSpecialEnd, 
	            xhr = GetXmlHttpObject();
	        
	        if(route == 'init') {
	            data += "&isCustomPlay=" + ikemuSettings.isCustomPlay;
	        }
	        
            data += "&pauseTime=" + pauseTime;
            data += "&playTime=" + playTime;
	        
	        if(route == 'game-start' ||
				route == 'game-restart') {
	        	var resolution = {
	        		width: window.innerWidth || document.documentElement.clientWidth || document.body.offsetWidth,
	        		height: window.innerHeight || document.documentElement.clientHeight || document.body.offsetHeight
	        	};
	            data += "&resolution=" + resolution.width + "x" + resolution.height + "&isCustomPlay=" + ikemuSettings.isCustomPlay;
	        }
	        
	        if(!gameScore) {
				gameScore = 0;
	        }
	        
	        data += "&gameScore=" + gameScore;
	        data += "&signature=" + encode64(ikemuSettings.playerSessionToken + "_" + gameScore);
	
	        if(gameData) {
	            data += "&gameData=" + gameData;
	        }
	
	        xhr.open('GET', ikemuDomain + "api/" + route + "?" + data, true);
	        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=utf-8");
	        xhr.onreadystatechange = function(ev) {
	            if (xhr.readyState != 4)  { return; }
	            if (xhr.status == 200) {
	                //IkemuStatsAPI.log("Server responded with response : " + xhr.response);
	            	if(successCallback) {
	                    pingCounter = 0;
	                    successCallback(xhr.response)
	                }
	            }
	            
	        }
	        xhr.send();
	        
	    	
    		var GAME_STATUS = ["init","game-start","game-level-complete","game-complete","game-close","game-level-up","game-restart","game-level-restart","game-restart", "game-pause", "game-resume"];
    		if(GAME_STATUS.indexOf(route) >= 0) 
    			Analytics.trackEvent(route);
	    	
	    } else {
	        if(successCallback) {
	            pingCounter = 0;
	            successCallback("{}");
	        }
	    }
    }
	
	ikemuSendStat(route);
}

/**
 * API will attempt to communicate with the parent.
 * Things to consider:
 * document.domain must be set
 * Game must have a parent
 * Parent should have a receiveStat method
 * 
 */
function ikemuSendStat(stat) {
	var GAME_STATUS = ["init","game-start","game-level-complete","game-complete","game-close","game-level-up","game-restart","game-level-restart","game-restart","game-pause","game-resume"];

	if (apiCheckMode) {
		try {
			IkemuStatsAPI.log('Sending stat ' + stat + ' to parent.');
			parent.ikemuReceiveStat(stat);
		} catch (err) {
			console.debug(err);
			IkemuStatsAPI.log('Unable to send stat ' + stat + ' to parent.');
		}
	}
	else if(!previewMode && GAME_STATUS.indexOf(stat) >= 0) {
		if(!UtilityService.ikemuIsMobile() && UtilityService.isCustomPlay() != "true") {
			try {
				IkemuStatsAPI.log('Sending stat ' + stat + ' to parent.');
				parent.ikemuReceiveStat(stat);
			} catch (err) {
				console.debug(err);
				IkemuStatsAPI.log('Unable to send stat ' + stat + ' to parent.');
			}
		}
	}
}

function unloadGameOverScreen() {
	var iframeDiv = document.getElementById('iframe-div');
	iframeDiv.parentNode.removeChild(iframeDiv);
}

function loadGameOverScreen(gameScore) {
	var url = "";
	var score = gameScore ? window.btoa(gameScore) : window.btoa(0);
	let nameParam = ikemuSettings.encodedPlayerName ? "&n=" + ikemuSettings.encodedPlayerName : ''; 
	let formBeforeParam = ikemuSettings.formBefore ? "&formBefore=1" : '';
	let emailParam = ikemuSettings.encodedEmail ? "&em=" + ikemuSettings.encodedEmail : '';
	let gameSessionParam = ikemuSettings.gameSession ? "&gs=" + ikemuSettings.gameSession : '';
	let randValueParam = ikemuSettings.randValue ? "&rand=" + ikemuSettings.randValue : '';
	let playerDetailsIdParam = ikemuSettings.pdId ? "&pdId=" + ikemuSettings.pdId : '';
	let langParam = ikemuSettings.lang ? "&lang=" + ikemuSettings.lang : '';
	
	// if (ikemuSettings.isUsingCustomEndScreen) { // /endgame/:endscreen/:gameId
	// 	url = ikemuDomain + "?embed=1&amp;customPlay=1&amp;gameId=" + ikemuSettings.gameId + "#/endgame/" + ikemuSettings.customEndScreenHTMLfilename + "/" +
	// 		ikemuSettings.gameId + "?isCustomPlay=true&gameId=" + ikemuSettings.gameId + "&s=" + score + formBeforeParam + nameParam +
	// 		emailParam + gameSessionParam + randValueParam + langParam + "&playerSessionToken=" + ikemuSettings.playerSessionToken;
	// }
	// else
		if(!ikemuSettings.isSpecialEnd) {
		url = ikemuDomain + "?embed=1&amp;customPlay=1&amp;gameId=" + ikemuSettings.gameId + "#/custom-end-game/" + ikemuSettings.gameId + 
			"?isCustomPlay=true&gameId=" + ikemuSettings.gameId + formBeforeParam + nameParam + emailParam + gameSessionParam + 
			randValueParam + playerDetailsIdParam + "&playerSessionToken=" + ikemuSettings.playerSessionToken;
	}
	else {
		url = ikemuDomain + "?embed=1&amp;customPlay=1&amp;gameId=" + ikemuSettings.gameId + "#/special-end-game/" + ikemuSettings.gameId + 
			"?isCustomPlay=true&gameId=" + ikemuSettings.gameId + "&playerSessionToken=" + ikemuSettings.playerSessionToken;
	}
 	window.location.replace(url);

	ikemuDiv = document.createElement("div");
	ikemuDiv.setAttribute('id', 'ikemu-div');
	ikemuDiv.style.position = 'absolute';
	ikemuDiv.style.top = '0';
	ikemuDiv.style.left = '0';
	ikemuDiv.style.width = '100%';
	ikemuDiv.style.height = '100%';
	ikemuDiv.style.border = '0';
	ikemuDiv.style.background = '#000';
	if (ikemuSettings.gameId == '544' || ikemuSettings.gameId == '546' || ikemuSettings.gameId == '547'
	 || ikemuSettings.gameId == '27' || ikemuSettings.gameId == '29') {
		ikemuDiv.style.background = '#fbce07';
	}
	ikemuDiv.style.zIndex = '2147483647';
	document.body.innerHTML = '';
	document.body.appendChild(ikemuDiv);
}

var UtilityService = (function() {
	var inst = this,
        gameTitle = "";
	return {
		
		/**
		 * Detect Mobile Browsers | Open source mobile phone detection
		 * http://detectmobilebrowsers.com/
		 */
		ikemuIsMobile : function() {
			if (isWix) return true;
			var isMobile = false;
			(function(a,b){
				if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|android|ipad|playbook|silk|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))
					isMobile = true;
			})(navigator.userAgent||navigator.vendor||window.opera);
		  	return isMobile;
		},
		
		/**
		 * Detect if this is a custom campaign to handle custom events...
		 * Read cookie with name 'ikemu-custom-play'...
		 */
		isCustomPlay : function() {
			return getCookie("ikemu-custom-play");
		}, 
		
		/**
		 * Sets the title of the game to Campaign Title + " | " + Campaign Brand...
		 */
		setTitle : function(title) {
			// Set gameTitle...
			gameTitle = title;
			/**
			 * Write gameTitle to <title></title>
			 */
			var finalTitle = UtilityService.getTitle();
			document.title = finalTitle;
		},
		
		hexToString : function(tmp) {
			var arr = tmp.split('&#'), str = '', i = 0, arr_len = arr.length, c;
			
			var h2d = function(h) {
				if(h.toUpperCase() != "A" && h.toUpperCase() != "B" && h.toUpperCase() != "C" && h.toUpperCase() != "D" && h.toUpperCase() != "E" && h.toUpperCase() != "F")
					return parseInt(h, 16);
			}
			
		    for (; i < arr_len; i += 1) {
		    		var hex = h2d(arr[i]);
		    		if(!isNaN(hex)) {
		    			c = String.fromCharCode(hex);
		    			str += c;
		    		} else {
		    			str += arr[i];
		    		}
		    }
		 
		    return str;
		},
		
		/**
		 * Gets the game title of the game....
		 */
		getTitle : function() {
			return UtilityService.hexToString(gameTitle);
		},
        
        getMessage : function(key) {
            var lang = getCookie("PLAY_LANG") || "en" ;
            return ikemuMessages[lang][key];
        },	
        
        getSearchParameters : function() {
        	var prmstr = window.location.search.substr(1);
        	return prmstr != null && prmstr != "" ? UtilityService.transformToAssocArray(prmstr) : {};
        },
        
        transformToAssocArray : function( prmstr ) {
            var params = {};
            var prmarr = prmstr.split("&");
            for ( var i = 0; i < prmarr.length; i++) {
                var tmparr = prmarr[i].split("=");
                params[tmparr[0]] = tmparr[1];
            }
            return params;
        },

		getUrlParameter : function(sParam) {
			if(window.location.search.indexOf(sParam) < 0){
				return "";
			}
			var sPageURL = decodeURIComponent(window.location.search.substring(1)),
				sURLVariables = sPageURL.split('&'),
				sParameterName,
				i;

			for (i = 0; i < sURLVariables.length; i++) {
				sParameterName = sURLVariables[i].split('=');

				if (sParameterName[0] === sParam) {
					return sParameterName[1] === undefined ? true : sParameterName[1];
				}
			}
		},

		getUrlPath : function(sParam) {
			var path = window.location.pathname;

			var paths = path.split("/");
			try{
				var result = paths[sParam];
				if(result.indexOf('?') < 0){
					result.subString(0, result.length - 1);
				}
				return result;
			}catch(e){
				return "";
			}

		},

		isCustomPlayBaseOnUrl : function(){
			return window.location.indexOf("custom-play") >= 0;
		}
	}
	
})();

var Analytics = (function() {
	return {
        init : function(acct){
			(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        		(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        		m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        		})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
        	
	        	//create the tracker
	        	ga('create', acct, primaryDomain);
	        	//ga('require', 'displayfeatures');
	        	
	        	IkemuStatsAPI.log('[Mobile Analytics] Initialized Google Analytics!');
        },
		trackEvent	: function(event){
			if(ikemuSettings != null){
				IkemuStatsAPI.log('[Mobile Analytics] Tracking ' + event + ' of game ', ikemuSettings.gameId);
				ga('send', 'event', 'game', event, ikemuSettings.gameId);
			}
		}
	}
})();