// --------------------------------------------------------------------------------
// SOUL_MV Lantern Effect.js - soulxregalia.wordpress.com
// --------------------------------------------------------------------------------
/*:
* @plugindesc v1.0 Adds a simple lantern effect perfect for Horror RPG Maker games.
* @author Soulpour777 - soulxregalia.wordpress.com
*
* @param Lantern Opacity
* @desc The default opacity of the lantern. (Changeable by plugin command)
* @default 150
*
* @param Lantern Image
* @desc Image name of the lantern image you are using. (Under Additive Blending)
* @default Lantern
*

* @help

SOUL_MV Lantern Effect
Author: Soulpour777

Current Build Version: 2.0
Fixed Bugs:
    - toLowerCase build error
    - clamp error
    - aliasing error

Place your lantern images under the img / lantern folder.

This plugin has FOUR (4) plugin commands:

open lantern               // opens the lantern
close lantern              // closes the lantern
lantern opacity x          // where x is the new opacity set fosr the lantern. 
set lantern x              // where x is the image name of the lantern to set.

Terms of Use:

You are free to use this plugin for Commercial and Non Commercial Use
within the condition:
 - You will credit Soulpour777 for the plugin.

You are free to adapt or modify my plugins under the condition:
 - You will credit Soulpour777 for the original plugin.

For suggestions, please visit my official website:
soulxregalia.wordpress.com

Have a nice day!

*/
(function(){
    var SOUL_MV = SOUL_MV || {};
    SOUL_MV.LanternEffect = SOUL_MV.LanternEffect || {};
    SOUL_MV.LanternEffect.LanternOpacity = Number(PluginManager.parameters('SOUL_MV Lantern Effect')['Lantern Opacity'] || 150);
    SOUL_MV.LanternEffect.LanternImage = PluginManager.parameters('SOUL_MV Lantern Effect')['Lantern Image'] || 'Lantern';
    function Sprite_Lantern() {
        this.initialize.apply(this, arguments);
    }

    Sprite_Lantern.prototype = Object.create(Sprite.prototype);
    Sprite_Lantern.prototype.constructor = Sprite_Lantern;

    Sprite_Lantern.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this.opacity = $gameSystem.lanternOpacity;
        this._frameCount = 0;
        this.createBitmap();
    };

    Sprite_Lantern.prototype.update = function() {
        Sprite.prototype.update.call(this);
        this.updatePosition();
        this.reclaimOpacity();

        // I am lazy, so I am not going to do new methods, I'll 
        //slap it in here.
        this.bitmap = ImageManager.loadLantern($gameSystem.lanternImage);
    };

    Sprite_Lantern.prototype.reclaimOpacity = function() {
        return this.opacity = $gameSystem.lanternOpacity;
    }

    Sprite_Lantern.prototype.createBitmap = function() {
        this.bitmap = ImageManager.loadLantern($gameSystem.lanternImage);
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        this.blendMode = 1;
    };

    ImageManager.loadLantern = function(filename, hue) {
        return this.loadBitmap('img/lantern/', filename, hue, true);
    };
    SOUL_MV.LanternEffect._gameSystem_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        SOUL_MV.LanternEffect._gameSystem_initialize.call(this);
        this.showLantern = false;
        this.lanternOpacity = SOUL_MV.LanternEffect.LanternOpacity;
        this.lanternImage = SOUL_MV.LanternEffect.LanternImage;
    }

    SOUL_MV.LanternEffect._gameInterpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        if(command === 'open' && args[0] === 'lantern')$gameSystem.showLantern = true;
        if (command === 'close' && args[0] === 'lantern')$gameSystem.showLantern = false;
        if (command === 'lantern' && args[0] === 'opacity')$gameSystem.lanternOpacity = Number(args[1]); 
        if (command === 'set' && args[0] === 'lantern')$gameSystem.lanternImage = String(args[1]); 
        // to be overridden by plugins
        SOUL_MV.LanternEffect._gameInterpreter_pluginCommand.call(this, command, args);
    };

    Sprite_Lantern.prototype.updatePosition = function() {
        this.x = $gamePlayer.screenX();
        this.y = $gamePlayer.screenY();
    };
    SOUL_MV.LanternEffect._sceneMap_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        SOUL_MV.LanternEffect._sceneMap_update.call(this);
        if($gameSystem.showLantern){
            this.addChild(this._lantern);
        } else {
            this.removeChild(this._lantern);
        }
            
    };
    SOUL_MV.LanternEffect._sceneMap_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        SOUL_MV.LanternEffect._sceneMap_start.call(this);
        // adds a sprite that follows the character
        this._lantern = new Sprite_Lantern();
    };    
})();