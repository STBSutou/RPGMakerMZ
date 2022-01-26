
//=============================================================================
// STB_SmoothTouchMove.js
//=============================================================================
/*
  更新履歴 - update history
  2022/01/20 ver.0.9.0 ほぼ完成
*/


/*:ja
 * @target MZ
 * @plugindesc ver.0.9.0 タッチ移動に関する挙動を改善し、スムーズな操作を可能にします。
 * @author STBSutou
 * 
 * @url https://twitter.com/StbSutou
 *
 * @help
 * 
 * ＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊
 * 
 * ＋はじめに
 * これはMZ準公式プラグインであるSmoothTouchMove（作・神無月サスケ様）を
 * 参考にして作られた、タッチ移動の挙動を改善するプラグインです。
 * 内部処理的にはだいぶ別物になっており、
 * 混乱を避けるため本家とは別の名前にしています。
 * 
 * 
 * ＋仕様
 * タッチ移動中、以下の条件を満たすイベントに接触しても
 * 移動が中断されなくなります。
 * ・プライオリティが「通常キャラの下」もしくは「通常キャラの上」
 * ・トリガーが「プレイヤーと接触」
 * ・「文章の表示」のようなテキスト表示を含まない
 * 
 * また、上記イベントの起動時にタッチ状態を維持していた場合、
 * タッチ移動先の更新が引き続き行われます。
 * 
 * 
 * ＋ライセンス
 * 現行バージョン（ver.0.9.0）はひとまずMITライセンスで配布します。
 * ただプラグイン関係のサポート体制を整えられていないため、
 * 今後変更になる可能性があります。
 * http://opensource.org/licenses/mit-license.php
 * 
 * ＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊
 */

(function() {
  let shouldResetDest = false
    , shouldReactivateTouch = false
    , destX = null
    , destY = null
    , resetIdlingCount = 0
    ;
  const triggersString = JSON.stringify([1, 2]);



  //func
  const preserveDestination = (x, y) => {
    destX = x;
    destY = y;
  };

  //scene map
  Scene_Map.prototype.reactivateTouchCount = function () {
    this._touchCount = 14;
  };
  const _Scene_Map_processMapTouch = Scene_Map.prototype.processMapTouch;
  Scene_Map.prototype.processMapTouch = function () {
    _Scene_Map_processMapTouch.call(this);
    if (shouldReactivateTouch) {
      if (TouchInput.isPressed()) {
        this.reactivateTouchCount();
      }
      shouldReactivateTouch = false;
    }
  };

  //game temp
  const _Game_Temp_setDestination = Game_Temp.prototype.setDestination;
  Game_Temp.prototype.setDestination = function(x, y) {
    _Game_Temp_setDestination.call(this, x, y);
    preserveDestination(x, y);
  };

  //game player
  const _Game_Player_triggerTouchActionD2 = Game_Player.prototype.triggerTouchActionD2;
  Game_Player.prototype.triggerTouchActionD2 = function (x2, y2) {
    const result = _Game_Player_triggerTouchActionD2.call(this, x2, y2);
    if (result) {
      $gameTemp.clearDestination();
    }
    return result;
  };


  const _Game_Player_checkEventTriggerHere = Game_Player.prototype.checkEventTriggerHere;
  Game_Player.prototype.checkEventTriggerHere = function (triggers) {
    _Game_Player_checkEventTriggerHere.call(this, triggers);
    if (JSON.stringify(triggers) === triggersString && $gameMap.isAnyEventStarting() ) {
      if (!TouchInput.isPressed()) {
        if (destX !== this.x || destY !== this.y) {
          shouldResetDest = true;
          resetIdlingCount = 0;
        }
      }
      else {
        shouldReactivateTouch = true;
      }
    }
  };

  const _Game_Player_moveByInput = Game_Player.prototype.moveByInput;
  Game_Player.prototype.moveByInput = function () {
    
    if (shouldResetDest) {
      if (this.isTransferring()) {
        shouldResetDest = false;
      }
      else {
        resetIdlingCount++;
        if (resetIdlingCount > 2) {
          shouldResetDest = false;
          resetIdlingCount = 0;
        }
        if (!this.isMoving() && this.canMove()) {
          shouldResetDest = false;
          $gameTemp.setDestination(destX, destY);
        }
      }
    }

    _Game_Player_moveByInput.call(this);
  };

})();
