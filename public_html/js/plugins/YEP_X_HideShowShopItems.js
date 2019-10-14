//=============================================================================
// Yanfly Engine Plugins - Shop Menu Extension - Hide/Show Shop Items
// YEP_X_HideShowShopItems.js
//=============================================================================

var Imported = Imported || {};
Imported.YEP_X_HideShowShopItems = true;

var Yanfly = Yanfly || {};
Yanfly.HSSI = Yanfly.HSSI || {};
Yanfly.HSSI.version = 1.00;

//=============================================================================
 /*:
 * @plugindesc v1.00 (Req YEP_ShopMenuCore) Allows you to hide/show shop menu
 * entries using switches and/or variables.
 * @author Yanfly Engine Plugins
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * This plugin requires YEP_ShopMenuCore. Make sure this plugin is located
 * under YEP_ShopMenuCore in the plugin list.
 *
 * Making nested Conditional Branches of entire shop events to determine if an
 * item will appear or not appear in a shop can be messy in RPG Maker MV. This
 * plugin will let you determine if shop items will appear or not through the
 * usage of switches in a variety of ways, from a single switching being either
 * on or off to a plethora of switches needing to be on or off. Advanced users
 * can also use JavaScript to control whether or not certain items appear, too.
 *
 * ============================================================================
 * Notetags
 * ============================================================================
 *
 * Place the following notetags to make their visibility as a shop item appear
 * or not when the shop scene opens up.
 * 
 * Item, Weapon, and Armor Notetags
 * 
 *   <Shop Hide if Switch On: x>
 *   <Shop Hide if Switch Off: x>
 *   - This will determine if a shop will be hidden if the specific switch 'x'
 *   is either on/off (depending on the notetag you're using). Insert multiples
 *   of these notetags if you want to use multiple switches to determine the
 *   item's visibility.
 * 
 *   <Shop Hide if Any Switch On: x>
 *   <Shop Hide if Any Switch On: x, x, x>
 *   <Shop Hide if Any Switch Off: x>
 *   <Shop Hide if Any Switch Off: x, x, x>
 *   - If any of the switches 'x' are on/off (depending on the notetag you're
 *   using), then the shop will hide the item. Insert multiples of these
 *   notetags if you want to use multiple switch batches to determine the
 *   item's visibility.
 * 
 *   <Shop Hide if All Switches On: x>
 *   <Shop Hide if All Switches On: x, x, x>
 *   <Shop Hide if All Switches Off: x>
 *   <Shop Hide if All Switches Off: x, x, x>
 *   - If all of the switches 'x' are on/off (depending on the notetag you're
 *   using), then the shop will hide the item. Insert multiples of these
 *   notetags if you want to use multiple switch batches to determine the
 *   item's visibility.
 *
 * ============================================================================
 * Changelog
 * ============================================================================
 *
 * Version 1.00:
 * - Finished Plugin!
 *
 * ============================================================================
 * End of Helpfile
 * ============================================================================
 *
 * @param ShowFinalization
 * @text Show/Hide Finalization
 * @type note
 * @desc JavaScript code that's ran for each item to check if the
 * item will be shown or hidden on a global scale.
 * @default "// The following variables can be used.\n// item - the item in question being analyzed\n\n// Don't show any items if their name is empty.\nif (item.name.trim() === '') {\n  return false;\n}"
 *
 */
//=============================================================================

Yanfly.Parameters = PluginManager.parameters('YEP_X_HideShowShopItems');
Yanfly.Param = Yanfly.Param || {};

Yanfly.Param.HSSIFinalizeCode = new Function('item',
  JSON.parse(Yanfly.Parameters['ShowFinalization']) + '\nreturn true;');

//=============================================================================
// Parameter Variables
//=============================================================================

