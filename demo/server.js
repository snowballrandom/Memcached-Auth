var fs = require('fs');

var sessionKey = 'ci_session:';
var memcachedAuth = require('memcached-auth');

var clients = {};
var users = {};

var options = {
  key: fs.readFileSync('/etc/letsencrypt/live/your-web-site.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/your-web-site.com/fullchain.pem'),
  ca: fs.readFileSync('/etc/letsencrypt/live/your-web-site.com/chain.pem')
};

var origins = 'https://www.your-web-site.com:*';
var https = require('https').createServer(options,function(req,res){

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', origins);
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', '*');
    
});

var io = require('socket.io')(https);
https.listen(3000);

io.sockets.on('connection', function(socket){

  socket.on('auth', function(data){
      
      var session_id = sessionKey+data.token;
      memcachedAuth.is_logged_in(session_id).then( (response) => {

          if(response.is_logged_in){
              
              // user is logged in
              socket.emit('is_logged_in', true);
              
              messenger.addUser(socket); 
              
              // dynamic room
              socket.on('room', function(room){
                 socket.join(room);
                 console.log('joing room '+room);
              });
              
              socket.on('message', function(data){
                  messenger.receive(data.message_data);                 
              });

          }else{
              // Not logged in
              socket.emit('is_logged_in', false);
          }
      }).catch( (error) => {
          console.log(error);
      });
      
  });

   
});

var messenger = {
    socket: (socket)=>{
      return socket;  
    },
    subscribe: (room)=>{
        
    },
    unsubscribe: (room)=>{
       
    },
    send: (data)=>{
        
    },
    receive: (data)=>{
        console.log(data);
     
        io.sockets.in(data.conv_id).emit('response', data);
    },
    addUser: (socket)=>{
        socket.on('add-user', function(data){
            clients[data] = {
              "socket": socket.id
            };
            console.log('Adding User:' + data);
            console.log(clients);
        });          
    },
    private: (socket)=>{
        // Not working yet...
        socket.on('message', function(data){
            
            console.log("Sending: " + data + " to " + data.user_name);
            
            if (clients[data.user_name]){
              io.sockets.connected[clients[data.user_name].socket].emit("response", data);
            } else {
              console.log("User does not exist: " + data.user_name); 
            }
        });           
    },
    disconnect:()=>{
        //Removing the socket on disconnect
        socket.on('disconnect', function() {
         for(var name in clients) {
           if(clients[name].socket === socket.id) {
             delete clients[name];
             break;
           }
         }	
        });         
    }
}

