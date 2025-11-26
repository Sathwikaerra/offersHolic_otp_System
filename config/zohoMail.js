import { SendMailClient } from "zeptomail";
import dotenv from "dotenv";

dotenv.config();

// Set the URL and token for the ZeptoMail API
const url = process.env.ZOHO_URL;
const token = process.env.ZOHO_TOKEN;

const {
  ZEPTO_MAIL_TEMPLATE_OTP,
  ZEPTO_MAIL_TEMPLATE_VERIFICATION_SUCCESS,
  ZEPTO_MAIL_TEMPLATE_WELCOME,
  ZEPTO_MAIL_TEMPLATE_NEW_FOLLOWER,
  ZEPTO_MAIL_TEMPLATE_PAYMENT_CONFIRM,
  ZEPTO_MAIL_TEMPLATE_OFFER_UNDER_REVIEW,
  ZEPTO_MAIL_TEMPLATE_OFFER_REJECTED,
  ZEPTO_MAIL_TEMPLATE_OFFERS_CLICK,
  ZEPTO_MAIL_TEMPLATE_OFFER_PUBLISHED,
  ZEPTO_MAIL_TEMPLATE_OFFER_EXPIRY,
  ZEPTO_MAIL_TEMPLATE_LOGIN_SUCCESS,
  ZEPTO_MAIL_TEMPLATE_BUSINESS_PROFILE_CREATED,
} = process.env;

// Initialize the SendMailClient with the URL and token
let client = new SendMailClient({ url, token });

const extractNameFromEmail = (email) => {
  const namePart = email?.split("@")[0];
  //if no email make it user
  if (!namePart) return "User";
  return namePart.charAt(0).toUpperCase() + namePart.slice(1);
};


