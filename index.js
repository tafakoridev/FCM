/**
 * Firebase Cloud Messaging (FCM) can be used to send messages to clients on iOS, Android and Web.
 *
 * This sample uses FCM to send two types of messages to clients that are subscribed to the `news`
 * topic. One type of message is a simple notification message (display message). The other is
 * a notification message (display notification) with platform specific customizations. For example,
 * a badge is added to messages that are sent to iOS devices.
 */
const https = require('https');
const { google } = require('googleapis');

const PROJECT_ID = 'vpnorder-a78ad';
const HOST = 'fcm.googleapis.com';
const PATH = '/v1/projects/' + PROJECT_ID + '/messages:send';
const MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
const SCOPES = [MESSAGING_SCOPE];
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Use bodyParser middleware to parse JSON in the request body
app.use(bodyParser.json());

// Your existing code for FCM functions here...

// Route for handling the POST request
app.post('/api/sendFcmMessage', (req, res) => {
  // Extract title and body from the request body
  const { title, body } = req.body;

  // Build a message with the provided title and body
  const customMessage = buildCustomMessage(title, body);

  // Send the FCM message
  sendFcmMessage(customMessage);

  // Send a response
  res.status(200).json({ message: 'FCM message sent successfully!', RetVal: true });
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// Function to build a custom FCM message with the provided title and body
function buildCustomMessage(title, body) {
  return {
    message: {
      topic: 'news',
      notification: {
        title,
        body,
      },
    },
  };
}

/**
 * Get a valid access token.
 */
// [START retrieve_access_token]
function getAccessToken() {
  return new Promise(function(resolve, reject) {
    const key = require('./vpnorder-a78ad-firebase-adminsdk-q6srt-e272488786.json');
    const jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      SCOPES,
      null
    );
    jwtClient.authorize(function(err, tokens) {
      if (err) {
        reject(err);
        return;
      }
      resolve(tokens.access_token);
    });
  });
}
// [END retrieve_access_token]

/**
 * Send HTTP request to FCM with given message.
 *
 * @param {object} fcmMessage will make up the body of the request.
 */
function sendFcmMessage(fcmMessage) {
  getAccessToken().then(function(accessToken) {
    const options = {
      hostname: HOST,
      path: PATH,
      method: 'POST',
      // [START use_access_token]
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
      // [END use_access_token]
    };

    const request = https.request(options, function(resp) {
      resp.setEncoding('utf8');
      resp.on('data', function(data) {
        console.log('Message sent to Firebase for delivery, response:');
        console.log(data);
      });
    });

    request.on('error', function(err) {
      console.log('Unable to send message to Firebase');
      console.log(err);
    });

    request.write(JSON.stringify(fcmMessage));
    request.end();
  });
}

/**
 * Construct a JSON object that will be used to customize
 * the messages sent to iOS and Android devices.
 */
function buildOverrideMessage() {
  const fcmMessage = buildCommonMessage();
  const apnsOverride = {
    'payload': {
      'aps': {
        'badge': 1
      }
    },
    'headers': {
      'apns-priority': '10'
    }
  };

  const androidOverride = {
    'notification': {
      'click_action': 'POST_CLICK'
    }
  };

  fcmMessage['message']['android'] = androidOverride;
  fcmMessage['message']['apns'] = apnsOverride;

  return fcmMessage;
}

// /**
//  * Construct a JSON object that will be used to define the
//  * common parts of a notification message that will be sent
//  * to any app instance subscribed to the news topic.
//  */
// function buildCommonMessage() {
//   return {
//     'message': {
//       'topic': 'news',
//       'notification': {
//         'title': 'سلام بر شما',
//         'body': 'شما شما شما',
//       }
//     }
//   };
// }

// const message = process.argv[2];
// if (message && message == 'common-message') {
//   const commonMessage = buildCommonMessage();
//   console.log('FCM request body for message using common notification object:');
//   console.log(JSON.stringify(commonMessage, null, 2));
//   sendFcmMessage(buildCommonMessage());
// } else if (message && message == 'override-message') {
//   const overrideMessage = buildOverrideMessage();
//   console.log('FCM request body for override message:');
//   console.log(JSON.stringify(overrideMessage, null, 2));
//   sendFcmMessage(buildOverrideMessage());
// } else {
//   console.log('Invalid command. Please use one of the following:\n'
//       + 'node index.js common-message\n'
//       + 'node index.js override-message');
// }