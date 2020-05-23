"use strict";

// Fix back button cache problem
window.onunload = function () { };

// Global variable, shared between modules
function playpen_text(playpen) {
  let code_block = playpen.querySelector("code");

  if (window.ace && code_block.classList.contains("editable")) {
    let editor = window.ace.edit(code_block);
    return editor.getValue();
  } else {
    return code_block.textContent;
  }
}

(function codeSnippets() {
  // Browserify creates a toplevel `require` function that you can use to get the modules
  const alanCompiler = require('alan-compiler')

  function run_rust_code(code_block) {
    var result_block = code_block.querySelector(".result");
    if (!result_block) {
      result_block = document.createElement('code');
      result_block.className = 'result hljs language-bash';

      code_block.append(result_block);
    }

    let text = playpen_text(code_block);

    // transpile alan to js and eval it
    var oldLog = console.log;
    try {
      const js = alanCompiler('ln', 'js', text)
      result_block.innerText = "";
      console.log = function() {
        result_block.innerText += arguments[0];
        oldLog.apply(oldLog, arguments);
      };
      eval(js);
    } catch (e) {
      result_block.innerText = e.message;
    }
    console.log = oldLog;
  }

  // Syntax highlighting Configuration
  hljs.configure({
    tabReplace: '    ', // 4 spaces
    languages: [],      // Languages used for auto-detection
  });

  let code_nodes = Array
  .from(document.querySelectorAll('code'))
  // Don't highlight `inline code` blocks in headers.
  .filter(function (node) {return !node.parentElement.classList.contains("header"); });

  if (window.ace) {
    // language-rust class needs to be removed for editable
    // blocks or highlightjs will capture events
    Array
    .from(document.querySelectorAll('code.editable'))
    .forEach(function (block) { block.classList.remove('language-rust'); });

    Array
    .from(document.querySelectorAll('code:not(.editable)'))
    .forEach(function (block) { hljs.highlightBlock(block); });
  } else {
    code_nodes.forEach(function (block) { hljs.highlightBlock(block); });
  }

  // Adding the hljs class gives code blocks the color css
  // even if highlighting doesn't apply
  code_nodes.forEach(function (block) { block.classList.add('hljs'); });

  Array.from(document.querySelectorAll("code.language-rust")).forEach(function (block) {

    var lines = Array.from(block.querySelectorAll('.boring'));
    // If no lines were hidden, return
    if (!lines.length) { return; }
    block.classList.add("hide-boring");

    var buttons = document.createElement('div');
    buttons.className = 'buttons';
    buttons.innerHTML = "<button class=\"fa fa-expand\" title=\"Show hidden lines\" aria-label=\"Show hidden lines\"></button>";

    // add expand button
    var pre_block = block.parentNode;
    pre_block.insertBefore(buttons, pre_block.firstChild);

    pre_block.querySelector('.buttons').addEventListener('click', function (e) {
      if (e.target.classList.contains('fa-expand')) {
        e.target.classList.remove('fa-expand');
        e.target.classList.add('fa-compress');
        e.target.title = 'Hide lines';
        e.target.setAttribute('aria-label', e.target.title);

        block.classList.remove('hide-boring');
      } else if (e.target.classList.contains('fa-compress')) {
        e.target.classList.remove('fa-compress');
        e.target.classList.add('fa-expand');
        e.target.title = 'Show hidden lines';
        e.target.setAttribute('aria-label', e.target.title);

        block.classList.add('hide-boring');
      }
    });
  });

  if (window.playpen_copyable) {
    Array.from(document.querySelectorAll('pre code')).forEach(function (block) {
      var pre_block = block.parentNode;
      if (!pre_block.classList.contains('playpen')) {
        var buttons = pre_block.querySelector(".buttons");
        if (!buttons) {
          buttons = document.createElement('div');
          buttons.className = 'buttons';
          pre_block.insertBefore(buttons, pre_block.firstChild);
        }

        var clipButton = document.createElement('button');
        clipButton.className = 'fa fa-copy clip-button';
        clipButton.title = 'Copy to clipboard';
        clipButton.setAttribute('aria-label', clipButton.title);
        clipButton.innerHTML = '<i class=\"tooltiptext\"></i>';

        buttons.insertBefore(clipButton, buttons.firstChild);
      }
    });
  }

  // Process playpen code blocks
  Array.from(document.querySelectorAll(".playpen")).forEach(function (pre_block) {
    // Add play button
    var buttons = pre_block.querySelector(".buttons");
    if (!buttons) {
      buttons = document.createElement('div');
      buttons.className = 'buttons';
      pre_block.insertBefore(buttons, pre_block.firstChild);
    }

    var runCodeButton = document.createElement('button');
    runCodeButton.className = 'fa fa-play play-button';
    runCodeButton.hidden = true;
    runCodeButton.title = 'Run this code';
    runCodeButton.setAttribute('aria-label', runCodeButton.title);

    buttons.insertBefore(runCodeButton, buttons.firstChild);
    runCodeButton.addEventListener('click', function (e) {
      run_rust_code(pre_block);
    });

    if (window.playpen_copyable) {
      var copyCodeClipboardButton = document.createElement('button');
      copyCodeClipboardButton.className = 'fa fa-copy clip-button';
      copyCodeClipboardButton.innerHTML = '<i class="tooltiptext"></i>';
      copyCodeClipboardButton.title = 'Copy to clipboard';
      copyCodeClipboardButton.setAttribute('aria-label', copyCodeClipboardButton.title);

      buttons.insertBefore(copyCodeClipboardButton, buttons.firstChild);
    }

    let code_block = pre_block.querySelector("code");
    if (window.ace && code_block.classList.contains("editable")) {
      var undoChangesButton = document.createElement('button');
      undoChangesButton.className = 'fa fa-history reset-button';
      undoChangesButton.title = 'Undo changes';
      undoChangesButton.setAttribute('aria-label', undoChangesButton.title);

      buttons.insertBefore(undoChangesButton, buttons.firstChild);

      undoChangesButton.addEventListener('click', function () {
        let editor = window.ace.edit(code_block);
        editor.setValue(editor.originalCode);
        editor.clearSelection();
      });
    }
  });
})();

