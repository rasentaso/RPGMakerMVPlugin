//=============================================================================
// WeaponMagazine.js
// ----------------------------------------------------------------------------
// Copyright (c) 2016 rasentaso
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// 2016/1/07 Create
// ----------------------------------------------------------------------------
// Blog    :http://rasentaso.blogspot.jp
// Twitter :https://twitter.com/rasentaso
// GitHub  :https://github.com/rasentaso
//=============================================================================

/*:ja
 * @plugindesc ガンシューティング風、武器の残弾表示、リロード機能を提供します。
 * @author daitaso
 *
 * @param window_xpos
 * @desc windowの左上のx座標
 * @default 530
 *
 * @param window_ypos
 * @desc windowの左上のy座標
 * @default 550
 *
 * @param window_width
 * @desc windowの幅
 * @default 280
 *
 * @param window_height
 * @desc windowの高さ
 * @default 70
 *
 * @param weapon_picture_ofset_x
 * @desc window_xposから武器画像までのx座標補正値
 * @default 0
 *
 * @param weapon_picture_ofset_y
 * @desc window_yposから武器画像までのy座標補正値
 * @default 0
 *
 * @param bullets_number_ofset_x
 * @desc window_xposから弾数表示（数値）までのx座標補正値
 * @default 130
 *
 * @param bullets_number_ofset_y
 * @desc window_yposから弾数表示（数値）までのy座標補正値
 * @default 10
 *
 * @param bullets_gauge_ofset_x
 * @desc window_xposから弾数表示（ゲージ）までのx座標補正値
 * @default 90
 *
 * @param bullets_gauge_ofset_y
 * @desc window_yposから弾数表示（ゲージ）までのy座標補正値
 * @default 20
 *
 * @param bullets_gauge_width
 * @desc 弾数表示（ゲージ）の幅
 * @default 160
 * 
 * @param weapon_picture_filename
 * @desc 武器画像のファイル名
 * @default test
 *
 * @param bullets_max
 * @desc 弾数の装填最大値
 * @default 12
 *
 * @param result_variables_id
 * @desc プラグインコマンドの結果格納用変数のID 成功 1 失敗 0
 * @default 100
 *
 * @help
 *
 * プラグインコマンド:
 *   WeaponMagazine pop                         # 残弾から１つ取り出す
 *   WeaponMagazine reload                      # 残弾に装填最大数をセットする
 *   WeaponMagazine chg picture_filename N          # 武器画像と装填最大数をセットする
 *   WeaponMagazine show                        # 表示する
 *   WeaponMagazine hide                        # 非表示にする
 */

(function() {

    //パラメータ取得
	var _param = PluginManager.parameters('WeaponMagazine');
	var _window_xpos = Number(_param['window_xpos']);
	var _window_ypos = Number(_param['window_ypos']);
	var _window_width = Number(_param['window_width']);
	var _window_height = Number(_param['window_height']);
	var _picture_ofset_x = Number(_param['weapon_picture_ofset_x']);
	var _picture_ofset_y = Number(_param['weapon_picture_ofset_y']);
	var _number_ofset_x  = Number(_param['bullets_number_ofset_x']);
	var _number_ofset_y  = Number(_param['bullets_number_ofset_y']);
	var _gauge_ofset_x  = Number(_param['bullets_gauge_ofset_x']);
	var _gauge_ofset_y  = Number(_param['bullets_gauge_ofset_y']);
	var _gauge_width  = Number(_param['bullets_gauge_width']);
    var _picture_filename  = String(_param['weapon_picture_filename']);
    var _bullets_max    = Number(_param['bullets_max']);
    var _bullets_remain = _bullets_max;
    var _result_id = Number(_param['result_variables_id']);
    var _visible = false;

	//プラグインコマンド
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
		if (command === 'WeaponMagazine') {
            switch (args[0]) {
            case 'pop':
				if(_bullets_remain > 0){
                    //pop成功
                    $gameVariables.setValue(_result_id,1);
                    _bullets_remain--;    
				}else{
                    //pop失敗                    
                    $gameVariables.setValue(_result_id,0);                    
                }
                break;
			case 'reload':
                if(_bullets_remain < _bullets_max){
                    //reload成功
                    $gameVariables.setValue(_result_id,1);
                    _bullets_remain = _bullets_max;                  
                }else{
                    //reload失敗
                    $gameVariables.setValue(_result_id,0);              
                }

                break;
			case 'chg':
				_picture_filename = String(args[1]);
				_bullets_max = Number(args[2]);
                _bullets_remain = _bullets_max;
                break;
			case 'show':
				_visible = true;
                break;
			case 'hide':
				_visible = false;
                break;
			}
		}
    };

	//Window_WeaponMagazine
	function Window_WeaponMagazine() {
        this.initialize.apply(this, arguments);
	}
	Window_WeaponMagazine.prototype = Object.create(Window_Base.prototype);
	Window_WeaponMagazine.prototype.constructor = Window_WeaponMagazine;
	Window_WeaponMagazine.prototype.initialize = function() {
        Window_Base.prototype.initialize.call(this, _window_xpos, _window_ypos, this.windowWidth(), this.windowHeight());
        ImageManager.loadPicture(_picture_filename);

	};
	// ウィンドウの幅を取得
	Window_WeaponMagazine.prototype.windowWidth = function() {
        return _window_width;
	};

	// ウィンドウの高さを取得
	Window_WeaponMagazine.prototype.windowHeight = function() {
        return _window_height;
	};

	// パディングを取得
	Window_WeaponMagazine.prototype.standardPadding = function() {
        return 0;
	};

	// 毎フレームの更新
	Window_WeaponMagazine.prototype.update = function() {
        Window_Base.prototype.update.call(this);
        if (_visible) {
            this.show();
            this.refresh();
        }else{
            this.hide();
        }
	};

	// リフレッシュ
	Window_WeaponMagazine.prototype.refresh = function() {

        this.contents.clear();

        //武器画像の描画
        var bitmap = ImageManager.loadPicture(_picture_filename);
        this.contents.blt(bitmap, 0, 0, bitmap.width, bitmap.height, _picture_ofset_x, _picture_ofset_y);

        //残弾表示（数値）の描画
        var text = String(_bullets_remain) + '/' + String(_bullets_max);
        this.drawText(text,_number_ofset_x,_number_ofset_y,255);

        //残弾表示（ゲージ描画
        var rate = Number(_bullets_remain) / Number(_bullets_max); 
        this.drawGauge(_gauge_ofset_x, _gauge_ofset_y, _gauge_width, rate, this.tpGaugeColor1(), this.tpGaugeColor2());
        
	};
    
    //Scene_Mapに追加する
	var _Scene_Map_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
	Scene_Map.prototype.createDisplayObjects = function() {
	  _Scene_Map_createDisplayObjects.call(this);
        this.window_weaponmagazine = new Window_WeaponMagazine();
		this.addChild(this.window_weaponmagazine);
	};
	var _Scene_Map_prototype_terminate = Scene_Map.prototype.terminate;
	Scene_Map.prototype.terminate = function() {
	  this.window_weaponmagazine.hide();
	  _Scene_Map_prototype_terminate.call(this);
	};

})();
