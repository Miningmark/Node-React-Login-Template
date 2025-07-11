export const getCompleteAdminRegistrationEmailTemplate = (websiteName: string, username: string, url: string, expiryDate: string) => `
<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8">
    <title>Dein Konto wurde erstellt</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f0f2f5;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f2f5; padding:20px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff; border-radius:10px; padding:40px 30px; font-family:Segoe UI, Roboto, sans-serif; color:#333333; box-shadow:0 8px 20px rgba(0,0,0,0.06);">
            <tr>
              <td align="center" style="font-size:24px; color:#2c3e50; font-weight:bold; padding-bottom:20px;">
                Willkommen bei <span style="color:#4A90E2;">${websiteName}</span>
              </td>
            </tr>
            <tr>
              <td align="center" style="font-size:16px; line-height:1.6; padding-bottom:20px;">
                Hallo <strong>${username}</strong>,<br><br>
                Ein Administrator hat ein Konto für dich bei <strong>${websiteName}</strong> erstellt.<br>
                Um dich anzumelden, musst du zunächst ein Passwort festlegen.
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:20px 0;">
                <a href="${url}" style="background-color:#4A90E2; color:#ffffff; text-decoration:none; padding:14px 28px; border-radius:6px; font-size:16px; display:inline-block;">
                  Passwort festlegen
                </a>
              </td>
            </tr>
            <tr>
              <td align="center" style="font-size:16px; line-height:1.6; padding-bottom:10px;">
                Falls der Button nicht funktioniert, verwende bitte folgenden Link:
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:20px;">
                <a href="${url}" style="font-size:14px; color:#4A90E2; word-break:break-word; text-decoration:none;">
                  ${url}
                </a>
              </td>
            </tr>
            <tr>
              <td align="center" style="font-size:14px; line-height:1.6; padding-top:10px; color:#333333;">
                <strong>Hinweis:</strong> Der Link ist bis zum <strong>${expiryDate}</strong> gültig.<br>
                Danach ist eine erneute Anmeldung notwendig.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
