;(function($) {

  /**
   * tk
   * @param  {[type]}   threshold [description]
   * @param  {[type]}   options   [description]
   * @param  {Function} callback  [description]
   * @return {[type]}             [description]
   */
  $.fn.laziestloader = function(options, callback) {

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
    function bindLoader() {
      $images.one('laziestloader', function() {
        var source = options.getSource($(this));
        if (source && this.getAttribute('src') !== source) {
          this.setAttribute('src', source);
          if (typeof callback === 'function') callback.call(this);
        }
      });
    }

    /**
     * Remove even handler from elements
     */
    function unbindLoader() {
      $images.off('laziestloader');
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
      }

      return selectedWidth;
    }

    /**
     * Cycle through elements that haven't had their 
     * source set and, if they're in the viewport within
     * the threshold, load their media
     */
    function laziestloader() {
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

      $inview.trigger('laziestloader');
      $loaded.add($inview);
    }

    bindLoader();
    $w.scroll(laziestloader);

    // reset state on resize
    $w.resize(function(){
      $loaded = $();
      unbindLoader();
      bindLoader();
      laziestloader();
    });

    laziestloader();

    return this;
  };

})(window.jQuery || window.Zepto);