Yanfly.HSSI.Scene_Shop_prepare = Scene_Shop.prototype.prepare;
Scene_Shop.prototype.prepare = function(goods, purchaseOnly) {
  goods = JsonEx.makeDeepCopy(goods);
  Yanfly.HSSI.Scene_Shop_prepare.call(this, goods, purchaseOnly);
  this.adjustHideShowGoods();
};

Scene_Shop.prototype.adjustHideShowGoods = function() {
  var length = this._goods.length;
  for (var i = 0; i < length; ++i) {
      var good = this._goods[i];
      if (this.isGoodShown(good)) continue;
      this._goods[i][0] = -1;
  }
};

Scene_Shop.prototype.isGoodShown = function(good) {
  // Get Database Item
  var item = null;
  switch (good[0]) {
  case 0:
    item = $dataItems[good[1]];
    break;
  case 1:
    item = $dataWeapons[good[1]];
    break;
  case 2:
    item = $dataArmors[good[1]];
    break;
  }
  if (!item) return false;
  if (!item.note) return false;
  // Check Notetags
  var notedata = item.note.split(/[\r\n]+/);
  var length = notedata.length;
  for (var i = 0; i < length; ++i) {
    var line = notedata[i];

    // <Shop Hide If Switch On: x>
    if (line.match(/<SHOP HIDE IF (?:SWITCH|SWITCHES) ON:[ ](\d+)>/i)) {
      var hide = $gameSwitches.value(Number(RegExp.$1));
      if (hide) return false;

    // <Shop Hide If Switch Off: x>
    } else if (line.match(/<SHOP HIDE IF (?:SWITCH|SWITCHES) OFF:[ ](\d+)>/i)) {
      var hide = !$gameSwitches.value(Number(RegExp.$1));
      if (hide) return false;

    // <Shop Hide If Any Switch On: x, x, x>
    } else if (line.match(/<SHOP HIDE IF ANY (?:SWITCH|SWITCHES) ON:[ ]*(\d+(?:\s*,\s*\d+)*)>/i)) {
      var array = JSON.parse('[' + RegExp.$1.match(/\d+/g) + ']');
      var hide = false;
      for (var a = 0; a < array.length; ++a) {
        var switchId = array[a];
        if ($gameSwitches.value(switchId)) hide = true;
      }
      if (hide) return false;

    // <Shop Hide If Any Switch Off: x, x, x>
    } else if (line.match(/<SHOP HIDE IF ANY (?:SWITCH|SWITCHES) OFF:[ ]*(\d+(?:\s*,\s*\d+)*)>/i)) {
      var array = JSON.parse('[' + RegExp.$1.match(/\d+/g) + ']');
      var hide = false;
      for (var a = 0; a < array.length; ++a) {
        var switchId = array[a];
        if (!$gameSwitches.value(switchId)) hide = true;
      }
      if (hide) return false;

    // <Shop Hide If All Switches On: x, x, x>
    } else if (line.match(/<SHOP HIDE IF ALL (?:SWITCH|SWITCHES) ON:[ ]*(\d+(?:\s*,\s*\d+)*)>/i)) {
      var array = JSON.parse('[' + RegExp.$1.match(/\d+/g) + ']');
      var hide = true;
      for (var a = 0; a < array.length; ++a) {
        var switchId = array[a];
        if (!$gameSwitches.value(switchId)) hide = false;
      }
      if (hide) return false;

    // <Shop Hide If All Switches Off: x, x, x>
    } else if (line.match(/<SHOP HIDE IF ALL (?:SWITCH|SWITCHES) OFF:[ ]*(\d+(?:\s*,\s*\d+)*)>/i)) {
      var array = JSON.parse('[' + RegExp.$1.match(/\d+/g) + ']');
      var hide = true;
      for (var a = 0; a < array.length; ++a) {
        var switchId = array[a];
        if ($gameSwitches.value(switchId)) hide = false;
      }
      if (hide) return false;

    // End
    }
  }
  // Return true otherwise
  return Yanfly.Param.HSSIFinalizeCode.call(this, item);
};

//=============================================================================
// End of File
//=============================================================================