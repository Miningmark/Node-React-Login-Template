export const getCompleteRegistrationEmailTemplate = (websiteName: string, username: string, url: string, expiryDate: string) => `
<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8">
    <title>Registrierung abschließen</title>
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
                vielen Dank für deine Registrierung!<br>
                Um deinen Account zu aktivieren, klicke bitte auf den folgenden Button:
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:20px 0;">
                <a href="${url}" style="background-color:#4A90E2; color:#ffffff; text-decoration:none; padding:14px 28px; border-radius:6px; font-size:16px; display:inline-block;">
                  Registrierung abschließen
                </a>
              </td>
            </tr>
            <tr>
              <td align="center" style="font-size:16px; line-height:1.6; padding-bottom:10px;">
                Falls der Button nicht funktioniert, kannst du den folgenden Link folgen:
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
                <strong>Wichtig:</strong> Dieser Link ist nur bis zum <strong>${expiryDate}</strong> gültig.<br>
                Wenn du deine Registrierung nicht bis dahin abschließt, wird dein Account automatisch gelöscht.
              </td>
            </tr>
            <tr>
              <td align="center" style="font-size:12px; color:#999999; padding-top:40px;">
                Du hast dich nicht registriert? Dann kannst du diese E-Mail einfach ignorieren.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

export const getAccountLockedEmailTemplate = (websiteName: string, username: string, url: string) => `
<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8">
    <title>Konto vorübergehend deaktiviert</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f0f2f5;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f2f5; padding:20px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff; border-radius:10px; padding:40px 30px; font-family:Segoe UI, Roboto, sans-serif; color:#333333; box-shadow:0 8px 20px rgba(0,0,0,0.06);">
            <tr>
              <td align="center" style="font-size:24px; color:#2c3e50; font-weight:bold; padding-bottom:20px;">
                Konto vorübergehend deaktiviert
              </td>
            </tr>
            <tr>
              <td align="center" style="font-size:16px; line-height:1.6; padding-bottom:20px;">
                Hallo <strong>${username}</strong>,<br><br>
                dein Konto bei <strong>${websiteName}</strong> wurde aufgrund mehrerer fehlgeschlagener Login-Versuche vorübergehend deaktiviert.
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:20px 0;">
                <a href="${url}" style="background-color:#4A90E2; color:#ffffff; text-decoration:none; padding:14px 28px; border-radius:6px; font-size:16px; display:inline-block;">
                  Erneut anmelden
                </a>
              </td>
            </tr>
            <tr>
              <td align="center" style="font-size:16px; line-height:1.6; padding-bottom:10px;">
                Falls der Button nicht funktioniert, kannst du den folgenden Link folgen:
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
              <td align="center" style="font-size:12px; color:#999999; padding-top:40px;">
                Du kannst diese E-Mail ignorieren, falls du deinen Account bereits erfolgreich reaktiviert hast.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

export const getSuspiciousLoginEmailTemplate = (websiteName: string, username: string, loginTime: string, ipAddress: string, country: string, region: string, url: string) => `
<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <title>Verdächtiger Login-Versuch</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f0f2f5;">
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="background-color:#f0f2f5; padding:20px 0;"
    >
      <tr>
        <td align="center">
          <table
            width="600"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="background-color:#ffffff; border-radius:10px; padding:40px 30px; font-family:Segoe UI, Roboto, sans-serif; color:#333333; box-shadow:0 8px 20px rgba(0,0,0,0.06);"
          >
            <tr>
              <td
                align="center"
                style="font-size:24px; color:#2c3e50; font-weight:bold; padding-bottom:20px;"
              >
                Verdächtiger Login-Versuch bei ${websiteName}
              </td>
            </tr>
            <tr>
              <td
                style="font-size:16px; line-height:1.6; padding-bottom:20px;"
              >
                Hallo <strong>${username}</strong>,<br /><br />
                Wir haben einen verdächtigen Login-Versuch auf deinem Konto
                festgestellt:
              </td>
            </tr>
            <tr>
              <td
                style="font-size:14px; line-height:1.6; padding-bottom:20px; background-color:#f9f9f9; border-radius:6px; padding:20px;"
              >
                <strong>Datum &amp; Uhrzeit:</strong> ${loginTime}<br />
                <strong>IP-Adresse:</strong> ${ipAddress}<br />
                <strong>Land:</strong> ${country}<br />
                <strong>Region:</strong> ${region}
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:20px 0;">
                <a
                  href="${url}"
                  style="background-color:#4A90E2; color:#ffffff; text-decoration:none; padding:14px 28px; border-radius:6px; font-size:16px; display:inline-block;"
                  >Passwort jetzt ändern</a
                >
              </td>
            </tr>
            <tr>
              <td
                align="center"
                style="font-size:16px; line-height:1.6; padding-bottom:10px;"
              >
                Falls der Button nicht funktioniert, kopiere folgenden Link in
                deinen Browser:
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:20px;">
                <a
                  href="${url}"
                  style="font-size:14px; color:#4A90E2; word-break:break-word; text-decoration:none;"
                  >${url}</a
                >
              </td>
            </tr>
            <tr>
              <td
                align="center"
                style="font-size:12px; color:#999999; padding-top:40px;"
              >
                Wenn du diesen Login-Versuch nicht erkannt hast, empfehlen wir
                dir dringend, dein Passwort zu ändern.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
