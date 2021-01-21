import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  KeyboardAvoidingView,
  ToastAndroid,
  Alert,
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
    var transactionType = await this.checkBookEligibility();
    if (!transactionType) {
      Alert.alert("The Book does not Exist in the Library");
      this.setState({
        scannedBookID: "",
        scannedStudentID: "",
      });
    } else if (transactionType == "Issue") {
      var isStudentEligible = await this.checkStudentEligibilityForBookIssue();
      if (isStudentEligible) {
        this.initiateBookIssue();
        Alert.alert("Book has been Issued to the Student");
      }
    } else {
      var isStudentEligible = await this.checkStudentEligibilityForBookReturn();
      if (isStudentEligible) {
        this.initiateBookReturn();
        Alert.alert("Book has been Returned by the Student to the Library");
      }
    }
  };

  initiateBookIssue = async () => {
    db.collection("transactions").add({
      studentID: this.state.scannedStudentID,
      bookID: this.state.scannedBookID,
      date: firebase.firestore.Timestamp.now().toDate(),
      transactionType: "Issue",
    });
    db.collection("books").doc(this.state.scannedBookID).update({
      bookAvailability: false,
    });
    db.collection("students")
      .doc(this.state.scannedStudentID)
      .update({
        booksIssued: firebase.firestore.FieldValue.increment(1),
      });
    this.setState({
      scannedBookID: "",
      scannedStudentID: "",
    });
  };

  initiateBookReturn = async () => {
    db.collection("transactions").add({
      studentID: this.state.scannedStudentID,
      bookID: this.state.scannedBookID,
      date: firebase.firestore.Timestamp.now().toDate(),
      transactionType: "Return",
    });
    db.collection("books").doc(this.state.scannedBookID).update({
      bookAvailability: true,
    });
    db.collection("students")
      .doc(this.state.scannedStudentID)
      .update({
        booksIssued: firebase.firestore.FieldValue.increment(-1),
      });
    this.setState({
      scannedBookID: "",
      scannedStudentID: "",
    });
  };

  checkBookEligibility = async () => {
    const bookRef = await db
      .collection("books")
      .where("bookID", "==", this.state.scannedBookID)
      .get();
    var transactionType = "";
    if (bookRef.docs.length == 0) {
      transactionType = false;
    } else {
      bookRef.docs.map((doc) => {
        var book = doc.data();
        if (book.bookAvailability) {
          transactionType = "Issue";
        } else {
          transactionType = "Return";
        }
      });
    }

    return transactionType;
  };

  checkStudentEligibilityForBookIssue = async () => {
    const studentRef = await db
      .collection("students")
      .where("studentID", "==", this.state.scannedStudentID)
      .get();
    var isStudentEligible = "";
    if (studentRef.docs.length == 0) {
      isStudentEligible = false;
      this.setState({
        scannedStudentID: "",
        scannedBookID: "",
      });
      Alert.alert("The Student ID does not exist");
    } else {
      studentRef.docs.map((doc) => {
        var student = doc.data();
        if (student.booksIssued < 2) {
          isStudentEligible = true;
        } else {
          isStudentEligible = false;
          this.setState({
            scannedStudentID: "",
            scannedBookID: "",
          });
          Alert.alert("The student has reached max number of Books Issued");
        }
      });
    }

    return isStudentEligible;
  };

  checkStudentEligibilityForBookReturn = async () => {
    const transactionRef = await db
      .collection("transactions")
      .where("bookID", "==", this.state.scannedBookID)
      .limit(1)
      .get();
    var isStudentEligible = "";
    transactionRef.docs.map((doc) => {
      var transaction = doc.data();
      if (transaction.studentID == this.state.scannedStudentID) {
        isStudentEligible = true;
      } else {
        isStudentEligible = false;
        this.setState({
          scannedStudentID: "",
          scannedBookID: "",
        });
        Alert.alert("The book is not Issed by the Student");
      }
    });

    return isStudentEligible;
  };

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
        <KeyboardAvoidingView
          style={styles.container}
          behavior={"padding"}
          enabled
        >
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
              onChangeText={(text) => {
                this.setState({
                  scannedBookID: text,
                });
              }}
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
              onChangeText={(text) => {
                this.setState({
                  scannedStudentID: text,
                });
              }}
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
        </KeyboardAvoidingView>
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
