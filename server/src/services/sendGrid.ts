// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs

import sgMail from '@sendgrid/mail'

export default async function sendReminder(
  apiKey: string,
  todoTitle: string,
  recipientEmail: string
) {
  sgMail.setApiKey(apiKey)
  const msg = {
    to: recipientEmail,
    from: 'vilius@vilius.net',
    subject: `Reminder about ${todoTitle}`,
    html: `<strong>The end of the day is near and you still didn't do ${todoTitle}</strong>`,
  }

  sgMail
    .send(msg)
    .then(() => {
      console.log(`Email sent: ${msg.html}`)
    })
    .catch((error) => {
      console.error(error)
    })
}
