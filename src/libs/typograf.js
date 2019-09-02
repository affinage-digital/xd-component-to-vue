// https://github.com/Spearance/jQuery.Typograf.js

const options = {
    leftQuote: "«",
    rightQuote: "»",
    handler: "",
    restor: ""
};

const typografText = text => {
    return text
        // Minus
        .replace(/\u0020-(\d)/g, "\u0020−$1")

        // Dash
        .replace(/(^|\n|\s|>)\-(\s)/g, "$1—$2")

        // Double hyphen
        .replace(/\-{2} /g, "— ")

        // Multiple nbsp
        .replace(/\u00a0{2,}|\u00a0\u0020|\u0020\u00a0/g, "\u00a0")

        // HTML-comment
        .replace(/<!—/ig, function(){
            caretPosition++;
            return "<!--";
        })

        // Numerical interval
        .replace(/(\d)(\u0020)?[-—](\u0020)?(\d)/g, function(str, $1, $2, $3, $4){
            // if ($2 == "\u0020") { caretPosition-- }
            // if ($3 == "\u0020") { caretPosition-- }
            return $1 + "–" + $4;
        })

        // Copyright
        .replace(/\([cс]\)/ig, "©")

        // Registered trademark
        .replace(/\(r\)/ig, "®")

        // Trademark
        .replace(/\(tm\)/ig, "™")

        // Rouble
        .replace(/\([рp]\)/ig, "₽")

        // Three dots
        .replace(/\.{3}/g, "…")

        // Sizes
        .replace(/(\d)[xх](\d)/ig, "$1×$2")

        // Open quote
        .replace(/\"([a-z0-9\u0410-\u042f\u0401…])/ig, options.leftQuote + "$1")

        // Close quote
        .replace(/([a-z0-9\u0410-\u042f\u0401…?!])\"/ig, "$1" + options.rightQuote)

        // Open quote
        .replace(new RegExp("\"(" + options.leftQuote + "[a-z0-9\u0410-\u042f\u0401…])", "ig"), options.leftQuote + "$1")

        // Close quote
        .replace(new RegExp("([a-z0-9\u0410-\u042f\u0401…?!]" + options.rightQuote + ")\"", "ig"), "$1" + options.rightQuote)

        // Fix HTML open quotes
        .replace(new RegExp("([-a-z0-9]+=)" +
                            "["   + options.leftQuote + options.rightQuote + "]" +
                            "([^" + options.leftQuote + options.rightQuote + "]*?)", "ig"),
                 "$1\"$2")

        // Fix HTML close quotes
        .replace(new RegExp("([-a-z0-9]+=)[\"]" +
                            "([^>" + options.leftQuote + options.rightQuote + "]*?)" +
                            "["   + options.leftQuote + options.rightQuote + "]", "ig"),
                 "$1\"$2\"")
                 
        // Degree
        .replace(new RegExp("([0-6]?[0-9])[\'\′]([0-6]?[0-9])?(\\d+)" +
                            "[" + options.rightQuote + "\"]", "g"), 
                 "$1\′$2$3\″")
        
        // Prepositions
        .replace(new RegExp("((?:^|\n|\t|[\u00a0\u0020]|>)[A-Z\u0410-\u042f\u0401]{1,2})\u0020", "ig"), 
                 "$1\u00a0")

        .replace(/\-(то|ка)\u00a0/gi, "-$1\u0020")

        .replace(new RegExp("(?:\s|\t|[\u00a0\u0020])(же?|л[иь]|бы?|ка)([.,!?:;])?\u00a0", "ig"), 
                 "\u00a0$1$2\u0020");
};

exports.typografText = typografText;