import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
} from "react-native";
import * as Permissions from "expo-permissions";
import { BarCodeScanner } from "expo-barcode-scanner";
import db from "../config";
import firebase from "firebase";

export default class TransactionScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      hasCameraPermissions: null,
      hasScanned: false,
      scannedBookID: "",
      scannedStudentID: "",
      buttonState: "normal",
      transactionMessage: "",
    };
  }

  getCameraPermissions = async (ID) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);

    this.setState({
      hasCameraPermissions: status === "granted",
      buttonState: ID,
      hasScanned: false,
    });
  };

  handleBarCodeScanned = async ({ type, data }) => {
    const buttonState = this.state.buttonState;
    if (buttonState == "BookID") {
      this.setState({
        hasScanned: true,
        scannedBookID: data,
        buttonState: "normal",
      });
    } else if (buttonState == "StudentID") {
      this.setState({
        hasScanned: true,
        scannedStudentID: data,
        buttonState: "normal",
      });
    }
  };

  handleTransaction = async () => {
    var transactionMessage = null;
    db.collection("books")
      .doc(this.state.scannedBookID)
      .get()
      .then((doc) => {
        var book = doc.data();
        if (book.bookAvailability) {
          this.initiateBookIssue();
          transactionMessage = "Book Issued";
        } else {
          this.initiateBookReturn();
          transactionMessage = "Book Returned";
        }
      });

      this.setState({
        transactionMessage: transactionMessage
      })
  };

  initiateBookIssue = async () => {
    db.collection("transactions").add({
      studentID: this.state.scannedStudentID,
      bookID: this.state.scannedBookID,
      date: firebase.firestore.Timestamp.now().toDate(),
      transactionType: "Issue",
    })
    db.collection("books").doc(this.state.scannedBookID).update({
      bookAvailability: false,
    })
    db.collection("students").doc(this.state.scannedStudentID).update({
      booksIsued: firebase.firestore.FieldValue.increment(1)
    })
    this.setState({
      scannedBookID: "",
      scannedStudentID: "",
    })
  }

  initiateBookReturn = async () => {
    db.collection("transactions").add({
      studentID: this.state.scannedStudentID,
      bookID: this.state.scannedBookID,
      date: firebase.firestore.Timestamp.now().toDate(),
      transactionType: "Return",
    })
    db.collection("books").doc(this.state.scannedBookID).update({
      bookAvailability: true,
    })
    db.collection("students").doc(this.state.scannedStudentID).update({
      booksIsued: firebase.firestore.FieldValue.increment(-1)
    })
    this.setState({
      scannedBookID: "",
      scannedStudentID: "",
    })
  }

  render() {
    const hasCameraPermissions = this.state.hasCameraPermissions;
    const hasScanned = this.state.hasScanned;
    const buttonState = this.state.buttonState;

    if (buttonState !== "normal" && hasCameraPermissions) {
      return (
        <BarCodeScanner
          onBarCodeScanned={hasScanned ? undefined : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      );
    } else if (buttonState === "normal") {
      return (
        <View style={styles.container}>
          <View>
            <Image
              source={require("../assets/booklogo.jpg")}
              style={{ width: 200, height: 200 }}
            />
            <Text style={{ textAlign: "center", fontSize: 30 }}>WILY</Text>
          </View>
          <View style={{ flexDirection: "row", margin: 20 }}>
            <TextInput
              style={styles.inputBox}
              placeholder={"Book ID"}
              value={this.state.scannedBookID}
            />
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => {
                this.getCameraPermissions("BookID");
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  textAlign: "center",
                  marginTop: 10,
                  fontWeight: "bold",
                }}
              >
                Scan BookID
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: "row", margin: 20 }}>
            <TextInput
              style={styles.inputBox}
              placeholder={"Student ID"}
              value={this.state.scannedStudentID}
            />
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => {
                this.getCameraPermissions("StudentID");
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  textAlign: "center",
                  marginTop: 10,
                  fontWeight: "bold",
                }}
              >
                Scan StudentID
              </Text>
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity
              onPress={() => {
                var transactionMessage = this.handleTransaction();
              }}
              style={styles.submitButton}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "bold",
                  color: "black",
                  textAlign: "center",
                  padding: 10,
                }}
              >
                Submit
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  inputBox: {
    width: 200,
    height: 40,
    borderWidth: 2,
    borderRightWidth: 0,
    fontSize: 20,
  },
  scanButton: {
    backgroundColor: "#3E9BB5",
    width: 50,
    height: 40,
    borderWidth: 2,
    borderLeftWidth: 0,
  },
  submitButton: {
    backgroundColor: "green",
    width: 100,
    height: 50,
  },
});
