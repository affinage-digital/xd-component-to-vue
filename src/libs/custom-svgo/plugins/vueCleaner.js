'use strict';

exports.type = 'perItem';

exports.active = false;

exports.description = 'removes styles, defs and sorted svg attributes';

exports.fn = function (item) {
    // change attr order
    if (item.isElem('svg')) {
        // remove attr style from svg tag
        if (item.hasAttr('style')) {
            item.removeAttr('style');
        }

        const attrs = [];
        const sorted = {};

        item.eachAttr(attr => attrs.push(attr));

        attrs.sort((a, b) => a.name < b.name ? -1 : 1);

        item.attrs = attrs.forEach(attr => {
            sorted[attr.name] = attr;
        });

        item.attrs = sorted;
    }

    // remove defs tag
    if (item.isElem('defs')) {
        return false;
    }
};
