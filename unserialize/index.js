/**
 * unserialize
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
module.exports = unserialize

function unserialize(data){

  //if (error) return console.error('Something went Wrong!')

  var result = {};

  if(data !== undefined){

    var preg = data.replace(/(^|s:[0-9]+:)|(^|i:)|(^|b:)|(")|(;$)/g,'').split(';');

    var a = [];
    preg.forEach(function(value){
	a.push(value.split('|'));
    });

    var b = [];
    a.forEach(function(value){
       if(Array.isArray(value)){
	  Array.prototype.push.apply(b, value);
	}else{
	  b.push(value);
	}
    });

    var arr_A = [];
    var arr_B = [];
    b.forEach(function(value, k){
      if(k % 2 == 0){
        arr_A.push(value);
      }else{
        arr_B.push(value);
      }
    });


    if (arr_A == null) return {};

    for (var i = 0, l = arr_A.length; i < l; i++) {
      if (arr_B) {
        result[arr_A[i]] = arr_B[i];
      } else {
        result[arr_A[i][0]] = arr_A[i][1];
      }
    }

  }

  return result;

}
