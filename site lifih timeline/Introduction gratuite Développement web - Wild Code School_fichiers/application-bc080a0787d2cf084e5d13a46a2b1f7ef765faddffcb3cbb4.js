/*
Unobtrusive JavaScript
https://github.com/rails/rails/blob/master/actionview/app/assets/javascripts
Released under the MIT license
 */
;

(function() {
  var context = this;

  (function() {
    (function() {
      this.Rails = {
        linkClickSelector: 'a[data-confirm], a[data-method], a[data-remote]:not([disabled]), a[data-disable-with], a[data-disable]',
        buttonClickSelector: {
          selector: 'button[data-remote]:not([form]), button[data-confirm]:not([form])',
          exclude: 'form button'
        },
        inputChangeSelector: 'select[data-remote], input[data-remote], textarea[data-remote]',
        formSubmitSelector: 'form',
        formInputClickSelector: 'form input[type=submit], form input[type=image], form button[type=submit], form button:not([type]), input[type=submit][form], input[type=image][form], button[type=submit][form], button[form]:not([type])',
        formDisableSelector: 'input[data-disable-with]:enabled, button[data-disable-with]:enabled, textarea[data-disable-with]:enabled, input[data-disable]:enabled, button[data-disable]:enabled, textarea[data-disable]:enabled',
        formEnableSelector: 'input[data-disable-with]:disabled, button[data-disable-with]:disabled, textarea[data-disable-with]:disabled, input[data-disable]:disabled, button[data-disable]:disabled, textarea[data-disable]:disabled',
        fileInputSelector: 'input[name][type=file]:not([disabled])',
        linkDisableSelector: 'a[data-disable-with], a[data-disable]',
        buttonDisableSelector: 'button[data-remote][data-disable-with], button[data-remote][data-disable]'
      };

    }).call(this);
  }).call(context);

  var Rails = context.Rails;

  (function() {
    (function() {
      var nonce;

      nonce = null;

      Rails.loadCSPNonce = function() {
        var ref;
        return nonce = (ref = document.querySelector("meta[name=csp-nonce]")) != null ? ref.content : void 0;
      };

      Rails.cspNonce = function() {
        return nonce != null ? nonce : Rails.loadCSPNonce();
      };

    }).call(this);
    (function() {
      var expando, m;

      m = Element.prototype.matches || Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector;

      Rails.matches = function(element, selector) {
        if (selector.exclude != null) {
          return m.call(element, selector.selector) && !m.call(element, selector.exclude);
        } else {
          return m.call(element, selector);
        }
      };

      expando = '_ujsData';

      Rails.getData = function(element, key) {
        var ref;
        return (ref = element[expando]) != null ? ref[key] : void 0;
      };

      Rails.setData = function(element, key, value) {
        if (element[expando] == null) {
          element[expando] = {};
        }
        return element[expando][key] = value;
      };

      Rails.$ = function(selector) {
        return Array.prototype.slice.call(document.querySelectorAll(selector));
      };

    }).call(this);
    (function() {
      var $, csrfParam, csrfToken;

      $ = Rails.$;

      csrfToken = Rails.csrfToken = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-token]');
        return meta && meta.content;
      };

      csrfParam = Rails.csrfParam = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-param]');
        return meta && meta.content;
      };

      Rails.CSRFProtection = function(xhr) {
        var token;
        token = csrfToken();
        if (token != null) {
          return xhr.setRequestHeader('X-CSRF-Token', token);
        }
      };

      Rails.refreshCSRFTokens = function() {
        var param, token;
        token = csrfToken();
        param = csrfParam();
        if ((token != null) && (param != null)) {
          return $('form input[name="' + param + '"]').forEach(function(input) {
            return input.value = token;
          });
        }
      };

    }).call(this);
    (function() {
      var CustomEvent, fire, matches, preventDefault;

      matches = Rails.matches;

      CustomEvent = window.CustomEvent;

      if (typeof CustomEvent !== 'function') {
        CustomEvent = function(event, params) {
          var evt;
          evt = document.createEvent('CustomEvent');
          evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
          return evt;
        };
        CustomEvent.prototype = window.Event.prototype;
        preventDefault = CustomEvent.prototype.preventDefault;
        CustomEvent.prototype.preventDefault = function() {
          var result;
          result = preventDefault.call(this);
          if (this.cancelable && !this.defaultPrevented) {
            Object.defineProperty(this, 'defaultPrevented', {
              get: function() {
                return true;
              }
            });
          }
          return result;
        };
      }

      fire = Rails.fire = function(obj, name, data) {
        var event;
        event = new CustomEvent(name, {
          bubbles: true,
          cancelable: true,
          detail: data
        });
        obj.dispatchEvent(event);
        return !event.defaultPrevented;
      };

      Rails.stopEverything = function(e) {
        fire(e.target, 'ujs:everythingStopped');
        e.preventDefault();
        e.stopPropagation();
        return e.stopImmediatePropagation();
      };

      Rails.delegate = function(element, selector, eventType, handler) {
        return element.addEventListener(eventType, function(e) {
          var target;
          target = e.target;
          while (!(!(target instanceof Element) || matches(target, selector))) {
            target = target.parentNode;
          }
          if (target instanceof Element && handler.call(target, e) === false) {
            e.preventDefault();
            return e.stopPropagation();
          }
        });
      };

    }).call(this);
    (function() {
      var AcceptHeaders, CSRFProtection, createXHR, cspNonce, fire, prepareOptions, processResponse;

      cspNonce = Rails.cspNonce, CSRFProtection = Rails.CSRFProtection, fire = Rails.fire;

      AcceptHeaders = {
        '*': '*/*',
        text: 'text/plain',
        html: 'text/html',
        xml: 'application/xml, text/xml',
        json: 'application/json, text/javascript',
        script: 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript'
      };

      Rails.ajax = function(options) {
        var xhr;
        options = prepareOptions(options);
        xhr = createXHR(options, function() {
          var ref, response;
          response = processResponse((ref = xhr.response) != null ? ref : xhr.responseText, xhr.getResponseHeader('Content-Type'));
          if (Math.floor(xhr.status / 100) === 2) {
            if (typeof options.success === "function") {
              options.success(response, xhr.statusText, xhr);
            }
          } else {
            if (typeof options.error === "function") {
              options.error(response, xhr.statusText, xhr);
            }
          }
          return typeof options.complete === "function" ? options.complete(xhr, xhr.statusText) : void 0;
        });
        if ((options.beforeSend != null) && !options.beforeSend(xhr, options)) {
          return false;
        }
        if (xhr.readyState === XMLHttpRequest.OPENED) {
          return xhr.send(options.data);
        }
      };

      prepareOptions = function(options) {
        options.url = options.url || location.href;
        options.type = options.type.toUpperCase();
        if (options.type === 'GET' && options.data) {
          if (options.url.indexOf('?') < 0) {
            options.url += '?' + options.data;
          } else {
            options.url += '&' + options.data;
          }
        }
        if (AcceptHeaders[options.dataType] == null) {
          options.dataType = '*';
        }
        options.accept = AcceptHeaders[options.dataType];
        if (options.dataType !== '*') {
          options.accept += ', */*; q=0.01';
        }
        return options;
      };

      createXHR = function(options, done) {
        var xhr;
        xhr = new XMLHttpRequest();
        xhr.open(options.type, options.url, true);
        xhr.setRequestHeader('Accept', options.accept);
        if (typeof options.data === 'string') {
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        }
        if (!options.crossDomain) {
          xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
          CSRFProtection(xhr);
        }
        xhr.withCredentials = !!options.withCredentials;
        xhr.onreadystatechange = function() {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            return done(xhr);
          }
        };
        return xhr;
      };

      processResponse = function(response, type) {
        var parser, script;
        if (typeof response === 'string' && typeof type === 'string') {
          if (type.match(/\bjson\b/)) {
            try {
              response = JSON.parse(response);
            } catch (error) {}
          } else if (type.match(/\b(?:java|ecma)script\b/)) {
            script = document.createElement('script');
            script.setAttribute('nonce', cspNonce());
            script.text = response;
            document.head.appendChild(script).parentNode.removeChild(script);
          } else if (type.match(/\b(xml|html|svg)\b/)) {
            parser = new DOMParser();
            type = type.replace(/;.+/, '');
            try {
              response = parser.parseFromString(response, type);
            } catch (error) {}
          }
        }
        return response;
      };

      Rails.href = function(element) {
        return element.href;
      };

      Rails.isCrossDomain = function(url) {
        var e, originAnchor, urlAnchor;
        originAnchor = document.createElement('a');
        originAnchor.href = location.href;
        urlAnchor = document.createElement('a');
        try {
          urlAnchor.href = url;
          return !(((!urlAnchor.protocol || urlAnchor.protocol === ':') && !urlAnchor.host) || (originAnchor.protocol + '//' + originAnchor.host === urlAnchor.protocol + '//' + urlAnchor.host));
        } catch (error) {
          e = error;
          return true;
        }
      };

    }).call(this);
    (function() {
      var matches, toArray;

      matches = Rails.matches;

      toArray = function(e) {
        return Array.prototype.slice.call(e);
      };

      Rails.serializeElement = function(element, additionalParam) {
        var inputs, params;
        inputs = [element];
        if (matches(element, 'form')) {
          inputs = toArray(element.elements);
        }
        params = [];
        inputs.forEach(function(input) {
          if (!input.name || input.disabled) {
            return;
          }
          if (matches(input, 'select')) {
            return toArray(input.options).forEach(function(option) {
              if (option.selected) {
                return params.push({
                  name: input.name,
                  value: option.value
                });
              }
            });
          } else if (input.checked || ['radio', 'checkbox', 'submit'].indexOf(input.type) === -1) {
            return params.push({
              name: input.name,
              value: input.value
            });
          }
        });
        if (additionalParam) {
          params.push(additionalParam);
        }
        return params.map(function(param) {
          if (param.name != null) {
            return (encodeURIComponent(param.name)) + "=" + (encodeURIComponent(param.value));
          } else {
            return param;
          }
        }).join('&');
      };

      Rails.formElements = function(form, selector) {
        if (matches(form, 'form')) {
          return toArray(form.elements).filter(function(el) {
            return matches(el, selector);
          });
        } else {
          return toArray(form.querySelectorAll(selector));
        }
      };

    }).call(this);
    (function() {
      var allowAction, fire, stopEverything;

      fire = Rails.fire, stopEverything = Rails.stopEverything;

      Rails.handleConfirm = function(e) {
        if (!allowAction(this)) {
          return stopEverything(e);
        }
      };

      allowAction = function(element) {
        var answer, callback, message;
        message = element.getAttribute('data-confirm');
        if (!message) {
          return true;
        }
        answer = false;
        if (fire(element, 'confirm')) {
          try {
            answer = confirm(message);
          } catch (error) {}
          callback = fire(element, 'confirm:complete', [answer]);
        }
        return answer && callback;
      };

    }).call(this);
    (function() {
      var disableFormElement, disableFormElements, disableLinkElement, enableFormElement, enableFormElements, enableLinkElement, formElements, getData, matches, setData, stopEverything;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, stopEverything = Rails.stopEverything, formElements = Rails.formElements;

      Rails.handleDisabledElement = function(e) {
        var element;
        element = this;
        if (element.disabled) {
          return stopEverything(e);
        }
      };

      Rails.enableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return enableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formEnableSelector)) {
          return enableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return enableFormElements(element);
        }
      };

      Rails.disableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return disableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formDisableSelector)) {
          return disableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return disableFormElements(element);
        }
      };

      disableLinkElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          setData(element, 'ujs:enable-with', element.innerHTML);
          element.innerHTML = replacement;
        }
        element.addEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', true);
      };

      enableLinkElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          element.innerHTML = originalText;
          setData(element, 'ujs:enable-with', null);
        }
        element.removeEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', null);
      };

      disableFormElements = function(form) {
        return formElements(form, Rails.formDisableSelector).forEach(disableFormElement);
      };

      disableFormElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          if (matches(element, 'button')) {
            setData(element, 'ujs:enable-with', element.innerHTML);
            element.innerHTML = replacement;
          } else {
            setData(element, 'ujs:enable-with', element.value);
            element.value = replacement;
          }
        }
        element.disabled = true;
        return setData(element, 'ujs:disabled', true);
      };

      enableFormElements = function(form) {
        return formElements(form, Rails.formEnableSelector).forEach(enableFormElement);
      };

      enableFormElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          if (matches(element, 'button')) {
            element.innerHTML = originalText;
          } else {
            element.value = originalText;
          }
          setData(element, 'ujs:enable-with', null);
        }
        element.disabled = false;
        return setData(element, 'ujs:disabled', null);
      };

    }).call(this);
    (function() {
      var stopEverything;

      stopEverything = Rails.stopEverything;

      Rails.handleMethod = function(e) {
        var csrfParam, csrfToken, form, formContent, href, link, method;
        link = this;
        method = link.getAttribute('data-method');
        if (!method) {
          return;
        }
        href = Rails.href(link);
        csrfToken = Rails.csrfToken();
        csrfParam = Rails.csrfParam();
        form = document.createElement('form');
        formContent = "<input name='_method' value='" + method + "' type='hidden' />";
        if ((csrfParam != null) && (csrfToken != null) && !Rails.isCrossDomain(href)) {
          formContent += "<input name='" + csrfParam + "' value='" + csrfToken + "' type='hidden' />";
        }
        formContent += '<input type="submit" />';
        form.method = 'post';
        form.action = href;
        form.target = link.target;
        form.innerHTML = formContent;
        form.style.display = 'none';
        document.body.appendChild(form);
        form.querySelector('[type="submit"]').click();
        return stopEverything(e);
      };

    }).call(this);
    (function() {
      var ajax, fire, getData, isCrossDomain, isRemote, matches, serializeElement, setData, stopEverything,
        slice = [].slice;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, fire = Rails.fire, stopEverything = Rails.stopEverything, ajax = Rails.ajax, isCrossDomain = Rails.isCrossDomain, serializeElement = Rails.serializeElement;

      isRemote = function(element) {
        var value;
        value = element.getAttribute('data-remote');
        return (value != null) && value !== 'false';
      };

      Rails.handleRemote = function(e) {
        var button, data, dataType, element, method, url, withCredentials;
        element = this;
        if (!isRemote(element)) {
          return true;
        }
        if (!fire(element, 'ajax:before')) {
          fire(element, 'ajax:stopped');
          return false;
        }
        withCredentials = element.getAttribute('data-with-credentials');
        dataType = element.getAttribute('data-type') || 'script';
        if (matches(element, Rails.formSubmitSelector)) {
          button = getData(element, 'ujs:submit-button');
          method = getData(element, 'ujs:submit-button-formmethod') || element.method;
          url = getData(element, 'ujs:submit-button-formaction') || element.getAttribute('action') || location.href;
          if (method.toUpperCase() === 'GET') {
            url = url.replace(/\?.*$/, '');
          }
          if (element.enctype === 'multipart/form-data') {
            data = new FormData(element);
            if (button != null) {
              data.append(button.name, button.value);
            }
          } else {
            data = serializeElement(element, button);
          }
          setData(element, 'ujs:submit-button', null);
          setData(element, 'ujs:submit-button-formmethod', null);
          setData(element, 'ujs:submit-button-formaction', null);
        } else if (matches(element, Rails.buttonClickSelector) || matches(element, Rails.inputChangeSelector)) {
          method = element.getAttribute('data-method');
          url = element.getAttribute('data-url');
          data = serializeElement(element, element.getAttribute('data-params'));
        } else {
          method = element.getAttribute('data-method');
          url = Rails.href(element);
          data = element.getAttribute('data-params');
        }
        ajax({
          type: method || 'GET',
          url: url,
          data: data,
          dataType: dataType,
          beforeSend: function(xhr, options) {
            if (fire(element, 'ajax:beforeSend', [xhr, options])) {
              return fire(element, 'ajax:send', [xhr]);
            } else {
              fire(element, 'ajax:stopped');
              return false;
            }
          },
          success: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:success', args);
          },
          error: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:error', args);
          },
          complete: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:complete', args);
          },
          crossDomain: isCrossDomain(url),
          withCredentials: (withCredentials != null) && withCredentials !== 'false'
        });
        return stopEverything(e);
      };

      Rails.formSubmitButtonClick = function(e) {
        var button, form;
        button = this;
        form = button.form;
        if (!form) {
          return;
        }
        if (button.name) {
          setData(form, 'ujs:submit-button', {
            name: button.name,
            value: button.value
          });
        }
        setData(form, 'ujs:formnovalidate-button', button.formNoValidate);
        setData(form, 'ujs:submit-button-formaction', button.getAttribute('formaction'));
        return setData(form, 'ujs:submit-button-formmethod', button.getAttribute('formmethod'));
      };

      Rails.preventInsignificantClick = function(e) {
        var data, insignificantMetaClick, link, metaClick, method, nonPrimaryMouseClick;
        link = this;
        method = (link.getAttribute('data-method') || 'GET').toUpperCase();
        data = link.getAttribute('data-params');
        metaClick = e.metaKey || e.ctrlKey;
        insignificantMetaClick = metaClick && method === 'GET' && !data;
        nonPrimaryMouseClick = (e.button != null) && e.button !== 0;
        if (nonPrimaryMouseClick || insignificantMetaClick) {
          return e.stopImmediatePropagation();
        }
      };

    }).call(this);
    (function() {
      var $, CSRFProtection, delegate, disableElement, enableElement, fire, formSubmitButtonClick, getData, handleConfirm, handleDisabledElement, handleMethod, handleRemote, loadCSPNonce, preventInsignificantClick, refreshCSRFTokens;

      fire = Rails.fire, delegate = Rails.delegate, getData = Rails.getData, $ = Rails.$, refreshCSRFTokens = Rails.refreshCSRFTokens, CSRFProtection = Rails.CSRFProtection, loadCSPNonce = Rails.loadCSPNonce, enableElement = Rails.enableElement, disableElement = Rails.disableElement, handleDisabledElement = Rails.handleDisabledElement, handleConfirm = Rails.handleConfirm, preventInsignificantClick = Rails.preventInsignificantClick, handleRemote = Rails.handleRemote, formSubmitButtonClick = Rails.formSubmitButtonClick, handleMethod = Rails.handleMethod;

      if ((typeof jQuery !== "undefined" && jQuery !== null) && (jQuery.ajax != null)) {
        if (jQuery.rails) {
          throw new Error('If you load both jquery_ujs and rails-ujs, use rails-ujs only.');
        }
        jQuery.rails = Rails;
        jQuery.ajaxPrefilter(function(options, originalOptions, xhr) {
          if (!options.crossDomain) {
            return CSRFProtection(xhr);
          }
        });
      }

      Rails.start = function() {
        if (window._rails_loaded) {
          throw new Error('rails-ujs has already been loaded!');
        }
        window.addEventListener('pageshow', function() {
          $(Rails.formEnableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
          return $(Rails.linkDisableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
        });
        delegate(document, Rails.linkDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.linkDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.linkClickSelector, 'click', preventInsignificantClick);
        delegate(document, Rails.linkClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.linkClickSelector, 'click', handleConfirm);
        delegate(document, Rails.linkClickSelector, 'click', disableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleRemote);
        delegate(document, Rails.linkClickSelector, 'click', handleMethod);
        delegate(document, Rails.buttonClickSelector, 'click', preventInsignificantClick);
        delegate(document, Rails.buttonClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleConfirm);
        delegate(document, Rails.buttonClickSelector, 'click', disableElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleRemote);
        delegate(document, Rails.inputChangeSelector, 'change', handleDisabledElement);
        delegate(document, Rails.inputChangeSelector, 'change', handleConfirm);
        delegate(document, Rails.inputChangeSelector, 'change', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', handleDisabledElement);
        delegate(document, Rails.formSubmitSelector, 'submit', handleConfirm);
        delegate(document, Rails.formSubmitSelector, 'submit', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', function(e) {
          return setTimeout((function() {
            return disableElement(e);
          }), 13);
        });
        delegate(document, Rails.formSubmitSelector, 'ajax:send', disableElement);
        delegate(document, Rails.formSubmitSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.formInputClickSelector, 'click', preventInsignificantClick);
        delegate(document, Rails.formInputClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleConfirm);
        delegate(document, Rails.formInputClickSelector, 'click', formSubmitButtonClick);
        document.addEventListener('DOMContentLoaded', refreshCSRFTokens);
        document.addEventListener('DOMContentLoaded', loadCSPNonce);
        return window._rails_loaded = true;
      };

      if (window.Rails === Rails && fire(document, 'rails:attachBindings')) {
        Rails.start();
      }

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = Rails;
  } else if (typeof define === "function" && define.amd) {
    define(Rails);
  }
}).call(this);
/*
Turbolinks 5.2.0
Copyright © 2018 Basecamp, LLC
 */

(function(){var t=this;(function(){(function(){this.Turbolinks={supported:function(){return null!=window.history.pushState&&null!=window.requestAnimationFrame&&null!=window.addEventListener}(),visit:function(t,r){return e.controller.visit(t,r)},clearCache:function(){return e.controller.clearCache()},setProgressBarDelay:function(t){return e.controller.setProgressBarDelay(t)}}}).call(this)}).call(t);var e=t.Turbolinks;(function(){(function(){var t,r,n,o=[].slice;e.copyObject=function(t){var e,r,n;r={};for(e in t)n=t[e],r[e]=n;return r},e.closest=function(e,r){return t.call(e,r)},t=function(){var t,e;return t=document.documentElement,null!=(e=t.closest)?e:function(t){var e;for(e=this;e;){if(e.nodeType===Node.ELEMENT_NODE&&r.call(e,t))return e;e=e.parentNode}}}(),e.defer=function(t){return setTimeout(t,1)},e.throttle=function(t){var e;return e=null,function(){var r;return r=1<=arguments.length?o.call(arguments,0):[],null!=e?e:e=requestAnimationFrame(function(n){return function(){return e=null,t.apply(n,r)}}(this))}},e.dispatch=function(t,e){var r,o,i,s,a,u;return a=null!=e?e:{},u=a.target,r=a.cancelable,o=a.data,i=document.createEvent("Events"),i.initEvent(t,!0,r===!0),i.data=null!=o?o:{},i.cancelable&&!n&&(s=i.preventDefault,i.preventDefault=function(){return this.defaultPrevented||Object.defineProperty(this,"defaultPrevented",{get:function(){return!0}}),s.call(this)}),(null!=u?u:document).dispatchEvent(i),i},n=function(){var t;return t=document.createEvent("Events"),t.initEvent("test",!0,!0),t.preventDefault(),t.defaultPrevented}(),e.match=function(t,e){return r.call(t,e)},r=function(){var t,e,r,n;return t=document.documentElement,null!=(e=null!=(r=null!=(n=t.matchesSelector)?n:t.webkitMatchesSelector)?r:t.msMatchesSelector)?e:t.mozMatchesSelector}(),e.uuid=function(){var t,e,r;for(r="",t=e=1;36>=e;t=++e)r+=9===t||14===t||19===t||24===t?"-":15===t?"4":20===t?(Math.floor(4*Math.random())+8).toString(16):Math.floor(15*Math.random()).toString(16);return r}}).call(this),function(){e.Location=function(){function t(t){var e,r;null==t&&(t=""),r=document.createElement("a"),r.href=t.toString(),this.absoluteURL=r.href,e=r.hash.length,2>e?this.requestURL=this.absoluteURL:(this.requestURL=this.absoluteURL.slice(0,-e),this.anchor=r.hash.slice(1))}var e,r,n,o;return t.wrap=function(t){return t instanceof this?t:new this(t)},t.prototype.getOrigin=function(){return this.absoluteURL.split("/",3).join("/")},t.prototype.getPath=function(){var t,e;return null!=(t=null!=(e=this.requestURL.match(/\/\/[^\/]*(\/[^?;]*)/))?e[1]:void 0)?t:"/"},t.prototype.getPathComponents=function(){return this.getPath().split("/").slice(1)},t.prototype.getLastPathComponent=function(){return this.getPathComponents().slice(-1)[0]},t.prototype.getExtension=function(){var t,e;return null!=(t=null!=(e=this.getLastPathComponent().match(/\.[^.]*$/))?e[0]:void 0)?t:""},t.prototype.isHTML=function(){return this.getExtension().match(/^(?:|\.(?:htm|html|xhtml))$/)},t.prototype.isPrefixedBy=function(t){var e;return e=r(t),this.isEqualTo(t)||o(this.absoluteURL,e)},t.prototype.isEqualTo=function(t){return this.absoluteURL===(null!=t?t.absoluteURL:void 0)},t.prototype.toCacheKey=function(){return this.requestURL},t.prototype.toJSON=function(){return this.absoluteURL},t.prototype.toString=function(){return this.absoluteURL},t.prototype.valueOf=function(){return this.absoluteURL},r=function(t){return e(t.getOrigin()+t.getPath())},e=function(t){return n(t,"/")?t:t+"/"},o=function(t,e){return t.slice(0,e.length)===e},n=function(t,e){return t.slice(-e.length)===e},t}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.HttpRequest=function(){function r(r,n,o){this.delegate=r,this.requestCanceled=t(this.requestCanceled,this),this.requestTimedOut=t(this.requestTimedOut,this),this.requestFailed=t(this.requestFailed,this),this.requestLoaded=t(this.requestLoaded,this),this.requestProgressed=t(this.requestProgressed,this),this.url=e.Location.wrap(n).requestURL,this.referrer=e.Location.wrap(o).absoluteURL,this.createXHR()}return r.NETWORK_FAILURE=0,r.TIMEOUT_FAILURE=-1,r.timeout=60,r.prototype.send=function(){var t;return this.xhr&&!this.sent?(this.notifyApplicationBeforeRequestStart(),this.setProgress(0),this.xhr.send(),this.sent=!0,"function"==typeof(t=this.delegate).requestStarted?t.requestStarted():void 0):void 0},r.prototype.cancel=function(){return this.xhr&&this.sent?this.xhr.abort():void 0},r.prototype.requestProgressed=function(t){return t.lengthComputable?this.setProgress(t.loaded/t.total):void 0},r.prototype.requestLoaded=function(){return this.endRequest(function(t){return function(){var e;return 200<=(e=t.xhr.status)&&300>e?t.delegate.requestCompletedWithResponse(t.xhr.responseText,t.xhr.getResponseHeader("Turbolinks-Location")):(t.failed=!0,t.delegate.requestFailedWithStatusCode(t.xhr.status,t.xhr.responseText))}}(this))},r.prototype.requestFailed=function(){return this.endRequest(function(t){return function(){return t.failed=!0,t.delegate.requestFailedWithStatusCode(t.constructor.NETWORK_FAILURE)}}(this))},r.prototype.requestTimedOut=function(){return this.endRequest(function(t){return function(){return t.failed=!0,t.delegate.requestFailedWithStatusCode(t.constructor.TIMEOUT_FAILURE)}}(this))},r.prototype.requestCanceled=function(){return this.endRequest()},r.prototype.notifyApplicationBeforeRequestStart=function(){return e.dispatch("turbolinks:request-start",{data:{url:this.url,xhr:this.xhr}})},r.prototype.notifyApplicationAfterRequestEnd=function(){return e.dispatch("turbolinks:request-end",{data:{url:this.url,xhr:this.xhr}})},r.prototype.createXHR=function(){return this.xhr=new XMLHttpRequest,this.xhr.open("GET",this.url,!0),this.xhr.timeout=1e3*this.constructor.timeout,this.xhr.setRequestHeader("Accept","text/html, application/xhtml+xml"),this.xhr.setRequestHeader("Turbolinks-Referrer",this.referrer),this.xhr.onprogress=this.requestProgressed,this.xhr.onload=this.requestLoaded,this.xhr.onerror=this.requestFailed,this.xhr.ontimeout=this.requestTimedOut,this.xhr.onabort=this.requestCanceled},r.prototype.endRequest=function(t){return this.xhr?(this.notifyApplicationAfterRequestEnd(),null!=t&&t.call(this),this.destroy()):void 0},r.prototype.setProgress=function(t){var e;return this.progress=t,"function"==typeof(e=this.delegate).requestProgressed?e.requestProgressed(this.progress):void 0},r.prototype.destroy=function(){var t;return this.setProgress(1),"function"==typeof(t=this.delegate).requestFinished&&t.requestFinished(),this.delegate=null,this.xhr=null},r}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.ProgressBar=function(){function e(){this.trickle=t(this.trickle,this),this.stylesheetElement=this.createStylesheetElement(),this.progressElement=this.createProgressElement()}var r;return r=300,e.defaultCSS=".turbolinks-progress-bar {\n  position: fixed;\n  display: block;\n  top: 0;\n  left: 0;\n  height: 3px;\n  background: #0076ff;\n  z-index: 9999;\n  transition: width "+r+"ms ease-out, opacity "+r/2+"ms "+r/2+"ms ease-in;\n  transform: translate3d(0, 0, 0);\n}",e.prototype.show=function(){return this.visible?void 0:(this.visible=!0,this.installStylesheetElement(),this.installProgressElement(),this.startTrickling())},e.prototype.hide=function(){return this.visible&&!this.hiding?(this.hiding=!0,this.fadeProgressElement(function(t){return function(){return t.uninstallProgressElement(),t.stopTrickling(),t.visible=!1,t.hiding=!1}}(this))):void 0},e.prototype.setValue=function(t){return this.value=t,this.refresh()},e.prototype.installStylesheetElement=function(){return document.head.insertBefore(this.stylesheetElement,document.head.firstChild)},e.prototype.installProgressElement=function(){return this.progressElement.style.width=0,this.progressElement.style.opacity=1,document.documentElement.insertBefore(this.progressElement,document.body),this.refresh()},e.prototype.fadeProgressElement=function(t){return this.progressElement.style.opacity=0,setTimeout(t,1.5*r)},e.prototype.uninstallProgressElement=function(){return this.progressElement.parentNode?document.documentElement.removeChild(this.progressElement):void 0},e.prototype.startTrickling=function(){return null!=this.trickleInterval?this.trickleInterval:this.trickleInterval=setInterval(this.trickle,r)},e.prototype.stopTrickling=function(){return clearInterval(this.trickleInterval),this.trickleInterval=null},e.prototype.trickle=function(){return this.setValue(this.value+Math.random()/100)},e.prototype.refresh=function(){return requestAnimationFrame(function(t){return function(){return t.progressElement.style.width=10+90*t.value+"%"}}(this))},e.prototype.createStylesheetElement=function(){var t;return t=document.createElement("style"),t.type="text/css",t.textContent=this.constructor.defaultCSS,t},e.prototype.createProgressElement=function(){var t;return t=document.createElement("div"),t.className="turbolinks-progress-bar",t},e}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.BrowserAdapter=function(){function r(r){this.controller=r,this.showProgressBar=t(this.showProgressBar,this),this.progressBar=new e.ProgressBar}var n,o,i;return i=e.HttpRequest,n=i.NETWORK_FAILURE,o=i.TIMEOUT_FAILURE,r.prototype.visitProposedToLocationWithAction=function(t,e){return this.controller.startVisitToLocationWithAction(t,e)},r.prototype.visitStarted=function(t){return t.issueRequest(),t.changeHistory(),t.loadCachedSnapshot()},r.prototype.visitRequestStarted=function(t){return this.progressBar.setValue(0),t.hasCachedSnapshot()||"restore"!==t.action?this.showProgressBarAfterDelay():this.showProgressBar()},r.prototype.visitRequestProgressed=function(t){return this.progressBar.setValue(t.progress)},r.prototype.visitRequestCompleted=function(t){return t.loadResponse()},r.prototype.visitRequestFailedWithStatusCode=function(t,e){switch(e){case n:case o:return this.reload();default:return t.loadResponse()}},r.prototype.visitRequestFinished=function(t){return this.hideProgressBar()},r.prototype.visitCompleted=function(t){return t.followRedirect()},r.prototype.pageInvalidated=function(){return this.reload()},r.prototype.showProgressBarAfterDelay=function(){return this.progressBarTimeout=setTimeout(this.showProgressBar,this.controller.progressBarDelay)},r.prototype.showProgressBar=function(){return this.progressBar.show()},r.prototype.hideProgressBar=function(){return this.progressBar.hide(),clearTimeout(this.progressBarTimeout)},r.prototype.reload=function(){return window.location.reload()},r}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.History=function(){function r(e){this.delegate=e,this.onPageLoad=t(this.onPageLoad,this),this.onPopState=t(this.onPopState,this)}return r.prototype.start=function(){return this.started?void 0:(addEventListener("popstate",this.onPopState,!1),addEventListener("load",this.onPageLoad,!1),this.started=!0)},r.prototype.stop=function(){return this.started?(removeEventListener("popstate",this.onPopState,!1),removeEventListener("load",this.onPageLoad,!1),this.started=!1):void 0},r.prototype.push=function(t,r){return t=e.Location.wrap(t),this.update("push",t,r)},r.prototype.replace=function(t,r){return t=e.Location.wrap(t),this.update("replace",t,r)},r.prototype.onPopState=function(t){var r,n,o,i;return this.shouldHandlePopState()&&(i=null!=(n=t.state)?n.turbolinks:void 0)?(r=e.Location.wrap(window.location),o=i.restorationIdentifier,this.delegate.historyPoppedToLocationWithRestorationIdentifier(r,o)):void 0},r.prototype.onPageLoad=function(t){return e.defer(function(t){return function(){return t.pageLoaded=!0}}(this))},r.prototype.shouldHandlePopState=function(){return this.pageIsLoaded()},r.prototype.pageIsLoaded=function(){return this.pageLoaded||"complete"===document.readyState},r.prototype.update=function(t,e,r){var n;return n={turbolinks:{restorationIdentifier:r}},history[t+"State"](n,null,e)},r}()}.call(this),function(){e.HeadDetails=function(){function t(t){var e,r,n,s,a,u;for(this.elements={},n=0,a=t.length;a>n;n++)u=t[n],u.nodeType===Node.ELEMENT_NODE&&(s=u.outerHTML,r=null!=(e=this.elements)[s]?e[s]:e[s]={type:i(u),tracked:o(u),elements:[]},r.elements.push(u))}var e,r,n,o,i;return t.fromHeadElement=function(t){var e;return new this(null!=(e=null!=t?t.childNodes:void 0)?e:[])},t.prototype.hasElementWithKey=function(t){return t in this.elements},t.prototype.getTrackedElementSignature=function(){var t,e;return function(){var r,n;r=this.elements,n=[];for(t in r)e=r[t].tracked,e&&n.push(t);return n}.call(this).join("")},t.prototype.getScriptElementsNotInDetails=function(t){return this.getElementsMatchingTypeNotInDetails("script",t)},t.prototype.getStylesheetElementsNotInDetails=function(t){return this.getElementsMatchingTypeNotInDetails("stylesheet",t)},t.prototype.getElementsMatchingTypeNotInDetails=function(t,e){var r,n,o,i,s,a;o=this.elements,s=[];for(n in o)i=o[n],a=i.type,r=i.elements,a!==t||e.hasElementWithKey(n)||s.push(r[0]);return s},t.prototype.getProvisionalElements=function(){var t,e,r,n,o,i,s;r=[],n=this.elements;for(e in n)o=n[e],s=o.type,i=o.tracked,t=o.elements,null!=s||i?t.length>1&&r.push.apply(r,t.slice(1)):r.push.apply(r,t);return r},t.prototype.getMetaValue=function(t){var e;return null!=(e=this.findMetaElementByName(t))?e.getAttribute("content"):void 0},t.prototype.findMetaElementByName=function(t){var r,n,o,i;r=void 0,i=this.elements;for(o in i)n=i[o].elements,e(n[0],t)&&(r=n[0]);return r},i=function(t){return r(t)?"script":n(t)?"stylesheet":void 0},o=function(t){return"reload"===t.getAttribute("data-turbolinks-track")},r=function(t){var e;return e=t.tagName.toLowerCase(),"script"===e},n=function(t){var e;return e=t.tagName.toLowerCase(),"style"===e||"link"===e&&"stylesheet"===t.getAttribute("rel")},e=function(t,e){var r;return r=t.tagName.toLowerCase(),"meta"===r&&t.getAttribute("name")===e},t}()}.call(this),function(){e.Snapshot=function(){function t(t,e){this.headDetails=t,this.bodyElement=e}return t.wrap=function(t){return t instanceof this?t:"string"==typeof t?this.fromHTMLString(t):this.fromHTMLElement(t)},t.fromHTMLString=function(t){var e;return e=document.createElement("html"),e.innerHTML=t,this.fromHTMLElement(e)},t.fromHTMLElement=function(t){var r,n,o,i;return o=t.querySelector("head"),r=null!=(i=t.querySelector("body"))?i:document.createElement("body"),n=e.HeadDetails.fromHeadElement(o),new this(n,r)},t.prototype.clone=function(){return new this.constructor(this.headDetails,this.bodyElement.cloneNode(!0))},t.prototype.getRootLocation=function(){var t,r;return r=null!=(t=this.getSetting("root"))?t:"/",new e.Location(r)},t.prototype.getCacheControlValue=function(){return this.getSetting("cache-control")},t.prototype.getElementForAnchor=function(t){try{return this.bodyElement.querySelector("[id='"+t+"'], a[name='"+t+"']")}catch(e){}},t.prototype.getPermanentElements=function(){return this.bodyElement.querySelectorAll("[id][data-turbolinks-permanent]")},t.prototype.getPermanentElementById=function(t){return this.bodyElement.querySelector("#"+t+"[data-turbolinks-permanent]")},t.prototype.getPermanentElementsPresentInSnapshot=function(t){var e,r,n,o,i;for(o=this.getPermanentElements(),i=[],r=0,n=o.length;n>r;r++)e=o[r],t.getPermanentElementById(e.id)&&i.push(e);return i},t.prototype.findFirstAutofocusableElement=function(){return this.bodyElement.querySelector("[autofocus]")},t.prototype.hasAnchor=function(t){return null!=this.getElementForAnchor(t)},t.prototype.isPreviewable=function(){return"no-preview"!==this.getCacheControlValue()},t.prototype.isCacheable=function(){return"no-cache"!==this.getCacheControlValue()},t.prototype.isVisitable=function(){return"reload"!==this.getSetting("visit-control")},t.prototype.getSetting=function(t){return this.headDetails.getMetaValue("turbolinks-"+t)},t}()}.call(this),function(){var t=[].slice;e.Renderer=function(){function e(){}var r;return e.render=function(){var e,r,n,o;return n=arguments[0],r=arguments[1],e=3<=arguments.length?t.call(arguments,2):[],o=function(t,e,r){r.prototype=t.prototype;var n=new r,o=t.apply(n,e);return Object(o)===o?o:n}(this,e,function(){}),o.delegate=n,o.render(r),o},e.prototype.renderView=function(t){return this.delegate.viewWillRender(this.newBody),t(),this.delegate.viewRendered(this.newBody)},e.prototype.invalidateView=function(){return this.delegate.viewInvalidated()},e.prototype.createScriptElement=function(t){var e;return"false"===t.getAttribute("data-turbolinks-eval")?t:(e=document.createElement("script"),e.textContent=t.textContent,e.async=!1,r(e,t),e)},r=function(t,e){var r,n,o,i,s,a,u;for(i=e.attributes,a=[],r=0,n=i.length;n>r;r++)s=i[r],o=s.name,u=s.value,a.push(t.setAttribute(o,u));return a},e}()}.call(this),function(){var t,r,n=function(t,e){function r(){this.constructor=t}for(var n in e)o.call(e,n)&&(t[n]=e[n]);return r.prototype=e.prototype,t.prototype=new r,t.__super__=e.prototype,t},o={}.hasOwnProperty;e.SnapshotRenderer=function(e){function o(t,e,r){this.currentSnapshot=t,this.newSnapshot=e,this.isPreview=r,this.currentHeadDetails=this.currentSnapshot.headDetails,this.newHeadDetails=this.newSnapshot.headDetails,this.currentBody=this.currentSnapshot.bodyElement,this.newBody=this.newSnapshot.bodyElement}return n(o,e),o.prototype.render=function(t){return this.shouldRender()?(this.mergeHead(),this.renderView(function(e){return function(){return e.replaceBody(),e.isPreview||e.focusFirstAutofocusableElement(),t()}}(this))):this.invalidateView()},o.prototype.mergeHead=function(){return this.copyNewHeadStylesheetElements(),this.copyNewHeadScriptElements(),this.removeCurrentHeadProvisionalElements(),this.copyNewHeadProvisionalElements()},o.prototype.replaceBody=function(){var t;return t=this.relocateCurrentBodyPermanentElements(),this.activateNewBodyScriptElements(),this.assignNewBody(),this.replacePlaceholderElementsWithClonedPermanentElements(t)},o.prototype.shouldRender=function(){return this.newSnapshot.isVisitable()&&this.trackedElementsAreIdentical()},o.prototype.trackedElementsAreIdentical=function(){return this.currentHeadDetails.getTrackedElementSignature()===this.newHeadDetails.getTrackedElementSignature()},o.prototype.copyNewHeadStylesheetElements=function(){var t,e,r,n,o;for(n=this.getNewHeadStylesheetElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(t));return o},o.prototype.copyNewHeadScriptElements=function(){var t,e,r,n,o;for(n=this.getNewHeadScriptElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(this.createScriptElement(t)));return o},o.prototype.removeCurrentHeadProvisionalElements=function(){var t,e,r,n,o;for(n=this.getCurrentHeadProvisionalElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.removeChild(t));return o},o.prototype.copyNewHeadProvisionalElements=function(){var t,e,r,n,o;for(n=this.getNewHeadProvisionalElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(t));return o},o.prototype.relocateCurrentBodyPermanentElements=function(){var e,n,o,i,s,a,u;for(a=this.getCurrentBodyPermanentElements(),u=[],e=0,n=a.length;n>e;e++)i=a[e],s=t(i),o=this.newSnapshot.getPermanentElementById(i.id),r(i,s.element),r(o,i),u.push(s);return u},o.prototype.replacePlaceholderElementsWithClonedPermanentElements=function(t){var e,n,o,i,s,a,u;for(u=[],o=0,i=t.length;i>o;o++)a=t[o],n=a.element,s=a.permanentElement,e=s.cloneNode(!0),u.push(r(n,e));return u},o.prototype.activateNewBodyScriptElements=function(){var t,e,n,o,i,s;for(i=this.getNewBodyScriptElements(),s=[],e=0,o=i.length;o>e;e++)n=i[e],t=this.createScriptElement(n),s.push(r(n,t));return s},o.prototype.assignNewBody=function(){return document.body=this.newBody},o.prototype.focusFirstAutofocusableElement=function(){var t;return null!=(t=this.newSnapshot.findFirstAutofocusableElement())?t.focus():void 0},o.prototype.getNewHeadStylesheetElements=function(){return this.newHeadDetails.getStylesheetElementsNotInDetails(this.currentHeadDetails)},o.prototype.getNewHeadScriptElements=function(){return this.newHeadDetails.getScriptElementsNotInDetails(this.currentHeadDetails)},o.prototype.getCurrentHeadProvisionalElements=function(){return this.currentHeadDetails.getProvisionalElements()},o.prototype.getNewHeadProvisionalElements=function(){return this.newHeadDetails.getProvisionalElements()},o.prototype.getCurrentBodyPermanentElements=function(){return this.currentSnapshot.getPermanentElementsPresentInSnapshot(this.newSnapshot)},o.prototype.getNewBodyScriptElements=function(){return this.newBody.querySelectorAll("script")},o}(e.Renderer),t=function(t){var e;return e=document.createElement("meta"),e.setAttribute("name","turbolinks-permanent-placeholder"),e.setAttribute("content",t.id),{element:e,permanentElement:t}},r=function(t,e){var r;return(r=t.parentNode)?r.replaceChild(e,t):void 0}}.call(this),function(){var t=function(t,e){function n(){this.constructor=t}for(var o in e)r.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},r={}.hasOwnProperty;e.ErrorRenderer=function(e){function r(t){var e;e=document.createElement("html"),e.innerHTML=t,this.newHead=e.querySelector("head"),this.newBody=e.querySelector("body")}return t(r,e),r.prototype.render=function(t){return this.renderView(function(e){return function(){return e.replaceHeadAndBody(),e.activateBodyScriptElements(),t()}}(this))},r.prototype.replaceHeadAndBody=function(){var t,e;return e=document.head,t=document.body,e.parentNode.replaceChild(this.newHead,e),t.parentNode.replaceChild(this.newBody,t)},r.prototype.activateBodyScriptElements=function(){var t,e,r,n,o,i;for(n=this.getScriptElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],t=this.createScriptElement(o),i.push(o.parentNode.replaceChild(t,o));return i},r.prototype.getScriptElements=function(){return document.documentElement.querySelectorAll("script")},r}(e.Renderer)}.call(this),function(){e.View=function(){function t(t){this.delegate=t,this.htmlElement=document.documentElement}return t.prototype.getRootLocation=function(){return this.getSnapshot().getRootLocation()},t.prototype.getElementForAnchor=function(t){return this.getSnapshot().getElementForAnchor(t)},t.prototype.getSnapshot=function(){return e.Snapshot.fromHTMLElement(this.htmlElement)},t.prototype.render=function(t,e){var r,n,o;return o=t.snapshot,r=t.error,n=t.isPreview,this.markAsPreview(n),null!=o?this.renderSnapshot(o,n,e):this.renderError(r,e)},t.prototype.markAsPreview=function(t){return t?this.htmlElement.setAttribute("data-turbolinks-preview",""):this.htmlElement.removeAttribute("data-turbolinks-preview")},t.prototype.renderSnapshot=function(t,r,n){return e.SnapshotRenderer.render(this.delegate,n,this.getSnapshot(),e.Snapshot.wrap(t),r)},t.prototype.renderError=function(t,r){return e.ErrorRenderer.render(this.delegate,r,t)},t}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.ScrollManager=function(){function r(r){this.delegate=r,this.onScroll=t(this.onScroll,this),this.onScroll=e.throttle(this.onScroll)}return r.prototype.start=function(){return this.started?void 0:(addEventListener("scroll",this.onScroll,!1),this.onScroll(),this.started=!0)},r.prototype.stop=function(){return this.started?(removeEventListener("scroll",this.onScroll,!1),this.started=!1):void 0},r.prototype.scrollToElement=function(t){return t.scrollIntoView()},r.prototype.scrollToPosition=function(t){var e,r;return e=t.x,r=t.y,window.scrollTo(e,r)},r.prototype.onScroll=function(t){return this.updatePosition({x:window.pageXOffset,y:window.pageYOffset})},r.prototype.updatePosition=function(t){var e;return this.position=t,null!=(e=this.delegate)?e.scrollPositionChanged(this.position):void 0},r}()}.call(this),function(){e.SnapshotCache=function(){function t(t){this.size=t,this.keys=[],this.snapshots={}}var r;return t.prototype.has=function(t){var e;return e=r(t),e in this.snapshots},t.prototype.get=function(t){var e;if(this.has(t))return e=this.read(t),this.touch(t),e},t.prototype.put=function(t,e){return this.write(t,e),this.touch(t),e},t.prototype.read=function(t){var e;return e=r(t),this.snapshots[e]},t.prototype.write=function(t,e){var n;return n=r(t),this.snapshots[n]=e},t.prototype.touch=function(t){var e,n;return n=r(t),e=this.keys.indexOf(n),e>-1&&this.keys.splice(e,1),this.keys.unshift(n),this.trim()},t.prototype.trim=function(){var t,e,r,n,o;for(n=this.keys.splice(this.size),o=[],t=0,r=n.length;r>t;t++)e=n[t],o.push(delete this.snapshots[e]);return o},r=function(t){return e.Location.wrap(t).toCacheKey()},t}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.Visit=function(){function r(r,n,o){this.controller=r,this.action=o,this.performScroll=t(this.performScroll,this),this.identifier=e.uuid(),this.location=e.Location.wrap(n),this.adapter=this.controller.adapter,this.state="initialized",this.timingMetrics={}}var n;return r.prototype.start=function(){return"initialized"===this.state?(this.recordTimingMetric("visitStart"),this.state="started",this.adapter.visitStarted(this)):void 0},r.prototype.cancel=function(){var t;return"started"===this.state?(null!=(t=this.request)&&t.cancel(),this.cancelRender(),this.state="canceled"):void 0},r.prototype.complete=function(){var t;return"started"===this.state?(this.recordTimingMetric("visitEnd"),this.state="completed","function"==typeof(t=this.adapter).visitCompleted&&t.visitCompleted(this),this.controller.visitCompleted(this)):void 0},r.prototype.fail=function(){var t;return"started"===this.state?(this.state="failed","function"==typeof(t=this.adapter).visitFailed?t.visitFailed(this):void 0):void 0},r.prototype.changeHistory=function(){var t,e;return this.historyChanged?void 0:(t=this.location.isEqualTo(this.referrer)?"replace":this.action,e=n(t),this.controller[e](this.location,this.restorationIdentifier),this.historyChanged=!0)},r.prototype.issueRequest=function(){return this.shouldIssueRequest()&&null==this.request?(this.progress=0,this.request=new e.HttpRequest(this,this.location,this.referrer),this.request.send()):void 0},r.prototype.getCachedSnapshot=function(){var t;return!(t=this.controller.getCachedSnapshotForLocation(this.location))||null!=this.location.anchor&&!t.hasAnchor(this.location.anchor)||"restore"!==this.action&&!t.isPreviewable()?void 0:t},r.prototype.hasCachedSnapshot=function(){return null!=this.getCachedSnapshot()},r.prototype.loadCachedSnapshot=function(){var t,e;return(e=this.getCachedSnapshot())?(t=this.shouldIssueRequest(),this.render(function(){var r;return this.cacheSnapshot(),this.controller.render({snapshot:e,isPreview:t},this.performScroll),"function"==typeof(r=this.adapter).visitRendered&&r.visitRendered(this),t?void 0:this.complete()})):void 0},r.prototype.loadResponse=function(){return null!=this.response?this.render(function(){var t,e;return this.cacheSnapshot(),this.request.failed?(this.controller.render({error:this.response},this.performScroll),"function"==typeof(t=this.adapter).visitRendered&&t.visitRendered(this),this.fail()):(this.controller.render({snapshot:this.response},this.performScroll),"function"==typeof(e=this.adapter).visitRendered&&e.visitRendered(this),this.complete())}):void 0},r.prototype.followRedirect=function(){return this.redirectedToLocation&&!this.followedRedirect?(this.location=this.redirectedToLocation,this.controller.replaceHistoryWithLocationAndRestorationIdentifier(this.redirectedToLocation,this.restorationIdentifier),this.followedRedirect=!0):void 0},r.prototype.requestStarted=function(){var t;return this.recordTimingMetric("requestStart"),"function"==typeof(t=this.adapter).visitRequestStarted?t.visitRequestStarted(this):void 0},r.prototype.requestProgressed=function(t){var e;return this.progress=t,"function"==typeof(e=this.adapter).visitRequestProgressed?e.visitRequestProgressed(this):void 0},r.prototype.requestCompletedWithResponse=function(t,r){return this.response=t,null!=r&&(this.redirectedToLocation=e.Location.wrap(r)),this.adapter.visitRequestCompleted(this)},r.prototype.requestFailedWithStatusCode=function(t,e){return this.response=e,this.adapter.visitRequestFailedWithStatusCode(this,t)},r.prototype.requestFinished=function(){var t;return this.recordTimingMetric("requestEnd"),"function"==typeof(t=this.adapter).visitRequestFinished?t.visitRequestFinished(this):void 0},r.prototype.performScroll=function(){return this.scrolled?void 0:("restore"===this.action?this.scrollToRestoredPosition()||this.scrollToTop():this.scrollToAnchor()||this.scrollToTop(),this.scrolled=!0)},r.prototype.scrollToRestoredPosition=function(){var t,e;return t=null!=(e=this.restorationData)?e.scrollPosition:void 0,null!=t?(this.controller.scrollToPosition(t),!0):void 0},r.prototype.scrollToAnchor=function(){return null!=this.location.anchor?(this.controller.scrollToAnchor(this.location.anchor),!0):void 0},r.prototype.scrollToTop=function(){return this.controller.scrollToPosition({x:0,y:0})},r.prototype.recordTimingMetric=function(t){var e;return null!=(e=this.timingMetrics)[t]?e[t]:e[t]=(new Date).getTime()},r.prototype.getTimingMetrics=function(){return e.copyObject(this.timingMetrics)},n=function(t){switch(t){case"replace":return"replaceHistoryWithLocationAndRestorationIdentifier";case"advance":case"restore":return"pushHistoryWithLocationAndRestorationIdentifier"}},r.prototype.shouldIssueRequest=function(){return"restore"===this.action?!this.hasCachedSnapshot():!0},r.prototype.cacheSnapshot=function(){return this.snapshotCached?void 0:(this.controller.cacheSnapshot(),this.snapshotCached=!0)},r.prototype.render=function(t){return this.cancelRender(),this.frame=requestAnimationFrame(function(e){return function(){return e.frame=null,t.call(e)}}(this))},r.prototype.cancelRender=function(){return this.frame?cancelAnimationFrame(this.frame):void 0},r}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.Controller=function(){function r(){this.clickBubbled=t(this.clickBubbled,this),this.clickCaptured=t(this.clickCaptured,this),this.pageLoaded=t(this.pageLoaded,this),this.history=new e.History(this),this.view=new e.View(this),this.scrollManager=new e.ScrollManager(this),this.restorationData={},this.clearCache(),this.setProgressBarDelay(500)}return r.prototype.start=function(){return e.supported&&!this.started?(addEventListener("click",this.clickCaptured,!0),addEventListener("DOMContentLoaded",this.pageLoaded,!1),this.scrollManager.start(),this.startHistory(),this.started=!0,this.enabled=!0):void 0},r.prototype.disable=function(){return this.enabled=!1},r.prototype.stop=function(){return this.started?(removeEventListener("click",this.clickCaptured,!0),removeEventListener("DOMContentLoaded",this.pageLoaded,!1),this.scrollManager.stop(),this.stopHistory(),this.started=!1):void 0},r.prototype.clearCache=function(){return this.cache=new e.SnapshotCache(10)},r.prototype.visit=function(t,r){var n,o;return null==r&&(r={}),t=e.Location.wrap(t),this.applicationAllowsVisitingLocation(t)?this.locationIsVisitable(t)?(n=null!=(o=r.action)?o:"advance",this.adapter.visitProposedToLocationWithAction(t,n)):window.location=t:void 0},r.prototype.startVisitToLocationWithAction=function(t,r,n){var o;return e.supported?(o=this.getRestorationDataForIdentifier(n),this.startVisit(t,r,{restorationData:o})):window.location=t},r.prototype.setProgressBarDelay=function(t){return this.progressBarDelay=t},r.prototype.startHistory=function(){return this.location=e.Location.wrap(window.location),this.restorationIdentifier=e.uuid(),this.history.start(),this.history.replace(this.location,this.restorationIdentifier)},r.prototype.stopHistory=function(){return this.history.stop()},r.prototype.pushHistoryWithLocationAndRestorationIdentifier=function(t,r){return this.restorationIdentifier=r,this.location=e.Location.wrap(t),this.history.push(this.location,this.restorationIdentifier)},r.prototype.replaceHistoryWithLocationAndRestorationIdentifier=function(t,r){return this.restorationIdentifier=r,this.location=e.Location.wrap(t),this.history.replace(this.location,this.restorationIdentifier)},r.prototype.historyPoppedToLocationWithRestorationIdentifier=function(t,r){var n;return this.restorationIdentifier=r,this.enabled?(n=this.getRestorationDataForIdentifier(this.restorationIdentifier),this.startVisit(t,"restore",{restorationIdentifier:this.restorationIdentifier,restorationData:n,historyChanged:!0}),this.location=e.Location.wrap(t)):this.adapter.pageInvalidated()},r.prototype.getCachedSnapshotForLocation=function(t){var e;return null!=(e=this.cache.get(t))?e.clone():void 0},r.prototype.shouldCacheSnapshot=function(){return this.view.getSnapshot().isCacheable();
},r.prototype.cacheSnapshot=function(){var t,r;return this.shouldCacheSnapshot()?(this.notifyApplicationBeforeCachingSnapshot(),r=this.view.getSnapshot(),t=this.lastRenderedLocation,e.defer(function(e){return function(){return e.cache.put(t,r.clone())}}(this))):void 0},r.prototype.scrollToAnchor=function(t){var e;return(e=this.view.getElementForAnchor(t))?this.scrollToElement(e):this.scrollToPosition({x:0,y:0})},r.prototype.scrollToElement=function(t){return this.scrollManager.scrollToElement(t)},r.prototype.scrollToPosition=function(t){return this.scrollManager.scrollToPosition(t)},r.prototype.scrollPositionChanged=function(t){var e;return e=this.getCurrentRestorationData(),e.scrollPosition=t},r.prototype.render=function(t,e){return this.view.render(t,e)},r.prototype.viewInvalidated=function(){return this.adapter.pageInvalidated()},r.prototype.viewWillRender=function(t){return this.notifyApplicationBeforeRender(t)},r.prototype.viewRendered=function(){return this.lastRenderedLocation=this.currentVisit.location,this.notifyApplicationAfterRender()},r.prototype.pageLoaded=function(){return this.lastRenderedLocation=this.location,this.notifyApplicationAfterPageLoad()},r.prototype.clickCaptured=function(){return removeEventListener("click",this.clickBubbled,!1),addEventListener("click",this.clickBubbled,!1)},r.prototype.clickBubbled=function(t){var e,r,n;return this.enabled&&this.clickEventIsSignificant(t)&&(r=this.getVisitableLinkForNode(t.target))&&(n=this.getVisitableLocationForLink(r))&&this.applicationAllowsFollowingLinkToLocation(r,n)?(t.preventDefault(),e=this.getActionForLink(r),this.visit(n,{action:e})):void 0},r.prototype.applicationAllowsFollowingLinkToLocation=function(t,e){var r;return r=this.notifyApplicationAfterClickingLinkToLocation(t,e),!r.defaultPrevented},r.prototype.applicationAllowsVisitingLocation=function(t){var e;return e=this.notifyApplicationBeforeVisitingLocation(t),!e.defaultPrevented},r.prototype.notifyApplicationAfterClickingLinkToLocation=function(t,r){return e.dispatch("turbolinks:click",{target:t,data:{url:r.absoluteURL},cancelable:!0})},r.prototype.notifyApplicationBeforeVisitingLocation=function(t){return e.dispatch("turbolinks:before-visit",{data:{url:t.absoluteURL},cancelable:!0})},r.prototype.notifyApplicationAfterVisitingLocation=function(t){return e.dispatch("turbolinks:visit",{data:{url:t.absoluteURL}})},r.prototype.notifyApplicationBeforeCachingSnapshot=function(){return e.dispatch("turbolinks:before-cache")},r.prototype.notifyApplicationBeforeRender=function(t){return e.dispatch("turbolinks:before-render",{data:{newBody:t}})},r.prototype.notifyApplicationAfterRender=function(){return e.dispatch("turbolinks:render")},r.prototype.notifyApplicationAfterPageLoad=function(t){return null==t&&(t={}),e.dispatch("turbolinks:load",{data:{url:this.location.absoluteURL,timing:t}})},r.prototype.startVisit=function(t,e,r){var n;return null!=(n=this.currentVisit)&&n.cancel(),this.currentVisit=this.createVisit(t,e,r),this.currentVisit.start(),this.notifyApplicationAfterVisitingLocation(t)},r.prototype.createVisit=function(t,r,n){var o,i,s,a,u;return i=null!=n?n:{},a=i.restorationIdentifier,s=i.restorationData,o=i.historyChanged,u=new e.Visit(this,t,r),u.restorationIdentifier=null!=a?a:e.uuid(),u.restorationData=e.copyObject(s),u.historyChanged=o,u.referrer=this.location,u},r.prototype.visitCompleted=function(t){return this.notifyApplicationAfterPageLoad(t.getTimingMetrics())},r.prototype.clickEventIsSignificant=function(t){return!(t.defaultPrevented||t.target.isContentEditable||t.which>1||t.altKey||t.ctrlKey||t.metaKey||t.shiftKey)},r.prototype.getVisitableLinkForNode=function(t){return this.nodeIsVisitable(t)?e.closest(t,"a[href]:not([target]):not([download])"):void 0},r.prototype.getVisitableLocationForLink=function(t){var r;return r=new e.Location(t.getAttribute("href")),this.locationIsVisitable(r)?r:void 0},r.prototype.getActionForLink=function(t){var e;return null!=(e=t.getAttribute("data-turbolinks-action"))?e:"advance"},r.prototype.nodeIsVisitable=function(t){var r;return(r=e.closest(t,"[data-turbolinks]"))?"false"!==r.getAttribute("data-turbolinks"):!0},r.prototype.locationIsVisitable=function(t){return t.isPrefixedBy(this.view.getRootLocation())&&t.isHTML()},r.prototype.getCurrentRestorationData=function(){return this.getRestorationDataForIdentifier(this.restorationIdentifier)},r.prototype.getRestorationDataForIdentifier=function(t){var e;return null!=(e=this.restorationData)[t]?e[t]:e[t]={}},r}()}.call(this),function(){!function(){var t,e;if((t=e=document.currentScript)&&!e.hasAttribute("data-turbolinks-suppress-warning"))for(;t=t.parentNode;)if(t===document.body)return console.warn("You are loading Turbolinks from a <script> element inside the <body> element. This is probably not what you meant to do!\n\nLoad your application\u2019s JavaScript bundle inside the <head> element instead. <script> elements in <body> are evaluated with each page change.\n\nFor more information, see: https://github.com/turbolinks/turbolinks#working-with-script-elements\n\n\u2014\u2014\nSuppress this warning by adding a `data-turbolinks-suppress-warning` attribute to: %s",e.outerHTML)}()}.call(this),function(){var t,r,n;e.start=function(){return r()?(null==e.controller&&(e.controller=t()),e.controller.start()):void 0},r=function(){return null==window.Turbolinks&&(window.Turbolinks=e),n()},t=function(){var t;return t=new e.Controller,t.adapter=new e.BrowserAdapter(t),t},n=function(){return window.Turbolinks===e},n()&&e.start()}.call(this)}).call(this),"object"==typeof module&&module.exports?module.exports=e:"function"==typeof define&&define.amd&&define(e)}).call(this);
/*
File generated by js-routes 1.4.9
Based on Rails 5.2.4.3 routes of WildCodeSchool::Application
 */

(function() {
  var DeprecatedGlobbingBehavior, NodeTypes, ParameterMissing, ReservedOptions, SpecialOptionsKey, UriEncoderSegmentRegex, Utils, result, root,
    hasProp = {}.hasOwnProperty,
    slice = [].slice;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  ParameterMissing = function(message, fileName, lineNumber) {
    var instance;
    instance = new Error(message, fileName, lineNumber);
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    } else {
      instance.__proto__ = this.__proto__;
    }
    if (Error.captureStackTrace) {
      Error.captureStackTrace(instance, ParameterMissing);
    }
    return instance;
  };

  ParameterMissing.prototype = Object.create(Error.prototype, {
    constructor: {
      value: Error,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });

  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(ParameterMissing, Error);
  } else {
    ParameterMissing.__proto__ = Error;
  }

  NodeTypes = {"GROUP":1,"CAT":2,"SYMBOL":3,"OR":4,"STAR":5,"LITERAL":6,"SLASH":7,"DOT":8};

  DeprecatedGlobbingBehavior = false;

  SpecialOptionsKey = "_options";

  UriEncoderSegmentRegex = /[^a-zA-Z0-9\-\._~!\$&'\(\)\*\+,;=:@]/g;

  ReservedOptions = ['anchor', 'trailing_slash', 'subdomain', 'host', 'port', 'protocol'];

  Utils = {
    configuration: {
      prefix: "",
      default_url_options: {},
      special_options_key: "_options",
      serializer: null
    },
    default_serializer: function(object, prefix) {
      var element, i, j, key, len, prop, s;
      if (prefix == null) {
        prefix = null;
      }
      if (object == null) {
        return "";
      }
      if (!prefix && !(this.get_object_type(object) === "object")) {
        throw new Error("Url parameters should be a javascript hash");
      }
      s = [];
      switch (this.get_object_type(object)) {
        case "array":
          for (i = j = 0, len = object.length; j < len; i = ++j) {
            element = object[i];
            s.push(this.default_serializer(element, prefix + "[]"));
          }
          break;
        case "object":
          for (key in object) {
            if (!hasProp.call(object, key)) continue;
            prop = object[key];
            if ((prop == null) && (prefix != null)) {
              prop = "";
            }
            if (prop != null) {
              if (prefix != null) {
                key = prefix + "[" + key + "]";
              }
              s.push(this.default_serializer(prop, key));
            }
          }
          break;
        default:
          if (object != null) {
            s.push((encodeURIComponent(prefix.toString())) + "=" + (encodeURIComponent(object.toString())));
          }
      }
      if (!s.length) {
        return "";
      }
      return s.join("&");
    },
    serialize: function(object) {
      var custom_serializer;
      custom_serializer = this.configuration.serializer;
      if ((custom_serializer != null) && this.get_object_type(custom_serializer) === "function") {
        return custom_serializer(object);
      } else {
        return this.default_serializer(object);
      }
    },
    clean_path: function(path) {
      var last_index;
      path = path.split("://");
      last_index = path.length - 1;
      path[last_index] = path[last_index].replace(/\/+/g, "/");
      return path.join("://");
    },
    extract_options: function(number_of_params, args) {
      var last_el, options;
      last_el = args[args.length - 1];
      if ((args.length > number_of_params && last_el === void 0) || ((last_el != null) && "object" === this.get_object_type(last_el) && !this.looks_like_serialized_model(last_el))) {
        options = args.pop() || {};
        delete options[this.configuration.special_options_key];
        return options;
      } else {
        return {};
      }
    },
    looks_like_serialized_model: function(object) {
      return !object[this.configuration.special_options_key] && ("id" in object || "to_param" in object);
    },
    path_identifier: function(object) {
      var property;
      if (object === 0) {
        return "0";
      }
      if (!object) {
        return "";
      }
      property = object;
      if (this.get_object_type(object) === "object") {
        if ("to_param" in object) {
          if (object.to_param == null) {
            throw new ParameterMissing("Route parameter missing: to_param");
          }
          property = object.to_param;
        } else if ("id" in object) {
          if (object.id == null) {
            throw new ParameterMissing("Route parameter missing: id");
          }
          property = object.id;
        } else {
          property = object;
        }
        if (this.get_object_type(property) === "function") {
          property = property.call(object);
        }
      }
      return property.toString();
    },
    clone: function(obj) {
      var attr, copy, key;
      if ((obj == null) || "object" !== this.get_object_type(obj)) {
        return obj;
      }
      copy = obj.constructor();
      for (key in obj) {
        if (!hasProp.call(obj, key)) continue;
        attr = obj[key];
        copy[key] = attr;
      }
      return copy;
    },
    merge: function() {
      var tap, xs;
      xs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      tap = function(o, fn) {
        fn(o);
        return o;
      };
      if ((xs != null ? xs.length : void 0) > 0) {
        return tap({}, function(m) {
          var j, k, len, results, v, x;
          results = [];
          for (j = 0, len = xs.length; j < len; j++) {
            x = xs[j];
            results.push((function() {
              var results1;
              results1 = [];
              for (k in x) {
                v = x[k];
                results1.push(m[k] = v);
              }
              return results1;
            })());
          }
          return results;
        });
      }
    },
    normalize_options: function(parts, required_parts, default_options, actual_parameters) {
      var i, j, key, len, options, part, parts_options, result, route_parts, url_parameters, use_all_parts, value;
      options = this.extract_options(parts.length, actual_parameters);
      if (actual_parameters.length > parts.length) {
        throw new Error("Too many parameters provided for path");
      }
      use_all_parts = actual_parameters.length > required_parts.length;
      parts_options = {};
      for (key in options) {
        if (!hasProp.call(options, key)) continue;
        use_all_parts = true;
        if (this.indexOf(parts, key) >= 0) {
          parts_options[key] = value;
        }
      }
      options = this.merge(this.configuration.default_url_options, default_options, options);
      result = {};
      url_parameters = {};
      result['url_parameters'] = url_parameters;
      for (key in options) {
        if (!hasProp.call(options, key)) continue;
        value = options[key];
        if (this.indexOf(ReservedOptions, key) >= 0) {
          result[key] = value;
        } else {
          url_parameters[key] = value;
        }
      }
      route_parts = use_all_parts ? parts : required_parts;
      i = 0;
      for (j = 0, len = route_parts.length; j < len; j++) {
        part = route_parts[j];
        if (i < actual_parameters.length) {
          if (!parts_options.hasOwnProperty(part)) {
            url_parameters[part] = actual_parameters[i];
            ++i;
          }
        }
      }
      return result;
    },
    build_route: function(parts, required_parts, default_options, route, full_url, args) {
      var options, parameters, result, url, url_params;
      args = Array.prototype.slice.call(args);
      options = this.normalize_options(parts, required_parts, default_options, args);
      parameters = options['url_parameters'];
      result = "" + (this.get_prefix()) + (this.visit(route, parameters));
      url = Utils.clean_path(result);
      if (options['trailing_slash'] === true) {
        url = url.replace(/(.*?)[\/]?$/, "$1/");
      }
      if ((url_params = this.serialize(parameters)).length) {
        url += "?" + url_params;
      }
      url += options.anchor ? "#" + options.anchor : "";
      if (full_url) {
        url = this.route_url(options) + url;
      }
      return url;
    },
    visit: function(route, parameters, optional) {
      var left, left_part, right, right_part, type, value;
      if (optional == null) {
        optional = false;
      }
      type = route[0], left = route[1], right = route[2];
      switch (type) {
        case NodeTypes.GROUP:
          return this.visit(left, parameters, true);
        case NodeTypes.STAR:
          return this.visit_globbing(left, parameters, true);
        case NodeTypes.LITERAL:
        case NodeTypes.SLASH:
        case NodeTypes.DOT:
          return left;
        case NodeTypes.CAT:
          left_part = this.visit(left, parameters, optional);
          right_part = this.visit(right, parameters, optional);
          if (optional && ((this.is_optional_node(left[0]) && !left_part) || ((this.is_optional_node(right[0])) && !right_part))) {
            return "";
          }
          return "" + left_part + right_part;
        case NodeTypes.SYMBOL:
          value = parameters[left];
          delete parameters[left];
          if (value != null) {
            return this.encode_segment(this.path_identifier(value));
          }
          if (optional) {
            return "";
          } else {
            throw new ParameterMissing("Route parameter missing: " + left);
          }
          break;
        default:
          throw new Error("Unknown Rails node type");
      }
    },
    encode_segment: function(segment) {
      return segment.replace(UriEncoderSegmentRegex, function(str) {
        return encodeURIComponent(str);
      });
    },
    is_optional_node: function(node) {
      return this.indexOf([NodeTypes.STAR, NodeTypes.SYMBOL, NodeTypes.CAT], node) >= 0;
    },
    build_path_spec: function(route, wildcard) {
      var left, right, type;
      if (wildcard == null) {
        wildcard = false;
      }
      type = route[0], left = route[1], right = route[2];
      switch (type) {
        case NodeTypes.GROUP:
          return "(" + (this.build_path_spec(left)) + ")";
        case NodeTypes.CAT:
          return "" + (this.build_path_spec(left)) + (this.build_path_spec(right));
        case NodeTypes.STAR:
          return this.build_path_spec(left, true);
        case NodeTypes.SYMBOL:
          if (wildcard === true) {
            return "" + (left[0] === '*' ? '' : '*') + left;
          } else {
            return ":" + left;
          }
          break;
        case NodeTypes.SLASH:
        case NodeTypes.DOT:
        case NodeTypes.LITERAL:
          return left;
        default:
          throw new Error("Unknown Rails node type");
      }
    },
    visit_globbing: function(route, parameters, optional) {
      var left, right, type, value;
      type = route[0], left = route[1], right = route[2];
      value = parameters[left];
      delete parameters[left];
      if (value == null) {
        return this.visit(route, parameters, optional);
      }
      value = (function() {
        switch (this.get_object_type(value)) {
          case "array":
            return value.join("/");
          default:
            return value;
        }
      }).call(this);
      if (DeprecatedGlobbingBehavior) {
        return this.path_identifier(value);
      } else {
        return encodeURI(this.path_identifier(value));
      }
    },
    get_prefix: function() {
      var prefix;
      prefix = this.configuration.prefix;
      if (prefix !== "") {
        prefix = (prefix.match("/$") ? prefix : prefix + "/");
      }
      return prefix;
    },
    route: function(parts_table, default_options, route_spec, full_url) {
      var j, len, part, parts, path_fn, ref, required, required_parts;
      required_parts = [];
      parts = [];
      for (j = 0, len = parts_table.length; j < len; j++) {
        ref = parts_table[j], part = ref[0], required = ref[1];
        parts.push(part);
        if (required) {
          required_parts.push(part);
        }
      }
      path_fn = function() {
        return Utils.build_route(parts, required_parts, default_options, route_spec, full_url, arguments);
      };
      path_fn.required_params = required_parts;
      path_fn.toString = function() {
        return Utils.build_path_spec(route_spec);
      };
      return path_fn;
    },
    route_url: function(route_defaults) {
      var hostname, port, protocol, subdomain;
      if (typeof route_defaults === 'string') {
        return route_defaults;
      }
      hostname = route_defaults.host || Utils.current_host();
      if (!hostname) {
        return '';
      }
      subdomain = route_defaults.subdomain ? route_defaults.subdomain + '.' : '';
      protocol = route_defaults.protocol || Utils.current_protocol();
      port = route_defaults.port || (!route_defaults.host ? Utils.current_port() : void 0);
      port = port ? ":" + port : '';
      return protocol + "://" + subdomain + hostname + port;
    },
    has_location: function() {
      return (typeof window !== "undefined" && window !== null ? window.location : void 0) != null;
    },
    current_host: function() {
      if (this.has_location()) {
        return window.location.hostname;
      } else {
        return null;
      }
    },
    current_protocol: function() {
      if (this.has_location() && window.location.protocol !== '') {
        return window.location.protocol.replace(/:$/, '');
      } else {
        return 'http';
      }
    },
    current_port: function() {
      if (this.has_location() && window.location.port !== '') {
        return window.location.port;
      } else {
        return '';
      }
    },
    _classToTypeCache: null,
    _classToType: function() {
      var j, len, name, ref;
      if (this._classToTypeCache != null) {
        return this._classToTypeCache;
      }
      this._classToTypeCache = {};
      ref = "Boolean Number String Function Array Date RegExp Object Error".split(" ");
      for (j = 0, len = ref.length; j < len; j++) {
        name = ref[j];
        this._classToTypeCache["[object " + name + "]"] = name.toLowerCase();
      }
      return this._classToTypeCache;
    },
    get_object_type: function(obj) {
      if (root.jQuery && (root.jQuery.type != null)) {
        return root.jQuery.type(obj);
      }
      if (obj == null) {
        return "" + obj;
      }
      if (typeof obj === "object" || typeof obj === "function") {
        return this._classToType()[Object.prototype.toString.call(obj)] || "object";
      } else {
        return typeof obj;
      }
    },
    indexOf: function(array, element) {
      if (Array.prototype.indexOf) {
        return array.indexOf(element);
      } else {
        return this.indexOfImplementation(array, element);
      }
    },
    indexOfImplementation: function(array, element) {
      var el, i, j, len, result;
      result = -1;
      for (i = j = 0, len = array.length; j < len; i = ++j) {
        el = array[i];
        if (el === element) {
          result = i;
        }
      }
      return result;
    },
    namespace: function(root, namespace, routes) {
      var index, j, len, part, parts;
      parts = namespace ? namespace.split(".") : [];
      if (parts.length === 0) {
        return routes;
      }
      for (index = j = 0, len = parts.length; j < len; index = ++j) {
        part = parts[index];
        if (index < parts.length - 1) {
          root = (root[part] || (root[part] = {}));
        } else {
          return root[part] = routes;
        }
      }
    },
    configure: function(new_config) {
      return this.configuration = this.merge(this.configuration, new_config);
    },
    config: function() {
      return this.clone(this.configuration);
    },
    make: function() {
      var routes;
      routes = {
// about_en_gb => /en-GB/decouvrir-ecole(.:format)
  // function(options)
  about_en_gb_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"en-GB",false],[2,[7,"/",false],[2,[6,"decouvrir-ecole",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// about_es_es => /es-ES/sobre-nosotros(.:format)
  // function(options)
  about_es_es_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"es-ES",false],[2,[7,"/",false],[2,[6,"sobre-nosotros",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// about_fr_be => /fr-BE/decouvrir-ecole(.:format)
  // function(options)
  about_fr_be_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-BE",false],[2,[7,"/",false],[2,[6,"decouvrir-ecole",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// about_fr_fr => /fr-FR/decouvrir-ecole(.:format)
  // function(options)
  about_fr_fr_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-FR",false],[2,[7,"/",false],[2,[6,"decouvrir-ecole",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// about_pt_pt => /pt-PT/about(.:format)
  // function(options)
  about_pt_pt_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"pt-PT",false],[2,[7,"/",false],[2,[6,"about",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// api => /api(.:format)
  // function(options)
  api_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
// api_authenticate => /api/users/authenticate(.:format)
  // function(options)
  api_authenticate_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"users",false],[2,[7,"/",false],[2,[6,"authenticate",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// api_blog => /api/blogs/:id(.:format)
  // function(id, options)
  api_blog_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"blogs",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// api_blog_categories => /api/blog_categories(.:format)
  // function(options)
  api_blog_categories_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"blog_categories",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// api_blog_category => /api/blog_categories/:id(.:format)
  // function(id, options)
  api_blog_category_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"blog_categories",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// api_blog_preview => /api/blogs/:blog_id/preview(.:format)
  // function(blog_id, options)
  api_blog_preview_path: Utils.route([["blog_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"blogs",false],[2,[7,"/",false],[2,[3,"blog_id",false],[2,[7,"/",false],[2,[6,"preview",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
// api_blogs => /api/blogs(.:format)
  // function(options)
  api_blogs_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"blogs",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// api_business => /api/businesses/:id(.:format)
  // function(id, options)
  api_business_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"businesses",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// api_businesses => /api/businesses(.:format)
  // function(options)
  api_businesses_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"businesses",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// api_campu => /api/campus/:id(.:format)
  // function(id, options)
  api_campu_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"campus",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// api_campu_events => /api/campus/:campu_id/events(.:format)
  // function(campu_id, options)
  api_campu_events_path: Utils.route([["campu_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"campus",false],[2,[7,"/",false],[2,[3,"campu_id",false],[2,[7,"/",false],[2,[6,"events",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
// api_campu_trainings => /api/campus/:campu_id/trainings(.:format)
  // function(campu_id, options)
  api_campu_trainings_path: Utils.route([["campu_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"campus",false],[2,[7,"/",false],[2,[3,"campu_id",false],[2,[7,"/",false],[2,[6,"trainings",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
// api_campus => /api/campus(.:format)
  // function(options)
  api_campus_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"campus",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// api_campus_image => /api/campus_images/:id(.:format)
  // function(id, options)
  api_campus_image_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"campus_images",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// api_campus_images => /api/campus_images(.:format)
  // function(options)
  api_campus_images_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"campus_images",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// api_cloudinary_generate_signature => /api/cloudinary/generate_signature(.:format)
  // function(options)
  api_cloudinary_generate_signature_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"cloudinary",false],[2,[7,"/",false],[2,[6,"generate_signature",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// api_countries => /api/countries(.:format)
  // function(options)
  api_countries_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"countries",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// api_country => /api/countries/:id(.:format)
  // function(id, options)
  api_country_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"countries",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// api_customer_project => /api/customer_projects/:id(.:format)
  // function(id, options)
  api_customer_project_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"customer_projects",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// api_customer_projects => /api/customer_projects(.:format)
  // function(options)
  api_customer_projects_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"customer_projects",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// api_default_school => /api/default_schools/:id(.:format)
  // function(id, options)
  api_default_school_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"default_schools",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// api_default_schools => /api/default_schools(.:format)
  // function(options)
  api_default_schools_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"default_schools",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// api_events => /api/events(.:format)
  // function(options)
  api_events_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"events",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// api_faq => /api/faqs/:id(.:format)
  // function(id, options)
  api_faq_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"faqs",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// api_faq_categories => /api/faq_categories(.:format)
  // function(options)
  api_faq_categories_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"faq_categories",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// api_faq_category => /api/faq_categories/:id(.:format)
  // function(id, options)
  api_faq_category_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"faq_categories",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// api_faqs => /api/faqs(.:format)
  // function(options)
  api_faqs_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"faqs",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// api_funding_organisation => /api/funding_organisations/:id(.:format)
  // function(id, options)
  api_funding_organisation_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"funding_organisations",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// api_funding_organisations => /api/funding_organisations(.:format)
  // function(options)
  api_funding_organisations_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"funding_organisations",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// api_image => /api/images/:id(.:format)
  // function(id, options)
  api_image_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"images",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// api_images => /api/images(.:format)
  // function(options)
  api_images_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"images",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// api_job => /api/jobs/:id(.:format)
  // function(id, options)
  api_job_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"jobs",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// api_jobs => /api/jobs(.:format)
  // function(options)
  api_jobs_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"jobs",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// api_lang_codes => /api/lang_codes(.:format)
  // function(options)
  api_lang_codes_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"lang_codes",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// api_locale => /api/locales/:id(.:format)
  // function(id, options)
  api_locale_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"locales",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// api_locales => /api/settings/locales(.:format)
  // function(options)
  api_locales_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"settings",false],[2,[7,"/",false],[2,[6,"locales",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// api_page => /api/pages/:slug(.:format)
  // function(slug, options)
  api_page_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"pages",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// api_pages => /api/pages(.:format)
  // function(options)
  api_pages_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"pages",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// api_password => /api/users/password(.:format)
  // function(options)
  api_password_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"users",false],[2,[7,"/",false],[2,[6,"password",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// api_password_reset => /api/users/password_reset(.:format)
  // function(options)
  api_password_reset_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"users",false],[2,[7,"/",false],[2,[6,"password_reset",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// api_previews => /api/previews(.:format)
  // function(options)
  api_previews_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"previews",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// api_promotion => /api/promotions/:id(.:format)
  // function(id, options)
  api_promotion_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"promotions",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// api_promotions => /api/promotions(.:format)
  // function(options)
  api_promotions_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"promotions",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// api_public_blogs => /api/public/blogs(.:format)
  // function(options)
  api_public_blogs_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"public",false],[2,[7,"/",false],[2,[6,"blogs",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// api_public_projects => /api/public/projects(.:format)
  // function(options)
  api_public_projects_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"public",false],[2,[7,"/",false],[2,[6,"projects",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// api_region_codes => /api/region_codes(.:format)
  // function(options)
  api_region_codes_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"region_codes",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// api_show_locales => /api/settings/show_locales(.:format)
  // function(options)
  api_show_locales_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"settings",false],[2,[7,"/",false],[2,[6,"show_locales",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// api_subscribe_newsletters => /api/settings/subscribe_newsletters(.:format)
  // function(options)
  api_subscribe_newsletters_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"settings",false],[2,[7,"/",false],[2,[6,"subscribe_newsletters",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// api_subscribes => /api/notifications/subscribes(.:format)
  // function(options)
  api_subscribes_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"notifications",false],[2,[7,"/",false],[2,[6,"subscribes",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// api_sync => /api/events/sync(.:format)
  // function(options)
  api_sync_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"events",false],[2,[7,"/",false],[2,[6,"sync",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// api_team => /api/teams/:id(.:format)
  // function(id, options)
  api_team_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"teams",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// api_teams => /api/teams(.:format)
  // function(options)
  api_teams_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"teams",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// api_training => /api/trainings/:id(.:format)
  // function(id, options)
  api_training_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"trainings",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// api_training_campuses => /api/trainings/:training_id/campuses(.:format)
  // function(training_id, options)
  api_training_campuses_path: Utils.route([["training_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"trainings",false],[2,[7,"/",false],[2,[3,"training_id",false],[2,[7,"/",false],[2,[6,"campuses",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
// api_training_trainings_programs => /api/trainings/:training_id/program(.:format)
  // function(training_id, options)
  api_training_trainings_programs_path: Utils.route([["training_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"trainings",false],[2,[7,"/",false],[2,[3,"training_id",false],[2,[7,"/",false],[2,[6,"program",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
// api_trainings => /api/trainings(.:format)
  // function(options)
  api_trainings_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"trainings",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// api_trainings_categories => /api/trainings_categories(.:format)
  // function(options)
  api_trainings_categories_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"trainings_categories",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// api_trainings_category => /api/trainings_categories/:id(.:format)
  // function(id, options)
  api_trainings_category_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"trainings_categories",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// api_trainings_program => /api/trainings_programs/:id(.:format)
  // function(id, options)
  api_trainings_program_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"trainings_programs",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// api_trainings_programs => /api/trainings_programs(.:format)
  // function(options)
  api_trainings_programs_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"trainings_programs",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// api_trainings_typical_week => /api/trainings_typical_weeks/:id(.:format)
  // function(id, options)
  api_trainings_typical_week_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"trainings_typical_weeks",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// api_trainings_typical_weeks => /api/trainings_typical_weeks(.:format)
  // function(options)
  api_trainings_typical_weeks_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"trainings_typical_weeks",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// api_types => /api/notifications/types(.:format)
  // function(options)
  api_types_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"notifications",false],[2,[7,"/",false],[2,[6,"types",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// api_user => /api/users/:id(.:format)
  // function(id, options)
  api_user_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"users",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// api_users => /api/users(.:format)
  // function(options)
  api_users_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"users",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// api_users_rights_lists => /api/users_rights_lists(.:format)
  // function(options)
  api_users_rights_lists_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"users_rights_lists",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// api_validate_data => /api/validate_data(.:format)
  // function(options)
  api_validate_data_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"validate_data",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// api_validate_datum => /api/validate_data/:id(.:format)
  // function(id, options)
  api_validate_datum_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"validate_data",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// api_wilder => /api/wilders/:id(.:format)
  // function(id, options)
  api_wilder_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"wilders",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// api_wilders => /api/wilders(.:format)
  // function(options)
  api_wilders_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"wilders",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// berlin => /berlin(.:format)
  // function(options)
  berlin_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"berlin",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
// biarritz => /biarritz(.:format)
  // function(options)
  biarritz_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"biarritz",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
// blended_learning_teaching_approach => /blended-learning-teaching-approach(.:format)
  // function(options)
  blended_learning_teaching_approach_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"blended-learning-teaching-approach",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
// blog_en_gb => /en-GB/blog/:slug(.:format)
  // function(slug, options)
  blog_en_gb_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"en-GB",false],[2,[7,"/",false],[2,[6,"blog",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// blog_es_es => /es-ES/blog/:slug(.:format)
  // function(slug, options)
  blog_es_es_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"es-ES",false],[2,[7,"/",false],[2,[6,"blog",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// blog_fr_be => /fr-BE/blog/:slug(.:format)
  // function(slug, options)
  blog_fr_be_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-BE",false],[2,[7,"/",false],[2,[6,"blog",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// blog_fr_fr => /fr-FR/blog/:slug(.:format)
  // function(slug, options)
  blog_fr_fr_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-FR",false],[2,[7,"/",false],[2,[6,"blog",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// blog_pt_pt => /pt-PT/blog/:slug(.:format)
  // function(slug, options)
  blog_pt_pt_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"pt-PT",false],[2,[7,"/",false],[2,[6,"blog",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// blog_redirect => /blog(.:format)
  // function(options)
  blog_redirect_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"blog",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
// blogs_en_gb => /en-GB/blog(.:format)
  // function(options)
  blogs_en_gb_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"en-GB",false],[2,[7,"/",false],[2,[6,"blog",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// blogs_es_es => /es-ES/blog(.:format)
  // function(options)
  blogs_es_es_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"es-ES",false],[2,[7,"/",false],[2,[6,"blog",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// blogs_fr_be => /fr-BE/blog(.:format)
  // function(options)
  blogs_fr_be_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-BE",false],[2,[7,"/",false],[2,[6,"blog",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// blogs_fr_fr => /fr-FR/blog(.:format)
  // function(options)
  blogs_fr_fr_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-FR",false],[2,[7,"/",false],[2,[6,"blog",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// blogs_pt_pt => /pt-PT/blog(.:format)
  // function(options)
  blogs_pt_pt_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"pt-PT",false],[2,[7,"/",false],[2,[6,"blog",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// bordeaux => /bordeaux(.:format)
  // function(options)
  bordeaux_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"bordeaux",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
// brussels => /brussels(.:format)
  // function(options)
  brussels_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"brussels",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
// bucharest => /bucharest(.:format)
  // function(options)
  bucharest_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"bucharest",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
// category_blogs_en_gb => /en-GB/blog/category/:slug(.:format)
  // function(slug, options)
  category_blogs_en_gb_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"en-GB",false],[2,[7,"/",false],[2,[6,"blog",false],[2,[7,"/",false],[2,[6,"category",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
// category_blogs_es_es => /es-ES/blog/categoria/:slug(.:format)
  // function(slug, options)
  category_blogs_es_es_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"es-ES",false],[2,[7,"/",false],[2,[6,"blog",false],[2,[7,"/",false],[2,[6,"categoria",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
// category_blogs_fr_be => /fr-BE/blog/categorie/:slug(.:format)
  // function(slug, options)
  category_blogs_fr_be_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-BE",false],[2,[7,"/",false],[2,[6,"blog",false],[2,[7,"/",false],[2,[6,"categorie",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
// category_blogs_fr_fr => /fr-FR/blog/categorie/:slug(.:format)
  // function(slug, options)
  category_blogs_fr_fr_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-FR",false],[2,[7,"/",false],[2,[6,"blog",false],[2,[7,"/",false],[2,[6,"categorie",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
// category_blogs_pt_pt => /pt-PT/blog/category/:slug(.:format)
  // function(slug, options)
  category_blogs_pt_pt_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"pt-PT",false],[2,[7,"/",false],[2,[6,"blog",false],[2,[7,"/",false],[2,[6,"category",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
// corporate_training_en_gb => /en-GB/corporate-training(.:format)
  // function(options)
  corporate_training_en_gb_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"en-GB",false],[2,[7,"/",false],[2,[6,"corporate-training",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// corporate_training_es_es => /es-ES/entrena-tu-talento(.:format)
  // function(options)
  corporate_training_es_es_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"es-ES",false],[2,[7,"/",false],[2,[6,"entrena-tu-talento",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// corporate_training_fr_be => /fr-BE/formez-vos-talents(.:format)
  // function(options)
  corporate_training_fr_be_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-BE",false],[2,[7,"/",false],[2,[6,"formez-vos-talents",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// corporate_training_fr_fr => /fr-FR/formez-vos-talents(.:format)
  // function(options)
  corporate_training_fr_fr_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-FR",false],[2,[7,"/",false],[2,[6,"formez-vos-talents",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// corporate_training_pt_pt => /pt-PT/translation%20missing:%20pt-PT.routes.corporate_training(.:format)
  // function(options)
  corporate_training_pt_pt_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"pt-PT",false],[2,[7,"/",false],[2,[6,"translation%20missing",false],[2,[6,"",false],[2,[6,"%20pt-PT",false],[2,[8,".",false],[2,[6,"routes",false],[2,[8,".",false],[2,[6,"corporate_training",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
// data_policy_en_gb => /en-GB/charte-donnees-personnelles(.:format)
  // function(options)
  data_policy_en_gb_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"en-GB",false],[2,[7,"/",false],[2,[6,"charte-donnees-personnelles",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// data_policy_es_es => /es-ES/politicade-de-proteccion-de-datos(.:format)
  // function(options)
  data_policy_es_es_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"es-ES",false],[2,[7,"/",false],[2,[6,"politicade-de-proteccion-de-datos",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// data_policy_fr_be => /fr-BE/charte-donnees-personnelles(.:format)
  // function(options)
  data_policy_fr_be_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-BE",false],[2,[7,"/",false],[2,[6,"charte-donnees-personnelles",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// data_policy_fr_fr => /fr-FR/charte-donnees-personnelles(.:format)
  // function(options)
  data_policy_fr_fr_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-FR",false],[2,[7,"/",false],[2,[6,"charte-donnees-personnelles",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// data_policy_pt_pt => /pt-PT/data-policy(.:format)
  // function(options)
  data_policy_pt_pt_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"pt-PT",false],[2,[7,"/",false],[2,[6,"data-policy",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// edit_api_blog => /api/blogs/:id/edit(.:format)
  // function(id, options)
  edit_api_blog_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"blogs",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"edit",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
// edit_api_blog_category => /api/blog_categories/:id/edit(.:format)
  // function(id, options)
  edit_api_blog_category_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"blog_categories",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"edit",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
// edit_api_business => /api/businesses/:id/edit(.:format)
  // function(id, options)
  edit_api_business_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"businesses",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"edit",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
// edit_api_campu => /api/campus/:id/edit(.:format)
  // function(id, options)
  edit_api_campu_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"campus",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"edit",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
// edit_api_campus_image => /api/campus_images/:id/edit(.:format)
  // function(id, options)
  edit_api_campus_image_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"campus_images",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"edit",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
// edit_api_country => /api/countries/:id/edit(.:format)
  // function(id, options)
  edit_api_country_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"countries",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"edit",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
// edit_api_customer_project => /api/customer_projects/:id/edit(.:format)
  // function(id, options)
  edit_api_customer_project_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"customer_projects",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"edit",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
// edit_api_faq => /api/faqs/:id/edit(.:format)
  // function(id, options)
  edit_api_faq_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"faqs",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"edit",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
// edit_api_faq_category => /api/faq_categories/:id/edit(.:format)
  // function(id, options)
  edit_api_faq_category_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"faq_categories",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"edit",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
// edit_api_image => /api/images/:id/edit(.:format)
  // function(id, options)
  edit_api_image_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"images",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"edit",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
// edit_api_job => /api/jobs/:id/edit(.:format)
  // function(id, options)
  edit_api_job_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"jobs",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"edit",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
// edit_api_page => /api/pages/:slug/edit(.:format)
  // function(slug, options)
  edit_api_page_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"pages",false],[2,[7,"/",false],[2,[3,"slug",false],[2,[7,"/",false],[2,[6,"edit",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
// edit_api_promotion => /api/promotions/:id/edit(.:format)
  // function(id, options)
  edit_api_promotion_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"promotions",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"edit",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
// edit_api_team => /api/teams/:id/edit(.:format)
  // function(id, options)
  edit_api_team_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"teams",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"edit",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
// edit_api_training => /api/trainings/:id/edit(.:format)
  // function(id, options)
  edit_api_training_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"trainings",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"edit",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
// edit_api_trainings_category => /api/trainings_categories/:id/edit(.:format)
  // function(id, options)
  edit_api_trainings_category_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"trainings_categories",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"edit",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
// edit_api_trainings_typical_week => /api/trainings_typical_weeks/:id/edit(.:format)
  // function(id, options)
  edit_api_trainings_typical_week_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"trainings_typical_weeks",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"edit",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
// edit_api_wilder => /api/wilders/:id/edit(.:format)
  // function(id, options)
  edit_api_wilder_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"wilders",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"edit",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
// edit_job_en_gb => /en-GB/jobs/:slug/edit(.:format)
  // function(slug, options)
  edit_job_en_gb_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"en-GB",false],[2,[7,"/",false],[2,[6,"jobs",false],[2,[7,"/",false],[2,[3,"slug",false],[2,[7,"/",false],[2,[6,"edit",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
// edit_job_es_es => /es-ES/empleo/:slug/translation%20missing:%20es-ES.routes.edit(.:format)
  // function(slug, options)
  edit_job_es_es_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"es-ES",false],[2,[7,"/",false],[2,[6,"empleo",false],[2,[7,"/",false],[2,[3,"slug",false],[2,[7,"/",false],[2,[6,"translation%20missing",false],[2,[6,"",false],[2,[6,"%20es-ES",false],[2,[8,".",false],[2,[6,"routes",false],[2,[8,".",false],[2,[6,"edit",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]]]]]),
// edit_job_fr_be => /fr-BE/metiers/:slug/translation%20missing:%20fr-BE.routes.edit(.:format)
  // function(slug, options)
  edit_job_fr_be_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-BE",false],[2,[7,"/",false],[2,[6,"metiers",false],[2,[7,"/",false],[2,[3,"slug",false],[2,[7,"/",false],[2,[6,"translation%20missing",false],[2,[6,"",false],[2,[6,"%20fr-BE",false],[2,[8,".",false],[2,[6,"routes",false],[2,[8,".",false],[2,[6,"edit",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]]]]]),
// edit_job_fr_fr => /fr-FR/metiers/:slug/translation%20missing:%20fr-FR.routes.edit(.:format)
  // function(slug, options)
  edit_job_fr_fr_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-FR",false],[2,[7,"/",false],[2,[6,"metiers",false],[2,[7,"/",false],[2,[3,"slug",false],[2,[7,"/",false],[2,[6,"translation%20missing",false],[2,[6,"",false],[2,[6,"%20fr-FR",false],[2,[8,".",false],[2,[6,"routes",false],[2,[8,".",false],[2,[6,"edit",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]]]]]),
// edit_job_pt_pt => /pt-PT/jobs/:slug/translation%20missing:%20pt-PT.routes.edit(.:format)
  // function(slug, options)
  edit_job_pt_pt_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"pt-PT",false],[2,[7,"/",false],[2,[6,"jobs",false],[2,[7,"/",false],[2,[3,"slug",false],[2,[7,"/",false],[2,[6,"translation%20missing",false],[2,[6,"",false],[2,[6,"%20pt-PT",false],[2,[8,".",false],[2,[6,"routes",false],[2,[8,".",false],[2,[6,"edit",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]]]]]),
// en_GB_blog_backend_frontend_what_does_it_mean => /en-GB/blog/backend-frontend-what-does-it-mean(.:format)
  // function(options)
  en_GB_blog_backend_frontend_what_does_it_mean_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"en-GB",false],[2,[7,"/",false],[2,[6,"blog",false],[2,[7,"/",false],[2,[6,"backend-frontend-what-does-it-mean",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// en_GB_blog_how_to_get_started_with_react => /en-GB/blog/how-to-get-started-with-react(.:format)
  // function(options)
  en_GB_blog_how_to_get_started_with_react_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"en-GB",false],[2,[7,"/",false],[2,[6,"blog",false],[2,[7,"/",false],[2,[6,"how-to-get-started-with-react",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// en_GB_blog_reconversion => /en-GB/blog/reconversion(.:format)
  // function(options)
  en_GB_blog_reconversion_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"en-GB",false],[2,[7,"/",false],[2,[6,"blog",false],[2,[7,"/",false],[2,[6,"reconversion",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// en_GB_blog_what_is_a_framework_2 => /en-GB/blog/what-is-a-framework-2(.:format)
  // function(options)
  en_GB_blog_what_is_a_framework_2_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"en-GB",false],[2,[7,"/",false],[2,[6,"blog",false],[2,[7,"/",false],[2,[6,"what-is-a-framework-2",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// events_en_gb => /en-GB/events(.:format)
  // function(options)
  events_en_gb_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"en-GB",false],[2,[7,"/",false],[2,[6,"events",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// events_es_es => /es-ES/eventos(.:format)
  // function(options)
  events_es_es_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"es-ES",false],[2,[7,"/",false],[2,[6,"eventos",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// events_fr_be => /fr-BE/evenements(.:format)
  // function(options)
  events_fr_be_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-BE",false],[2,[7,"/",false],[2,[6,"evenements",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// events_fr_fr => /fr-FR/evenements(.:format)
  // function(options)
  events_fr_fr_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-FR",false],[2,[7,"/",false],[2,[6,"evenements",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// events_pt_pt => /pt-PT/eventos(.:format)
  // function(options)
  events_pt_pt_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"pt-PT",false],[2,[7,"/",false],[2,[6,"eventos",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// faq_categories_en_gb => /en-GB/faq(.:format)
  // function(options)
  faq_categories_en_gb_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"en-GB",false],[2,[7,"/",false],[2,[6,"faq",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// faq_categories_es_es => /es-ES/faq(.:format)
  // function(options)
  faq_categories_es_es_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"es-ES",false],[2,[7,"/",false],[2,[6,"faq",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// faq_categories_fr_be => /fr-BE/faq(.:format)
  // function(options)
  faq_categories_fr_be_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-BE",false],[2,[7,"/",false],[2,[6,"faq",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// faq_categories_fr_fr => /fr-FR/faq(.:format)
  // function(options)
  faq_categories_fr_fr_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-FR",false],[2,[7,"/",false],[2,[6,"faq",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// faq_categories_pt_pt => /pt-PT/faq(.:format)
  // function(options)
  faq_categories_pt_pt_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"pt-PT",false],[2,[7,"/",false],[2,[6,"faq",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// faq_category_en_gb => /en-GB/faq/:slug(.:format)
  // function(slug, options)
  faq_category_en_gb_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"en-GB",false],[2,[7,"/",false],[2,[6,"faq",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// faq_category_es_es => /es-ES/faq/:slug(.:format)
  // function(slug, options)
  faq_category_es_es_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"es-ES",false],[2,[7,"/",false],[2,[6,"faq",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// faq_category_fr_be => /fr-BE/faq/:slug(.:format)
  // function(slug, options)
  faq_category_fr_be_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-BE",false],[2,[7,"/",false],[2,[6,"faq",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// faq_category_fr_fr => /fr-FR/faq/:slug(.:format)
  // function(slug, options)
  faq_category_fr_fr_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-FR",false],[2,[7,"/",false],[2,[6,"faq",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// faq_category_pt_pt => /pt-PT/faq/:slug(.:format)
  // function(slug, options)
  faq_category_pt_pt_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"pt-PT",false],[2,[7,"/",false],[2,[6,"faq",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// fr_BE_blog_quelle_formation_informatique_est_faite_pour_moi_les_3_questions_indispensables_a_se_poser => /fr-BE/blog/quelle-formation-informatique-est-faite-pour-moi-les-3-questions-indispensables-a-se-poser(.:format)
  // function(options)
  fr_BE_blog_quelle_formation_informatique_est_faite_pour_moi_les_3_questions_indispensables_a_se_poser_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-BE",false],[2,[7,"/",false],[2,[6,"blog",false],[2,[7,"/",false],[2,[6,"quelle-formation-informatique-est-faite-pour-moi-les-3-questions-indispensables-a-se-poser",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// fr_BE_blog_quelle_sont_les_differences_entre_java_et_javascript => /fr-BE/blog/quelle-sont-les-differences-entre-java-et-javascript(.:format)
  // function(options)
  fr_BE_blog_quelle_sont_les_differences_entre_java_et_javascript_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-BE",false],[2,[7,"/",false],[2,[6,"blog",false],[2,[7,"/",false],[2,[6,"quelle-sont-les-differences-entre-java-et-javascript",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// fr_BE_blog_quest_ce_quun_framework => /fr-BE/blog/quest-ce-quun-framework(.:format)
  // function(options)
  fr_BE_blog_quest_ce_quun_framework_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-BE",false],[2,[7,"/",false],[2,[6,"blog",false],[2,[7,"/",false],[2,[6,"quest-ce-quun-framework",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// fr_BE_blog_reconversion_professionnelle_j_ose_le_numerique => /fr-BE/blog/reconversion-professionnelle-j-ose-le-numerique(.:format)
  // function(options)
  fr_BE_blog_reconversion_professionnelle_j_ose_le_numerique_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-BE",false],[2,[7,"/",false],[2,[6,"blog",false],[2,[7,"/",false],[2,[6,"reconversion-professionnelle-j-ose-le-numerique",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// fr_FR_blog_backend_frontend_quest_ce_que_ca_veut_dire => /fr-FR/blog/backend-frontend-quest-ce-que-ca-veut-dire(.:format)
  // function(options)
  fr_FR_blog_backend_frontend_quest_ce_que_ca_veut_dire_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-FR",false],[2,[7,"/",false],[2,[6,"blog",false],[2,[7,"/",false],[2,[6,"backend-frontend-quest-ce-que-ca-veut-dire",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// fr_FR_blog_nouvelle_formation_blockchain_technologie_de_demain_qui_se_construit_aujourd_hui => /fr-FR/blog/nouvelle-formation-blockchain-technologie-de-demain-qui-se-construit-aujourd-hui(.:format)
  // function(options)
  fr_FR_blog_nouvelle_formation_blockchain_technologie_de_demain_qui_se_construit_aujourd_hui_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-FR",false],[2,[7,"/",false],[2,[6,"blog",false],[2,[7,"/",false],[2,[6,"nouvelle-formation-blockchain-technologie-de-demain-qui-se-construit-aujourd-hui",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// fr_FR_blog_quelle_formation_informatique_est_faite_pour_moi_les_3_questions_indispensables_a_se_poser => /fr-FR/blog/quelle-formation-informatique-est-faite-pour-moi-les-3-questions-indispensables-a-se-poser(.:format)
  // function(options)
  fr_FR_blog_quelle_formation_informatique_est_faite_pour_moi_les_3_questions_indispensables_a_se_poser_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-FR",false],[2,[7,"/",false],[2,[6,"blog",false],[2,[7,"/",false],[2,[6,"quelle-formation-informatique-est-faite-pour-moi-les-3-questions-indispensables-a-se-poser",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// fr_FR_blog_quelle_sont_les_differences_entre_java_et_javascript => /fr-FR/blog/quelle-sont-les-differences-entre-java-et-javascript(.:format)
  // function(options)
  fr_FR_blog_quelle_sont_les_differences_entre_java_et_javascript_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-FR",false],[2,[7,"/",false],[2,[6,"blog",false],[2,[7,"/",false],[2,[6,"quelle-sont-les-differences-entre-java-et-javascript",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// fr_FR_blog_quest_ce_quun_framework => /fr-FR/blog/quest-ce-quun-framework(.:format)
  // function(options)
  fr_FR_blog_quest_ce_quun_framework_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-FR",false],[2,[7,"/",false],[2,[6,"blog",false],[2,[7,"/",false],[2,[6,"quest-ce-quun-framework",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// fr_FR_blog_reconversion_professionnelle_j_ose_le_numerique => /fr-FR/blog/reconversion-professionnelle-j-ose-le-numerique(.:format)
  // function(options)
  fr_FR_blog_reconversion_professionnelle_j_ose_le_numerique_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-FR",false],[2,[7,"/",false],[2,[6,"blog",false],[2,[7,"/",false],[2,[6,"reconversion-professionnelle-j-ose-le-numerique",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// fr_FR_formations_front_end_developer_part_time => /fr-FR/formations/front-end-developer-part-time(.:format)
  // function(options)
  fr_FR_formations_front_end_developer_part_time_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-FR",false],[2,[7,"/",false],[2,[6,"formations",false],[2,[7,"/",false],[2,[6,"front-end-developer-part-time",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// fr_FR_formations_product_management_part_time => /fr-FR/formations/product-management-part-time(.:format)
  // function(options)
  fr_FR_formations_product_management_part_time_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-FR",false],[2,[7,"/",false],[2,[6,"formations",false],[2,[7,"/",false],[2,[6,"product-management-part-time",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// fr_FR_metiers_metier_de_developpeur => /fr-FR/metiers/metier-de-developpeur(.:format)
  // function(options)
  fr_FR_metiers_metier_de_developpeur_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-FR",false],[2,[7,"/",false],[2,[6,"metiers",false],[2,[7,"/",false],[2,[6,"metier-de-developpeur",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// hire_talent_en_gb => /en-GB/hire-tech-talent(.:format)
  // function(options)
  hire_talent_en_gb_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"en-GB",false],[2,[7,"/",false],[2,[6,"hire-tech-talent",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// hire_talent_es_es => /es-ES/contrata-tu-talento-tecnologico(.:format)
  // function(options)
  hire_talent_es_es_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"es-ES",false],[2,[7,"/",false],[2,[6,"contrata-tu-talento-tecnologico",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// hire_talent_fr_be => /fr-BE/recrutez-vos-talents(.:format)
  // function(options)
  hire_talent_fr_be_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-BE",false],[2,[7,"/",false],[2,[6,"recrutez-vos-talents",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// hire_talent_fr_fr => /fr-FR/recrutez-vos-talents(.:format)
  // function(options)
  hire_talent_fr_fr_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-FR",false],[2,[7,"/",false],[2,[6,"recrutez-vos-talents",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// hire_talent_pt_pt => /pt-PT/translation%20missing:%20pt-PT.routes.hire_talent(.:format)
  // function(options)
  hire_talent_pt_pt_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"pt-PT",false],[2,[7,"/",false],[2,[6,"translation%20missing",false],[2,[6,"",false],[2,[6,"%20pt-PT",false],[2,[8,".",false],[2,[6,"routes",false],[2,[8,".",false],[2,[6,"hire_talent",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
// job_en_gb => /en-GB/jobs/:slug(.:format)
  // function(slug, options)
  job_en_gb_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"en-GB",false],[2,[7,"/",false],[2,[6,"jobs",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// job_es_es => /es-ES/empleo/:slug(.:format)
  // function(slug, options)
  job_es_es_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"es-ES",false],[2,[7,"/",false],[2,[6,"empleo",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// job_fr_be => /fr-BE/metiers/:slug(.:format)
  // function(slug, options)
  job_fr_be_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-BE",false],[2,[7,"/",false],[2,[6,"metiers",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// job_fr_fr => /fr-FR/metiers/:slug(.:format)
  // function(slug, options)
  job_fr_fr_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-FR",false],[2,[7,"/",false],[2,[6,"metiers",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// job_pt_pt => /pt-PT/jobs/:slug(.:format)
  // function(slug, options)
  job_pt_pt_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"pt-PT",false],[2,[7,"/",false],[2,[6,"jobs",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// jobs_en_gb => /en-GB/jobs(.:format)
  // function(options)
  jobs_en_gb_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"en-GB",false],[2,[7,"/",false],[2,[6,"jobs",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// jobs_es_es => /es-ES/empleo(.:format)
  // function(options)
  jobs_es_es_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"es-ES",false],[2,[7,"/",false],[2,[6,"empleo",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// jobs_fr_be => /fr-BE/metiers(.:format)
  // function(options)
  jobs_fr_be_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-BE",false],[2,[7,"/",false],[2,[6,"metiers",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// jobs_fr_fr => /fr-FR/metiers(.:format)
  // function(options)
  jobs_fr_fr_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-FR",false],[2,[7,"/",false],[2,[6,"metiers",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// jobs_pt_pt => /pt-PT/jobs(.:format)
  // function(options)
  jobs_pt_pt_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"pt-PT",false],[2,[7,"/",false],[2,[6,"jobs",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// la_loupe => /la-loupe(.:format)
  // function(options)
  la_loupe_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"la-loupe",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
// lille => /lille(.:format)
  // function(options)
  lille_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"lille",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
// lisbon => /lisbon(.:format)
  // function(options)
  lisbon_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"lisbon",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
// london => /london(.:format)
  // function(options)
  london_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"london",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
// lyon => /lyon(.:format)
  // function(options)
  lyon_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"lyon",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
// madrid => /madrid(.:format)
  // function(options)
  madrid_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"madrid",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
// marseille => /marseille(.:format)
  // function(options)
  marseille_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"marseille",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
// nantes => /nantes(.:format)
  // function(options)
  nantes_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"nantes",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
// new_api_blog => /api/blogs/new(.:format)
  // function(options)
  new_api_blog_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"blogs",false],[2,[7,"/",false],[2,[6,"new",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// new_api_blog_category => /api/blog_categories/new(.:format)
  // function(options)
  new_api_blog_category_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"blog_categories",false],[2,[7,"/",false],[2,[6,"new",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// new_api_business => /api/businesses/new(.:format)
  // function(options)
  new_api_business_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"businesses",false],[2,[7,"/",false],[2,[6,"new",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// new_api_campu => /api/campus/new(.:format)
  // function(options)
  new_api_campu_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"campus",false],[2,[7,"/",false],[2,[6,"new",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// new_api_campus_image => /api/campus_images/new(.:format)
  // function(options)
  new_api_campus_image_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"campus_images",false],[2,[7,"/",false],[2,[6,"new",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// new_api_country => /api/countries/new(.:format)
  // function(options)
  new_api_country_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"countries",false],[2,[7,"/",false],[2,[6,"new",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// new_api_customer_project => /api/customer_projects/new(.:format)
  // function(options)
  new_api_customer_project_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"customer_projects",false],[2,[7,"/",false],[2,[6,"new",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// new_api_default_school => /api/default_schools/new(.:format)
  // function(options)
  new_api_default_school_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"default_schools",false],[2,[7,"/",false],[2,[6,"new",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// new_api_faq => /api/faqs/new(.:format)
  // function(options)
  new_api_faq_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"faqs",false],[2,[7,"/",false],[2,[6,"new",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// new_api_faq_category => /api/faq_categories/new(.:format)
  // function(options)
  new_api_faq_category_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"faq_categories",false],[2,[7,"/",false],[2,[6,"new",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// new_api_funding_organisation => /api/funding_organisations/new(.:format)
  // function(options)
  new_api_funding_organisation_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"funding_organisations",false],[2,[7,"/",false],[2,[6,"new",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// new_api_image => /api/images/new(.:format)
  // function(options)
  new_api_image_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"images",false],[2,[7,"/",false],[2,[6,"new",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// new_api_job => /api/jobs/new(.:format)
  // function(options)
  new_api_job_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"jobs",false],[2,[7,"/",false],[2,[6,"new",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// new_api_locale => /api/locales/new(.:format)
  // function(options)
  new_api_locale_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"locales",false],[2,[7,"/",false],[2,[6,"new",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// new_api_page => /api/pages/new(.:format)
  // function(options)
  new_api_page_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"pages",false],[2,[7,"/",false],[2,[6,"new",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// new_api_promotion => /api/promotions/new(.:format)
  // function(options)
  new_api_promotion_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"promotions",false],[2,[7,"/",false],[2,[6,"new",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// new_api_team => /api/teams/new(.:format)
  // function(options)
  new_api_team_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"teams",false],[2,[7,"/",false],[2,[6,"new",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// new_api_training => /api/trainings/new(.:format)
  // function(options)
  new_api_training_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"trainings",false],[2,[7,"/",false],[2,[6,"new",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// new_api_trainings_category => /api/trainings_categories/new(.:format)
  // function(options)
  new_api_trainings_category_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"trainings_categories",false],[2,[7,"/",false],[2,[6,"new",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// new_api_trainings_program => /api/trainings_programs/new(.:format)
  // function(options)
  new_api_trainings_program_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"trainings_programs",false],[2,[7,"/",false],[2,[6,"new",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// new_api_trainings_typical_week => /api/trainings_typical_weeks/new(.:format)
  // function(options)
  new_api_trainings_typical_week_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"trainings_typical_weeks",false],[2,[7,"/",false],[2,[6,"new",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// new_api_user => /api/users/new(.:format)
  // function(options)
  new_api_user_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"users",false],[2,[7,"/",false],[2,[6,"new",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// new_api_wilder => /api/wilders/new(.:format)
  // function(options)
  new_api_wilder_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"wilders",false],[2,[7,"/",false],[2,[6,"new",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// new_job_en_gb => /en-GB/jobs/new(.:format)
  // function(options)
  new_job_en_gb_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"en-GB",false],[2,[7,"/",false],[2,[6,"jobs",false],[2,[7,"/",false],[2,[6,"new",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// new_job_es_es => /es-ES/empleo/translation%20missing:%20es-ES.routes.new(.:format)
  // function(options)
  new_job_es_es_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"es-ES",false],[2,[7,"/",false],[2,[6,"empleo",false],[2,[7,"/",false],[2,[6,"translation%20missing",false],[2,[6,"",false],[2,[6,"%20es-ES",false],[2,[8,".",false],[2,[6,"routes",false],[2,[8,".",false],[2,[6,"new",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]]]),
// new_job_fr_be => /fr-BE/metiers/translation%20missing:%20fr-BE.routes.new(.:format)
  // function(options)
  new_job_fr_be_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-BE",false],[2,[7,"/",false],[2,[6,"metiers",false],[2,[7,"/",false],[2,[6,"translation%20missing",false],[2,[6,"",false],[2,[6,"%20fr-BE",false],[2,[8,".",false],[2,[6,"routes",false],[2,[8,".",false],[2,[6,"new",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]]]),
// new_job_fr_fr => /fr-FR/metiers/translation%20missing:%20fr-FR.routes.new(.:format)
  // function(options)
  new_job_fr_fr_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-FR",false],[2,[7,"/",false],[2,[6,"metiers",false],[2,[7,"/",false],[2,[6,"translation%20missing",false],[2,[6,"",false],[2,[6,"%20fr-FR",false],[2,[8,".",false],[2,[6,"routes",false],[2,[8,".",false],[2,[6,"new",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]]]),
// new_job_pt_pt => /pt-PT/jobs/translation%20missing:%20pt-PT.routes.new(.:format)
  // function(options)
  new_job_pt_pt_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"pt-PT",false],[2,[7,"/",false],[2,[6,"jobs",false],[2,[7,"/",false],[2,[6,"translation%20missing",false],[2,[6,"",false],[2,[6,"%20pt-PT",false],[2,[8,".",false],[2,[6,"routes",false],[2,[8,".",false],[2,[6,"new",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]]]),
// orleans => /orleans(.:format)
  // function(options)
  orleans_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"orleans",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
// our_campuses => /our-campuses(.:format)
  // function(options)
  our_campuses_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"our-campuses",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
// page_en_gb => /en-GB/pages/:slug(.:format)
  // function(slug, options)
  page_en_gb_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"en-GB",false],[2,[7,"/",false],[2,[6,"pages",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// page_es_es => /es-ES/translation%20missing:%20es-ES.routes.pages/:slug(.:format)
  // function(slug, options)
  page_es_es_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"es-ES",false],[2,[7,"/",false],[2,[6,"translation%20missing",false],[2,[6,"",false],[2,[6,"%20es-ES",false],[2,[8,".",false],[2,[6,"routes",false],[2,[8,".",false],[2,[6,"pages",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]]]),
// page_fr_be => /fr-BE/translation%20missing:%20fr-BE.routes.pages/:slug(.:format)
  // function(slug, options)
  page_fr_be_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-BE",false],[2,[7,"/",false],[2,[6,"translation%20missing",false],[2,[6,"",false],[2,[6,"%20fr-BE",false],[2,[8,".",false],[2,[6,"routes",false],[2,[8,".",false],[2,[6,"pages",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]]]),
// page_fr_fr => /fr-FR/translation%20missing:%20fr-FR.routes.pages/:slug(.:format)
  // function(slug, options)
  page_fr_fr_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-FR",false],[2,[7,"/",false],[2,[6,"translation%20missing",false],[2,[6,"",false],[2,[6,"%20fr-FR",false],[2,[8,".",false],[2,[6,"routes",false],[2,[8,".",false],[2,[6,"pages",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]]]),
// page_pt_pt => /pt-PT/translation%20missing:%20pt-PT.routes.pages/:slug(.:format)
  // function(slug, options)
  page_pt_pt_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"pt-PT",false],[2,[7,"/",false],[2,[6,"translation%20missing",false],[2,[6,"",false],[2,[6,"%20pt-PT",false],[2,[8,".",false],[2,[6,"routes",false],[2,[8,".",false],[2,[6,"pages",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]]]),
// paris => /paris(.:format)
  // function(options)
  paris_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"paris",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
// projects_en_gb => /en-GB/develop-your-project(.:format)
  // function(options)
  projects_en_gb_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"en-GB",false],[2,[7,"/",false],[2,[6,"develop-your-project",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// projects_es_es => /es-ES/desarrolla-tu-proyecto(.:format)
  // function(options)
  projects_es_es_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"es-ES",false],[2,[7,"/",false],[2,[6,"desarrolla-tu-proyecto",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// projects_fr_be => /fr-BE/developpez-votre-projet(.:format)
  // function(options)
  projects_fr_be_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-BE",false],[2,[7,"/",false],[2,[6,"developpez-votre-projet",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// projects_fr_fr => /fr-FR/developpez-votre-projet(.:format)
  // function(options)
  projects_fr_fr_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-FR",false],[2,[7,"/",false],[2,[6,"developpez-votre-projet",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// projects_pt_pt => /pt-PT/translation%20missing:%20pt-PT.routes.projects(.:format)
  // function(options)
  projects_pt_pt_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"pt-PT",false],[2,[7,"/",false],[2,[6,"translation%20missing",false],[2,[6,"",false],[2,[6,"%20pt-PT",false],[2,[8,".",false],[2,[6,"routes",false],[2,[8,".",false],[2,[6,"projects",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
// reims => /reims(.:format)
  // function(options)
  reims_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"reims",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
// root_en_gb => /en-GB
  // function(options)
  root_en_gb_path: Utils.route([], {}, [2,[7,"/",false],[6,"en-GB",false]]),
// root_es_es => /es-ES
  // function(options)
  root_es_es_path: Utils.route([], {}, [2,[7,"/",false],[6,"es-ES",false]]),
// root_fr_be => /fr-BE
  // function(options)
  root_fr_be_path: Utils.route([], {}, [2,[7,"/",false],[6,"fr-BE",false]]),
// root_fr_fr => /fr-FR
  // function(options)
  root_fr_fr_path: Utils.route([], {}, [2,[7,"/",false],[6,"fr-FR",false]]),
// root_pt_pt => /pt-PT
  // function(options)
  root_pt_pt_path: Utils.route([], {}, [2,[7,"/",false],[6,"pt-PT",false]]),
// school_en_gb => /en-GB/campuses/:slug(.:format)
  // function(slug, options)
  school_en_gb_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"en-GB",false],[2,[7,"/",false],[2,[6,"campuses",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// school_es_es => /es-ES/campus/:slug(.:format)
  // function(slug, options)
  school_es_es_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"es-ES",false],[2,[7,"/",false],[2,[6,"campus",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// school_fr_be => /fr-BE/campus/:slug(.:format)
  // function(slug, options)
  school_fr_be_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-BE",false],[2,[7,"/",false],[2,[6,"campus",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// school_fr_fr => /fr-FR/campus/:slug(.:format)
  // function(slug, options)
  school_fr_fr_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-FR",false],[2,[7,"/",false],[2,[6,"campus",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// school_pt_pt => /pt-PT/campuses/:slug(.:format)
  // function(slug, options)
  school_pt_pt_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"pt-PT",false],[2,[7,"/",false],[2,[6,"campuses",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// strasbourg => /strasbourg(.:format)
  // function(options)
  strasbourg_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"strasbourg",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
// terms_of_use_en_gb => /en-GB/condition-generales-utilisation(.:format)
  // function(options)
  terms_of_use_en_gb_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"en-GB",false],[2,[7,"/",false],[2,[6,"condition-generales-utilisation",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// terms_of_use_es_es => /es-ES/normas-de-uso-generales(.:format)
  // function(options)
  terms_of_use_es_es_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"es-ES",false],[2,[7,"/",false],[2,[6,"normas-de-uso-generales",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// terms_of_use_fr_be => /fr-BE/condition-generales-utilisation(.:format)
  // function(options)
  terms_of_use_fr_be_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-BE",false],[2,[7,"/",false],[2,[6,"condition-generales-utilisation",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// terms_of_use_fr_fr => /fr-FR/condition-generales-utilisation(.:format)
  // function(options)
  terms_of_use_fr_fr_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-FR",false],[2,[7,"/",false],[2,[6,"condition-generales-utilisation",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// terms_of_use_pt_pt => /pt-PT/general-terms-of-use(.:format)
  // function(options)
  terms_of_use_pt_pt_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"pt-PT",false],[2,[7,"/",false],[2,[6,"general-terms-of-use",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// toulouse => /toulouse(.:format)
  // function(options)
  toulouse_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"toulouse",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
// tours => /tours(.:format)
  // function(options)
  tours_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"tours",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
// training_en_gb => /en-GB/trainings/:slug(.:format)
  // function(slug, options)
  training_en_gb_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"en-GB",false],[2,[7,"/",false],[2,[6,"trainings",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// training_es_es => /es-ES/formacion/:slug(.:format)
  // function(slug, options)
  training_es_es_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"es-ES",false],[2,[7,"/",false],[2,[6,"formacion",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// training_fr_be => /fr-BE/formations/:slug(.:format)
  // function(slug, options)
  training_fr_be_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-BE",false],[2,[7,"/",false],[2,[6,"formations",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// training_fr_fr => /fr-FR/formations/:slug(.:format)
  // function(slug, options)
  training_fr_fr_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-FR",false],[2,[7,"/",false],[2,[6,"formations",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// training_pt_pt => /pt-PT/trainings/:slug(.:format)
  // function(slug, options)
  training_pt_pt_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"pt-PT",false],[2,[7,"/",false],[2,[6,"trainings",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
// web_developer_training_courses => /web-developer-training-courses(.:format)
  // function(options)
  web_developer_training_courses_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"web-developer-training-courses",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
// work_study_en_gb => /en-GB/work_study(.:format)
  // function(options)
  work_study_en_gb_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"en-GB",false],[2,[7,"/",false],[2,[6,"work_study",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// work_study_es_es => /es-ES/translation%20missing:%20es-ES.routes.work_study(.:format)
  // function(options)
  work_study_es_es_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"es-ES",false],[2,[7,"/",false],[2,[6,"translation%20missing",false],[2,[6,"",false],[2,[6,"%20es-ES",false],[2,[8,".",false],[2,[6,"routes",false],[2,[8,".",false],[2,[6,"work_study",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
// work_study_fr_be => /fr-BE/translation%20missing:%20fr-BE.routes.work_study(.:format)
  // function(options)
  work_study_fr_be_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-BE",false],[2,[7,"/",false],[2,[6,"translation%20missing",false],[2,[6,"",false],[2,[6,"%20fr-BE",false],[2,[8,".",false],[2,[6,"routes",false],[2,[8,".",false],[2,[6,"work_study",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
// work_study_fr_fr => /fr-FR/alternance(.:format)
  // function(options)
  work_study_fr_fr_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"fr-FR",false],[2,[7,"/",false],[2,[6,"alternance",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
// work_study_pt_pt => /pt-PT/translation%20missing:%20pt-PT.routes.work_study(.:format)
  // function(options)
  work_study_pt_pt_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"pt-PT",false],[2,[7,"/",false],[2,[6,"translation%20missing",false],[2,[6,"",false],[2,[6,"%20pt-PT",false],[2,[8,".",false],[2,[6,"routes",false],[2,[8,".",false],[2,[6,"work_study",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
// working_as_a_developer => /working-as-a-developer(.:format)
  // function(options)
  working_as_a_developer_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"working-as-a-developer",false],[1,[2,[8,".",false],[3,"format",false]],false]]])}
;
      routes.configure = function(config) {
        return Utils.configure(config);
      };
      routes.config = function() {
        return Utils.config();
      };
      Object.defineProperty(routes, 'defaults', {
        get: function() {
          throw new Error("Routes" + ".defaults is removed. Use " + "Routes" + ".configure() instead.");
        },
        set: function(value) {}
      });
      routes.default_serializer = function(object, prefix) {
        return Utils.default_serializer(object, prefix);
      };
      return Utils.namespace(root, "Routes", routes);
    }
  };

  result = Utils.make();

  if (typeof define === "function" && define.amd) {
    define([], function() {
      return result;
    });
  }

  return result;

}).call(this);
// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, or any plugin's
// vendor/assets/javascripts directory can be referenced here using styles relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//




;
