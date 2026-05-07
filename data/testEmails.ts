export const phishingEmails = [
  `Subject: Unauthorized Login Attempt\n\nWe noticed a login attempt from a new device. Verify your identity at https://bank-example.verify-login.com or your account will be locked.`,
  `Subject: Parcel Delivery Failed\n\nYour package cannot be delivered. Please confirm your details here: http://track-delivery.example.com/confirm`,
  `Subject: Password Reset Required\n\nWe've detected suspicious activity. Reset your password immediately: https://reset.example.com`,
  `Subject: Invoice Overdue\n\nYou have an overdue invoice. View details and pay now: http://invoices.example-pay.com`,
  `Subject: HR - Benefit Update\n\nPlease sign in to the company portal to review benefits: https://company-portal.example.com/login`,
];

export const legitEmails = [
  `Subject: Team Weekly Update\n\nHi all, here are the completed tasks and blockers for this week. No action required.`,
  `Subject: Meeting Invite\n\nPlease join the Teams meeting at 10:00 AM. Agenda attached.`,
  `Subject: Onboarding Documents\n\nWelcome to the team! Please find the employee handbook attached and complete the forms.`,
  `Subject: Lunch Order\n\nQuick poll: what would you like for lunch today? Reply with your choice.`,
  `Subject: Security Notice\n\nWe've scheduled a maintenance window for 02:00 AM. Services may be briefly unavailable.`,
];

export const sampleEmails = {
  phishing: phishingEmails,
  legit: legitEmails,
};

export default sampleEmails;
