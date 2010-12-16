# Pure CSS iPad-style Popover Menu jQuery Plug-in

Tested in Firefox 3.6 and Chrome 7.0 only.

## Usage

    $('#foo').popover_menu({
      anchorTo : '#sort', // Positions the menu near this element. See ExtJs's alignTo for more details
      pointer : 'north',  // Adds an upward pointing arrow. Use 'south' for a downward facing arrow.
      show : false,       // FALSE to not display the menu upon creation
      width : 250,        // A specific width for the menu. Leave NULL to use the width of the content element (#foo in this case)
      height : 400,       // A specific height for the menu. Leave NULL to use the height of the content element (#foo in this case)
      init : function() { // A callback method to run after the menu has been initialized
        this.find('li:first-child a').addClass('selected');
      }
    });

## [jQuery Outside Events](https://github.com/cowboy/jquery-outside-events)

In order to provide a better user experience, I added an optional dependency on [cowboy](https://github.com/cowboy)'s jQuery Outside Events plugin. If you have included that plugin in your page and a Popover Menu is visible, any click outside of the ".popover" element will automatically hide the menu.

The plugin has been included in this project as a Git Submodule. If you have never worked with Git Submodules before, check out this excellent [tutorial](http://chrisjean.com/2009/04/20/git-submodules-adding-using-removing-and-updating/).

