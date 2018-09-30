/*
 * Envjs core-env.1.2.35
 * Pure JavaScript Browser Environment
 * By John Resig <http://ejohn.org/> and the Envjs Team
 * Copyright 2008-2010 John Resig, under the MIT License
 */

var Envjs = function(){
    var i,
        name,
        override = function(){
            for(i=0;i<arguments.length;i++){
                for ( name in arguments[i] ) {
                    var g = arguments[i].__lookupGetter__(name),
                        s = arguments[i].__lookupSetter__(name);
                    if ( g || s ) {
                        if ( g ) { Envjs.__defineGetter__(name, g); }
                        if ( s ) { Envjs.__defineSetter__(name, s); }
                    } else {
                        Envjs[name] = arguments[i][name];
                    }
                }
            }
        };
    if(arguments.length === 1 && typeof(arguments[0]) == 'string'){
        window.location = arguments[0];
    }else if (arguments.length === 1 && typeof(arguments[0]) == "object"){
        override(arguments[0]);
    }else if(arguments.length === 2 && typeof(arguments[0]) == 'string'){
        override(arguments[1]);
        window.location = arguments[0];
    }
    return;
},
__this__ = this;

//eg "Mozilla"
Envjs.appCodeName  = "Envjs";

//eg "Gecko/20070309 Firefox/2.0.0.3"
Envjs.appName      = "Netscape";

Envjs.version = "1.6";//?
Envjs.revision = '';




/*
 * Envjs core-env.1.2.35 
 * Pure JavaScript Browser Environment
 * By John Resig <http://ejohn.org/> and the Envjs Team
 * Copyright 2008-2010 John Resig, under the MIT License
 */

//CLOSURE_START
(function(){





/**
 * @author john resig
 */
// Helper method for extending one object with another.
function __extend__(a,b) {
    for ( var i in b ) {
        var g = b.__lookupGetter__(i), s = b.__lookupSetter__(i);
        if ( g || s ) {
            if ( g ) { a.__defineGetter__(i, g); }
            if ( s ) { a.__defineSetter__(i, s); }
        } else {
            a[i] = b[i];
        }
    } return a;
}

/**
 * @author ariel flesler
 *    http://flesler.blogspot.com/2008/11/fast-trim-function-for-javascript.html
 * @param {Object} str
 */
function __trim__( str ){
    return (str || "").replace( /^\s+|\s+$/g, "" );
}


/**
 * Writes message to system out
 * @param {String} message
 */
Envjs.log = function(message){};

/**
 * Constants providing enumerated levels for logging in modules
 */
Envjs.DEBUG = 1;
Envjs.INFO = 2;
Envjs.WARN = 3;
Envjs.ERROR = 3;
Envjs.NONE = 3;

/**
 * Writes error info out to console
 * @param {Error} e
 */
Envjs.lineSource = function(e){};

    
/**
 * TODO: used in ./event/eventtarget.js
 * @param {Object} event
 */
Envjs.defaultEventBehaviors = {
	'submit': function(event) {
        var target = event.target,
			serialized,
		    method,
		    action;
        while (target && target.nodeName !== 'FORM') {
            target = target.parentNode;
        }
        if (target && target.nodeName === 'FORM') {
            serialized = Envjs.serializeForm(target);
			//console.log('serialized %s', serialized);
		    method = target.method?target.method.toUpperCase():"GET";
			
		    action = Envjs.uri(
		        target.action !== ""?target.action:target.ownerDocument.baseURI,
		        target.ownerDocument.baseURI
		    );
			if(method=='GET' && !action.match(/^file:/)){
				action = action + "?" + serialized;
			}
			//console.log('replacing document with form submission %s', action);
			target.ownerDocument.location.replace(
				action, method, serialized
			);
        }
    },
    
    'click': function(event) {
		//console.log("handling default behavior for click %s", event.target);
        var target = event.target,
			url,
			form,
			inputs;
        while (target && target.nodeName !== 'A' && target.nodeName !== 'INPUT') {
            target = target.parentNode;
        }
        if (target && target.nodeName === 'A') {
			//console.log('target is a link');
            if(target.href && !target.href.match(/^#/)){
			    url = Envjs.uri(target.href, target.ownerDocument.baseURI);
				target.ownerDocument.location.replace(url);
            }
        }else if (target && target.nodeName === 'INPUT') {
            if(target.type.toLowerCase() === 'submit'){
				if(!target.value){
					target.value = 'submit';
				}
				//console.log('submit click %s %s', target.name, target.value);
				form = target.parentNode;
			    while (form && form.nodeName !== 'FORM' ) {
		            form = form.parentNode;
		        }
				if(form && form.nodeName === 'FORM'){
					//disable other submit buttons before serializing
					inputs = form.getElementsByTagName('input');
					for(var i=0;i<inputs.length;i++){
						if(inputs[i].type == 'submit' && inputs[i]!=target){
							//console.log('disabling the non-relevant submit button %s', inputs[i].value);
							inputs[i].disabled = true;
							inputs[i].value = null;
						}
					}
					form.submit();
				}
            }
        }
    }
};

Envjs.exchangeHTMLDocument = function(doc, text, url, frame) {
    var html, head, title, body, 
		event, 
		frame = doc.__ownerFrame__, 
		i;
    try {
        doc.baseURI = url;
        //console.log('parsing document for window exchange %s', url); 
        HTMLParser.parseDocument(text, doc);
        //console.log('finsihed parsing document for window exchange %s', url); 
        Envjs.wait();
        /*console.log('finished wait after parse/exchange %s...( frame ? %s )', 
            doc.baseURI, 
            top.document.baseURI
        );*/
		//if this document is inside a frame make sure to trigger
		//a new load event on the frame
        if(frame){
            event = doc.createEvent('HTMLEvents');
            event.initEvent('load', false, false);
            frame.dispatchEvent( event, false );
        }
    } catch (e) {
        console.log('parsererror %s', e);
        try {
            console.log('document \n %s', doc.documentElement.outerHTML);
        } catch (e) {
            // swallow
        }
        doc = new HTMLDocument(new DOMImplementation(), doc.ownerWindow);
        html =    doc.createElement('html');
        head =    doc.createElement('head');
        title =   doc.createElement('title');
        body =    doc.createElement('body');
        title.appendChild(doc.createTextNode('Error'));
        body.appendChild(doc.createTextNode('' + e));
        head.appendChild(title);
        html.appendChild(head);
        html.appendChild(body);
        doc.appendChild(html);
        //console.log('default error document \n %s', doc.documentElement.outerHTML);

        //DOMContentLoaded event
        if (doc.createEvent) {
            event = doc.createEvent('Event');
            event.initEvent('DOMContentLoaded', false, false);
            doc.dispatchEvent( event, false );

            event = doc.createEvent('HTMLEvents');
            event.initEvent('load', false, false);
            doc.dispatchEvent( event, false );
        }

        //finally fire the window.onload event
        //TODO: this belongs in window.js which is a event
        //      event handler for DOMContentLoaded on document

        try {
            if (doc === window.document) {
                console.log('triggering window.load');
                event = doc.createEvent('HTMLEvents');
                event.initEvent('load', false, false);
                window.dispatchEvent( event, false );
            }
        } catch (e) {
            //console.log('window load event failed %s', e);
            //swallow
        }
    };  /* closes return {... */
};

/**
 * describes which script src values will trigger Envjs to load
 * the script like a browser would
 */
Envjs.scriptTypes = {
	"": false, //anonymous/inline
    "text/javascript"   :false,
    "text/envjs"        :true
};

/**
 * will be called when loading a script throws an error
 * @param {Object} script
 * @param {Object} e
 */
Envjs.onScriptLoadError = function(script, e){
    console.log('error loading script %s %s', script, e);
};

/**
 * load and execute script tag text content
 * @param {Object} script
 */
Envjs.loadInlineScript = function(script){
    if(script.ownerDocument.ownerWindow){	
		//console.log('evaulating inline in script.ownerDocument.ownerWindow %s', 
		//	script.ownerDocument.ownerWindow);
        Envjs.eval(
            script.ownerDocument.ownerWindow,
            script.text,
            'eval('+script.text.substring(0,16)+'...):'+new Date().getTime()
        );
    }else{
		//console.log('evaulating inline in global %s',  __this__);
        Envjs.eval(
            __this__,
            script.text,
            'eval('+script.text.substring(0,16)+'...):'+new Date().getTime()
        );
    }
    //console.log('evaluated at scope %s \n%s',
    //    script.ownerDocument.ownerWindow.guid, script.text);
};

/**
 * Should evaluate script in some context
 * @param {Object} context
 * @param {Object} source
 * @param {Object} name
 */
Envjs.eval = function(context, source, name){};


/**
 * Executes a script tag
 * @param {Object} script
 * @param {Object} parser
 */
Envjs.loadLocalScript = function(script){
    //console.log("loading script type %s \n source %s", script.type, script.src||script.text.substring(0,32));
    var types,
        src,
        i,
        base,
        filename,
        xhr;

    if(script.type){
        types = script.type.split(";");
        for(i=0;i<types.length;i++){
            if(Envjs.scriptTypes[types[i].toLowerCase()]){
                //ok this script type is allowed
                break;
            }
            if(i+1 == types.length){
                //console.log('wont load script type %s', script.type);
                return false;
            }
        }
    }else if(!Envjs.scriptTypes['']){	
        //console.log('wont load anonymous script type ""');
        return false;
    }

    try{
        //console.log('handling inline scripts %s %s', script.src, Envjs.scriptTypes[""] );
        if(!script.src.length ){
			if(Envjs.scriptTypes[""]){
            	Envjs.loadInlineScript(script);
	            return true;
			}else{
				return false;
			}
        }
    }catch(e){
        console.log("Error loading script. %s", e);
        Envjs.onScriptLoadError(script, e);
        return false;
    }


    //console.log("loading allowed external script %s", script.src);

    //lets you register a function to execute
    //before the script is loaded
    if(Envjs.beforeScriptLoad){
        for(src in Envjs.beforeScriptLoad){
            if(script.src.match(src)){
                Envjs.beforeScriptLoad[src](script);
            }
        }
    }
    base = "" + script.ownerDocument.location;
    //filename = Envjs.uri(script.src.match(/([^\?#]*)/)[1], base );
    //console.log('loading script from base %s', base);
    filename = Envjs.uri(script.src, base);
    try {
        xhr = new XMLHttpRequest();
        xhr.open("GET", filename, false/*syncronous*/);
        //console.log("loading external script %s", filename);
        xhr.onreadystatechange = function(){
            //console.log("readyState %s", xhr.readyState);
            if(xhr.readyState === 4){
                Envjs.eval(
                    script.ownerDocument.ownerWindow,
                    xhr.responseText,
                    filename
                );
            }
        };
        xhr.send(null, false);
    } catch(e) {
        console.log("could not load script %s \n %s", filename, e );
        Envjs.onScriptLoadError(script, e);
        return false;
    }
    //lets you register a function to execute
    //after the script is loaded
    if(Envjs.afterScriptLoad){
        for(src in Envjs.afterScriptLoad){
            if(script.src.match(src)){
                Envjs.afterScriptLoad[src](script);
            }
        }
    }
    return true;
};


/**
 * An 'image' was requested by the document.
 *
 * - During inital parse of a <link>
 * - Via an innerHTML parse of a <link>
 * - A modificiation of the 'src' attribute of an Image/HTMLImageElement
 *
 * NOTE: this is optional API.  If this doesn't exist then the default
 * 'loaded' event occurs.
 *
 * @param node {Object} the <img> node
 * @param node the src value
 * @return 'true' to indicate the 'load' succeed, false otherwise
 */
Envjs.loadImage = function(node, src) {
    return true;
};


/**
 * A 'link'  was requested by the document.  Typically this occurs when:
 * - During inital parse of a <link>
 * - Via an innerHTML parse of a <link>
 * - A modificiation of the 'href' attribute on a <link> node in the tree
 *
 * @param node {Object} is the link node in question
 * @param href {String} is the href.
 *
 * Return 'true' to indicate that the 'load' was successful, or false
 * otherwise.  The appropriate event is then triggered.
 *
 * NOTE: this is optional API.  If this doesn't exist then the default
 *   'loaded' event occurs
 */
Envjs.loadLink = function(node, href) {
    return true;
};

(function(){


/*
 *  cookie handling
 *  Private internal helper class used to save/retreive cookies
 */

/**
 * Specifies the location of the cookie file
 */
Envjs.cookieFile = function(){
    return 'file://'+Envjs.homedir+'/.cookies';
};

/**
 * saves cookies to a local file
 * @param {Object} htmldoc
 */
Envjs.saveCookies = function(){
    var cookiejson = JSON.stringify(Envjs.cookies.persistent,null,'\t');
    //console.log('persisting cookies %s', cookiejson);
    Envjs.writeToFile(cookiejson, Envjs.cookieFile());
};

/**
 * loads cookies from a local file
 * @param {Object} htmldoc
 */
Envjs.loadCookies = function(){
    var cookiejson,
        js;
    try{
        cookiejson = Envjs.readFromFile(Envjs.cookieFile())
        js = JSON.parse(cookiejson, null, '\t');
    }catch(e){
        //console.log('failed to load cookies %s', e);
        js = {};
    }
    return js;
};

Envjs.cookies = {
    persistent:{
        //domain - key on domain name {
            //path - key on path {
                //name - key on name {
                     //value : cookie value
                     //other cookie properties
                //}
            //}
        //}
        //expire - provides a timestamp for expiring the cookie
        //cookie - the cookie!
    },
    temporary:{//transient is a reserved word :(
        //like above
    }
};

var __cookies__;

//HTMLDocument cookie
Envjs.setCookie = function(url, cookie){
    var i,
        index,
        name,
        value,
        properties = {},
        attr,
        attrs;
    url = Envjs.urlsplit(url);
    if(cookie)
        attrs = cookie.split(";");
    else
        return;
    
    //for now the strategy is to simply create a json object
    //and post it to a file in the .cookies.js file.  I hate parsing
    //dates so I decided not to implement support for 'expires' 
    //(which is deprecated) and instead focus on the easier 'max-age'
    //(which succeeds 'expires') 
    cookie = {};//keyword properties of the cookie
    cookie['domain'] = url.hostname;
    cookie['path'] = url.path||'/';
    for(i=0;i<attrs.length;i++){
        index = attrs[i].indexOf("=");
        if(index > -1){
            name = __trim__(attrs[i].slice(0,index));
            value = __trim__(attrs[i].slice(index+1));
            if(name.toLowerCase() == 'max-age'){
                //we'll have to when to check these
                //and garbage collect expired cookies
                cookie[name] = parseInt(value, 10);
            } else if( name.toLowerCase() == 'domain' ){
                if(__domainValid__(url, value)){
                    cookie['domain'] = value;
                }
            } else if( name.toLowerCase() == 'path' ){
                //not sure of any special logic for path
                cookie['path'] = value;
            } else {
                //its not a cookie keyword so store it in our array of properties
                //and we'll serialize individually in a moment
                properties[name] = value;
            }
        }else{
            if( attrs[i].toLowerCase() == 'secure' ){
                cookie[attrs[i]] = true;
            }
        }
    }
    if(!('max-age' in cookie)){
        //it's a transient cookie so it only lasts as long as 
        //the window.location remains the same (ie in-memory cookie)
        __mergeCookie__(Envjs.cookies.temporary, cookie, properties);
    }else{
        //the cookie is persistent
        __mergeCookie__(Envjs.cookies.persistent, cookie, properties);
        Envjs.saveCookies();
    }
};

function __domainValid__(url, value){
    var i,
        domainParts = url.hostname.split('.').reverse(),
        newDomainParts = value.split('.').reverse();
    if(newDomainParts.length > 1){
        for(i=0;i<newDomainParts.length;i++){
            if(!(newDomainParts[i] == domainParts[i])){
                return false;
            }
        }
        return true;
    }
    return false;
};

Envjs.getCookies = function(url){
    //The cookies that are returned must belong to the same domain
    //and be at or below the current window.location.path.  Also
    //we must check to see if the cookie was set to 'secure' in which
    //case we must check our current location.protocol to make sure it's
    //https:
    var persisted;
    url = Envjs.urlsplit(url);
    if(!__cookies__){
        try{
            __cookies__ = true;
            try{
                persisted = Envjs.loadCookies();
            }catch(e){
                //fail gracefully
                //console.log('%s', e);
            }   
            if(persisted){
                __extend__(Envjs.cookies.persistent, persisted);
            }
            //console.log('set cookies for doc %s', doc.baseURI);
        }catch(e){
            console.log('cookies not loaded %s', e)
        };
    }
    var temporary = __cookieString__(Envjs.cookies.temporary, url),
        persistent =  __cookieString__(Envjs.cookies.persistent, url);
    //console.log('temporary cookies: %s', temporary);  
    //console.log('persistent cookies: %s', persistent);  
    return  temporary + persistent;
};

function __cookieString__(cookies, url) {
    var cookieString = "",
        domain, 
        path,
        name,
        i=0;
    for (domain in cookies) {
        // check if the cookie is in the current domain (if domain is set)
        // console.log('cookie domain %s', domain);
        if (domain == "" || domain == url.hostname) {
            for (path in cookies[domain]) {
                // console.log('cookie domain path %s', path);
                // make sure path is at or below the window location path
                if (path == "/" || url.path.indexOf(path) > -1) {
                    for (name in cookies[domain][path]) {
                        // console.log('cookie domain path name %s', name);
                        cookieString += 
                            ((i++ > 0)?'; ':'') +
                            name + "=" + 
                            cookies[domain][path][name].value;
                    }
                }
            }
        }
    }
    return cookieString;
};

function __mergeCookie__(target, cookie, properties){
    var name, now;
    if(!target[cookie.domain]){
        target[cookie.domain] = {};
    }
    if(!target[cookie.domain][cookie.path]){
        target[cookie.domain][cookie.path] = {};
    }
    for(name in properties){
        now = new Date().getTime();
        target[cookie.domain][cookie.path][name] = {
            "value":properties[name],
            "secure":cookie.secure,
            "max-age":cookie['max-age'],
            "date-created":now,
            "expiration":(cookie['max-age']===0) ? 
                0 :
                now + cookie['max-age']
        };
        //console.log('cookie is %o',target[cookie.domain][cookie.path][name]);
    }
};

})();//end cookies


Envjs.serializeForm = __formSerialize__;
/**
 * Form Submissions
 *
 * This code is borrow largely from jquery.params and jquery.form.js
 *
 * formToArray() gathers form element data into an array of objects that can
 * be passed to any of the following ajax functions: $.get, $.post, or load.
 * Each object in the array has both a 'name' and 'value' property.  An example of
 * an array for a simple login form might be:
 *
 * [ { name: 'username', value: 'jresig' }, { name: 'password', value: 'secret' } ]
 *
 * It is this array that is passed to pre-submit callback functions provided to the
 * ajaxSubmit() and ajaxForm() methods.
 *
 * The semantic argument can be used to force form serialization in semantic order.
 * This is normally true anyway, unless the form contains input elements of type='image'.
 * If your form must be submitted with name/value pairs in semantic order and your form
 * contains an input of type='image" then pass true for this arg, otherwise pass false
 * (or nothing) to avoid the overhead for this logic.
 *
 *
 * @name formToArray
 * @param semantic true if serialization must maintain strict semantic ordering of elements (slower)
 * @type Array<Object>
 */
function __formToArray__(form, semantic) {
    var array = [],
        elements = semantic ? form.getElementsByTagName('*') : form.elements,
        element,
        i,j,imax, jmax,
        name,
        value;

    if (!elements) {
        return array;
    }

    imax = elements.length;
    for(i=0; i < imax; i++) {
        element = elements[i];
        name = element.name;
        if (!name) {
            continue;
        }
		//console.log('serializing input %s', name);
        if (semantic && form.clk && element.type === "image") {
            // handle image inputs on the fly when semantic == true
            if(!element.disabled && form.clk == element) {
                array.push({
                    name: name+'.x',
                    value: form.clk_x
                },{
                    name: name+'.y',
                    value: form.clk_y
                });
            }
            continue;
        }

        value = __fieldValue__(element, true);
		//console.log('input value is %s', value);
        if (value && value.constructor == Array) {
            jmax = value.length;
            for(j=0; j < jmax; j++){
                array.push({name: name, value: value[j]});
            }
        } else if (value !== null && typeof value != 'undefined'){
			//console.log('serializing form %s %s', name, value);
            array.push({name: name, value: value});
        }
    }

    if (!semantic && form.clk) {
        // input type=='image' are not found in elements array! handle them here
        elements = form.getElementsByTagName("input");
        imax = imax=elements.length;
        for(i=0; i < imax; i++) {
            element = elements[i];
            name = element.name;
            if(name && !element.disabled && element.type == "image" && form.clk == input) {
                array.push(
                    {name: name+'.x', value: form.clk_x},
                    {name: name+'.y', value: form.clk_y});
            }
        }
    }
    return array;
};


/**
 * Serializes form data into a 'submittable' string. This method will return a string
 * in the format: name1=value1&amp;name2=value2
 *
 * The semantic argument can be used to force form serialization in semantic order.
 * If your form must be submitted with name/value pairs in semantic order then pass
 * true for this arg, otherwise pass false (or nothing) to avoid the overhead for
 * this logic (which can be significant for very large forms).
 *
 *
 * @name formSerialize
 * @param semantic true if serialization must maintain strict semantic ordering of elements (slower)
 * @type String
 */
function __formSerialize__(form, semantic) {
    //hand off to param for proper encoding
    return __param__(__formToArray__(form, semantic));
};


/**
 * Serializes all field elements inputs Array into a query string.
 * This method will return a string in the format: name1=value1&amp;name2=value2
 *
 * The successful argument controls whether or not serialization is limited to
 * 'successful' controls (per http://www.w3.org/TR/html4/interact/forms.html#successful-controls).
 * The default value of the successful argument is true.
 *
 *
 * @name fieldSerialize
 * @param successful true if only successful controls should be serialized (default is true)
 * @type String
 */
function __fieldSerialize__(inputs, successful) {
    var array = [],
        input,
        name,
        value,
        i,j, imax, jmax;

    imax = inputs.length;
    for(i=0; i<imax; i++){
        input = inputs[i];
        name = input.name;
        if (!name) {
            return '';
        }
        value = __fieldValue__(input, successful);
        if (value && value.constructor == Array) {
            jmax = value.length;
            for (j=0; j < jmax; j++){
                array.push({
                    name: name,
                    value: value[j]
                });
            }
        }else if (value !== null && typeof value != 'undefined'){
            array.push({
                name: input.name,
                value: value
            });
        }
    }

    //hand off  for proper encoding
    return __param__(array);
};


/**
 * Returns the value(s) of the element in the matched set.  For example, consider the following form:
 *
 *
 * The successful argument controls whether or not the field element must be 'successful'
 * (per http://www.w3.org/TR/html4/interact/forms.html#successful-controls).
 * The default value of the successful argument is true.  If this value is false the value(s)
 * for each element is returned.
 *
 * Note: This method *always* returns an array.  If no valid value can be determined the
 *       array will be empty, otherwise it will contain one or more values.
 *
 *
 * @name fieldValue
 * @param Boolean successful true if only the values for successful controls
 *        should be returned (default is true)
 * @type Array<String>
 */
 function __fieldValues__(inputs, successful) {
    var i,
        imax = inputs.length,
        element,
        values = [],
        value;
    for (i=0; i < imax; i++) {
        element = inputs[i];
        value = __fieldValue__(element, successful);
        if (value === null || typeof value == 'undefined' ||
            (value.constructor == Array && !value.length)) {
            continue;
        }
        if (value.constructor == Array) {
            Array.prototype.push(values, value);
        } else {
            values.push(value);
        }
    }
    return values;
};

/**
 * Returns the value of the field element.
 *
 * The successful argument controls whether or not the field element must be 'successful'
 * (per http://www.w3.org/TR/html4/interact/forms.html#successful-controls).
 * The default value of the successful argument is true.  If the given element is not
 * successful and the successful arg is not false then the returned value will be null.
 *
 * Note: If the successful flag is true (default) but the element is not successful, the return will be null
 * Note: The value returned for a successful select-multiple element will always be an array.
 * Note: If the element has no value the return value will be undefined.
 *
 * @name fieldValue
 * @param Element el The DOM element for which the value will be returned
 * @param Boolean successful true if value returned must be for a successful controls (default is true)
 * @type String or Array<String> or null or undefined
 */
 function __fieldValue__(element, successful) {
    var name = element.name,
        type = element.type,
        tag = element.tagName.toLowerCase(),
        index,
        array,
        options,
        option,
        one,
        i, imax,
        value;

    if (typeof successful == 'undefined')  {
        successful = true;
    }

    if (successful && (!name || element.disabled || type == 'reset' || type == 'button' ||
             (type == 'checkbox' || type == 'radio') &&  !element.checked ||
			/*thatcher - submit buttons should count?*/
             (/*type == 'submit' || */type == 'image') &&
             element.form && element.form.clk != element || tag === 'select' &&
             element.selectedIndex === -1)) {
            return null;
    }

    if (tag === 'select') {
        index = element.selectedIndex;
        if (index < 0) {
            return null;
        }
        array = [];
        options = element.options;
        one = (type == 'select-one');
        imax = (one ? index+1 : options.length);
        i = (one ? index : 0);
        for( i; i < imax; i++) {
            option = options[i];
            if (option.selected) {
                value = option.value;
                if (one) {
                    return value;
                }
                array.push(value);
            }
        }
        return array;
    }
    return element.value;
};


/**
 * Clears the form data.  Takes the following actions on the form's input fields:
 *  - input text fields will have their 'value' property set to the empty string
 *  - select elements will have their 'selectedIndex' property set to -1
 *  - checkbox and radio inputs will have their 'checked' property set to false
 *  - inputs of type submit, button, reset, and hidden will *not* be effected
 *  - button elements will *not* be effected
 *
 *
 * @name clearForm
 */
 function __clearForm__(form) {
    var i,
        j, jmax,
        elements,
        resetable = ['input','select','textarea'];
    for(i=0; i<resetable.length; i++){
        elements = form.getElementsByTagName(resetable[i]);
        jmax = elements.length;
        for(j=0;j<jmax;j++){
            __clearField__(elements[j]);
        }
    }
};

/**
 * Clears the selected form element.  Takes the following actions on the element:
 *  - input text fields will have their 'value' property set to the empty string
 *  - select elements will have their 'selectedIndex' property set to -1
 *  - checkbox and radio inputs will have their 'checked' property set to false
 *  - inputs of type submit, button, reset, and hidden will *not* be effected
 *  - button elements will *not* be effected
 *
 * @name clearFields
 */
 function __clearField__(element) {
    var type = element.type,
        tag = element.tagName.toLowerCase();
    if (type == 'text' || type == 'password' || tag === 'textarea') {
        element.value = '';
    } else if (type == 'checkbox' || type == 'radio') {
        element.checked = false;
    } else if (tag === 'select') {
        element.selectedIndex = -1;
    }
};


// Serialize an array of key/values into a query string
function __param__( array ) {
    var i, serialized = [];

    // Serialize the key/values
    for(i=0; i<array.length; i++){
        serialized[ serialized.length ] =
            encodeURIComponent(array[i].name) + '=' +
            encodeURIComponent(array[i].value);
    }

    // Return the resulting serialization
    return serialized.join("&").replace(/%20/g, "+");
};
/*
    http://www.JSON.org/json2.js
    2008-07-15

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html

   
    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
*/
try{ JSON; }catch(e){ 
JSON = function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    Date.prototype.toJSON = function (key) {

        return this.getUTCFullYear()   + '-' +
             f(this.getUTCMonth() + 1) + '-' +
             f(this.getUTCDate())      + 'T' +
             f(this.getUTCHours())     + ':' +
             f(this.getUTCMinutes())   + ':' +
             f(this.getUTCSeconds())   + 'Z';
    };

    String.prototype.toJSON = function (key) {
        return String(this);
    };
    Number.prototype.toJSON =
    Boolean.prototype.toJSON = function (key) {
        return this.valueOf();
    };

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapeable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {
        
        escapeable.lastIndex = 0;
        return escapeable.test(string) ?
            '"' + string.replace(escapeable, function (a) {
                var c = meta[a];
                if (typeof c === 'string') {
                    return c;
                }
                return '\\u' + ('0000' +
                        (+(a.charCodeAt(0))).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }
        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':
            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

            return String(value);
            
        case 'object':

            if (!value) {
                return 'null';
            }
            gap += indent;
            partial = [];

            if (typeof value.length === 'number' &&
                    !(value.propertyIsEnumerable('length'))) {

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }
                
                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

    return {
        stringify: function (value, replacer, space) {

            var i;
            gap = '';
            indent = '';

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

            } else if (typeof space === 'string') {
                indent = space;
            }

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

            return str('', {'': value});
        },


        parse: function (text, reviver) {
            var j;
            function walk(holder, key) {
                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }

            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' + ('0000' +
                            (+(a.charCodeAt(0))).toString(16)).slice(-4);
                });
            }


            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
        
                j = eval('(' + text + ')');

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

            throw new SyntaxError('JSON.parse');
        }
    };
}();

}

/**
 * synchronizes thread modifications
 * @param {Function} fn
 */
Envjs.sync = function(fn){};

/**
 * sleep thread for specified duration
 * @param {Object} millseconds
 */
Envjs.sleep = function(millseconds){};

/**
 * Interval to wait on event loop when nothing is happening
 */
Envjs.WAIT_INTERVAL = 100;//milliseconds

/*
 * Copyright (c) 2010 Nick Galbreath
 * http://code.google.com/p/stringencoders/source/browse/#svn/trunk/javascript
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

/*
 * url processing in the spirit of python's urlparse module
 * see `pydoc urlparse` or
 * http://docs.python.org/library/urlparse.html
 *
 *  urlsplit: break apart a URL into components
 *  urlunsplit:  reconsistute a URL from componets
 *  urljoin: join an absolute and another URL
 *  urldefrag: remove the fragment from a URL
 *
 * Take a look at the tests in urlparse-test.html
 *
 * On URL Normalization:
 *
 * urlsplit only does minor normalization the components Only scheme
 * and hostname are lowercased urljoin does a bit more, normalizing
 * paths with "."  and "..".

 * urlnormalize adds additional normalization
 *
 *   * removes default port numbers
 *     http://abc.com:80/ -> http://abc.com/, etc
 *   * normalizes path
 *     http://abc.com -> http://abc.com/
 *     and other "." and ".." cleanups
 *   * if file, remove query and fragment
 *
 * It does not do:
 *   * normalizes escaped hex values
 *     http://abc.com/%7efoo -> http://abc.com/%7Efoo
 *   * normalize '+' <--> '%20'
 *
 * Differences with Python
 *
 * The javascript urlsplit returns a normal object with the following
 * properties: scheme, netloc, hostname, port, path, query, fragment.
 * All properties are read-write.
 *
 * In python, the resulting object is not a dict, but a specialized,
 * read-only, and has alternative tuple interface (e.g. obj[0] ==
 * obj.scheme).  It's not clear why such a simple function requires
 * a unique datastructure.
 *
 * urlunsplit in javascript takes an duck-typed object,
 *  { scheme: 'http', netloc: 'abc.com', ...}
 *  while in  * python it takes a list-like object.
 *  ['http', 'abc.com'... ]
 *
 * For all functions, the javascript version use
 * hostname+port if netloc is missing.  In python
 * hostname+port were always ignored.
 *
 * Similar functionality in different languages:
 *
 *   http://php.net/manual/en/function.parse-url.php
 *   returns assocative array but cannot handle relative URL
 *
 * TODO: test allowfragments more
 * TODO: test netloc missing, but hostname present
 */

var urlparse = {};

// Unlike to be useful standalone
//
// NORMALIZE PATH with "../" and "./"
//   http://en.wikipedia.org/wiki/URL_normalization
//   http://tools.ietf.org/html/rfc3986#section-5.2.3
//
urlparse.normalizepath = function(path)
{
    if (!path || path === '/') {
        return '/';
    }

    var parts = path.split('/');

    var newparts = [];
    // make sure path always starts with '/'
    if (parts[0]) {
        newparts.push('');
    }

    for (var i = 0; i < parts.length; ++i) {
        if (parts[i] === '..') {
            if (newparts.length > 1) {
                newparts.pop();
            } else {
                newparts.push(parts[i]);
            }
        } else if (parts[i] != '.') {
            newparts.push(parts[i]);
        }
    }

    path = newparts.join('/');
    if (!path) {
        path = '/';
    }
    return path;
};

//
// Does many of the normalizations that the stock
//  python urlsplit/urlunsplit/urljoin neglects
//
// Doesn't do hex-escape normalization on path or query
//   %7e -> %7E
// Nor, '+' <--> %20 translation
//
urlparse.urlnormalize = function(url)
{
    var parts = urlparse.urlsplit(url);
    switch (parts.scheme) {
    case 'file':
        // files can't have query strings
        //  and we don't bother with fragments
        parts.query = '';
        parts.fragment = '';
        break;
    case 'http':
    case 'https':
        // remove default port
        if ((parts.scheme === 'http' && parts.port == 80) ||
            (parts.scheme === 'https' && parts.port == 443)) {
            parts.port = null;
            // hostname is already lower case
            parts.netloc = parts.hostname;
        }
        break;
    default:
        // if we don't have specific normalizations for this
        // scheme, return the original url unmolested
        return url;
    }

    // for [file|http|https].  Not sure about other schemes
    parts.path = urlparse.normalizepath(parts.path);

    return urlparse.urlunsplit(parts);
};

urlparse.urldefrag = function(url)
{
    var idx = url.indexOf('#');
    if (idx == -1) {
        return [ url, '' ];
    } else {
        return [ url.substr(0,idx), url.substr(idx+1) ];
    }
};

urlparse.urlsplit = function(url, default_scheme, allow_fragments)
{
    var leftover;

    if (typeof allow_fragments === 'undefined') {
        allow_fragments = true;
    }

    // scheme (optional), host, port
    var fullurl = /^([A-Za-z]+)?(:?\/\/)([0-9.\-A-Za-z]*)(?::(\d+))?(.*)$/;
    // path, query, fragment
    var parse_leftovers = /([^?#]*)?(?:\?([^#]*))?(?:#(.*))?$/;

    var o = {};

    var parts = url.match(fullurl);
    if (parts) {
        o.scheme = parts[1] || default_scheme || '';
        o.hostname = parts[3].toLowerCase() || '';
        o.port = parseInt(parts[4],10) || '';
        // Probably should grab the netloc from regexp
        //  and then parse again for hostname/port

        o.netloc = parts[3];
        if (parts[4]) {
            o.netloc += ':' + parts[4];
        }

        leftover = parts[5];
    } else {
        o.scheme = default_scheme || '';
        o.netloc = '';
        o.hostname = '';
        leftover = url;
    }
    o.scheme = o.scheme.toLowerCase();

    parts = leftover.match(parse_leftovers);

    o.path =  parts[1] || '';
    o.query = parts[2] || '';

    if (allow_fragments) {
        o.fragment = parts[3] || '';
    } else {
        o.fragment = '';
    }

    return o;
};

urlparse.urlunsplit = function(o) {
    var s = '';
    if (o.scheme) {
        s += o.scheme + '://';
    }

    if (o.netloc) {
        if (s == '') {
            s += '//';
        }
        s +=  o.netloc;
    } else if (o.hostname) {
        // extension.  Python only uses netloc
        if (s == '') {
            s += '//';
        }
        s += o.hostname;
        if (o.port) {
            s += ':' + o.port;
        }
    }

    if (o.path) {
        s += o.path;
    }

    if (o.query) {
        s += '?' + o.query;
    }
    if (o.fragment) {
        s += '#' + o.fragment;
    }
    return s;
};

urlparse.urljoin = function(base, url, allow_fragments)
{
    if (typeof allow_fragments === 'undefined') {
        allow_fragments = true;
    }

    var url_parts = urlparse.urlsplit(url);

    // if url parts has a scheme (i.e. absolute)
    // then nothing to do
    if (url_parts.scheme) {
        if (! allow_fragments) {
            return url;
        } else {
            return urlparse.urldefrag(url)[0];
        }
    }
    var base_parts = urlparse.urlsplit(base);

    // copy base, only if not present
    if (!base_parts.scheme) {
        base_parts.scheme = url_parts.scheme;
    }

    // copy netloc, only if not present
    if (!base_parts.netloc || !base_parts.hostname) {
        base_parts.netloc = url_parts.netloc;
        base_parts.hostname = url_parts.hostname;
        base_parts.port = url_parts.port;
    }

    // paths
    if (url_parts.path.length > 0) {
        if (url_parts.path.charAt(0) == '/') {
            base_parts.path = url_parts.path;
        } else {
            // relative path.. get rid of "current filename" and
            //   replace.  Same as var parts =
            //   base_parts.path.split('/'); parts[parts.length-1] =
            //   url_parts.path; base_parts.path = parts.join('/');
            var idx = base_parts.path.lastIndexOf('/');
            if (idx == -1) {
                base_parts.path = url_parts.path;
            } else {
                base_parts.path = base_parts.path.substr(0,idx) + '/' +
                    url_parts.path;
            }
        }
    }

    // clean up path
    base_parts.path = urlparse.normalizepath(base_parts.path);

    // copy query string
    base_parts.query = url_parts.query;

    // copy fragments
    if (allow_fragments) {
        base_parts.fragment = url_parts.fragment;
    } else {
        base_parts.fragment = '';
    }

    return urlparse.urlunsplit(base_parts);
};

/**
 * getcwd - named after posix call of same name (see 'man 2 getcwd')
 *
 */
Envjs.getcwd = function() {
    return '.';
};

/**
 * resolves location relative to doc location
 *
 * @param {Object} path  Relative or absolute URL
 * @param {Object} base  (semi-optional)  The base url used in resolving "path" above
 */
Envjs.uri = function(path, base) {
    //console.log('constructing uri from path %s and base %s', path, base);

    // Semi-common trick is to make an iframe with src='javascript:false'
    //  (or some equivalent).  By returning '', the load is skipped
    if (path.indexOf('javascript:') === 0) {
        return '';
    }

    // if path is absolute, then just normalize and return
    if (path.match('^[a-zA-Z]+://')) {
        return urlparse.urlnormalize(path);
    }

    // interesting special case, a few very large websites use
    // '//foo/bar/' to mean 'http://foo/bar'
    if (path.match('^//')) {
        path = 'http:' + path;
    }

    // if base not passed in, try to get it from document
    // Ideally I would like the caller to pass in document.baseURI to
    //  make this more self-sufficient and testable
    if (!base && document) {
        base = document.baseURI;
    }

    // about:blank doesn't count
    if (base === 'about:blank'){
        base = '';
    }

    // if base is still empty, then we are in QA mode loading local
    // files.  Get current working directory
    if (!base) {
        base = 'file://' +  Envjs.getcwd() + '/';
    }
    // handles all cases if path is abosulte or relative to base
    // 3rd arg is "false" --> remove fragments
    var newurl = urlparse.urlnormalize(urlparse.urljoin(base, path, false));
	//console.log('uri %s %s = %s', base, path, newurl);
    return newurl;
};



/**
 * Used in the XMLHttpRquest implementation to run a
 * request in a seperate thread
 * @param {Object} fn
 */
Envjs.runAsync = function(fn){};


/**
 * Used to write to a local file
 * @param {Object} text
 * @param {Object} url
 */
Envjs.writeToFile = function(text, url){};


/**
 * Used to write to a local file
 * @param {Object} text
 * @param {Object} suffix
 */
Envjs.writeToTempFile = function(text, suffix){};

/**
 * Used to read the contents of a local file
 * @param {Object} url
 */
Envjs.readFromFile = function(url){};

/**
 * Used to delete a local file
 * @param {Object} url
 */
Envjs.deleteFile = function(url){};

/**
 * establishes connection and calls responsehandler
 * @param {Object} xhr
 * @param {Object} responseHandler
 * @param {Object} data
 */
Envjs.connection = function(xhr, responseHandler, data){};


__extend__(Envjs, urlparse);
/**
 * Makes an object window-like by proxying object accessors
 * @param {Object} scope
 * @param {Object} parent
 */
Envjs.proxy = function(scope, parent, aliasList){
    return (function(){return this;})();
};

Envjs.javaEnabled = false;

Envjs.homedir        = '';
Envjs.tmpdir         = '';
Envjs.os_name        = '';
Envjs.os_arch        = '';
Envjs.os_version     = '';
Envjs.lang           = '';
Envjs.platform       = '';

//some common user agents as constants so you can emulate them
Envjs.userAgents = {
	firefox3: 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.0.7) Gecko/2009021910 Firefox/3.0.7'
}

var __windows__ = {};

Envjs.windows = function(uuid, scope){
	var w;
	if(arguments.length === 0){
		/*for(w in __windows__){
			console.log('window uuid => %s', w);
			console.log('window document => %s', __windows__[w].document.baseURI);
		}*/
		return __windows__;
	}else if(arguments.length === 1){
		return (uuid in __windows__) ? __windows__[uuid] : null
	}else if(arguments.length === 2){
		__windows__[uuid] = scope;
		if(scope === null){
            delete __windows__[uuid];
		}
	}
};
/**
 *
 * @param {Object} frameElement
 * @param {Object} url
 */
Envjs.loadFrame = function(frame, url){	
    try {
        //console.log('loading frame %s', url);
        if(frame.contentWindow && frame.contentWindow.close){
            //mark for garbage collection
            frame.contentWindow.close();
        }

        //create a new scope for the window proxy
        //platforms will need to override this function
        //to make sure the scope is global-like
        frame.contentWindow = Envjs.proxy({});
		//console.log("frame.ownerDocument %s subframe %s", 
		//	frame.ownerDocument.location,
		//	frame.ownerDocument.__ownerFrame__);
		if(frame.ownerDocument&&frame.ownerDocument.__ownerFrame__){
			//console.log('frame is parent %s', frame.ownerDocument.__ownerFrame__.contentWindow.guid);
			new Window(frame.contentWindow, frame.ownerDocument.__ownerFrame__.contentWindow);
		}else{
			//console.log("window is parent %s", window.guid);
			new Window(frame.contentWindow, window);
		}

        //I dont think frames load asynchronously in firefox
        //and I think the tests have verified this but for
        //some reason I'm less than confident... Are there cases?
        frame.contentDocument = frame.contentWindow.document;
        frame.contentDocument.async = false;
        frame.contentDocument.__ownerFrame__ = frame;
        if(url){
            //console.log('envjs.loadFrame async %s', frame.contentDocument.async);
            frame.contentDocument.location.assign(Envjs.uri(url, frame.ownerDocument.location.toString()));
        }
    } catch(e) {
        console.log("failed to load frame content: from %s %s", url, e);
    }
};


/**
 * unloadFrame
 * @param {Object} frame
 */
Envjs.unloadFrame = function(frame){
    var all, length, i;
    try{
        //TODO: probably self-referencing structures within a document tree
        //preventing it from being entirely garbage collected once orphaned.
        //Should have code to walk tree and break all links between contained
        //objects.
        frame.contentDocument = null;
        if(frame.contentWindow){
			//console.log('closing window %s', frame.contentWindow);
            frame.contentWindow.close();
        }
        Envjs.gc();
    }catch(e){
        console.log(e);
    }
};

/**
 * Platform clean up hook if it ever makes sense - see Envjs.unloadFrame for example
 */
Envjs.gc = function(){};
/**
 * @author john resig & the envjs team
 * @uri http://www.envjs.com/
 * @copyright 2008-2010
 * @license MIT
 */
//CLOSURE_END
}());
/*
 * Envjs rhino-env.1.2.35
 * Pure JavaScript Browser Environment
 * By John Resig <http://ejohn.org/> and the Envjs Team
 * Copyright 2008-2010 John Resig, under the MIT License
 */

var __context__ = Packages.org.mozilla.javascript.Context.getCurrentContext();

Envjs.platform       = "Rhino";
Envjs.revision       = "1.7.0.rc2";

/*
 * Envjs rhino-env.1.2.35 
 * Pure JavaScript Browser Environment
 * By John Resig <http://ejohn.org/> and the Envjs Team
 * Copyright 2008-2010 John Resig, under the MIT License
 */

//CLOSURE_START
(function(){





/**
 * @author john resig
 */
// Helper method for extending one object with another.
function __extend__(a,b) {
    for ( var i in b ) {
        var g = b.__lookupGetter__(i), s = b.__lookupSetter__(i);
        if ( g || s ) {
            if ( g ) { a.__defineGetter__(i, g); }
            if ( s ) { a.__defineSetter__(i, s); }
        } else {
            a[i] = b[i];
        }
    } return a;
}

/**
 * Writes message to system out.
 *
 * Some sites redefine 'print' as in 'window.print', so instead of
 * printing to stdout, you are popping open a new window, which might
 * call print, etc, etc,etc This can cause infinite loops and can
 * exhausing all memory.
 *
 * By defining this upfront now, Envjs.log will always call the native 'print'
 * function
 *
 * @param {Object} message
 */
//Envjs.log = print;

Envjs.alert = function(message)
{
	myobj.println(message);
};

Envjs.prompt = function(message, defaultMsg)
{
	return String(myobj.prompt(message, defaultMsg));
};

Envjs.confirm = function(question)
{
	return Boolean(myobj.confirm(question));
};


Envjs.lineSource = function(e){
    return e&&e.rhinoException?e.rhinoException.lineSource():"(line ?)";
};
Envjs.eval = function(context, source, name){
    __context__.evaluateString(
        context,
        source,
        name,
        0,
        null
    );
};
Envjs.renderSVG = function(svgstring, url){
    //console.log("svg template url %s", templateSVG);
    // Create a JPEG transcoder
    var t = new Packages.org.apache.batik.transcoder.image.JPEGTranscoder();

    // Set the transcoding hints.
    t.addTranscodingHint(
        Packages.org.apache.batik.transcoder.image.JPEGTranscoder.KEY_QUALITY,
        new java.lang.Float(1.0));
    // Create the transcoder input.
    var input = new Packages.org.apache.batik.transcoder.TranscoderInput(
        new java.io.StringReader(svgstring));

    // Create the transcoder output.
    var ostream = new java.io.ByteArrayOutputStream();
    var output = new Packages.org.apache.batik.transcoder.TranscoderOutput(ostream);

    // Save the image.
    t.transcode(input, output);

    // Flush and close the stream.
    ostream.flush();
    ostream.close();
    
	var out = new java.io.FileOutputStream(new java.io.File(new java.net.URI(url.toString())));
	try{
    	out.write( ostream.toByteArray() );
	}catch(e){
		
	}finally{
    	out.flush();
    	out.close();
    }
};
//Temporary patch for parser module
Packages.org.mozilla.javascript.Context.
    getCurrentContext().setOptimizationLevel(-1);

Envjs.shell = new Packages.java.util.Scanner(Packages.java.lang.System['in']);
/**
 * Rhino provides a very succinct 'sync'
 * @param {Function} fn
 */
try{
    Envjs.sync = sync;
    Envjs.spawn = spawn;
} catch(e){
    //sync unavailable on AppEngine
    Envjs.sync = function(fn){
        //console.log('Threadless platform, sync is safe');
        return fn;
    };

    Envjs.spawn = function(fn){
        //console.log('Threadless platform, spawn shares main thread.');
        return fn();
    };
}

/**
 * sleep thread for specified duration
 * @param {Object} millseconds
 */
Envjs.sleep = function(millseconds){
    try{
        java.lang.Thread.currentThread().sleep(millseconds);
    }catch(e){
        console.log('Threadless platform, cannot sleep.');
    }
};

/**
 * provides callback hook for when the system exits
 */
Envjs.onExit = function(callback){
    var rhino = Packages.org.mozilla.javascript,
        contextFactory =  __context__.getFactory(),
        listener = new rhino.ContextFactory.Listener({
            contextReleased: function(context){
                if(context === __context__)
                    console.log('context released', context);
                contextFactory.removeListener(this);
                if(callback)
                    callback();
            }
        });
    contextFactory.addListener(listener);
};

/**
 * Get 'Current Working Directory'
 */
Envjs.getcwd = function() {
    return java.lang.System.getProperty('user.dir');
}

/**
 *
 * @param {Object} fn
 * @param {Object} onInterupt
 */
Envjs.runAsync = function(fn, onInterupt){
    ////Envjs.debug("running async");
    var running = true,
        run;

    try{
        run = Envjs.sync(function(){
            fn();
            Envjs.wait();
        });
        Envjs.spawn(run);
    }catch(e){
        console.log("error while running async operation", e);
        try{if(onInterrupt)onInterrupt(e)}catch(ee){};
    }
};

/**
 * Used to write to a local file
 * @param {Object} text
 * @param {Object} url
 */
Envjs.writeToFile = function(text, url){
    //Envjs.debug("writing text to url : " + url);
    var out = new java.io.FileWriter(
        new java.io.File(
            new java.net.URI(url.toString())));
    out.write( text, 0, text.length );
    out.flush();
    out.close();
};

/**
 * Used to write to a local file
 * @param {Object} text
 * @param {Object} suffix
 */
Envjs.writeToTempFile = function(text, suffix){
    //Envjs.debug("writing text to temp url : " + suffix);
    // Create temp file.
    var temp = java.io.File.createTempFile("envjs-tmp", suffix);

    // Delete temp file when program exits.
    temp.deleteOnExit();

    // Write to temp file
    var out = new java.io.FileWriter(temp);
    out.write(text, 0, text.length);
    out.close();
    return temp.getAbsolutePath().toString()+'';
};


/**
 * Used to read the contents of a local file
 * @param {Object} url
 */
Envjs.readFromFile = function( url ){
    var fileReader = new java.io.FileReader(
        new java.io.File( 
            new java.net.URI( url )));
            
    var stringwriter = new java.io.StringWriter(),
        buffer = java.lang.reflect.Array.newInstance(java.lang.Character.TYPE, 1024),
        length;

    while ((length = fileReader.read(buffer, 0, 1024)) != -1) {
        stringwriter.write(buffer, 0, length);
    }

    stringwriter.close();
    return stringwriter.toString()+"";
};
    

/**
 * Used to delete a local file
 * @param {Object} url
 */
Envjs.deleteFile = function(url){
    var file = new java.io.File( new java.net.URI( url ) );
    file["delete"]();
};

/**
 * establishes connection and calls responsehandler
 * @param {Object} xhr
 * @param {Object} responseHandler
 * @param {Object} data
 */
Envjs.connection = function(xhr, responseHandler, data){
    var url = java.net.URL(xhr.url),
        connection,
        header,
        outstream,
        buffer,
        length,
        binary = false,
        name, value,
        contentEncoding,
        instream,
        responseXML,
        i;
    
        
    if ( /^file\:/.test(url) ) {
        try{
            if ( "PUT" == xhr.method || "POST" == xhr.method ) {
                data =  data || "" ;
                Envjs.writeToFile(data, url);
                xhr.readyState = 4;
                //could be improved, I just cant recall the correct http codes
                xhr.status = 200;
                xhr.statusText = "";
            } else if ( xhr.method == "DELETE" ) {
                Envjs.deleteFile(url);
                xhr.readyState = 4;
                //could be improved, I just cant recall the correct http codes
                xhr.status = 200;
                xhr.statusText = "";
            } else {
                //try to add some canned headers that make sense
                xhr.readyState = 4;
                xhr.statusText = "ok";
                xhr.responseText = Envjs.readFromFile(xhr.url);
                try{
                    if(xhr.url.match(/html$/)){
                        xhr.responseHeaders["Content-Type"] = 'text/html';
                    }else if(xhr.url.match(/.xml$/)){
                        xhr.responseHeaders["Content-Type"] = 'text/xml';
                    }else if(xhr.url.match(/.js$/)){
                        xhr.responseHeaders["Content-Type"] = 'text/javascript';
                    }else if(xhr.url.match(/.json$/)){
                        xhr.responseHeaders["Content-Type"] = 'application/json';
                    }else{
                        xhr.responseHeaders["Content-Type"] = 'text/plain';
                    }
                    //xhr.responseHeaders['Last-Modified'] = connection.getLastModified();
                    //xhr.responseHeaders['Content-Length'] = headerValue+'';
                    //xhr.responseHeaders['Date'] = new Date()+'';*/
                }catch(e){
                    console.log('failed to load response headers',e);
                }
            }
        }catch(e){
            console.log('failed to open file %s %s', url, e);
            connection = null;
            xhr.readyState = 4;
            xhr.statusText = "Local File Protocol Error";
            xhr.responseText = "<html><head/><body><p>"+ e+ "</p></body></html>";
        }
    } else {
        connection = url.openConnection();
        //handle redirects manually since cookie support sucks out of the box
        connection.setFollowRedirects(false);
        connection.setRequestMethod( xhr.method );

        // Add headers to Java connection
        for (header in xhr.headers){
            connection.addRequestProperty(header+'', xhr.headers[header]+'');
        }
        connection.addRequestProperty("Accept-Encoding", 'gzip');
        connection.addRequestProperty("Agent", 'gzip');

        //write data to output stream if required
        if(data){
            if(data instanceof Document){
                if ( xhr.method == "PUT" || xhr.method == "POST" ) {
                    connection.setDoOutput(true);
                    outstream = connection.getOutputStream(),
                    xml = (new XMLSerializer()).serializeToString(data);
                    buffer = new java.lang.String(xml).getBytes('UTF-8');
                    outstream.write(buffer, 0, buffer.length);
                    outstream.close();
                }
            }else if(data.length&&data.length>0){
                if ( xhr.method == "PUT" || xhr.method == "POST" ) {
                    connection.setDoOutput(true);
                    outstream = connection.getOutputStream();
                    buffer = new java.lang.String(data).getBytes('UTF-8');
                    outstream.write(buffer, 0, buffer.length);
                    outstream.close();
                }
            }
            connection.connect();
        }else{
            connection.connect();
        }
    }

    if(connection){
        try{
            length = connection.getHeaderFields().size();
            // Stick the response headers into responseHeaders
            for (i = 0; i < length; i++) {
                name = connection.getHeaderFieldKey(i);
                value = connection.getHeaderField(i);
                if (name)
                    xhr.responseHeaders[name+''] = value+'';
            }
        }catch(e){
            console.log('failed to load response headers \n%s',e);
        }

        xhr.readyState = 4;
        xhr.status = parseInt(connection.responseCode,10) || undefined;
        xhr.statusText = connection.responseMessage || "";

        contentEncoding = connection.getContentEncoding() || "utf-8";
        instream = null;
        responseXML = null;
        
        try{
            //console.log('contentEncoding %s', contentEncoding);
            if( contentEncoding.equalsIgnoreCase("gzip") ||
                contentEncoding.equalsIgnoreCase("decompress")){
                //zipped content
                binary = true;
                outstream = new java.io.ByteArrayOutputStream();
                buffer = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 1024);
                instream = new java.util.zip.GZIPInputStream(connection.getInputStream())
            }else{
                //this is a text file
                outstream = new java.io.StringWriter();
                buffer = java.lang.reflect.Array.newInstance(java.lang.Character.TYPE, 1024);
                instream = new java.io.InputStreamReader(connection.getInputStream());
            }
        }catch(e){
            if (connection.getResponseCode() == 404){
                console.log('failed to open connection stream \n %s %s',
                            e.toString(), e);
            }else{
                console.log('failed to open connection stream \n %s %s',
                            e.toString(), e);
            }
            instream = connection.getErrorStream();
        }

        while ((length = instream.read(buffer, 0, 1024)) != -1) {
            outstream.write(buffer, 0, length);
        }

        outstream.close();
        instream.close();
        
        if(binary){
            xhr.responseText = new java.lang.String(outstream.toByteArray(), 'UTF-8')+'';
        }else{
            xhr.responseText = outstream.toString()+'';
        }

    }
    if(responseHandler){
        //Envjs.debug('calling ajax response handler');
        responseHandler();
    }
};

//Since we're running in rhino I guess we can safely assume
//java is 'enabled'.  I'm sure this requires more thought
//than I've given it here
Envjs.javaEnabled = true;

Envjs.homedir        = java.lang.System.getProperty("user.home");
Envjs.tmpdir         = java.lang.System.getProperty("java.io.tmpdir");
Envjs.os_name        = java.lang.System.getProperty("os.name");
Envjs.os_arch        = java.lang.System.getProperty("os.arch");
Envjs.os_version     = java.lang.System.getProperty("os.version");
Envjs.lang           = java.lang.System.getProperty("user.lang");


Envjs.gc = function(){ gc(); };

/**
 * Makes an object window-like by proxying object accessors
 * @param {Object} scope
 * @param {Object} parent
 */
Envjs.proxy = function(scope, parent) {
    try{
        if(scope+'' == '[object global]'){
            return scope
        }else{
            return  __context__.initStandardObjects();
        }
    }catch(e){
        console.log('failed to init standard objects %s %s \n%s', scope, parent, e);
    }

};

/**
 * @author john resig & the envjs team
 * @uri http://www.envjs.com/
 * @copyright 2008-2010
 * @license MIT
 */
//CLOSURE_END
}());

/**
 * @author envjs team
 */
var Console,
    console;

/*
 * Envjs console.1.2.35 
 * Pure JavaScript Browser Environment
 * By John Resig <http://ejohn.org/> and the Envjs Team
 * Copyright 2008-2010 John Resig, under the MIT License
 */

//CLOSURE_START
(function(){





/**
 * @author envjs team
 * borrowed 99%-ish with love from firebug-lite
 *
 * http://wiki.commonjs.org/wiki/Console
 */
Console = function(module){
    var $level,
    $logger,
    $null = function(){};


    if(Envjs[module] && Envjs[module].loglevel){
        $level = Envjs.module.loglevel;
        $logger = {
            log: function(level){
                logFormatted(arguments, (module)+" ");
            },
            debug: $level>1 ? $null: function() {
                logFormatted(arguments, (module)+" debug");
            },
            info: $level>2 ? $null:function(){
                logFormatted(arguments, (module)+" info");
            },
            warn: $level>3 ? $null:function(){
                logFormatted(arguments, (module)+" warning");
            },
            error: $level>4 ? $null:function(){
                logFormatted(arguments, (module)+" error");
            }
        };
    } else {
        $logger = {
            log: function(level){
                logFormatted(arguments, "");
            },
            debug: $null,
            info: $null,
            warn: $null,
            error: $null
        };
    }

    return $logger;
};

console = new Console("console",1);

function logFormatted(objects, className)
{
    var html = [];

    var format = objects[0];
    var objIndex = 0;

    if (typeof(format) != "string")
    {
        format = "";
        objIndex = -1;
    }

    var parts = parseFormat(format);
    for (var i = 0; i < parts.length; ++i)
    {
        var part = parts[i];
        if (part && typeof(part) == "object")
        {
            var object = objects[++objIndex];
            part.appender(object, html);
        }
        else {
            appendText(part, html);
	}
    }

    for (var i = objIndex+1; i < objects.length; ++i)
    {
        appendText(" ", html);

        var object = objects[i];
        if (typeof(object) == "string") {
            appendText(object, html);
        } else {
            appendObject(object, html);
	}
    }

    Envjs.log(html.join(' '));
}

function parseFormat(format)
{
    var parts = [];

    var reg = /((^%|[^\\]%)(\d+)?(\.)([a-zA-Z]))|((^%|[^\\]%)([a-zA-Z]))/;
    var appenderMap = {s: appendText, d: appendInteger, i: appendInteger, f: appendFloat};

    for (var m = reg.exec(format); m; m = reg.exec(format))
    {
        var type = m[8] ? m[8] : m[5];
        var appender = type in appenderMap ? appenderMap[type] : appendObject;
        var precision = m[3] ? parseInt(m[3]) : (m[4] == "." ? -1 : 0);

        parts.push(format.substr(0, m[0][0] == "%" ? m.index : m.index+1));
        parts.push({appender: appender, precision: precision});

        format = format.substr(m.index+m[0].length);
    }

    parts.push(format);

    return parts;
}

function escapeHTML(value)
{
    return value;
}

function objectToString(object)
{
    try
    {
        return object+"";
    }
    catch (exc)
    {
        return null;
    }
}

// ********************************************************************************************

function appendText(object, html)
{
    html.push(escapeHTML(objectToString(object)));
}

function appendNull(object, html)
{
    html.push(escapeHTML(objectToString(object)));
}

function appendString(object, html)
{
    html.push(escapeHTML(objectToString(object)));
}

function appendInteger(object, html)
{
    html.push(escapeHTML(objectToString(object)));
}

function appendFloat(object, html)
{
    html.push(escapeHTML(objectToString(object)));
}

function appendFunction(object, html)
{
    var reName = /function ?(.*?)\(/;
    var m = reName.exec(objectToString(object));
    var name = m ? m[1] : "function";
    html.push(escapeHTML(name));
}

function appendObject(object, html)
{
    try
    {
        if (object == undefined) {
            appendNull("undefined", html);
        } else if (object == null) {
            appendNull("null", html);
        } else if (typeof object == "string") {
            appendString(object, html);
	} else if (typeof object == "number") {
            appendInteger(object, html);
	} else if (typeof object == "function") {
            appendFunction(object, html);
        } else if (object.nodeType == 1) {
            appendSelector(object, html);
        } else if (typeof object == "object") {
            appendObjectFormatted(object, html);
        } else {
            appendText(object, html);
	}
    }
    catch (exc)
    {
    }
}

function appendObjectFormatted(object, html)
{
    var text = objectToString(object);
    var reObject = /\[object (.*?)\]/;

    var m = reObject.exec(text);
    html.push( m ? m[1] : text);
}

function appendSelector(object, html)
{

    html.push(escapeHTML(object.nodeName.toLowerCase()));
    if (object.id) {
        html.push(escapeHTML(object.id));
    }
    if (object.className) {
        html.push(escapeHTML(object.className));
    }
}

function appendNode(node, html)
{
    if (node.nodeType == 1)
    {
        html.push( node.nodeName.toLowerCase());

        for (var i = 0; i < node.attributes.length; ++i)
        {
            var attr = node.attributes[i];
            if (!attr.specified) {
                continue;
	    }

            html.push( attr.nodeName.toLowerCase(),escapeHTML(attr.nodeValue));
        }

        if (node.firstChild)
        {
            for (var child = node.firstChild; child; child = child.nextSibling) {
                appendNode(child, html);
	    }

            html.push( node.nodeName.toLowerCase());
        }
    }
    else if (node.nodeType === 3)
    {
        html.push(escapeHTML(node.nodeValue));
    }
};

/**
 * @author john resig & the envjs team
 * @uri http://www.envjs.com/
 * @copyright 2008-2010
 * @license MIT
 */
//CLOSURE_END
}());
/*
 * Envjs dom.1.2.35 
 * Pure JavaScript Browser Environment
 * By John Resig <http://ejohn.org/> and the Envjs Team
 * Copyright 2008-2010 John Resig, under the MIT License
 * 
 * Parts of the implementation were originally written by:\
 * and Jon van Noort   (jon@webarcana.com.au) \
 * and David Joham     (djoham@yahoo.com)",\ 
 * and Scott Severtson
 * 
 * This file simply provides the global definitions we need to \
 * be able to correctly implement to core browser DOM interfaces."
 */

var Attr,
    CDATASection,
    CharacterData,
    Comment,
    Document,
    DocumentFragment,
    DocumentType,
    DOMException,
    DOMImplementation,
    Element,
    Entity,
    EntityReference,
    NamedNodeMap,
    Namespace,
    Node,
    NodeList,
    Notation,
    ProcessingInstruction,
    Text,
    Range,
    XMLSerializer,
    DOMParser;



/*
 * Envjs dom.1.2.35 
 * Pure JavaScript Browser Environment
 * By John Resig <http://ejohn.org/> and the Envjs Team
 * Copyright 2008-2010 John Resig, under the MIT License
 */

//CLOSURE_START
(function(){





/**
 * @author john resig
 */
// Helper method for extending one object with another.
function __extend__(a,b) {
    for ( var i in b ) {
        var g = b.__lookupGetter__(i), s = b.__lookupSetter__(i);
        if ( g || s ) {
            if ( g ) { a.__defineGetter__(i, g); }
            if ( s ) { a.__defineSetter__(i, s); }
        } else {
            a[i] = b[i];
        }
    } return a;
}

/**
 * @author john resig
 */
//from jQuery
function __setArray__( target, array ) {
    // Resetting the length to 0, then using the native Array push
    // is a super-fast way to populate an object with array-like properties
    target.length = 0;
    Array.prototype.push.apply( target, array );
}

/**
 * @class  NodeList -
 *      provides the abstraction of an ordered collection of nodes
 *
 * @param  ownerDocument : Document - the ownerDocument
 * @param  parentNode    : Node - the node that the NodeList is attached to (or null)
 */
NodeList = function(ownerDocument, parentNode) {
    this.length = 0;
    this.parentNode = parentNode;
    this.ownerDocument = ownerDocument;
    this._readonly = false;
    __setArray__(this, []);
};

__extend__(NodeList.prototype, {
    item : function(index) {
        var ret = null;
        if ((index >= 0) && (index < this.length)) {
            // bounds check
            ret = this[index];
        }
        // if the index is out of bounds, default value null is returned
        return ret;
    },
    get xml() {
        var ret = "",
            i;

        // create string containing the concatenation of the string values of each child
        for (i=0; i < this.length; i++) {
            if(this[i]){
                if(this[i].nodeType == Node.TEXT_NODE && i>0 &&
                   this[i-1].nodeType == Node.TEXT_NODE){
                    //add a single space between adjacent text nodes
                    ret += " "+this[i].xml;
                }else{
                    ret += this[i].xml;
                }
            }
        }
        return ret;
    },
    toArray: function () {
        var children = [],
            i;
        for ( i=0; i < this.length; i++) {
            children.push (this[i]);
        }
        return children;
    },
    toString: function(){
        return "[object NodeList]";
    }
});


/**
 * @method __findItemIndex__
 *      find the item index of the node
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  node : Node
 * @return : int
 */
var __findItemIndex__ = function (nodelist, node) {
    var ret = -1, i;
    for (i=0; i<nodelist.length; i++) {
        // compare id to each node's _id
        if (nodelist[i] === node) {
            // found it!
            ret = i;
            break;
        }
    }
    // if node is not found, default value -1 is returned
    return ret;
};

/**
 * @method __insertBefore__
 *      insert the specified Node into the NodeList before the specified index
 *      Used by Node.insertBefore(). Note: Node.insertBefore() is responsible
 *      for Node Pointer surgery __insertBefore__ simply modifies the internal
 *      data structure (Array).
 * @param  newChild      : Node - the Node to be inserted
 * @param  refChildIndex : int     - the array index to insert the Node before
 */
var __insertBefore__ = function(nodelist, newChild, refChildIndex) {
    if ((refChildIndex >= 0) && (refChildIndex <= nodelist.length)) {
        // bounds check
        if (newChild.nodeType == Node.DOCUMENT_FRAGMENT_NODE) {
            // node is a DocumentFragment
            // append the children of DocumentFragment
            Array.prototype.splice.apply(nodelist,
                [refChildIndex, 0].concat(newChild.childNodes.toArray()));
        }
        else {
            // append the newChild
            Array.prototype.splice.apply(nodelist,[refChildIndex, 0, newChild]);
        }
    }
};

/**
 * @method __replaceChild__
 *      replace the specified Node in the NodeList at the specified index
 *      Used by Node.replaceChild(). Note: Node.replaceChild() is responsible
 *      for Node Pointer surgery __replaceChild__ simply modifies the internal
 *      data structure (Array).
 *
 * @param  newChild      : Node - the Node to be inserted
 * @param  refChildIndex : int     - the array index to hold the Node
 */
var __replaceChild__ = function(nodelist, newChild, refChildIndex) {
    var ret = null;

    // bounds check
    if ((refChildIndex >= 0) && (refChildIndex < nodelist.length)) {
        // preserve old child for return
        ret = nodelist[refChildIndex];

        if (newChild.nodeType == Node.DOCUMENT_FRAGMENT_NODE) {
            // node is a DocumentFragment
            // get array containing children prior to refChild
            Array.prototype.splice.apply(nodelist,
                [refChildIndex, 1].concat(newChild.childNodes.toArray()));
        }
        else {
            // simply replace node in array (links between Nodes are
            // made at higher level)
            nodelist[refChildIndex] = newChild;
        }
    }
    // return replaced node
    return ret;
};

/**
 * @method __removeChild__
 *      remove the specified Node in the NodeList at the specified index
 *      Used by Node.removeChild(). Note: Node.removeChild() is responsible
 *      for Node Pointer surgery __removeChild__ simply modifies the internal
 *      data structure (Array).
 * @param  refChildIndex : int - the array index holding the Node to be removed
 */
var __removeChild__ = function(nodelist, refChildIndex) {
    var ret = null;

    if (refChildIndex > -1) {
        // found it!
        // return removed node
        ret = nodelist[refChildIndex];

        // rebuild array without removed child
        Array.prototype.splice.apply(nodelist,[refChildIndex, 1]);
    }
    // return removed node
    return ret;
};

/**
 * @method __appendChild__
 *      append the specified Node to the NodeList. Used by Node.appendChild().
 *      Note: Node.appendChild() is responsible for Node Pointer surgery
 *      __appendChild__ simply modifies the internal data structure (Array).
 * @param  newChild      : Node - the Node to be inserted
 */
var __appendChild__ = function(nodelist, newChild) {
    if (newChild.nodeType == Node.DOCUMENT_FRAGMENT_NODE) {
        // node is a DocumentFragment
        // append the children of DocumentFragment
        Array.prototype.push.apply(nodelist, newChild.childNodes.toArray() );
    } else {
        // simply add node to array (links between Nodes are made at higher level)
        Array.prototype.push.apply(nodelist, [newChild]);
    }

};

/**
 * @method __cloneNodes__ -
 *      Returns a NodeList containing clones of the Nodes in this NodeList
 * @param  deep : boolean -
 *      If true, recursively clone the subtree under each of the nodes;
 *      if false, clone only the nodes themselves (and their attributes,
 *      if it is an Element).
 * @param  parentNode : Node - the new parent of the cloned NodeList
 * @return : NodeList - NodeList containing clones of the Nodes in this NodeList
 */
var __cloneNodes__ = function(nodelist, deep, parentNode) {
    var cloneNodeList = new NodeList(nodelist.ownerDocument, parentNode);

    // create list containing clones of each child
    for (var i=0; i < nodelist.length; i++) {
        __appendChild__(cloneNodeList, nodelist[i].cloneNode(deep));
    }

    return cloneNodeList;
};


var __ownerDocument__ = function(node){
    return (node.nodeType == Node.DOCUMENT_NODE)?node:node.ownerDocument;
};

/**
 * @class  Node -
 *      The Node interface is the primary datatype for the entire
 *      Document Object Model. It represents a single node in the
 *      document tree.
 * @param  ownerDocument : Document - The Document object associated with this node.
 */

Node = function(ownerDocument) {
    this.baseURI = 'about:blank';
    this.namespaceURI = null;
    this.nodeName = "";
    this.nodeValue = null;

    // A NodeList that contains all children of this node. If there are no
    // children, this is a NodeList containing no nodes.  The content of the
    // returned NodeList is "live" in the sense that, for instance, changes to
    // the children of the node object that it was created from are immediately
    // reflected in the nodes returned by the NodeList accessors; it is not a
    // static snapshot of the content of the node. This is true for every
    // NodeList, including the ones returned by the getElementsByTagName method.
    this.childNodes      = new NodeList(ownerDocument, this);

    // The first child of this node. If there is no such node, this is null
    this.firstChild      = null;
    // The last child of this node. If there is no such node, this is null.
    this.lastChild       = null;
    // The node immediately preceding this node. If there is no such node,
    // this is null.
    this.previousSibling = null;
    // The node immediately following this node. If there is no such node,
    // this is null.
    this.nextSibling     = null;

    this.attributes = null;
    // The namespaces in scope for this node
    this._namespaces = new NamespaceNodeMap(ownerDocument, this);
    this._readonly = false;

    //IMPORTANT: These must come last so rhino will not iterate parent
    //           properties before child properties.  (qunit.equiv issue)

    // The parent of this node. All nodes, except Document, DocumentFragment,
    // and Attr may have a parent.  However, if a node has just been created
    // and not yet added to the tree, or if it has been removed from the tree,
    // this is null
    this.parentNode      = null;
    // The Document object associated with this node
    this.ownerDocument = ownerDocument;

};

// nodeType constants
Node.ELEMENT_NODE                = 1;
Node.ATTRIBUTE_NODE              = 2;
Node.TEXT_NODE                   = 3;
Node.CDATA_SECTION_NODE          = 4;
Node.ENTITY_REFERENCE_NODE       = 5;
Node.ENTITY_NODE                 = 6;
Node.PROCESSING_INSTRUCTION_NODE = 7;
Node.COMMENT_NODE                = 8;
Node.DOCUMENT_NODE               = 9;
Node.DOCUMENT_TYPE_NODE          = 10;
Node.DOCUMENT_FRAGMENT_NODE      = 11;
Node.NOTATION_NODE               = 12;
Node.NAMESPACE_NODE              = 13;

Node.DOCUMENT_POSITION_EQUAL        = 0x00;
Node.DOCUMENT_POSITION_DISCONNECTED = 0x01;
Node.DOCUMENT_POSITION_PRECEDING    = 0x02;
Node.DOCUMENT_POSITION_FOLLOWING    = 0x04;
Node.DOCUMENT_POSITION_CONTAINS     = 0x08;
Node.DOCUMENT_POSITION_CONTAINED_BY = 0x10;
Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC      = 0x20;


__extend__(Node.prototype, {
    get localName(){
        return this.prefix?
            this.nodeName.substring(this.prefix.length+1, this.nodeName.length):
            this.nodeName;
    },
    get prefix(){
        return this.nodeName.split(':').length>1?
            this.nodeName.split(':')[0]:
            null;
    },
    set prefix(value){
        if(value === null){
            this.nodeName = this.localName;
        }else{
            this.nodeName = value+':'+this.localName;
        }
    },
    hasAttributes : function() {
        if (this.attributes.length == 0) {
            return false;
        }else{
            return true;
        }
    },
    get textContent(){
        return __recursivelyGatherText__(this);
    },
    set textContent(newText){
        while(this.firstChild != null){
            this.removeChild( this.firstChild );
        }
        var text = this.ownerDocument.createTextNode(newText);
        this.appendChild(text);
    },
    insertBefore : function(newChild, refChild) {
        var prevNode;

        if(newChild==null){
            return newChild;
        }
        if(refChild==null){
            this.appendChild(newChild);
            return this.newChild;
        }

        // test for exceptions
        if (__ownerDocument__(this).implementation.errorChecking) {
            // throw Exception if Node is readonly
            if (this._readonly) {
                throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
            }

            // throw Exception if newChild was not created by this Document
            if (__ownerDocument__(this) != __ownerDocument__(newChild)) {
                throw(new DOMException(DOMException.WRONG_DOCUMENT_ERR));
            }

            // throw Exception if the node is an ancestor
            if (__isAncestor__(this, newChild)) {
                throw(new DOMException(DOMException.HIERARCHY_REQUEST_ERR));
            }
        }

        // if refChild is specified, insert before it
        if (refChild) {
            // find index of refChild
            var itemIndex = __findItemIndex__(this.childNodes, refChild);
            // throw Exception if there is no child node with this id
            if (__ownerDocument__(this).implementation.errorChecking && (itemIndex < 0)) {
                throw(new DOMException(DOMException.NOT_FOUND_ERR));
            }

            // if the newChild is already in the tree,
            var newChildParent = newChild.parentNode;
            if (newChildParent) {
                // remove it
                newChildParent.removeChild(newChild);
            }

            // insert newChild into childNodes
            __insertBefore__(this.childNodes, newChild, itemIndex);

            // do node pointer surgery
            prevNode = refChild.previousSibling;

            // handle DocumentFragment
            if (newChild.nodeType == Node.DOCUMENT_FRAGMENT_NODE) {
                if (newChild.childNodes.length > 0) {
                    // set the parentNode of DocumentFragment's children
                    for (var ind = 0; ind < newChild.childNodes.length; ind++) {
                        newChild.childNodes[ind].parentNode = this;
                    }

                    // link refChild to last child of DocumentFragment
                    refChild.previousSibling = newChild.childNodes[newChild.childNodes.length-1];
                }
            }else {
                // set the parentNode of the newChild
                newChild.parentNode = this;
                // link refChild to newChild
                refChild.previousSibling = newChild;
            }

        }else {
            // otherwise, append to end
            prevNode = this.lastChild;
            this.appendChild(newChild);
        }

        if (newChild.nodeType == Node.DOCUMENT_FRAGMENT_NODE) {
            // do node pointer surgery for DocumentFragment
            if (newChild.childNodes.length > 0) {
                if (prevNode) {
                    prevNode.nextSibling = newChild.childNodes[0];
                }else {
                    // this is the first child in the list
                    this.firstChild = newChild.childNodes[0];
                }
                newChild.childNodes[0].previousSibling = prevNode;
                newChild.childNodes[newChild.childNodes.length-1].nextSibling = refChild;
            }
        }else {
            // do node pointer surgery for newChild
            if (prevNode) {
                prevNode.nextSibling = newChild;
            }else {
                // this is the first child in the list
                this.firstChild = newChild;
            }
            newChild.previousSibling = prevNode;
            newChild.nextSibling     = refChild;
        }

        return newChild;
    },
    replaceChild : function(newChild, oldChild) {
        var ret = null;

        if(newChild==null || oldChild==null){
            return oldChild;
        }

        // test for exceptions
        if (__ownerDocument__(this).implementation.errorChecking) {
            // throw Exception if Node is readonly
            if (this._readonly) {
                throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
            }

            // throw Exception if newChild was not created by this Document
            if (__ownerDocument__(this) != __ownerDocument__(newChild)) {
                throw(new DOMException(DOMException.WRONG_DOCUMENT_ERR));
            }

            // throw Exception if the node is an ancestor
            if (__isAncestor__(this, newChild)) {
                throw(new DOMException(DOMException.HIERARCHY_REQUEST_ERR));
            }
        }

        // get index of oldChild
        var index = __findItemIndex__(this.childNodes, oldChild);

        // throw Exception if there is no child node with this id
        if (__ownerDocument__(this).implementation.errorChecking && (index < 0)) {
            throw(new DOMException(DOMException.NOT_FOUND_ERR));
        }

        // if the newChild is already in the tree,
        var newChildParent = newChild.parentNode;
        if (newChildParent) {
            // remove it
            newChildParent.removeChild(newChild);
        }

        // add newChild to childNodes
        ret = __replaceChild__(this.childNodes,newChild, index);


        if (newChild.nodeType == Node.DOCUMENT_FRAGMENT_NODE) {
            // do node pointer surgery for Document Fragment
            if (newChild.childNodes.length > 0) {
                for (var ind = 0; ind < newChild.childNodes.length; ind++) {
                    newChild.childNodes[ind].parentNode = this;
                }

                if (oldChild.previousSibling) {
                    oldChild.previousSibling.nextSibling = newChild.childNodes[0];
                } else {
                    this.firstChild = newChild.childNodes[0];
                }

                if (oldChild.nextSibling) {
                    oldChild.nextSibling.previousSibling = newChild;
                } else {
                    this.lastChild = newChild.childNodes[newChild.childNodes.length-1];
                }

                newChild.childNodes[0].previousSibling = oldChild.previousSibling;
                newChild.childNodes[newChild.childNodes.length-1].nextSibling = oldChild.nextSibling;
            }
        } else {
            // do node pointer surgery for newChild
            newChild.parentNode = this;

            if (oldChild.previousSibling) {
                oldChild.previousSibling.nextSibling = newChild;
            }else{
                this.firstChild = newChild;
            }
            if (oldChild.nextSibling) {
                oldChild.nextSibling.previousSibling = newChild;
            }else{
                this.lastChild = newChild;
            }
            newChild.previousSibling = oldChild.previousSibling;
            newChild.nextSibling = oldChild.nextSibling;
        }

        return ret;
    },
    removeChild : function(oldChild) {
        if(!oldChild){
            return null;
        }
        // throw Exception if NamedNodeMap is readonly
        if (__ownerDocument__(this).implementation.errorChecking &&
            (this._readonly || oldChild._readonly)) {
            throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
        }

        // get index of oldChild
        var itemIndex = __findItemIndex__(this.childNodes, oldChild);

        // throw Exception if there is no child node with this id
        if (__ownerDocument__(this).implementation.errorChecking && (itemIndex < 0)) {
            throw(new DOMException(DOMException.NOT_FOUND_ERR));
        }

        // remove oldChild from childNodes
        __removeChild__(this.childNodes, itemIndex);

        // do node pointer surgery
        oldChild.parentNode = null;

        if (oldChild.previousSibling) {
            oldChild.previousSibling.nextSibling = oldChild.nextSibling;
        }else {
            this.firstChild = oldChild.nextSibling;
        }
        if (oldChild.nextSibling) {
            oldChild.nextSibling.previousSibling = oldChild.previousSibling;
        }else {
            this.lastChild = oldChild.previousSibling;
        }

        oldChild.previousSibling = null;
        oldChild.nextSibling = null;

        return oldChild;
    },
    appendChild : function(newChild) {
        if(!newChild){
            return null;
        }
        // test for exceptions
        if (__ownerDocument__(this).implementation.errorChecking) {
            // throw Exception if Node is readonly
            if (this._readonly) {
                throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
            }

            // throw Exception if arg was not created by this Document
            if (__ownerDocument__(this) != __ownerDocument__(this)) {
                throw(new DOMException(DOMException.WRONG_DOCUMENT_ERR));
            }

            // throw Exception if the node is an ancestor
            if (__isAncestor__(this, newChild)) {
              throw(new DOMException(DOMException.HIERARCHY_REQUEST_ERR));
            }
        }

        // if the newChild is already in the tree,
        var newChildParent = newChild.parentNode;
        if (newChildParent) {
            // remove it
           //console.debug('removing node %s', newChild);
            newChildParent.removeChild(newChild);
        }

        // add newChild to childNodes
        __appendChild__(this.childNodes, newChild);

        if (newChild.nodeType == Node.DOCUMENT_FRAGMENT_NODE) {
            // do node pointer surgery for DocumentFragment
            if (newChild.childNodes.length > 0) {
                for (var ind = 0; ind < newChild.childNodes.length; ind++) {
                    newChild.childNodes[ind].parentNode = this;
                }

                if (this.lastChild) {
                    this.lastChild.nextSibling = newChild.childNodes[0];
                    newChild.childNodes[0].previousSibling = this.lastChild;
                    this.lastChild = newChild.childNodes[newChild.childNodes.length-1];
                } else {
                    this.lastChild = newChild.childNodes[newChild.childNodes.length-1];
                    this.firstChild = newChild.childNodes[0];
                }
            }
        } else {
            // do node pointer surgery for newChild
            newChild.parentNode = this;
            if (this.lastChild) {
                this.lastChild.nextSibling = newChild;
                newChild.previousSibling = this.lastChild;
                this.lastChild = newChild;
            } else {
                this.lastChild = newChild;
                this.firstChild = newChild;
            }
       }
       return newChild;
    },
    hasChildNodes : function() {
        return (this.childNodes.length > 0);
    },
    cloneNode: function(deep) {
        // use importNode to clone this Node
        //do not throw any exceptions
        try {
            return __ownerDocument__(this).importNode(this, deep);
        } catch (e) {
            //there shouldn't be any exceptions, but if there are, return null
            // may want to warn: $debug("could not clone node: "+e.code);
            return null;
        }
    },
    normalize : function() {
        var i;
        var inode;
        var nodesToRemove = new NodeList();

        if (this.nodeType == Node.ELEMENT_NODE || this.nodeType == Node.DOCUMENT_NODE) {
            var adjacentTextNode = null;

            // loop through all childNodes
            for(i = 0; i < this.childNodes.length; i++) {
                inode = this.childNodes.item(i);

                if (inode.nodeType == Node.TEXT_NODE) {
                    // this node is a text node
                    if (inode.length < 1) {
                        // this text node is empty
                        // add this node to the list of nodes to be remove
                        __appendChild__(nodesToRemove, inode);
                    }else {
                        if (adjacentTextNode) {
                            // previous node was also text
                            adjacentTextNode.appendData(inode.data);
                            // merge the data in adjacent text nodes
                            // add this node to the list of nodes to be removed
                            __appendChild__(nodesToRemove, inode);
                        } else {
                            // remember this node for next cycle
                            adjacentTextNode = inode;
                        }
                    }
                } else {
                    // (soon to be) previous node is not a text node
                    adjacentTextNode = null;
                    // normalize non Text childNodes
                    inode.normalize();
                }
            }

            // remove redundant Text Nodes
            for(i = 0; i < nodesToRemove.length; i++) {
                inode = nodesToRemove.item(i);
                inode.parentNode.removeChild(inode);
            }
        }
    },
    isSupported : function(feature, version) {
        // use Implementation.hasFeature to determine if this feature is supported
        return __ownerDocument__(this).implementation.hasFeature(feature, version);
    },
    getElementsByTagName : function(tagname) {
        // delegate to _getElementsByTagNameRecursive
        // recurse childNodes
        var nodelist = new NodeList(__ownerDocument__(this));
        for (var i = 0; i < this.childNodes.length; i++) {
            __getElementsByTagNameRecursive__(this.childNodes.item(i),
                                              tagname,
                                              nodelist);
        }
        return nodelist;
    },
    getElementsByTagNameNS : function(namespaceURI, localName) {
        // delegate to _getElementsByTagNameNSRecursive
        return __getElementsByTagNameNSRecursive__(this, namespaceURI, localName,
            new NodeList(__ownerDocument__(this)));
    },
    importNode : function(importedNode, deep) {
        var i;
        var importNode;

        //there is no need to perform namespace checks since everything has already gone through them
        //in order to have gotten into the DOM in the first place. The following line
        //turns namespace checking off in ._isValidNamespace
        __ownerDocument__(this).importing = true;

        if (importedNode.nodeType == Node.ELEMENT_NODE) {
            if (!__ownerDocument__(this).implementation.namespaceAware) {
                // create a local Element (with the name of the importedNode)
                importNode = __ownerDocument__(this).createElement(importedNode.tagName);

                // create attributes matching those of the importedNode
                for(i = 0; i < importedNode.attributes.length; i++) {
                    importNode.setAttribute(importedNode.attributes.item(i).name, importedNode.attributes.item(i).value);
                }
            } else {
                // create a local Element (with the name & namespaceURI of the importedNode)
                importNode = __ownerDocument__(this).createElementNS(importedNode.namespaceURI, importedNode.nodeName);

                // create attributes matching those of the importedNode
                for(i = 0; i < importedNode.attributes.length; i++) {
                    importNode.setAttributeNS(importedNode.attributes.item(i).namespaceURI,
                        importedNode.attributes.item(i).name, importedNode.attributes.item(i).value);
                }

                // create namespace definitions matching those of the importedNode
                for(i = 0; i < importedNode._namespaces.length; i++) {
                    importNode._namespaces[i] = __ownerDocument__(this).createNamespace(importedNode._namespaces.item(i).localName);
                    importNode._namespaces[i].value = importedNode._namespaces.item(i).value;
                }
            }
        } else if (importedNode.nodeType == Node.ATTRIBUTE_NODE) {
            if (!__ownerDocument__(this).implementation.namespaceAware) {
                // create a local Attribute (with the name of the importedAttribute)
                importNode = __ownerDocument__(this).createAttribute(importedNode.name);
            } else {
                // create a local Attribute (with the name & namespaceURI of the importedAttribute)
                importNode = __ownerDocument__(this).createAttributeNS(importedNode.namespaceURI, importedNode.nodeName);

                // create namespace definitions matching those of the importedAttribute
                for(i = 0; i < importedNode._namespaces.length; i++) {
                    importNode._namespaces[i] = __ownerDocument__(this).createNamespace(importedNode._namespaces.item(i).localName);
                    importNode._namespaces[i].value = importedNode._namespaces.item(i).value;
                }
            }

            // set the value of the local Attribute to match that of the importedAttribute
            importNode.value = importedNode.value;

        } else if (importedNode.nodeType == Node.DOCUMENT_FRAGMENT_NODE) {
            // create a local DocumentFragment
            importNode = __ownerDocument__(this).createDocumentFragment();
        } else if (importedNode.nodeType == Node.NAMESPACE_NODE) {
            // create a local NamespaceNode (with the same name & value as the importedNode)
            importNode = __ownerDocument__(this).createNamespace(importedNode.nodeName);
            importNode.value = importedNode.value;
        } else if (importedNode.nodeType == Node.TEXT_NODE) {
            // create a local TextNode (with the same data as the importedNode)
            importNode = __ownerDocument__(this).createTextNode(importedNode.data);
        } else if (importedNode.nodeType == Node.CDATA_SECTION_NODE) {
            // create a local CDATANode (with the same data as the importedNode)
            importNode = __ownerDocument__(this).createCDATASection(importedNode.data);
        } else if (importedNode.nodeType == Node.PROCESSING_INSTRUCTION_NODE) {
            // create a local ProcessingInstruction (with the same target & data as the importedNode)
            importNode = __ownerDocument__(this).createProcessingInstruction(importedNode.target, importedNode.data);
        } else if (importedNode.nodeType == Node.COMMENT_NODE) {
            // create a local Comment (with the same data as the importedNode)
            importNode = __ownerDocument__(this).createComment(importedNode.data);
        } else {  // throw Exception if nodeType is not supported
            throw(new DOMException(DOMException.NOT_SUPPORTED_ERR));
        }

        if (deep) {
            // recurse childNodes
            for(i = 0; i < importedNode.childNodes.length; i++) {
                importNode.appendChild(__ownerDocument__(this).importNode(importedNode.childNodes.item(i), true));
            }
        }

        //reset importing
        __ownerDocument__(this).importing = false;
        return importNode;

    },
    contains : function(node){
        while(node && node != this ){
            node = node.parentNode;
        }
        return !!node;
    },
    compareDocumentPosition : function(b){
        //console.log("comparing document position %s %s", this, b);
        var i,
            length,
            a = this,
            parent,
            aparents,
            bparents;
        //handle a couple simpler case first
        if(a === b) {
            return Node.DOCUMENT_POSITION_EQUAL;
        }
        if(a.ownerDocument !== b.ownerDocument) {
            return Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC|
               Node.DOCUMENT_POSITION_FOLLOWING|
               Node.DOCUMENT_POSITION_DISCONNECTED;
        }
        if(a.parentNode === b.parentNode){
            length = a.parentNode.childNodes.length;
            for(i=0;i<length;i++){
                if(a.parentNode.childNodes[i] === a){
                    return Node.DOCUMENT_POSITION_FOLLOWING;
                }else if(a.parentNode.childNodes[i] === b){
                    return Node.DOCUMENT_POSITION_PRECEDING;
                }
            }
        }

        if(a.contains(b)) {
            return Node.DOCUMENT_POSITION_CONTAINED_BY|
                   Node.DOCUMENT_POSITION_FOLLOWING;
        }
        if(b.contains(a)) {
            return Node.DOCUMENT_POSITION_CONTAINS|
                   Node.DOCUMENT_POSITION_PRECEDING;
        }
        aparents = [];
        parent = a.parentNode;
        while(parent){
            aparents[aparents.length] = parent;
            parent = parent.parentNode;
        }

        bparents = [];
        parent = b.parentNode;
        while(parent){
            i = aparents.indexOf(parent);
            if(i < 0){
                bparents[bparents.length] = parent;
                parent = parent.parentNode;
            }else{
                //i cant be 0 since we already checked for equal parentNode
                if(bparents.length > aparents.length){
                    return Node.DOCUMENT_POSITION_FOLLOWING;
                }else if(bparents.length < aparents.length){
                    return Node.DOCUMENT_POSITION_PRECEDING;
                }else{
                    //common ancestor diverge point
                    if (i === 0) {
                        return Node.DOCUMENT_POSITION_FOLLOWING;
                    } else {
                        parent = aparents[i-1];
                    }
                    return parent.compareDocumentPosition(bparents.pop());
                }
            }
        }

        return Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC|
               Node.DOCUMENT_POSITION_DISCONNECTED;

    },
    toString : function() {
        return '[object Node]';
    }

});



/**
 * @method __getElementsByTagNameRecursive__ - implements getElementsByTagName()
 * @param  elem     : Element  - The element which are checking and then recursing into
 * @param  tagname  : string      - The name of the tag to match on. The special value "*" matches all tags
 * @param  nodeList : NodeList - The accumulating list of matching nodes
 *
 * @return : NodeList
 */
var __getElementsByTagNameRecursive__ = function (elem, tagname, nodeList) {

    if (elem.nodeType == Node.ELEMENT_NODE || elem.nodeType == Node.DOCUMENT_NODE) {

        if(elem.nodeType !== Node.DOCUMENT_NODE &&
            ((elem.nodeName.toUpperCase() == tagname.toUpperCase()) ||
                (tagname == "*")) ){
            // add matching node to nodeList
            __appendChild__(nodeList, elem);
        }

        // recurse childNodes
        for(var i = 0; i < elem.childNodes.length; i++) {
            nodeList = __getElementsByTagNameRecursive__(elem.childNodes.item(i), tagname, nodeList);
        }
    }

    return nodeList;
};

/**
 * @method __getElementsByTagNameNSRecursive__
 *      implements getElementsByTagName()
 *
 * @param  elem     : Element  - The element which are checking and then recursing into
 * @param  namespaceURI : string - the namespace URI of the required node
 * @param  localName    : string - the local name of the required node
 * @param  nodeList     : NodeList - The accumulating list of matching nodes
 *
 * @return : NodeList
 */
var __getElementsByTagNameNSRecursive__ = function(elem, namespaceURI, localName, nodeList) {
    if (elem.nodeType == Node.ELEMENT_NODE || elem.nodeType == Node.DOCUMENT_NODE) {

        if (((elem.namespaceURI == namespaceURI) || (namespaceURI == "*")) &&
            ((elem.localName == localName) || (localName == "*"))) {
            // add matching node to nodeList
            __appendChild__(nodeList, elem);
        }

        // recurse childNodes
        for(var i = 0; i < elem.childNodes.length; i++) {
            nodeList = __getElementsByTagNameNSRecursive__(
                elem.childNodes.item(i), namespaceURI, localName, nodeList);
        }
    }

    return nodeList;
};

/**
 * @method __isAncestor__ - returns true if node is ancestor of target
 * @param  target         : Node - The node we are using as context
 * @param  node         : Node - The candidate ancestor node
 * @return : boolean
 */
var __isAncestor__ = function(target, node) {
    // if this node matches, return true,
    // otherwise recurse up (if there is a parentNode)
    return ((target == node) || ((target.parentNode) && (__isAncestor__(target.parentNode, node))));
};



var __recursivelyGatherText__ = function(aNode) {
    var accumulateText = "",
        idx,
        node;
    for (idx=0;idx < aNode.childNodes.length;idx++){
        node = aNode.childNodes.item(idx);
        if(node.nodeType == Node.TEXT_NODE)
            accumulateText += node.data;
        else
            accumulateText += __recursivelyGatherText__(node);
    }
    return accumulateText;
};

/**
 * function __escapeXML__
 * @param  str : string - The string to be escaped
 * @return : string - The escaped string
 */
var escAmpRegEx = /&(?!(amp;|lt;|gt;|quot|apos;))/g;
var escLtRegEx = /</g;
var escGtRegEx = />/g;
var quotRegEx = /"/g;
var aposRegEx = /'/g;

function __escapeXML__(str) {
    str = str.replace(escAmpRegEx, "&amp;").
            replace(escLtRegEx, "&lt;").
            replace(escGtRegEx, "&gt;").
            replace(quotRegEx, "&quot;").
            replace(aposRegEx, "&apos;");

    return str;
};

/*
function __escapeHTML5__(str) {
    str = str.replace(escAmpRegEx, "&amp;").
            replace(escLtRegEx, "&lt;").
            replace(escGtRegEx, "&gt;");

    return str;
};
function __escapeHTML5Atribute__(str) {
    str = str.replace(escAmpRegEx, "&amp;").
            replace(escLtRegEx, "&lt;").
            replace(escGtRegEx, "&gt;").
            replace(quotRegEx, "&quot;").
            replace(aposRegEx, "&apos;");

    return str;
};
*/

/**
 * function __unescapeXML__
 * @param  str : string - The string to be unescaped
 * @return : string - The unescaped string
 */
var unescAmpRegEx = /&amp;/g;
var unescLtRegEx = /&lt;/g;
var unescGtRegEx = /&gt;/g;
var unquotRegEx = /&quot;/g;
var unaposRegEx = /&apos;/g;
function __unescapeXML__(str) {
    str = str.replace(unescAmpRegEx, "&").
            replace(unescLtRegEx, "<").
            replace(unescGtRegEx, ">").
            replace(unquotRegEx, "\"").
            replace(unaposRegEx, "'");

    return str;
};

/**
 * @class  NamedNodeMap -
 *      used to represent collections of nodes that can be accessed by name
 *      typically a set of Element attributes
 *
 * @extends NodeList -
 *      note W3C spec says that this is not the case, but we need an item()
 *      method identical to NodeList's, so why not?
 * @param  ownerDocument : Document - the ownerDocument
 * @param  parentNode    : Node - the node that the NamedNodeMap is attached to (or null)
 */
NamedNodeMap = function(ownerDocument, parentNode) {
    NodeList.apply(this, arguments);
    __setArray__(this, []);
};
NamedNodeMap.prototype = new NodeList();
__extend__(NamedNodeMap.prototype, {
    add: function(name){
        this[this.length] = name;
    },
    getNamedItem : function(name) {
        var ret = null;
        //console.log('NamedNodeMap getNamedItem %s', name);
        // test that Named Node exists
        var itemIndex = __findNamedItemIndex__(this, name);

        if (itemIndex > -1) {
            // found it!
            ret = this[itemIndex];
        }
        // if node is not found, default value null is returned
        return ret;
    },
    setNamedItem : function(arg) {
      //console.log('setNamedItem %s', arg);
      // test for exceptions
      if (__ownerDocument__(this).implementation.errorChecking) {
            // throw Exception if arg was not created by this Document
            if (this.ownerDocument != arg.ownerDocument) {
              throw(new DOMException(DOMException.WRONG_DOCUMENT_ERR));
            }

            // throw Exception if DOMNamedNodeMap is readonly
            if (this._readonly || (this.parentNode && this.parentNode._readonly)) {
              throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
            }

            // throw Exception if arg is already an attribute of another Element object
            if (arg.ownerElement && (arg.ownerElement != this.parentNode)) {
              throw(new DOMException(DOMException.INUSE_ATTRIBUTE_ERR));
            }
      }

     //console.log('setNamedItem __findNamedItemIndex__ ');
      // get item index
      var itemIndex = __findNamedItemIndex__(this, arg.name);
      var ret = null;

     //console.log('setNamedItem __findNamedItemIndex__ %s', itemIndex);
      if (itemIndex > -1) {                          // found it!
            ret = this[itemIndex];                // use existing Attribute

            // throw Exception if DOMAttr is readonly
            if (__ownerDocument__(this).implementation.errorChecking && ret._readonly) {
              throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
            } else {
              this[itemIndex] = arg;                // over-write existing NamedNode
              this[arg.name.toLowerCase()] = arg;
            }
      } else {
            // add new NamedNode
           //console.log('setNamedItem add new named node map (by index)');
            Array.prototype.push.apply(this, [arg]);
           //console.log('setNamedItem add new named node map (by name) %s %s', arg, arg.name);
            this[arg.name] = arg;
           //console.log('finsished setNamedItem add new named node map (by name) %s', arg.name);

      }

     //console.log('setNamedItem parentNode');
      arg.ownerElement = this.parentNode;            // update ownerElement
      // return old node or new node
     //console.log('setNamedItem exit');
      return ret;
    },
    removeNamedItem : function(name) {
          var ret = null;
          // test for exceptions
          // throw Exception if NamedNodeMap is readonly
          if (__ownerDocument__(this).implementation.errorChecking &&
                (this._readonly || (this.parentNode && this.parentNode._readonly))) {
              throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
          }

          // get item index
          var itemIndex = __findNamedItemIndex__(this, name);

          // throw Exception if there is no node named name in this map
          if (__ownerDocument__(this).implementation.errorChecking && (itemIndex < 0)) {
            throw(new DOMException(DOMException.NOT_FOUND_ERR));
          }

          // get Node
          var oldNode = this[itemIndex];
          //this[oldNode.name] = undefined;

          // throw Exception if Node is readonly
          if (__ownerDocument__(this).implementation.errorChecking && oldNode._readonly) {
            throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
          }

          // return removed node
          return __removeChild__(this, itemIndex);
    },
    getNamedItemNS : function(namespaceURI, localName) {
        var ret = null;

        // test that Named Node exists
        var itemIndex = __findNamedItemNSIndex__(this, namespaceURI, localName);

        if (itemIndex > -1) {
            // found it! return NamedNode
            ret = this[itemIndex];
        }
        // if node is not found, default value null is returned
        return ret;
    },
    setNamedItemNS : function(arg) {
        //console.log('setNamedItemNS %s', arg);
        // test for exceptions
        if (__ownerDocument__(this).implementation.errorChecking) {
            // throw Exception if NamedNodeMap is readonly
            if (this._readonly || (this.parentNode && this.parentNode._readonly)) {
                throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
            }

            // throw Exception if arg was not created by this Document
            if (__ownerDocument__(this) != __ownerDocument__(arg)) {
                throw(new DOMException(DOMException.WRONG_DOCUMENT_ERR));
            }

            // throw Exception if arg is already an attribute of another Element object
            if (arg.ownerElement && (arg.ownerElement != this.parentNode)) {
                throw(new DOMException(DOMException.INUSE_ATTRIBUTE_ERR));
            }
        }

        // get item index
        var itemIndex = __findNamedItemNSIndex__(this, arg.namespaceURI, arg.localName);
        var ret = null;

        if (itemIndex > -1) {
            // found it!
            // use existing Attribute
            ret = this[itemIndex];
            // throw Exception if Attr is readonly
            if (__ownerDocument__(this).implementation.errorChecking && ret._readonly) {
                throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
            } else {
                // over-write existing NamedNode
                this[itemIndex] = arg;
            }
        }else {
            // add new NamedNode
            Array.prototype.push.apply(this, [arg]);
        }
        arg.ownerElement = this.parentNode;

        // return old node or null
        return ret;
        //console.log('finished setNamedItemNS %s', arg);
    },
    removeNamedItemNS : function(namespaceURI, localName) {
          var ret = null;

          // test for exceptions
          // throw Exception if NamedNodeMap is readonly
          if (__ownerDocument__(this).implementation.errorChecking && (this._readonly || (this.parentNode && this.parentNode._readonly))) {
            throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
          }

          // get item index
          var itemIndex = __findNamedItemNSIndex__(this, namespaceURI, localName);

          // throw Exception if there is no matching node in this map
          if (__ownerDocument__(this).implementation.errorChecking && (itemIndex < 0)) {
            throw(new DOMException(DOMException.NOT_FOUND_ERR));
          }

          // get Node
          var oldNode = this[itemIndex];

          // throw Exception if Node is readonly
          if (__ownerDocument__(this).implementation.errorChecking && oldNode._readonly) {
            throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
          }

          return __removeChild__(this, itemIndex);             // return removed node
    },
    get xml() {
          var ret = "";

          // create string containing concatenation of all (but last) Attribute string values (separated by spaces)
          for (var i=0; i < this.length -1; i++) {
            ret += this[i].xml +" ";
          }

          // add last Attribute to string (without trailing space)
          if (this.length > 0) {
            ret += this[this.length -1].xml;
          }

          return ret;
    },
    toString : function(){
        return "[object NamedNodeMap]";
    }

});

/**
 * @method __findNamedItemIndex__
 *      find the item index of the node with the specified name
 *
 * @param  name : string - the name of the required node
 * @param  isnsmap : if its a NamespaceNodeMap
 * @return : int
 */
var __findNamedItemIndex__ = function(namednodemap, name, isnsmap) {
    var ret = -1;
    // loop through all nodes
    for (var i=0; i<namednodemap.length; i++) {
        // compare name to each node's nodeName
        if(namednodemap[i].localName && name && isnsmap){
            if (namednodemap[i].localName.toLowerCase() == name.toLowerCase()) {
                // found it!
                ret = i;
                break;
            }
        }else{
            if(namednodemap[i].name && name){
                if (namednodemap[i].name.toLowerCase() == name.toLowerCase()) {
                    // found it!
                    ret = i;
                    break;
                }
            }
        }
    }
    // if node is not found, default value -1 is returned
    return ret;
};

/**
 * @method __findNamedItemNSIndex__
 *      find the item index of the node with the specified
 *      namespaceURI and localName
 *
 * @param  namespaceURI : string - the namespace URI of the required node
 * @param  localName    : string - the local name of the required node
 * @return : int
 */
var __findNamedItemNSIndex__ = function(namednodemap, namespaceURI, localName) {
    var ret = -1;
    // test that localName is not null
    if (localName) {
        // loop through all nodes
        for (var i=0; i<namednodemap.length; i++) {
            if(namednodemap[i].namespaceURI && namednodemap[i].localName){
                // compare name to each node's namespaceURI and localName
                if ((namednodemap[i].namespaceURI.toLowerCase() == namespaceURI.toLowerCase()) &&
                    (namednodemap[i].localName.toLowerCase() == localName.toLowerCase())) {
                    // found it!
                    ret = i;
                    break;
                }
            }
        }
    }
    // if node is not found, default value -1 is returned
    return ret;
};

/**
 * @method __hasAttribute__
 *      Returns true if specified node exists
 *
 * @param  name : string - the name of the required node
 * @return : boolean
 */
var __hasAttribute__ = function(namednodemap, name) {
    var ret = false;
    // test that Named Node exists
    var itemIndex = __findNamedItemIndex__(namednodemap, name);
        if (itemIndex > -1) {
        // found it!
        ret = true;
    }
    // if node is not found, default value false is returned
    return ret;
}

/**
 * @method __hasAttributeNS__
 *      Returns true if specified node exists
 *
 * @param  namespaceURI : string - the namespace URI of the required node
 * @param  localName    : string - the local name of the required node
 * @return : boolean
 */
var __hasAttributeNS__ = function(namednodemap, namespaceURI, localName) {
    var ret = false;
    // test that Named Node exists
    var itemIndex = __findNamedItemNSIndex__(namednodemap, namespaceURI, localName);
    if (itemIndex > -1) {
        // found it!
        ret = true;
    }
    // if node is not found, default value false is returned
    return ret;
}

/**
 * @method __cloneNamedNodes__
 *      Returns a NamedNodeMap containing clones of the Nodes in this NamedNodeMap
 *
 * @param  parentNode : Node - the new parent of the cloned NodeList
 * @param  isnsmap : bool - is this a NamespaceNodeMap
 * @return NamedNodeMap containing clones of the Nodes in this NamedNodeMap
 */
var __cloneNamedNodes__ = function(namednodemap, parentNode, isnsmap) {
    var cloneNamedNodeMap = isnsmap?
        new NamespaceNodeMap(namednodemap.ownerDocument, parentNode):
        new NamedNodeMap(namednodemap.ownerDocument, parentNode);

    // create list containing clones of all children
    for (var i=0; i < namednodemap.length; i++) {
        __appendChild__(cloneNamedNodeMap, namednodemap[i].cloneNode(false));
    }

    return cloneNamedNodeMap;
};


/**
 * @class  NamespaceNodeMap -
 *      used to represent collections of namespace nodes that can be
 *      accessed by name typically a set of Element attributes
 *
 * @extends NamedNodeMap
 *
 * @param  ownerDocument : Document - the ownerDocument
 * @param  parentNode    : Node - the node that the NamespaceNodeMap is attached to (or null)
 */
var NamespaceNodeMap = function(ownerDocument, parentNode) {
    this.NamedNodeMap = NamedNodeMap;
    this.NamedNodeMap(ownerDocument, parentNode);
    __setArray__(this, []);
};
NamespaceNodeMap.prototype = new NamedNodeMap();
__extend__(NamespaceNodeMap.prototype, {
    get xml() {
        var ret = "",
            ns,
            ind;
        // identify namespaces declared local to this Element (ie, not inherited)
        for (ind = 0; ind < this.length; ind++) {
            // if namespace declaration does not exist in the containing node's, parentNode's namespaces
            ns = null;
            try {
                var ns = this.parentNode.parentNode._namespaces.
                    getNamedItem(this[ind].localName);
            }catch (e) {
                //breaking to prevent default namespace being inserted into return value
                break;
            }
            if (!(ns && (""+ ns.nodeValue == ""+ this[ind].nodeValue))) {
                // display the namespace declaration
                ret += this[ind].xml +" ";
            }
        }
        return ret;
    }
});

/**
 * @class  Namespace -
 *      The Namespace interface represents an namespace in an Element object
 *
 * @param  ownerDocument : The Document object associated with this node.
 */
Namespace = function(ownerDocument) {
    Node.apply(this, arguments);
    // the name of this attribute
    this.name      = "";

    // If this attribute was explicitly given a value in the original document,
    // this is true; otherwise, it is false.
    // Note that the implementation is in charge of this attribute, not the user.
    // If the user changes the value of the attribute (even if it ends up having
    // the same value as the default value) then the specified flag is
    // automatically flipped to true
    this.specified = false;
};
Namespace.prototype = new Node();
__extend__(Namespace.prototype, {
    get value(){
        // the value of the attribute is returned as a string
        return this.nodeValue;
    },
    set value(value){
        this.nodeValue = value+'';
    },
    get nodeType(){
        return Node.NAMESPACE_NODE;
    },
    get xml(){
        var ret = "";

          // serialize Namespace Declaration
          if (this.nodeName != "") {
            ret += this.nodeName +"=\""+ __escapeXML__(this.nodeValue) +"\"";
          }
          else {  // handle default namespace
            ret += "xmlns=\""+ __escapeXML__(this.nodeValue) +"\"";
          }

          return ret;
    },
    toString: function(){
        return '[object Namespace]';
    }
});


/**
 * @class  CharacterData - parent abstract class for Text and Comment
 * @extends Node
 * @param  ownerDocument : The Document object associated with this node.
 */
CharacterData = function(ownerDocument) {
    Node.apply(this, arguments);
};
CharacterData.prototype = new Node();
__extend__(CharacterData.prototype,{
    get data(){
        return this.nodeValue;
    },
    set data(data){
        this.nodeValue = data;
    },
    get textContent(){
        return this.nodeValue;
    },
    set textContent(newText){
        this.nodeValue = newText;
    },
    get length(){return this.nodeValue.length;},
    appendData: function(arg){
        // throw Exception if CharacterData is readonly
        if (__ownerDocument__(this).implementation.errorChecking && this._readonly) {
            throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
        }
        // append data
        this.data = "" + this.data + arg;
    },
    deleteData: function(offset, count){
        // throw Exception if CharacterData is readonly
        if (__ownerDocument__(this).implementation.errorChecking && this._readonly) {
            throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
        }
        if (this.data) {
            // throw Exception if offset is negative or greater than the data length,
            if (__ownerDocument__(this).implementation.errorChecking &&
                ((offset < 0) || (offset >  this.data.length) || (count < 0))) {
                throw(new DOMException(DOMException.INDEX_SIZE_ERR));
            }

            // delete data
            if(!count || (offset + count) > this.data.length) {
              this.data = this.data.substring(0, offset);
            }else {
              this.data = this.data.substring(0, offset).
                concat(this.data.substring(offset + count));
            }
        }
    },
    insertData: function(offset, arg){
        // throw Exception if CharacterData is readonly
        if(__ownerDocument__(this).implementation.errorChecking && this._readonly){
            throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
        }

        if(this.data){
            // throw Exception if offset is negative or greater than the data length,
            if (__ownerDocument__(this).implementation.errorChecking &&
                ((offset < 0) || (offset >  this.data.length))) {
                throw(new DOMException(DOMException.INDEX_SIZE_ERR));
            }

            // insert data
            this.data =  this.data.substring(0, offset).concat(arg, this.data.substring(offset));
        }else {
            // throw Exception if offset is negative or greater than the data length,
            if (__ownerDocument__(this).implementation.errorChecking && (offset !== 0)) {
               throw(new DOMException(DOMException.INDEX_SIZE_ERR));
            }

            // set data
            this.data = arg;
        }
    },
    replaceData: function(offset, count, arg){
        // throw Exception if CharacterData is readonly
        if (__ownerDocument__(this).implementation.errorChecking && this._readonly) {
            throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
        }

        if (this.data) {
            // throw Exception if offset is negative or greater than the data length,
            if (__ownerDocument__(this).implementation.errorChecking &&
                ((offset < 0) || (offset >  this.data.length) || (count < 0))) {
                throw(new DOMException(DOMException.INDEX_SIZE_ERR));
            }

            // replace data
            this.data = this.data.substring(0, offset).
                concat(arg, this.data.substring(offset + count));
        }else {
            // set data
            this.data = arg;
        }
    },
    substringData: function(offset, count){
        var ret = null;
        if (this.data) {
            // throw Exception if offset is negative or greater than the data length,
            // or the count is negative
            if (__ownerDocument__(this).implementation.errorChecking &&
                ((offset < 0) || (offset > this.data.length) || (count < 0))) {
                throw(new DOMException(DOMException.INDEX_SIZE_ERR));
            }
            // if count is not specified
            if (!count) {
                ret = this.data.substring(offset); // default to 'end of string'
            }else{
                ret = this.data.substring(offset, offset + count);
            }
        }
        return ret;
    },
    toString : function(){
        return "[object CharacterData]";
    }
});

/**
 * @class  Text
 *      The Text interface represents the textual content (termed
 *      character data in XML) of an Element or Attr.
 *      If there is no markup inside an element's content, the text is
 *      contained in a single object implementing the Text interface that
 *      is the only child of the element. If there is markup, it is
 *      parsed into a list of elements and Text nodes that form the
 *      list of children of the element.
 * @extends CharacterData
 * @param  ownerDocument The Document object associated with this node.
 */
Text = function(ownerDocument) {
    CharacterData.apply(this, arguments);
    this.nodeName  = "#text";
};
Text.prototype = new CharacterData();
__extend__(Text.prototype,{
    get localName(){
        return null;
    },
    // Breaks this Text node into two Text nodes at the specified offset,
    // keeping both in the tree as siblings. This node then only contains
    // all the content up to the offset point.  And a new Text node, which
    // is inserted as the next sibling of this node, contains all the
    // content at and after the offset point.
    splitText : function(offset) {
        var data,
            inode;
        // test for exceptions
        if (__ownerDocument__(this).implementation.errorChecking) {
            // throw Exception if Node is readonly
            if (this._readonly) {
              throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
            }
            // throw Exception if offset is negative or greater than the data length,
            if ((offset < 0) || (offset > this.data.length)) {
              throw(new DOMException(DOMException.INDEX_SIZE_ERR));
            }
        }
        if (this.parentNode) {
            // get remaining string (after offset)
            data  = this.substringData(offset);
            // create new TextNode with remaining string
            inode = __ownerDocument__(this).createTextNode(data);
            // attach new TextNode
            if (this.nextSibling) {
              this.parentNode.insertBefore(inode, this.nextSibling);
            } else {
              this.parentNode.appendChild(inode);
            }
            // remove remaining string from original TextNode
            this.deleteData(offset);
        }
        return inode;
    },
    get nodeType(){
        return Node.TEXT_NODE;
    },
    get xml(){
        return __escapeXML__(""+ this.nodeValue);
    },
    toString: function(){
        return "[object Text]";
    }
});

/**
 * @class CDATASection 
 *      CDATA sections are used to escape blocks of text containing 
 *      characters that would otherwise be regarded as markup.
 *      The only delimiter that is recognized in a CDATA section is 
 *      the "\]\]\>" string that ends the CDATA section
 * @extends Text
 * @param  ownerDocument : The Document object associated with this node.
 */
CDATASection = function(ownerDocument) {
    Text.apply(this, arguments);
    this.nodeName = '#cdata-section';
};
CDATASection.prototype = new Text();
__extend__(CDATASection.prototype,{
    get nodeType(){
        return Node.CDATA_SECTION_NODE;
    },
    get xml(){
        return "<![CDATA[" + this.nodeValue + "]]>";
    },
    toString : function(){
        return "[object CDATASection]";
    }
});
/**
 * @class  Comment
 *      This represents the content of a comment, i.e., all the
 *      characters between the starting '<!--' and ending '-->'
 * @extends CharacterData
 * @param  ownerDocument :  The Document object associated with this node.
 */
Comment = function(ownerDocument) {
    CharacterData.apply(this, arguments);
    this.nodeName  = "#comment";
};
Comment.prototype = new CharacterData();
__extend__(Comment.prototype, {
    get localName(){
        return null;
    },
    get nodeType(){
        return Node.COMMENT_NODE;
    },
    get xml(){
        return "<!--" + this.nodeValue + "-->";
    },
    toString : function(){
        return "[object Comment]";
    }
});


/**
 * @author envjs team
 * @param {Document} onwnerDocument
 */
DocumentType = function(ownerDocument) {
    Node.apply(this, arguments);
    this.systemId = null;
    this.publicId = null;
};
DocumentType.prototype = new Node();
__extend__({
    get name(){
        return this.nodeName;
    },
    get entities(){
        return null;
    },
    get internalSubsets(){
        return null;
    },
    get notations(){
        return null;
    },
    toString : function(){
        return "[object DocumentType]";
    }
});

/**
 * @class  Attr
 *      The Attr interface represents an attribute in an Element object
 * @extends Node
 * @param  ownerDocument : The Document object associated with this node.
 */
Attr = function(ownerDocument) {
    Node.apply(this, arguments);
    // set when Attr is added to NamedNodeMap
    this.ownerElement = null;
    //TODO: our implementation of Attr is incorrect because we don't
    //      treat the value of the attribute as a child text node.
};
Attr.prototype = new Node();
__extend__(Attr.prototype, {
    // the name of this attribute
    get name(){
        return this.nodeName;
    },
    // the value of the attribute is returned as a string
    get value(){
        return this.nodeValue||'';
    },
    set value(value){
        // throw Exception if Attribute is readonly
        if (__ownerDocument__(this).implementation.errorChecking && this._readonly) {
            throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
        }
        // delegate to node
        this.nodeValue = value;
    },
    get textContent(){
        return this.nodeValue;
    },
    set textContent(newText){
        this.nodeValue = newText;
    },
    get specified(){
        return (this !== null && this !== undefined);
    },
    get nodeType(){
        return Node.ATTRIBUTE_NODE;
    },
    get xml() {
        if (this.nodeValue) {
            return  __escapeXML__(this.nodeValue+"");
        } else {
            return '';
        }
    },
    toString : function() {
        return '[object Attr]';
    }
});


/**
 * @class  Element -
 *      By far the vast majority of objects (apart from text)
 *      that authors encounter when traversing a document are
 *      Element nodes.
 * @extends Node
 * @param  ownerDocument : The Document object associated with this node.
 */
Element = function(ownerDocument) {
    Node.apply(this, arguments);
    this.attributes = new NamedNodeMap(this.ownerDocument, this);
};
Element.prototype = new Node();
__extend__(Element.prototype, {
    // The name of the element.
    get tagName(){
        return this.nodeName;
    },

    getAttribute: function(name) {
        var ret = null;
        // if attribute exists, use it
        var attr = this.attributes.getNamedItem(name);
        if (attr) {
            ret = attr.value;
        }
        // if Attribute exists, return its value, otherwise, return null
        return ret;
    },
    setAttribute : function (name, value) {
        // if attribute exists, use it
        var attr = this.attributes.getNamedItem(name);
       //console.log('attr %s', attr);
        //I had to add this check because as the script initializes
        //the id may be set in the constructor, and the html element
        //overrides the id property with a getter/setter.
        if(__ownerDocument__(this)){
            if (attr===null||attr===undefined) {
                // otherwise create it
                attr = __ownerDocument__(this).createAttribute(name);
               //console.log('attr %s', attr);
            }


            // test for exceptions
            if (__ownerDocument__(this).implementation.errorChecking) {
                // throw Exception if Attribute is readonly
                if (attr._readonly) {
                    throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
                }

                // throw Exception if the value string contains an illegal character
                if (!__isValidString__(value+'')) {
                    throw(new DOMException(DOMException.INVALID_CHARACTER_ERR));
                }
            }

            // assign values to properties (and aliases)
            attr.value     = value + '';

            // add/replace Attribute in NamedNodeMap
            this.attributes.setNamedItem(attr);
           //console.log('element setNamedItem %s', attr);
        }else{
           console.warn('Element has no owner document '+this.tagName+
                '\n\t cant set attribute ' + name + ' = '+value );
        }
    },
    removeAttribute : function removeAttribute(name) {
        // delegate to NamedNodeMap.removeNamedItem
        return this.attributes.removeNamedItem(name);
    },
    getAttributeNode : function getAttributeNode(name) {
        // delegate to NamedNodeMap.getNamedItem
        return this.attributes.getNamedItem(name);
    },
    setAttributeNode: function(newAttr) {
        // if this Attribute is an ID
        if (__isIdDeclaration__(newAttr.name)) {
            this.id = newAttr.value;  // cache ID for getElementById()
        }
        // delegate to NamedNodeMap.setNamedItem
        return this.attributes.setNamedItem(newAttr);
    },
    removeAttributeNode: function(oldAttr) {
      // throw Exception if Attribute is readonly
      if (__ownerDocument__(this).implementation.errorChecking && oldAttr._readonly) {
        throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
      }

      // get item index
      var itemIndex = this.attributes._findItemIndex(oldAttr._id);

      // throw Exception if node does not exist in this map
      if (__ownerDocument__(this).implementation.errorChecking && (itemIndex < 0)) {
        throw(new DOMException(DOMException.NOT_FOUND_ERR));
      }

      return this.attributes._removeChild(itemIndex);
    },
    getAttributeNS : function(namespaceURI, localName) {
        var ret = "";
        // delegate to NAmedNodeMap.getNamedItemNS
        var attr = this.attributes.getNamedItemNS(namespaceURI, localName);
        if (attr) {
            ret = attr.value;
        }
        return ret;  // if Attribute exists, return its value, otherwise return ""
    },
    setAttributeNS : function(namespaceURI, qualifiedName, value) {
        // call NamedNodeMap.getNamedItem
        //console.log('setAttributeNS %s %s %s', namespaceURI, qualifiedName, value);
        var attr = this.attributes.getNamedItem(namespaceURI, qualifiedName);

        if (!attr) {  // if Attribute exists, use it
            // otherwise create it
            attr = __ownerDocument__(this).createAttributeNS(namespaceURI, qualifiedName);
        }

        value = '' + value;

        // test for exceptions
        if (__ownerDocument__(this).implementation.errorChecking) {
            // throw Exception if Attribute is readonly
            if (attr._readonly) {
                throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
            }

            // throw Exception if the Namespace is invalid
            if (!__isValidNamespace__(this.ownerDocument, namespaceURI, qualifiedName, true)) {
                throw(new DOMException(DOMException.NAMESPACE_ERR));
            }

            // throw Exception if the value string contains an illegal character
            if (!__isValidString__(value)) {
                throw(new DOMException(DOMException.INVALID_CHARACTER_ERR));
            }
        }

        // if this Attribute is an ID
        //if (__isIdDeclaration__(name)) {
        //    this.id = value;
        //}

        // assign values to properties (and aliases)
        attr.value     = value;
        attr.nodeValue = value;

        // delegate to NamedNodeMap.setNamedItem
        this.attributes.setNamedItemNS(attr);
    },
    removeAttributeNS : function(namespaceURI, localName) {
        // delegate to NamedNodeMap.removeNamedItemNS
        return this.attributes.removeNamedItemNS(namespaceURI, localName);
    },
    getAttributeNodeNS : function(namespaceURI, localName) {
        // delegate to NamedNodeMap.getNamedItemNS
        return this.attributes.getNamedItemNS(namespaceURI, localName);
    },
    setAttributeNodeNS : function(newAttr) {
        // if this Attribute is an ID
        if ((newAttr.prefix == "") &&  __isIdDeclaration__(newAttr.name)) {
            this.id = newAttr.value+'';  // cache ID for getElementById()
        }

        // delegate to NamedNodeMap.setNamedItemNS
        return this.attributes.setNamedItemNS(newAttr);
    },
    hasAttribute : function(name) {
        // delegate to NamedNodeMap._hasAttribute
        return __hasAttribute__(this.attributes,name);
    },
    hasAttributeNS : function(namespaceURI, localName) {
        // delegate to NamedNodeMap._hasAttributeNS
        return __hasAttributeNS__(this.attributes, namespaceURI, localName);
    },
    get nodeType(){
        return Node.ELEMENT_NODE;
    },
    get xml() {
        var ret = "",
            ns = "",
            attrs,
            attrstring,
            i;

        // serialize namespace declarations
        if (this.namespaceURI ){
            if((this === this.ownerDocument.documentElement) ||
               (!this.parentNode)||
               (this.parentNode && (this.parentNode.namespaceURI !== this.namespaceURI))) {
                ns = ' xmlns' + (this.prefix?(':'+this.prefix):'') +
                    '="' + this.namespaceURI + '"';
            }
        }

        // serialize Attribute declarations
        attrs = this.attributes;
        attrstring = "";
        for(i=0;i< attrs.length;i++){
            if(attrs[i].name.match('xmlns:')) {
                attrstring += " "+attrs[i].name+'="'+attrs[i].xml+'"';
            }
        }
        for(i=0;i< attrs.length;i++){
            if(!attrs[i].name.match('xmlns:')) {
                attrstring += " "+attrs[i].name+'="'+attrs[i].xml+'"';
            }
        }

        if(this.hasChildNodes()){
            // serialize this Element
            ret += "<" + this.tagName + ns + attrstring +">";
            ret += this.childNodes.xml;
            ret += "</" + this.tagName + ">";
        }else{
            ret += "<" + this.tagName + ns + attrstring +"/>";
        }

        return ret;
    },
    toString : function(){
        return '[object Element]';
    }
});
/**
 * @class  DOMException - raised when an operation is impossible to perform
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  code : int - the exception code (one of the DOMException constants)
 */
DOMException = function(code) {
    this.code = code;
};

// DOMException constants
// Introduced in DOM Level 1:
DOMException.INDEX_SIZE_ERR                 = 1;
DOMException.DOMSTRING_SIZE_ERR             = 2;
DOMException.HIERARCHY_REQUEST_ERR          = 3;
DOMException.WRONG_DOCUMENT_ERR             = 4;
DOMException.INVALID_CHARACTER_ERR          = 5;
DOMException.NO_DATA_ALLOWED_ERR            = 6;
DOMException.NO_MODIFICATION_ALLOWED_ERR    = 7;
DOMException.NOT_FOUND_ERR                  = 8;
DOMException.NOT_SUPPORTED_ERR              = 9;
DOMException.INUSE_ATTRIBUTE_ERR            = 10;

// Introduced in DOM Level 2:
DOMException.INVALID_STATE_ERR              = 11;
DOMException.SYNTAX_ERR                     = 12;
DOMException.INVALID_MODIFICATION_ERR       = 13;
DOMException.NAMESPACE_ERR                  = 14;
DOMException.INVALID_ACCESS_ERR             = 15;

/**
 * @class  DocumentFragment -
 *      DocumentFragment is a "lightweight" or "minimal" Document object.
 * @extends Node
 * @param  ownerDocument :  The Document object associated with this node.
 */
DocumentFragment = function(ownerDocument) {
    Node.apply(this, arguments);
    this.nodeName  = "#document-fragment";
};
DocumentFragment.prototype = new Node();
__extend__(DocumentFragment.prototype,{
    get nodeType(){
        return Node.DOCUMENT_FRAGMENT_NODE;
    },
    get xml(){
        var xml = "",
        count = this.childNodes.length;

        // create string concatenating the serialized ChildNodes
        for (var i = 0; i < count; i++) {
            xml += this.childNodes.item(i).xml;
        }

        return xml;
    },
    toString : function(){
        return "[object DocumentFragment]";
    },
    get localName(){
        return null;
    }
});


/**
 * @class  ProcessingInstruction -
 *      The ProcessingInstruction interface represents a
 *      "processing instruction", used in XML as a way to
 *      keep processor-specific information in the text of
 *      the document
 * @extends Node
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  ownerDocument :  The Document object associated with this node.
 */
ProcessingInstruction = function(ownerDocument) {
    Node.apply(this, arguments);
};
ProcessingInstruction.prototype = new Node();
__extend__(ProcessingInstruction.prototype, {
    get data(){
        return this.nodeValue;
    },
    set data(data){
        // throw Exception if Node is readonly
        if (__ownerDocument__(this).errorChecking && this._readonly) {
            throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
        }
        this.nodeValue = data;
    },
    get textContent(){
        return this.data;
    },
    get localName(){
        return null;
    },
    get target(){
      // The target of this processing instruction.
      // XML defines this as being the first token following the markup that begins the processing instruction.
      // The content of this processing instruction.
        return this.nodeName;
    },
    set target(value){
      // The target of this processing instruction.
      // XML defines this as being the first token following the markup that begins the processing instruction.
      // The content of this processing instruction.
        this.nodeName = value;
    },
    get nodeType(){
        return Node.PROCESSING_INSTRUCTION_NODE;
    },
    get xml(){
        return "<?" + this.nodeName +" "+ this.nodeValue + "?>";
    },
    toString : function(){
        return "[object ProcessingInstruction]";
    }
});


/**
 * @author envjs team
 */

Entity = function() {
    throw new Error("Entity Not Implemented" );
};

Entity.constants = {
        // content taken from W3C "HTML 4.01 Specification"
        //                        "W3C Recommendation 24 December 1999"

    nbsp: "\u00A0",
    iexcl: "\u00A1",
    cent: "\u00A2",
    pound: "\u00A3",
    curren: "\u00A4",
    yen: "\u00A5",
    brvbar: "\u00A6",
    sect: "\u00A7",
    uml: "\u00A8",
    copy: "\u00A9",
    ordf: "\u00AA",
    laquo: "\u00AB",
    not: "\u00AC",
    shy: "\u00AD",
    reg: "\u00AE",
    macr: "\u00AF",
    deg: "\u00B0",
    plusmn: "\u00B1",
    sup2: "\u00B2",
    sup3: "\u00B3",
    acute: "\u00B4",
    micro: "\u00B5",
    para: "\u00B6",
    middot: "\u00B7",
    cedil: "\u00B8",
    sup1: "\u00B9",
    ordm: "\u00BA",
    raquo: "\u00BB",
    frac14: "\u00BC",
    frac12: "\u00BD",
    frac34: "\u00BE",
    iquest: "\u00BF",
    Agrave: "\u00C0",
    Aacute: "\u00C1",
    Acirc: "\u00C2",
    Atilde: "\u00C3",
    Auml: "\u00C4",
    Aring: "\u00C5",
    AElig: "\u00C6",
    Ccedil: "\u00C7",
    Egrave: "\u00C8",
    Eacute: "\u00C9",
    Ecirc: "\u00CA",
    Euml: "\u00CB",
    Igrave: "\u00CC",
    Iacute: "\u00CD",
    Icirc: "\u00CE",
    Iuml: "\u00CF",
    ETH: "\u00D0",
    Ntilde: "\u00D1",
    Ograve: "\u00D2",
    Oacute: "\u00D3",
    Ocirc: "\u00D4",
    Otilde: "\u00D5",
    Ouml: "\u00D6",
    times: "\u00D7",
    Oslash: "\u00D8",
    Ugrave: "\u00D9",
    Uacute: "\u00DA",
    Ucirc: "\u00DB",
    Uuml: "\u00DC",
    Yacute: "\u00DD",
    THORN: "\u00DE",
    szlig: "\u00DF",
    agrave: "\u00E0",
    aacute: "\u00E1",
    acirc: "\u00E2",
    atilde: "\u00E3",
    auml: "\u00E4",
    aring: "\u00E5",
    aelig: "\u00E6",
    ccedil: "\u00E7",
    egrave: "\u00E8",
    eacute: "\u00E9",
    ecirc: "\u00EA",
    euml: "\u00EB",
    igrave: "\u00EC",
    iacute: "\u00ED",
    icirc: "\u00EE",
    iuml: "\u00EF",
    eth: "\u00F0",
    ntilde: "\u00F1",
    ograve: "\u00F2",
    oacute: "\u00F3",
    ocirc: "\u00F4",
    otilde: "\u00F5",
    ouml: "\u00F6",
    divide: "\u00F7",
    oslash: "\u00F8",
    ugrave: "\u00F9",
    uacute: "\u00FA",
    ucirc: "\u00FB",
    uuml: "\u00FC",
    yacute: "\u00FD",
    thorn: "\u00FE",
    yuml: "\u00FF",
    fnof: "\u0192",
    Alpha: "\u0391",
    Beta: "\u0392",
    Gamma: "\u0393",
    Delta: "\u0394",
    Epsilon: "\u0395",
    Zeta: "\u0396",
    Eta: "\u0397",
    Theta: "\u0398",
    Iota: "\u0399",
    Kappa: "\u039A",
    Lambda: "\u039B",
    Mu: "\u039C",
    Nu: "\u039D",
    Xi: "\u039E",
    Omicron: "\u039F",
    Pi: "\u03A0",
    Rho: "\u03A1",
    Sigma: "\u03A3",
    Tau: "\u03A4",
    Upsilon: "\u03A5",
    Phi: "\u03A6",
    Chi: "\u03A7",
    Psi: "\u03A8",
    Omega: "\u03A9",
    alpha: "\u03B1",
    beta: "\u03B2",
    gamma: "\u03B3",
    delta: "\u03B4",
    epsilon: "\u03B5",
    zeta: "\u03B6",
    eta: "\u03B7",
    theta: "\u03B8",
    iota: "\u03B9",
    kappa: "\u03BA",
    lambda: "\u03BB",
    mu: "\u03BC",
    nu: "\u03BD",
    xi: "\u03BE",
    omicron: "\u03BF",
    pi: "\u03C0",
    rho: "\u03C1",
    sigmaf: "\u03C2",
    sigma: "\u03C3",
    tau: "\u03C4",
    upsilon: "\u03C5",
    phi: "\u03C6",
    chi: "\u03C7",
    psi: "\u03C8",
    omega: "\u03C9",
    thetasym: "\u03D1",
    upsih: "\u03D2",
    piv: "\u03D6",
    bull: "\u2022",
    hellip: "\u2026",
    prime: "\u2032",
    Prime: "\u2033",
    oline: "\u203E",
    frasl: "\u2044",
    weierp: "\u2118",
    image: "\u2111",
    real: "\u211C",
    trade: "\u2122",
    alefsym: "\u2135",
    larr: "\u2190",
    uarr: "\u2191",
    rarr: "\u2192",
    darr: "\u2193",
    harr: "\u2194",
    crarr: "\u21B5",
    lArr: "\u21D0",
    uArr: "\u21D1",
    rArr: "\u21D2",
    dArr: "\u21D3",
    hArr: "\u21D4",
    forall: "\u2200",
    part: "\u2202",
    exist: "\u2203",
    empty: "\u2205",
    nabla: "\u2207",
    isin: "\u2208",
    notin: "\u2209",
    ni: "\u220B",
    prod: "\u220F",
    sum: "\u2211",
    minus: "\u2212",
    lowast: "\u2217",
    radic: "\u221A",
    prop: "\u221D",
    infin: "\u221E",
    ang: "\u2220",
    and: "\u2227",
    or: "\u2228",
    cap: "\u2229",
    cup: "\u222A",
    intXX: "\u222B",
    there4: "\u2234",
    sim: "\u223C",
    cong: "\u2245",
    asymp: "\u2248",
    ne: "\u2260",
    equiv: "\u2261",
    le: "\u2264",
    ge: "\u2265",
    sub: "\u2282",
    sup: "\u2283",
    nsub: "\u2284",
    sube: "\u2286",
    supe: "\u2287",
    oplus: "\u2295",
    otimes: "\u2297",
    perp: "\u22A5",
    sdot: "\u22C5",
    lceil: "\u2308",
    rceil: "\u2309",
    lfloor: "\u230A",
    rfloor: "\u230B",
    lang: "\u2329",
    rang: "\u232A",
    loz: "\u25CA",
    spades: "\u2660",
    clubs: "\u2663",
    hearts: "\u2665",
    diams: "\u2666",
    quot: "\u0022",
    amp: "\u0026",
    lt: "\u003C",
    gt: "\u003E",
    OElig: "\u0152",
    oelig: "\u0153",
    Scaron: "\u0160",
    scaron: "\u0161",
    Yuml: "\u0178",
    circ: "\u02C6",
    tilde: "\u02DC",
    ensp: "\u2002",
    emsp: "\u2003",
    thinsp: "\u2009",
    zwnj: "\u200C",
    zwj: "\u200D",
    lrm: "\u200E",
    rlm: "\u200F",
    ndash: "\u2013",
    mdash: "\u2014",
    lsquo: "\u2018",
    rsquo: "\u2019",
    sbquo: "\u201A",
    ldquo: "\u201C",
    rdquo: "\u201D",
    bdquo: "\u201E",
    dagger: "\u2020",
    Dagger: "\u2021",
    permil: "\u2030",
    lsaquo: "\u2039",
    rsaquo: "\u203A",
    euro: "\u20AC",

    // non-standard entities
    apos: "'"
};

/**
 * @author envjs team
 */

EntityReference = function() {
    throw new Error("EntityReference Not Implemented" );
};

/**
 * @class  DOMImplementation -
 *      provides a number of methods for performing operations
 *      that are independent of any particular instance of the
 *      document object model.
 *
 * @author Jon van Noort (jon@webarcana.com.au)
 */
DOMImplementation = function() {
    this.preserveWhiteSpace = false;  // by default, ignore whitespace
    this.namespaceAware = true;       // by default, handle namespaces
    this.errorChecking  = true;      // by default, test for exceptions
};

__extend__(DOMImplementation.prototype,{
    // @param  feature : string - The package name of the feature to test.
    //      the legal only values are "XML" and "CORE" (case-insensitive).
    // @param  version : string - This is the version number of the package
    //       name to test. In Level 1, this is the string "1.0".*
    // @return : boolean
    hasFeature : function(feature, version) {
        var ret = false;
        if (feature.toLowerCase() == "xml") {
            ret = (!version || (version == "1.0") || (version == "2.0"));
        }
        else if (feature.toLowerCase() == "core") {
            ret = (!version || (version == "2.0"));
        }
        else if (feature == "http://www.w3.org/TR/SVG11/feature#BasicStructure") {
            ret = (version == "1.1");
        }
        return ret;
    },
    createDocumentType : function(qname, publicId, systemId){
        var doctype = new DocumentType();
        doctype.nodeName = qname?qname.toUpperCase():null;
        doctype.publicId = publicId?publicId:null;
        doctype.systemId = systemId?systemId:null;
        return doctype;
    },
    createDocument : function(nsuri, qname, doctype){

        var doc = null, documentElement;

        doc = new Document(this, null);
        if(doctype){
            doc.doctype = doctype;
        }

        if(nsuri && qname){
            documentElement = doc.createElementNS(nsuri, qname);
        }else if(qname){
            documentElement = doc.createElement(qname);
        }
        if(documentElement){
            doc.appendChild(documentElement);
        }
        return doc;
    },
    createHTMLDocument : function(title){
        var doc = new HTMLDocument($implementation, null, "");
        var html = doc.createElement("html"); doc.appendChild(html);
        var head = doc.createElement("head"); html.appendChild(head);
        var body = doc.createElement("body"); html.appendChild(body);
        var t = doc.createElement("title"); head.appendChild(t);
        if( title) {
            t.appendChild(doc.createTextNode(title));
        }
        return doc;
    },
    translateErrCode : function(code) {
        //convert DOMException Code to human readable error message;
      var msg = "";

      switch (code) {
        case DOMException.INDEX_SIZE_ERR :                // 1
           msg = "INDEX_SIZE_ERR: Index out of bounds";
           break;

        case DOMException.DOMSTRING_SIZE_ERR :            // 2
           msg = "DOMSTRING_SIZE_ERR: The resulting string is too long to fit in a DOMString";
           break;

        case DOMException.HIERARCHY_REQUEST_ERR :         // 3
           msg = "HIERARCHY_REQUEST_ERR: The Node can not be inserted at this location";
           break;

        case DOMException.WRONG_DOCUMENT_ERR :            // 4
           msg = "WRONG_DOCUMENT_ERR: The source and the destination Documents are not the same";
           break;

        case DOMException.INVALID_CHARACTER_ERR :         // 5
           msg = "INVALID_CHARACTER_ERR: The string contains an invalid character";
           break;

        case DOMException.NO_DATA_ALLOWED_ERR :           // 6
           msg = "NO_DATA_ALLOWED_ERR: This Node / NodeList does not support data";
           break;

        case DOMException.NO_MODIFICATION_ALLOWED_ERR :   // 7
           msg = "NO_MODIFICATION_ALLOWED_ERR: This object cannot be modified";
           break;

        case DOMException.NOT_FOUND_ERR :                 // 8
           msg = "NOT_FOUND_ERR: The item cannot be found";
           break;

        case DOMException.NOT_SUPPORTED_ERR :             // 9
           msg = "NOT_SUPPORTED_ERR: This implementation does not support function";
           break;

        case DOMException.INUSE_ATTRIBUTE_ERR :           // 10
           msg = "INUSE_ATTRIBUTE_ERR: The Attribute has already been assigned to another Element";
           break;

        // Introduced in DOM Level 2:
        case DOMException.INVALID_STATE_ERR :             // 11
           msg = "INVALID_STATE_ERR: The object is no longer usable";
           break;

        case DOMException.SYNTAX_ERR :                    // 12
           msg = "SYNTAX_ERR: Syntax error";
           break;

        case DOMException.INVALID_MODIFICATION_ERR :      // 13
           msg = "INVALID_MODIFICATION_ERR: Cannot change the type of the object";
           break;

        case DOMException.NAMESPACE_ERR :                 // 14
           msg = "NAMESPACE_ERR: The namespace declaration is incorrect";
           break;

        case DOMException.INVALID_ACCESS_ERR :            // 15
           msg = "INVALID_ACCESS_ERR: The object does not support this function";
           break;

        default :
           msg = "UNKNOWN: Unknown Exception Code ("+ code +")";
      }

      return msg;
    },
    toString : function(){
        return "[object DOMImplementation]";
    }
});



/**
 * @method DOMImplementation._isNamespaceDeclaration - Return true, if attributeName is a namespace declaration
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  attributeName : string - the attribute name
 * @return : boolean
 */
function __isNamespaceDeclaration__(attributeName) {
  // test if attributeName is 'xmlns'
  return (attributeName.indexOf('xmlns') > -1);
}

/**
 * @method DOMImplementation._isIdDeclaration - Return true, if attributeName is an id declaration
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  attributeName : string - the attribute name
 * @return : boolean
 */
function __isIdDeclaration__(attributeName) {
  // test if attributeName is 'id' (case insensitive)
  return attributeName?(attributeName.toLowerCase() == 'id'):false;
}

/**
 * @method DOMImplementation._isValidName - Return true,
 *   if name contains no invalid characters
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  name : string - the candidate name
 * @return : boolean
 */
function __isValidName__(name) {
  // test if name contains only valid characters
  return name.match(re_validName);
}
var re_validName = /^[a-zA-Z_:][a-zA-Z0-9\.\-_:]*$/;

/**
 * @method DOMImplementation._isValidString - Return true, if string does not contain any illegal chars
 *  All of the characters 0 through 31 and character 127 are nonprinting control characters.
 *  With the exception of characters 09, 10, and 13, (Ox09, Ox0A, and Ox0D)
 *  Note: different from _isValidName in that ValidStrings may contain spaces
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  name : string - the candidate string
 * @return : boolean
 */
function __isValidString__(name) {
  // test that string does not contains invalid characters
  return (name.search(re_invalidStringChars) < 0);
}
var re_invalidStringChars = /\x01|\x02|\x03|\x04|\x05|\x06|\x07|\x08|\x0B|\x0C|\x0E|\x0F|\x10|\x11|\x12|\x13|\x14|\x15|\x16|\x17|\x18|\x19|\x1A|\x1B|\x1C|\x1D|\x1E|\x1F|\x7F/;

/**
 * @method DOMImplementation._parseNSName - parse the namespace name.
 *  if there is no colon, the
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  qualifiedName : string - The qualified name
 * @return : NSName - [
         .prefix        : string - The prefix part of the qname
         .namespaceName : string - The namespaceURI part of the qname
    ]
 */
function __parseNSName__(qualifiedName) {
    var resultNSName = {};
    // unless the qname has a namespaceName, the prefix is the entire String
    resultNSName.prefix          = qualifiedName;
    resultNSName.namespaceName   = "";
    // split on ':'
    var delimPos = qualifiedName.indexOf(':');
    if (delimPos > -1) {
        // get prefix
        resultNSName.prefix        = qualifiedName.substring(0, delimPos);
        // get namespaceName
        resultNSName.namespaceName = qualifiedName.substring(delimPos +1, qualifiedName.length);
    }
    return resultNSName;
}

/**
 * @method DOMImplementation._parseQName - parse the qualified name
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  qualifiedName : string - The qualified name
 * @return : QName
 */
function __parseQName__(qualifiedName) {
    var resultQName = {};
    // unless the qname has a prefix, the local name is the entire String
    resultQName.localName = qualifiedName;
    resultQName.prefix    = "";
    // split on ':'
    var delimPos = qualifiedName.indexOf(':');
    if (delimPos > -1) {
        // get prefix
        resultQName.prefix    = qualifiedName.substring(0, delimPos);
        // get localName
        resultQName.localName = qualifiedName.substring(delimPos +1, qualifiedName.length);
    }
    return resultQName;
}
/**
 * @author envjs team
 */
Notation = function() {
    throw new Error("Notation Not Implemented" );
};/**
 * @author thatcher
 */
Range = function(){

};

__extend__(Range.prototype, {
    get startContainer(){

    },
    get endContainer(){

    },
    get startOffset(){

    },
    get endOffset(){

    },
    get collapsed(){

    },
    get commonAncestorContainer(){

    },
    setStart: function(refNode, offset){//throws RangeException

    },
    setEnd: function(refNode, offset){//throws RangeException
    
    },
    setStartBefore: function(refNode){//throws RangeException
    
    },
    setStartAfter: function(refNode){//throws RangeException
    
    },
    setEndBefore: function(refNode){//throws RangeException
    
    },
    setEndAfter: function(refNode){//throws RangeException
    
    },
    collapse: function(toStart){//throws RangeException
    
    },
    selectNode: function(refNode){//throws RangeException
    
    },
    selectNodeContents: function(refNode){//throws RangeException
    
    },
    compareBoundaryPoints: function(how, sourceRange){

    },
    deleteContents: function(){

    },
    extractContents: function(){

    },
    cloneContents: function(){

    },
    insertNode: function(newNode){

    },
    surroundContents: function(newParent){

    },
    cloneRange: function(){

    },
    toString: function(){
        return '[object Range]';
    },
    detach: function(){

    }
});


  // CompareHow
Range.START_TO_START                 = 0;
Range.START_TO_END                   = 1;
Range.END_TO_END                     = 2;
Range.END_TO_START                   = 3;
  
/*
 * Forward declarations
 */
var __isValidNamespace__;

/**
 * @class  Document - The Document interface represents the entire HTML
 *      or XML document. Conceptually, it is the root of the document tree,
 *      and provides the primary access to the document's data.
 *
 * @extends Node
 * @param  implementation : DOMImplementation - the creator Implementation
 */
Document = function(implementation, docParentWindow) {
    Node.apply(this, arguments);

    //TODO: Temporary!!! Cnage back to true!!!
    this.async = true;
    // The Document Type Declaration (see DocumentType) associated with this document
    this.doctype = null;
    // The DOMImplementation object that handles this document.
    this.implementation = implementation;

    this.nodeName  = "#document";
    // initially false, set to true by parser
    this.parsing = false;
    this.baseURI = 'about:blank';

    this.ownerDocument = null;

    this.importing = false;
};

Document.prototype = new Node();
__extend__(Document.prototype,{
    get localName(){
        return null;
    },
    get textContent(){
        return null;
    },
    get all(){
        return this.getElementsByTagName("*");
    },
    get documentElement(){
        var i, length = this.childNodes?this.childNodes.length:0;
        for(i=0;i<length;i++){
            if(this.childNodes[i].nodeType === Node.ELEMENT_NODE){
                return this.childNodes[i];
            }
        }
        return null;
    },
    get documentURI(){
        return this.baseURI;
    },
    createExpression: function(xpath, nsuriMap){
        return new XPathExpression(xpath, nsuriMap);
    },
    createDocumentFragment: function() {
        var node = new DocumentFragment(this);
        return node;
    },
    createTextNode: function(data) {
        var node = new Text(this);
        node.data = data;
        return node;
    },
    createComment: function(data) {
        var node = new Comment(this);
        node.data = data;
        return node;
    },
    createCDATASection : function(data) {
        var node = new CDATASection(this);
        node.data = data;
        return node;
    },
    createProcessingInstruction: function(target, data) {
        // throw Exception if the target string contains an illegal character
        if (__ownerDocument__(this).implementation.errorChecking &&
            (!__isValidName__(target))) {
            throw(new DOMException(DOMException.INVALID_CHARACTER_ERR));
        }

        var node = new ProcessingInstruction(this);
        node.target = target;
        node.data = data;
        return node;
    },
    createElement: function(tagName) {
        // throw Exception if the tagName string contains an illegal character
        if (__ownerDocument__(this).implementation.errorChecking &&
            (!__isValidName__(tagName))) {
            throw(new DOMException(DOMException.INVALID_CHARACTER_ERR));
        }
        var node = new Element(this);
        node.nodeName = tagName;
        return node;
    },
    createElementNS : function(namespaceURI, qualifiedName) {
        //we use this as a parser flag to ignore the xhtml
        //namespace assumed by the parser
        //console.log('creating element %s %s', namespaceURI, qualifiedName);
        if(this.baseURI === 'http://envjs.com/xml' &&
            namespaceURI === 'http://www.w3.org/1999/xhtml'){
            return this.createElement(qualifiedName);
        }
        //console.log('createElementNS %s %s', namespaceURI, qualifiedName);
        if (__ownerDocument__(this).implementation.errorChecking) {
            // throw Exception if the Namespace is invalid
            if (!__isValidNamespace__(this, namespaceURI, qualifiedName)) {
                throw(new DOMException(DOMException.NAMESPACE_ERR));
            }

            // throw Exception if the qualifiedName string contains an illegal character
            if (!__isValidName__(qualifiedName)) {
                throw(new DOMException(DOMException.INVALID_CHARACTER_ERR));
            }
        }
        var node  = new Element(this);
        var qname = __parseQName__(qualifiedName);
        node.namespaceURI = namespaceURI;
        node.prefix       = qname.prefix;
        node.nodeName     = qualifiedName;

        //console.log('created element %s %s', namespaceURI, qualifiedName);
        return node;
    },
    createAttribute : function(name) {
        //console.log('createAttribute %s ', name);
        // throw Exception if the name string contains an illegal character
        if (__ownerDocument__(this).implementation.errorChecking &&
            (!__isValidName__(name))) {
            throw(new DOMException(DOMException.INVALID_CHARACTER_ERR));
        }
        var node = new Attr(this);
        node.nodeName = name;
        return node;
    },
    createAttributeNS : function(namespaceURI, qualifiedName) {
        //we use this as a parser flag to ignore the xhtml
        //namespace assumed by the parser
        if(this.baseURI === 'http://envjs.com/xml' &&
            namespaceURI === 'http://www.w3.org/1999/xhtml'){
            return this.createAttribute(qualifiedName);
        }
        //console.log('createAttributeNS %s %s', namespaceURI, qualifiedName);
        // test for exceptions
        if (this.implementation.errorChecking) {
            // throw Exception if the Namespace is invalid
            if (!__isValidNamespace__(this, namespaceURI, qualifiedName, true)) {
                throw(new DOMException(DOMException.NAMESPACE_ERR));
            }

            // throw Exception if the qualifiedName string contains an illegal character
            if (!__isValidName__(qualifiedName)) {
                throw(new DOMException(DOMException.INVALID_CHARACTER_ERR));
            }
        }
        var node  = new Attr(this);
        var qname = __parseQName__(qualifiedName);
        node.namespaceURI = namespaceURI === '' ? null : namespaceURI;
        node.prefix       = qname.prefix;
        node.nodeName     = qualifiedName;
        node.nodeValue    = "";
        //console.log('attribute %s %s %s', node.namespaceURI, node.prefix, node.nodeName);
        return node;
    },
    createNamespace : function(qualifiedName) {
        //console.log('createNamespace %s', qualifiedName);
        // create Namespace specifying 'this' as ownerDocument
        var node  = new Namespace(this);
        var qname = __parseQName__(qualifiedName);

        // assign values to properties (and aliases)
        node.prefix       = qname.prefix;
        node.localName    = qname.localName;
        node.name         = qualifiedName;
        node.nodeValue    = "";

        return node;
    },

    createRange: function(){
        return new Range();
    },

    evaluate: function(xpathText, contextNode, nsuriMapper, resultType, result){
        //return new XPathExpression().evaluate();
        throw Error('Document.evaluate not supported yet!');
    },

    getElementById : function(elementId) {
        var retNode = null,
            node;
        // loop through all Elements
        var all = this.getElementsByTagName('*');
        for (var i=0; i < all.length; i++) {
            node = all[i];
            // if id matches
            if (node.id == elementId) {
                //found the node
                retNode = node;
                break;
            }
        }
        return retNode;
    },
    normalizeDocument: function(){
        this.normalize();
    },
    get nodeType(){
        return Node.DOCUMENT_NODE;
    },
    get xml(){
        return this.documentElement.xml;
    },
    toString: function(){
        return "[object XMLDocument]";
    },
    get defaultView(){
        return { getComputedStyle: function(elem){
            return window.getComputedStyle(elem);
        }};
    },
});

/*
 * Helper function
 *
 */
__isValidNamespace__ = function(doc, namespaceURI, qualifiedName, isAttribute) {

    if (doc.importing === true) {
        //we're doing an importNode operation (or a cloneNode) - in both cases, there
        //is no need to perform any namespace checking since the nodes have to have been valid
        //to have gotten into the DOM in the first place
        return true;
    }

    var valid = true;
    // parse QName
    var qName = __parseQName__(qualifiedName);


    //only check for namespaces if we're finished parsing
    if (this.parsing === false) {

        // if the qualifiedName is malformed
        if (qName.localName.indexOf(":") > -1 ){
            valid = false;
        }

        if ((valid) && (!isAttribute)) {
            // if the namespaceURI is not null
            if (!namespaceURI) {
                valid = false;
            }
        }

        // if the qualifiedName has a prefix
        if ((valid) && (qName.prefix === "")) {
            valid = false;
        }
    }

    // if the qualifiedName has a prefix that is "xml" and the namespaceURI is
    //  different from "http://www.w3.org/XML/1998/namespace" [Namespaces].
    if ((valid) && (qName.prefix === "xml") && (namespaceURI !== "http://www.w3.org/XML/1998/namespace")) {
        valid = false;
    }

    return valid;
};
/**
 *
 * This file only handles XML parser.
 * It is extended by parser/domparser.js (and parser/htmlparser.js)
 *
 * This depends on e4x, which some engines may not have.
 *
 * @author thatcher
 */
DOMParser = function(principle, documentURI, baseURI) {
    // TODO: why/what should these 3 args do?
};
__extend__(DOMParser.prototype,{
    parseFromString: function(xmlstring, mimetype){
        var doc = new Document(new DOMImplementation()),
            e4;

        // The following are e4x directives.
        // Full spec is here:
        // http://www.ecma-international.org/publications/standards/Ecma-357.htm
        //
        // that is pretty gross, so checkout this summary
        // http://rephrase.net/days/07/06/e4x
        //
        // also see the Mozilla Developer Center:
        // https://developer.mozilla.org/en/E4X
        //
        XML.ignoreComments = false;
        XML.ignoreProcessingInstructions = false;
        XML.ignoreWhitespace = false;

        // for some reason e4x can't handle initial xml declarations
        // https://bugzilla.mozilla.org/show_bug.cgi?id=336551
        // The official workaround is the big regexp below
        // but simpler one seems to be ok
        // xmlstring = xmlstring.replace(/^<\?xml\s+version\s*=\s*(["'])[^\1]+\1[^?]*\?>/, "");
        //
        xmlstring = xmlstring.replace(/<\?xml.*\?>/, '');

        e4 = new XMLList(xmlstring);

        __toDomNode__(e4, doc, doc);

        //console.log('xml \n %s', doc.documentElement.xml);
        return doc;
    }
});

var __toDomNode__ = function(e4, parent, doc){
    var xnode,
        domnode,
        children,
        target,
        value,
        length,
        element,
        kind,
        item;
    //console.log('converting e4x node list \n %s', e4)

    // not using the for each(item in e4) since some engines can't
    // handle the syntax (i.e. says syntax error)
    //
    // for each(xnode in e4) {
    for (item in e4) {
        // NO do not do this if (e4.hasOwnProperty(item)) {
        // breaks spidermonkey
        xnode = e4[item];

        kind = xnode.nodeKind();
        //console.log('treating node kind %s', kind);
        switch(kind){
        case 'element':
            // add node
            //console.log('creating element %s %s', xnode.localName(), xnode.namespace());
            if(xnode.namespace() && (xnode.namespace()+'') !== ''){
                //console.log('createElementNS %s %s',xnode.namespace()+'', xnode.localName() );
                domnode = doc.createElementNS(xnode.namespace()+'', xnode.localName());
            }else{
                domnode = doc.createElement(xnode.name()+'');
            }
            parent.appendChild(domnode);

            // add attributes
            __toDomNode__(xnode.attributes(), domnode, doc);

            // add children
            children = xnode.children();
            length = children.length();
            //console.log('recursing? %s', length ? 'yes' : 'no');
            if (length > 0) {
                __toDomNode__(children, domnode, doc);
            }
            break;
        case 'attribute':
            // console.log('setting attribute %s %s %s',
            //       xnode.localName(), xnode.namespace(), xnode.valueOf());

            //
            // cross-platform alert.  The original code used
            //  xnode.text() to get the attribute value
            //  This worked in Rhino, but did not in Spidermonkey
            //  valueOf seemed to work in both
            //
            if(xnode.namespace() && xnode.namespace().prefix){
                //console.log("%s", xnode.namespace().prefix);
                parent.setAttributeNS(xnode.namespace()+'',
                                      xnode.namespace().prefix+':'+xnode.localName(),
                                      xnode.valueOf());
            }else if((xnode.name()+'').match('http://www.w3.org/2000/xmlns/::')){
                if(xnode.localName()!=='xmlns'){
                    parent.setAttributeNS('http://www.w3.org/2000/xmlns/',
                                          'xmlns:'+xnode.localName(),
                                          xnode.valueOf());
                }
            }else{
                parent.setAttribute(xnode.localName()+'', xnode.valueOf());
            }
            break;
        case 'text':
            //console.log('creating text node : %s', xnode);
            domnode = doc.createTextNode(xnode+'');
            parent.appendChild(domnode);
            break;
        case 'comment':
            //console.log('creating comment node : %s', xnode);
            value = xnode+'';
            domnode = doc.createComment(value.substring(4,value.length-3));
            parent.appendChild(domnode);
            break;
        case 'processing-instruction':
            //console.log('creating processing-instruction node : %s', xnode);
            value = xnode+'';
            target = value.split(' ')[0].substring(2);
            value = value.split(' ').splice(1).join(' ').replace('?>','');
            //console.log('creating processing-instruction data : %s', value);
            domnode = doc.createProcessingInstruction(target, value);
            parent.appendChild(domnode);
            break;
        default:
            console.log('e4x DOM ERROR');
            throw new Error("Assertion failed in xml parser");
        }
    }
};
/**
 * @author envjs team
 * @class XMLSerializer
 */

XMLSerializer = function() {};

__extend__(XMLSerializer.prototype, {
    serializeToString: function(node){
        return node.xml;
    },
    toString : function(){
        return "[object XMLSerializer]";
    }
});

/**
 * @author john resig & the envjs team
 * @uri http://www.envjs.com/
 * @copyright 2008-2010
 * @license MIT
 */
//CLOSURE_END
}());
/*
 * Envjs event.1.2.35
 * Pure JavaScript Browser Environment
 * By John Resig <http://ejohn.org/> and the Envjs Team
 * Copyright 2008-2010 John Resig, under the MIT License
 *
 * This file simply provides the global definitions we need to
 * be able to correctly implement to core browser DOM Event interfaces.
 */
var Event,
    MouseEvent,
    UIEvent,
    KeyboardEvent,
    MutationEvent,
    DocumentEvent,
    EventTarget,
    EventException,
    //nonstandard but very useful for implementing mutation events
    //among other things like general profiling
    Aspect;
/*
 * Envjs event.1.2.35 
 * Pure JavaScript Browser Environment
 * By John Resig <http://ejohn.org/> and the Envjs Team
 * Copyright 2008-2010 John Resig, under the MIT License
 */

//CLOSURE_START
(function(){





/**
 * @author john resig
 */
// Helper method for extending one object with another.
function __extend__(a,b) {
    for ( var i in b ) {
        var g = b.__lookupGetter__(i), s = b.__lookupSetter__(i);
        if ( g || s ) {
            if ( g ) { a.__defineGetter__(i, g); }
            if ( s ) { a.__defineSetter__(i, s); }
        } else {
            a[i] = b[i];
        }
    } return a;
}

/**
 * @author john resig
 */
//from jQuery
function __setArray__( target, array ) {
    // Resetting the length to 0, then using the native Array push
    // is a super-fast way to populate an object with array-like properties
    target.length = 0;
    Array.prototype.push.apply( target, array );
}
/**
 * Borrowed with love from:
 * 
 * jQuery AOP - jQuery plugin to add features of aspect-oriented programming (AOP) to jQuery.
 * http://jquery-aop.googlecode.com/
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Version: 1.1
 */
(function() {

	var _after	= 1;
	var _before	= 2;
	var _around	= 3;
	var _intro  = 4;
	var _regexEnabled = true;

	/**
	 * Private weaving function.
	 */
	var weaveOne = function(source, method, advice) {

		var old = source[method];

		var aspect;
		if (advice.type == _after)
			aspect = function() {
				var returnValue = old.apply(this, arguments);
				return advice.value.apply(this, [returnValue, method]);
			};
		else if (advice.type == _before)
			aspect = function() {
				advice.value.apply(this, [arguments, method]);
				return old.apply(this, arguments);
			};
		else if (advice.type == _intro)
			aspect = function() {
				return advice.value.apply(this, arguments);
			};
		else if (advice.type == _around) {
			aspect = function() {
				var invocation = { object: this, args: arguments };
				return advice.value.apply(invocation.object, [{ arguments: invocation.args, method: method, proceed : 
					function() {
						return old.apply(invocation.object, invocation.args);
					}
				}] );
			};
		}

		aspect.unweave = function() { 
			source[method] = old;
			pointcut = source = aspect = old = null;
		};

		source[method] = aspect;

		return aspect;

	};


	/**
	 * Private weaver and pointcut parser.
	 */
	var weave = function(pointcut, advice)
	{

		var source = (typeof(pointcut.target.prototype) != 'undefined') ? pointcut.target.prototype : pointcut.target;
		var advices = [];

		// If it's not an introduction and no method was found, try with regex...
		if (advice.type != _intro && typeof(source[pointcut.method]) == 'undefined')
		{

			for (var method in source)
			{
				if (source[method] != null && source[method] instanceof Function && method.match(pointcut.method))
				{
					advices[advices.length] = weaveOne(source, method, advice);
				}
			}

			if (advices.length == 0)
				throw 'No method: ' + pointcut.method;

		} 
		else
		{
			// Return as an array of one element
			advices[0] = weaveOne(source, pointcut.method, advice);
		}

		return _regexEnabled ? advices : advices[0];

	};

	Aspect = 
	{
		/**
		 * Creates an advice after the defined point-cut. The advice will be executed after the point-cut method 
		 * has completed execution successfully, and will receive one parameter with the result of the execution.
		 * This function returns an array of weaved aspects (Function).
		 *
		 * @example jQuery.aop.after( {target: window, method: 'MyGlobalMethod'}, function(result) { alert('Returned: ' + result); } );
		 * @result Array<Function>
		 *
		 * @example jQuery.aop.after( {target: String, method: 'indexOf'}, function(index) { alert('Result found at: ' + index + ' on:' + this); } );
		 * @result Array<Function>
		 *
		 * @name after
		 * @param Map pointcut Definition of the point-cut to apply the advice. A point-cut is the definition of the object/s and method/s to be weaved.
		 * @option Object target Target object to be weaved. 
		 * @option String method Name of the function to be weaved. Regex are supported, but not on built-in objects.
		 * @param Function advice Function containing the code that will get called after the execution of the point-cut. It receives one parameter
		 *                        with the result of the point-cut's execution.
		 *
		 * @type Array<Function>
		 * @cat Plugins/General
		 */
		after : function(pointcut, advice)
		{
			return weave( pointcut, { type: _after, value: advice } );
		},

		/**
		 * Creates an advice before the defined point-cut. The advice will be executed before the point-cut method 
		 * but cannot modify the behavior of the method, or prevent its execution.
		 * This function returns an array of weaved aspects (Function).
		 *
		 * @example jQuery.aop.before( {target: window, method: 'MyGlobalMethod'}, function() { alert('About to execute MyGlobalMethod'); } );
		 * @result Array<Function>
		 *
		 * @example jQuery.aop.before( {target: String, method: 'indexOf'}, function(index) { alert('About to execute String.indexOf on: ' + this); } );
		 * @result Array<Function>
		 *
		 * @name before
		 * @param Map pointcut Definition of the point-cut to apply the advice. A point-cut is the definition of the object/s and method/s to be weaved.
		 * @option Object target Target object to be weaved. 
		 * @option String method Name of the function to be weaved. Regex are supported, but not on built-in objects.
		 * @param Function advice Function containing the code that will get called before the execution of the point-cut.
		 *
		 * @type Array<Function>
		 * @cat Plugins/General
		 */
		before : function(pointcut, advice)
		{
			return weave( pointcut, { type: _before, value: advice } );
		},


		/**
		 * Creates an advice 'around' the defined point-cut. This type of advice can control the point-cut method execution by calling
		 * the functions '.proceed()' on the 'invocation' object, and also, can modify the arguments collection before sending them to the function call.
		 * This function returns an array of weaved aspects (Function).
		 *
		 * @example jQuery.aop.around( {target: window, method: 'MyGlobalMethod'}, function(invocation) {
		 *                alert('# of Arguments: ' + invocation.arguments.length); 
		 *                return invocation.proceed(); 
		 *          } );
		 * @result Array<Function>
		 *
		 * @example jQuery.aop.around( {target: String, method: 'indexOf'}, function(invocation) { 
		 *                alert('Searching: ' + invocation.arguments[0] + ' on: ' + this); 
		 *                return invocation.proceed(); 
		 *          } );
		 * @result Array<Function>
		 *
		 * @example jQuery.aop.around( {target: window, method: /Get(\d+)/}, function(invocation) {
		 *                alert('Executing ' + invocation.method); 
		 *                return invocation.proceed(); 
		 *          } );
		 * @desc Matches all global methods starting with 'Get' and followed by a number.
		 * @result Array<Function>
		 *
		 *
		 * @name around
		 * @param Map pointcut Definition of the point-cut to apply the advice. A point-cut is the definition of the object/s and method/s to be weaved.
		 * @option Object target Target object to be weaved. 
		 * @option String method Name of the function to be weaved. Regex are supported, but not on built-in objects.
		 * @param Function advice Function containing the code that will get called around the execution of the point-cut. This advice will be called with one
		 *                        argument containing one function '.proceed()', the collection of arguments '.arguments', and the matched method name '.method'.
		 *
		 * @type Array<Function>
		 * @cat Plugins/General
		 */
		around : function(pointcut, advice)
		{
			return weave( pointcut, { type: _around, value: advice } );
		},

		/**
		 * Creates an introduction on the defined point-cut. This type of advice replaces any existing methods with the same
		 * name. To restore them, just unweave it.
		 * This function returns an array with only one weaved aspect (Function).
		 *
		 * @example jQuery.aop.introduction( {target: window, method: 'MyGlobalMethod'}, function(result) { alert('Returned: ' + result); } );
		 * @result Array<Function>
		 *
		 * @example jQuery.aop.introduction( {target: String, method: 'log'}, function() { alert('Console: ' + this); } );
		 * @result Array<Function>
		 *
		 * @name introduction
		 * @param Map pointcut Definition of the point-cut to apply the advice. A point-cut is the definition of the object/s and method/s to be weaved.
		 * @option Object target Target object to be weaved. 
		 * @option String method Name of the function to be weaved.
		 * @param Function advice Function containing the code that will be executed on the point-cut. 
		 *
		 * @type Array<Function>
		 * @cat Plugins/General
		 */
		introduction : function(pointcut, advice)
		{
			return weave( pointcut, { type: _intro, value: advice } );
		},
		
		/**
		 * Configures global options.
		 *
		 * @name setup
		 * @param Map settings Configuration options.
		 * @option Boolean regexMatch Enables/disables regex matching of method names.
		 *
		 * @example jQuery.aop.setup( { regexMatch: false } );
		 * @desc Disable regex matching.
		 *
		 * @type Void
		 * @cat Plugins/General
		 */
		setup: function(settings)
		{
			_regexEnabled = settings.regexMatch;
		}
	};

})();




/**
 * @name EventTarget
 * @w3c:domlevel 2
 * @uri -//TODO: paste dom event level 2 w3c spc uri here
 */
EventTarget = function(){};
EventTarget.prototype.addEventListener = function(type, fn, phase){
    __addEventListener__(this, type, fn, phase);
};
EventTarget.prototype.removeEventListener = function(type, fn){
    __removeEventListener__(this, type, fn);
};
EventTarget.prototype.dispatchEvent = function(event, bubbles){
    __dispatchEvent__(this, event, bubbles);
};

__extend__(Node.prototype, EventTarget.prototype);


var $events = [{}];

function __addEventListener__(target, type, fn, phase){
    phase = !!phase?"CAPTURING":"BUBBLING";
    if ( !target.uuid ) {
        //console.log('event uuid %s %s', target, target.uuid);
        target.uuid = $events.length+'';
    }
    if ( !$events[target.uuid] ) {
        //console.log('creating listener for target: %s %s', target, target.uuid);
        $events[target.uuid] = {};
    }
    if ( !$events[target.uuid][type] ){
        //console.log('creating listener for type: %s %s %s', target, target.uuid, type);
        $events[target.uuid][type] = {
            CAPTURING:[],
            BUBBLING:[]
        };
    }
    if ( $events[target.uuid][type][phase].indexOf( fn ) < 0 ){
        //console.log('adding event listener %s %s %s %s %s %s', target, target.uuid, type, phase,
        //    $events[target.uuid][type][phase].length, $events[target.uuid][type][phase].indexOf( fn ));
        //console.log('creating listener for function: %s %s %s', target, target.uuid, phase);
        $events[target.uuid][type][phase].push( fn );
        //console.log('adding event listener %s %s %s %s %s %s', target, target.uuid, type, phase,
        //    $events[target.uuid][type][phase].length, $events[target.uuid][type][phase].indexOf( fn ));
    }
    //console.log('registered event listeners %s', $events.length);
}

function __removeEventListener__(target, type, fn, phase){

    phase = !!phase?"CAPTURING":"BUBBLING";
    if ( !target.uuid ) {
        return;
    }
    if ( !$events[target.uuid] ) {
        return;
    }
    if(type == '*'){
        //used to clean all event listeners for a given node
        //console.log('cleaning all event listeners for node %s %s',target, target.uuid);
        delete $events[target.uuid];
        return;
    }else if ( !$events[target.uuid][type] ){
        return;
    }
    $events[target.uuid][type][phase] =
    $events[target.uuid][type][phase].filter(function(f){
        //console.log('removing event listener %s %s %s %s', target, type, phase, fn);
        return f != fn;
    });
}

var __eventuuid__ = 0;
function __dispatchEvent__(target, event, bubbles){

    if (!event.uuid) {
        event.uuid = __eventuuid__++;
    }
    //the window scope defines the $event object, for IE(^^^) compatibility;
    //$event = event;
    //console.log('dispatching event %s', event.uuid);
    if (bubbles === undefined || bubbles === null) {
        bubbles = true;
    }

    if (!event.target) {
        event.target = target;
    }

    //console.log('dispatching? %s %s %s', target, event.type, bubbles);
    if ( event.type && (target.nodeType || target === window )) {

        //console.log('dispatching event %s %s %s', target, event.type, bubbles);
        __captureEvent__(target, event);

        event.eventPhase = Event.AT_TARGET;
        if ( target.uuid && $events[target.uuid] && $events[target.uuid][event.type] ) {
            event.currentTarget = target;
            //console.log('dispatching %s %s %s %s', target, event.type,
            //  $events[target.uuid][event.type]['CAPTURING'].length);
            $events[target.uuid][event.type].CAPTURING.forEach(function(fn){
                //console.log('AT_TARGET (CAPTURING) event %s', fn);
                var returnValue = fn( event );
                //console.log('AT_TARGET (CAPTURING) return value %s', returnValue);
                if(returnValue === false){
                    event.stopPropagation();
                }
            });
            //console.log('dispatching %s %s %s %s', target, event.type,
            //  $events[target.uuid][event.type]['BUBBLING'].length);
            $events[target.uuid][event.type].BUBBLING.forEach(function(fn){
                //console.log('AT_TARGET (BUBBLING) event %s', fn);
                var returnValue = fn( event );
                //console.log('AT_TARGET (BUBBLING) return value %s', returnValue);
                if(returnValue === false){
                    event.stopPropagation();
                }
            });
        }
        if (target["on" + event.type]) {
            target["on" + event.type](event);
        }
        if (bubbles && !event.cancelled){
            __bubbleEvent__(target, event);
        }
        if(!event._preventDefault){
            //At this point I'm guessing that just HTMLEvents are concerned
            //with default behavior being executed in a browser but I could be
            //wrong as usual.  The goal is much more to filter at this point
            //what events have no need to be handled
            //console.log('triggering default behavior for %s', event.type);
            if(event.type in Envjs.defaultEventBehaviors){
                Envjs.defaultEventBehaviors[event.type](event);
            }
        }
        //console.log('deleting event %s', event.uuid);
        event.target = null;
        event = null;
    }else{
        throw new EventException(EventException.UNSPECIFIED_EVENT_TYPE_ERR);
    }
}

function __captureEvent__(target, event){
    var ancestorStack = [],
        parent = target.parentNode;

    event.eventPhase = Event.CAPTURING_PHASE;
    while(parent){
        if(parent.uuid && $events[parent.uuid] && $events[parent.uuid][event.type]){
            ancestorStack.push(parent);
        }
        parent = parent.parentNode;
    }
    while(ancestorStack.length && !event.cancelled){
        event.currentTarget = ancestorStack.pop();
        if($events[event.currentTarget.uuid] && $events[event.currentTarget.uuid][event.type]){
            $events[event.currentTarget.uuid][event.type].CAPTURING.forEach(function(fn){
                var returnValue = fn( event );
                if(returnValue === false){
                    event.stopPropagation();
                }
            });
        }
    }
}

function __bubbleEvent__(target, event){
    var parent = target.parentNode;
    event.eventPhase = Event.BUBBLING_PHASE;
    while(parent){
        if(parent.uuid && $events[parent.uuid] && $events[parent.uuid][event.type] ){
            event.currentTarget = parent;
            $events[event.currentTarget.uuid][event.type].BUBBLING.forEach(function(fn){
                var returnValue = fn( event );
                if(returnValue === false){
                    event.stopPropagation();
                }
            });
        }
        parent = parent.parentNode;
    }
}

/**
 * @class Event
 */
Event = function(options){
    // event state is kept read-only by forcing
    // a new object for each event.  This may not
    // be appropriate in the long run and we'll
    // have to decide if we simply dont adhere to
    // the read-only restriction of the specification
    this._bubbles = true;
    this._cancelable = true;
    this._cancelled = false;
    this._currentTarget = null;
    this._target = null;
    this._eventPhase = Event.AT_TARGET;
    this._timeStamp = new Date().getTime();
    this._preventDefault = false;
    this._stopPropogation = false;
};

__extend__(Event.prototype,{
    get bubbles(){return this._bubbles;},
    get cancelable(){return this._cancelable;},
    get currentTarget(){return this._currentTarget;},
    set currentTarget(currentTarget){ this._currentTarget = currentTarget; },
    get eventPhase(){return this._eventPhase;},
    set eventPhase(eventPhase){this._eventPhase = eventPhase;},
    get target(){return this._target;},
    set target(target){ this._target = target;},
    get timeStamp(){return this._timeStamp;},
    get type(){return this._type;},
    initEvent: function(type, bubbles, cancelable){
        this._type=type?type:'';
        this._bubbles=!!bubbles;
        this._cancelable=!!cancelable;
    },
    preventDefault: function(){
        this._preventDefault = true;
    },
    stopPropagation: function(){
        if(this._cancelable){
            this._cancelled = true;
            this._bubbles = false;
        }
    },
    get cancelled(){
        return this._cancelled;
    },
    toString: function(){
        return '[object Event]';
    }
});

__extend__(Event,{
    CAPTURING_PHASE : 1,
    AT_TARGET       : 2,
    BUBBLING_PHASE  : 3
});



/**
 * @name UIEvent
 * @param {Object} options
 */
UIEvent = function(options) {
    this._view = null;
    this._detail = 0;
};

UIEvent.prototype = new Event();
__extend__(UIEvent.prototype,{
    get view(){
        return this._view;
    },
    get detail(){
        return this._detail;
    },
    initUIEvent: function(type, bubbles, cancelable, windowObject, detail){
        this.initEvent(type, bubbles, cancelable);
        this._detail = 0;
        this._view = windowObject;
    }
});

var $onblur,
    $onfocus,
    $onresize;


/**
 * @name MouseEvent
 * @w3c:domlevel 2 
 * @uri http://www.w3.org/TR/2000/REC-DOM-Level-2-Events-20001113/events.html
 */
MouseEvent = function(options) {
    this._screenX= 0;
    this._screenY= 0;
    this._clientX= 0;
    this._clientY= 0;
    this._ctrlKey= false;
    this._metaKey= false;
    this._altKey= false;
    this._button= null;
    this._relatedTarget= null;
};
MouseEvent.prototype = new UIEvent();
__extend__(MouseEvent.prototype,{
    get screenX(){
        return this._screenX;
    },
    get screenY(){
        return this._screenY;
    },
    get clientX(){
        return this._clientX;
    },
    get clientY(){
        return this._clientY;
    },
    get ctrlKey(){
        return this._ctrlKey;
    },
    get altKey(){
        return this._altKey;
    },
    get shiftKey(){
        return this._shiftKey;
    },
    get metaKey(){
        return this._metaKey;
    },
    get button(){
        return this._button;
    },
    get relatedTarget(){
        return this._relatedTarget;
    },
    initMouseEvent: function(type, bubbles, cancelable, windowObject, detail,
            screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, 
            metaKey, button, relatedTarget){
        this.initUIEvent(type, bubbles, cancelable, windowObject, detail);
        this._screenX = screenX;
        this._screenY = screenY;
        this._clientX = clientX;
        this._clientY = clientY;
        this._ctrlKey = ctrlKey;
        this._altKey = altKey;
        this._shiftKey = shiftKey;
        this._metaKey = metaKey;
        this._button = button;
        this._relatedTarget = relatedTarget;
    }
});

/**
 * Interface KeyboardEvent (introduced in DOM Level 3)
 */
KeyboardEvent = function(options) {
    this._keyIdentifier = 0;
    this._keyLocation = 0;
    this._ctrlKey = false;
    this._metaKey = false;
    this._altKey = false;
    this._metaKey = false;
};
KeyboardEvent.prototype = new UIEvent();

__extend__(KeyboardEvent.prototype,{

    get ctrlKey(){
        return this._ctrlKey;
    },
    get altKey(){
        return this._altKey;
    },
    get shiftKey(){
        return this._shiftKey;
    },
    get metaKey(){
        return this._metaKey;
    },
    get button(){
        return this._button;
    },
    get relatedTarget(){
        return this._relatedTarget;
    },
    getModifiersState: function(keyIdentifier){

    },
    initMouseEvent: function(type, bubbles, cancelable, windowObject,
            keyIdentifier, keyLocation, modifiersList, repeat){
        this.initUIEvent(type, bubbles, cancelable, windowObject, 0);
        this._keyIdentifier = keyIdentifier;
        this._keyLocation = keyLocation;
        this._modifiersList = modifiersList;
        this._repeat = repeat;
    }
});

KeyboardEvent.DOM_KEY_LOCATION_STANDARD      = 0;
KeyboardEvent.DOM_KEY_LOCATION_LEFT          = 1;
KeyboardEvent.DOM_KEY_LOCATION_RIGHT         = 2;
KeyboardEvent.DOM_KEY_LOCATION_NUMPAD        = 3;
KeyboardEvent.DOM_KEY_LOCATION_MOBILE        = 4;
KeyboardEvent.DOM_KEY_LOCATION_JOYSTICK      = 5;



//We dont fire mutation events until someone has registered for them
var __supportedMutations__ = /DOMSubtreeModified|DOMNodeInserted|DOMNodeRemoved|DOMAttrModified|DOMCharacterDataModified/;

var __fireMutationEvents__ = Aspect.before({
    target: EventTarget,
    method: 'addEventListener'
}, function(target, type){
    if(type && type.match(__supportedMutations__)){
        //unweaving removes the __addEventListener__ aspect
        __fireMutationEvents__.unweave();
        // These two methods are enough to cover all dom 2 manipulations
        Aspect.around({
            target: Node,
            method:"removeChild"
        }, function(invocation){
            var event,
                node = invocation.arguments[0];
            event = node.ownerDocument.createEvent('MutationEvents');
            event.initEvent('DOMNodeRemoved', true, false, node.parentNode, null, null, null, null);
            node.dispatchEvent(event, false);
            return invocation.proceed();

        });
        Aspect.around({
            target: Node,
            method:"appendChild"
        }, function(invocation) {
            var event,
                node = invocation.proceed();
            event = node.ownerDocument.createEvent('MutationEvents');
            event.initEvent('DOMNodeInserted', true, false, node.parentNode, null, null, null, null);
            node.dispatchEvent(event, false);
            return node;
        });
    }
});

/**
 * @name MutationEvent
 * @param {Object} options
 */
MutationEvent = function(options) {
    this._cancelable = false;
    this._timeStamp = 0;
};

MutationEvent.prototype = new Event();
__extend__(MutationEvent.prototype,{
    get relatedNode(){
        return this._relatedNode;
    },
    get prevValue(){
        return this._prevValue;
    },
    get newValue(){
        return this._newValue;
    },
    get attrName(){
        return this._attrName;
    },
    get attrChange(){
        return this._attrChange;
    },
    initMutationEvent: function( type, bubbles, cancelable,
            relatedNode, prevValue, newValue, attrName, attrChange ){
        this._relatedNode = relatedNode;
        this._prevValue = prevValue;
        this._newValue = newValue;
        this._attrName = attrName;
        this._attrChange = attrChange;
        switch(type){
            case "DOMSubtreeModified":
                this.initEvent(type, true, false);
                break;
            case "DOMNodeInserted":
                this.initEvent(type, true, false);
                break;
            case "DOMNodeRemoved":
                this.initEvent(type, true, false);
                break;
            case "DOMNodeRemovedFromDocument":
                this.initEvent(type, false, false);
                break;
            case "DOMNodeInsertedIntoDocument":
                this.initEvent(type, false, false);
                break;
            case "DOMAttrModified":
                this.initEvent(type, true, false);
                break;
            case "DOMCharacterDataModified":
                this.initEvent(type, true, false);
                break;
            default:
                this.initEvent(type, bubbles, cancelable);
        }
    }
});

// constants
MutationEvent.ADDITION = 0;
MutationEvent.MODIFICATION = 1;
MutationEvent.REMOVAL = 2;


/**
 * @name EventException
 */
EventException = function(code) {
  this.code = code;
};
EventException.UNSPECIFIED_EVENT_TYPE_ERR = 0;
/**
 *
 * DOM Level 2: http://www.w3.org/TR/DOM-Level-2-Events/events.html
 * DOM Level 3: http://www.w3.org/TR/DOM-Level-3-Events/
 *
 * interface DocumentEvent {
 *   Event createEvent (in DOMString eventType)
 *      raises (DOMException);
 * };
 *
 * Firefox (3.6) exposes DocumentEvent
 * Safari (4) does NOT.
 */

/**
 * TODO: Not sure we need a full prototype.  We not just an regular object?
 */
DocumentEvent = function(){};
DocumentEvent.prototype.__EventMap__ = {
    // Safari4: singular and plural forms accepted
    // Firefox3.6: singular and plural forms accepted
    'Event'          : Event,
    'Events'         : Event,
    'UIEvent'        : UIEvent,
    'UIEvents'       : UIEvent,
    'MouseEvent'     : MouseEvent,
    'MouseEvents'    : MouseEvent,
    'MutationEvent'  : MutationEvent,
    'MutationEvents' : MutationEvent,

    // Safari4: accepts HTMLEvents, but not HTMLEvent
    // Firefox3.6: accepts HTMLEvents, but not HTMLEvent
    'HTMLEvent'      : Event,
    'HTMLEvents'     : Event,

    // Safari4: both not accepted
    // Firefox3.6, only KeyEvents is accepted
    'KeyEvent'       : KeyboardEvent,
    'KeyEvents'      : KeyboardEvent,

    // Safari4: both accepted
    // Firefox3.6: none accepted
    'KeyboardEvent'  : KeyboardEvent,
    'KeyboardEvents' : KeyboardEvent
};

DocumentEvent.prototype.createEvent = function(eventType) {
    var Clazz = this.__EventMap__[eventType];
    if (Clazz) {
        return new Clazz();
    }
    throw(new DOMException(DOMException.NOT_SUPPORTED_ERR));
};

__extend__(Document.prototype, DocumentEvent.prototype);

/**
 * @author john resig & the envjs team
 * @uri http://www.envjs.com/
 * @copyright 2008-2010
 * @license MIT
 */
//CLOSURE_END
}());

/*
 * Envjs timer.1.2.35 
 * Pure JavaScript Browser Environment
 * By John Resig <http://ejohn.org/> and the Envjs Team
 * Copyright 2008-2010 John Resig, under the MIT License
 * 
 * Parts of the implementation were originally written by:\
 * Steven Parkes
 * 
 * requires Envjs.wait, Envjs.sleep, Envjs.WAIT_INTERVAL
 */
var setTimeout,
    clearTimeout,
    setInterval,
    clearInterval;


    
/*
 * Envjs timer.1.2.35 
 * Pure JavaScript Browser Environment
 * By John Resig <http://ejohn.org/> and the Envjs Team
 * Copyright 2008-2010 John Resig, under the MIT License
 */

//CLOSURE_START
(function(){




/*
*       timer.js
*   implementation provided by Steven Parkes
*/

//private
var $timers = [],
    EVENT_LOOP_RUNNING = false;

$timers.lock = function(fn){
    Envjs.sync(fn)();
};

//private internal class
var Timer = function(fn, interval){
    this.fn = fn;
    this.interval = interval;
    this.at = Date.now() + interval;
    // allows for calling wait() from callbacks
    this.running = false;
};

Timer.prototype.start = function(){};
Timer.prototype.stop = function(){};

//static
Timer.normalize = function(time) {
    time = time*1;
    if ( isNaN(time) || time < 0 ) {
        time = 0;
    }

    if ( EVENT_LOOP_RUNNING && time < Timer.MIN_TIME ) {
        time = Timer.MIN_TIME;
    }
    return time;
};
// html5 says this should be at least 4, but the parser is using
// a setTimeout for the SAX stuff which messes up the world
Timer.MIN_TIME = /* 4 */ 0;

/**
 * @function setTimeout
 * @param {Object} fn
 * @param {Object} time
 */
setTimeout = function(fn, time){
    var num;
    time = Timer.normalize(time);
    $timers.lock(function(){
        num = $timers.length+1;
        var tfn;
        if (typeof fn == 'string') {
            tfn = function() {
                try {
                    // eval in global scope
                    eval(fn, null);
                } catch (e) {
                    console.log('timer error %s %s', fn, e);
                } finally {
                    clearInterval(num);
                }
            };
        } else {
            tfn = function() {
                try {
                    fn();
                } catch (e) {
                    console.log('timer error %s %s', fn, e);
                } finally {
                    clearInterval(num);
                }
            };
        }
        //console.log("Creating timer number %s", num);
        $timers[num] = new Timer(tfn, time);
        $timers[num].start();
    });
    return num;
};

/**
 * @function setInterval
 * @param {Object} fn
 * @param {Object} time
 */
setInterval = function(fn, time){
    //console.log('setting interval %s %s', time, fn.toString().substring(0,64));
    time = Timer.normalize(time);
    if ( time < 10 ) {
        time = 10;
    }
    if (typeof fn == 'string') {
        var fnstr = fn;
        fn = function() {
            eval(fnstr);
        };
    }
    var num;
    $timers.lock(function(){
        num = $timers.length+1;
        //Envjs.debug("Creating timer number "+num);
        $timers[num] = new Timer(fn, time);
        $timers[num].start();
    });
    return num;
};

/**
 * clearInterval
 * @param {Object} num
 */
clearInterval = clearTimeout = function(num){
    //console.log("clearing interval "+num);
    $timers.lock(function(){
        if ( $timers[num] ) {
            $timers[num].stop();
            delete $timers[num];
        }
    });
};

// wait === null/undefined: execute any timers as they fire,
//  waiting until there are none left
// wait(n) (n > 0): execute any timers as they fire until there
//  are none left waiting at least n ms but no more, even if there
//  are future events/current threads
// wait(0): execute any immediately runnable timers and return
// wait(-n): keep sleeping until the next event is more than n ms
//  in the future
//
// TODO: make a priority queue ...

Envjs.wait = function(wait) {
    //console.log('wait %s', wait);
    var delta_wait,
        start = Date.now(),
        was_running = EVENT_LOOP_RUNNING;

    if (wait < 0) {
        delta_wait = -wait;
        wait = 0;
    }
    EVENT_LOOP_RUNNING = true;
    if (wait !== 0 && wait !== null && wait !== undefined){
        wait += Date.now();
    }

    var earliest,
        timer,
        sleep,
        index,
        goal,
        now,
        nextfn,
		commandline;

    for (;;) {
        /*console.log('timer loop');
		try{
		commandline = Envjs.shell.next(' ');
		}catch(e){console.log(e);}
	    console.log('commandline %s', commandline);*/
        earliest = sleep = goal = now = nextfn = null;
        $timers.lock(function(){
            for(index in $timers){
                if( isNaN(index*0) ) {
                    continue;
                }
                timer = $timers[index];
                // determine timer with smallest run-at time that is
                // not already running
                if( !timer.running && ( !earliest || timer.at < earliest.at) ) {
                    earliest = timer;
                }
            }
        });
        //next sleep time
        sleep = earliest && earliest.at - Date.now();
		/*console.log('timer loop earliest %s sleep %s', earliest, sleep);*/
        if ( earliest && sleep <= 0 ) {
            nextfn = earliest.fn;
            try {
                /*console.log('running stack %s', nextfn.toString().substring(0,64));*/
                earliest.running = true;
                nextfn();
            } catch (e) {
                console.log('timer error %s %s', nextfn, e);
            } finally {
                earliest.running = false;
            }
            goal = earliest.at + earliest.interval;
            now = Date.now();
            if ( goal < now ) {
                earliest.at = now;
            } else {
                earliest.at = goal;
            }
            continue;
        }

        // bunch of subtle cases here ...
        if ( !earliest ) {
            // no events in the queue (but maybe XHR will bring in events, so ...
            if ( !wait || wait < Date.now() ) {
                // Loop ends if there are no events and a wait hasn't been
                // requested or has expired
                break;
            }
        // no events, but a wait requested: fall through to sleep
        } else {
            // there are events in the queue, but they aren't firable now
            /*if ( delta_wait && sleep <= delta_wait ) {
                //TODO: why waste a check on a tight
                // loop if it just falls through?
            // if they will happen within the next delta, fall through to sleep
            } else */if ( wait === 0 || ( wait > 0 && wait < Date.now () ) ) {
                // loop ends even if there are events but the user
                // specifcally asked not to wait too long
                break;
            }
            // there are events and the user wants to wait: fall through to sleep
        }

        // Related to ajax threads ... hopefully can go away ..
        var interval =  Envjs.WAIT_INTERVAL || 100;
        if ( !sleep || sleep > interval ) {
            sleep = interval;
        }
        //console.log('sleeping %s', sleep);
        Envjs.sleep(sleep);

    }
    EVENT_LOOP_RUNNING = was_running;
};


/**
 * @author john resig & the envjs team
 * @uri http://www.envjs.com/
 * @copyright 2008-2010
 * @license MIT
 */
//CLOSURE_END
}());
/*
 * Pure JavaScript Browser Environment
 * By John Resig <http://ejohn.org/> and the Envjs Team
 * Copyright 2008-2010 John Resig, under the MIT License
 *
 * This file simply provides the global definitions we need to
 * be able to correctly implement to core browser DOM HTML interfaces.
 */
var HTMLDocument,
    HTMLElement,
    HTMLCollection,
    HTMLAnchorElement,
    HTMLAreaElement,
    HTMLBaseElement,
    HTMLQuoteElement,
    HTMLBodyElement,
    HTMLBRElement,
    HTMLButtonElement,
    CanvasRenderingContext2D,
    HTMLCanvasElement,
    HTMLTableColElement,
    HTMLModElement,
    HTMLDivElement,
    HTMLDListElement,
    HTMLFieldSetElement,
    HTMLFormElement,
    HTMLFrameElement,
    HTMLFrameSetElement,
    HTMLHeadElement,
    HTMLHeadingElement,
    HTMLHRElement,
    HTMLHtmlElement,
    HTMLIFrameElement,
    HTMLImageElement,
    HTMLInputElement,
    HTMLLabelElement,
    HTMLLegendElement,
    HTMLLIElement,
    HTMLLinkElement,
    HTMLMapElement,
    HTMLMetaElement,
    HTMLObjectElement,
    HTMLOListElement,
    HTMLOptGroupElement,
    HTMLOptionElement,
    HTMLParagraphElement,
    HTMLParamElement,
    HTMLPreElement,
    HTMLScriptElement,
    HTMLSelectElement,
    HTMLSpanElement,
    HTMLStyleElement,
    HTMLTableElement,
    HTMLTableSectionElement,
    HTMLTableCellElement,
    HTMLTableDataCellElement,
    HTMLTableHeaderCellElement,
    HTMLTableRowElement,
    HTMLTextAreaElement,
    HTMLTitleElement,
    HTMLUListElement,
    HTMLUnknownElement,
    Image,
    Option,
    __loadImage__,
    __loadLink__;

/*
 * Envjs html.1.2.35 
 * Pure JavaScript Browser Environment
 * By John Resig <http://ejohn.org/> and the Envjs Team
 * Copyright 2008-2010 John Resig, under the MIT License
 */

//CLOSURE_START
(function(){





/**
 * @author ariel flesler
 *    http://flesler.blogspot.com/2008/11/fast-trim-function-for-javascript.html
 * @param {Object} str
 */
function __trim__( str ){
    return (str || "").replace( /^\s+|\s+$/g, "" );
}


/**
 * @author john resig
 */
// Helper method for extending one object with another.
function __extend__(a,b) {
    for ( var i in b ) {
        var g = b.__lookupGetter__(i), s = b.__lookupSetter__(i);
        if ( g || s ) {
            if ( g ) { a.__defineGetter__(i, g); }
            if ( s ) { a.__defineSetter__(i, s); }
        } else {
            a[i] = b[i];
        }
    } return a;
}

/**
 * @author john resig
 */
//from jQuery
function __setArray__( target, array ) {
    // Resetting the length to 0, then using the native Array push
    // is a super-fast way to populate an object with array-like properties
    target.length = 0;
    Array.prototype.push.apply( target, array );
}

/**
 * @class  HTMLDocument
 *      The Document interface represents the entire HTML or XML document.
 *      Conceptually, it is the root of the document tree, and provides
 *      the primary access to the document's data.
 *
 * @extends Document
 */
HTMLDocument = function(implementation, ownerWindow, referrer) {
    Document.apply(this, arguments);
    this.referrer = referrer || '';
    this.baseURI = "about:blank";
    this.ownerWindow = ownerWindow;
};

HTMLDocument.prototype = new Document();

__extend__(HTMLDocument.prototype, {
    createElement: function(tagName){
        var node;
        tagName = tagName.toUpperCase();
        // create Element specifying 'this' as ownerDocument
        // This is an html document so we need to use explicit interfaces per the
        //TODO: would be much faster as a big switch
        switch(tagName){
        case "A":
            node = new HTMLAnchorElement(this);break;
        case "AREA":
            node = new HTMLAreaElement(this);break;
        case "BASE":
            node = new HTMLBaseElement(this);break;
        case "BLOCKQUOTE":
            node = new HTMLQuoteElement(this);break;
        case "CANVAS":
            node = new HTMLCanvasElement(this);break;
        case "Q":
            node = new HTMLQuoteElement(this);break;
        case "BODY":
            node = new HTMLBodyElement(this);break;
        case "BR":
            node = new HTMLBRElement(this);break;
        case "BUTTON":
            node = new HTMLButtonElement(this);break;
        case "CAPTION":
            node = new HTMLElement(this);break;
        case "COL":
            node = new HTMLTableColElement(this);break;
        case "COLGROUP":
            node = new HTMLTableColElement(this);break;
        case "DEL":
            node = new HTMLModElement(this);break;
        case "INS":
            node = new HTMLModElement(this);break;
        case "DIV":
            node = new HTMLDivElement(this);break;
        case "DL":
            node = new HTMLDListElement(this);break;
        case "DT":
            node = new HTMLElement(this); break;
        case "FIELDSET":
            node = new HTMLFieldSetElement(this);break;
        case "FORM":
            node = new HTMLFormElement(this);break;
        case "FRAME":
            node = new HTMLFrameElement(this);break;
        case "FRAMESET":
            node = new HTMLFrameSetElement(this);break;
        case "H1":
            node = new HTMLHeadingElement(this);break;
        case "H2":
            node = new HTMLHeadingElement(this);break;
        case "H3":
            node = new HTMLHeadingElement(this);break;
        case "H4":
            node = new HTMLHeadingElement(this);break;
        case "H5":
            node = new HTMLHeadingElement(this);break;
        case "H6":
            node = new HTMLHeadingElement(this);break;
        case "HEAD":
            node = new HTMLHeadElement(this);break;
        case "HR":
            node = new HTMLHRElement(this);break;
        case "HTML":
            node = new HTMLHtmlElement(this);break;
        case "IFRAME":
            node = new HTMLIFrameElement(this);break;
        case "IMG":
            node = new HTMLImageElement(this);break;
        case "INPUT":
            node = new HTMLInputElement(this);break;
        case "LABEL":
            node = new HTMLLabelElement(this);break;
        case "LEGEND":
            node = new HTMLLegendElement(this);break;
        case "LI":
            node = new HTMLLIElement(this);break;
        case "LINK":
            node = new HTMLLinkElement(this);break;
        case "MAP":
            node = new HTMLMapElement(this);break;
        case "META":
            node = new HTMLMetaElement(this);break;
        case "NOSCRIPT":
            node = new HTMLElement(this);break;
        case "OBJECT":
            node = new HTMLObjectElement(this);break;
        case "OPTGROUP":
            node = new HTMLOptGroupElement(this);break;
        case "OL":
            node = new HTMLOListElement(this); break;
        case "OPTION":
            node = new HTMLOptionElement(this);break;
        case "P":
            node = new HTMLParagraphElement(this);break;
        case "PARAM":
            node = new HTMLParamElement(this);break;
        case "PRE":
            node = new HTMLPreElement(this);break;
        case "SCRIPT":
            node = new HTMLScriptElement(this);break;
        case "SELECT":
            node = new HTMLSelectElement(this);break;
        case "SMALL":
            node = new HTMLElement(this);break;
        case "SPAN":
            node = new HTMLSpanElement(this);break;
        case "STRONG":
            node = new HTMLElement(this);break;
        case "STYLE":
            node = new HTMLStyleElement(this);break;
        case "TABLE":
            node = new HTMLTableElement(this);break;
        case "TBODY":
            node = new HTMLTableSectionElement(this);break;
        case "TFOOT":
            node = new HTMLTableSectionElement(this);break;
        case "THEAD":
            node = new HTMLTableSectionElement(this);break;
        case "TD":
            node = new HTMLTableDataCellElement(this);break;
        case "TH":
            node = new HTMLTableHeaderCellElement(this);break;
        case "TEXTAREA":
            node = new HTMLTextAreaElement(this);break;
        case "TITLE":
            node = new HTMLTitleElement(this);break;
        case "TR":
            node = new HTMLTableRowElement(this);break;
        case "UL":
            node = new HTMLUListElement(this);break;
        default:
            node = new HTMLUnknownElement(this);
        }
        // assign values to properties (and aliases)
        node.nodeName  = tagName;
        return node;
    },
    createElementNS : function (uri, local) {
        //print('createElementNS :'+uri+" "+local);
        if(!uri){
            return this.createElement(local);
        }else if ("http://www.w3.org/1999/xhtml" == uri) {
            return this.createElement(local);
        } else if ("http://www.w3.org/1998/Math/MathML" == uri) {
            return this.createElement(local);
        } else if ("http://www.w3.org/2000/svg" == uri) {
 			return this.createElement(local);
		} else {
            return Document.prototype.createElementNS.apply(this,[uri, local]);
        }
    },
    get anchors(){
        return new HTMLCollection(this.getElementsByTagName('a'));
    },
    get applets(){
        return new HTMLCollection(this.getElementsByTagName('applet'));
    },
    get documentElement(){
        var html = Document.prototype.__lookupGetter__('documentElement').apply(this,[]);
        if( html === null){
            html = this.createElement('html');
            this.appendChild(html);
            html.appendChild(this.createElement('head'));
            html.appendChild(this.createElement('body'));
        }
        return html;
    },
    //document.head is non-standard
    get head(){
        //console.log('get head');
        if (!this.documentElement) {
            this.appendChild(this.createElement('html'));
        }
        var element = this.documentElement,
        	length = element.childNodes.length,
	        i;
        //check for the presence of the head element in this html doc
        for(i=0;i<length;i++){
            if(element.childNodes[i].nodeType === Node.ELEMENT_NODE){
                if(element.childNodes[i].tagName.toLowerCase() === 'head'){
                    return element.childNodes[i];
                }
            }
        }
        //no head?  ugh bad news html.. I guess we'll force the issue?
        var head = element.appendChild(this.createElement('head'));
        return head;
    },
    get title(){
        //console.log('get title');
        if (!this.documentElement) {
            this.appendChild(this.createElement('html'));
        }
        var title,
        	head = this.head,
	        length = head.childNodes.length,
	        i;
        //check for the presence of the title element in this head element
        for(i=0;i<length;i++){
            if(head.childNodes[i].nodeType === Node.ELEMENT_NODE){
                if(head.childNodes[i].tagName.toLowerCase() === 'title'){
                    return head.childNodes[i].textContent;
                }
            }
        }
        //no title?  ugh bad news html.. I guess we'll force the issue?
        title = head.appendChild(this.createElement('title'));
        return title.appendChild(this.createTextNode('Untitled Document')).nodeValue;
    },
    set title(titleStr){
        //console.log('set title %s', titleStr);
        if (!this.documentElement) {
            this.appendChild(this.createElement('html'));
        }
        var title = this.title;
        title.textContent = titleStr;
    },

    get body() {
        var element = this.documentElement,
            length = element.childNodes.length,
            i;
        for (i=0; i<length; i++) {
            if (element.childNodes[i].nodeType === Node.ELEMENT_NODE &&
                (element.childNodes[i].tagName === 'BODY' || 
				 element.childNodes[i].tagName === 'FRAMESET')) {
                return element.childNodes[i];
            }
        }
        return null;
    },
    set body() {
        /* in firefox this is a benevolent do nothing*/
        console.log('set body');
    },

    get cookie(){
        return Envjs.getCookies(this.location+'');
    },
    set cookie(cookie){
        return Envjs.setCookie(this.location+'', cookie);
    },

    /**
     * document.location
     *
     * should be identical to window.location
     *
     * HTML5:
     * http://dev.w3.org/html5/spec/Overview.html#the-location-interface
     *
     * Mozilla MDC:
     * https://developer.mozilla.org/en/DOM/document.location
     *
     */
    get location() {
        if (this.ownerWindow) {
            return this.ownerWindow.location;
        } else {
            return this.baseURI;
        }
    },
    set location(url) {
        this.baseURI = url;
        if (this.ownerWindow) {
            this.ownerWindow.location = url;
        }
    },

    /**
     * document.URL (read-only)
     *
     * HTML DOM Level 2:
     * http://www.w3.org/TR/DOM-Level-2-HTML/html.html#ID-46183437
     *
     * HTML5:
     * http://dev.w3.org/html5/spec/Overview.html#dom-document-url
     *
     * Mozilla MDC:
     * https://developer.mozilla.org/en/DOM/document.URL
     */
    get URL() {
        return this.location.href;
    },

    /**
     * document.domain
     *
     * HTML5 Spec:
     * http://dev.w3.org/html5/spec/Overview.html#dom-document-domain
     *
     * Mozilla MDC:
     * https://developer.mozilla.org/en/DOM/document.domain
     *
     */
    get domain(){
        var HOSTNAME = new RegExp('\/\/([^\:\/]+)'),
        matches = HOSTNAME.exec(this.baseURI);
        return matches&&matches.length>1?matches[1]:"";
    },
    set domain(value){
        var i,
        domainParts = this.domain.split('.').reverse(),
        newDomainParts = value.split('.').reverse();
        if(newDomainParts.length > 1){
            for(i=0;i<newDomainParts.length;i++){
                if(!(newDomainParts[i] === domainParts[i])){
                    return;
                }
            }
            this.baseURI = this.baseURI.replace(domainParts.join('.'), value);
        }
    },

    get forms(){
        return new HTMLCollection(this.getElementsByTagName('form'));
    },
    get images(){
        return new HTMLCollection(this.getElementsByTagName('img'));
    },
    get lastModified(){
        /* TODO */
        return this._lastModified;
    },
    get links(){
        return new HTMLCollection(this.getElementsByTagName('a'));
    },
    getElementsByName : function(name){
        //returns a real Array + the NodeList
        var retNodes = __extend__([],new NodeList(this, this.documentElement)),
        node;
        // loop through all Elements
        var all = this.getElementsByTagName('*');
        for (var i=0; i < all.length; i++) {
            node = all[i];
            if (node.nodeType === Node.ELEMENT_NODE &&
                node.getAttribute('name') == name) {
                retNodes.push(node);
            }
        }
        return retNodes;
    },
    toString: function(){
        return "[object HTMLDocument]";
    },
    get innerHTML(){
        return this.documentElement.outerHTML;
    }
});



Aspect.around({
    target: Node,
    method:"appendChild"
}, function(invocation) {
    var event,
        okay,
        node = invocation.proceed(),
        doc = node.ownerDocument,
		target;

    //console.log('element appended: %s %s %s', node+'', node.nodeName, node.namespaceURI);
    if((node.nodeType !== Node.ELEMENT_NODE)){
        //for now we are only handling element insertions.  probably
        //we will need to handle text node changes to script tags and
        //changes to src attributes
        return node;
    }
	
	if(node.tagName&&node.tagName.toLowerCase()=="input"){
		target = node.parentNode;
		//console.log('adding named map for input');
		while(target&&target.tagName&&target.tagName.toLowerCase()!="form"){
			//console.log('possible target for named map for input is %s', target);
			target = target.parentNode;
		}
		if(target){
			//console.log('target for named map for input is %s', target);
			__addNamedMap__(target, node);
		}
	}
    //console.log('appended html element %s %s %s', node.namespaceURI, node.nodeName, node);
    switch(doc.parsing){
        case true:

        /**
         * Very special case.  While in parsing mode, in head, a
         * script can add another script tag to the head, and it will
         * be evaluated.  This is tested in 'ant fulldoc-spec' tests.
         *
         * Not quite sure if the require that the new script tag must
         * be in the head is correct or not.  NamespaceURI == null
         * might also need to corrected too.
         */
        if (node.tagName.toLowerCase() === 'script' && 
			(node.namespaceURI === "" || 
			 node.namespaceURI === "http://www.w3.org/1999/xhtml" || 
			 node.namespaceURI === null) ) {
            //console.log('appending script while parsing');
            if((this.nodeName.toLowerCase() === 'head')){
                try{
                    okay = Envjs.loadLocalScript(node, null);
                    //console.log('loaded script? %s %s', node.uuid, okay);
                    // only fire event if we actually had something to load
                    if (node.src && node.src.length > 0){
                        event = doc.createEvent('HTMLEvents');
                        event.initEvent( okay ? "load" : "error", false, false );
                        node.dispatchEvent( event, false );
                    }
                }catch(e){
                    console.log('error loading html element %s %e', node, e.toString());
                }
            }
        }
        break;
        case false:
            switch(node.namespaceURI){
                case null:
                    //fall through
                case "":
                    //fall through
                case "http://www.w3.org/1999/xhtml":
                    switch(node.tagName.toLowerCase()){
                    case 'style':
                        document.styleSheets.push(CSSStyleSheet(node));
                        break;
                    case 'script':
                        //console.log('appending script %s', node.src);
                        if((this.nodeName.toLowerCase() === 'head')){
                            try{
                                okay = Envjs.loadLocalScript(node, null);
                                //console.log('loaded script? %s %s', node.uuid, okay);
                                // only fire event if we actually had something to load
                                if (node.src && node.src.length > 0){
                                    event = doc.createEvent('HTMLEvents');
                                    event.initEvent( okay ? "load" : "error", false, false );
                                    node.dispatchEvent( event, false );
                                }
                            }catch(e){
                                console.log('error loading html element %s %e', node, e.toString());
                            }
                        }
                        break;
                    case 'frame':
                    case 'iframe':
                        node.contentWindow = { };
                        node.contentDocument = new HTMLDocument(new DOMImplementation(), node.contentWindow);
                        node.contentWindow.document = node.contentDocument;
                        try{
                            Window;
                        }catch(e){
                            node.contentDocument.addEventListener('DOMContentLoaded', function(){
                                event = node.contentDocument.createEvent('HTMLEvents');
                                event.initEvent("load", false, false);
                                node.dispatchEvent( event, false );
                            });
                            console.log('error loading html element %s %e', node, e.toString());
                        }
                        try{
                            if (node.src && node.src.length > 0){
                                //console.log("trigger load on frame from appendChild %s", node.src);
                                Envjs.loadFrame(node, Envjs.uri(node.src, doc.location+''));
                            }else{
                                Envjs.loadFrame(node);
                            }
                        }catch(e){
                            console.log('error loading html element %s %e', node, e.toString());
                        }
                        break;

                    case 'link':
                        if (node.href && node.href.length > 0) {
                            __loadLink__(node, node.href);
                        }
                        break;
                        /*
                          case 'img':
                          if (node.src && node.src.length > 0){
                          // don't actually load anything, so we're "done" immediately:
                          event = doc.createEvent('HTMLEvents');
                          event.initEvent("load", false, false);
                          node.dispatchEvent( event, false );
                          }
                          break;
                        */
                    case 'option':
                        node._updateoptions();
                        break;
                    default:
                        if(node.getAttribute('onload')){
                            //console.log('calling attribute onload %s | %s', node.onload, node.tagName);
                            node.onload();
                        }
                        break;
                    }//switch on name
                default:
                    break;
            }//switch on ns
            break;
        default:
            // console.log('element appended: %s %s', node+'', node.namespaceURI);
    }//switch on doc.parsing
    return node;

});

Aspect.around({
    target: Node,
    method:"removeChild"
}, function(invocation) {
    var event,
        okay,
        node = invocation.proceed(),
        doc = node.ownerDocument;
    if((node.nodeType !== Node.ELEMENT_NODE)){
        //for now we are only handling element insertions.  probably we will need
        //to handle text node changes to script tags and changes to src
        //attributes
        if(node.nodeType !== Node.DOCUMENT_NODE && node.uuid){
            //console.log('removing event listeners, %s', node, node.uuid);
            node.removeEventListener('*', null, null);
        }
        return node;
    }
    //console.log('appended html element %s %s %s', node.namespaceURI, node.nodeName, node);
	if(node.tagName&&node.tagName.toLowerCase()=="input"){
		target = node.parentNode;
		//console.log('adding named map for input');
		while(target&&target.tagName&&target.tagName.toLowerCase()!="form"){
			//console.log('possible target for named map for input is %s', target);
			target = target.parentNode;
		}
		if(target){
			//console.log('target for named map for input is %s', target);
			__removeNamedMap__(target, node);
		}
	}
    switch(doc.parsing){
        case true:
            //handled by parser if included
            break;
        case false:
            switch(node.namespaceURI){
            case null:
                //fall through
            case "":
                //fall through
            case "http://www.w3.org/1999/xhtml":
                //this is interesting dillema since our event engine is
                //storing the registered events in an array accessed
                //by the uuid property of the node.  unforunately this
                //means listeners hang out way after(forever ;)) the node
                //has been removed and gone out of scope.
                //console.log('removing event listeners, %s', node, node.uuid);
                node.removeEventListener('*', null, null);
                switch(node.tagName.toLowerCase()){
                case 'frame':
                case 'iframe':
                    try{
                        //console.log('removing iframe document');
                        try{
                            Envjs.unloadFrame(node);
                        }catch(e){
                            console.log('error freeing resources from frame %s', e);
                        }
                        node.contentWindow = null;
                        node.contentDocument = null;
                    }catch(e){
                        console.log('error unloading html element %s %e', node, e.toString());
                    }
                    break;
                default:
                    break;
                }//switch on name
            default:
                break;
            }//switch on ns
            break;
        default:
            console.log('element appended: %s %s', node+'', node.namespaceURI);
    }//switch on doc.parsing
    return node;

});



/**
 * Named Element Support
 *
 *
 */

/*
 *
 * @returns 'name' if the node has a appropriate name
 *          null if node does not have a name
 */

var __isNamedElement__ = function(node) {
    if (node.nodeType !== Node.ELEMENT_NODE) {
        return null;
    }
    var tagName = node.tagName.toLowerCase();
    var nodename = null;

    switch (tagName) {
        case 'embed':
        case 'form':
        case 'iframe':
		case 'input':
            nodename = node.getAttribute('name');
            break;
        case 'applet':
            nodename = node.id;
            break;
        case 'object':
            // TODO: object needs to be 'fallback free'
            nodename = node.id;
            break;
        case 'img':
            nodename = node.id;
            if (!nodename || ! node.getAttribute('name')) {
                nodename = null;
            }
            break;
    }
    return (nodename) ? nodename : null;
};


var __addNamedMap__ = function(target, node) {
    var nodename = __isNamedElement__(node);
    if (nodename) {
       	target.__defineGetter__(nodename, function() {
            return node;
        });	
		target.__defineSetter__(nodename, function(value) {
	        return value;
	    });
    }
};

var __removeNamedMap__ = function(target, node) {
    if (!node) {
        return;
    }
    var nodename = __isNamedElement__(node);
    if (nodename) {
		delete target[nodename];
    }
};

/**
 * @name HTMLEvents
 * @w3c:domlevel 2
 * @uri http://www.w3.org/TR/2000/REC-DOM-Level-2-Events-20001113/events.html
 */

var __eval__ = function(script, node){
    if (!script == "" && Envjs.scriptTypes['']){
        // don't assemble environment if no script...
        try{
            Envjs.eval(node.ownerDocument.ownerWindow, script, script+" ("+node+")");
        }catch(e){
            console.log('error evaluating %s', e);
        }
    }
};

var HTMLEvents= function(){};
HTMLEvents.prototype = {
    onload: function(event){
        __eval__(this.getAttribute('onload')||'', this);
    },
    onunload: function(event){
        __eval__(this.getAttribute('onunload')||'', this);
    },
    onabort: function(event){
        __eval__(this.getAttribute('onabort')||'', this);
    },
    onerror: function(event){
        __eval__(this.getAttribute('onerror')||'', this);
    },
    onselect: function(event){
        __eval__(this.getAttribute('onselect')||'', this);
    },
    onchange: function(event){
        __eval__(this.getAttribute('onchange')||'', this);
    },
    onsubmit: function(event){
        if (__eval__(this.getAttribute('onsubmit')||'', this)) {
            this.submit();
        }
    },
    onreset: function(event){
        __eval__(this.getAttribute('onreset')||'', this);
    },
    onfocus: function(event){
        __eval__(this.getAttribute('onfocus')||'', this);
    },
    onblur: function(event){
        __eval__(this.getAttribute('onblur')||'', this);
    },
    onresize: function(event){
        __eval__(this.getAttribute('onresize')||'', this);
    },
    onscroll: function(event){
        __eval__(this.getAttribute('onscroll')||'', this);
    }
};

//HTMLDocument, HTMLFramesetElement, HTMLObjectElement
var  __load__ = function(element){
    var event = new Event('HTMLEvents');
    event.initEvent("load", false, false);
    element.dispatchEvent(event);
    return event;
};

//HTMLFramesetElement, HTMLBodyElement
var  __unload__ = function(element){
    var event = new Event('HTMLEvents');
    event.initEvent("unload", false, false);
    element.dispatchEvent(event);
    return event;
};

//HTMLObjectElement
var  __abort__ = function(element){
    var event = new Event('HTMLEvents');
    event.initEvent("abort", true, false);
    element.dispatchEvent(event);
    return event;
};

//HTMLFramesetElement, HTMLObjectElement, HTMLBodyElement
var  __error__ = function(element){
    var event = new Event('HTMLEvents');
    event.initEvent("error", true, false);
    element.dispatchEvent(event);
    return event;
};

//HTMLInputElement, HTMLTextAreaElement
var  __select__ = function(element){
    var event = new Event('HTMLEvents');
    event.initEvent("select", true, false);
    element.dispatchEvent(event);
    return event;
};

//HTMLInputElement, HTMLSelectElement, HTMLTextAreaElement
var  __change__ = function(element){
    var event = new Event('HTMLEvents');
    event.initEvent("change", true, false);
    element.dispatchEvent(event);
    return event;
};

//HtmlFormElement
var __submit__ = function(element){
    var event = new Event('HTMLEvents');
    event.initEvent("submit", true, true);
    element.dispatchEvent(event);
    return event;
};

//HtmlFormElement
var  __reset__ = function(element){
    var event = new Event('HTMLEvents');
    event.initEvent("reset", false, false);
    element.dispatchEvent(event);
    return event;
};

//LABEL, INPUT, SELECT, TEXTAREA, and BUTTON
var __focus__ = function(element){
    var event = new Event('HTMLEvents');
    event.initEvent("focus", false, false);
    element.dispatchEvent(event);
    return event;
};

//LABEL, INPUT, SELECT, TEXTAREA, and BUTTON
var __blur__ = function(element){
    var event = new Event('HTMLEvents');
    event.initEvent("blur", false, false);
    element.dispatchEvent(event);
    return event;
};

//Window
var __resize__ = function(element){
    var event = new Event('HTMLEvents');
    event.initEvent("resize", true, false);
    element.dispatchEvent(event);
    return event;
};

//Window
var __scroll__ = function(element){
    var event = new Event('HTMLEvents');
    event.initEvent("scroll", true, false);
    element.dispatchEvent(event);
    return event;
};

/**
 * @name KeyboardEvents
 * @w3c:domlevel 2 
 * @uri http://www.w3.org/TR/2000/REC-DOM-Level-2-Events-20001113/events.html
 */
var KeyboardEvents= function(){};
KeyboardEvents.prototype = {
    onkeydown: function(event){
        __eval__(this.getAttribute('onkeydown')||'', this);
    },
    onkeypress: function(event){
        __eval__(this.getAttribute('onkeypress')||'', this);
    },
    onkeyup: function(event){
        __eval__(this.getAttribute('onkeyup')||'', this);
    }
};


var __registerKeyboardEventAttrs__ = function(elm){
    if(elm.hasAttribute('onkeydown')){ 
        elm.addEventListener('keydown', elm.onkeydown, false); 
    }
    if(elm.hasAttribute('onkeypress')){ 
        elm.addEventListener('keypress', elm.onkeypress, false); 
    }
    if(elm.hasAttribute('onkeyup')){ 
        elm.addEventListener('keyup', elm.onkeyup, false); 
    }
    return elm;
};

//HTMLInputElement, HTMLSelectElement, HTMLTextAreaElement
var  __keydown__ = function(element){
    var event = new Event('KeyboardEvents');
    event.initEvent("keydown", false, false);
    element.dispatchEvent(event);
};

//HTMLInputElement, HTMLSelectElement, HTMLTextAreaElement
var  __keypress__ = function(element){
    var event = new Event('KeyboardEvents');
    event.initEvent("keypress", false, false);
    element.dispatchEvent(event);
};

//HTMLInputElement, HTMLSelectElement, HTMLTextAreaElement
var  __keyup__ = function(element){
    var event = new Event('KeyboardEvents');
    event.initEvent("keyup", false, false);
    element.dispatchEvent(event);
};

/**
 * @name MaouseEvents
 * @w3c:domlevel 2 
 * @uri http://www.w3.org/TR/2000/REC-DOM-Level-2-Events-20001113/events.html
 */
var MouseEvents= function(){};
MouseEvents.prototype = {
    onclick: function(event){
        __eval__(this.getAttribute('onclick')||'', this);
    },
    ondblclick: function(event){
        __eval__(this.getAttribute('ondblclick')||'', this);
    },
    onmousedown: function(event){
        __eval__(this.getAttribute('onmousedown')||'', this);
    },
    onmousemove: function(event){
        __eval__(this.getAttribute('onmousemove')||'', this);
    },
    onmouseout: function(event){
        __eval__(this.getAttribute('onmouseout')||'', this);
    },
    onmouseover: function(event){
        __eval__(this.getAttribute('onmouseover')||'', this);
    },
    onmouseup: function(event){
        __eval__(this.getAttribute('onmouseup')||'', this);
    }  
};

var __registerMouseEventAttrs__ = function(elm){
    if(elm.hasAttribute('onclick')){ 
        elm.addEventListener('click', elm.onclick, false); 
    }
    if(elm.hasAttribute('ondblclick')){ 
        elm.addEventListener('dblclick', elm.ondblclick, false); 
    }
    if(elm.hasAttribute('onmousedown')){ 
        elm.addEventListener('mousedown', elm.onmousedown, false); 
    }
    if(elm.hasAttribute('onmousemove')){ 
        elm.addEventListener('mousemove', elm.onmousemove, false); 
    }
    if(elm.hasAttribute('onmouseout')){ 
        elm.addEventListener('mouseout', elm.onmouseout, false); 
    }
    if(elm.hasAttribute('onmouseover')){ 
        elm.addEventListener('mouseover', elm.onmouseover, false); 
    }
    if(elm.hasAttribute('onmouseup')){ 
        elm.addEventListener('mouseup', elm.onmouseup, false); 
    }
    return elm;
};


var  __click__ = function(element){
    var event = new Event('MouseEvents');
    event.initEvent("click", true, true, null, 0,
                0, 0, 0, 0, false, false, false, 
                false, null, null);
    element.dispatchEvent(event);
};
var  __mousedown__ = function(element){
    var event = new Event('MouseEvents');
    event.initEvent("mousedown", true, true, null, 0,
                0, 0, 0, 0, false, false, false, 
                false, null, null);
    element.dispatchEvent(event);
};
var  __mouseup__ = function(element){
    var event = new Event('MouseEvents');
    event.initEvent("mouseup", true, true, null, 0,
                0, 0, 0, 0, false, false, false, 
                false, null, null);
    element.dispatchEvent(event);
};
var  __mouseover__ = function(element){
    var event = new Event('MouseEvents');
    event.initEvent("mouseover", true, true, null, 0,
                0, 0, 0, 0, false, false, false, 
                false, null, null);
    element.dispatchEvent(event);
};
var  __mousemove__ = function(element){
    var event = new Event('MouseEvents');
    event.initEvent("mousemove", true, true, null, 0,
                0, 0, 0, 0, false, false, false, 
                false, null, null);
    element.dispatchEvent(event);
};
var  __mouseout__ = function(element){
    var event = new Event('MouseEvents');
    event.initEvent("mouseout", true, true, null, 0,
                0, 0, 0, 0, false, false, false, 
                false, null, null);
    element.dispatchEvent(event);
};

/**
 * HTMLElement - DOM Level 2
 */


/* Hack for http://www.prototypejs.org/
 *
 * Prototype 1.6 (the library) creates a new global Element, which causes
 * envjs to use the wrong Element.
 *
 * http://envjs.lighthouseapp.com/projects/21590/tickets/108-prototypejs-wont-load-due-it-clobbering-element
 *
 * Options:
 *  (1) Rename the dom/element to something else
 *       rejected: been done before. people want Element.
 *  (2) merge dom+html and not export Element to global namespace
 *      (meaning we would use a local var Element in a closure, so prototype
 *      can do what ever it wants)
 *       rejected: want dom and html separate
 *  (3) use global namespace (put everything under Envjs = {})
 *       rejected: massive change
 *  (4) use commonjs modules (similar to (3) in spirit)
 *       rejected: massive change
 *
 *  or
 *
 *  (5) take a reference to Element during initial loading ("compile
 *      time"), and use the reference instead of "Element".  That's
 *      what the next line does.  We use __DOMElement__ if we need to
 *      reference the parent class.  Only this file explcity uses
 *      Element so this should work, and is the most minimal change I
 *      could think of with no external API changes.
 *
 */
var  __DOMElement__ = Element;

HTMLElement = function(ownerDocument) {
    __DOMElement__.apply(this, arguments);
};

HTMLElement.prototype = new Element();
__extend__(HTMLElement.prototype, HTMLEvents.prototype);
__extend__(HTMLElement.prototype, {
    get className() {
        return this.getAttribute("class")||'';
    },
    set className(value) {
        return this.setAttribute("class",__trim__(value));
    },
    get dir() {
        return this.getAttribute("dir")||"ltr";
    },
    set dir(val) {
        return this.setAttribute("dir",val);
    },
    get id(){
        return this.getAttribute('id') || '';
    },
    set id(id){
        this.setAttribute('id', id);
    },
    get innerHTML(){
        var ret = "",
        i;

        // create string containing the concatenation of the string
        // values of each child
        for (i=0; i < this.childNodes.length; i++) {
            if(this.childNodes[i]){
                if(this.childNodes[i].nodeType === Node.ELEMENT_NODE){
                    ret += this.childNodes[i].xhtml;
                } else if (this.childNodes[i].nodeType === Node.TEXT_NODE && i>0 &&
                           this.childNodes[i-1].nodeType === Node.TEXT_NODE){
                    //add a single space between adjacent text nodes
                    ret += " "+this.childNodes[i].xml;
                }else{
                    ret += this.childNodes[i].xml;
                }
            }
        }
        return ret;
    },
    get lang() {
        return this.getAttribute("lang");
    },
    set lang(val) {
        return this.setAttribute("lang",val);
    },
    get offsetHeight(){
        return Number((this.style.height || '').replace("px",""));
    },
    get offsetWidth(){
        return Number((this.style.width || '').replace("px",""));
    },
    offsetLeft: 0,
    offsetRight: 0,
    get offsetParent(){
        /* TODO */
        return;
    },
    set offsetParent(element){
        /* TODO */
        return;
    },
    scrollHeight: 0,
    scrollWidth: 0,
    scrollLeft: 0,
    scrollRight: 0,
    get style(){
        return this.getAttribute('style')||'';
    },
    get title() {
        return this.getAttribute("title");
    },
    set title(value) {
        return this.setAttribute("title", value);
    },
    get tabIndex(){
        var tabindex = this.getAttribute('tabindex');
        if(tabindex!==null){
            return Number(tabindex);
        } else {
            return 0;
        }
    },
    set tabIndex(value){
        if (value === undefined || value === null) {
            value = 0;
        }
        this.setAttribute('tabindex',Number(value));
    },
    get outerHTML(){
        //Not in the specs but I'll leave it here for now.
        return this.xhtml;
    },
    scrollIntoView: function(){
        /*TODO*/
        return;
    },
    toString: function(){
        return '[object HTMLElement]';
    },
    get xhtml() {
        // HTMLDocument.xhtml is non-standard
        // This is exactly like Document.xml except the tagName has to be
        // lower cased.  I dont like to duplicate this but its really not
        // a simple work around between xml and html serialization via
        // XMLSerializer (which uppercases html tags) and innerHTML (which
        // lowercases tags)

        var ret = "",
            ns = "",
            name = (this.tagName+"").toLowerCase(),
            attrs,
            attrstring = "",
			style = false,
            i;

        // serialize namespace declarations
        if (this.namespaceURI){
            if((this === this.ownerDocument.documentElement) ||
               (!this.parentNode) ||
               (this.parentNode &&
                (this.parentNode.namespaceURI !== this.namespaceURI))) {
                ns = ' xmlns' + (this.prefix ? (':' + this.prefix) : '') +
                    '="' + this.namespaceURI + '"';
            }
        }

        // serialize Attribute declarations
        attrs = this.attributes;
        for(i=0;i< attrs.length;i++){
            attrstring += " "+attrs[i].name+'="'+attrs[i].xml+'"';
			if(attrs[i].name == 'style'){
				style = true;
			}
        }
		if(!style ){
			style = this.getAttribute('style');
			if(style)
				attrstring += ' style="'+style+'"';
		}

        if(this.hasChildNodes()){
            // serialize this Element
	        //console.log('serializing childNodes for %s', name);
            ret += "<" + name + ns + attrstring +">";
            for(i=0;i< this.childNodes.length;i++){
                console.debug('xhtml for '+ this);
                ret += 'xhtml' in this.childNodes[i] ?
                    this.childNodes[i].xhtml :
                    this.childNodes[i].xml;
            }
            ret += "</" + name + ">";
        }else{	
            //console.log('no childNodes to serialize for %s', name);
            switch(name){
            case 'script':
            case 'noscript':
                ret += "<" + name + ns + attrstring +"></"+name+">";
                break;
            default:
                ret += "<" + name + ns + attrstring +"/>";
            }
        }

        return ret;
    },

    /**
     * setAttribute use a dispatch table that other tags can set to
     *  "listen" to various values being set.  The dispatch table
     * and registration functions are at the end of the file.
     *
     */

    setAttribute: function(name, value) {
        var result = __DOMElement__.prototype.setAttribute.apply(this, arguments);
        __addNamedMap__(this.ownerDocument, this);
        var tagname = this.tagName;
        var callback = HTMLElement.getAttributeCallback('set', tagname, name);
        if (callback) {
            callback(this, value);
        }
    },
    setAttributeNS: function(namespaceURI, name, value) {
        var result = __DOMElement__.prototype.setAttributeNS.apply(this, arguments);
        __addNamedMap__(this.ownerDocument, this);
        var tagname = this.tagName;
        var callback = HTMLElement.getAttributeCallback('set', tagname, name);
        if (callback) {
            callback(this, value);
        }

        return result;
    },
    setAttributeNode: function(newnode) {
        var result = __DOMElement__.prototype.setAttributeNode.apply(this, arguments);
        __addNamedMap__(this.ownerDocument, this);
        var tagname = this.tagName;
        var callback = HTMLElement.getAttributeCallback('set', tagname, newnode.name);
        if (callback) {
            callback(this, node.value);
        }
        return result;
    },
    setAttributeNodeNS: function(newnode) {
        var result = __DOMElement__.prototype.setAttributeNodeNS.apply(this, arguments);
        __addNamedMap__(this.ownerDocument, this);
        var tagname = this.tagName;
        var callback = HTMLElement.getAttributeCallback('set', tagname, newnode.name);
        if (callback) {
            callback(this, node.value);
        }
        return result;
    },
    removeAttribute: function(name) {
        __removeNamedMap__(this.ownerDocument, this);
        return __DOMElement__.prototype.removeAttribute.apply(this, arguments);
    },
    removeAttributeNS: function(namespace, localname) {
        __removeNamedMap__(this.ownerDocument, this);
        return __DOMElement__.prototype.removeAttributeNS.apply(this, arguments);
    },
    removeAttributeNode: function(name) {
        __removeNamedMap__(this.ownerDocument, this);
        return __DOMElement__.prototype.removeAttribute.apply(this, arguments);
    },
    removeChild: function(oldChild) {
        __removeNamedMap__(this.ownerDocument, oldChild);
        return __DOMElement__.prototype.removeChild.apply(this, arguments);
    },
    importNode: function(othernode, deep) {
        var newnode = __DOMElement__.prototype.importNode.apply(this, arguments);
        __addNamedMap__(this.ownerDocument, newnode);
        return newnode;
    },

    // not actually sure if this is needed or not
    replaceNode: function(newchild, oldchild) {
        var newnode = __DOMElement__.prototype.replaceNode.apply(this, arguments);
        __removeNamedMap__(this.ownerDocument, oldchild);
        __addNamedMap__(this.ownerDocument, newnode);
                return newnode;
    }
});


HTMLElement.attributeCallbacks = {};
HTMLElement.registerSetAttribute = function(tag, attrib, callbackfn) {
    HTMLElement.attributeCallbacks[tag + ':set:' + attrib] = callbackfn;
};
HTMLElement.registerRemoveAttribute = function(tag, attrib, callbackfn) {
    HTMLElement.attributeCallbacks[tag + ':remove:' + attrib] = callbackfn;
};

/**
 * This is really only useful internally
 *
 */
HTMLElement.getAttributeCallback = function(type, tag, attrib) {
    return HTMLElement.attributeCallbacks[tag + ':' + type + ':' + attrib] || null;
};
/*
 * HTMLCollection
 *
 * HTML5 -- 2.7.2.1 HTMLCollection
 * http://dev.w3.org/html5/spec/Overview.html#htmlcollection
 * http://dev.w3.org/html5/spec/Overview.html#collections
 */
HTMLCollection = function(nodelist, type) {

    __setArray__(this, []);
    var n;
    for (var i=0; i<nodelist.length; i++) {
        this[i] = nodelist[i];
        n = nodelist[i].name;
        if (n) {
            this[n] = nodelist[i];
        }
        n = nodelist[i].id;
        if (n) {
            this[n] = nodelist[i];
        }
    }

    this.length = nodelist.length;
};

HTMLCollection.prototype = {

    item: function (idx) {
        return  ((idx >= 0) && (idx < this.length)) ? this[idx] : null;
    },

    namedItem: function (name) {
        return this[name] || null;
    },

    toString: function() {
        return '[object HTMLCollection]';
    }
};
/*
 *  a set of convenience classes to centralize implementation of
 * properties and methods across multiple in-form elements
 *
 *  the hierarchy of related HTML elements and their members is as follows:
 *
 * Condensed Version
 *
 *  HTMLInputCommon
 *     * legent (no value attr)
 *     * fieldset (no value attr)
 *     * label (no value attr)
 *     * option (custom value)
 *  HTMLTypeValueInputs (extends InputCommon)
 *     * select  (custom value)
 *     * button (just sets value)
 *  HTMLInputAreaCommon (extends TypeValueIput)
 *     * input  (custom)
 *     * textarea (just sets value)
 *
 * -----------------------
 *    HTMLInputCommon:  common to all elements
 *       .form
 *
 *    <legend>
 *          [common plus:]
 *       .align
 *
 *    <fieldset>
 *          [identical to "legend" plus:]
 *       .margin
 *
 *
 *  ****
 *
 *    <label>
 *          [common plus:]
 *       .dataFormatAs
 *       .htmlFor
 *       [plus data properties]
 *
 *    <option>
 *          [common plus:]
 *       .defaultSelected
 *       .index
 *       .label
 *       .selected
 *       .text
 *       .value   // unique implementation, not duplicated
 *       .form    // unique implementation, not duplicated
 *  ****
 *
 *    HTMLTypeValueInputs:  common to remaining elements
 *          [common plus:]
 *       .name
 *       .type
 *       .value
 *       [plus data properties]
 *
 *
 *    <select>
 *       .length
 *       .multiple
 *       .options[]
 *       .selectedIndex
 *       .add()
 *       .remove()
 *       .item()                                       // unimplemented
 *       .namedItem()                                  // unimplemented
 *       [plus ".onchange"]
 *       [plus focus events]
 *       [plus data properties]
 *       [plus ".size"]
 *
 *    <button>
 *       .dataFormatAs   // duplicated from above, oh well....
 *       [plus ".status", ".createTextRange()"]
 *
 *  ****
 *
 *    HTMLInputAreaCommon:  common to remaining elements
 *       .defaultValue
 *       .readOnly
 *       .handleEvent()                                // unimplemented
 *       .select()
 *       .onselect
 *       [plus ".size"]
 *       [plus ".status", ".createTextRange()"]
 *       [plus focus events]
 *       [plus ".onchange"]
 *
 *    <textarea>
 *       .cols
 *       .rows
 *       .wrap                                         // unimplemented
 *       .onscroll                                     // unimplemented
 *
 *    <input>
 *       .alt
 *       .accept                                       // unimplemented
 *       .checked
 *       .complete                                     // unimplemented
 *       .defaultChecked
 *       .dynsrc                                       // unimplemented
 *       .height
 *       .hspace                                       // unimplemented
 *       .indeterminate                                // unimplemented
 *       .loop                                         // unimplemented
 *       .lowsrc                                       // unimplemented
 *       .maxLength
 *       .src
 *       .start                                        // unimplemented
 *       .useMap
 *       .vspace                                       // unimplemented
 *       .width
 *       .onclick
 *       [plus ".size"]
 *       [plus ".status", ".createTextRange()"]

 *    [data properties]                                // unimplemented
 *       .dataFld
 *       .dataSrc

 *    [status stuff]                                   // unimplemented
 *       .status
 *       .createTextRange()

 *    [focus events]
 *       .onblur
 *       .onfocus

 */



var inputElements_dataProperties = {};
var inputElements_status = {};

var inputElements_onchange = {
    onchange: function(event){
        __eval__(this.getAttribute('onchange')||'', this);
    }
};

var inputElements_size = {
    get size(){
        return Number(this.getAttribute('size'));
    },
    set size(value){
        this.setAttribute('size',value);
    }
};

var inputElements_focusEvents = {
    blur: function(){
        __blur__(this);

        if (this._oldValue != this.value){
            var event = document.createEvent("HTMLEvents");
            event.initEvent("change", true, true);
            this.dispatchEvent( event );
        }
    },
    focus: function(){
        __focus__(this);
        this._oldValue = this.value;
    }
};


/*
* HTMLInputCommon - convenience class, not DOM
*/
var HTMLInputCommon = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLInputCommon.prototype = new HTMLElement();
__extend__(HTMLInputCommon.prototype, {
    get form() {
        // parent can be null if element is outside of a form
        // or not yet added to the document
        var parent = this.parentNode;
        while (parent && parent.nodeName.toLowerCase() !== 'form') {
            parent = parent.parentNode;
        }
        return parent;
    },
    get accessKey(){
        return this.getAttribute('accesskey');
    },
    set accessKey(value){
        this.setAttribute('accesskey',value);
    },
    get access(){
        return this.getAttribute('access');
    },
    set access(value){
        this.setAttribute('access', value);
    },
    get disabled(){
        return (this.getAttribute('disabled') === 'disabled');
    },
    set disabled(value){
        this.setAttribute('disabled', (value ? 'disabled' :''));
    }
});




/*
* HTMLTypeValueInputs - convenience class, not DOM
*/
var HTMLTypeValueInputs = function(ownerDocument) {

    HTMLInputCommon.apply(this, arguments);

    this._oldValue = "";
};
HTMLTypeValueInputs.prototype = new HTMLInputCommon();
__extend__(HTMLTypeValueInputs.prototype, inputElements_size);
__extend__(HTMLTypeValueInputs.prototype, inputElements_status);
__extend__(HTMLTypeValueInputs.prototype, inputElements_dataProperties);
__extend__(HTMLTypeValueInputs.prototype, {
    get name(){
        return this.getAttribute('name')||'';
    },
    set name(value){
        this.setAttribute('name',value);
    },
});


/*
* HTMLInputAreaCommon - convenience class, not DOM
*/
var HTMLInputAreaCommon = function(ownerDocument) {
    HTMLTypeValueInputs.apply(this, arguments);
};
HTMLInputAreaCommon.prototype = new HTMLTypeValueInputs();
__extend__(HTMLInputAreaCommon.prototype, inputElements_focusEvents);
__extend__(HTMLInputAreaCommon.prototype, inputElements_onchange);
__extend__(HTMLInputAreaCommon.prototype, {
    get readOnly(){
        return (this.getAttribute('readonly')=='readonly');
    },
    set readOnly(value){
        this.setAttribute('readonly', (value ? 'readonly' :''));
    },
    select:function(){
        __select__(this);

    }
});


var __updateFormForNamedElement__ = function(node, value) {
    if (node.form) {
        // to check for ID or NAME attribute too
        // not, then nothing to do
        node.form._updateElements();
    }
};

/**
 * HTMLAnchorElement - DOM Level 2
 *
 * HTML5: 4.6.1 The a element
 * http://dev.w3.org/html5/spec/Overview.html#the-a-element
 */
HTMLAnchorElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLAnchorElement.prototype = new HTMLElement();
__extend__(HTMLAnchorElement.prototype, {
    get accessKey() {
        return this.getAttribute("accesskey")||'';
    },
    set accessKey(val) {
        return this.setAttribute("accesskey",val);
    },
    get charset() {
        return this.getAttribute("charset")||'';
    },
    set charset(val) {
        return this.setAttribute("charset",val);
    },
    get coords() {
        return this.getAttribute("coords")||'';
    },
    set coords(val) {
        return this.setAttribute("coords",val);
    },
    get href() {
        var link = this.getAttribute('href');
        if (!link) {
            return '';
        }
        return Envjs.uri(link, this.ownerDocument.location.toString());
    },
    set href(val) {
        return this.setAttribute("href", val);
    },
    get hreflang() {
        return this.getAttribute("hreflang")||'';
    },
    set hreflang(val) {
        this.setAttribute("hreflang",val);
    },
    get name() {
        return this.getAttribute("name")||'';
    },
    set name(val) {
        this.setAttribute("name",val);
    },
    get rel() {
        return this.getAttribute("rel")||'';
    },
    set rel(val) {
        return this.setAttribute("rel", val);
    },
    get rev() {
        return this.getAttribute("rev")||'';
    },
    set rev(val) {
        return this.setAttribute("rev",val);
    },
    get shape() {
        return this.getAttribute("shape")||'';
    },
    set shape(val) {
        return this.setAttribute("shape",val);
    },
    get target() {
        return this.getAttribute("target")||'';
    },
    set target(val) {
        return this.setAttribute("target",val);
    },
    get type() {
        return this.getAttribute("type")||'';
    },
    set type(val) {
        return this.setAttribute("type",val);
    },
    blur: function() {
        __blur__(this);
    },
    focus: function() {
        __focus__(this);
    },
	click: function(){
		__click__(this);
	},
    /**
     * Unlike other elements, toString returns the href
     */
    toString: function() {
        return this.href;
    }
});

/*
 * HTMLAreaElement - DOM Level 2
 *
 * HTML5: 4.8.13 The area element
 * http://dev.w3.org/html5/spec/Overview.html#the-area-element
 */
HTMLAreaElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLAreaElement.prototype = new HTMLElement();
__extend__(HTMLAreaElement.prototype, {
    get accessKey(){
        return this.getAttribute('accesskey');
    },
    set accessKey(value){
        this.setAttribute('accesskey',value);
    },
    get alt(){
        return this.getAttribute('alt') || '';
    },
    set alt(value){
        this.setAttribute('alt',value);
    },
    get coords(){
        return this.getAttribute('coords');
    },
    set coords(value){
        this.setAttribute('coords',value);
    },
    get href(){
        return this.getAttribute('href') || '';
    },
    set href(value){
        this.setAttribute('href',value);
    },
    get noHref(){
        return this.hasAttribute('href');
    },
    get shape(){
        //TODO
        return 0;
    },
    /*get tabIndex(){
      return this.getAttribute('tabindex');
      },
      set tabIndex(value){
      this.setAttribute('tabindex',value);
      },*/
    get target(){
        return this.getAttribute('target');
    },
    set target(value){
        this.setAttribute('target',value);
    },

    /**
     * toString like <a>, returns the href
     */
    toString: function() {
        return this.href;
    }
});


/*
 * HTMLBaseElement - DOM Level 2
 *
 * HTML5: 4.2.3 The base element
 * http://dev.w3.org/html5/spec/Overview.html#the-base-element
 */
HTMLBaseElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLBaseElement.prototype = new HTMLElement();
__extend__(HTMLBaseElement.prototype, {
    get href(){
        return this.getAttribute('href');
    },
    set href(value){
        this.setAttribute('href',value);
    },
    get target(){
        return this.getAttribute('target');
    },
    set target(value){
        this.setAttribute('target',value);
    },
    toString: function() {
        return '[object HTMLBaseElement]';
    }
});


/*
 * HTMLQuoteElement - DOM Level 2
 * HTML5: 4.5.5 The blockquote element
 * http://dev.w3.org/html5/spec/Overview.html#htmlquoteelement
 */
HTMLQuoteElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
__extend__(HTMLQuoteElement.prototype, HTMLElement.prototype);
__extend__(HTMLQuoteElement.prototype, {
    /**
     * Quoth the spec:
     * """
     * If the cite attribute is present, it must be a valid URL. To
     * obtain the corresponding citation link, the value of the
     * attribute must be resolved relative to the element. User agents
     * should allow users to follow such citation links.
     * """
     *
     * TODO: normalize
     *
     */
    get cite() {
        return this.getAttribute('cite') || '';
    },

    set cite(value) {
        this.setAttribute('cite', value);
    },
    toString: function() {
        return '[object HTMLQuoteElement]';
    }
});

/*
 * HTMLBodyElement - DOM Level 2
 * HTML5: http://dev.w3.org/html5/spec/Overview.html#the-body-element-0
 */
HTMLBodyElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLBodyElement.prototype = new HTMLElement();
__extend__(HTMLBodyElement.prototype, {
    onload: function(event){
        __eval__(this.getAttribute('onload')||'', this);
    },
    onunload: function(event){
        __eval__(this.getAttribute('onunload')||'', this);
    },
    toString: function() {
        return '[object HTMLBodyElement]';
    }
});

/*
 * HTMLBRElement
 * HTML5: 4.5.3 The hr Element
 * http://dev.w3.org/html5/spec/Overview.html#the-br-element
 */
HTMLBRElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};

HTMLBRElement.prototype = new HTMLElement();
__extend__(HTMLBRElement.prototype, {

    // no additional properties or elements

    toString: function() {
        return '[object HTMLBRElement]';
    }
});


/*
 * HTMLButtonElement - DOM Level 2
 *
 * HTML5: 4.10.6 The button element
 * http://dev.w3.org/html5/spec/Overview.html#the-button-element
 */
HTMLButtonElement = function(ownerDocument) {
    HTMLTypeValueInputs.apply(this, arguments);
};
HTMLButtonElement.prototype = new HTMLTypeValueInputs();
__extend__(HTMLButtonElement.prototype, inputElements_status);
__extend__(HTMLButtonElement.prototype, {
    get dataFormatAs(){
        return this.getAttribute('dataFormatAs');
    },
    set dataFormatAs(value){
        this.setAttribute('dataFormatAs',value);
    },
    get type() {
        return this.getAttribute('type') || 'submit';
    },
    set type(value) {
        this.setAttribute('type', value);
    },
    get value() {
        return this.getAttribute('value') || '';
    },
    set value(value) {
        this.setAttribute('value', value);
    },
    toString: function() {
        return '[object HTMLButtonElement]';
    }
});

// Named Element Support
HTMLElement.registerSetAttribute('BUTTON', 'name',
                                 __updateFormForNamedElement__);

/*
 * HTMLCanvasElement - DOM Level 2
 * HTML5: 4.8.11 The canvas element
 * http://dev.w3.org/html5/spec/Overview.html#the-canvas-element
 */


/*
 * This is a "non-Abstract Base Class". For an implmentation that actually
 * did something, all these methods would need to over-written
 */
CanvasRenderingContext2D = function() {
    // NOP
};

var nullfunction = function() {};

CanvasRenderingContext2D.prototype = {
    addColorStop: nullfunction,
    arc: nullfunction,
    beginPath: nullfunction,
    bezierCurveTo: nullfunction,
    clearRect: nullfunction,
    clip: nullfunction,
    closePath: nullfunction,
    createLinearGradient: nullfunction,
    createPattern: nullfunction,
    createRadialGradient: nullfunction,
    drawImage: nullfunction,
    fill: nullfunction,
    fillRect:  nullfunction,
    lineTo: nullfunction,
    moveTo: nullfunction,
    quadraticCurveTo: nullfunction,
    rect: nullfunction,
    restore: nullfunction,
    rotate: nullfunction,
    save: nullfunction,
    scale: nullfunction,
    setTranform: nullfunction,
    stroke: nullfunction,
    strokeRect: nullfunction,
    transform: nullfunction,
    translate: nullfunction,

    toString: function() {
        return '[object CanvasRenderingContext2D]';
    }
};

HTMLCanvasElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLCanvasElement.prototype = new HTMLElement();
__extend__(HTMLCanvasElement.prototype, {

    getContext: function(ctxtype) {
        if (ctxtype === '2d') {
            return new CanvasRenderingContext2D();
        }
        throw new Error("Unknown context type of '" + ctxtype + '"');
    },

    get height(){
        return Number(this.getAttribute('height')|| 150);
    },
    set height(value){
        this.setAttribute('height', value);
    },

    get width(){
        return Number(this.getAttribute('width')|| 300);
    },
    set width(value){
        this.setAttribute('width', value);
    },

    toString: function() {
        return '[object HTMLCanvasElement]';
    }

});


/*
* HTMLTableColElement - DOM Level 2
*
* HTML5: 4.9.3 The colgroup element
* http://dev.w3.org/html5/spec/Overview.html#the-colgroup-element
*/
HTMLTableColElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLTableColElement.prototype = new HTMLElement();
__extend__(HTMLTableColElement.prototype, {
    get align(){
        return this.getAttribute('align');
    },
    set align(value){
        this.setAttribute('align', value);
    },
    get ch(){
        return this.getAttribute('ch');
    },
    set ch(value){
        this.setAttribute('ch', value);
    },
    get chOff(){
        return this.getAttribute('ch');
    },
    set chOff(value){
        this.setAttribute('ch', value);
    },
    get span(){
        return this.getAttribute('span');
    },
    set span(value){
        this.setAttribute('span', value);
    },
    get vAlign(){
        return this.getAttribute('valign');
    },
    set vAlign(value){
        this.setAttribute('valign', value);
    },
    get width(){
        return this.getAttribute('width');
    },
    set width(value){
        this.setAttribute('width', value);
    },
    toString: function() {
        return '[object HTMLTableColElement]';
    }
});


/*
 * HTMLModElement - DOM Level 2
 * http://dev.w3.org/html5/spec/Overview.html#htmlmodelement
 */
HTMLModElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLModElement.prototype = new HTMLElement();
__extend__(HTMLModElement.prototype, {
    get cite(){
        return this.getAttribute('cite');
    },
    set cite(value){
        this.setAttribute('cite', value);
    },
    get dateTime(){
        return this.getAttribute('datetime');
    },
    set dateTime(value){
        this.setAttribute('datetime', value);
    },
    toString: function() {
        return '[object HTMLModElement]';
    }
});

/*
 * HTMLDivElement - DOM Level 2
 * HTML5: 4.5.12 The Div Element
 * http://dev.w3.org/html5/spec/Overview.html#the-div-element
 */
HTMLDivElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};

HTMLDivElement.prototype = new HTMLElement();
__extend__(HTMLDivElement.prototype, {
    get align(){
        return this.getAttribute('align') || 'left';
    },
    set align(value){
        this.setAttribute('align', value);
    },
    toString: function() {
        return '[object HTMLDivElement]';
    }
});


/*
 * HTMLDListElement
 * HTML5: 4.5.7 The dl Element
 * http://dev.w3.org/html5/spec/Overview.html#the-dl-element
 */
HTMLDListElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};

HTMLDListElement.prototype = new HTMLElement();
__extend__(HTMLDListElement.prototype, {

    // no additional properties or elements

    toString: function() {
        return '[object HTMLDListElement]';
    }
});


/**
 * HTMLLegendElement - DOM Level 2
 *
 * HTML5: 4.10.3 The legend element
 * http://dev.w3.org/html5/spec/Overview.html#the-legend-element
 */
HTMLLegendElement = function(ownerDocument) {
    HTMLInputCommon.apply(this, arguments);
};
HTMLLegendElement.prototype = new HTMLInputCommon();
__extend__(HTMLLegendElement.prototype, {
    get align(){
        return this.getAttribute('align');
    },
    set align(value){
        this.setAttribute('align',value);
    }
});


/*
 * HTMLFieldSetElement - DOM Level 2
 *
 * HTML5: 4.10.2 The fieldset element
 * http://dev.w3.org/html5/spec/Overview.html#the-fieldset-element
 */
HTMLFieldSetElement = function(ownerDocument) {
    HTMLLegendElement.apply(this, arguments);
};
HTMLFieldSetElement.prototype = new HTMLLegendElement();
__extend__(HTMLFieldSetElement.prototype, {
    get margin(){
        return this.getAttribute('margin');
    },
    set margin(value){
        this.setAttribute('margin',value);
    },
    toString: function() {
        return '[object HTMLFieldSetElement]';
    }
});

// Named Element Support
HTMLElement.registerSetAttribute('FIELDSET', 'name', __updateFormForNamedElement__);
/*
 * HTMLFormElement - DOM Level 2
 *
 * HTML5: http://dev.w3.org/html5/spec/Overview.html#the-form-element
 */
HTMLFormElement = function(ownerDocument){
    HTMLElement.apply(this, arguments);

    //TODO: on __elementPopped__ from the parser
    //      we need to determine all the forms default
    //      values
};
HTMLFormElement.prototype = new HTMLElement();
__extend__(HTMLFormElement.prototype,{
    get acceptCharset(){
        return this.getAttribute('accept-charset');
    },
    set acceptCharset(acceptCharset) {
        this.setAttribute('accept-charset', acceptCharset);
    },
    get action() {
        return this.getAttribute('action');
    },
    set action(action){
        this.setAttribute('action', action);
    },

    get enctype() {
        return this.getAttribute('enctype');
    },
    set enctype(enctype) {
        this.setAttribute('enctype', enctype);
    },
    get method() {
        return this.getAttribute('method');
    },
    set method(method) {
        this.setAttribute('method', method);
    },
    get name() {
        return this.getAttribute("name");
    },
    set name(val) {
        return this.setAttribute("name",val);
    },
    get target() {
        return this.getAttribute("target");
    },
    set target(val) {
        return this.setAttribute("target",val);
    },

    /**
     * "Named Elements"
     *
     */
    /**
     * returns HTMLFormControlsCollection
     * http://dev.w3.org/html5/spec/Overview.html#dom-form-elements
     *
     * button fieldset input keygen object output select textarea
     */
    get elements() {
        var nodes = this.getElementsByTagName('*');
        var alist = [];
        var i, tmp;
        for (i = 0; i < nodes.length; ++i) {
            nodename = nodes[i].nodeName;
            // would like to replace switch with something else
            //  since it's redundant with the SetAttribute callbacks
            switch (nodes[i].nodeName) {
            case 'BUTTON':
            case 'FIELDSET':
            case 'INPUT':
            case 'KEYGEN':
            case 'OBJECT':
            case 'OUTPUT':
            case 'SELECT':
            case 'TEXTAREA':
                alist.push(nodes[i]);
                this[i] = nodes[i];
                tmp = nodes[i].name;
                if (tmp) {
                    this[tmp] = nodes[i];
                }
                tmp = nodes[i].id;
                if (tmp) {
                    this[tmp] = nodes[i];
                }
            }
        }
        return new HTMLCollection(alist);
    },
    _updateElements: function() {
        this.elements;
    },
    get length() {
        return this.elements.length;
    },
    item: function(idx) {
        return this.elements[idx];
    },
    namedItem: function(aname) {
        return this.elements.namedItem(aname);
    },
    toString: function() {
        return '[object HTMLFormElement]';
    },
    submit: function() {
        //TODO: this needs to perform the form inputs serialization
        //      and submission
        //  DONE: see xhr/form.js
        var event = __submit__(this);

    },
    reset: function() {
        //TODO: this needs to reset all values specified in the form
        //      to those which where set as defaults
        __reset__(this);

    },
    onsubmit: HTMLEvents.prototype.onsubmit,
    onreset: HTMLEvents.prototype.onreset
});

/**
 * HTMLFrameElement - DOM Level 2
 */
HTMLFrameElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
    // this is normally a getter but we need to be
    // able to set it to correctly emulate behavior
    this.contentDocument = null;
    this.contentWindow = null;
};
HTMLFrameElement.prototype = new HTMLElement();
__extend__(HTMLFrameElement.prototype, {

    get frameBorder(){
        return this.getAttribute('border')||"";
    },
    set frameBorder(value){
        this.setAttribute('border', value);
    },
    get longDesc(){
        return this.getAttribute('longdesc')||"";
    },
    set longDesc(value){
        this.setAttribute('longdesc', value);
    },
    get marginHeight(){
        return this.getAttribute('marginheight')||"";
    },
    set marginHeight(value){
        this.setAttribute('marginheight', value);
    },
    get marginWidth(){
        return this.getAttribute('marginwidth')||"";
    },
    set marginWidth(value){
        this.setAttribute('marginwidth', value);
    },
    get name(){
        return this.getAttribute('name')||"";
    },
    set name(value){
        this.setAttribute('name', value);
    },
    get noResize(){
        return this.getAttribute('noresize')||false;
    },
    set noResize(value){
        this.setAttribute('noresize', value);
    },
    get scrolling(){
        return this.getAttribute('scrolling')||"";
    },
    set scrolling(value){
        this.setAttribute('scrolling', value);
    },
    get src(){
        return this.getAttribute('src')||"";
    },
    set src(value){
        this.setAttribute('src', value);
    },
    toString: function(){
        return '[object HTMLFrameElement]';
    },
    onload: HTMLEvents.prototype.onload
});

/**
 * HTMLFrameSetElement - DOM Level 2
 *
 * HTML5: 12.3.3 Frames
 * http://dev.w3.org/html5/spec/Overview.html#frameset
 */
HTMLFrameSetElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLFrameSetElement.prototype = new HTMLElement();
__extend__(HTMLFrameSetElement.prototype, {
    get cols(){
        return this.getAttribute('cols');
    },
    set cols(value){
        this.setAttribute('cols', value);
    },
    get rows(){
        return this.getAttribute('rows');
    },
    set rows(value){
        this.setAttribute('rows', value);
    },
    toString: function() {
        return '[object HTMLFrameSetElement]';
    }
});

/*
 * HTMLHeadingElement
 * HTML5: 4.4.6 The h1, h2, h3, h4, h5, and h6 elements
 * http://dev.w3.org/html5/spec/Overview.html#the-h1-h2-h3-h4-h5-and-h6-elements
 */
HTMLHeadingElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};

HTMLHeadingElement.prototype = new HTMLElement();
__extend__(HTMLHeadingElement.prototype, {
    toString: function() {
        return '[object HTMLHeadingElement]';
    }
});

/**
 * HTMLHeadElement - DOM Level 2
 *
 * HTML5: 4.2.1 The head element
 * http://dev.w3.org/html5/spec/Overview.html#the-head-element-0
 */
HTMLHeadElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLHeadElement.prototype = new HTMLElement();
__extend__(HTMLHeadElement.prototype, {
    get profile(){
        return this.getAttribute('profile');
    },
    set profile(value){
        this.setAttribute('profile', value);
    },
    //we override this so we can apply browser behavior specific to head children
    //like loading scripts
    appendChild : function(newChild) {
        newChild = HTMLElement.prototype.appendChild.apply(this,[newChild]);
        //TODO: evaluate scripts which are appended to the head
        //__evalScript__(newChild);
        return newChild;
    },
    insertBefore : function(newChild, refChild) {
        newChild = HTMLElement.prototype.insertBefore.apply(this,[newChild]);
        //TODO: evaluate scripts which are appended to the head
        //__evalScript__(newChild);
        return newChild;
    },
    toString: function(){
        return '[object HTMLHeadElement]';
    }
});


/*
 * HTMLHRElement
 * HTML5: 4.5.2 The hr Element
 * http://dev.w3.org/html5/spec/Overview.html#the-hr-element
 */
HTMLHRElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};

HTMLHRElement.prototype = new HTMLElement();
__extend__(HTMLHRElement.prototype, {

    // no additional properties or elements

    toString: function() {
        return '[object HTMLHRElement]';
    }
});


/*
 * HTMLHtmlElement
 * HTML5: 4.1.1 The Html Element
 * http://dev.w3.org/html5/spec/Overview.html#htmlhtmlelement
 */
HTMLHtmlElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};

HTMLHtmlElement.prototype = new HTMLElement();
__extend__(HTMLHtmlElement.prototype, {

    // no additional properties or elements

    toString: function() {
        return '[object HTMLHtmlElement]';
    }
});


/*
 * HTMLIFrameElement - DOM Level 2
 *
 * HTML5: 4.8.3 The iframe element
 * http://dev.w3.org/html5/spec/Overview.html#the-iframe-element
 */
HTMLIFrameElement = function(ownerDocument) {
    HTMLFrameElement.apply(this, arguments);
};
HTMLIFrameElement.prototype = new HTMLFrameElement();
__extend__(HTMLIFrameElement.prototype, {
    get height() {
        return this.getAttribute("height") || "";
    },
    set height(val) {
        return this.setAttribute("height",val);
    },
    get width() {
        return this.getAttribute("width") || "";
    },
    set width(val) {
        return this.setAttribute("width",val);
    },
    toString: function(){
        return '[object HTMLIFrameElement]';
    }
});

/**
 * HTMLImageElement and Image
 */


HTMLImageElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLImageElement.prototype = new HTMLElement();
__extend__(HTMLImageElement.prototype, {
    get alt(){
        return this.getAttribute('alt');
    },
    set alt(value){
        this.setAttribute('alt', value);
    },
    get height(){
        return parseInt(this.getAttribute('height'), 10) || 0;
    },
    set height(value){
        this.setAttribute('height', value);
    },
    get isMap(){
        return this.hasAttribute('map');
    },
    set useMap(value){
        this.setAttribute('map', value);
    },
    get longDesc(){
        return this.getAttribute('longdesc');
    },
    set longDesc(value){
        this.setAttribute('longdesc', value);
    },
    get name(){
        return this.getAttribute('name');
    },
    set name(value){
        this.setAttribute('name', value);
    },
    get src(){
        return this.getAttribute('src') || '';
    },
    set src(value){
        this.setAttribute('src', value);
    },
    get width(){
        return parseInt(this.getAttribute('width'), 10) || 0;
    },
    set width(value){
        this.setAttribute('width', value);
    },
    toString: function(){
        return '[object HTMLImageElement]';
    }
});

/*
 * html5 4.8.1
 * http://dev.w3.org/html5/spec/Overview.html#the-img-element
 */
Image = function(width, height) {
    // Not sure if "[global].document" satifies this requirement:
    // "The element's document must be the active document of the
    // browsing context of the Window object on which the interface
    // object of the invoked constructor is found."

    HTMLElement.apply(this, [document]);
    // Note: firefox will throw an error if the width/height
    //   is not an integer.  Safari just converts to 0 on error.
    this.width = parseInt(width, 10) || 0;
    this.height = parseInt(height, 10) || 0;
    this.nodeName = 'IMG';
};
Image.prototype = new HTMLImageElement();


/*
 * Image.src attribute events.
 *
 * Not sure where this should live... in events/img.js? in parser/img.js?
 * Split out to make it easy to move.
 */

/**
 * HTMLImageElement && Image are a bit odd in that the 'src' attribute
 * is 'active' -- changing it triggers loading of the image from the
 * network.
 *
 * This can occur by
 *   - Directly setting the Image.src =
 *   - Using one of the Element.setAttributeXXX methods
 *   - Node.importNode an image
 *   - The initial creation and parsing of an <img> tag
 *
 * __onImageRequest__ is a function that handles eventing
 *  and dispatches to a user-callback.
 *
 */
__loadImage__ = function(node, value) {
    var event;
    if (value && (!Envjs.loadImage ||
                  (Envjs.loadImage &&
                   Envjs.loadImage(node, value)))) {
        // value has to be something (easy)
        // if the user-land API doesn't exist
        // Or if the API exists and it returns true, then ok:
        event = document.createEvent('Events');
        event.initEvent('load');
    } else {
        // oops
        event = document.createEvent('Events');
        event.initEvent('error');
    }
    node.dispatchEvent(event, false);
};

__extend__(HTMLImageElement.prototype, {
    onload: function(event){
        __eval__(this.getAttribute('onload') || '', this);
    }
});


/*
 * Image Loading
 *
 * The difference between "owner.parsing" and "owner.fragment"
 *
 * If owner.parsing === true, then during the html5 parsing then,
 *  __elementPopped__ is called when a compete tag (with attrs and
 *  children) is full parsed and added the DOM.
 *
 *   For images, __elementPopped__ is called with everything the
 *    tag has.  which in turn looks for a "src" attr and calls
 *    __loadImage__
 *
 * If owner.parser === false (or non-existant), then we are not in
 * a parsing step.  For images, perhaps someone directly modified
 * a 'src' attribute of an existing image.
 *
 * 'innerHTML' is tricky since we first create a "fake document",
 *  parse it, then import the right parts.  This may call
 *  img.setAttributeNS twice.  once during the parse and once
 *  during the clone of the node.  We want event to trigger on the
 *  later and not during th fake doco.  "owner.fragment" is set by
 *  the fake doco parser to indicate that events should not be
 *  triggered on this.
 *
 * We coud make 'owner.parser' == [ 'none', 'full', 'fragment']
 * and just use one variable That was not done since the patch is
 * quite large as is.
 *
 * This same problem occurs with scripts.  innerHTML oddly does
 * not eval any <script> tags inside.
 */
HTMLElement.registerSetAttribute('IMG', 'src', function(node, value) {
    var owner = node.ownerDocument;
    if (!owner.parsing && !owner.fragment) {
        __loadImage__(node, value);
    }
});
/**
 * HTMLInputElement
 *
 * HTML5: 4.10.5 The input element
 * http://dev.w3.org/html5/spec/Overview.html#the-input-element
 */
HTMLInputElement = function(ownerDocument) {
    HTMLInputAreaCommon.apply(this, arguments);
    this._dirty = false;
    this._checked = null;
    this._value = null;
};
HTMLInputElement.prototype = new HTMLInputAreaCommon();
__extend__(HTMLInputElement.prototype, {
    get alt(){
        return this.getAttribute('alt') || '';
    },
    set alt(value){
        this.setAttribute('alt', value);
    },

    /**
     * 'checked' returns state, NOT the value of the attribute
     */
    get checked(){
        if (this._checked === null) {
            this._checked = this.defaultChecked;
        }
        return this._checked;
    },
    set checked(value){
        // force to boolean value
        this._checked = (value) ? true : false;
    },

    /**
     * 'defaultChecked' actually reflects if the 'checked' attribute
     * is present or not
     */
    get defaultChecked(){
        return this.hasAttribute('checked');
    },
    set defaultChecked(val){
        if (val) {
            this.setAttribute('checked', '');
        } else {
            if (this.defaultChecked) {
                this.removeAttribute('checked');
            }
        }
    },
    get defaultValue() {
        return this.getAttribute('value') || '';
    },
    set defaultValue(value) {
        this._dirty = true;
        this.setAttribute('value', value);
    },
    get value() {
        return (this._value === null) ? this.defaultValue : this._value;
    },
    set value(newvalue) {
        this._value = newvalue;
    },
    /**
     * Height is a string
     */
    get height(){
        // spec says it is a string
        return this.getAttribute('height') || '';
    },
    set height(value){
        this.setAttribute('height',value);
    },

    /**
     * MaxLength is a number
     */
    get maxLength(){
        return Number(this.getAttribute('maxlength')||'-1');
    },
    set maxLength(value){
        this.setAttribute('maxlength', value);
    },

    /**
     * Src is a URL string
     */
    get src(){
        return this.getAttribute('src') || '';
    },
    set src(value){
        // TODO: make absolute any relative URLS
        this.setAttribute('src', value);
    },

    get type() {
        return this.getAttribute('type') || 'text';
    },
    set type(value) {
        this.setAttribute('type', value);
    },

    get useMap(){
        return this.getAttribute('map') || '';
    },

    /**
     * Width: spec says it is a string
     */
    get width(){
        return this.getAttribute('width') || '';
    },
    set width(value){
        this.setAttribute('width',value);
    },
    click:function(){
        __click__(this);
    },
    toString: function() {
        return '[object HTMLInputElement]';
    }
});

//http://dev.w3.org/html5/spec/Overview.html#dom-input-value
// if someone directly modifies the value attribute, then the input's value
// also directly changes.
HTMLElement.registerSetAttribute('INPUT', 'value', function(node, value) {
    if (!node._dirty) {
        node._value = value;
        node._dirty = true;
    }
});

/*
 *The checked content attribute is a boolean attribute that gives the
 *default checkedness of the input element. When the checked content
 *attribute is added, if the control does not have dirty checkedness,
 *the user agent must set the checkedness of the element to true; when
 *the checked content attribute is removed, if the control does not
 *have dirty checkedness, the user agent must set the checkedness of
 *the element to false.
 */
// Named Element Support
HTMLElement.registerSetAttribute('INPUT', 'name',
                                 __updateFormForNamedElement__);

/**
 * HTMLLabelElement - DOM Level 2
 * HTML5 4.10.4 The label element
 * http://dev.w3.org/html5/spec/Overview.html#the-label-element
 */
HTMLLabelElement = function(ownerDocument) {
    HTMLInputCommon.apply(this, arguments);
};
HTMLLabelElement.prototype = new HTMLInputCommon();
__extend__(HTMLLabelElement.prototype, inputElements_dataProperties);
__extend__(HTMLLabelElement.prototype, {
    get htmlFor() {
        return this.getAttribute('for');
    },
    set htmlFor(value) {
        this.setAttribute('for',value);
    },
    get dataFormatAs() {
        return this.getAttribute('dataFormatAs');
    },
    set dataFormatAs(value) {
        this.setAttribute('dataFormatAs',value);
    },
    toString: function() {
        return '[object HTMLLabelElement]';
    }
});

/*
 * HTMLLIElement
 * HTML5: 4.5.8 The li Element
 * http://dev.w3.org/html5/spec/Overview.html#the-li-element
 */
HTMLLIElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};

HTMLLIElement.prototype = new HTMLElement();
__extend__(HTMLLIElement.prototype, {

    // TODO: attribute long value;

    toString: function() {
        return '[object HTMLLIElement]';
    }
});


/*
 * HTMLLinkElement - DOM Level 2
 *
 * HTML5: 4.8.12 The map element
 * http://dev.w3.org/html5/spec/Overview.html#the-map-element
 */
HTMLLinkElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLLinkElement.prototype = new HTMLElement();
__extend__(HTMLLinkElement.prototype, {
    get disabled(){
        return this.getAttribute('disabled');
    },
    set disabled(value){
        this.setAttribute('disabled',value);
    },
    get charset(){
        return this.getAttribute('charset');
    },
    set charset(value){
        this.setAttribute('charset',value);
    },
    get href(){
        return this.getAttribute('href');
    },
    set href(value){
        this.setAttribute('href',value);
    },
    get hreflang(){
        return this.getAttribute('hreflang');
    },
    set hreflang(value){
        this.setAttribute('hreflang',value);
    },
    get media(){
        return this.getAttribute('media');
    },
    set media(value){
        this.setAttribute('media',value);
    },
    get rel(){
        return this.getAttribute('rel');
    },
    set rel(value){
        this.setAttribute('rel',value);
    },
    get rev(){
        return this.getAttribute('rev');
    },
    set rev(value){
        this.setAttribute('rev',value);
    },
    get target(){
        return this.getAttribute('target');
    },
    set target(value){
        this.setAttribute('target',value);
    },
    get type(){
        return this.getAttribute('type');
    },
    set type(value){
        this.setAttribute('type',value);
    },
    toString: function() {
        return '[object HTMLLinkElement]';
    }
});

__loadLink__ = function(node, value) {
    var event;
    var owner = node.ownerDocument;

    if (owner.fragment) {
        /**
         * if we are in an innerHTML fragment parsing step
         * then ignore.  It will be handled once the fragment is
         * added to the real doco
         */
        return;
    }

    if (node.parentNode === null) {
        /*
         * if a <link> is parentless (normally by create a new link
         * via document.createElement('link'), then do *not* fire an
         * event, even if it has a valid 'href' attribute.
         */
        return;
    }
    if (value != '' && (!Envjs.loadLink ||
                        (Envjs.loadLink &&
                         Envjs.loadLink(node, value)))) {
        // value has to be something (easy)
        // if the user-land API doesn't exist
        // Or if the API exists and it returns true, then ok:
        event = document.createEvent('Events');
        event.initEvent('load');
    } else {
        // oops
        event = document.createEvent('Events');
        event.initEvent('error');
    }
    node.dispatchEvent(event, false);
};


HTMLElement.registerSetAttribute('LINK', 'href', function(node, value) {
    __loadLink__(node, value);
});

/**
 * Event stuff, not sure where it goes
 */
__extend__(HTMLLinkElement.prototype, {
    onload: function(event){
        __eval__(this.getAttribute('onload')||'', this);
    },
});

/**
 * HTMLMapElement
 *
 * 4.8.12 The map element
 * http://dev.w3.org/html5/spec/Overview.html#the-map-element
 */
HTMLMapElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLMapElement.prototype = new HTMLElement();
__extend__(HTMLMapElement.prototype, {
    get areas(){
        return this.getElementsByTagName('area');
    },
    get name(){
        return this.getAttribute('name') || '';
    },
    set name(value){
        this.setAttribute('name',value);
    },
    toString: function() {
        return '[object HTMLMapElement]';
    }
});

/**
 * HTMLMetaElement - DOM Level 2
 * HTML5: 4.2.5 The meta element
 * http://dev.w3.org/html5/spec/Overview.html#meta
 */
HTMLMetaElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLMetaElement.prototype = new HTMLElement();
__extend__(HTMLMetaElement.prototype, {
    get content() {
        return this.getAttribute('content') || '';
    },
    set content(value){
        this.setAttribute('content',value);
    },
    get httpEquiv(){
        return this.getAttribute('http-equiv') || '';
    },
    set httpEquiv(value){
        this.setAttribute('http-equiv',value);
    },
    get name(){
        return this.getAttribute('name') || '';
    },
    set name(value){
        this.setAttribute('name',value);
    },
    get scheme(){
        return this.getAttribute('scheme');
    },
    set scheme(value){
        this.setAttribute('scheme',value);
    },
    toString: function() {
        return '[object HTMLMetaElement]';
    }
});


/**
 * HTMLObjectElement - DOM Level 2
 * HTML5: 4.8.5 The object element
 * http://dev.w3.org/html5/spec/Overview.html#the-object-element
 */
HTMLObjectElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLObjectElement.prototype = new HTMLElement();
__extend__(HTMLObjectElement.prototype, {
    get code(){
        return this.getAttribute('code');
    },
    set code(value){
        this.setAttribute('code',value);
    },
    get archive(){
        return this.getAttribute('archive');
    },
    set archive(value){
        this.setAttribute('archive',value);
    },
    get codeBase(){
        return this.getAttribute('codebase');
    },
    set codeBase(value){
        this.setAttribute('codebase',value);
    },
    get codeType(){
        return this.getAttribute('codetype');
    },
    set codeType(value){
        this.setAttribute('codetype',value);
    },
    get data(){
        return this.getAttribute('data');
    },
    set data(value){
        this.setAttribute('data',value);
    },
    get declare(){
        return this.getAttribute('declare');
    },
    set declare(value){
        this.setAttribute('declare',value);
    },
    get height(){
        return this.getAttribute('height');
    },
    set height(value){
        this.setAttribute('height',value);
    },
    get standby(){
        return this.getAttribute('standby');
    },
    set standby(value){
        this.setAttribute('standby',value);
    },
    /*get tabIndex(){
      return this.getAttribute('tabindex');
      },
      set tabIndex(value){
      this.setAttribute('tabindex',value);
      },*/
    get type(){
        return this.getAttribute('type');
    },
    set type(value){
        this.setAttribute('type',value);
    },
    get useMap(){
        return this.getAttribute('usemap');
    },
    set useMap(value){
        this.setAttribute('usemap',value);
    },
    get width(){
        return this.getAttribute('width');
    },
    set width(value){
        this.setAttribute('width',value);
    },
    get contentDocument(){
        return this.ownerDocument;
    },
    toString: function() {
        return '[object HTMLObjectElement]';
    }
});

// Named Element Support
HTMLElement.registerSetAttribute('OBJECT', 'name',
                                 __updateFormForNamedElement__);

/*
 * HTMLOListElement
 * HTML5: 4.5.6 The ol Element
 * http://dev.w3.org/html5/spec/Overview.html#the-ol-element
 */
HTMLOListElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};

HTMLOListElement.prototype = new HTMLElement();
__extend__(HTMLOListElement.prototype, {

    // TODO: attribute boolean reversed;
    // TODO:  attribute long start;

    toString: function() {
        return '[object HTMLOListElement]';
    }
});


/**
 * HTMLOptGroupElement - DOM Level 2
 * HTML 5: 4.10.9 The optgroup element
 * http://dev.w3.org/html5/spec/Overview.html#the-optgroup-element
 */
HTMLOptGroupElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLOptGroupElement.prototype = new HTMLElement();
__extend__(HTMLOptGroupElement.prototype, {
    get disabled(){
        return this.getAttribute('disabled');
    },
    set disabled(value){
        this.setAttribute('disabled',value);
    },
    get label(){
        return this.getAttribute('label');
    },
    set label(value){
        this.setAttribute('label',value);
    },
    appendChild: function(node){
        var i,
        length,
        selected = false;
        //make sure at least one is selected by default
        if(node.nodeType === Node.ELEMENT_NODE && node.tagName === 'OPTION'){
            length = this.childNodes.length;
            for(i=0;i<length;i++){
                if(this.childNodes[i].nodeType === Node.ELEMENT_NODE &&
                   this.childNodes[i].tagName === 'OPTION'){
                    //check if it is selected
                    if(this.selected){
                        selected = true;
                        break;
                    }
                }
            }
            if(!selected){
                node.selected = true;
                this.value = node.value?node.value:'';
            }
        }
        return HTMLElement.prototype.appendChild.apply(this, [node]);
    },
    toString: function() {
        return '[object HTMLOptGroupElement]';
    }
});

/**
 * HTMLOptionElement, Option
 * HTML5: 4.10.10 The option element
 * http://dev.w3.org/html5/spec/Overview.html#the-option-element
 */
HTMLOptionElement = function(ownerDocument) {
    HTMLInputCommon.apply(this, arguments);
    this._selected = null;
};
HTMLOptionElement.prototype = new HTMLInputCommon();
__extend__(HTMLOptionElement.prototype, {

    /**
     * defaultSelected actually reflects the presence of the
     * 'selected' attribute.
     */
    get defaultSelected() {
        return this.hasAttribute('selected');
    },
    set defaultSelected(value) {
        if (value) {
            this.setAttribute('selected','');
        } else {
            if (this.hasAttribute('selected')) {
                this.removeAttribute('selected');
            }
        }
    },

    /*
     * HTML5: The form IDL attribute's behavior depends on whether the
     * option element is in a select element or not. If the option has
     * a select element as its parent, or has a colgroup element as
     * its parent and that colgroup element has a select element as
     * its parent, then the form IDL attribute must return the same
     * value as the form IDL attribute on that select
     * element. Otherwise, it must return null.
     */
    _selectparent: function() {
        var parent = this.parentNode;
        if (!parent) {
            return null;
        }

        if (parent.tagName === 'SELECT') {
            return parent;
        }
        if (parent.tagName === 'COLGROUP') {
            parent = parent.parentNode;
            if (parent && parent.tagName === 'SELECT') {
                return parent;
            }
        }
    },
    _updateoptions: function() {
        var parent = this._selectparent();
        if (parent) {
            // has side effects and updates owner select's options
            parent.options;
        }
    },
    get form() {
        var parent = this._selectparent();
        return parent ? parent.form : null;
    },
    get index() {
        var options, i;

        if (! this.parentNode) {
            return -1;
        }
        options = this.parentNode.options;
        for (i=0; i < options.length; ++i) {
            if (this === options[i]) {
                return i;
            }
        }
        return 0;
    },
    get label() {
        return this.getAttribute('label');
    },
    set label(value) {
        this.setAttribute('label', value);
    },

    /*
     * This is not in the spec, but safari and firefox both
     * use this
     */
    get name() {
        return this.getAttribute('name');
    },
    set name(value) {
        this.setAttribute('name', value);
    },

    /**
     *
     */
    get selected() {
        // if disabled, return false, no matter what
        if (this.disabled) {
            return false;
        }
        if (this._selected === null) {
            return this.defaultSelected;
        }

        return this._selected;
    },
    set selected(value) {
        this._selected = (value) ? true : false;
    },

    get text() {
        var val = this.nodeValue;
        return (val === null || this.value === undefined) ?
            this.innerHTML :
            val;
    },
    get value() {
        var val = this.getAttribute('value');
        return (val === null || val === undefined) ?
            this.textContent :
            val;
    },
    set value(value) {
        this.setAttribute('value', value);
    },
    toString: function() {
        return '[object HTMLOptionElement]';
    }
});

Option = function(text, value, defaultSelected, selected) {

    // Not sure if this is correct:
    //
    // The element's document must be the active document of the
    // browsing context of the Window object on which the interface
    // object of the invoked constructor is found.
    HTMLOptionElement.apply(this, [document]);
    this.nodeName = 'OPTION';

    if (arguments.length >= 1) {
        this.appendChild(document.createTextNode('' + text));
    }
    if (arguments.length >= 2) {
        this.value = value;
    }
    if (arguments.length >= 3) {
        if (defaultSelected) {
            this.defaultSelected = '';
        }
    }
    if (arguments.length >= 4) {
        this.selected = (selected) ? true : false;
    }
};

Option.prototype = new HTMLOptionElement();

// Named Element Support

function updater(node, value) {
    node._updateoptions();
}
HTMLElement.registerSetAttribute('OPTION', 'name', updater);
HTMLElement.registerSetAttribute('OPTION', 'id', updater);

/*
* HTMLParagraphElement - DOM Level 2
*/
HTMLParagraphElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLParagraphElement.prototype = new HTMLElement();
__extend__(HTMLParagraphElement.prototype, {
    toString: function(){
        return '[object HTMLParagraphElement]';
    }
});


/**
 * HTMLParamElement
 *
 * HTML5: 4.8.6 The param element
 * http://dev.w3.org/html5/spec/Overview.html#the-param-element
 */
HTMLParamElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLParamElement.prototype = new HTMLElement();
__extend__(HTMLParamElement.prototype, {
    get name() {
        return this.getAttribute('name') || '';
    },
    set name(value) {
        this.setAttribute('name', value);
    },
    get type(){
        return this.getAttribute('type');
    },
    set type(value){
        this.setAttribute('type',value);
    },
    get value(){
        return this.getAttribute('value');
    },
    set value(value){
        this.setAttribute('value',value);
    },
    get valueType(){
        return this.getAttribute('valuetype');
    },
    set valueType(value){
        this.setAttribute('valuetype',value);
    },
    toString: function() {
        return '[object HTMLParamElement]';
    }
});


/*
 * HTMLPreElement
 * HTML5: 4.5.4 The pre Element
 * http://dev.w3.org/html5/spec/Overview.html#the-pre-element
 */
HTMLPreElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};

HTMLPreElement.prototype = new HTMLElement();
__extend__(HTMLPreElement.prototype, {

    // no additional properties or elements

    toString: function() {
        return '[object HTMLPreElement]';
    }
});


/**
 * HTMLScriptElement - DOM Level 2
 *
 * HTML5: 4.3.1 The script element
 * http://dev.w3.org/html5/spec/Overview.html#script
 */
HTMLScriptElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLScriptElement.prototype = new HTMLElement();
__extend__(HTMLScriptElement.prototype, {

    /**
     * HTML5 spec @ http://dev.w3.org/html5/spec/Overview.html#script
     *
     * "The IDL attribute text must return a concatenation of the
     * contents of all the text nodes that are direct children of the
     * script element (ignoring any other nodes such as comments or
     * elements), in tree order. On setting, it must act the same way
     * as the textContent IDL attribute."
     *
     * AND... "The term text node refers to any Text node,
     * including CDATASection nodes; specifically, any Node with node
     * type TEXT_NODE (3) or CDATA_SECTION_NODE (4)"
     */
    get text() {
        var kids = this.childNodes;
        var kid;
        var s = '';
        var imax = kids.length;
        for (var i = 0; i < imax; ++i) {
            kid = kids[i];
            if (kid.nodeType === Node.TEXT_NODE ||
                kid.nodeType === Node.CDATA_SECTION_NODE) {
                s += kid.nodeValue;
            }
        }
        return s;
    },

    /**
     * HTML5 spec "Can be set, to replace the element's children with
     * the given value."
     */
    set text(value) {
        // this deletes all children, and make a new single text node
        // with value
        this.textContent = value;

        /* Currently we always execute, but this isn't quite right if
         * the node has *not* been inserted into the document, then it
         * should *not* fire.  The more detailed answer from the spec:
         *
         * When a script element that is neither marked as having
         * "already started" nor marked as being "parser-inserted"
         * experiences one of the events listed in the following list,
         * the user agent must synchronously run the script element:
         *
         *   * The script element gets inserted into a document.
         *   * The script element is in a Document and its child nodes
         *     are changed.
         *   * The script element is in a Document and has a src
         *     attribute set where previously the element had no such
         *     attribute.
         *
         * And no doubt there are other cases as well.
         */
        Envjs.loadInlineScript(this);
    },

    get htmlFor(){
        return this.getAttribute('for');
    },
    set htmlFor(value){
        this.setAttribute('for',value);
    },
    get event(){
        return this.getAttribute('event');
    },
    set event(value){
        this.setAttribute('event',value);
    },
    get charset(){
        return this.getAttribute('charset');
    },
    set charset(value){
        this.setAttribute('charset',value);
    },
    get defer(){
        return this.getAttribute('defer');
    },
    set defer(value){
        this.setAttribute('defer',value);
    },
    get src(){
        return this.getAttribute('src')||'';
    },
    set src(value){
        this.setAttribute('src',value);
    },
    get type(){
        return this.getAttribute('type')||'';
    },
    set type(value){
        this.setAttribute('type',value);
    },
    onload: HTMLEvents.prototype.onload,
    onerror: HTMLEvents.prototype.onerror,
    toString: function() {
        return '[object HTMLScriptElement]';
    }
});


/**
 * HTMLSelectElement
 * HTML5: http://dev.w3.org/html5/spec/Overview.html#the-select-element
 */
HTMLSelectElement = function(ownerDocument) {
    HTMLTypeValueInputs.apply(this, arguments);
    this._oldIndex = -1;
};

HTMLSelectElement.prototype = new HTMLTypeValueInputs();
__extend__(HTMLSelectElement.prototype, inputElements_dataProperties);
__extend__(HTMLButtonElement.prototype, inputElements_size);
__extend__(HTMLSelectElement.prototype, inputElements_onchange);
__extend__(HTMLSelectElement.prototype, inputElements_focusEvents);
__extend__(HTMLSelectElement.prototype, {

    get value() {
        var index = this.selectedIndex;
        return (index === -1) ? '' : this.options[index].value;
    },
    set value(newValue) {
        var options = this.options;
        var imax = options.length;
        for (var i=0; i< imax; ++i) {
            if (options[i].value == newValue) {
                this.setAttribute('value', newValue);
                this.selectedIndex = i;
                return;
            }
        }
    },
    get multiple() {
        return this.hasAttribute('multiple');
    },
    set multiple(value) {
        if (value) {
            this.setAttribute('multiple', '');
        } else {
            if (this.hasAttribute('multiple')) {
                this.removeAttribute('multiple');
            }
        }
    },
    // Returns HTMLOptionsCollection
    get options() {
        var nodes = this.getElementsByTagName('option');
        var alist = [];
        var i, tmp;
        for (i = 0; i < nodes.length; ++i) {
            alist.push(nodes[i]);
            this[i] = nodes[i];
            tmp = nodes[i].name;
            if (tmp) {
                this[tmp] = nodes[i];
            }
            tmp = nodes[i].id;
            if (tmp) {
                this[tmp] = nodes[i];
            }
        }
        return new HTMLCollection(alist);
    },
    get length() {
        return this.options.length;
    },
    item: function(idx) {
        return this.options[idx];
    },
    namedItem: function(aname) {
        return this.options[aname];
    },

    get selectedIndex() {
        var options = this.options;
        var imax = options.length;
        for (var i=0; i < imax; ++i) {
            if (options[i].selected) {
                //console.log('select get selectedIndex %s', i);
                return i;
            }
        }
        //console.log('select get selectedIndex %s', -1);
        return -1;
    },

    set selectedIndex(value) {
        var options = this.options;
        var num = Number(value);
        var imax = options.length;
        for (var i = 0; i < imax; ++i) {
            options[i].selected = (i === num);
        }
    },
    get type() {
        return this.multiple ? 'select-multiple' : 'select-one';
    },

    add: function(element, before) {
        this.appendChild(element);
        //__add__(this);
    },
    remove: function() {
        __remove__(this);
    },
    toString: function() {
        return '[object HTMLSelectElement]';
    }
});

// Named Element Support
HTMLElement.registerSetAttribute('SELECT', 'name',
                                 __updateFormForNamedElement__);
/**
 * HTML 5: 4.6.22 The span element
 * http://dev.w3.org/html5/spec/Overview.html#the-span-element
 * 
 */
HTMLSpanElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLSpanElement.prototype = new HTMLElement();
__extend__(HTMLSpanElement.prototype, {
    toString: function(){
        return '[object HTMLSpanElement]';
    }
});


/**
 * HTMLStyleElement - DOM Level 2
 * HTML5 4.2.6 The style element
 * http://dev.w3.org/html5/spec/Overview.html#the-style-element
 */
HTMLStyleElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLStyleElement.prototype = new HTMLElement();
__extend__(HTMLStyleElement.prototype, {
    get disabled(){
        return this.getAttribute('disabled');
    },
    set disabled(value){
        this.setAttribute('disabled',value);
    },
    get media(){
        return this.getAttribute('media');
    },
    set media(value){
        this.setAttribute('media',value);
    },
    get type(){
        return this.getAttribute('type');
    },
    set type(value){
        this.setAttribute('type',value);
    },
    toString: function() {
        return '[object HTMLStyleElement]';
    }
});

/**
 * HTMLTableElement - DOM Level 2
 * Implementation Provided by Steven Wood
 *
 * HTML5: 4.9.1 The table element
 * http://dev.w3.org/html5/spec/Overview.html#the-table-element
 */
HTMLTableElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLTableElement.prototype = new HTMLElement();
__extend__(HTMLTableElement.prototype, {

    get tFoot() {
        //tFoot returns the table footer.
        return this.getElementsByTagName("tfoot")[0];
    },

    createTFoot : function () {
        var tFoot = this.tFoot;

        if (!tFoot) {
            tFoot = document.createElement("tfoot");
            this.appendChild(tFoot);
        }

        return tFoot;
    },

    deleteTFoot : function () {
        var foot = this.tFoot;
        if (foot) {
            foot.parentNode.removeChild(foot);
        }
    },

    get tHead() {
        //tHead returns the table head.
        return this.getElementsByTagName("thead")[0];
    },

    createTHead : function () {
        var tHead = this.tHead;

        if (!tHead) {
            tHead = document.createElement("thead");
            this.insertBefore(tHead, this.firstChild);
        }

        return tHead;
    },

    deleteTHead : function () {
        var head = this.tHead;
        if (head) {
            head.parentNode.removeChild(head);
        }
    },

    /*appendChild : function (child) {

      var tagName;
      if(child&&child.nodeType==Node.ELEMENT_NODE){
      tagName = child.tagName.toLowerCase();
      if (tagName === "tr") {
      // need an implcit <tbody> to contain this...
      if (!this.currentBody) {
      this.currentBody = document.createElement("tbody");

      Node.prototype.appendChild.apply(this, [this.currentBody]);
      }

      return this.currentBody.appendChild(child);

      } else if (tagName === "tbody" || tagName === "tfoot" && this.currentBody) {
      this.currentBody = child;
      return Node.prototype.appendChild.apply(this, arguments);

      } else {
      return Node.prototype.appendChild.apply(this, arguments);
      }
      }else{
      //tables can still have text node from white space
      return Node.prototype.appendChild.apply(this, arguments);
      }
      },*/

    get tBodies() {
        return new HTMLCollection(this.getElementsByTagName("tbody"));

    },

    get rows() {
        return new HTMLCollection(this.getElementsByTagName("tr"));
    },

    insertRow : function (idx) {
        if (idx === undefined) {
            throw new Error("Index omitted in call to HTMLTableElement.insertRow ");
        }

        var rows = this.rows,
            numRows = rows.length,
            node,
            inserted,
            lastRow;

        if (idx > numRows) {
            throw new Error("Index > rows.length in call to HTMLTableElement.insertRow");
        }

        inserted = document.createElement("tr");
        // If index is -1 or equal to the number of rows,
        // the row is appended as the last row. If index is omitted
        // or greater than the number of rows, an error will result
        if (idx === -1 || idx === numRows) {
            this.appendChild(inserted);
        } else {
            rows[idx].parentNode.insertBefore(inserted, rows[idx]);
        }

        return inserted;
    },

    deleteRow : function (idx) {
        var elem = this.rows[idx];
        elem.parentNode.removeChild(elem);
    },

    get summary() {
        return this.getAttribute("summary");
    },

    set summary(summary) {
        this.setAttribute("summary", summary);
    },

    get align() {
        return this.getAttribute("align");
    },

    set align(align) {
        this.setAttribute("align", align);
    },

    get bgColor() {
        return this.getAttribute("bgColor");
    },

    set bgColor(bgColor) {
        return this.setAttribute("bgColor", bgColor);
    },

    get cellPadding() {
        return this.getAttribute("cellPadding");
    },

    set cellPadding(cellPadding) {
        return this.setAttribute("cellPadding", cellPadding);
    },

    get cellSpacing() {
        return this.getAttribute("cellSpacing");
    },

    set cellSpacing(cellSpacing) {
        this.setAttribute("cellSpacing", cellSpacing);
    },

    get frame() {
        return this.getAttribute("frame");
    },

    set frame(frame) {
        this.setAttribute("frame", frame);
    },

    get rules() {
        return this.getAttribute("rules");
    },

    set rules(rules) {
        this.setAttribute("rules", rules);
    },

    get width() {
        return this.getAttribute("width");
    },

    set width(width) {
        this.setAttribute("width", width);
    },
    toString: function() {
        return '[object HTMLTableElement]';
    }
});

/*
 * HTMLxElement - DOM Level 2
 * - Contributed by Steven Wood
 *
 * HTML5: 4.9.5 The tbody element
 * http://dev.w3.org/html5/spec/Overview.html#the-tbody-element
 * http://dev.w3.org/html5/spec/Overview.html#htmltablesectionelement
 */
HTMLTableSectionElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLTableSectionElement.prototype = new HTMLElement();
__extend__(HTMLTableSectionElement.prototype, {

    /*appendChild : function (child) {

    // disallow nesting of these elements.
    if (child.tagName.match(/TBODY|TFOOT|THEAD/)) {
    return this.parentNode.appendChild(child);
    } else {
    return Node.prototype.appendChild.apply(this, arguments);
    }

    },*/

    get align() {
        return this.getAttribute("align");
    },

    get ch() {
        return this.getAttribute("ch");
    },

    set ch(ch) {
        this.setAttribute("ch", ch);
    },

    // ch gets or sets the alignment character for cells in a column.
    set chOff(chOff) {
        this.setAttribute("chOff", chOff);
    },

    get chOff() {
        return this.getAttribute("chOff");
    },

    get vAlign () {
        return this.getAttribute("vAlign");
    },

    get rows() {
        return new HTMLCollection(this.getElementsByTagName("tr"));
    },

    insertRow : function (idx) {
        if (idx === undefined) {
            throw new Error("Index omitted in call to HTMLTableSectionElement.insertRow ");
        }

        var numRows = this.rows.length,
        node = null;

        if (idx > numRows) {
            throw new Error("Index > rows.length in call to HTMLTableSectionElement.insertRow");
        }

        var row = document.createElement("tr");
        // If index is -1 or equal to the number of rows,
        // the row is appended as the last row. If index is omitted
        // or greater than the number of rows, an error will result
        if (idx === -1 || idx === numRows) {
            this.appendChild(row);
        } else {
            node = this.firstChild;

            for (var i=0; i<idx; i++) {
                node = node.nextSibling;
            }
        }

        this.insertBefore(row, node);

        return row;
    },

    deleteRow : function (idx) {
        var elem = this.rows[idx];
        this.removeChild(elem);
    },

    toString: function() {
        return '[object HTMLTableSectionElement]';
    }
});

/**
 * HTMLTableCellElement
 * base interface for TD and TH
 *
 * HTML5: 4.9.11 Attributes common to td and th elements
 * http://dev.w3.org/html5/spec/Overview.html#htmltablecellelement
 */
HTMLTableCellElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLTableCellElement.prototype = new HTMLElement();
__extend__(HTMLTableCellElement.prototype, {


    // TOOD: attribute unsigned long  colSpan;
    // TODO: attribute unsigned long  rowSpan;
    // TODO: attribute DOMString      headers;
    // TODO: readonly attribute long  cellIndex;

    // Not really necessary but might be helpful in debugging
    toString: function() {
        return '[object HTMLTableCellElement]';
    }

});

/**
 * HTMLTableDataCellElement
 * HTML5: 4.9.9 The td Element
 * http://dev.w3.org/html5/spec/Overview.html#the-td-element
 */
HTMLTableDataCellElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLTableDataCellElement.prototype = new HTMLTableCellElement();
__extend__(HTMLTableDataCellElement.prototype, {

    // adds no new properties or methods

    toString: function() {
        return '[object HTMLTableDataCellElement]';
    }
});

/**
 * HTMLTableHeaderCellElement
 * HTML5: 4.9.10 The th Element
 * http://dev.w3.org/html5/spec/Overview.html#the-th-element
 */
HTMLTableHeaderCellElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLTableHeaderCellElement.prototype = new HTMLTableCellElement();
__extend__(HTMLTableHeaderCellElement.prototype, {

    // TODO:  attribute DOMString scope

    toString: function() {
        return '[object HTMLTableHeaderCellElement]';
    }
});


/**
 * HTMLTextAreaElement - DOM Level 2
 * HTML5: 4.10.11 The textarea element
 * http://dev.w3.org/html5/spec/Overview.html#the-textarea-element
 */
HTMLTextAreaElement = function(ownerDocument) {
    HTMLInputAreaCommon.apply(this, arguments);
    this._rawvalue = null;
};
HTMLTextAreaElement.prototype = new HTMLInputAreaCommon();
__extend__(HTMLTextAreaElement.prototype, {
    get cols(){
        return Number(this.getAttribute('cols')||'-1');
    },
    set cols(value){
        this.setAttribute('cols', value);
    },
    get rows(){
        return Number(this.getAttribute('rows')||'-1');
    },
    set rows(value){
        this.setAttribute('rows', value);
    },

    /*
     * read-only
     */
    get type() {
        return this.getAttribute('type') || 'textarea';
    },

    /**
     * This modifies the text node under the widget
     */
    get defaultValue() {
        return this.textContent;
    },
    set defaultValue(value) {
        this.textContent = value;
    },

    /**
     * http://dev.w3.org/html5/spec/Overview.html#concept-textarea-raw-value
     */
    get value() {
        return (this._rawvalue === null) ? this.defaultValue : this._rawvalue;
    },
    set value(value) {
        this._rawvalue = value;
    },
    toString: function() {
        return '[object HTMLTextAreaElement]';
    }
});

// Named Element Support
HTMLElement.registerSetAttribute('TEXTAREA', 'name',
                                 __updateFormForNamedElement__);

/**
 * HTMLTitleElement - DOM Level 2
 *
 * HTML5: 4.2.2 The title element
 * http://dev.w3.org/html5/spec/Overview.html#the-title-element-0
 */
HTMLTitleElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLTitleElement.prototype = new HTMLElement();
__extend__(HTMLTitleElement.prototype, {
    get text() {
        return this.innerText;
    },

    set text(titleStr) {
        this.textContent = titleStr;
    },
    toString: function() {
        return '[object HTMLTitleElement]';
    }
});



/**
 * HTMLRowElement - DOM Level 2
 * Implementation Provided by Steven Wood
 *
 * HTML5: 4.9.8 The tr element
 * http://dev.w3.org/html5/spec/Overview.html#the-tr-element
 */
HTMLTableRowElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLTableRowElement.prototype = new HTMLElement();
__extend__(HTMLTableRowElement.prototype, {

    /*appendChild : function (child) {

      var retVal = Node.prototype.appendChild.apply(this, arguments);
      retVal.cellIndex = this.cells.length -1;

      return retVal;
      },*/
    // align gets or sets the horizontal alignment of data within cells of the row.
    get align() {
        return this.getAttribute("align");
    },

    get bgColor() {
        return this.getAttribute("bgcolor");
    },

    get cells() {
        var nl = this.getElementsByTagName("td");
        return new HTMLCollection(nl);
    },

    get ch() {
        return this.getAttribute("ch");
    },

    set ch(ch) {
        this.setAttribute("ch", ch);
    },

    // ch gets or sets the alignment character for cells in a column.
    set chOff(chOff) {
        this.setAttribute("chOff", chOff);
    },

    get chOff() {
        return this.getAttribute("chOff");
    },

    /**
     * http://dev.w3.org/html5/spec/Overview.html#dom-tr-rowindex
     */
    get rowIndex() {
        var nl = this.parentNode.childNodes;
        for (var i=0; i<nl.length; i++) {
            if (nl[i] === this) {
                return i;
            }
        }
        return -1;
    },

    /**
     * http://dev.w3.org/html5/spec/Overview.html#dom-tr-sectionrowindex
     */
    get sectionRowIndex() {
        var nl = this.parentNode.getElementsByTagName(this.tagName);
        for (var i=0; i<nl.length; i++) {
            if (nl[i] === this) {
                return i;
            }
        }
        return -1;
    },

    get vAlign () {
        return this.getAttribute("vAlign");
    },

    insertCell : function (idx) {
        if (idx === undefined) {
            throw new Error("Index omitted in call to HTMLTableRow.insertCell");
        }

        var numCells = this.cells.length,
        node = null;

        if (idx > numCells) {
            throw new Error("Index > rows.length in call to HTMLTableRow.insertCell");
        }

        var cell = document.createElement("td");

        if (idx === -1 || idx === numCells) {
            this.appendChild(cell);
        } else {


            node = this.firstChild;

            for (var i=0; i<idx; i++) {
                node = node.nextSibling;
            }
        }

        this.insertBefore(cell, node);
        cell.cellIndex = idx;

        return cell;
    },
    deleteCell : function (idx) {
        var elem = this.cells[idx];
        this.removeChild(elem);
    },
    toString: function() {
        return '[object HTMLTableRowElement]';
    }

});

/*
 * HTMLUListElement
 * HTML5: 4.5.7 The ul Element
 * http://dev.w3.org/html5/spec/Overview.html#htmlhtmlelement
 */
HTMLUListElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};

HTMLUListElement.prototype = new HTMLElement();
__extend__(HTMLUListElement.prototype, {

    // no additional properties or elements

    toString: function() {
        return '[object HTMLUListElement]';
    }
});


/**
 * HTMLUnknownElement DOM Level 2
 */
HTMLUnknownElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLUnknownElement.prototype = new HTMLElement();
__extend__(HTMLUnknownElement.prototype,{
    toString: function(){
        return '[object HTMLUnknownElement]';
    }
});

/**
 * @author john resig & the envjs team
 * @uri http://www.envjs.com/
 * @copyright 2008-2010
 * @license MIT
 */
//CLOSURE_END
}());

/**
 * DOM Style Level 2
 */
var CSS2Properties,
    CSSRule,
    CSSStyleRule,
    CSSImportRule,
    CSSMediaRule,
    CSSFontFaceRule,
    CSSPageRule,
    CSSRuleList,
    CSSStyleSheet,
    StyleSheet,
    StyleSheetList;
;

/*
 * Envjs css.1.2.35 
 * Pure JavaScript Browser Environment
 * By John Resig <http://ejohn.org/> and the Envjs Team
 * Copyright 2008-2010 John Resig, under the MIT License
 */

//CLOSURE_START
(function(){





/**
 * @author john resig
 */
// Helper method for extending one object with another.
function __extend__(a,b) {
    for ( var i in b ) {
        var g = b.__lookupGetter__(i), s = b.__lookupSetter__(i);
        if ( g || s ) {
            if ( g ) { a.__defineGetter__(i, g); }
            if ( s ) { a.__defineSetter__(i, s); }
        } else {
            a[i] = b[i];
        }
    } return a;
}

/**
 * @author john resig
 */
//from jQuery
function __setArray__( target, array ) {
    // Resetting the length to 0, then using the native Array push
    // is a super-fast way to populate an object with array-like properties
    target.length = 0;
    Array.prototype.push.apply( target, array );
}

/**
 * @author ariel flesler
 *    http://flesler.blogspot.com/2008/11/fast-trim-function-for-javascript.html
 * @param {Object} str
 */
function __trim__( str ){
    return (str || "").replace( /^\s+|\s+$/g, "" );
}

/*
 * Interface DocumentStyle (introduced in DOM Level 2)
 * http://www.w3.org/TR/2000/REC-DOM-Level-2-Style-20001113/stylesheets.html#StyleSheets-StyleSheet-DocumentStyle
 *
 * interface DocumentStyle {
 *   readonly attribute StyleSheetList   styleSheets;
 * };
 *
 */
__extend__(Document.prototype, {
    get styleSheets() {
        if (! this._styleSheets) {
            this._styleSheets = new StyleSheetList();
        }
        return this._styleSheets;
    }
});
/*
 * CSS2Properties - DOM Level 2 CSS
 * Renamed to CSSStyleDeclaration??
 */

var __toCamelCase__ = function(name) {
    if (name) {
        return name.replace(/\-(\w)/g, function(all, letter) {
            return letter.toUpperCase();
        });
    }
    return name;
};

var __toDashed__ = function(camelCaseName) {
    if (camelCaseName) {
        return camelCaseName.replace(/[A-Z]/g, function(all) {
            return '-' + all.toLowerCase();
        });
    }
    return camelCaseName;
};

CSS2Properties = function(element){
    //console.log('css2properties %s', __cssproperties__++);
    this.styleIndex = __supportedStyles__;//non-standard
    this.type = element.tagName;//non-standard
    __setArray__(this, []);
    __cssTextToStyles__(this, element.cssText || '');
};
__extend__(CSS2Properties.prototype, {
    get cssText() {
        var i, css = [];
        for (i = 0; i < this.length; ++i) {
            css.push(this[i] + ': ' + this.getPropertyValue(this[i]) + ';');
        }
        return css.join(' ');
    },
    set cssText(cssText) {
        __cssTextToStyles__(this, cssText);
    },
    getPropertyCSSValue: function(name) {
        //?
    },
    getPropertyPriority: function() {

    },
    getPropertyValue: function(name) {
        var index, cname = __toCamelCase__(name);
        if (cname in this.styleIndex) {
            return this[cname];
        } else {
            index = Array.prototype.indexOf.apply(this, [name]);
            if (index > -1) {
                return this[index];
            }
        }
        return null;
    },
    item: function(index) {
        return this[index];
    },
    removeProperty: function(name) {
        this.styleIndex[name] = null;
        name = __toDashed__(name);
        var index = Array.prototype.indexOf.apply(this, [name]);
        if (index > -1) {
            Array.prototype.splice.apply(this, [1,index]);
        }
    },
    setProperty: function(name, value, priority) {
        var nval;
        name = __toCamelCase__(name);
        if (value !== undefined && name in this.styleIndex) {
            // NOTE:  parseFloat('300px') ==> 300  no
            // NOTE:  Number('300px') ==> Nan      yes
            nval = Number(value);
            this.styleIndex[name] = isNaN(nval) ? value : nval;
            name = __toDashed__(name);
            if (Array.prototype.indexOf.apply(this, [name]) === -1 ){
                Array.prototype.push.apply(this,[name]);
            }
        }
    },
    toString: function() {
        return '[object CSS2Properties]';
    }
});



var __cssTextToStyles__ = function(css2props, cssText) {
    //console.log('__cssTextToStyles__ %s %s', css2props, cssText);
    //var styleArray=[];
    var i, style, styles = cssText.split(';');
    for (i = 0; i < styles.length; ++i) {
        style = styles[i].split(':');
        if (style.length === 2) {
            css2props.setProperty(style[0].replace(' ', '', 'g'),
                                  style[1].replace(' ', '', 'g'));
        }
    }
};

//Obviously these arent all supported but by commenting out various
//sections this provides a single location to configure what is
//exposed as supported.
var __supportedStyles__ = {
    azimuth:                null,
    background:             null,
    backgroundAttachment:   null,
    backgroundColor:        'rgb(0,0,0)',
    backgroundImage:        null,
    backgroundPosition:     null,
    backgroundRepeat:       null,
    border:                 null,
    borderBottom:           null,
    borderBottomColor:      null,
    borderBottomStyle:      null,
    borderBottomWidth:      null,
    borderCollapse:         null,
    borderColor:            null,
    borderLeft:             null,
    borderLeftColor:        null,
    borderLeftStyle:        null,
    borderLeftWidth:        null,
    borderRight:            null,
    borderRightColor:       null,
    borderRightStyle:       null,
    borderRightWidth:       null,
    borderSpacing:          null,
    borderStyle:            null,
    borderTop:              null,
    borderTopColor:         null,
    borderTopStyle:         null,
    borderTopWidth:         null,
    borderWidth:            null,
    bottom:                 null,
    captionSide:            null,
    clear:                  null,
    clip:                   null,
    color:                  null,
    content:                null,
    counterIncrement:       null,
    counterReset:           null,
    cssFloat:               null,
    cue:                    null,
    cueAfter:               null,
    cueBefore:              null,
    cursor:                 null,
    direction:              'ltr',
    display:                null,
    elevation:              null,
    emptyCells:             null,
    font:                   null,
    fontFamily:             null,
    fontSize:               '1em',
    fontSizeAdjust:         null,
    fontStretch:            null,
    fontStyle:              null,
    fontVariant:            null,
    fontWeight:             null,
    height:                 '',
    left:                   null,
    letterSpacing:          null,
    lineHeight:             null,
    listStyle:              null,
    listStyleImage:         null,
    listStylePosition:      null,
    listStyleType:          null,
    margin:                 null,
    marginBottom:           '0px',
    marginLeft:             '0px',
    marginRight:            '0px',
    marginTop:              '0px',
    markerOffset:           null,
    marks:                  null,
    maxHeight:              null,
    maxWidth:               null,
    minHeight:              null,
    minWidth:               null,
    opacity:                1,
    orphans:                null,
    outline:                null,
    outlineColor:           null,
    outlineOffset:          null,
    outlineStyle:           null,
    outlineWidth:           null,
    overflow:               null,
    overflowX:              null,
    overflowY:              null,
    padding:                null,
    paddingBottom:          '0px',
    paddingLeft:            '0px',
    paddingRight:           '0px',
    paddingTop:             '0px',
    page:                   null,
    pageBreakAfter:         null,
    pageBreakBefore:        null,
    pageBreakInside:        null,
    pause:                  null,
    pauseAfter:             null,
    pauseBefore:            null,
    pitch:                  null,
    pitchRange:             null,
    position:               null,
    quotes:                 null,
    richness:               null,
    right:                  null,
    size:                   null,
    speak:                  null,
    speakHeader:            null,
    speakNumeral:           null,
    speakPunctuation:       null,
    speechRate:             null,
    stress:                 null,
    tableLayout:            null,
    textAlign:              null,
    textDecoration:         null,
    textIndent:             null,
    textShadow:             null,
    textTransform:          null,
    top:                    null,
    unicodeBidi:            null,
    verticalAlign:          null,
    visibility:             '',
    voiceFamily:            null,
    volume:                 null,
    whiteSpace:             null,
    widows:                 null,
    width:                  '1px',
    wordSpacing:            null,
    zIndex:                 1
};

var __displayMap__ = {
    DIV      : 'block',
    P        : 'block',
    A        : 'inline',
    CODE     : 'inline',
    PRE      : 'block',
    SPAN     : 'inline',
    TABLE    : 'table',
    THEAD    : 'table-header-group',
    TBODY    : 'table-row-group',
    TR       : 'table-row',
    TH       : 'table-cell',
    TD       : 'table-cell',
    UL       : 'block',
    LI       : 'list-item'
};

for (var style in __supportedStyles__) {
    if (__supportedStyles__.hasOwnProperty(style)) {
        (function(name) {
            if (name === 'width' || name === 'height') {
                CSS2Properties.prototype.__defineGetter__(name, function() {
                    if (this.display === 'none'){
                        return '0px';
                    }
                    return this.styleIndex[name];
                });
            } else if (name === 'display') {
                //display will be set to a tagName specific value if ''
                CSS2Properties.prototype.__defineGetter__(name, function() {
                    var val = this.styleIndex[name];
                    val = val ? val :__displayMap__[this.type];
                    return val;
                });
            } else {
                CSS2Properties.prototype.__defineGetter__(name, function() {
                    return this.styleIndex[name];
                });
            }
            CSS2Properties.prototype.__defineSetter__(name, function(value) {
                this.setProperty(name, value);
            });
        }(style));
    }
}

/*
 * CSSRule - DOM Level 2
 */
CSSRule = function(options) {



    var $style,
    $selectorText = options.selectorText ? options.selectorText : '';
    $style = new CSS2Properties({
        cssText: options.cssText ? options.cssText : null
    });

    return __extend__(this, {
        get style(){
            return $style;
        },
        get selectorText(){
            return $selectorText;
        },
        set selectorText(selectorText){
            $selectorText = selectorText;
        },
        toString : function(){
            return "[object CSSRule]";
        }
    });
};
CSSRule.STYLE_RULE     =  1;
CSSRule.IMPORT_RULE    =  3;
CSSRule.MEDIA_RULE     =  4;
CSSRule.FONT_FACE_RULE =  5;
CSSRule.PAGE_RULE      =  6;
//CSSRule.NAMESPACE_RULE = 10;


CSSStyleRule = function() {

};

CSSImportRule = function() {

};

CSSMediaRule = function() {

};

CSSFontFaceRule = function() {

};

CSSPageRule = function() {

};


CSSRuleList = function(data) {
    this.length = 0;
    __setArray__(this, data);
};

__extend__(CSSRuleList.prototype, {
    item : function(index) {
        if ((index >= 0) && (index < this.length)) {
            // bounds check
            return this[index];
        }
        return null;
    },
    toString: function() {
        return '[object CSSRuleList]';
    }
});

/**
 * StyleSheet
 * http://dev.w3.org/csswg/cssom/#stylesheet
 *
 * interface StyleSheet {
 *   readonly attribute DOMString type;
 *   readonly attribute DOMString href;
 *   readonly attribute Node ownerNode;
 *   readonly attribute StyleSheet parentStyleSheet;
 *   readonly attribute DOMString title;
 *   [PutForwards=mediaText] readonly attribute MediaList media;
 *          attribute boolean disabled;
 * };
 */
StyleSheet = function() {
}

/*
 * CSSStyleSheet
 * http://dev.w3.org/csswg/cssom/#cssstylesheet
 *
 * interface CSSStyleSheet : StyleSheet {
 *   readonly attribute CSSRule ownerRule;
 *   readonly attribute CSSRuleList cssRules;
 *   unsigned long insertRule(DOMString rule, unsigned long index);
 *   void deleteRule(unsigned long index);
 * };
 */
CSSStyleSheet = function(options){
    var $cssRules,
        $disabled = options.disabled ? options.disabled : false,
        $href = options.href ? options.href : null,
        $parentStyleSheet = options.parentStyleSheet ? options.parentStyleSheet : null,
        $title = options.title ? options.title : "",
        $type = "text/css";

    function parseStyleSheet(text){
        //$debug("parsing css");
        //this is pretty ugly, but text is the entire text of a stylesheet
        var cssRules = [];
        if (!text) {
            text = '';
        }
        text = __trim__(text.replace(/\/\*(\r|\n|.)*\*\//g,""));
        // TODO: @import
        var blocks = text.split("}");
        blocks.pop();
        var i, j, len = blocks.length;
        var definition_block, properties, selectors;
        for (i=0; i<len; i++) {
            definition_block = blocks[i].split("{");
            if (definition_block.length === 2) {
                selectors = definition_block[0].split(",");
                for (j=0; j<selectors.length; j++) {
                    cssRules.push(new CSSRule({
                        selectorText : __trim__(selectors[j]),
                        cssText      : definition_block[1]
                    }));
                }
            }
        }
        return cssRules;
    }

    $cssRules = new CSSRuleList(parseStyleSheet(options.textContent));

    return __extend__(this, {
        get cssRules(){
            return $cssRules;
        },
        get rule(){
            return $cssRules;
        },//IE - may be deprecated
        get href(){
            return $href;
        },
        get parentStyleSheet(){
            return $parentStyleSheet;
        },
        get title(){
            return $title;
        },
        get type(){
            return $type;
        },
        addRule: function(selector, style, index){/*TODO*/},
        deleteRule: function(index){/*TODO*/},
        insertRule: function(rule, index){/*TODO*/},
        //IE - may be deprecated
        removeRule: function(index){
            this.deleteRule(index);
        }
    });
};

StyleSheetList = function() {
}
StyleSheetList.prototype = new Array();
__extend__(StyleSheetList.prototype, {
    item : function(index) {
        if ((index >= 0) && (index < this.length)) {
            // bounds check
            return this[index];
        }
        return null;
    },
    toString: function() {
        return '[object StyleSheetList]';
    }
});
/**
 * This extends HTMLElement to handle CSS-specific interfaces.
 *
 * More work / research would be needed to extend just (DOM) Element
 * for xml use and additional changes for just HTMLElement.
 */


/**
 * Replace or add  the getter for 'style'
 *
 * This could be wrapped in a closure
 */
var $css2properties = [{}];

__extend__(HTMLElement.prototype, {
    get style(){
        if ( !this.css2uuid ) {
            this.css2uuid = $css2properties.length;
            $css2properties[this.css2uuid] = new CSS2Properties(this);
        }
        return $css2properties[this.css2uuid];
    }
});

/**
 * Change for how 'setAttribute("style", ...)' works
 *
 * We are truly adding functionality to HtmlElement.setAttribute, not
 * replacing it.  So we need to save the old one first, call it, then
 * do our stuff.  If we need to do more hacks like this, HTMLElement
 * (or regular Element) needs to have a hooks array or dispatch table
 * for global changes.
 *
 * This could be wrapped in a closure if desired.
 */
var updateCss2Props = function(elem, values) {
    //console.log('__updateCss2Props__ %s %s', elem, values);
    if ( !elem.css2uuid ) {
        elem.css2uuid = $css2properties.length;
        $css2properties[elem.css2uuid] = new CSS2Properties(elem);
    }
    __cssTextToStyles__($css2properties[elem.css2uuid], values);
};

var origSetAttribute =  HTMLElement.prototype.setAttribute;

HTMLElement.prototype.setAttribute = function(name, value) {
    //console.log("CSS set attribute: " + name + ", " + value);
    origSetAttribute.apply(this, arguments);
    if (name === "style") {
        updateCss2Props(this, value);
    }
};

var origGetAttribute =  HTMLElement.prototype.getAttribute;

HTMLElement.prototype.getAttribute = function(name) {
    //console.log("CSS set attribute: " + name + ", " + value);
	var style;
    if (name === "style") {
        style = this.style.cssText;
		return style===""?null:style;
    }else{
	    return origGetAttribute.apply(this, arguments);
	}
};

/**
 * @author john resig & the envjs team
 * @uri http://www.envjs.com/
 * @copyright 2008-2010
 * @license MIT
 */
//CLOSURE_END
}());
/*
 * Envjs xhr.1.2.35 
 * Pure JavaScript Browser Environment
 * By John Resig <http://ejohn.org/> and the Envjs Team
 * Copyright 2008-2010 John Resig, under the MIT License
 * 
 * Parts of the implementation originally written by Yehuda Katz.
 * 
 * This file simply provides the global definitions we need to 
 * be able to correctly implement to core browser (XML)HTTPRequest 
 * interfaces.
 */
var Location,
    XMLHttpRequest;

/*
 * Envjs xhr.1.2.35 
 * Pure JavaScript Browser Environment
 * By John Resig <http://ejohn.org/> and the Envjs Team
 * Copyright 2008-2010 John Resig, under the MIT License
 */

//CLOSURE_START
(function(){





/**
 * @author john resig
 */
// Helper method for extending one object with another.
function __extend__(a,b) {
    for ( var i in b ) {
        var g = b.__lookupGetter__(i), s = b.__lookupSetter__(i);
        if ( g || s ) {
            if ( g ) { a.__defineGetter__(i, g); }
            if ( s ) { a.__defineSetter__(i, s); }
        } else {
            a[i] = b[i];
        }
    } return a;
}

/**
 * @author john resig
 */
//from jQuery
function __setArray__( target, array ) {
    // Resetting the length to 0, then using the native Array push
    // is a super-fast way to populate an object with array-like properties
    target.length = 0;
    Array.prototype.push.apply( target, array );
}

/**
 * @author ariel flesler
 *    http://flesler.blogspot.com/2008/11/fast-trim-function-for-javascript.html
 * @param {Object} str
 */
function __trim__( str ){
    return (str || "").replace( /^\s+|\s+$/g, "" );
}


/**
 * @todo: document
 */
__extend__(Document.prototype,{
    load: function(url){
        if(this.documentURI == 'about:html'){
            this.location.assign(url);
        }else if(this.documentURI == url){
            this.location.reload(false);
        }else{
            this.location.replace(url);
        }
    },
    get location(){
        return this.ownerWindow.location;
    },
    set location(url){
        //very important or you will go into an infinite
        //loop when creating a xml document
        this.ownerWindow.location = url;
    }
});

/**
 * Location
 *
 * Mozilla MDC:
 * https://developer.mozilla.org/En/DOM/Window.location
 * https://developer.mozilla.org/en/DOM/document.location
 *
 * HTML5: 6.10.4 The Location interface
 * http://dev.w3.org/html5/spec/Overview.html#location
 *
 * HTML5: 2.5.3 Interfaces for URL manipulation
 * http://dev.w3.org/html5/spec/Overview.html#url-decomposition-idl-attributes
 * All of section 2.5 is worth reading, but 2.5.3 contains very
 * detailed information on how getters/setter should work
 *
 * NOT IMPLEMENTED:
 *  HTML5: Section 6.10.4.1 Security -- prevents scripts from another domain
 *   from accessing most of the 'Location'
 *  Not sure if anyone implements this in HTML4
 */

Location = function(url, doc, history) {
    //console.log('Location url %s', url);
    var $url = url,
        $document = doc ? doc : null,
        $history = history ? history : null;

    var parts = Envjs.urlsplit($url);

    return {
        get hash() {
            return parts.fragment ? '#' + parts.fragment : parts.fragment;
        },
        set hash(s) {
            if (s[0] === '#') {
                parts.fragment = s.substr(1);
            } else {
                parts.fragment = s;
            }
            $url = Envjs.urlunsplit(parts);
            if ($history) {
                $history.add($url, 'hash');
            }
        },

        get host() {
            return parts.netloc;
        },
        set host(s) {
            if (!s || s === '') {
                return;
            }

            parts.netloc = s;
            $url = Envjs.urlunsplit(parts);

            // this regenerates hostname & port
            parts = Envjs.urlsplit($url);

            if ($history) {
                $history.add( $url, 'host');
            }
            this.assign($url);
        },

        get hostname() {
            return parts.hostname;
        },
        set hostname(s) {
            if (!s || s === '') {
                return;
            }

            parts.netloc = s;
            if (parts.port != '') {
                parts.netloc += ':' + parts.port;
            }
            parts.hostname = s;
            $url = Envjs.urlunsplit(parts);
            if ($history) {
                $history.add( $url, 'hostname');
            }
            this.assign($url);
        },

        get href() {
            return $url;
        },
        set href(url) {
            $url = url;
            if ($history) {
                $history.add($url, 'href');
            }
            this.assign($url);
        },

        get pathname() {
            return parts.path;
        },
        set pathname(s) {
            if (s[0] === '/') {
                parts.path = s;
            } else {
                parts.path = '/' + s;
            }
            $url = Envjs.urlunsplit(parts);

            if ($history) {
                $history.add($url, 'pathname');
            }
            this.assign($url);
        },

        get port() {
            // make sure it's a string
            return '' + parts.port;
        },
        set port(p) {
            // make a string
            var s = '' + p;
            parts.port = s;
            parts.netloc = parts.hostname + ':' + parts.port;
            $url = Envjs.urlunsplit(parts);
            if ($history) {
                $history.add( $url, 'port');
            }
            this.assign($url);
        },

        get protocol() {
            return parts.scheme + ':';
        },
        set protocol(s) {
            var i = s.indexOf(':');
            if (i != -1) {
                s = s.substr(0,i);
            }
            parts.scheme = s;
            $url = Envjs.urlunsplit(parts);
            if ($history) {
                $history.add($url, 'protocol');
            }
            this.assign($url);
        },

        get search() {
            return (parts.query) ? '?' + parts.query : parts.query;
        },
        set search(s) {
            if (s[0] == '?') {
                s = s.substr(1);
            }
            parts.query = s;
            $url = Envjs.urlunsplit(parts);
            if ($history) {
                $history.add($url, 'search');
            }
            this.assign($url);
        },

        toString: function() {
            return $url;
        },

        assign: function(url, /*non-standard*/ method, data) {
            var _this = this,
                xhr,
                event;
			method = method||"GET";
			data = data||null;
            //console.log('assigning %s',url);

            //we can only assign if this Location is associated with a document
            if ($document) {
                //console.log('fetching %s (async? %s)', url, $document.async);
                xhr = new XMLHttpRequest();
				
		        xhr.setRequestHeader('Referer', $document.location);
				//console.log("REFERER: %s", $document.location);
                // TODO: make async flag a Envjs paramter
                xhr.open(method, url, false);//$document.async);

                // TODO: is there a better way to test if a node is an HTMLDocument?
                if ($document.toString() === '[object HTMLDocument]') {
                    //tell the xhr to not parse the document as XML
                    //console.log('loading html document');
                    xhr.onreadystatechange = function() {
                        //console.log('readyState %s', xhr.readyState);
                        if (xhr.readyState === 4) {
							switch(xhr.status){
							case 301:
							case 302:
							case 303:
							case 305:
							case 307:
								//console.log('status is not good for assignment %s', xhr.status);
								break;
                       		default:
								//console.log('status is good for assignment %s', xhr.status);
	                        	if (xhr.readyState === 4) {// update closure upvars
					            	$url = xhr.url;
						            parts = Envjs.urlsplit($url);
	                            	//console.log('new document baseURI %s', xhr.url);
	                            	Envjs.exchangeHTMLDocument($document, xhr.responseText, xhr.url);
	                        	}
							}
                        }
                    };
					try{
                    	xhr.send(data, false);//dont parse html
					}catch(e){
						console.log('failed to load content %s', e);
						Envjs.exchangeHTMLDocument($document, "\
							<html><head><title>Error Loading</title></head><body>"+e+"</body></html>\
						", xhr.url);
					}
                } else {
                    //Treat as an XMLDocument
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState === 4) {
							console.log('exchanging xml content %s', e);
                            $document = xhr.responseXML;
                            $document.baseURI = xhr.url;
                            if ($document.createEvent) {
                                event = $document.createEvent('Event');
                                event.initEvent('DOMContentLoaded');
                                $document.dispatchEvent( event, false );
                            }
                        }
                    };
                    xhr.send();
                }

            };

        },
        reload: function(forceget) {
            //for now we have no caching so just proxy to assign
            //console.log('reloading %s',$url);
            this.assign($url);
        },
        replace: function(url, /*non-standard*/ method, data) {
            this.assign(url, method, data);
        }
    };
};


/**
 *
 * @class XMLHttpRequest
 * @author Originally implemented by Yehuda Katz
 *
 */

// this implementation can be used without requiring a DOMParser
// assuming you dont try to use it to get xml/html documents
var domparser;

XMLHttpRequest = function(){
    this.headers = {};
    this.responseHeaders = {};
    this.aborted = false;//non-standard
};

// defined by the standard: http://www.w3.org/TR/XMLHttpRequest/#xmlhttprequest
// but not provided by Firefox.  Safari and others do define it.
XMLHttpRequest.UNSENT = 0;
XMLHttpRequest.OPEN = 1;
XMLHttpRequest.HEADERS_RECEIVED = 2;
XMLHttpRequest.LOADING = 3;
XMLHttpRequest.DONE = 4;

XMLHttpRequest.prototype = {
    open: function(method, url, async, user, password){
        //console.log('openning xhr %s %s %s', method, url, async);
        this.readyState = 1;
        this.async = (async === false)?false:true;
        this.method = method || "GET";
        this.url = Envjs.uri(url);
        this.onreadystatechange();
    },
    setRequestHeader: function(header, value){
        this.headers[header] = value;
    },
    send: function(data, parsedoc/*non-standard*/, redirect_count){
        var _this = this;
		//console.log('sending request for url %s', this.url);
        parsedoc = (parsedoc === undefined)?true:!!parsedoc;
        redirect_count = (redirect_count === undefined) ? 0 : redirect_count;
        function makeRequest(){
            var cookie = Envjs.getCookies(_this.url),
				redirecting = false;
            if(cookie){
                _this.setRequestHeader('COOKIE', cookie);
            }
			if(window&&window.navigator&&window.navigator.userAgent)
	        	_this.setRequestHeader('User-Agent', window.navigator.userAgent);
            Envjs.connection(_this, function(){
                if (!_this.aborted){
                    var doc = null,
                        domparser,
                        cookie;
                    
                    try{
                        cookie = _this.getResponseHeader('SET-COOKIE');
                        if(cookie){
                            Envjs.setCookie(_this.url, cookie);
                        }
                    }catch(e){
                        console.warn("Failed to set cookie");
                    }
                    //console.log('status : %s', _this.status);
					switch(_this.status){
						case 301:
						case 302:
						case 303:
						case 305:
						case 307:
						if(_this.getResponseHeader('Location') && redirect_count < 20){
							//follow redirect and copy headers
							redirecting = true;
							//console.log('following %s redirect %s from %s url %s', 
							//	redirect_count, _this.status, _this.url, _this.getResponseHeader('Location'));
	                        _this.url = Envjs.uri(_this.getResponseHeader('Location'));
	                        //remove current cookie headers to allow the redirect to determine
	                        //the currect cookie based on the new location
	                        if('Cookie' in _this.headers ){
	                            delete _this.headers.Cookie;
	                        }
	                        if('Cookie2' in _this.headers ){
	                            delete _this.headers.Cookie2;
	                        }
							redirect_count++;
							if (_this.async){
					            //TODO: see TODO notes below
					            Envjs.runAsync(makeRequest);
					        }else{
					            makeRequest();
					        }
							return;
						}break;
						default:
						// try to parse the document if we havent explicitly set a
                        // flag saying not to and if we can assure the text at least
                        // starts with valid xml
                        if ( parsedoc && 
                            _this.getResponseHeader('Content-Type').indexOf('xml') > -1 &&
                            _this.responseText.match(/^\s*</) ) {
                            domparser = domparser||new DOMParser();
                            try {
                                //console.log("parsing response text into xml document");
                                doc = domparser.parseFromString(_this.responseText+"", 'text/xml');
                            } catch(e) {
                                //Envjs.error('response XML does not appear to be well formed xml', e);
                                console.warn('parseerror \n%s', e);
                                doc = document.implementation.createDocument('','error',null);
                                doc.appendChild(doc.createTextNode(e+''));
                            }
                        }else{
                            //Envjs.warn('response XML does not appear to be xml');
                        }

                        _this.__defineGetter__("responseXML", function(){
                            return doc;
                        });
							
					}
                }
            }, data);

            if (!_this.aborted  && !redirecting){
				//console.log('did not abort so call onreadystatechange');
                _this.onreadystatechange();
            }
        }

        if (this.async){
            //TODO: what we really need to do here is rejoin the
            //      current thread and call onreadystatechange via
            //      setTimeout so the callback is essentially applied
            //      at the end of the current callstack
            //console.log('requesting async: %s', this.url);
            Envjs.runAsync(makeRequest);
        }else{
            //console.log('requesting sync: %s', this.url);
            makeRequest();
        }
    },
    abort: function(){
        this.aborted = true;
    },
    onreadystatechange: function(){
        //Instance specific
    },
    getResponseHeader: function(header){
        //$debug('GETTING RESPONSE HEADER '+header);
        var rHeader, returnedHeaders;
        if (this.readyState < 3){
            throw new Error("INVALID_STATE_ERR");
        } else {
            returnedHeaders = [];
            for (rHeader in this.responseHeaders) {
                if (rHeader.match(new RegExp(header, "i"))) {
                    returnedHeaders.push(this.responseHeaders[rHeader]);
                }
            }

            if (returnedHeaders.length){
                //$debug('GOT RESPONSE HEADER '+returnedHeaders.join(", "));
                return returnedHeaders.join(", ");
            }
        }
        return null;
    },
    getAllResponseHeaders: function(){
        var header, returnedHeaders = [];
        if (this.readyState < 3){
            throw new Error("INVALID_STATE_ERR");
        } else {
            for (header in this.responseHeaders) {
                returnedHeaders.push( header + ": " + this.responseHeaders[header] );
            }
        }
        return returnedHeaders.join("\r\n");
    },
    async: true,
    readyState: 0,
    responseText: "",
    status: 0,
    statusText: ""
};

/**
 * @author john resig & the envjs team
 * @uri http://www.envjs.com/
 * @copyright 2008-2010
 * @license MIT
 */
//CLOSURE_END
}());

/**
 * @todo: document
 */
var Window,
    Screen,
    History,
    Navigator;


/*
 * Envjs window.1.2.35 
 * Pure JavaScript Browser Environment
 * By John Resig <http://ejohn.org/> and the Envjs Team
 * Copyright 2008-2010 John Resig, under the MIT License
 */

//CLOSURE_START
(function(){





/**
 * @author john resig
 */
// Helper method for extending one object with another.
function __extend__(a,b) {
    for ( var i in b ) {
        var g = b.__lookupGetter__(i), s = b.__lookupSetter__(i);
        if ( g || s ) {
            if ( g ) { a.__defineGetter__(i, g); }
            if ( s ) { a.__defineSetter__(i, s); }
        } else {
            a[i] = b[i];
        }
    } return a;
}

/**
 * @todo: document
 */

__extend__(HTMLFrameElement.prototype,{

    /*get contentDocument(){
        return this.contentWindow?
            this.contentWindow.document:
            null;
    },*/	
    set src(value){
        var event;
        this.setAttribute('src', value);
		//only load if we are already appended to the dom
        if (this.parentNode && value && value.length > 0){
            console.log('loading frame via set src %s', value);
            Envjs.loadFrame(this, Envjs.uri(value, this.ownerDocument?this.ownerDocument.location+'':null));

			//DUPLICATED IN src/platform/core/event.js (Envjs.exchangeHTMLDocument)
            /*console.log('event frame load %s', value);
            event = this.ownerDocument.createEvent('HTMLEvents');
            event.initEvent("load", false, false);
            this.dispatchEvent( event, false );*/
        }
    }

});
HTMLIFrameElement.prototype.contentDocument = HTMLFrameElement.prototype.contentDocument;
HTMLIFrameElement.prototype.src = HTMLFrameElement.prototype.src;


/*
 *       history.js
 *
 */

History = function(owner) {
    var $current = 0,
        $history = [null],
        $owner = owner;

    return {
        go : function(target) {
            if (typeof target === "number") {
                target = $current + target;
                if (target > -1 && target < $history.length){
                    if ($history[target].type === "hash") {
                        if ($owner.location) {
                            $owner.location.hash = $history[target].value;
                        }
                    } else {
                        if ($owner.location) {
                            $owner.location = $history[target].value;
                        }
                    }
                    $current = target;
                }
            } else {
                //TODO: walk through the history and find the 'best match'?
            }
        },

        get length() {
            return $history.length;
        },

        back : function(count) {
            if (count) {
                this.go(-count);
            } else {
                this.go(-1);
            }
        },

        get current() {
            return this.item($current);
        },

        get previous() {
            return this.item($current-1);
        },

        forward : function(count) {
            if (count) {
                this.go(count);
            } else {
                this.go(1);
            }
        },

        item: function(idx) {
            if (idx >= 0 && idx < $history.length) {
                return $history[idx];
            } else {
                return null;
            }
        },

        add: function(newLocation, type) {
            //not a standard interface, we expose it to simplify
            //history state modifications
            if (newLocation !== $history[$current]) {
                $history.slice(0, $current);
                $history.push({
                    type: type || 'href',
                    value: newLocation
                });
            }
        }
    }; /* closes 'return {' */
};


/*
 *      navigator.js
 *  Browser Navigator
 */
Navigator = function(){
	var $userAgent;
    return {
        get appCodeName(){
            return Envjs.appCodeName;
        },
        get appName(){
            return Envjs.appName;
        },
        get appVersion(){
            return Envjs.version +" ("+
                this.platform +"; "+
                "U; "+//?
                Envjs.os_name+" "+Envjs.os_arch+" "+Envjs.os_version+"; "+
                (Envjs.lang?Envjs.lang:"en-US")+"; "+
                "rv:"+Envjs.revision+
                ")";
        },
        get cookieEnabled(){
            return true;
        },
        get mimeTypes(){
            return [];
        },
        get platform(){
            return Envjs.platform;
        },
        get plugins(){
            return [];
        },
        get userAgent(){
            return $userAgent||(this.appCodeName + "/" + this.appVersion + " Resig/20070309 PilotFish/1.2.35");
        },
		set userAgent(agent){
			$userAgent = agent;
		},
        javaEnabled : function(){
            return Envjs.javaEnabled;
        }
    };
};


/**
 * Screen
 * @param {Object} __window__
 */

Screen = function(__window__){

    var $availHeight  = 600,
        $availWidth   = 800,
        $colorDepth   = 16,
        $pixelDepth   = 24,
        $height       = 600,
        $width        = 800,
        $top          = 0,
        $left         = 0,
        $availTop     = 0,
        $availLeft    = 0;

    __extend__( __window__, {
        moveBy : function(dx,dy){
            //TODO - modify $locals to reflect change
        },
        moveTo : function(x,y) {
            //TODO - modify $locals to reflect change
        },
        /*print : function(){
            //TODO - good global to modify to ensure print is not misused
        };*/
        resizeBy : function(dw, dh){
            __window__resizeTo($width + dw, $height + dh);
        },
        resizeTo : function(width, height){
            $width = (width <= $availWidth) ? width : $availWidth;
            $height = (height <= $availHeight) ? height : $availHeight;
        },
        scroll : function(x,y){
            //TODO - modify $locals to reflect change
        },
        scrollBy : function(dx, dy){
            //TODO - modify $locals to reflect change
        },
        scrollTo : function(x,y){
            //TODO - modify $locals to reflect change
        }
    });

    return {
        get top(){
            return $top;
        },
        get left(){
            return $left;
        },
        get availTop(){
            return $availTop;
        },
        get availLeft(){
            return $availLeft;
        },
        get availHeight(){
            return $availHeight;
        },
        get availWidth(){
            return $availWidth;
        },
        get colorDepth(){
            return $colorDepth;
        },
        get pixelDepth(){
            return $pixelDepth;
        },
        get height(){
            return $height;
        },
        get width(){
            return $width;
        }
    };
};

/*
 * Copyright (c) 2010 Nick Galbreath
 * http://code.google.com/p/stringencoders/source/browse/#svn/trunk/javascript
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

/* base64 encode/decode compatible with window.btoa/atob
 *
 * window.atob/btoa is a Firefox extension to convert binary data (the "b")
 * to base64 (ascii, the "a").
 *
 * It is also found in Safari and Chrome.  It is not available in IE.
 *
 * if (!window.btoa) window.btoa = base64.encode
 * if (!window.atob) window.atob = base64.decode
 *
 * The original spec's for atob/btoa are a bit lacking
 * https://developer.mozilla.org/en/DOM/window.atob
 * https://developer.mozilla.org/en/DOM/window.btoa
 *
 * window.btoa and base64.encode takes a string where charCodeAt is [0,255]
 * If any character is not [0,255], then an DOMException(5) is thrown.
 *
 * window.atob and base64.decode take a base64-encoded string
 * If the input length is not a multiple of 4, or contains invalid characters
 *   then an DOMException(5) is thrown.
 */
var base64 = {};
base64.PADCHAR = '=';
base64.ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

base64.makeDOMException = function() {
    // sadly in FF,Safari,Chrome you can't make a DOMException
    var e, tmp;

    try {
        return new DOMException(DOMException.INVALID_CHARACTER_ERR);
    } catch (tmp) {
        // not available, just passback a duck-typed equiv
        // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Error
        // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Error/prototype
        var ex = new Error("DOM Exception 5");

        // ex.number and ex.description is IE-specific.
        ex.code = ex.number = 5;
        ex.name = ex.description = "INVALID_CHARACTER_ERR";

        // Safari/Chrome output format
        ex.toString = function() { return 'Error: ' + ex.name + ': ' + ex.message; };
        return ex;
    }
};

base64.getbyte64 = function(s,i) {
    // This is oddly fast, except on Chrome/V8.
    //  Minimal or no improvement in performance by using a
    //   object with properties mapping chars to value (eg. 'A': 0)
    var idx = base64.ALPHA.indexOf(s.charAt(i));
    if (idx === -1) {
        throw base64.makeDOMException();
    }
    return idx;
};

base64.decode = function(s) {
    // convert to string
    s = '' + s;
    var getbyte64 = base64.getbyte64;
    var pads, i, b10;
    var imax = s.length;
    if (imax === 0) {
        return s;
    }

    if (imax % 4 !== 0) {
        throw base64.makeDOMException();
    }

    pads = 0;
    if (s.charAt(imax - 1) === base64.PADCHAR) {
        pads = 1;
        if (s.charAt(imax - 2) === base64.PADCHAR) {
            pads = 2;
        }
        // either way, we want to ignore this last block
        imax -= 4;
    }

    var x = [];
    for (i = 0; i < imax; i += 4) {
        b10 = (getbyte64(s,i) << 18) | (getbyte64(s,i+1) << 12) |
            (getbyte64(s,i+2) << 6) | getbyte64(s,i+3);
        x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 0xff, b10 & 0xff));
    }

    switch (pads) {
    case 1:
        b10 = (getbyte64(s,i) << 18) | (getbyte64(s,i+1) << 12) | (getbyte64(s,i+2) << 6);
        x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 0xff));
        break;
    case 2:
        b10 = (getbyte64(s,i) << 18) | (getbyte64(s,i+1) << 12);
        x.push(String.fromCharCode(b10 >> 16));
        break;
    }
    return x.join('');
};

base64.getbyte = function(s,i) {
    var x = s.charCodeAt(i);
    if (x > 255) {
        throw base64.makeDOMException();
    }
    return x;
};

base64.encode = function(s) {
    if (arguments.length !== 1) {
        throw new SyntaxError("Not enough arguments");
    }
    var padchar = base64.PADCHAR;
    var alpha   = base64.ALPHA;
    var getbyte = base64.getbyte;

    var i, b10;
    var x = [];

    // convert to string
    s = '' + s;

    var imax = s.length - s.length % 3;

    if (s.length === 0) {
        return s;
    }
    for (i = 0; i < imax; i += 3) {
        b10 = (getbyte(s,i) << 16) | (getbyte(s,i+1) << 8) | getbyte(s,i+2);
        x.push(alpha.charAt(b10 >> 18));
        x.push(alpha.charAt((b10 >> 12) & 0x3F));
        x.push(alpha.charAt((b10 >> 6) & 0x3f));
        x.push(alpha.charAt(b10 & 0x3f));
    }
    switch (s.length - imax) {
    case 1:
        b10 = getbyte(s,i) << 16;
        x.push(alpha.charAt(b10 >> 18) + alpha.charAt((b10 >> 12) & 0x3F) +
               padchar + padchar);
        break;
    case 2:
        b10 = (getbyte(s,i) << 16) | (getbyte(s,i+1) << 8);
        x.push(alpha.charAt(b10 >> 18) + alpha.charAt((b10 >> 12) & 0x3F) +
               alpha.charAt((b10 >> 6) & 0x3f) + padchar);
        break;
    }
    return x.join('');
};
//These descriptions of window properties are taken loosely David Flanagan's
//'JavaScript - The Definitive Guide' (O'Reilly)

var __top__ = function(_scope){
    var _parent = _scope.parent;
    while (_scope && _parent && _scope !== _parent) {
        if (_parent === _parent.parent) {
            break;
        }
        _parent = _parent.parent;
        //console.log('scope %s _parent %s', scope, _parent);
    }
    return _parent || null;
};

/**
 * Window
 * @param {Object} scope
 * @param {Object} parent
 * @param {Object} opener
 */
Window = function(scope, parent, opener){

    // the window property is identical to the self property and to this obj
    //var proxy = new Envjs.proxy(scope, parent);
    //scope.__proxy__ = proxy;
    scope.__defineGetter__('window', function(){
        return scope;
    });

    var $uuid = new Date().getTime()+'-'+Math.floor(Math.random()*1000000000000000);
    Envjs.windows($uuid, scope);
    //console.log('opening window %s', $uuid);

    // every window has one-and-only-one .document property which is always
    // an [object HTMLDocument].  also, only window.document objects are
    // html documents, all other documents created by the window.document are
    // [object XMLDocument]
    var $htmlImplementation =  new DOMImplementation();
    $htmlImplementation.namespaceAware = true;
    $htmlImplementation.errorChecking = false;

    // read only reference to the Document object
    var $document = new HTMLDocument($htmlImplementation, scope);

    // A read-only reference to the Window object that contains this window
    // or frame.  If the window is a top-level window, parent refers to
    // the window itself.  If this window is a frame, this property refers
    // to the window or frame that contains it.
    var $parent = parent;

    /**> $cookies - see cookie.js <*/
    // read only boolean specifies whether the window has been closed
    var $closed = false;

    // a read/write string that specifies the default message that
    // appears in the status line
    var $defaultStatus = "Done";

    // IE only, refers to the most recent event object - this maybe be
    // removed after review
    var $event = null;

    // a read-only reference to the History object
    var $history = new History();

    // a read-only reference to the Location object.  the location object does
    // expose read/write properties
    var $location = new Location('about:blank', $document, $history);

    // The name of window/frame. Set directly, when using open(), or in frameset.
    // May be used when specifying the target attribute of links
    var $name = null;

    // a read-only reference to the Navigator object
    var $navigator = new Navigator();

    // a read/write reference to the Window object that contained the script
    // that called open() to open this browser window.  This property is valid
    // only for top-level window objects.
    var $opener = opener?opener:null;

    // read-only properties that specify the height and width, in pixels
    var $innerHeight = 600, $innerWidth = 800;

    // Read-only properties that specify the total height and width, in pixels,
    // of the browser window. These dimensions include the height and width of
    // the menu bar, toolbars, scrollbars, window borders and so on.  These
    // properties are not supported by IE and IE offers no alternative
    // properties;
    var $outerHeight = $innerHeight,
        $outerWidth = $innerWidth;

    // Read-only properties that specify the number of pixels that the current
    // document has been scrolled to the right and down.  These are not
    // supported by IE.
    var $pageXOffset = 0, $pageYOffset = 0;

    // a read-only reference to the Screen object that specifies information
    // about the screen: the number of available pixels and the number of
    // available colors.
    var $screen = new Screen(scope);

    // read only properties that specify the coordinates of the upper-left
    // corner of the screen.
    var $screenX = 1,
        $screenY = 1;
    var $screenLeft = $screenX,
        $screenTop = $screenY;

    // a read/write string that specifies the current status line.
    var $status = '';

    __extend__(scope, EventTarget.prototype);

    return __extend__( scope, {
        get closed(){
            return $closed;
        },
        get defaultStatus(){
            return $defaultStatus;
        },
        set defaultStatus(defaultStatus){
            $defaultStatus = defaultStatus;
        },
        get document(){
            return $document;
        },
        set document(doc){
            $document = doc;
        },
        /*
        deprecated ie specific property probably not good to support
        get event(){
            return $event;
        },
        */
        get frames(){
        return new HTMLCollection($document.getElementsByTagName('frame'));
        },
        get length(){
            // should be frames.length,
            return this.frames.length;
        },
        get history(){
            return $history;
        },
        get innerHeight(){
            return $innerHeight;
        },
        get innerWidth(){
            return $innerWidth;
        },
        get clientHeight(){
            return $innerHeight;
        },
        get clientWidth(){
            return $innerWidth;
        },
        get location(){
            return $location;
        },
        set location(url){
			//very important or you will go into an infinite
        	//loop when creating a xml document
			//console.log('setting window location %s', url);
        	if(url) {
            	$location.assign(Envjs.uri(url, $location+''));
			}
        },
        get name(){
            return $name;
        },
        set name(newName){
            $name = newName;
        },
        get navigator(){
            return $navigator;
        },
        get opener(){
            return $opener;
        },
        get outerHeight(){
            return $outerHeight;
        },
        get outerWidth(){
            return $outerWidth;
        },
        get pageXOffest(){
            return $pageXOffset;
        },
        get pageYOffset(){
            return $pageYOffset;
        },
        get parent(){
            return $parent;
        },
        get screen(){
            return $screen;
        },
        get screenLeft(){
            return $screenLeft;
        },
        get screenTop(){
            return $screenTop;
        },
        get screenX(){
            return $screenX;
        },
        get screenY(){
            return $screenY;
        },
        get self(){
            return scope;
        },
        get status(){
            return $status;
        },
        set status(status){
            $status = status;
        },
        // a read-only reference to the top-level window that contains this window.
        // If this window is a top-level window it is simply a reference to itself.
        // If this window is a frame, the top property refers to the top-level
        // window that contains the frame.
        get top(){
            return __top__(scope);
        },
        get window(){
            return this;
        },
        toString : function(){
            return '[Window]';
        },

        /**
         * getComputedStyle
         *
         * Firefox 3.6:
         *  - Requires both elements to be present else an
         *    exception is thrown.
         *  - Returns a 'ComputedCSSStyleDeclaration' object.
         *    while a raw element.style returns a 'CSSStyleDeclaration' object.
         *  - Bogus input also throws exception
         *
         * Safari 4:
         *  - Requires one argument (second can be MIA)
         *  - Returns a CSSStyleDeclaration object
         *  - if bad imput, returns null
         *
         * getComputedStyle should really be an "add on" from the css
         * modules.  Unfortunately, 'window' comes way after the 'css'
         * so css can't add it.
         */
        getComputedStyle: function(element, pseudoElement) {
            return element.style;
        },

        open: function(url, name, features, replace){
            if (features) {
                console.log("'features argument not yet implemented");
            }
            var _window = Envjs.proxy({}),
                open;
            if(replace && name){
                for(open in Envjs.windows()){
                    if(open.name === name) {
                        _window = open;
                    }
                }
            }
            new Window(_window, _window, this);
            if(name) {
                _window.name = name;
            }
            _window.document.async = false;
            _window.document.location.assign(Envjs.uri(url));
            return _window;
        },
        close: function(){
            //console.log('closing window %s', __windows__[$uuid]);
			var frames = $document.getElementsByTagName('frame'),
				iframes = $document.getElementsByTagName('iframe'),
				i;
			for(i=0;i<frames.length;i++){
				Envjs.unloadFrame(frame[i]);
			}	
			for(i=0;i<iframes.length;i++){
				Envjs.unloadFrame(frame[i]);
			}
            try{
				Envjs.windows($uuid, null);
            }catch(e){
                console.log('%s',e);
            }
			return null;
        },
        alert : function(message){
            Envjs.alert(message);
        },
        confirm : function(question){
            return Envjs.confirm(question);
        },
        prompt : function(message, defaultMsg){
            return Envjs.prompt(message, defaultMsg);
        },
        btoa: function(binary){
            return base64.encode(binary);
        },
        atob: function(ascii){
            return base64.decode(ascii);
        },
		//these should be undefined on instantiation
        //onload: function(){},
        //onunload: function(){},
		focus: function(){},
		blur: function(){},
        get guid(){
            return $uuid;
        }
    });

};


//finally pre-supply the window with the window-like environment
//console.log('Default Window');
new Window(__this__, __this__);
console.log('[ %s ]',window.navigator.userAgent);

/**
 * @author john resig & the envjs team
 * @uri http://www.envjs.com/
 * @copyright 2008-2010
 * @license MIT
 */
//CLOSURE_END
}());
