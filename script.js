var kana_parse = "あアa:いイi:うウu:えエe:おオo:かカka:きキki:くクku:けケke:こコko:さサsa:しシshi:すスsu:せセse:そソso:たタta:ちチchi:つツtsu:てテte:とトto:なナna:にニni:ぬヌnu:ねネne:のノno:はハha:ひヒhi:ふフfu:へヘhe:ほホho:まマma:みミmi:むムmu:めメme:もモmo:やヤya:ゆユyu:よヨyo:らラra:りリri:るルru:れレre:ろロro:わワwa:をヲwo:んンn".split(":");

var kana_romaji = {};
var romaji_kana = {};

var hiragana_list = [];
var katakana_list = [];

var unlearned = [];
var learning = {};
var learned = [];

var themes = {};

var failed = false;

var root_element = document.querySelector(':root');

function getRootValue(rkey) {
  var styles = getComputedStyle(root_element);
  return styles.getPropertyValue(rkey);
}

function setRootValue(rkey, rvalue) {
  root_element.style.setProperty(rkey, rvalue);
}

function playSound(sound_name) {
  var audio = new Audio('audio/' + sound_name + '.mp3');
  audio.volume = 0.8;
  audio.play();
}

function setTheme(theme_name) {
  if (theme_name == "" || !(Object.keys(themes).includes(theme_name))) {
    theme_name = Object.keys(themes)[0];
  }
  css_text = themes[theme_name];
  if (css_text !== undefined) {
    css_values = css_text.split(";")
    for (let i = 0; i < css_values.length; i++) {
      if (css_values[i] != "") {
        new_css = css_values[i].split(":");
        setRootValue(new_css[0], new_css[1]);
      }
    }
  }

  setCookie("theme", theme_name, 365);
  $("#themeList").val(theme_name);

  loadProgress();
  $("#question").text("");
  reset();
  loadingScreen();
}

function setEnglishFont(font_name) {
  if (font_name == "") {
    font_name = 'arial';
  }
  setRootValue("--english-font", font_name + ", sans-serif");
  setCookie("en_font", font_name, 365);
  $("#englishFontList").val(font_name);
}

function setEnglishFontSize(size_unknown) {
  var size = Math.round(size_unknown);
  if (size == 0) {
    size = 72;
  }
  setRootValue("--english-size", size + "px");
  setCookie("en_font_size", "" + size, 365);
  $("#englishSize").val(size);
}

function setJapaneseFont(font_name) {
  if (font_name == "") {
    font_name = 'arial';
  }
  setRootValue("--japanese-font", font_name + ", sans-serif");
  setCookie("jp_font", font_name, 365);
  $("#japaneseFontList").val(font_name);
}

