let socket = io();


// This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
var duration;



// This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
function onYouTubeIframeAPIReady() {

  player = new YT.Player('player', {
  height: '720',
  width: '1280',
  videoId: 'M7lc1UVf-VE',
  events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
  },
  playerVars: {
      controls: 0,
      disablekb: 1,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
      autoplay: 0
  }
  });

}

// The API will call this function when the video player is ready.
function onPlayerReady(event) {
  event.target.playVideo();
}


// The API calls this function when the player's state changes.
function onPlayerStateChange(event) {

  if (event.data = 1) {
      duration = player.getDuration()

      setInterval(function() {
          var currentTime = player.getCurrentTime()
          var marginLeft = -(((duration - currentTime) / duration) * 669) - 10
  
          //Timestamp of the video 
          document.getElementById("square").style.marginLeft = marginLeft.toString() + "px"
      
      }, 200)

  }

}

// Youtube Link -> Youtube Video ID
function YouTubeGetID(url) {
    
  var ID = '';
  url = url.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);

  if (url[2] !== undefined) {
  ID = url[2].split(/[^0-9a-z_\-]/i);
  ID = ID[0];
  }
  else {
  ID = url;
  }

  return ID;
}



//
var player_line = document.getElementById("line")
var line_rect = player_line.getBoundingClientRect();

//
player_line.addEventListener("click", function(event) {

    if(typeof duration == "undefined") {
        duration = player.getDuration()
    }

    var x = event.clientX - line_rect.left
    var left = 0
    var right = line_rect.right - line_rect.left

    var seekTime = (x / right) * duration

    if(event.clientX == line_rect.left) {
        seekTime = 0
    }

    socket.emit("playerEvent", {
        event: "seek",
        time: seekTime
    })

})


socket.on('playerEvent', function(event) {

  if (event == 'play') {
      player.playVideo()
  }
  else if (event == 'pause') {
      player.pauseVideo()
  }
  else if (event.event == 'seek') {
      player.seekTo(event.time, true)
  }
})

socket.on("videoEvent", function(event) {
  player.loadVideoById(event)
  document.getElementById("vid_id_input").value = ""
})

























function scrollToBottom() {
    let messages = document.querySelector('#messages').lastElementChild;
    messages.scrollIntoView();
}

socket.on('connect', function () {

    let searchQuery = window.location.search.substring(1);
    let params = JSON.parse('{"' + decodeURI(searchQuery).replace(/&/g, '","').replace(/\+/g, ' ').replace(/=/g,'":"') + '"}');
  
    socket.emit('join', params, function(err) {
      if(err){
        alert(err);
        window.location.href = '/';
      } else {
        console.log('No Error');
      }
    })

});
   
socket.on('disconnect', function () {
    console.log('Disconnected from server.');
});

socket.on('updateUsersList', function (users) {

    let ol = document.createElement('ol');
    users.forEach(function (user) {
        let li = document.createElement('li');
        li.innerHTML = user;
        ol.appendChild(li);
    });
    let usersList = document.querySelector('#users');
    usersList.innerHTML = "";
    usersList.appendChild(ol);

});

socket.on('newMessage', function (message) {

    const formattedTime = moment(message.createdAt).format('LT');
    const template = document.querySelector('#message-template').innerHTML;
    
    const html = Mustache.render(template, {
        from: message.from,
        text: message.text,
        createdAt: formattedTime
    });

    const div = document.createElement('div');
    div.innerHTML = html;

    document.querySelector('#messages').appendChild(div);
    scrollToBottom()

});


document.querySelector('#submit-btn').addEventListener('click', function(e) {
    e.preventDefault();
  
    socket.emit("createMessage", {
      text: document.querySelector('input[name="message"]').value
    }, function() {
      document.querySelector('input[name="message"]').value = '';
    })
})
















//When users click play pause search buttons
document.getElementById("play").addEventListener("click", function() {
  socket.emit("playerEvent", "play")
})
document.getElementById("pause").addEventListener("click", function() {
  socket.emit("playerEvent", "pause")
})

document.getElementById("search_btn").addEventListener("click", function() {
  let videoId = YouTubeGetID(document.getElementById("vid_id_input").value) 
  socket.emit("videoEvent", videoId)
})