(function themes() {
  let stylesheets = {
    ayuHighlight: document.querySelector("[href$='ayu-highlight.css']"),
    tomorrowNight: document.querySelector("[href$='tomorrow-night.css']"),
    highlight: document.querySelector("[href$='highlight.css']"),
    solarizedLightHljs: document.querySelector("[href$='solarized-light-hljs.css']"),
    solarizedDarkHljs: document.querySelector("[href$='solarized-dark-hljs.css']"),
  };

  function set_theme(theme) {
    let ace_theme;

    if (theme === 'coal' || theme === 'navy') {
      stylesheets.ayuHighlight.disabled = true;
      stylesheets.tomorrowNight.disabled = false;
      stylesheets.highlight.disabled = true;
      stylesheets.solarizedDarkHljs.disabled = true;
      stylesheets.solarizedLightHljs.disabled = true;
      ace_theme = "ace/theme/tomorrow_night";
    } else if (theme === 'ayu') {
      stylesheets.ayuHighlight.disabled = false;
      stylesheets.tomorrowNight.disabled = true;
      stylesheets.highlight.disabled = true;
      stylesheets.solarizedDarkHljs.disabled = true;
      stylesheets.solarizedLightHljs.disabled = true;
      ace_theme = "ace/theme/tomorrow_night";
    }  else if (theme  === 'solarized-dark') {
      stylesheets.ayuHighlight.disabled = true;
      stylesheets.tomorrowNight.disabled = true;
      stylesheets.highlight.disabled = true;
      stylesheets.solarizedDarkHljs.disabled = false;
      stylesheets.solarizedLightHljs.disabled = true;
      ace_theme = "ace/theme/solarized_dark";
    } else if (theme  === 'solarized-light') {
      stylesheets.ayuHighlight.disabled = true;
      stylesheets.tomorrowNight.disabled = true;
      stylesheets.highlight.disabled = true;
      stylesheets.solarizedLightHljs.disabled = false;
      stylesheets.solarizedDarkHljs.disabled = true;
      ace_theme = "ace/theme/solarized_light";
    } else {
      stylesheets.ayuHighlight.disabled = true;
      stylesheets.tomorrowNight.disabled = true;
      stylesheets.highlight.disabled = false;
      stylesheets.solarizedDarkHljs.disabled = true;
      stylesheets.solarizedLightHljs.disabled = true;
      ace_theme = "ace/theme/dawn";
    }

    if (window.ace && window.editors) {
      window.editors.forEach(function (editor) {
        editor.setTheme(ace_theme);
      });
    }
  }

  set_theme(default_theme);

})();


