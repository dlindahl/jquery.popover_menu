;(function( jQuery ){

  var tpl = [
    // The popover is built as hidden so that the width and height can be determined based on its contents
    "<div class=\"popover\" style=\"visibility: hidden;\">",
      "<div class=\"popover-menu\">",
        "<aside class=\"pointers\">",
          "<div class=\"north\">",
            "<span class=\"outer\"></span>",
            "<span class=\"highlight\"></span>",
            "<span class=\"inner\"></span>",
          "</div>",
          "<div class=\"south\">",
            "<span class=\"outer\"></span>",
            "<span class=\"inner\"></span>",
          "</div>",
        "</aside>",
        "<article>",
          "<mark></mark>",
        "</article>",
      "</div>",
    "</div>"
  ],
  // Ported from ExtJS 3.2.1
  _getRegion = function(el) {
      var p = el.offset(),
          t = p.top,
          r = p.left + el.width(),
          b = p.top + el.height(),
          l = p.left;

      return { top:t, right:r, bottom:b, left:l };
  },
  // Ported from ExtJS 3.2.1
  _getAnchorXY = function(anchor, local, s){
      // Passing a different size is useful for pre-calculating anchors,
      // especially for anchored animations that change the el size.
      anchor = (anchor || "tl").toLowerCase();
      s = s || {};

      var me = this,
          vp = me.dom == document.body || me.dom == document,
          w = s.width || vp ? $(document).width() : me.width(),
          h = s.height || vp ? $(document).height() : me.height(),
          xy,
          r = Math.round,
          o = me.offset(),
          extraX = vp ? me.scrollLeft() : !local ? o.left : 0,
          extraY = vp ? me.scrollTop() : !local ? o.top : 0,
          hash = {
            c  : [r(w * 0.5), r(h * 0.5)],
            t  : [r(w * 0.5), 0],
            l  : [0, r(h * 0.5)],
            r  : [w, r(h * 0.5)],
            b  : [r(w * 0.5), h],
            tl : [0, 0],	
            bl : [0, h],
            br : [w, h],
            tr : [w, 0]
          };

      xy = hash[anchor];

      return [xy[0] + extraX, xy[1] + extraY];
  },
  // Ported from ExtJS 3.2.1
  _getAlignToXY = function(el, p, o){
      el = $(el);

      if(el.length == 0){
        throw "alignToXY with an element that doesn't exist";
      }

      o = o || [0,0];
      p = (!p || p == "?" ? "tl-bl?" : (!/-/.test(p) && p !== "" ? "tl-" + p : p || "tl-bl")).toLowerCase();

      var me = this,
          d = me.dom,
          a1,
          a2,
          x,
          y,
          // constrain the aligned el to viewport if necessary
          w,
          h,
          r,
          dw = Ext.lib.Dom.getViewWidth() -10, // 10px of margin for ie
          dh = Ext.lib.Dom.getViewHeight()-10, // 10px of margin for ie
          p1y,
          p1x,
          p2y,
          p2x,
          swapY,
          swapX,
          doc = document,
          docElement = doc.documentElement,
          docBody = doc.body,
          scrollX = (docElement.scrollLeft || docBody.scrollLeft || 0)+5,
          scrollY = (docElement.scrollTop || docBody.scrollTop || 0)+5,
          c = false, //constrain to viewport
          p1 = "", 
          p2 = "",
          m = p.match(/^([a-z]+)-([a-z]+)(\?)?$/);

      if(!m){
        throw "alignTo with an invalid alignment " + p;
      }

      p1 = m[1];
      p2 = m[2];
      c = !!m[3];

      // Subtract the aligned el's internal xy from the target's offset xy
      // plus custom offset to get the aligned el's new offset xy
      a1 = _getAnchorXY.call(me, p1, true);
      a2 = _getAnchorXY.call(el, p2, false);

      x = a2[0] - a1[0] + o[0];
      y = a2[1] - a1[1] + o[1];

      if(c){
        w = me.width();
        h = me.height();
        r = _getRegion(el),
        // If we are at a viewport boundary and the aligned el is anchored on a target border that is
        // perpendicular to the vp border, allow the aligned el to slide on that border,
        // otherwise swap the aligned el to the opposite border of the target.
        p1y = p1.charAt(0);
        p1x = p1.charAt(p1.length-1);
        p2y = p2.charAt(0);
        p2x = p2.charAt(p2.length-1);
        swapY = ((p1y=="t" && p2y=="b") || (p1y=="b" && p2y=="t"));
        swapX = ((p1x=="r" && p2x=="l") || (p1x=="l" && p2x=="r"));

         if(x + w > dw + scrollX) {
           x = swapX ? r.left-w : dw+scrollX-w;
         }
         if(x < scrollX) {
           x = swapX ? r.right : scrollX;
         }
         if(y + h > dh + scrollY) {
           y = swapY ? r.top-h : dh+scrollY-h;
         }
         if(y < scrollY){
           y = swapY ? r.bottom : scrollY;
         }
      }
      return [x,y];
  },
  _hideOnClose = function(e) {
    var menu = $(this);
    if(menu.is(':visible')) {
      methods.hide.call(menu);
    }
  }
  _subscribeToOutsideClicks = function(menu) {
    // If the outside-events plugin is available, use it to close the popover
    if(jQuery.addOutsideEvent) {
      menu.bind('clickoutside', _hideOnClose);
    }
  },
  _unsubscribeFromOutsideClicks = function(menu) {
    menu.unbind('clickoutside', _hideOnClose);
  };


  var methods = {
    // Uses a port of ExtJS's alignTo methods
    alignTo : function(element, position, offsets){
      var xy = _getAlignToXY.call(this, element, position, offsets);
      return this.offset({ left:xy[0], top: xy[1] });
    },
    init : function( options ) {
      var options = options || {},
          menu = $(tpl.join(''));

      if(options.anchorTo && !jQuery.isArray( options.anchorTo )) {
        options.anchorTo = [ options.anchorTo ];
      }

      menu.attr('id', options.id || (this.attr('id') + "-popover-menu") );
      $('article', menu).append( this.addClass('popover-body') );

      $(options.appendTo || document.body).append(menu);

      menu.width( options.width || this.outerWidth(true) ).height( options.height || this.outerHeight(true) );

      if(options.pointer) {
        $('.popover-menu', menu).addClass('pointer pointer-' + options.pointer);
        menu.height( menu.height() + $('.'+options.pointer, menu).height() );
        if(options.anchorTo) {
          if(!options.anchorTo[1]) {
            switch(options.pointer) {
              case "north" :
                options.anchorTo[1] = 't-b?';
                break;
              case "south" :
                options.anchorTo[1] = 'b-t?';
                break;
            }
          } else {
            if(/^\wl/.test( options.anchorTo[1] )) {
              $('.popover-menu', menu).addClass('pointer-align-left');
              options.anchorTo[2] = options.anchorTo[2] || [-15,0];
            } else if(/^\wr/.test( options.anchorTo[1] )) {
              $('.popover-menu', menu).addClass('pointer-align-right');
              options.anchorTo[2] = options.anchorTo[2] || [15,0];
            }
          }
        }
      }

      if(options.top || options.left) {
        menu.offset( options );
      } else if(options.anchorTo) {
        methods.alignTo.apply( menu, options.anchorTo );
      }

      menu.hide().css('visibility','visible'); // No longer need to calculate dimensions, so hide it fo' realz

      if(options.init) {
        options.init.call(menu);
      }

      if(options.show === false) {
        methods.hide.call(menu);
      } else {
        methods.show.apply(menu, options.show);
      }

      return this;
    },
    show : function() {
       // Call _subscribeToOutsideClicks on a delay so that the outside-events plugin doesn't pick up the event that triggered the show()
      setTimeout(function(menu) { _subscribeToOutsideClicks(menu); }, 1, this);
      return this.show.apply(this, arguments);
    },
    hide : function() {
      _unsubscribeFromOutsideClicks(this)
      return this.hide.apply(this, arguments);
    }
  };

  $.fn.popover_menu = function( method ) {
    // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this.parents('.popover'), Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.popover_menu' );
    }
  };

})( jQuery );
