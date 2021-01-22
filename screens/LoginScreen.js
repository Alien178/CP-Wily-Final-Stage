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
  FlatList,
} from "react-native";
import db from "../config";
import firebase from "firebase";

export default class LoginScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      emailID: "",
      password: "",
    };
  }

  login = async (emailID, password) => {
    if (emailID && password) {
        try {
            const response = await firebase.auth().signInWithEmailAndPassword(emailID, password)
            if (response) {
                this.props.navigation.navigate("Transaction");
            }
        } catch (error) {
            switch(error.code) {
                case "auth/user-not-found": Alert.alert("User Not Found")
                break;
                case "auth/invalid-email": Alert.alert("Incorrect Email ID")
                break;
            }
        }

    } else {
        Alert.alert("Please Enter Email ID/Password")
    }
  }

  render() {
    return (
      <KeyboardAvoidingView
        style={{ alignItems: "center", margin: 20 }}
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
        <View>
          <TextInput
            placeholder={"Email ID"}
            style={styles.loginBox}
            keyboardType={"email-address"}
            onChangeText={(text) => {
              this.setState({
                emailID: text,
              });
            }}
          ></TextInput>
          <TextInput
            placeholder={"Password"}
            style={styles.loginBox}
            secureTextEntry={true}
            onChangeText={(text) => {
              this.setState({
                password: text,
              });
            }}
          ></TextInput>
        </View>
        <View>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => {
              this.login(this.state.emailID, this.state.password);
            }}
          >
            <Text style={{ textAlign: "center", color: "white" }}>Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  loginBox: {
    width: 300,
    height: 40,
    borderWidth: 1.5,
    fontSize: 20,
    margin: 10,
    paddingLeft: 10,
  },
  loginButton: {
    height: 30,
    width: 90,
    borderWidth: 1,
    marginTop: 20,
    paddingTop: 5,
    borderRadius: 7,
    backgroundColor: "black",
  },
});
