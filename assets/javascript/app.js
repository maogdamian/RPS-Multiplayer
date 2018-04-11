  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyCU8aeh7IgJVGKUO4BHsnX1kyfQovqrL3c",
    authDomain: "rps-multiplayer-game-b2f3b.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-game-b2f3b.firebaseio.com",
    projectId: "rps-multiplayer-game-b2f3b",
    storageBucket: "rps-multiplayer-game-b2f3b.appspot.com",
    messagingSenderId: "473197718173"
  };

firebase.initializeApp(config);

var database = firebase.database();

var dbConnectedRef = database.ref('.info/connected');

var dbPlayerRef  = database.ref('/players');

var dbChatRef  = database.ref('/chat');

var con;

var userId;

var userNode;

var userName;

var opponentName;

var selection = [];

var userSelected = false;

dbPlayerRef.on("child_added", function(snapshot) {

  var userObject = snapshot.val();

  if (userObject.userId == userId) {

    var p = $('<p>');
    p.text('Player: '+ userObject.userName);

    var rockButton = $('<button>');
    rockButton.text('Rock');
    rockButton.attr('id','rock');

    var paperButton = $('<button>');
    paperButton.text('Paper');
    paperButton.attr('id','paper');

    var scissorsButton = $('<button>');
    scissorsButton.text('Scissors');
    scissorsButton.attr('id','scissors');

    $('#player1').attr("userId",userObject.userId);

    $('#player1').append(p,rockButton,'<br>',paperButton,'<br>',scissorsButton);

  }
  else {

    var p = $('<p>');
    p.text('Player: '+ userObject.userName);

    opponentName = userObject.userName;

    $('#player2').attr("userId",userObject.userId);

    $('#player2').append(p);

  }

});

$("#start").on("click", function() {

  userName = $("#userName").val().trim();

  $("#userName").val('');

  $("#gameStart").hide();

  dbConnectedRef.on("value", function(snapshot) {

    if (snapshot.val()) {

      userId = dbPlayerRef.push().key;

      con = dbPlayerRef.push({

        userName: userName,
        win:0,
        loss: 0,
        state:'ready',
        userId: userId

      });

      userNode = con.key;

      // Remove user from the connection list when they disconnect.
      con.onDisconnect().remove();
    
    }

  });

});

$("#player1").on("click","button",function() {

  if (userSelected == false) {

    userSelected = true;

    if ($(this).attr('id') == 'rock') {

      var dbRef = database.ref('/players' + '/'+userNode);

      dbRef.update({ state: 'rock'});
    }

    else if ($(this).attr('id') == 'paper') {

      var dbRef = database.ref('/players' + '/'+userNode);

      dbRef.update({ state: 'paper'});
    }

    else if ($(this).attr('id') == 'scissors') {

      var dbRef = database.ref('/players' + '/'+userNode);

      dbRef.update({ state: 'scissors'});
    }
    ($(this).addClass("selected"));

  }

});

dbPlayerRef.on("child_removed", function(snapshot) {

  //console.log(snapshot.val());

  var userRemoveObj = snapshot.val();

  $('div[userId='+ userRemoveObj.userId +']').html('');
  $('div[userId='+ userRemoveObj.userId +']').removeAttr('userId');

});

dbPlayerRef.on("child_changed", function(snapshot) {

  //console.log("child changed!");

  var userChanged = snapshot.val();

  selection.push({

    userId: userChanged.userId,
    state: userChanged.state

  });

  if (selection.length == 2) {

      var playerId_0 = selection[0].userId;
      var playerSelect_0 = selection[0].state;

      var playerId_1 = selection[1].userId;
      var playerSelect_1 = selection[1].state;

      var result = gameResult(playerSelect_0,playerSelect_1);

      if (result == 1) {

        //playerId_0 is winner

        $("#result").html('<p>' +userName + ' selected ' + playerSelect_0 + '</p>');
        $("#result").append('<p>' +opponentName + ' selected ' + playerSelect_1 + '</p>');
        $("#result").append('<p> Winner is ' +userName + '</p>');

      }

      else if (result == 2) {
        //playerId_1 is winner

        $("#result").html('<p>' +userName + ' selected ' + playerSelect_0 + '</p>');
        $("#result").append('<p>' +opponentName + ' selected ' + playerSelect_1 + '</p>');
        $("#result").append('<p> Winner is ' +opponentName + '</p>');

      }
      else {
        //draw
        $("#result").html('<p>' +userName + ' selected ' + playerSelect_0 + '</p>');
        $("#result").append('<p>' +opponentName + ' selected ' + playerSelect_1 + '</p>');
        $("#result").append('<p> Game is draw </p>');

      }

      setTimeout(initGame,5000);

  }

});

function gameResult(player1, player2) {

  if (((player1 == 'rock') && (player2 == 'scissors')) || ((player1 == 'paper') && (player2 == 'rock')) || 
    ((player1 == 'scissors') && (player2 == 'paper'))) {
    return 1;
  }

  else if (((player2 == 'rock') && (player1 == 'scissors')) || ((player2 == 'paper') && (player1 == 'rock')) || 
    ((player2 == 'scissors') && (player1 == 'paper'))) {
    return 2;
  }
  else {
    return 3;
  }

}

$("#send").on("click", function() {

  var msg = $('#chatMsg').val().trim();

  $('#chatMsg').val('');

  if (msg != '') {

    var con = dbChatRef.push({

      message: userName + ': ' + msg,

    });

    con.onDisconnect().remove();

  }

});

dbChatRef.on("child_added", function(snapshot) {

  var message = snapshot.val().message;

  $("#chatArea").append('<p>' + message + '</p>');

});

dbChatRef.on("child_removed", function(snapshot) {

  dbChatRef.remove();

  $("#chatArea").html('');

  initGame();

});



function initGame() {

  userSelected = false;
  $("#result").html('');

  selection = [];

  $("#player1").find("button").removeClass("selected");


}

dbPlayerRef.on("value", function(snapshot) {

   var players = snapshot.val();

   var playersArr;

   if (players != null) {


        // Getting an array of each key In the snapshot object
        playersArr = Object.keys(players);


      if (playersArr.length == 2){

        $("#gameStart").hide();


      }
      else if ((playersArr.length != 2 ) && (userName == '')) {

        $("#gameStart").show();



      }



   }

});