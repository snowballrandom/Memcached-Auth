/**
 * memcached-auth
 *
    Copyright (C) <2012-2019>  <Kyle Coots>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @author      Kyle Coots
 * @copyright	Copyright (c) 2012 - 2019, Kyle Coots
 * @license	https://github.com/snowballrandom/Memcached-Auth
 * @link	https://github.com/snowballrandom/Memcached-Auth
 * @since	Version 1.0.0
 */

var memcachedAuth = {
    
  memcachedOptions: () => {      
    return {
        //maxKeySize: 250, //the maximum key size allowed.
        //maxExpiration: 2592000, //the maximum expiration time of keys (in seconds).
        //maxValue: 1048576, //the maximum size of a value.
        //poolSize: 10, //the maximum size of the connection pool.
        //algorithm: md5, //the hashing algorithm used to generate the hashRing values.
        reconnect: 100,// the time between reconnection attempts (in milliseconds).
        timeout: 100, //the time after which Memcached sends a connection timeout (in milliseconds).
        retries: 1, //the number of socket allocation retries per request.
        failures: 1, //the number of failed-attempts to a server before it is regarded as 'dead'.
        retry: 100 //the time between a server failure and an attempt to set it up back in service.
        //remove: false, // if true, authorizes the automatic removal of dead servers from the pool.
        //failOverServers: undefined,// an array of server_locations to replace servers that fail and that are removed from the consistent hashing scheme.
        //keyCompression: true,// whether to use md5 as hashing scheme when keys exceed maxKeySize.
        //idle: 5000, //the idle timeout for the connections.
        //encoding: utf8
    };
  },
  memcachedServers: () => {
      return {
          '127.0.0.1:11211': 1
      };
  },
  decode: (data) => {                 
    // Filter Memcached Responses
    var decode = require('unserialize');
    return decode(data);
  },
  connect: ()=>{
    
    // Memcached
    var Memcached = require('memcached');
    var options = memcachedAuth.memcachedOptions();
    var servers = memcachedAuth.memcachedServers();

    return new Memcached(servers, options);
    
  },
  is_logged_in: (key) => {
        
    return new Promise((resolve, reject)=>{
      
      var conn = memcachedAuth.connect();
        
       conn.get(key, (err, data) => {
        
        if(!err){   
            
          var cData = memcachedAuth.decode(data);
        
          if(cData.is_logged_in !== 'undefined' && cData.is_logged_in == 1){
            console.log('Logged In');
            
            resolve({is_logged_in:true, data: cData, error: err});
          }else{
              console.log(cData.is_logged_in);
            console.log('Not Logged In');
            reject({is_logged_in:false, data: cData, error: err});    
          }
          
        }else{
          console.log('Not Logged In');
          reject({is_logged_in:false, data: cData, error: err});  
        }
        
       });
      
    });
    
  }
       
};


module.exports = memcachedAuth;