(function sidebar() {
  var html = document.querySelector("html");
  var sidebar = document.getElementById("sidebar");
  var sidebarLinks = document.querySelectorAll('#sidebar a');
  var sidebarToggleButton = document.getElementById("sidebar-toggle");
  var sidebarResizeHandle = document.getElementById("sidebar-resize-handle");
  var firstContact = null;

  function showSidebar() {
    html.classList.remove('sidebar-hidden')
    html.classList.add('sidebar-visible');
    Array.from(sidebarLinks).forEach(function (link) {
      link.setAttribute('tabIndex', 0);
    });
    sidebarToggleButton.setAttribute('aria-expanded', true);
    sidebar.setAttribute('aria-hidden', false);
    try { localStorage.setItem('mdbook-sidebar', 'visible'); } catch (e) { }
  }


  var sidebarAnchorToggles = document.querySelectorAll('#sidebar a.toggle');

  function toggleSection(ev) {
    ev.currentTarget.parentElement.classList.toggle('expanded');
  }

  Array.from(sidebarAnchorToggles).forEach(function (el) {
    el.addEventListener('click', toggleSection);
  });

  function hideSidebar() {
    html.classList.remove('sidebar-visible')
    html.classList.add('sidebar-hidden');
    Array.from(sidebarLinks).forEach(function (link) {
      link.setAttribute('tabIndex', -1);
    });
    sidebarToggleButton.setAttribute('aria-expanded', false);
    sidebar.setAttribute('aria-hidden', true);
    try { localStorage.setItem('mdbook-sidebar', 'hidden'); } catch (e) { }
  }

  // Toggle sidebar
  sidebarToggleButton.addEventListener('click', function sidebarToggle() {
    if (html.classList.contains("sidebar-hidden")) {
      var current_width = parseInt(
        document.documentElement.style.getPropertyValue('--sidebar-width'), 10);
      if (current_width < 150) {
        document.documentElement.style.setProperty('--sidebar-width', '150px');
      }
      showSidebar();
    } else if (html.classList.contains("sidebar-visible")) {
      hideSidebar();
    } else {
      if (getComputedStyle(sidebar)['transform'] === 'none') {
        hideSidebar();
      } else {
        showSidebar();
      }
    }
  });

  sidebarResizeHandle.addEventListener('mousedown', initResize, false);

  function initResize(e) {
    window.addEventListener('mousemove', resize, false);
    window.addEventListener('mouseup', stopResize, false);
    html.classList.add('sidebar-resizing');
  }
  function resize(e) {
    var pos = (e.clientX - sidebar.offsetLeft);
    if (pos < 20) {
      hideSidebar();
    } else {
      if (html.classList.contains("sidebar-hidden")) {
        showSidebar();
      }
      pos = Math.min(pos, window.innerWidth - 100);
      document.documentElement.style.setProperty('--sidebar-width', pos + 'px');
    }
  }
  //on mouseup remove windows functions mousemove & mouseup
  function stopResize(e) {
    html.classList.remove('sidebar-resizing');
    window.removeEventListener('mousemove', resize, false);
    window.removeEventListener('mouseup', stopResize, false);
  }

  document.addEventListener('touchstart', function (e) {
    firstContact = {
      x: e.touches[0].clientX,
      time: Date.now()
    };
  }, { passive: true });

  document.addEventListener('touchmove', function (e) {
    if (!firstContact)
      return;

    var curX = e.touches[0].clientX;
    var xDiff = curX - firstContact.x,
      tDiff = Date.now() - firstContact.time;

    if (tDiff < 250 && Math.abs(xDiff) >= 150) {
      if (xDiff >= 0 && firstContact.x < Math.min(document.body.clientWidth * 0.25, 300))
        showSidebar();
      else if (xDiff < 0 && curX < 300)
        hideSidebar();

      firstContact = null;
    }
  }, { passive: true });

  // Scroll sidebar to current active section
  var activeSection = document.getElementById("sidebar").querySelector(".active");
  if (activeSection) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
    activeSection.scrollIntoView({ block: 'center' });
  }
})();

