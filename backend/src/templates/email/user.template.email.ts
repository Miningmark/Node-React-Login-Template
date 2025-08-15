export const getEmailChangedInfoEmailTemplate = (
    websiteName: string,
    username: string,
    oldEmail: string,
    newEmail: string,
    changeTime: string
) => `
<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8">
    <title>E-Mail-Adresse geändert</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f0f2f5;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f2f5; padding:20px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff; border-radius:10px; padding:40px 30px; font-family:Segoe UI, Roboto, sans-serif; color:#333333; box-shadow:0 8px 20px rgba(0,0,0,0.06);">
            <tr>
              <td align="center" style="font-size:24px; color:#2c3e50; font-weight:bold; padding-bottom:20px;">
                E-Mail-Adresse bei <span style="color:#4A90E2;">${websiteName}</span> geändert
              </td>
            </tr>
            <tr>
              <td style="font-size:16px; line-height:1.6; padding-bottom:20px; text-align:center;">
                Hallo <strong>${username}</strong>,<br><br>
                wir bestätigen dir, dass die E-Mail-Adresse deines Kontos aktualisiert wurde.
              </td>
            </tr>
            <tr>
              <td style="font-size:14px; line-height:1.6; background-color:#f9f9f9; border-radius:6px; padding:20px;">
                <strong>Vorher:</strong> ${oldEmail}<br />
                <strong>Neu:</strong> ${newEmail}<br />
                <strong>Datum &amp; Uhrzeit:</strong> ${changeTime}
              </td>
            </tr>
            <tr>
              <td style="font-size:14px; line-height:1.8; padding-top:20px; text-align:center;">
                Wenn du diese Änderung <strong>nicht</strong> selbst vorgenommen hast, sichere bitte umgehend dein Konto,
                indem du dein Passwort änderst.Prüfe außerdem deine aktiven Sitzungen und letzten Logins.
              </td>
            </tr>
            <tr>
              <td align="center" style="font-size:12px; color:#999999; padding-top:40px;">
                Wenn die Änderung von dir stammt, kannst du diese E-Mail ignorieren.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
