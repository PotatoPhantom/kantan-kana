// TODO >>> Add audio when clicking on kana tables
// TODO >>> Add option to change max card limit and hide card progress
// TODO >>> Easter Eggs?
// I regret typing both of those by hand.

var kana_parse = "あアa:いイi:うウu:えエe:おオo:かカka:きキki:くクku:けケke:こコko:さサsa:しシshi:すスsu:せセse:そソso:たタta:ちチchi:つツtsu:てテte:とトto:なナna:にニni:ぬヌnu:ねネne:のノno:はハha:ひヒhi:ふフfu:へヘhe:ほホho:まマma:みミmi:むムmu:めメme:もモmo:やヤya:ゆユyu:よヨyo:らラra:りリri:るルru:れレre:ろロro:わワwa:をヲwo:んンn".split(":");

var kana_romaji = {};
var romaji_kana = {};
var voiced_kana = {"か": "が", "き": "ぎ", "く": "ぐ", "け": "げ", "こ": "ご", "さ": "ざ", "し": "じ", "す": "ず", "せ": "ぜ", "そ": "ぞ", "た": "だ", "ち": "ぢ", "つ": "づ", "て": "で", "と": "ど", "は": "ばぱ", "ひ": "びぴ", "ふ": "ぶぷ", "へ": "べぺ", "ほ": "ぼぽ", "カ": "ガ", "キ": "ギ", "ク": "グ", "ケ": "ゲ", "コ": "ゴ", "サ": "ザ", "シ": "ジ", "ス": "ズ", "セ": "ゼ", "ソ": "ゾ", "タ": "ダ", "チ": "ヂ", "ツ": "ヅ", "テ": "デ", "ト": "ド", "ハ": "バパ", "ヒ": "ビピ", "フ": "ブプ", "ヘ": "ベペ", "ホ": "ボポ"};

var hiragana_list = [];
var katakana_list = [];

var unlearned = [];
var learning_hiragana = {};
var learning_katakana = {};
var learned_hiragana = [];
var learned_katakana = [];

var themes = {};

var failed = false;
var hiragana_started = true;

var root_element = document.querySelector(':root');

var correct_required = 9;
var sound_volume = 0.8;
var delay = 1;

function getRootValue(rkey) {
  var styles = getComputedStyle(root_element);
  return styles.getPropertyValue(rkey);
}

function setRootValue(rkey, rvalue) {
  root_element.style.setProperty(rkey, rvalue);
}

function playSound(sound_name) {
  if (sound_volume > 0) {
    var audio = new Audio('audio/' + sound_name + '.mp3');
    audio.volume = sound_volume;
    audio.play();
  }
}

function hideTables() {
  $("#hiragana_table").hide();
  $("#hiragana_combo").hide();
  $("#katakana_table").hide();
  $("#katakana_combo").hide();
}

function showTables() {
  $("#hiragana_table").show();
  $("#hiragana_combo").show();
  $("#katakana_table").show();
  $("#katakana_combo").show();

  startClearCheck();
}

function startClearCheck() {
  if (learned_hiragana.includes('ひ') && learned_hiragana.includes('ら') && learned_hiragana.includes('か') && learned_hiragana.includes('な')) {
    $("#hiragana-start").text("ひらがな");
    $("#hiragana-start").css("color", getRootValue("--learning-color"));
  }
  if (learned_katakana.includes('カ') && learned_katakana.includes('タ') && learned_katakana.includes('ナ')) {
    $("#katakana-start").text("カタカナ");
    $("#katakana-start").css("color", getRootValue("--learning-color"));
  }
  if (learned_hiragana.length >= 46 && learned_katakana.length >= 46) {
    $("#title").css("color", getRootValue("--learned-color"));
  }
}

function onStart() {
  loadLearned();
  reset();
  $("#information").hide();
  $("#menu").hide();
  hideTables();
}

function startHiragana() {
  hiragana_started = true;
  unlearned = [];
  unlearned.push(...hiragana_list);
  onStart();
}

function startKatakana() {
  hiragana_started = false;
  unlearned = [];
  unlearned.push(...katakana_list);
  onStart();
}

function openInformation() {
  $("#information").show();
  $("#menu").hide();
}

