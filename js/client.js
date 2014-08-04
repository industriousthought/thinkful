(function() {

// Just to namespace our functions and avoid collisions
var _SU3 = _SU3 ? _SU3 : new Object();

// Does a get request
// url: the url to GET
// callback: the function to call on server response. The callback function takes a
// single arg, the response text.
_SU3.ajax = function(url, callback){
    var ajaxRequest = _SU3.getAjaxRequest(callback);
    ajaxRequest.open("GET", url, true);
    ajaxRequest.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    ajaxRequest.send(null); 
};

// Does a post request
// callback: the function to call on server response. The callback function takes a
// single arg, the response text.
// url: the url to post to
// data: the json obj to post
_SU3.customAjax = function(url, callback, data, verb) {
   var ajaxRequest = _SU3.getAjaxRequest(callback);
   ajaxRequest.open(verb, url, true);
   ajaxRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
   ajaxRequest.setRequestHeader("Connection", "close");
   ajaxRequest.send("data=" + encodeURIComponent(data));    
};

// Returns an AJAX request obj
_SU3.getAjaxRequest = function(callback) {

    var ajaxRequest;

    try {
        ajaxRequest = new XMLHttpRequest();
    } catch (e) {
        try { 
            ajaxRequest = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                ajaxRequest = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e){
                return null;
            }
        }
    }

    ajaxRequest.onreadystatechange = function() {
        if (ajaxRequest.readyState == 4) {      
           // Prob want to do some error or response checking, but for 
           // this example just pass the responseText to our callback function
           callback(ajaxRequest.responseText);
        }
    };


    return ajaxRequest;

}; 

var init = function() {
    _SU3.ajax('/list', function(responseText) {
	items = responseText.split('=&');
       
	    var changeListItem = function(responseText) {
		    if (responseText === 'true') {
			    anchor.text = newText; 
			    li.appendChild(anchor);
			    li.removeChild(textBox);
		    }
	    };

	       var makeTextBox = function(li, anchor) {
                    var textBox = document.createElement('input');
                    textBox.setAttribute("type","text");
                    textBox.setAttribute("value", anchor.text);
                    textBox.addEventListener('blur', function() { 
			    var newText = textBox.value;
			    var data = anchor.text + ',' + newText;
			    console.log(data);
			    if (newText != anchor.text) {
				    _SU3.customAjax('/', changeListItem.bind(this), data, 'PUT');
			    }
		    
		    }, null);
		    li.appendChild(textBox);
		    li.removeChild(anchor);
	       };
                    

       var makeListItem = function(item, i) {
	    var list = document.getElementById('list');
            var anchor = document.createElement('a');
            var li = document.createElement('li');

	    li.appendChild(document.createTextNode(i + '. '));
            anchor.appendChild(document.createTextNode(item));
            anchor.addEventListener('click', function(e) {
		    makeTextBox(li, anchor);
                
            }, false);
            li.appendChild(anchor);
            list.appendChild(li);
       };

       for (var i = 0; i < items.length - 1; i++) {
	       makeListItem(items[i], i);
       }
       
    });
        
 
};

window.addEventListener("load", init, false);
})();
