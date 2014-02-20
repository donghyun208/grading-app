angular.module('gradeServices', [])

    // Dropbox service exposes client and datastoreManager objects
    .factory('Dropbox', function() {
        var authenticate = function() {
            var client = new Dropbox.Client({key: '8rgn4aadulsnccd'});
            client.authenticate({interactive: false}, function (error) {
                if (error) {
                    alert('Authentication error: ' + error);
                }
            });
            return client;
        };
        return {
            client: function(callback) {
                var client = authenticate();
                callback(client);
            },
            getDatastore: function(callback) {
                var client = authenticate();
                var datastoreManager = client.getDatastoreManager();
                datastoreManager.openDefaultDatastore(function (error, datastore) {
                    if (error) {
                        alert('Error opening default datastore: ' + error);
                    }
                    callback(datastore);
                });
            }
        };
    });