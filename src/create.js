"use-strict";
const AWS = require("aws-sdk");
const sns = new AWS.SNS({ region: process.env.REGION });

// function to send message to mobile number
async function sendMessage(phoneNumber, message) {
  return;
  sns.publish(
    {
      Message: message,
      PhoneNumber: phoneNumber,
      MessageStructure: "string",
      MessageAttributes: {
        "AWS.SNS.SMS.SenderID": {
          DataType: "String",
          StringValue: "AMPLIFY",
        },
        "AWS.SNS.SMS.SMSType": {
          DataType: "String",
          StringValue: "Transactional",
        },
      },
    },
    function (err, data) {
      if (err) {
        console.log(err.stack);
        console.log(data);
        return;
      }
      return data;
    }
  );
}

exports.handler = async (event) => {
  let otp_code;
  let message;

  // if user has no session send new code
  if (!event.request.session || !event.request.session.length) {
    // otp_code = Date.now().toString().slice(-4);
    otp_code = "1234";
    message = `Your OTP for Login - ${otp_code}`;

    // sending the sms
    try {
      await sendMessage(event.request.userAttributes.phone_number, message);
    } catch (err) {
      console.log(err);
    }
  }

  // else re-use code generated in previous challenge
  else {
    const previousChallenge = event.request.session.slice(-1)[0];
    otp_code = previousChallenge.challengeMetadata.match(/CODE-(\d*)/)[1];
  }

  // add the secret login code to the private challenge parameters
  // so it can be verified by the "Verify Auth Challenge Response" trigger
  event.response.privateChallengeParameters = { otp_code };

  // add the secret login code to the session so it is available
  // in a next invocation of the "Create Auth Challenge" trigger
  event.response.challengeMetadata = `CODE-${otp_code}`;

  return event;
};