async function setTheme(theme_name, not_first = true) {
  loadScreen();
  if (not_first) {
    await sleep(500);
  }
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
  startClearCheck();
  refreshTables();
  hideScreen();
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
  if (size == 0 || size > 12) {
    size = 10;
  }
  setRootValue("--english-size", size + "em");
  setCookie("en_font_size", "" + size, 365);
  $("#englishSize").val(size);
}

function setJapaneseFont(font_name) {
  if (font_name == "") {
    font_name = 'mini-wakuwaku';
  }
  setRootValue("--japanese-font", font_name + ", sans-serif");
  setCookie("jp_font", font_name, 365);
  $("#japaneseFontList").val(font_name);
}

function setJapaneseFontSize(size_unknown) {
  var size = Math.round(size_unknown);
  if (size == 0 || size > 24) {
    size = 20;
  }
  setRootValue("--japanese-size", size + "em");
  setCookie("jp_font_size", "" + size, 365);
  $("#japaneseSize").val(size);
}

function setReqCorrect(required_unknown) {
  var new_required = Math.round(required_unknown);
  if (new_required <= 1 || new_required > 10) {
    new_required = 9;
  }
  correct_required = new_required;
  $(".correct-circle").remove();
  genReqCircles();
  loadProgress();
  setCookie("required", "" + new_required, 365);
  $("#correctRequired").val(new_required);
}

function setVolume(volume_unknown) {
  var new_volume = parseFloat(volume_unknown);
  if (isNaN(new_volume) || new_volume > 1 || new_volume < 0) {
    new_volume = 0.8;
  }
  sound_volume = new_volume;
  setCookie("volume", "" + new_volume, 365);
  $("#volume").val(new_volume);
  $("#volumeText").text("Volume: " + Math.round(new_volume * 100) + "%");
}

function setDelay(delay_unknown) {
  var new_delay = parseFloat(delay_unknown);
  if (isNaN(new_delay) || new_delay > 1 || new_delay < 0) {
    new_delay = 1;
  }
  delay = new_delay;
  setCookie("delay", "" + new_delay, 365);
  $("#delay").val(new_delay);
  $("#delayText").text("Delay: " + new_delay + "s");
}

function refreshTables() {
  var kana_check = Object.keys(kana_romaji);
  for (let i = 0; i < kana_check.length; i++) {
    updateTable(kana_check[i]);
  }
}

