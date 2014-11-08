'use strict';

var ENCRYPTION_METHOD_NONE = 0;
var ENCRYPTION_METHOD_STARTTLS = 1;
var ENCRYPTION_METHOD_TLS = 2;

var appCtrl = require('../app-controller'),
    config = require('../app-config').config;

var SetCredentialsCtrl = function($scope, $location, $routeParams) {
    if (!appCtrl._auth && !$routeParams.dev) {
        $location.path('/'); // init app
        return;
    }

    var auth = appCtrl._auth;
    var doctor = appCtrl._doctor;

    //
    // Presets and Settings
    //

    var provider = $location.search().provider;
    $scope.hasProviderPreset = ($scope.state.login && $scope.state.login.mailConfig);
    $scope.useOAuth = !!auth.oauthToken;
    $scope.showDetails = (provider === 'custom');

    // set email address
    if ($scope.useOAuth) {
        $scope.emailAddress = auth.emailAddress;
    } else if ($scope.state.login) {
        $scope.emailAddress = $scope.state.login.emailAddress;
    }

    if ($scope.hasProviderPreset) {
        // use editable presets
        var mailConfig = $scope.state.login.mailConfig;

        // SMTP config
        $scope.smtpHost = mailConfig.smtp.hostname;
        $scope.smtpPort = parseInt(mailConfig.smtp.port, 10);
        // $scope.smtpCert = config[provider].smtp.ca;
        // $scope.smtpPinned = config[provider].smtp.pinned;

        // transport encryption method
        if (mailConfig.smtp.secure && !mailConfig.smtp.ignoreTLS) {
            $scope.smtpEncryption = ENCRYPTION_METHOD_TLS;
        } else if (!mailConfig.smtp.secure && !mailConfig.smtp.ignoreTLS) {
            $scope.smtpEncryption = ENCRYPTION_METHOD_STARTTLS;
        } else {
            $scope.smtpEncryption = ENCRYPTION_METHOD_NONE;
        }

        // IMAP config
        $scope.imapHost = mailConfig.imap.hostname;
        $scope.imapPort = parseInt(mailConfig.imap.port, 10);
        // $scope.imapCert = config[provider].imap.ca;
        // $scope.imapPinned = config[provider].imap.pinned;

        // transport encryption method
        if (mailConfig.imap.secure && !mailConfig.imap.ignoreTLS) {
            $scope.imapEncryption = ENCRYPTION_METHOD_TLS;
        } else if (!mailConfig.imap.secure && !mailConfig.imap.ignoreTLS) {
            $scope.imapEncryption = ENCRYPTION_METHOD_STARTTLS;
        } else {
            $scope.imapEncryption = ENCRYPTION_METHOD_NONE;
        }
    }

    $scope.test = function() {
        // parse the <select> dropdown lists
        var imapEncryption = parseInt($scope.imapEncryption, 10);
        var smtpEncryption = parseInt($scope.smtpEncryption, 10);

        // build credentials object
        var credentials = {
            provider: provider,
            emailAddress: $scope.emailAddress,
            username: $scope.username || $scope.emailAddress,
            realname: $scope.realname,
            password: $scope.password,
            xoauth2: auth.oauthToken,
            imap: {
                host: $scope.imapHost.toLowerCase(),
                port: $scope.imapPort,
                secure: imapEncryption === ENCRYPTION_METHOD_TLS,
                ignoreTLS: imapEncryption === ENCRYPTION_METHOD_NONE,
                ca: $scope.imapCert,
                pinned: !!$scope.imapPinned
            },
            smtp: {
                host: $scope.smtpHost.toLowerCase(),
                port: $scope.smtpPort,
                secure: smtpEncryption === ENCRYPTION_METHOD_TLS,
                ignoreTLS: smtpEncryption === ENCRYPTION_METHOD_NONE,
                ca: $scope.smtpCert,
                pinned: !!$scope.smtpPinned
            }
        };

        // use the credentials in the connection doctor
        doctor.configure(credentials);

        // run connection doctor test suite
        $scope.busy = true;
        doctor.check(function(err) {
            if (err) {
                // display the error in the settings UI
                $scope.connectionError = err;
            } else {
                // persists the credentials and forwards to /login
                auth.setCredentials(credentials);
                $location.path('/login');
            }

            $scope.busy = false;
            $scope.$apply();
        });
    };
};

module.exports = SetCredentialsCtrl;