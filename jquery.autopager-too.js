/*
 * jQuery.autopager Too v1.0.1
 *
 * Copyright (c) cristinawithout
 * Based on jQuery.autopager copyright (c) Lagos
 * 
 * Dual licensed under the MIT and GPL licenses.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE. 
 */
(function($) {
  var window = this, options = {},
  content, currentUrl, nextUrl,
  active = false,
  defaults = {
    autoLoad: true,
    page: 1,
    content: '.content',
    link: 'a[rel=next]',
    insertBefore: null, 
    appendTo: null, 
    start: function() {},
    load: function() {},
    disabled: false
  };

  $.autopager = function(_options) {
    var autopager = this.autopager;

    if (typeof _options === 'string' && $.isFunction(autopager[_options])) {
      var args = Array.prototype.slice.call(arguments, 1),
      value = autopager[_options].apply(autopager, args);

      return value === autopager || value === undefined ? this : value;
    }

    _options = $.extend({}, defaults, _options);
    autopager.option(_options);

    content = $(_options.content).filter(':last');
    if (content.length) {
      if (!_options.insertBefore && !_options.appendTo) {
        var insertBefore = content.next();
        if (insertBefore.length) {
          set('insertBefore', insertBefore);
        } else {
          set('appendTo', content.parent());
        }
      }
    }

    setUrl();

    return this;
  };

  $.extend($.autopager, {
    option: function(key, value) {
      var _options = key;

      if (typeof key === "string") {
        if (value === undefined) {
          return options[key];
        }
        _options = {};
        _options[key] = value;
      }

      $.each(_options, function(key, value) {
        set(key, value);
      });
      return this;
    },

    enable: function() {
      set('disabled', false);
      return this;
    },

    disable: function() {
      set('disabled', true);
      return this;
    },

    destroy: function() {
      this.autoLoad(false);
      options = {};
      content = currentUrl = nextUrl = undefined;
      return this;
    },

    autoLoad: function(value) {
      return this.option('autoLoad', value);
    },

    load: function() {
      if (active || !nextUrl || $.noAutopager) {
        return;
      }

      active = true;
      options.start(currentHash(), nextHash());
      $.get(nextUrl, insertContent);
      return this;
    },

    reset: function() {
      setUrl();
    },

    isLoading: function() {
      return active;
    },

    hasMore: function() {
      return (nextUrl ? true : false);
    }

  });

  function set(key, value) {
    switch (key) {
      case 'autoLoad':
        if (value && !options.autoLoad) {
          $(window).scroll(loadOnScroll);
        } else if (!value && options.autoLoad) {
          $(window).unbind('scroll', loadOnScroll);
        }
        break;
      case 'insertBefore':
        if (value) {
          options.appendTo = null;
        }
        break
      case 'appendTo':
        if (value) {
          options.insertBefore = null;
        }
        break
    }
    options[key] = value;
  }

  function setUrl(context) {
    currentUrl = nextUrl || window.location.href;
    nextUrl = $(options.link, context).attr('href');
  }

  function loadOnScroll() {
    var height = window.innerHeight ? window.innerHeight : $(window).height();
    if (content.offset().top + content.height() < $(document).scrollTop() + height) {
      $.autopager.load();
    }
  }

  function stripTag(s, tagsToRemove) {
    var index;
    for (index = 0; index < tagsToRemove.length; index++) {
      var div = document.createElement('div');
      div.innerHTML = s;
      var tags = div.getElementsByTagName(tagsToRemove[index]);
      var i = tags.length;
      while (i--) {
        tags[i].parentNode.removeChild(tags[i]);
      }
      s = div.innerHTML;
    }
    return s;
  }

  function insertContent(res) {
    var _options = options,
      nextPage = $('<div/>').append(stripTag(res, [ "script", "noscript"])),
    nextContent = nextPage.find(_options.content); 

    set('page', _options.page + 1);
    setUrl(nextPage);
    if (nextContent.length) {
      if (_options.insertBefore) {
        nextContent.insertBefore(_options.insertBefore);
      } else {
        nextContent.appendTo(_options.appendTo);
      }
      _options.load.call(nextContent.get(), currentHash(), nextHash());
      content = nextContent.filter(':last');
    }
    active = false;
  }

  function currentHash() {
    return {
      page: options.page,
      url: currentUrl
    };
  }

  function nextHash() {
    return {
      page: options.page + 1,
      url: nextUrl
    };
  }
})(jQuery);