function updateTable(kana_character) {
  var root_color = "--text-color";
  if (isLearned(kana_character)) {
    root_color = "--learned-color";
  } else if (kana_character in learning_hiragana || kana_character in learning_katakana) {
    root_color = "--learning-color";
  }
  $("span").filter(function() { return ($(this).text() === kana_character) }).css("color", getRootValue(root_color));
  if (Object.keys(voiced_kana).includes(kana_character)) {
    kana_check = voiced_kana[kana_character];
    for (let i = 0; i < kana_check.length; i++) {
      $("span").filter(function() { return ($(this).text() === kana_check.charAt(i)) }).css("color", getRootValue(root_color));
    }
  }
  else if (kana_character == 'や') {$("span:contains(ゃ)").css("color", getRootValue(root_color));}
  else if (kana_character == 'ゆ') {$("span:contains(ゅ)").css("color", getRootValue(root_color));}
  else if (kana_character == 'よ') {$("span:contains(ょ)").css("color", getRootValue(root_color));}
  else if (kana_character == 'ヤ') {$("span:contains(ャ)").css("color", getRootValue(root_color));}
  else if (kana_character == 'ユ') {$("span:contains(ュ)").css("color", getRootValue(root_color));}
  else if (kana_character == 'ヨ') {$("span:contains(ョ)").css("color", getRootValue(root_color));}
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

function getLearning(key) {
  if (hiragana_list.includes(key)) {return learning_hiragana[key];}
  else {return learning_katakana[key];}
}

function setLearning(key, value) {
  if (hiragana_list.includes(key)) {learning_hiragana[key] = value;}
  else {learning_katakana[key] = value;}
}

function removeLearning(key) {
  if (hiragana_list.includes(key)) {delete learning_hiragana[key];}
  else {delete learning_katakana[key];}
}

function addLearned(key) {
  if (hiragana_list.includes(key)) {learned_hiragana.push(key);}
  else {learned_katakana.push(key);}
}

function removeLearned(key) {
  if (hiragana_list.includes(key)) {learned_hiragana = removeItem(learned_hiragana, key);}
  else {learned_katakana = removeItem(learned_katakana, key);}
}

function isLearned(key) {
  if (learned_hiragana.includes(key) || learned_katakana.includes(key)) {return true;}
  return false;
}

function currentLearning() {
  if (hiragana_started) {return learning_hiragana}
  else {return learning_katakana}
}

function currentLearned() {
  if (hiragana_started) {return learned_hiragana}
  else {return learned_katakana}
}

function currentKana() {
  if (hiragana_started) {return hiragana_list}
  else {return katakana_list}
}

// I have absolutely no clue how to make any of this efficient but if it works fast enough then it works for me.

function loadProgress() {
  var question = $("#question").text();

  for (let i = 1; i <= correct_required; i++) {
    if (isLearned(question)) {
      $("#correct" + i).css("background-color", getRootValue("--learned-color"));
    } else if (getLearning(question) !== undefined && getLearning(question) >= i) {
      $("#correct" + i).css("background-color", getRootValue("--learning-color"));
    } else {
      $("#correct" + i).css("background-color", getRootValue("--base-color"));
    }
  }

  if (learned_hiragana.length > 46 || learned_katakana.length > 46) {
    learned_hiragana = Array.from(new Set(learned_hiragana));
    learned_katakana = Array.from(new Set(learned_katakana));
  }

  var hiragana_percent = learned_hiragana.length / Object.keys(hiragana_list).length * 100;
  var katakana_percent = learned_katakana.length / Object.keys(katakana_list).length * 100;

  if (hiragana_started) {
    $("#progress").css("width", hiragana_percent + "%");
  } else {
    $("#progress").css("width", katakana_percent + "%");
  }

  $(".romajih").css('opacity', (0.7 - hiragana_percent / 200) + "");
  $(".romajik").css('opacity', (0.7 - katakana_percent / 200) + "");
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
        setLearning(question, 1);
        unlearned = removeItem(unlearned, question);
      } else if (question in currentLearning()) {
        setLearning(question, getLearning(question) + 1);
        if (getLearning(question) >= correct_required) {
          removeLearning(question);
          addLearned(question);
        }
      }

      if (isLearned(question)) {
        $("#question").css("color", getRootValue("--learned-color"));
        updateTable(question);
      } else if (getLearning(question) !== undefined) {
        $("#question").css("color", getRootValue("--learning-color"));
        updateTable(question);
      } else {
        $("#question").css("color", getRootValue("--text-color"));
      }
    }

    playSound(guess);
    loadProgress();

    if (delay > 0) {
      $("#question").css("transform", "translate(-50%,-50%) scale(1.1)");
      await sleep(delay * 250);
      $("#question").css("transform", "translate(-50%,-50%)");
      await sleep(delay * 750);
    }
    reset();
  } else {
    failed = true;
    $("#answer" + number).css("opacity", "0.2");
    $("#answer" + number).prop('disabled', true);

    if (question in currentLearning()) {
      setLearning(question, getLearning(question) - 1);

      if (getLearning(question) < 0) {
        setLearning(question, 0);
      }
    } else if (isLearned(question)) {
      setLearning(question, correct_required - 1);
      removeLearned(question);
    }

    loadProgress();
  }

  setCookie("learned", learned_hiragana.concat(learned_katakana).toString(), 30);
  setCookie("learning", JSON.stringify(Object.assign({}, learning_hiragana, learning_katakana)), 30);
}

