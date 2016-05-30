/*****************************************************************************

　ShareVariablesCounter.js
 
　[LICENSE]
 　Copyright (c) 2016 rasentaso
 　Released under the MIT license
 　http://opensource.org/licenses/mit-license.php

　[URL]
　 http ://rasentaso.blogspot.jp
 　https://twitter.com/rasentaso
 　https://github.com/rasentaso

　[HISTORY]
 　ver 1.00.00  2016/5/18　新規作成
  
*******************************************************************************/

/*:ja
 * @plugindesc 変数をユーザー共有のカウンタ化する
 * @author rasentaso
 *
 * @param app_id
 * @desc milkcocoaのアプリケーションID
 * @default 
 *
 * @param start_variables_id
 * @desc 開始変数番号（カウンタ化する変数番号の範囲指定）
 * @default 
 * 
 * @param end_variables_id
 * @desc 終了変数番号（カウンタ化する変数番号の範囲指定）
 * @default  
 *
 * @help
 * パラメータで指定した範囲のゲーム変数をサーバー管理し、全ユーザー共有のカウンタとして機能させます。
 * 
 * ・ゲームが起動された回数
 * ・特定の実績が達成された回数
 * ・宝箱からレアアイテムが出た回数
 *
 *  等の情報を画面表示するような使い方を想定しています。
 *
 * パラメータをセットしプラグインを有効にすると指定範囲の変数がカウンタ化されます
 * addを実行するたびにカウンタ変数がカウントアップされ、サーバーに記録されます。
 * ゲーム起動時にサーバーと同期します。
 *
 * プラグインからデータを削除する機能はありません。削除する場合はmilkcocoa管理画面からレコード
 * 削除するか、全削除であればアプリケーションIDを再作成するのが手っ取り早いです。
 *
 * プラグインコマンド:
 *
 * コマンド名  add
 * パラメータ　変数番号
 *      説明  指定カウンタ変数に１を加算します
 *
 * 備考：
 *
 * このプラグインはmilkcocoa（https://mlkcca.com/）を使用しています。
 *
 */

(function() {

    //milkcocoa.jsの読み込み
    var url = 'https://cdn.mlkcca.com/v2.0.0/milkcocoa.js';
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.async = false;
    script.onerror = PluginManager.onError.bind(this);
    script._url = url;
    document.body.appendChild(script);

    //パラメータ取得
	var _param             　　= PluginManager.parameters('ShareVariablesCounter');    
    var _app_id               = String(_param['app_id']) + '.mlkcca.com';
    var _start_variables_id   = Number(_param['start_variables_id']);
    var _end_variables_id     = Number(_param['end_variables_id']);
    
	//プラグインコマンド
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
		if (command === 'ShareVariablesCounter') {
        
            switch (args[0]) {                    
            case 'add': //カウンタ変数に１加算する
        
                var variable_id = Number(args[1]);     
                var milkcocoa = new MilkCocoa(_app_id);
                var ds   = milkcocoa.dataStore('ShareVariablesCounter');
                ds.push({'variable_id':variable_id},function(err,pushed){
                    
                    var val = $gameVariables.value(variable_id);
                    val++; 
                    $gameVariables.setValue(variable_id,val);   
                    
                    milkcocoa.disconnect();
                },function(err){
                    milkcocoa.disconnect();                    
                });

                break;
            }
		}
    };

    var _Scene_Map_prototype_create = Scene_Map.prototype.create;
    Scene_Map.prototype.create = function() {
        _Scene_Map_prototype_create.call(this);

        //カウンタ値をサーバーと同期する                    
        for(var id = _start_variables_id; id <= _end_variables_id; ++id){
            $gameVariables.setValue(id,0);
        }
        var milkcocoa = new MilkCocoa(_app_id);                    
        var stream = milkcocoa.dataStore('ShareVariablesCounter').stream().size(999);                    
        (function loop() {
            stream.next(function(err, elems) {
                elems.forEach(function(e){
                    var val = $gameVariables.value(e.value.variable_id);
                    val++;
                    $gameVariables.setValue(e.value.variable_id,val);
                });                
                if(elems.length > 0) loop(); // elemsが空になるまでloop()を実行
            });
        })();       
    
        milkcocoa.disconnect();
    };
                    
    
})();