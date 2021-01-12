import firebase from 'firebase';
require("@firebase/firestore");

var firebaseConfig = {
    apiKey: "AIzaSyDK3L6jDYUxtZdpKNgmNdCvf3owCBm-GOA",
    authDomain: "wily-01000111.firebaseapp.com",
    projectId: "wily-01000111",
    storageBucket: "wily-01000111.appspot.com",
    messagingSenderId: "780402351542",
    appId: "1:780402351542:web:4066364d3194aee6827517"
  };
  

  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore();