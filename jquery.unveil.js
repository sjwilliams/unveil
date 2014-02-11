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

  /**
   * [unveil description]
   * @param  {[type]}   threshold [description]
   * @param  {[type]}   options   [description]
   * @param  {Function} callback  [description]
   * @return {[type]}             [description]
   */
  $.fn.unveil = function(options, callback) {

    var $w = $(window),
        $images = this,
        $loaded = $(), // elements with the correct source set
        retina = window.devicePixelRatio > 1,
        loaded;

    options = $.extend(true, {
      threshold: 0,
      getSource: function($el){
        var source;
        var data = $el.data();
        if (data.pattern && data.widths && $.isArray(data.widths)) {
          source = retina ? data.patternRetina : data.pattern;
          source = source || data.pattern;
          source = source.replace(/{{WIDTH}}/i, bestFit($el.width(), data.widths));
        } else {
          source = retina ? data.srcRetina : data.src;
          source = source || data.src;
        }

        return source;
      }
    }, options);

    /**
     * Attach event handler that sets correct 
     * media source for the elements' width
     */
    function bindUnveil() {
      $images.one('unveil', function() {
        var source = options.getSource($(this));
        if (source && this.getAttribute('src') !== source) {
          console.log(source);
          this.setAttribute('src', source);
          if (typeof callback === 'function') callback.call(this);
        }
      });
    }

    /**
     * Remove even handler from elements
     */
    function unbindUnveil() {
      $images.off('unveil');
    }

    /**
     * Find the best sized image, opting for larger over smaller
     * 
     * @param  {Number} targetWidth element width
     * @param  {Array} widths      available sizes
     * @return {Number}
     */
    function bestFit(targetWidth, widths) {
      var selectedWidth = widths[widths.length - 1],
          i = widths.length; 
      while (i--) {
        if (targetWidth <= widths[i]) {
            selectedWidth = widths[i];
        }
        console.log(targetWidth, widths[i], selectedWidth); 
      }

      return selectedWidth;
    }

    /**
     * Cycle through elements that haven't had their 
     * source set and, if they're in the viewport within
     * the threshold, load their media
     */
    function unveil() {
      var $inview = $images.not($loaded).filter(function() {
        var $el = $(this);
        var th = options.threshold;
        if ($el.is(':hidden')) return;

        var wt = $w.scrollTop(),
            wb = wt + $w.height(),
            et = $el.offset().top,
            eb = et + $el.height();

        return eb >= wt - th && et <= wb + th;
      });

      $inview.trigger('unveil');
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