function reset() {
  failed = false;

  $("#question").css("color", getRootValue("--text-color"));
  $("#question").css("transform", "translate(-50%,-50%)");

  var new_question = unlearned[0];

  if (Object.keys(currentLearning()).length > 0 && Math.random() <= (0.2 * Object.keys(currentLearning()).length)) {
    new_question = randomKey(currentLearning());
  }
  if (currentLearned().length > 0 && Math.random() <= (currentLearned.length * 0.25 / Object.keys(currentKana()).length)) {
    new_question = currentLearned[Math.floor(Math.random() * currentLearned.length)];
  }
  while (new_question === $("#question").text() || new_question === undefined) {
    if (unlearned.length > 0 && Object.keys(currentLearning()).length < 5 && Math.random() <= 0.5) {
      new_question = unlearned[0];
    } else if (Object.keys(currentLearning()).length > 1){
      new_question = randomKey(currentLearning());
    } else if (currentLearned().length > 0){
      new_question = currentLearned()[Math.floor(Math.random() * currentLearned().length)];
    } else {
      break;
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
    learning_kana = Object.keys(currentLearning());
    learning_romaji = [];
    for (let i = 0; i < learning_kana.length; i++) {
      learning_romaji[i] = kana_romaji[learning_kana[i]];
    }
    for (let i = 0; i < currentLearned().length; i++) {
      learning_romaji.push(kana_romaji[currentLearned()[i]]);
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

function loadLearned() {
  var saved_learned = getCookie("learned");
  if (saved_learned != "") {
    var learned = saved_learned.split(",");
    for(var i = 0; i < learned.length; i++) {
      if (hiragana_list.includes(learned[i])) {learned_hiragana.push(learned[i])}
      else {learned_katakana.push(learned[i])}
    }
  }

  var saved_learning = getCookie("learning");
  if (saved_learning != "") {
    var learning = JSON.parse(saved_learning);
    var learning_keys = Object.keys(learning);
    for(var i = 0; i < learning_keys.length; i++) {
      if (hiragana_list.includes(learning_keys[i])) {learning_hiragana[learning_keys[i]] = learning[learning_keys[i]]}
      else {learning_katakana[learning_keys[i]] = learning[learning_keys[i]]}
    }
  }

  var learning_keys = Object.keys(currentLearning()).concat(currentLearned());
  for(var i = 0; i < learning_keys.length; i++) {
    unlearned = removeItem(unlearned, learning_keys[i]);
  }

  learned_hiragana = Array.from(new Set(learned_hiragana));
  learned_katakana = Array.from(new Set(learned_katakana));
  unlearned = Array.from(new Set(unlearned));
}

function genReqCircles() {
  for(let i = 1; i <= correct_required; i++) {
    var left = (50 - correct_required / 2 * 5 - 3) + (5 * i);
    $('<div style="left: ' + left + '%;" id="correct' + i + '" class="unselectable correct-circle"></div>').appendTo(".main");
  }
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

  loadLearned();

  genReqCircles();

  $("#settings").click(function(){
     $('.hover_background').show();
  });
  $('.closeSettings').click(function(){
      $('.hover_background').hide();
  });
  $("#arrow").click(function(){
     $('#information').hide();
     $('#menu').show();
     showTables();
  });
  $("#reset").click(function(){
     if (confirm("Would you like to reset your progress? 1/5") && confirm("Are you sure you want to reset your progress? 2/5") && confirm("All your progress so far will be erased! 3/5") && confirm("Your progress cannot be recovered! 4/5") && confirm("Pressing OK will finally delete all your progress... 5/5")) {
       loadScreen();
       learned_hiragana = [];
       learned_katakana = [];
       learning_hiragana = {};
       learning_katakana = {};
       setCookie("learned", "");
       setCookie("learning", "");
       loadLearned();
       refreshTables();
       loadProgress();
       startClearCheck();
       window.location.reload();
     }
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
  document.getElementById("correctRequired").onchange = function() {
     setReqCorrect(this.value);
     return false;
  };
  document.getElementById("volume").oninput = function() {
     setVolume(this.value);
     return false;
  };
  document.getElementById("delay").oninput = function() {
     setDelay(this.value);
     return false;
  };

  startClearCheck();
  for(let i = 3; i <= 10; i++) {
    $('<option value=' + i + '>' + i + '</option>').appendTo("#correctRequired");
  }
  setEnglishFont(getCookie("en_font"));
  setEnglishFontSize(getCookie("en_font_size"));
  setJapaneseFont(getCookie("jp_font"));
  setJapaneseFontSize(getCookie("jp_font_size"));
  setReqCorrect(getCookie("required"));
  setVolume(getCookie("volume"));
  setDelay(getCookie("delay"));
  refreshTables();
});

async function loadScreen() {
  $("#loading").show();
  $("#loading").css("opacity", "1");
}

async function hideScreen() {
  await sleep(50);
  $("#loading").css("opacity", "0");
  await sleep(450);
  $("#loading").hide();
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
  setTheme(getCookie("theme"), false);
});
