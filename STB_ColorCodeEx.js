//=============================================================================
// STB_ColorCodeEx.js
//=============================================================================
/*
*/
//=============================================================================

/*
  (C)2022 STBSutou
  This software is released under the MIT License.
  http://opensource.org/licenses/mit-license.php

  更新履歴 - update history
    v0.9.0 2021/04/27
*/

/*:ja
 * @target MZ
 * @plugindesc カラーコードで色を指定
 * @author STB
 * 
 * @help
 * 
 * カラー指定時、16進カラーコードで色を指定できます
 * 
 */


 (() => {
     'use strict';

     //const script = document.currentScript;
     //const param = PluginManagerEx.createParameter(script);


     //textcolor拡張 16進数カラーコードで指定
     const _Window_Base_processEscapeCharacter = Window_Base.prototype.processEscapeCharacter;
     Window_Base.prototype.processEscapeCharacter = function (code, textState) {
         if (code === "C") {
             const parsedData = ColorManager.parseHexTextColorCode(textState);
             if (parsedData) {
                 textState.index += parsedData.shiftVal;
                 this.changeTextColor(parsedData.hexcode);
                 return;
             }
         }
         _Window_Base_processEscapeCharacter.apply(this, arguments);
     };
     ColorManager.parseHexTextColorCode = function (textState) {
         const regExp = /^\[#[0-9a-fA-F]{6}\]/;
         const arr = regExp.exec(textState.text.slice(textState.index));
         if (arr) {
             return {
                 hexcode: arr[0].slice(1).slice(0, -1),
                 shiftVal: arr[0].length
             };
         } else {
             return "";
         }
     };
     
 })();

