/**
 * Classes
 */

function containsClass(el, class_name) {
    if (!el || !el.class_name) {
        return false;
    }

    if (el.classList) {
        el.classList.contains(class_name);
    } else {
        new RegExp('(^| )' + class_name + '( |$)', 'gi').test(el.class_name);
    }
}

function addClass(el, class_name) {
    if (!el) {
        return false;
    }

    if (el.classList) {
        el.classList.add(class_name);
    } else {
        el.class_name += ' ' + class_name;
    }
}

function removeClass(el, class_name) {
    if (el.classList) {
        el.classList.remove(class_name);
    } else {
        el.class_name = el.class_name.replace(new RegExp('(^|\\b)' + class_name.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
}

function toggleClass(el, class_name) {
    if (el.classList) {
        el.classList.toggle(class_name);
    } else {
        var classes = el.class_name.split(' ');
        var existingIndex = classes.indexOf(class_name);

        if (existingIndex >= 0) {
            classes.splice(existingIndex, 1);
        } else {
            classes.push(class_name);
        }

        el.class_name = classes.join(' ');
    }
}



/**
 * Arrays
 */

function indexOf(array, item) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] === item) {
            return i;
        }
    }
    
    return -1;
}


/**
 * Element visibility
 */

function isHidden(el) {
    /**
     * Check if el is a jQuery object and if so return the native DOM element
     */
    el = (typeof el[0] === 'object') ? el[0] : el;

    return (el.offsetParent === null)
}