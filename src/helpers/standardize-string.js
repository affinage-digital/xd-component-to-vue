const standardizeString = string => {
    return string.toLowerCase().replace(/\ /g, '-');
};

exports.standardizeString = standardizeString;
