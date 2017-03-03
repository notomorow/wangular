'use strict';
(function () {
    function Scope(node) {
        wyf.idIndex ++;
        this.id = wyf.idIndex;
        this.node = node;
        this.watcher = [];
    }
    function createScope (name, fn){
        wyf.scopeFactories[name] = fn;
    }

    function bianli(ele, parentScope) {
        /*独立scope的directive*/
        wyf.directiveFactories.forEach(function(directive, index){
            if (ele.nodeName == directive.name.toUpperCase()){
                if (typeof directive.entity.scope === 'object'){
                    /*重复代码start*/
                    var newScope = function (){
                        Scope.call(this);
                    }
                    /*newScope.prototype = parentScope;*/
                    var theScope = new newScope();
                    parentScope = theScope;
                    directive.entity.ctrl.call(theScope);
                    /*重复代码end*/
                }
            }
        });
        /*ctrl*/
        if (ele.hasAttribute('wyf-ctrl')) {
            var name = ele.getAttribute('wyf-ctrl');
            var newScope = function (){
                Scope.call(this);
            }
            newScope.prototype = parentScope;
            var theScope = new newScope();
            parentScope = theScope;
            wyf.scopeFactories[name].call(theScope);
            wyf.scopes.push(theScope);

        }
        parseHtml(ele, parentScope);
        if (ele.hasChildNodes()) {
            var childNodes = ele.childNodes;
            for (var index in childNodes){
                var node = childNodes[index];
                if (node.nodeType == '1') {
                    bianli(node, parentScope);
                }
            }
        }
    }
    function applyScope (){
        for (var i in wyf.scopes){
            var scope = wyf.scopes[i];
            for (var k in scope.watcher){
                if (parseCode(scope, scope.watcher[k].code) != scope.watcher[k].node.nodeValue){
                    scope.watcher[k].node.nodeValue = parseCode(scope, scope.watcher[k].code);
                }
            }
        }
    }
    function parseCode (scope, code){
        return scope[code];
    }
    function parseHtml (ele, scope){
        if(ele.hasAttribute('wyf-bind')){
            var attr = ele.getAttribute('wyf-bind');
            var textNode = document.createTextNode(scope[attr]);
            if (ele.firstChild){
                ele.insertBefore(textNode, ele.firstChild);
            }
            else {
                ele.appendChild(textNode);
            }
            scope.watcher.push({code: attr, node: textNode});
        }
        if(ele.hasAttribute('wyf-click')){
            var attr = ele.getAttribute('wyf-click');
            var clickEvent = wyf.funcHook(scope[attr], scope);
            ele.addEventListener('click', clickEvent.bind(scope));
        }
        wyf.directiveFactories.forEach(function(directive, index){
            if (ele.nodeName == directive.name.toUpperCase()){
                ele.innerHTML = directive.entity.template;
            }
        });
    }

    function createDirective (name, fn){
        wyf.directiveFactories.push({name:name, entity: fn()});
    }
    function funcHook(fn) {
        return function () {
            if (fn) {
                fn.call(this);
                applyScope();
            }
        }
    }
    function initDirectives (){

    }
    window.wyf = {
        createScope: createScope,
        scopeFactories: [],
        directiveFactories: [],
        scopes: [],
        idIndex: 1,
        directive: createDirective,
        funcHook: funcHook,
    }

    window.onload = function(){
        bianli(document.body);
    };

})();
wyf.directive('wyf', function(){
    return {
        template: '<div style="margin:10px" wyf-click="clickEvent">wyf标签</div>'
    }
});
wyf.directive('wyfWrap', function(){
    return {
        template: '<p>this is a wyf tag<wyf></wyf></p>'
    }
});
wyf.directive('wyfScope', function(){
    return {
        scope:{},
        ctrl: function(scope){
            this.tag = 'wyf-wrap';
            this.clickEvent = function(){
                alert(this.tag)
            }
        },
        template: '<div style="margin:10px" wyf-click="clickEvent"><span wyf-bind="tag"></span>标签</div><wyf></wyf>'
    }
});
wyf.createScope('parent', function(){
    console.log(111);
    this.a = 1;
    setTimeout(function(){this.a = 111}.bind(this), 3000)
    this.b = 2;
    var _this = this;
    this.clickEvent = function(){
        _this.b = 'bilibili'
    }
});
wyf.createScope('sub', function(){
    this.b = 3;
});