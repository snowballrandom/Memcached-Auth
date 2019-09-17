
var socket = io.connect('https://www.your-web-site.com', {rememberUpgrade:true, transports: ['websocket'],secure:true, rejectUnauthorized: false});
var intervalHandle;
var userName;
//this variable represents the total number of popups can be 
//displayed according to the viewport width
var total_popups = 0;
//arrays of popups ids
var popups = [];
var i;

var messages = {
    post: (action, url, data)=>{
        
        var dataString = {
            csrftoken : csrf_token_value,
            action: action,
            data: data
        };
        
        var response = new Promise(function(resolve, reject){
            $.ajax({
                method: "POST",
                async: true,
                url: url,
                data: dataString,
                dataType: 'json'
            }).done(resolve).fail(reject);
            
        });
        return response;
    },
    get_message_history: (conv_id)=>{
        
        var url = base_url+'index.php/user/message/io';
        var data = {
            conv_id: conv_id
        }
        var response = messages.post('get_message_history', url, data);
        
        response.then(
            function(obj){

              var x = document.getElementById(conv_id);
              $(x).find('.direct-chat-messages').empty();
              
              if(obj.length > 0){            
                
                for(var i=0; i<obj.length;i++){             
                  console.log(obj[i].error);  
                  messages._display_messages(obj[i], false);
                }
              }

            },
            function(jqXHR, textStatus, errorThrown){
                messages.error(jqXHR, textStatus, errorThrown);
            });        
    },
    get_more_message_history: ()=>{
        
    },
    send: (conv_id, id)=>{
        
      var messageBox = $('#'+ conv_id +' .box-footer .input-group [name="message"]');
      
      if(messageBox.val() !== ''){
      
        var messageText = messageBox.val();
      
        var url = base_url+'index.php/user/message/io';
        var data = {
            user_id: id,
            conv_id: conv_id,
            message:messageText
        };
        
        var response = messages.post('send', url, data);
        
        response.then(
                function(response){
                    console.log(response);
                    
                    for(i=0;i<response.length;i++){
                      if(response[i].error == false){
                        socket.emit('message', {message_data:response[i].message_data});
                      }
                    }
                    
                },
                function(jqXHR, textStatus, errorThrown){
                    messages.error(jqXHR, textStatus, errorThrown);
                }); 
                
        // Clear the input        
        messageBox.val('');
        
      };
      return false;
    },
    receive: ()=>{
        socket.on('response', function(data){      
            console.log(data);
            
            var el = document.getElementById(data.conv_id);
            // repop up the box if hidden
            if(!el || el.style.display == "none"){
              popup.register_popup(data.user_name, data.conv_id, data.display_name);
            }
            
            messages._display_messages(data, true);
            messages.sound();
        });
    },
    join: (room)=>{
      socket.emit('room', room);
    },
    new_message:(message, username)=>{
        // emit to io new message user_name
        // 
        // save message
        //messages.send()
        console.log(message, username);
    },
    sound: ()=>{
      // Play sound on message  
      var mp3Source = '<source src="/assets/sounds/drip.mp3" type="audio/mpeg">';
      var oggSource = '<source src="/assets/sounds/drip.ogg" type="audio/ogg">';
      var embedSource = '<embed hidden="true" autostart="true" loop="false" src="/assets/sounds/drip.mp3">';
      document.getElementById("sound").innerHTML='<audio autoplay="autoplay">' + mp3Source + oggSource + embedSource + '</audio>';
              
    },
    start: ()=>{
        var url = base_url+'index.php/user/message/io';        
        var response = messages.post('init', url);
        response.then(
                function(obj){
                    
                  if(obj !== false){                    
                    
                   if(obj[0].conv_id){
                    // Join message groups
                    for(i=0;i<obj[0].conv_id.length;i++){
                      var conv_id = obj[0].conv_id[i].coversation_id;
                      messages.join(conv_id);
                    }
                   }
                   
                   if(obj[0].username){
                    // Set username
                    userName = obj[0].username;
                    
                    // Add user
                    socket.emit('add-user', obj[0].username);
                   }
                   
                   if(obj[0].friends){
                    // Display friends
                    messages._display_friends(obj[0].friends);//friends();
                   }
                   
                  }
                  
                },
                function(jqXHR, textStatus, errorThrown){
                    messages.error(jqXHR, textStatus, errorThrown);
                });                  
    },    
    _display_messages: (data, append)=>{
        
      var x = $('#messagePopupBoxWrap #'+data.conv_id + ' .box-body .direct-chat-messages');
      if(data.error == true){
          var element = 'Start A Conversation';
      }else{
          
        if(userName !== data.user_name){
          var element = '<div id="'+data.message_id+'" class="direct-chat-msg">';
          element = element + '  <div class="direct-chat-info clearfix">';
          element = element + '    <span class="direct-chat-name pull-right">'+data.display_name+'</span>';
          element = element + '    <span class="direct-chat-timestamp pull-left">'+data.date+'</span>';
          element = element + '  </div>';
          element = element + '  <img class="direct-chat-img" src="'+data.photo+'" alt="Message User Image">';
          element = element + '  <div class="direct-chat-text">';
          element = element + data.message;
          element = element + '  </div>';
          element = element + '</div>';
        }else{
          var element = '<div id="'+data.message_id+'" class="direct-chat-msg right">';
          element = element + '  <div class="direct-chat-info clearfix">';
          element = element + '    <span class="direct-chat-name pull-right">'+data.display_name+'</span>';
          element = element + '    <span class="direct-chat-timestamp pull-left">'+data.date+'</span>';
          element = element + '  </div>';
          element = element + '  <img class="direct-chat-img" src="'+data.photo+'" alt="Message User Image">';
          element = element + '  <div class="direct-chat-text">';
          element = element + data.message;
          element = element + '  </div>';
          element = element + '</div>';                   
        }
      }  
          if(append !== true){
              $(x).prepend(element);
          }else{
              $(x).append(element);
          }
          
          
          $(x).animate({scrollTop: $(x)[0].scrollHeight}, 00);

      
    },
    _display_friends:(data)=>{
        
        console.log('Got Friends List');
        
        for(var i=0; i<data.length;i++){
            
          var html = '<a href="javascript:popup.register_popup(\''+data[i].user_name+'\',\''+data[i].conv_id+'\',\''+data[i].display_name+'\');">'
          +'<li class="direct-chat-msg friend-list"><img class="direct-chat-img" src="'+data[i].user_photo+'"><span class="friend-list-name">'+data[i].display_name+'</span></li>'
          +'</a>';
          $('#friendsList').append(html);
        }        
    },
    error: (jqXHR, textStatus, errorThrown)=>{
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
    }    
};