(function chapterNavigation() {
  document.addEventListener('keydown', function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) { return; }
    if (window.search && window.search.hasFocus()) { return; }

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        var nextButton = document.querySelector('.nav-chapters.next');
        if (nextButton) {
          window.location.href = nextButton.href;
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        var previousButton = document.querySelector('.nav-chapters.previous');
        if (previousButton) {
          window.location.href = previousButton.href;
        }
        break;
    }
  });
})();

(function clipboard() {
  var clipButtons = document.querySelectorAll('.clip-button');

  function hideTooltip(elem) {
    elem.firstChild.innerText = "";
    elem.className = 'fa fa-copy clip-button';
  }

  function showTooltip(elem, msg) {
    elem.firstChild.innerText = msg;
    elem.className = 'fa fa-copy tooltipped';
  }

  var clipboardSnippets = new ClipboardJS('.clip-button', {
    text: function (trigger) {
      hideTooltip(trigger);
      let playpen = trigger.closest("pre");
      return playpen_text(playpen);
    }
  });

  Array.from(clipButtons).forEach(function (clipButton) {
    clipButton.addEventListener('mouseout', function (e) {
      hideTooltip(e.currentTarget);
    });
  });

  clipboardSnippets.on('success', function (e) {
    e.clearSelection();
    showTooltip(e.trigger, "Copied!");
  });

  clipboardSnippets.on('error', function (e) {
    showTooltip(e.trigger, "Clipboard error!");
  });
})();

(function scrollToTop () {
  var menuTitle = document.querySelector('.menu-title');

  menuTitle.addEventListener('click', function () {
    document.scrollingElement.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

(function controllMenu() {
  var menu = document.getElementById('menu-bar');

  (function controllPosition() {
    var scrollTop = document.scrollingElement.scrollTop;
    var prevScrollTop = scrollTop;
    var minMenuY = -menu.clientHeight - 50;
    // When the script loads, the page can be at any scroll (e.g. if you reforesh it).
    menu.style.top = scrollTop + 'px';
    // Same as parseInt(menu.style.top.slice(0, -2), but faster
    var topCache = menu.style.top.slice(0, -2);
    menu.classList.remove('sticky');
    var stickyCache = false; // Same as menu.classList.contains('sticky'), but faster
    document.addEventListener('scroll', function () {
      scrollTop = Math.max(document.scrollingElement.scrollTop, 0);
      // `null` means that it doesn't need to be updated
      var nextSticky = null;
      var nextTop = null;
      var scrollDown = scrollTop > prevScrollTop;
      var menuPosAbsoluteY = topCache - scrollTop;
      if (scrollDown) {
        nextSticky = false;
        if (menuPosAbsoluteY > 0) {
          nextTop = prevScrollTop;
        }
      } else {
        if (menuPosAbsoluteY > 0) {
          nextSticky = true;
        } else if (menuPosAbsoluteY < minMenuY) {
          nextTop = prevScrollTop + minMenuY;
        }
      }
      if (nextSticky === true && stickyCache === false) {
        menu.classList.add('sticky');
        stickyCache = true;
      } else if (nextSticky === false && stickyCache === true) {
        menu.classList.remove('sticky');
        stickyCache = false;
      }
      if (nextTop !== null) {
        menu.style.top = nextTop + 'px';
        topCache = nextTop;
      }
      prevScrollTop = scrollTop;
    }, { passive: true });
  })();
  (function controllBorder() {
    menu.classList.remove('bordered');
    document.addEventListener('scroll', function () {
      if (menu.offsetTop === 0) {
        menu.classList.remove('bordered');
      } else {
        menu.classList.add('bordered');
      }
    }, { passive: true });
  })();
})();
