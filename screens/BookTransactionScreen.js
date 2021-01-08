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

export default class TransactionScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      hasCameraPermissions: null,
      hasScanned: false,
      scannedBookID: "",
      scannedStudentID: "",
      buttonState: "normal",
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
});
