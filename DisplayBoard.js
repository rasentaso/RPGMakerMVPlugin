/*****************************************************************************

　DisplayBoard.js
 
　[LICENSE]
 　Copyright (c) 2016 rasentaso
 　Released under the MIT license
 　http://opensource.org/licenses/mit-license.php

　[URL]
　 http ://rasentaso.blogspot.jp
 　https://twitter.com/rasentaso
 　https://github.com/rasentaso

　[HISTORY]
 　2016/5/2 Create
  
*******************************************************************************/

/*:ja
 * @plugindesc 独自の情報ボードの作成＆表示
 * @author rasentaso
 *
 * @help
 * プラグインコマンドから独自レイアウトの表示ボードを作成し、ウインドウ表示します。
 * 
 * ○使い方手順
 *
 * 1. 新規の情報ボードを作成します。
 *
 *  DisplayBoard　new 1
 *
 * 2. 情報ボードの中身を作成します。
 *
 *  DisplayBoard text あいうえお 0 0
 *  DisplayBoard text かきくけこ 0 36
 *  DisplayBoard text さしすせそ 0 72 
 *
 * 3.情報ボードを表示します。
 *
 *  DisplayBoard show 1
 *
 *
 * ○プラグインコマンドリファレンス
 *
 * コマンド名　new
 * パラメータ　ボードID　[Windowの左上位置X　Windowの左上位置Y 横幅 縦幅]　※[]内は省略可能
 *      説明  空のボードを作成します。
 *           ボードIDが既に存在していた場合は上書きされます。
 *           []内を省略した場合、自動的に画面いっぱいのサイズに設定されます。
 *           
 * コマンド名　show
 * パラメータ　ボードID
 *      説明　指定のボードをウインドウ表示します。
 *
 * コマンド名　text
 * パラメータ　描画する文字列　描画位置X 描画位置Y　
 *      説明  指定の位置に文字列を表示します。
 * 
 * 　　　　　　制御文字も使えます（使い方はツクール本体のイベント「文章の表示」の中をマウスオーバーすると見れます）
 * 　　　　　　　\V[n]
 * 　　　　　　　\N[n]
 * 　　　　　　　\P[n]
 * 　　　　　　　\G
 * 　　　　　　　\C[n]
 * 　　　　　　　\I[n]
 * 　　　　　　　\{
 * 　　　　　　　\}
 *
 * コマンド名　rect
 * パラメータ　描画位置X　描画位置Y　横幅　縦幅　透明度(0~255)　[色]　※[]内は省略可能
 *　　　 説明　指定の位置に四角形を描画し塗りつぶします。
 *
 * コマンド名　image
 * パラメータ　画像ファイル名　描画位置X　描画位置Y
 *      説明　指定の位置に画像を描画します。　
 *　　　　　　 画像ファイルの格納ディレクトリはimg/pictures/を使います。
 *
 *   ※全ての描画コマンドは直近にnewしたボードIDが処理対象になります。
 *
 */

(function() {
    
    var _boards = new Array(255);    //同時に管理できるboardの最大数（必要なら増やす）
    var _board_id;
        
	//プラグインコマンド
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
		if (command === 'DisplayBoard') {
            
            var bindArgs　= function (f,args){
                                return  (function(args){
                                            return f;
                                        })(args);
                            }    
        
            switch (args[0]) {
                    
            case 'new':　//ボードの新規作成
                _board_id =  Number(args[1]);                                    
                _boards[_board_id] = [];            
                    
                if(args.length !== 6) break;    //windowサイズ指定省略時
                    
                _boards[_board_id].push(bindArgs(function(){       
                    
                                                    var x   = Number(args[2]);
                                                    var y   = Number(args[3]);
                                                    var w   = Number(args[4]);
                                                    var h   = Number(args[5]);
                                                    this.move(x,y,w,h);   
                    
                                                },args));
                break;

            case 'show':　//ウインドウ表示
                _board_id = Number(args[1]);
                if(_boards[_board_id] === undefined){
                    console.log("エラー　未作成のボードです");
                    break;
                }
                SceneManager.push(Scene_DisplayBoard);                    
                break;
                    
            case 'text':　//テキスト描画
                _boards[_board_id].push(bindArgs(function(){       

                                                    var text    = String(args[1]);
                                                    var x       = Number(args[2]);
                                                    var y       = Number(args[3]);
                                                    
                                                    console.log(text);
                                                    this.drawTextEx(text, x, y);  
                                                },args));
                break;
                    
            case 'rect': //矩形描画
                _boards[_board_id].push(bindArgs(function(){        
                    
                                                    var x   = Number(args[1]);
                                                    var y   = Number(args[2]);
                                                    var w   = Number(args[3]);
                                                    var h   = Number(args[4]);
                                                    var o   = Number(args[5]);
                                                    var c   = String(args[6] || this.normalColor());

                                                    this.contents.paintOpacity = o;
                                                    this.contents.fillRect(x, y, w, h, c);
                                                    this.contents.paintOpacity = 255;                  
                    
                                                },args));                    
                break;
                                                                                
            case 'image': //イメージ描画
                _boards[_board_id].push(bindArgs(function(){        

                                                    var file_name   = String(args[1]);
                                                    var x           = Number(args[2]);                    
                                                    var y           = Number(args[3]); 
                                                    var bitmap      = ImageManager.loadPicture(file_name);
                                                    this.contents.blt(bitmap,0,0,bitmap.width,bitmap.height,x,y);  
                    
                                                },args));                    
                break;

            default:
                break;                        
                
            }
		}
    };
    
        
    //-----------------------------------------------------------------------------
    // Scene_DisplayBoard
    //
    // The scene class of the Window_DisplayBoard screen.
    function Scene_DisplayBoard() {
        this.initialize.apply(this, arguments);
    }
    Scene_DisplayBoard.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_DisplayBoard.prototype.constructor = Scene_DisplayBoard;
    
    Scene_DisplayBoard.prototype.initialize = function() {
        Scene_MenuBase.prototype.initialize.call(this);
    };

    Scene_DisplayBoard.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);

        this.window_DisplayBoard = new Window_DisplayBoard();
        this.window_DisplayBoard.setHandler('cancel', this.popScene.bind(this));
		this.addWindow(this.window_DisplayBoard);        
        
    };
    
    //-----------------------------------------------------------------------------
    // Window_DisplayBoard
    //
    // The window for displaying customize info.

    function Window_DisplayBoard() {
        this.initialize.apply(this, arguments);
    }

    Window_DisplayBoard.prototype = Object.create(Window_Selectable.prototype);
    Window_DisplayBoard.prototype.constructor = Window_DisplayBoard;
    Window_DisplayBoard.prototype.initialize = function() {
                
        Window_Selectable.prototype.initialize.call(this, Graphics.boxWidth / 8, Graphics.boxHeight / 8, Graphics.boxWidth / 1.33 , Graphics.boxHeight / 1.33);
        this.refresh();
        this.activate();
        
    };

    Window_DisplayBoard.prototype.refresh = function() {

        this.contents.clear();
    
        cmds = _boards[_board_id];
        for(var i = 0; i < cmds.length; ++i){
            cmds[i].call(this);
        }
        
    };
    
})();