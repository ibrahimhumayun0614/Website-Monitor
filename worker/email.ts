export async function sendDowntimeAlert(siteName: string, siteUrl: string, toEmail: string): Promise<void> {
  const mailchannelsApiUrl = 'https://api.mailchannels.net/tx/v1/send';
  const emailBody = {
    personalizations: [
      {
        to: [{ email: toEmail }],
      },
    ],
    from: {
      email: 'alerts@website-monitor.app',
      name: 'Website Monitor Alerts',
    },
    subject: `[Alert] Your site "${siteName}" is down!`,
    content: [
      {
        type: 'text/html',
        value: `
          <html>
            <body style="font-family: sans-serif; line-height: 1.6;">
              <h2>Website Downtime Alert</h2>
              <p>This is an automated notification to inform you that your monitored website, <strong>${siteName}</strong>, is currently down.</p>
              <ul>
                <li><strong>Site Name:</strong> ${siteName}</li>
                <li><strong>URL:</strong> <a href="${siteUrl}">${siteUrl}</a></li>
                <li><strong>Time of Detection:</strong> ${new Date().toUTCString()}</li>
              </ul>
              <p>We will continue to monitor the site and will notify you if its status changes.</p>
              <p>— The Website Monitor Team</p>
            </body>
          </html>
        `,
      },
    ],
  };
  try {
    const response = await fetch(mailchannelsApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailBody),
    });
    if (response.status === 202) {
      console.log(`Downtime alert for ${siteName} successfully sent to ${toEmail}.`);
    } else {
      const errorBody = await response.text();
      console.error(`Failed to send downtime alert for ${siteName}. MailChannels API responded with status ${response.status}: ${errorBody}`);
    }
  } catch (error) {
    console.error(`Error sending downtime alert for ${siteName} via MailChannels:`, error);
  }
}