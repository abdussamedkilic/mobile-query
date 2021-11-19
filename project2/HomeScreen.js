import React, { useState, Component } from 'react';
import { TouchableOpacity, StyleSheet, Text, View, Alert } from 'react-native';
import Header from './components/header';

// import firebase from '@react-native-firebase/app'

const Separator = () => (
  <View style={styles.separator} />
);

export default class HomeScreen extends Component {
  constructor(props) {
    super(props);
  }
  
  onClickQuery1 = () => {
    console.log("pressed query1");
    const {navigation} = this.props;
    navigation.navigate('Details', { id: 'query1' })
  }

   onClickQuery2 = () => {
    console.log("pressed query2");
    const {navigation} = this.props;
    navigation.navigate('Details', { id: 'query2' })
   }

   onClickQuery3 = () => {
     console.log("pressed query3");
    const {navigation} = this.props;
    navigation.navigate('Details', { id: 'query3' })
   }

  render() {
    return (

      <View style={styles.container}>
        {/* header */}
        <Header />
        <View style={styles.content}>
          {/* to form */}
          <View style={styles.list}>
            {/* en kötü buradaki düşüncem şöyle Scrool View içerisinde almak
              eğer komple container view'den itibaren silip sıfır bir görünüş getiremiyorsam */}
            <Separator />
            <TouchableOpacity
              style={styles.button}
              onPress={this.onClickQuery1}
            >
              <Text style={styles.buttonText}>Query 1</Text>
            </TouchableOpacity>
            <Separator />

            <Separator />
            <TouchableOpacity
              style={styles.button}
              onPress={this.onClickQuery2}
            >
              <Text style={styles.buttonText}>Query 2</Text>
            </TouchableOpacity>
            <Separator />

            <Separator />
            <TouchableOpacity
              style={styles.button}
              onPress={this.onClickQuery3}
            >
              <Text style={styles.buttonText}>Query 3</Text>
            </TouchableOpacity>
            <Separator />

          </View>

        </View>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 40,
  },
  list: {
    marginTop: 20,
  },
  separator: {
    marginVertical: 16,
    borderBottomColor: '#737373',
    borderBottomWidth: 1,
  },
  button: {
    alignItems: 'center',
    backgroundColor: 'coral',
    padding: 10
  },
  buttonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  }
});