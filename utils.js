exports.handleResquestResponse = function(error, body, onSuccess, onError) {
    if (error) {
        onError(500);
    } else {
        if (typeof body == 'object') onSuccess(body);
        else if (typeof body == 'string') {
            try {
                var bodyJson = JSON.parse(body);
                onSuccess(bodyJson);
            } catch (e) {
                if (body.indexOf('Unauthorized') > -1) onError(401); else onError(500);
            }
        } else {
            onError(500);
        }
    }
};