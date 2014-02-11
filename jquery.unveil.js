/**
 * jQuery Unveil
 * A very lightweight jQuery plugin to lazy load images
 * http://luis-almeida.github.com/unveil
 *
 * Licensed under the MIT license.
 * Copyright 2013 Luís Almeida
 * https://github.com/luis-almeida
 */

;(function($) {

  $.fn.unveil = function(threshold, callback) {

    var $w = $(window),
        th = threshold || 0,
        retina = window.devicePixelRatio > 1,
        attrib = retina? "data-src-retina" : "data-src",
        $loaded = $(),
        $images = this,
        loaded;

    function bindUnveil() {
      $images.one("unveil", function() {
        var source = this.getAttribute(attrib);
        source = source || this.getAttribute("data-src");
        if (source && this.getAttribute('src') !== source) {
          this.setAttribute("src", source);
          if (typeof callback === "function") callback.call(this);
        }
      });
    }

    function unbindUnveil() {
      $images.off('unveil');
    }

    function unveil() {
      var $inview = $images.not($loaded).filter(function() {
        var $e = $(this);
        if ($e.is(":hidden")) return;

        var wt = $w.scrollTop(),
            wb = wt + $w.height(),
            et = $e.offset().top,
            eb = et + $e.height();

        return eb >= wt - th && et <= wb + th;
      });

      $inview.trigger("unveil");
      $loaded.add($inview);
    }

    bindUnveil();
    $w.scroll(unveil);

    // reset state on resize
    $w.resize(function(){
      $loaded = $();
      unbindUnveil();
      bindUnveil();
      unveil();
    });

    unveil();

    return this;
  };

})(window.jQuery || window.Zepto);
