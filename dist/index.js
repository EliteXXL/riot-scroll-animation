(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('riot'), require('data-scroll-animation')) :
    typeof define === 'function' && define.amd ? define(['riot', 'data-scroll-animation'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.riot, global.dataScrollAnimation));
}(this, (function (riot, ScrollAnimation) { 'use strict';

    function _interopNamespace(e) {
        if (e && e.__esModule) return e;
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () {
                            return e[k];
                        }
                    });
                }
            });
        }
        n['default'] = e;
        return Object.freeze(n);
    }

    var ScrollAnimation__namespace = /*#__PURE__*/_interopNamespace(ScrollAnimation);

    riot.install(component => {
        if (!component.hasDataScrollAnimation) {
            return component;
        }

        const onMounted = component.onMounted;
        component.onMounted = (props, state) => {
            onMounted && onMounted.call(component, props, state);
            ScrollAnimation__namespace.add(component.root);
        };
        const onUnmounted = component.onUnmounted;
        component.onUnmounted = (props, state) => {
            ScrollAnimation__namespace.remove(component.root);
            onUnmounted && onUnmounted.call(component, props, state);
        };
        const onUpdated = component.onUpdated;
        component.onUpdated = (props, state) => {
            onUpdated && onUpdated.call(component, props, state);
            ScrollAnimation__namespace.add(component.root);
        };
        return component;
    });

})));
