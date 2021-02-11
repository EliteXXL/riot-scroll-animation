(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('riot'), require('data-scroll-animation')) :
    typeof define === 'function' && define.amd ? define(['riot', 'data-scroll-animation'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.riot, global.dataScrollAnimation));
}(this, (function (riot, ScrollAnimation) { 'use strict';

    riot.install(component => {
        if (!component.hasDataScrollAnimation) {
            return component;
        }

        const onMounted = component.onMounted;
        component.onMounted = (props, state) => {
            onMounted && onMounted.call(component, props, state);
            ScrollAnimation.add(component.root);
        };
        const onUnmounted = component.onUnmounted;
        component.onUnmounted = (props, state) => {
            ScrollAnimation.remove(component.root);
            onUnmounted && onUnmounted.call(component, props, state);
        };
        const onUpdated = component.onUpdated;
        component.onUpdated = (props, state) => {
            onUpdated && onUpdated.call(component, props, state);
            ScrollAnimation.add(component.root);
        };
        return component;
    });

})));
