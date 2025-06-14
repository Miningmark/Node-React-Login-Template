export default {
    deleteDatabaseOnStart: false,
    logDatabaseQuerries: true,
    logErrorsInsideConsole: true,
    sendEmails: false,
    seedDatabase: false,
    isDevServer: true,

    isRegisterEnable: true,
    isUsernameChangeEnable: true,

    backendPORT: 4000,
    apiVersion: "v1",

    frontendURL: "http://localhost:3000/",

    frontendURLAccountActivationToken: "account-activation?token=",
    accountActivationTokenExpiresIn: 3600, //seconds

    frontendURLPasswordResetToken: "password-reset?token=",
    passwordResetTokenExpiresIn: 3600 //seconds
};
