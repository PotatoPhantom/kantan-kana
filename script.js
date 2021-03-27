var kana_parse = "あアa:いイi:うウu:えエe:おオo:かカka:きキki:くクku:けケke:こコko:さサsa:しシshi:すスsu:せセse:そソso:たタta:ちチchi:つツtsu:てテte:とトto:なナna:にニni:ぬヌnu:ねネne:のノno:はハha:ひヒhi:ふフfu:へヘhe:ほホho:まマma:みミmi:むムmu:めメme:もモmo:やヤya:ゆユyu:よヨyo:らラra:りリri:るルru:れレre:ろロro:わワwa:をヲwo:んンn".split(":");

var kana_romaji = {};
var romaji_kana = {};

var hiragana_list = [];
var katakana_list = [];

var unlearned = [];
var learning = {};
var learned = [];

var failed = false;

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
      $("#correct" + i).css("background-color", "#009991");
    } else if (question in learning && learning[question] >= i) {
      $("#correct" + i).css("background-color", "#f4c430");
    } else {
      $("#correct" + i).css("background-color", "#6544e9");
    }
  }

  var width_percent = learned.length / Object.keys(romaji_kana).length * 100;

  $("#progress").css("width", width_percent + "%");
}

async function answer(number) {

  var question = $("#question").text();
  var guess = $("#answer" + number).text();

  if (romaji_kana[guess].indexOf(question) >= 0) {
    $("#answer" + number).css("background-color", "darkgreen");
    for (let i = 1; i <= 3; i++) {
      $("#answer" + i).prop('disabled', true);
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
        $("#question").css("color", "#009991");
      } else if (question in learning) {
        $("#question").css("color", "#f4c430");
      } else {
        $("#question").css("color", "white");
      }
    }
    $("#question").css("transform", "translate(-50%,-50%) scale(1.1)");

    loadProgress();

    await sleep(1000);
    reset();
  } else {
    failed = true;
    $("#answer" + number).css("background-color", "darkred");

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
}

function reset() {
  failed = false;

  $("#question").css("color", "white");
  $("#question").css("transform", "translate(-50%,-50%)");

  var new_question = unlearned[0];
  if (Math.random() <= (0.2 * Object.keys(learning).length)) {
    new_question = randomKey(learning);
  }
  if (learned.length > 0 && Math.random() <= (learned.length * 0.5 / Object.keys(kana_romaji).length)) {
    new_question = learned[Math.floor(Math.random() * learned.length)];
  }
  while (new_question === $("#question").text()) {
    if (Object.keys(learning).length < 5 && Math.random() <= 0.5) {
      new_question = unlearned[0];
    } else {
      new_question = randomKey(learning);
    }
  }
  $("#question").text(new_question);
  let correct = randomInt(1, 3)
  let correct_answer = kana_romaji[new_question];

  if (unlearned.includes(new_question)) {
    correct = 2;
    for (let i = 1; i <= 3; i++) {
      $("#answer" + i).css("border-color", "black");
      $("#answer" + i).css("color", "white");
      if (correct == i) {
        $("#answer" + i).css("background-color", "#6544e9");
        $("#answer" + i).text(correct_answer);
        $("#answer" + i).prop('disabled', false);
      } else {
        $("#answer" + i).css("border-color", "#6544e9");
        $("#answer" + i).css("color", "#6544e9");
        $("#answer" + i).css("background-color", "#6544e9");
        $("#answer" + i).prop('disabled', true);
      }
    }
  } else {
    chosen = [];
    for (let i = 1; i <= 3; i++) {
      $("#answer" + i).css("border-color", "black");
      $("#answer" + i).css("color", "white");
      $("#answer" + i).prop('disabled', false);
      if (correct == i) {
        $("#answer" + i).css("background-color", "#6544e9");
        $("#answer" + i).text(correct_answer);
      } else {
        var new_answer = kana_romaji[randomKey(learning)];
        while (new_answer === correct_answer || chosen.includes(new_answer)) {
          if (Math.random() <= 0.5) {
            new_answer = kana_romaji[randomKey(learning)];
          } else if (learned.length > 0 && Math.random() <= (learned.length * 0.5 / Object.keys(kana_romaji).length)) {
            new_question = learned[Math.floor(Math.random() * learned.length)];
          } else {
            new_answer = randomProperty(kana_romaji);
          }
        }
        $("#answer" + i).css("background-color", "#6544e9");
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

  for(var i = 1; i <= 10; i++) {
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

  reset();
});