var popup = { 
    remove: (array, from, to) => {        
        var rest = array.slice( (to || from) + 1 || array.length);
        console.log(rest)
        array.length = from < 0 ? array.length + from : from;
        return array.push.apply(array, rest);
    },
    //this is used to close a popup
    close_popup: (id) => {
                
        for(var iii = 0; iii < popups.length; iii++){
            if(id == popups[iii]){
              popup.remove(popups, iii);
              document.getElementById(id).style.display = "none";
              popup.calculate_popups();  
              return;
            }
        }	
    },        
    display_popups: ()=>{
        // Displays the popups. Displays based on the maximum number of 
        // popups that can be displayed on the current viewport width
        var right = 235;
        var iii = 0;
        for(iii; iii < total_popups; iii++){
          if(popups[iii] != undefined){
            var element = document.getElementById(popups[iii]);
            element.style.right = right + "px";
            right = right + 320;
            element.style.display = "block";
          }
        }

        for(var jjj = iii; jjj < popups.length; jjj++){
          var element = document.getElementById(popups[jjj]);
          element.style.display = "none";
        }
    },        
    register_popup: (id, conv_id, name) => {
        
        //creates markup for a new popup. Adds the id to popups array.        
        for(var iii = 0; iii < popups.length; iii++){	
            
            //already registered. Bring it to front.
            if(conv_id == popups[iii]){
              popup.remove(popups, iii);
              popups.unshift(conv_id);
              popup.calculate_popups();
              return;
            }
        }
        
        // Add Message Box
        popup.popupbox(id, conv_id, name);
        
        // Get the messages
        messages.get_message_history(conv_id);
              
        popups.unshift(conv_id);
        popup.calculate_popups();
    },
    calculate_popups: () => {
        // calculate the total number of popups suitable and then 
        // populate the toatal_popups variable.
        var width = window.innerWidth;
        if(width < 540){
          total_popups = 0;
        }else{
          width = width - 200;
          //320 is width of a single popup box
          total_popups = parseInt(width/320);
        }
        popup.display_popups();
    },
    popupbox: (id, conv_id, name)=>{
var element = '<div id="'+ conv_id +'" class="popup-box box box-primary direct-chat direct-chat-primary">';

element = element + '    <div class="box-header with-border">';
element = element + '      <h3 class="box-title">'+ name +'</h3>';
element = element + '      <div class="box-tools pull-right">';
element = element + '        <span data-toggle="tooltip" title="" class="badge bg-light-blue" data-original-title="3 New Messages">3</span>';
element = element + '        <button type="button" class="btn btn-box-tool" data-widget="remove" onclick="javascript:popup.close_popup(\''+ conv_id +'\');"><i class="fa fa-times"></i></button>';
element = element + '      </div>';
element = element + '    </div>';

element = element + '    <div class="box-body">';

element = element + '      <div class="direct-chat-messages">';
        
element = element + '      </div>';

element = element + '    </div>';
element = element + '        <div class="box-footer">';

element = element + '            <div class="input-group">';
element = element + '              <input type="text" name="message" placeholder="Type Message ..." class="form-control">';
element = element + '                  <span class="input-group-btn">';
element = element + '                    <button onclick="messages.send(\''+ conv_id +'\', \''+ id +'\')" type="submit" class="btn btn-primary btn-flat">Send</button>';
element = element + '                  </span>';
element = element + '            </div>';

element = element + '        </div>';

element = element + '  </div>';

$('#messagePopupBoxWrap').append(element);

    }
}

