(function () {
  // Variables
  var MAX_RECENT_CHAR_CNT = 50;
  var MAX_FAVORITE_CHAR_CNT = 50;
  var
    i,
    len,
    output =  document.getElementById('output'),
    copyButton = document.getElementById('copy'),
    tabs = document.querySelectorAll('.tab'),
    pane = document.querySelectorAll('.characters-pane'),
    buttons = document.querySelectorAll('.characters-pane button'),
    filter = document.getElementById('filter'),
    locale = getLocale(),
    i18n = {
      ko: {
        copy: '복사',
        copySucceed: '복사되었습니다.',
        copyFailed: 'Ctrl + C 를 눌러 복사하세요.',
        placeholder: 'ㄱ,ㄴ,ㄷ...로 검색',
        output: '출력결과',
        general: '일반기호',
        numeric: '숫자',
        math: '수학',
        currency: '통화',
        unit: '단위',
        circleBracket: '원,괄호',
        boxDrawing: '선',
        arrow: '화살표',
        greekLatin: '그리스,라틴어',
        korean: '한글',
        japanese: '일본어',
        emoji: '이모지',
        recently: '최근',
        favorite: '즐겨찾기',
      },
      en: {
        copy: 'Copy',
        copySucceed: 'Copied!',
        copyFailed: 'Press \'Ctrl + C\' to copying special character.',
        placeholder: 'Search by ㄱ,ㄴ,ㄷ...',
        output: 'Output result',
        general: 'General',
        numeric: 'Numeric',
        math: 'Math',
        currency: 'Currency',
        unit: 'Unit',
        circleBracket: 'Circle, Bracket',
        boxDrawing: 'Box drawing',
        arrow: 'Arrow',
        greekLatin: 'Greek, Latin',
        korean: 'Korean',
        japanese: 'Japanese',
        emoji: 'Emoji',
        recently: 'Recently',
        favorite: 'Favorite',
      },
    };

  // Attach events & Change word with i18n
  copy.addEventListener('click', function () {
    copyText(output.value, true);
  });

  filter.addEventListener('keyup', filterByInput);
  filter.setAttribute('placeholder', i18n[locale].placeholder);
  output.setAttribute('placeholder', i18n[locale].output);

  copyButton.textContent = i18n[locale].copy;

  for (i = 0, len = tabs.length; i < len; i++) {
    (function (i) {
      tabs[i].textContent = i18n[locale][tabs[i].getAttribute('data-type')];
      tabs[i].addEventListener('click', function () {
        for (var j = 0, len2 = tabs.length; j < len2; j++) {
          tabs[j].classList.remove('active');
        }

        tabs[i].classList.add('active');
        filterByTab(tabs[i].getAttribute('data-type'));
      });
    })(i);
  }

  for (i = 0, len = buttons.length; i < len; i++) {
    (function (i) {
      buttons[i].addEventListener('click', function () {
        var text = buttons[i].textContent.trim();

        copyText(text);
      });

      buttons[i].addEventListener('contextmenu', function (e) {
        e.preventDefault();
        var text = buttons[i].textContent.trim();

        saveFavCharacters(text);
      });
    })(i);
  }

  // If localStorage is defined, activate "Recently" menu.
  if (localStorage) {
    var recentlyTab = document.querySelector('.tab[data-type="recently"]');
    var favoriteTab = document.querySelector('.tab[data-type="favorite"]');

    recentlyTab.classList.remove('none');
    favoriteTab.classList.remove('none');

    tabs[0].classList.add('active');
    filterByTab(tabs[0].getAttribute('data-type'));
  } else {
    tabs[2].classList.add('active');
    filterByTab(tabs[2].getAttribute('data-type'));
  }

  // Declare functions
  function getLocale() {
    var language = navigator.languages && navigator.languages[0] || 'en';

    if (language.match(/^ko$/)) {
      return language;
    } else {
      return 'en';
    }
  }

  function copyText(character, copyOnly) {
    var textArea = document.createElement('textarea');

    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = 0;
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.value = character;

    document.body.appendChild(textArea);

    textArea.select();

    try {
      var successful = document.execCommand('copy');
    } catch (err) {
      prompt(i18n[locale].copyFailed, character);
    }

    if (!copyOnly) {
      output.value += character;

      if (localStorage) {
        saveUsedCharacters(character);
      }
    }

    document.body.removeChild(textArea);
  }

  function filterByInput(e) {
    var
      c = e.target.value,
      consonant = e.target.value.replace(/[^ㄱ-ㅎ]/g, '').slice(0, 1);

    pane.forEach(function (el) {
      el.classList.add('none');

      if (el.getAttribute('data-consonant') === consonant) {
        el.classList.remove('none');
      }
    });
  }

  function filterByTab(type) {
    pane.forEach(function (el) {
      el.classList.add('none');

      if (el.getAttribute('data-type') === type) {
        el.classList.remove('none');

        if (type === 'recently') {
          renderRecentlyCharacters();
        } else if (type === 'favorite') {
          renderFavoriteCharacters();
        }
      }
    });
  }

  function saveUsedCharacters(c) {
    var
      recentlyCharacters = Object.keys(localStorage).filter(function (key) { return key.indexOf('rec-') !== -1; }),
      charactersArr = [],
      overlapIndex = -1,
      exceedLength,
      propertyName;

    for (var i = 0, len = recentlyCharacters.length; i < len; i++) {
      charactersArr.push(localStorage.getItem('rec-' + i));

      if (localStorage.getItem('rec-' + i) === c) {
        overlapIndex = +i;
      }
    }

    if (overlapIndex !== -1) {
      charactersArr.splice(overlapIndex, 1);
    }

    charactersArr.push(c);

    exceedLength = charactersArr.length;

    if (exceedLength > MAX_RECENT_CHAR_CNT) {
      charactersArr.splice(0, exceedLength - i);
    }

    charactersArr.forEach(function (el, i) {
      localStorage.setItem('rec-' + i, el);
    });
  }

  function renderRecentlyCharacters() {
    var
      recentlyCharacters = Object.keys(localStorage).filter(function (key) { return key.indexOf('rec-') !== -1; }),
      recentlyPane = document.querySelector('.characters-pane[data-type="recently"]'),
      docFragment = document.createDocumentFragment(),
      pasteButtons;

    for (var i = 0, len = recentlyCharacters.length; i < len; i++) {
      var buttonElement = document.createElement('button');

      buttonElement.innerText = localStorage.getItem('rec-' + i) || '';
      buttonElement.addEventListener('click', function () {
        var text = buttonElement.textContent;

        copyText(text);
      });

      docFragment.insertBefore(buttonElement, docFragment.firstChild);
    }

    recentlyPane.innerHTML = null;
    recentlyPane.appendChild(docFragment.cloneNode(true));

    pasteButtons = recentlyPane.querySelectorAll('button');

    for (var i = 0, len = pasteButtons.length; i < len; i++) {
      (function (i) {
        pasteButtons[i].addEventListener('click', function () {
          var text = pasteButtons[i].textContent.trim();

          copyText(text);
        });
      })(i);
    }
  }

  function saveFavCharacters(c) {
    var
      favoriteCharacters = Object.keys(localStorage).filter(function (key) { return key.indexOf('fav-') !== -1; }),
      charactersArr = [],
      overlapIndex = -1,
      exceedLength,
      propertyName;

    for (var i = 0, len = favoriteCharacters.length; i < len; i++) {
      charactersArr.push(localStorage.getItem('fav-' + i));

      if (localStorage.getItem('fav-' + i) === c) {
        overlapIndex = +i;
      }
    }

    if (overlapIndex !== -1) {
      charactersArr.splice(overlapIndex, 1);
    }

    charactersArr.push(c);

    exceedLength = charactersArr.length;

    if (exceedLength > MAX_FAVORITE_CHAR_CNT) {
      charactersArr.splice(0, exceedLength - i);
    }

    charactersArr.forEach(function (el, i) {
      localStorage.setItem('fav-' + i, el);
    });
  }

  function renderFavoriteCharacters() {
    var
      favoriteCharacters = Object.keys(localStorage).filter(function (key) { return key.indexOf('fav-') !== -1; }),
      favoritePane = document.querySelector('.characters-pane[data-type="favorite"]'),
      docFragment = document.createDocumentFragment(),
      pasteButtons;

    if (favoriteCharacters.length > 0) {
      for (var i = 0, len = favoriteCharacters.length; i < len; i++) {
        var buttonElement = document.createElement('button');

        buttonElement.innerText = localStorage.getItem('fav-' + i) || '';
        buttonElement.addEventListener('click', function () {
          var text = buttonElement.textContent;

          copyText(text);
        });

        docFragment.insertBefore(buttonElement, docFragment.firstChild);
      }

      favoritePane.innerHTML = null;
      favoritePane.appendChild(docFragment.cloneNode(true));

      pasteButtons = favoritePane.querySelectorAll('button');

      for (var i = 0, len = pasteButtons.length; i < len; i++) {
        (function (i) {
          pasteButtons[i].addEventListener('click', function () {
            var text = pasteButtons[i].textContent.trim();

            copyText(text);
          });
        })(i);
      }
    } else {
      var textElement = document.createElement('div');
      textElement.innerText = 'To use, right-click on special characters';
      docFragment.insertBefore(textElement, docFragment.firstChild);

      favoritePane.innerHTML = null;
      favoritePane.appendChild(docFragment.cloneNode(true));
    }
  }
})();

