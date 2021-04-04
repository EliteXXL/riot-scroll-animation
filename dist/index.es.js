import { install } from 'riot';
import * as ScrollAnimation from 'data-scroll-animation';

install(component => {
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
