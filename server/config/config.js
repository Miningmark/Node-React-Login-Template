import "dotenv/config";

export default {
    deleteDatabaseOnStart: process.env.deleteDatabaseOnStart === "true",
    logDatabaseQuerries: process.env.logDatabaseQuerries === "true",
    logErrorsInsideConsole: process.env.logErrorsInsideConsole === "true",
    sendEmails: process.env.sendEmails === "true",
    seedDatabase: process.env.seedDatabase === "true",
    isDevServer: process.env.isDevServer === "true",

    isRegisterEnable: process.env.isRegisterEnable === "true",
    isUsernameChangeEnable: process.env.isUsernameChangeEnable === "true",

    backendPort: Number(process.env.backendPort),
    apiVersion: process.env.apiVersion,

    superAdminPassword: process.env.superAdminPassword,

    frontendURL: process.env.frontendURL,

    frontendURLAccountActivationToken: process.env.frontendURLAccountActivationToken,
    accountActivationTokenExpiresIn: Number(process.env.accountActivationTokenExpiresIn),

    frontendURLPasswordResetToken: process.env.frontendURLPasswordResetToken,
    passwordResetTokenExpiresIn: Number(process.env.passwordResetTokenExpiresIn),

    frontendURLPasswordForgotten: process.env.frontendURLPasswordForgotten,

    passwordAccountCreatedByAdmin: process.env.passwordAccountCreatedByAdmin,
    accountCreatedByAdminExpiresIn: process.env.accountCreatedByAdminExpiresIn,

    allowedOrigins: JSON.parse(process.env.allowedOrigins),

    defaultDatabaseHost: process.env.defaultDatabaseHost,
    defaultDatabasePort: Number(process.env.defaultDatabasePort),
    defaultDatabaseUsername: process.env.defaultDatabaseUsername,
    defaultDatabasePassword: process.env.defaultDatabasePassword,
    defaultDatabaseName: process.env.defaultDatabaseName,

    emailUser: process.env.emailUser,
    emailPassword: process.env.emailPassword,

    accessTokenSecret: process.env.accessTokenSecret,
    accessTokenExpiration: Number(process.env.accessTokenExpiration),

    refreshTokenSecret: process.env.refreshTokenSecret,
    refreshTokenExpiration: Number(process.env.refreshTokenExpiration),

    serverVersion: "0.0.28"
};
