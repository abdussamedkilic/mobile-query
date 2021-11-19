import React from 'react';
import {StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.header}>
        <Text style={styles.title}> Kocaeli University Computer Engineering Yazlab2 Project2 </Text>
    </View>
  );
}

const styles = StyleSheet.create({
    header: {
        height: 100,
        paddingTop: 30,
        backgroundColor: 'coral'
    },
    title: {
        textAlign: 'center',
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    
});