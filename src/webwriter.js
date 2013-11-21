"use strict";

(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else {
    // Browser globals
    factory(jQuery);
  }
}(function($){

  //= lib.js
  //= editor.js
  //= layout.js
  //= events.js
  //= commands.js
  //= cursor.js
  //= input.js
  //= selection.js
  //= parser.js
  //= undomanager.js

  $.fn.webwriter = function(options) {
    return this.each(function () {
      var $this = $(this),
        data  = $this.data('webwriter');

      if(!data) {
        options = $.extend({}, true, options, {
          container: this
        });
        $this.data('webwriter', (data = new Editor(options)));
      }
      if(typeof options == 'string') {
        data[options]();
      }
    });
  };

  // Setup webwriter as an amd module, if define is available
  // if (typeof define !== "undefined" && typeof define === "function" && define.amd) {
  //   define( "webwriter", [], function () { return Editor; } );
  // } else {
  //   window.Editor = Editor;
  // }

}));