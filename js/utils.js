/**
 * Callback to apply animation to an element
 * @callback AnimationCallback
 * @param {HTMLElement} el - The element to which the animation will be applied.
 * @param {string} text - The text to be applied to the element during the animation.
 */

/**
 * Utility function to apply text to an element with optional animation. This is a placeholder function and should be implemented to handle the actual text application and animation logic.
 * @param {HTMLElement | string} el - The element to which the text will be applied.
 * @param {string} text - The text to be applied to the element.
 * @param {AnimationCallback} [animationCallback] - Optional callback function for custom animation logic.
 */
function applyText(el, text, animationCallback) {
    if (typeof el === 'string') {
        el = document.querySelector(el);
    }
    if (!el) {
        console.warn('Element not found for selector:', el);
        return;
    }

    if (el._lastSig === text) {
        return;
    }
    el._lastSig = text;

    // If not visible yet, just set text directly
    const currentOpacity = parseFloat(getComputedStyle(el).opacity);
    if (currentOpacity === 0) {
        el.innerText = text;
        return;
    }

    if (animationCallback) {
        animationCallback(el, text);
    } else {
        defaultTextAnimation(el, text);
    }
}

function defaultTextAnimation(el, text) {
    anime.createTimeline({
        easing: 'easeInOutQuad',
        duration: 500
    })
    .add(el, {
        opacity: [1, 0],
        translateY: ['0%', '-8%'],
        duration: 200
    }, 0)
    .add(el, {
        opacity: [0, 1],
        translateY: ['8%', '0%'],
        duration: 250,
        onBegin: function () {
            el.innerText = text;
        }
    }, 230);
}

/**
 * Utility function to get the text content of an element. If a string selector is provided, it will query the DOM for the element. If the element is not found, it will return an empty string and log a warning.
 * @param {HTMLElement | string} el - The element or selector from which to get the text content.
 * @returns {string} The text content of the element, or an empty string if the element is not found.
 */
function getFieldValue(el) {
    if (typeof el === 'string') {
        el = document.getElementById(el);
    }
    if (!el) {
        console.warn('Element not found for selector:', el);
        return '';
    }
    return (''+(el.textContent || el.innerText || ''))
        .replace('none', '')
        .replace('null', '')
        .replace('undefined', '')
        .trim();
}
