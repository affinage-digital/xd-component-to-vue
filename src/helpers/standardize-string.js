const standardizeString = string => {
    return string.toLowerCase().replace(/\ /g, '-').replace(/\r?\n|\r/g, '');
};

exports.standardizeString = standardizeString;
