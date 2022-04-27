var blacklist = ['{', '}', 'function','ook'];

exports.filter = function (str) {
    if(typeof str !=="string"){
        return 'no way';
    }
    for(var v in blacklist){
        if(str.includes(blacklist[v])){
            return 'no way';
        }
    }
    return str;
}

exports.safeCheck = async function () {
    return await new Promise(function (resolve) {
        setTimeout(resolve, 100);
    })
}