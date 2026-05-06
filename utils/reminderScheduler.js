const { Resend } = require("resend");
const MedicineReminder = require("../models/MedicineReminder");
const User = require("../models/User");

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Calculate upcoming reminder times within 72 hours from a given date
 * @param {Object} reminder - MedicineReminder document
 * @param {Date} fromDate - Starting date for calculation (defaults to now)
 * @returns {Array} Array of Date objects for upcoming reminders
 */
function calculateNextReminderTimes(reminder, fromDate = new Date()) {
  const upcomingTimes = [];
  const now = new Date(fromDate);
  const endLimit = new Date(now.getTime() + 72 * 60 * 60 * 1000); // 72 hours from now

  // Don't schedule beyond reminder end date
  const effectiveEnd = new Date(Math.min(endLimit.getTime(), reminder.endDate.getTime()));

  for (let date = new Date(now); date <= effectiveEnd; date.setDate(date.getDate() + 1)) {
    // Skip dates before start date
    if (date < reminder.startDate) continue;

    // Check if this date is within the reminder period
    if (date >= reminder.startDate && date <= reminder.endDate) {
      reminder.times.forEach(time => {
        const [hours, minutes] = time.split(':').map(Number);
        const reminderTime = new Date(date);
        reminderTime.setHours(hours, minutes, 0, 0);

        // Only include future times
        if (reminderTime > now && reminderTime <= effectiveEnd) {
          upcomingTimes.push(new Date(reminderTime));
        }
      });
    }
  }

  return upcomingTimes.sort((a, b) => a - b);
}

/**
 * Schedule a reminder email using Resend API
 * @param {Object} reminder - MedicineReminder document
 * @param {Object} user - User document
 * @param {Date} scheduledTime - When to send the email
 * @returns {String} Resend email ID
 */
async function scheduleReminderEmail(reminder, user, scheduledTime) {
  try {
    const data = await resend.emails.send({
      from: process.env.FROM_EMAIL || "noreply@mediconnect.com",
      to: user.email,
      subject: `Medicine Reminder: ${reminder.medicineName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1976d2;">Medicine Reminder</h2>
          <p>This is a reminder to take your medicine:</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0; color: #333;">${reminder.medicineName}</h3>
            <p style="margin: 10px 0 0 0; color: #666;">Dosage: ${reminder.dosage}</p>
            <p style="margin: 10px 0 0 0; color: #666;">Scheduled at: ${scheduledTime.toLocaleTimeString()}</p>
          </div>
          <p style="color: #666; font-size: 14px;">Please take your medicine on time for better health.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">MediConnect - Your Health Companion</p>
        </div>
      `,
      scheduled_at: scheduledTime.toISOString()
    });

    console.log(`Email scheduled for ${user.email} at ${scheduledTime.toISOString()}:`, JSON.stringify(data, null, 2));
    // For scheduled emails, Resend might not return an ID immediately
    // We'll use a generated ID or handle this differently
    const emailId = data.id || data.messageId || `scheduled_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return emailId;
  } catch (error) {
    console.error(`Failed to schedule email for ${user.email}:`, error);
    throw error;
  }
}

/**
 * Cancel scheduled emails using their IDs
 * @param {Array} emailIds - Array of Resend email IDs to cancel
 */
async function cancelScheduledEmails(emailIds) {
  const cancelPromises = emailIds.map(async (emailId) => {
    try {
      await resend.emails.cancel(emailId);
      console.log(`Cancelled scheduled email: ${emailId}`);
    } catch (error) {
      console.error(`Failed to cancel email ${emailId}:`, error);
    }
  });

  await Promise.all(cancelPromises);
}

/**
 * Schedule all upcoming emails for a reminder within 72 hours
 * @param {Object} reminder - MedicineReminder document
 * @param {Object} user - User document
 * @returns {Array} Array of scheduled email objects
 */
async function scheduleReminderEmails(reminder, user) {
  const upcomingTimes = calculateNextReminderTimes(reminder);
  const scheduledEmails = [];

  for (const scheduledTime of upcomingTimes) {
    try {
      const emailId = await scheduleReminderEmail(reminder, user, scheduledTime);
      scheduledEmails.push({
        emailId,
        scheduledTime
      });
    } catch (error) {
      console.error(`Failed to schedule email for time ${scheduledTime}:`, error);
    }
  }

  return scheduledEmails;
}

module.exports = {
  calculateNextReminderTimes,
  scheduleReminderEmail,
  cancelScheduledEmails,
  scheduleReminderEmails
};