function setJapaneseFontSize(size_unknown) {
  var size = Math.round(size_unknown);
  if (size == 0) {
    size = 144;
  }
  setRootValue("--japanese-size", size + "px");
  setCookie("jp_font_size", "" + size, 365);
  $("#japaneseSize").val(size);
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

var randomProperty = function (obj) {
    var keys = Object.keys(obj);
    return obj[keys[keys.length * Math.random() << 0]];
};

var randomKey = function (obj) {
    var keys = Object.keys(obj);
    return keys[keys.length * Math.random() << 0];
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function removeItem(array, value) {
  var index = array.indexOf(value);
  if (index > -1) {
    array.splice(index, 1);
  }
  return array;
}

function loadProgress() {
  var question = $("#question").text();

  for (let i = 1; i <= 10; i++) {
    if (learned.includes(question)) {
      $("#correct" + i).css("background-color", getRootValue("--learned-color"));
    } else if (question in learning && learning[question] >= i) {
      $("#correct" + i).css("background-color", getRootValue("--learning-color"));
    } else {
      $("#correct" + i).css("background-color", getRootValue("--base-color"));
    }
  }

  var width_percent = learned.length / Object.keys(kana_romaji).length * 100;

  $("#progress").css("width", width_percent + "%");
}

async function answer(number) {

  var question = $("#question").text();
  var guess = $("#answer" + number).text();

  if (romaji_kana[guess].indexOf(question) >= 0) {
    $("#answer" + number).css('transform', "translate(-50%,-50%) scale(1.1)");
    for (let i = 1; i <= 3; i++) {
      $("#answer" + i).prop('disabled', true);
      if (number != i) {
        $("#answer" + i).css("opacity", "0.2");
      }
    }

    if (!failed) {
      if (unlearned.includes(question)) {
        learning[question] = 1;
        unlearned = removeItem(unlearned, question);
      } else if (question in learning) {
        learning[question] = learning[question] + 1;
        if (learning[question] === 10) {
          delete learning[question];
          learned.push(question);
        }
      }

      if (learned.includes(question)) {
        $("#question").css("color", getRootValue("--learned-color"));
      } else if (question in learning) {
        $("#question").css("color", getRootValue("--learning-color"));
      } else {
        $("#question").css("color", getRootValue("--text-color"));
      }
    }

    playSound(guess);
    loadProgress();

    $("#question").css("transform", "translate(-50%,-50%) scale(1.1)");
    await sleep(250);
    $("#question").css("transform", "translate(-50%,-50%)");
    await sleep(750);
    reset();
  } else {
    failed = true;
    $("#answer" + number).css("opacity", "0.2");
    $("#answer" + number).prop('disabled', true);

    if (question in learning) {
      learning[question] = learning[question] - 1;

      if (learning[question] < 0) {
        learning[question] = 0;
      }
    } else if (learned.includes(question)) {
      learning[question] = 9;
      learned = removeItem(learned, question);
    } else {
      alert("oh no");
    }

    loadProgress();
  }

  setCookie("learned", learned.toString(), 30);
  setCookie("learning", JSON.stringify(learning), 30);
}

function reset() {
  failed = false;

  $("#question").css("color", getRootValue("--text-color"));
  $("#question").css("transform", "translate(-50%,-50%)");

  var new_question = unlearned[0];

  if (Object.keys(learning).length > 0 && Math.random() <= (0.2 * Object.keys(learning).length)) {
    new_question = randomKey(learning);
  }
  if (learned.length > 0 && Math.random() <= (learned.length * 0.25 / Object.keys(kana_romaji).length)) {
    new_question = learned[Math.floor(Math.random() * learned.length)];
  }
  while (new_question === $("#question").text() || new_question === undefined) {
    if (unlearned.length > 0 && Object.keys(learning).length < 5 && Math.random() <= 0.5) {
      new_question = unlearned[0];
    } else if (Object.keys(learning).length > 1){
      new_question = randomKey(learning);
    } else {
      new_question = learned[Math.floor(Math.random() * learned.length)];
    }
  }
  $("#question").text(new_question);
  let correct = randomInt(1, 3)
  let correct_answer = kana_romaji[new_question];

  if (unlearned.includes(new_question)) {
    correct = 2;
    for (let i = 1; i <= 3; i++) {
      $("#answer" + i).css("border-color", getRootValue("--border-color"));
      $("#answer" + i).css("color", getRootValue("--text-color"));
      $("#answer" + i).css("opacity", "1");
      $("#answer" + i).css('transform', "translate(-50%,-50%)");
      if (correct == i) {
        $("#answer" + i).css("background-color", getRootValue("--base-color"));
        $("#answer" + i).text(correct_answer);
        $("#answer" + i).prop('disabled', false);
      } else {
        $("#answer" + i).css("border-color", getRootValue("--base-color"));
        $("#answer" + i).css("color", getRootValue("--base-color"));
        $("#answer" + i).css("background-color", getRootValue("--base-color"));
        $("#answer" + i).prop('disabled', true);
      }
    }
  } else {
    chosen = [];
    learning_kana = Object.keys(learning);
    learning_romaji = [];
    for (let i = 0; i < learning_kana.length; i++) {
      learning_romaji[i] = kana_romaji[learning_kana[i]];
    }
    for (let i = 0; i < learned.length; i++) {
      learning_romaji.push(kana_romaji[learned[i]]);
    }
    learning_romaji = learning_romaji.concat(["a", "i", "u", "e", "o"]);
    possible_guesses = Array.from(new Set(learning_romaji));
    for (let i = 1; i <= 3; i++) {
      $("#answer" + i).css("border-color", getRootValue("--border-color"));
      $("#answer" + i).css("color", getRootValue("--text-color"));
      $("#answer" + i).css("opacity", "1");
      $("#answer" + i).css('transform', "translate(-50%,-50%)");
      $("#answer" + i).prop('disabled', false);
      if (correct == i) {
        $("#answer" + i).css("background-color", getRootValue("--base-color"));
        $("#answer" + i).text(correct_answer);
      } else {
        var new_answer = correct_answer;
        while (new_answer === correct_answer || chosen.includes(new_answer)) {
          new_answer = possible_guesses[Math.floor(Math.random() * possible_guesses.length)];
        }
        $("#answer" + i).css("background-color", getRootValue("--base-color"));
        $("#answer" + i).text(new_answer);
        chosen[i - 1] = new_answer;
      }
    }
  }

  loadProgress();
}

$(document).ready(function() {

  for (let i = 0; i < kana_parse.length; i++) {
    let parse = kana_parse[i];
    let hiragana = parse[0];
    let katakana = parse[1];
    let romaji = parse.substring(2, parse.length + 1);
    romaji_kana[romaji] = hiragana + "/" + katakana;
    kana_romaji[hiragana] = romaji;
    kana_romaji[katakana] = romaji;

    hiragana_list.push(hiragana);
    katakana_list.push(katakana);
  }

  for (let i = 0; i < hiragana_list.length; i++) {
    unlearned.push(hiragana_list[i]);
  }
  for (let i = 0; i < katakana_list.length; i++) {
    unlearned.push(katakana_list[i]);
  }

  for(let i = 1; i <= 10; i++) {
    var left = 28 + (4 * i);
    $('<div style="left: ' + left + '%;" id="correct' + i + '" class="unselectable correct-circle"></div>').appendTo(".main");
  }

  var saved_learned = getCookie("learned");
  if (saved_learned != "") {
    learned = saved_learned.split(",");
    for(var i = 0; i < learned.length; i++) {
      removeItem(unlearned, learned[i]);
    }
  }

  var saved_learning = getCookie("learning");
  if (saved_learning != "") {
    learning = JSON.parse(saved_learning);
    for(var i = 0; i < Object.keys(learning).length; i++) {
      removeItem(unlearned, Object.keys(learning)[i]);
    }
  }

  reset();

  $("#settings").click(function(){
     $('.hover_background').show();
  });
  $('.closeSettings').click(function(){
      $('.hover_background').hide();
  });
  document.getElementById("themeList").onchange = function() {
     setTheme(this.value);
     return false;
  };
  document.getElementById("englishFontList").onchange = function() {
     setEnglishFont(this.value);
     return false;
  };
  document.getElementById("englishSize").oninput = function() {
     setEnglishFontSize(this.value);
     return false;
  };
  document.getElementById("japaneseFontList").onchange = function() {
     setJapaneseFont(this.value);
     return false;
  };
  document.getElementById("japaneseSize").oninput = function() {
     setJapaneseFontSize(this.value);
     return false;
  };

  loadingScreen();
});

async function loadingScreen() {
  $("#loading").show();
  $("#loading").css("opacity", "0");
  await sleep(800);
  $("#loading").hide();
  $("#loading").css("opacity", "1");
}

$.get("themes.txt", function(text) {
  theme_parse = text.split("\n");
  for (let i = 0; i < theme_parse.length; i++) {
    var theme = theme_parse[i];
    if (theme_parse[i].includes("|")) {
      var pieces = theme.split("|");
      themes[pieces[0]] = pieces[1];
      $('<option value="' + pieces[0] + '">' + pieces[0] + '</option>').appendTo("#themeList");
    }
  }
  setTheme(getCookie("theme"));
  setEnglishFont(getCookie("en_font"));
  setEnglishFontSize(getCookie("en_font_size"));
  setJapaneseFont(getCookie("jp_font"));
  setJapaneseFontSize(getCookie("jp_font_size"));
});