window.addEventListener("resize", popup.calculate_popups);
window.addEventListener("load", popup.calculate_popups);

socket.on('connect', function(){
    console.log('connect');

    socket.emit('auth', {token:session_id});

    socket.on('is_logged_in', function(data){
      if(data == true){

        socket.on('response', function(data){
          console.log(data);
        });
        
        
        
        messages.receive();
        
      }else{
        console.log('Not logged in');  
      }
    });

});

var header = {
    mark_as_viewed:(id)=>{
        
    },
    get_unread: ()=>{
        // get unread messages
        var url = base_url+'index.php/user/message/io';        
        var response = messages.post('unread', url);
        response.then(
                function(obj){
                    console.log(obj);
                },
                function(jqXHR, textStatus, errorThrown){
                    messages.error(jqXHR, textStatus, errorThrown);
                });  
    },
    unread_html: (data)=>{
        
        for(i=0;i<data.length;i++){
            var element = '<li id="'+data[i].id+'">';
            element = element + '<a href="javascript:popup.register_popup(\''+data[i].user_name+'\',\''+data[i].conv_id+'\',\''+data[i].display_name+'\');">'
            element = element + '<div class="pull-left">';
            element = element + '<img src="'+data[i].img+'" class="img-circle" alt="User Image">';
            element = element + '</div>';
            element = element + '<h4>';
            element = element + data[i].display_name;
            element = element + '<small><i class="fa fa-clock"></i>'+data.human_time+'</small>';
            element = element + '</h4>';
            element = element + '<p>'+data[i].message+'</p>';
            element = element + '</a>';
            element = element + '</li>';
        }
    }
    
}
header.get_unread();

setTimeout(function(){
    messages.start()
},500)
setTimeout(function(){
    //messages.get(26);    
},600)
