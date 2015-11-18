//=============================================================================
// SpeedDash.js
//=============================================================================
/*:ja
 * @plugindesc ダッシュ時のスピードを指定します
 * @author daitaso
 *
 * @param Speed
 * @desc スピード（１以上の整数）を指定します。（１：通常　２：倍速　３以上：超高速）
 * @default 1
 * *
 * @help このプラグインには、プラグインコマンドはありません。
 */

(function() {

    var parameters = PluginManager.parameters('SpeedDash');
    var speed = Number(parameters['Speed'] || 0);
    Game_CharacterBase.prototype.realMoveSpeed = function() {
    	return this._moveSpeed + (this.isDashing() ? speed : 0);
	};
	
})();
