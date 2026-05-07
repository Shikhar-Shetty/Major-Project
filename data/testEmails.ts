export const phishingEmails = [
  `Subject: Urgent PayPal Security Alert\n\nWe detected unauthorized access to your PayPal account. Verify your identity immediately: http://paypa1.com/verify to restore full account access.`,
  `Subject: Amazon - Account Verification Required\n\nYour Amazon account has been flagged for suspicious activity. Confirm your details: http://amaz0n-verify.xyz/account-security`,
  `Subject: Critical: Apple ID Account Lock\n\nYour Apple ID will be permanently locked. Verify now: https://apple-id-security.xyz/confirm-identity`,
  `Subject: Microsoft 365 - Immediate Action Required\n\nYour Microsoft account has expired. Renew subscription: http://microsoft-account-verify.xyz/renew`,
  `Subject: Bank of America - Account Under Review\n\nYour BofA account requires immediate verification. Click here: http://verify-bofa-security.xyz/account-review`,
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