export const sendEmailWithTemplate = async (toAddress, toName, subject, templateKey, mergeInfo = {}) => {
    const name = toName || extractNameFromEmail(toAddress);
    console.log("Sending email to:", toAddress, "with name:", name, "subject:", subject, "templateKey:", templateKey, "mergeInfo:", mergeInfo);
    const emailDetails = {
        mail_template_key: templateKey,
        from: {
            address: "noreply@zephyrapps.in",
            name: "OffersHolic"
        },
        to: [
            {
                email_address: {
                    address: toAddress,
                    name: name
                }
            }
        ],
        subject: subject,
        merge_info: mergeInfo

    };

    try {
        const resp = await client.sendMail(emailDetails);
        console.log("Email sent successfully:", resp);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

export const sendOtpEmail = async (toAddress, userName, otp) => {

    const name = userName || extractNameFromEmail(toAddress);
    const subject = "Your One Time Password for OffersHolic";

    const templateKey = ZEPTO_MAIL_TEMPLATE_OTP
    const mergeInfo = { otp: otp, username: name };
    await sendEmailWithTemplate(toAddress, name, subject, templateKey, mergeInfo);

};

//semd email for verification success
export const sendVerificationSuccessEmail = async (toAddress, userName) => {
  const name = userName || extractNameFromEmail(toAddress);
  const subject = "Email Verification Successfull";
  const templateKey = ZEPTO_MAIL_TEMPLATE_VERIFICATION_SUCCESS;
  const mergeInfo = { userName: name };
  await sendEmailWithTemplate(toAddress, name, subject, templateKey, mergeInfo);
};

//
//ZEPTO_MAIL_TEMPLATE_WELCOME
export const sendWelcomeEmail = async (toAddress, userName) => {
  const name = userName || extractNameFromEmail(toAddress);
  const subject = "Welcome to OffersHolic";
  const templateKey = ZEPTO_MAIL_TEMPLATE_WELCOME;
  const mergeInfo = { userName: name };
  await sendEmailWithTemplate(
    toAddress,
    userName,
    subject,
    templateKey,
    mergeInfo
  );
};

// export const sendWelcomeUserEmail = async (toAddress, userName) => {
//   const name = userName || extractNameFromEmail(toAddress);
//   const subject = "Welcome to OffersHolic";
//   const templateKey = ZEPTO_MAIL_TEMPLATE_WELCOME_USER;
//   const mergeInfo = { userName: name };
//   await sendEmailWithTemplate(
//     toAddress,
//     userName,
//     subject,
//     templateKey,
//     mergeInfo
//   );
// };

// ZEPTO_MAIL_TEMPLATE_NEW_FOLLOWER
export const sendNewFollowerAlertEmail = async (
  toAddress,
  userName,
  businessOwnerName,
  businessProfileName,
  url
) => {
  const name = userName || extractNameFromEmail(toAddress);
  const subject = `You have a new follower on ${businessProfileName}`;
  const templateKey = ZEPTO_MAIL_TEMPLATE_NEW_FOLLOWER;
  const mergeInfo = {
    businessProfileName: businessProfileName,
    businessOwnerName: businessOwnerName,
    userName: name,
    url: url,
  };

  await sendEmailWithTemplate(toAddress, name, subject, templateKey, mergeInfo);
};

// ZEPTO_MAIL_TEMPLATE_PAYMENT_CONFIRM
export const sendPaymentConfirm = async (toAddress, userName, url) => {
  const name = userName || extractNameFromEmail(toAddress);
  const subject = `PAYMENT CONFIRMATION FOR ${name}`;
  const templateKey = ZEPTO_MAIL_TEMPLATE_PAYMENT_CONFIRM;
  const mergeInfo = {
    userName: name,
    url: url,
  };

  await sendEmailWithTemplate(toAddress, name, subject, templateKey, mergeInfo);
};

// ZEPTO_MAIL_TEMPLATE_OFFER_UNDER_REVIEW
export const sendPendingReview = async (
  toAddress,
  userName,
  offerTitle,
  url
) => {
  const name = userName || extractNameFromEmail(toAddress);
  const subject = "Your Offer is under review";
  const templateKey = ZEPTO_MAIL_TEMPLATE_OFFER_UNDER_REVIEW;
  const mergeInfo = {
    offerTitle: offerTitle,
    url: url,
    userName: name,
  };

  await sendEmailWithTemplate(toAddress, name, subject, templateKey, mergeInfo);
};

// ZEPTO_MAIL_TEMPLATE_OFFER_REJECTED
export const sendOfferRejected = async (
  toAddress,
  userName,
  offerTitle,
  url
) => {
  const name = userName || extractNameFromEmail(toAddress);
  const subject = "Your Offer does not meet our guidelines";
  const templateKey = ZEPTO_MAIL_TEMPLATE_OFFER_REJECTED;
  const mergeInfo = {
    offerTitle: offerTitle,
    url: url,
    userName: name,
  };

  await sendEmailWithTemplate(toAddress, name, subject, templateKey, mergeInfo);
};

//   ZEPTO_MAIL_TEMPLATE_OFFERS_CLICK
export const sendOffersClick = async (toAddress, userName, url, offerTitle) => {
  const name = userName || extractNameFromEmail(toAddress);
  const subject = "Milestone Alert: Your Offer is getting clicks";
  const templateKey = ZEPTO_MAIL_TEMPLATE_OFFERS_CLICK;
  const mergeInfo = {
    userName: name,
    url: url,
    offerTitle: offerTitle,
  };

  await sendEmailWithTemplate(toAddress, name, subject, templateKey, mergeInfo);
};

// ZEPTO_MAIL_TEMPLATE_OFFER_PUBLISHED
export const sendOfferPublished = async (
  toAddress,
  userName,
  url,
  offerTitle
) => {
  const name = userName || extractNameFromEmail(toAddress);
  const subject = "Congratulations! Your Offer is now live";
  const templateKey = ZEPTO_MAIL_TEMPLATE_OFFER_PUBLISHED;
  const mergeInfo = {
    userName: name,
    url: url,
    offerTitle: offerTitle,
  };

  await sendEmailWithTemplate(toAddress, name, subject, templateKey, mergeInfo);
};

// ZEPTO_MAIL_TEMPLATE_OFFER_EXPIRY
export const sendOfferExpiry = async (
  toAddress,
  userName,
  expiryDate,
  url,
  offerTitle
) => {
  const name = userName || extractNameFromEmail(toAddress);
  const subject = "Your Offer on OffersHolic is about to expire";
  const templateKey = ZEPTO_MAIL_TEMPLATE_OFFER_EXPIRY;
  const mergeInfo = {
    userName: name,
    url: url,
    offerTitle: offerTitle,
    expiryDate: expiryDate,
  };

  await sendEmailWithTemplate(toAddress, name, subject, templateKey, mergeInfo);
};

// ZEPTO_MAIL_TEMPLATE_LOGIN_SUCCESS
export const sendLoginSuccess = async (toAddress, userName) => {
  const name = userName || extractNameFromEmail(toAddress);
  const subject = "New Login Detected";
  const templateKey = ZEPTO_MAIL_TEMPLATE_LOGIN_SUCCESS;
  const mergeInfo = {
    userName: name,
  };

  await sendEmailWithTemplate(toAddress, name, subject, templateKey, mergeInfo);
};

//   ZEPTO_MAIL_TEMPLATE_BUSINESS_PROFILE_CREATED
export const sendBusinessProfileCreated = async (toAddress, userName) => {
  const name = userName || extractNameFromEmail(toAddress);
  const subject = "New Business Profile Created";
  const templateKey = ZEPTO_MAIL_TEMPLATE_BUSINESS_PROFILE_CREATED;
  const mergeInfo = {
    userName: name,
  };

  await sendEmailWithTemplate(toAddress, name, subject, templateKey, mergeInfo);
};
