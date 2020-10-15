importScripts('https://www.gstatic.com/firebasejs/7.18.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.18.0/firebase-messaging.js');

firebase.initializeApp({
  apiKey: "AIzaSyCUAMI9U948aMMSaxvx2Efgn14eO3aAV88",
  authDomain: "some-df9e3.firebaseapp.com",
  databaseURL: "https://some-df9e3.firebaseio.com",
  projectId: "some-df9e3",
  storageBucket: "some-df9e3.appspot.com",
  messagingSenderId: "620088870437",
  appId: "1:620088870437:web:7fb2306d2a635f5877e1cc",
  measurementId: "G-213PZTB3C5"

});

const messaging = firebase.messaging();
messaging.setBackgroundMessageHandler(function(payload) {
  const title="hey chen"
  const options ={
    body:payload.data.status
  }
  return self.registration.showNotification(title,options)
})