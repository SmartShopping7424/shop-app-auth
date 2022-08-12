exports.handler = async (event) => {
  // if user is not registered
  if (event.request.userNotFound) {
    event.response.issueToken = false;
    event.response.failAuthentication = true;
  }

  // if user has entered wrong otp 3 times
  if (
    event.request.session.length >= 3 &&
    event.request.session.slice(-1)[0].challengeResult === false
  ) {
    event.response.issueToken = false;
    event.response.failAuthentication = true;
  }

  // if user has entered correct otp
  else if (
    event.request.session.length > 0 &&
    event.request.session.slice(-1)[0].challengeResult === true
  ) {
    event.response.issueTokens = true;
    event.response.failAuthentication = false;
  }

  // if user not yet received otp
  else {
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
    event.response.challengeName = "CUSTOM_CHALLENGE";
  }

  return event;
};
