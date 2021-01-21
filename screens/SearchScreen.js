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

export default class SearchScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      search: "",
      allTransactions: [],
      lastTransaction: null,
    };
  }

  componentDidMount = async () => {
    const query = await db.collection("transactions").limit(10).get();
    query.docs.map((doc) => {
      this.setState({
        allTransactions: [],
        lastTransaction: doc,
      })
    })
  }

  searchTransactions = async (text) => {
    var enteredText = text.split("");
    if (enteredText[0].toUpperCase() === "B") {
      const transactionRef = await db.collection("transactions").where("bookID", "==", text).get()
      transactionRef.docs.map((doc) => {
        this.setState({
          allTransactions: [...this.state.allTransactions, doc.data()],
          lastTransaction: doc,
        })
      })
    } else if (enteredText[0].toUpperCase() === "S") {
      const transactionRef = await db.collection("transactions").where("studentID", "==", text).get()
      transactionRef.docs.map((doc) => {
        this.setState({
          allTransactions: [...this.state.allTransactions, doc.data()],
          lastTransaction: doc,
        })
      })
    }
  }

  fetchTransactions = async () => {
    var text = this.state.search.toUpperCase()
    var enteredText = text.split("");
    if (enteredText[0].toUpperCase() === "B") {
      const transactionRef = await db.collection("transactions").where("bookID", "==", text).startAfter(this.state.lastTransaction).limit(10).get()
      transactionRef.docs.map((doc) => {
        this.setState({
          allTransactions: [...this.state.allTransactions, doc.data()],
          lastTransaction: doc,
        })
      })
    } else if (enteredText[0].toUpperCase() === "S") {
      const transactionRef = await db.collection("transactions").where("studentID", "==", text).startAfter(this.state.lastTransaction).limit(10).get()
      transactionRef.docs.map((doc) => {
        this.setState({
          allTransactions: [...this.state.allTransactions, doc.data()],
          lastTransaction: doc,
        })
      })
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.bar}
            placeholder="Search Student ID or Book ID"
            onChangeText={(text) => {
              this.setState({
                search: text,
              });
            }}
          ></TextInput>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => {
              this.searchTransactions(this.state.search);
            }}
          >
            <Text>Search</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={this.state.allTransactions}
          renderItem={({ item }) => (
            <View style={{ borderBottomWidth: 2 }}>
              <Text>{" BookID: " + item.bookID}</Text>
              <Text>{" StudentID: " + item.studentID}</Text>
              <Text>{" TransactionType: " + item.transactionType}</Text>
              <Text>{" Date: " + item.date.toDate()}</Text>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
          onEndReached={this.fetchTransactions}
          onEndReachedThreshold={0.7}
        ></FlatList>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
  },
  searchBar: {
    flexDirection: "row",
    height: 40,
    width: "auto",
    borderWidth: 0.5,
    alignItems: "center",
    marginTop: 50,
  },
  searchButton: {
    borderWidth: 1,
    height: 30,
    width: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "green",
  },
  bar: {
    borderWidth: 2,
    height: 30,
    width: 300,
    paddingLeft: 10,
  },
});
