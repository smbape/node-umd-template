module.exports = waitTimeout;

var flow = protractor.promise.controlFlow();

function waitTimeout(ms) {
    return flow.execute(function() {
        var deferred = protractor.promise.defer();
        setTimeout(function() {
            deferred.fulfill();
        }, ms);
        return deferred.promise;
    });
}