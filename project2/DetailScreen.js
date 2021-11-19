
import React, { Component, useState, useEffect } from 'react';
import { Text, View, StyleSheet, PermissionsAndroid, Platform } from 'react-native';
import { firebase, database } from './config';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections, { MapData } from 'react-native-maps-directions';


export default class DetailScreen extends Component {
  constructor(props) {
    super(props);
    // Burada this.setState()'i çağırmayınız!
    this.state = { arr: [], q2Arr: [], LPUaddress: '', LDOaddress: '', SPUaddress: '', SDOaddress: '', GOOGLE_API_KEY: 'ur google api key', positionstack_key: "ur positionstack key" };
  }

  Query1 = async () => {

    let firstFiveElement = await database()
      .ref('/taxi_data/')
      .orderByChild('trip_distance')
      .limitToLast(5)
      .once('value');


    let snapshotArr = [];
    firstFiveElement.forEach((stateSnapshot) => {
      snapshotArr.push({
        trip_distance: stateSnapshot.val().trip_distance,
        tpep_pickup_datetime: stateSnapshot.val().tpep_pickup_datetime,
        tpep_dropoff_datetime: stateSnapshot.val().tpep_dropoff_datetime
      })
    });
    this.setState({ arr: snapshotArr });
    return {};
  };

  Query2 = async () => {

    let elements = await database()
      .ref('/taxi_data/')
      .once('value');

    let snapshotArr = [];
    elements.forEach((stateSnapshot) => {
      snapshotArr.push({
        total_amount: stateSnapshot.val().total_amount,
        tpep_pickup_datetime: stateSnapshot.val().tpep_pickup_datetime,
      })
    });
    // total_amount - total_travel finding day by day
    let tempArr = [];
    for (j = 0; j < 31; j++) {
      tempArr.push({
        total_amount: 0,
        total_travel: 0
      })
    }

    for (i = 0; i < snapshotArr.length; i++) {
      let date = snapshotArr[i].tpep_pickup_datetime.split(" "); // toString() before split if i need
      let ymd = date[0].split("-");
      let day = Number(ymd[2]);
      let index = day - 1
      tempArr[index].total_amount += snapshotArr[i].total_amount;
      tempArr[index].total_travel += 1;
    }

    //finding avg amount day by day
    let avg = [];
    for (k = 0; k < 31; k++) {
      avg[k] = tempArr[k].total_amount / tempArr[k].total_travel;
    }

    // ** find smallest 2 number index **//
    let copyAvg = [];
    copyAvg.push(...avg.map(obj => obj));
    copyAvg.sort((a, b) => { return a - b });
    let firstSmallestNumValue = copyAvg[0];
    let secondSmallestNumValue = copyAvg[1];
    let firstSmallestNumIndex = 32;
    let secondSmallestNumIndex = 32;

    for (l = 0; l < 31; l++) {
      if (avg[l] == firstSmallestNumValue) firstSmallestNumIndex = l;
      else if (avg[l] == secondSmallestNumValue) secondSmallestNumIndex = l;
    }
    console.log("firstSmallestNumIndex: " + firstSmallestNumIndex);
    console.log("secondSmallestNumIndex: " + secondSmallestNumIndex);

    if (secondSmallestNumIndex < firstSmallestNumIndex) {
      let temp = firstSmallestNumIndex;
      firstSmallestNumIndex = secondSmallestNumIndex;
      secondSmallestNumIndex = temp;
    }
    let result = []

    for (l = firstSmallestNumIndex; l <= secondSmallestNumIndex; l++) {
      result.push({
        day: l,
        avg_amount: avg[l].toFixed(4)
      });
    }

    console.log(result.length);
    this.setState({ q2Arr: result });
    console.log('success');
    return {};
  }

  Query3 = async () => {
    // part1 --> taxi_data'dan oku, min 3 yolcusu olan en kısa ve en uzun yolu ata
    let taxiElements = await database()
      .ref('/taxi_data/')
      .orderByChild('trip_distance')
      .once('value');


    let taxiSnapshotArr = [];
    taxiElements.forEach((stateSnapshot) => {
      taxiSnapshotArr.push({
        passenger_count: stateSnapshot.val().passenger_count,
        DOLocationID: stateSnapshot.val().DOLocationID, // drop-off
        PULocationID: stateSnapshot.val().PULocationID, // pick-up
        trip_distance: stateSnapshot.val().trip_distance
      })
    });

    let shortest_distance;
    let longest_distance;
    for (i = 0; i < taxiSnapshotArr.length; i++) {
      if (taxiSnapshotArr[i].passenger_count >= 3) {
        shortest_distance = taxiSnapshotArr[i];
        break;
      }
    }

    for (i = taxiSnapshotArr.length - 1; i > -1; i--) {
      if (taxiSnapshotArr[i].passenger_count >= 3) {
        longest_distance = taxiSnapshotArr[i];
        break;
      }
    }
    console.log("longest distance : " + longest_distance.trip_distance + " - passanger count:" + longest_distance.passenger_count);
    console.log("shortest distance : " + shortest_distance.trip_distance + " - passanger count:" + shortest_distance.passenger_count);

    // part2 --> zone_lookup'dan oku, en kısa ve en uzun yolun karşılığını öğren
    let zone_lookupElements = await database()
      .ref('/zone_lookup/')
      .once('value');


    let zoneSnapshotArr = [];
    zone_lookupElements.forEach((stateSnapshot) => {
      zoneSnapshotArr.push({
        LocationID: stateSnapshot.val().LocationID,
        Zone: stateSnapshot.val().Zone, // zone + borough = place
        Borough: stateSnapshot.val().Borough,
        service_zone: stateSnapshot.val().service_zone
      })
    });
    // PU --> pick-up , DO --> drop-off
    // + Adresleri birleştirme zone + borough
    let zoneLongest_distance = { PUaddress: 0, DOaddress: 0 };
    let zoneShortest_distance = { PUaddress: 0, DOaddress: 0 };

    for (i = 0; i < zoneSnapshotArr.length; i++) {
      if (longest_distance.PULocationID == zoneSnapshotArr[i].LocationID) {
        zoneLongest_distance.PUaddress = (zoneSnapshotArr[i].Zone + " " + zoneSnapshotArr[i].Borough).toString();
      }
      if (longest_distance.DOLocationID == zoneSnapshotArr[i].LocationID) {
        zoneLongest_distance.DOaddress = (zoneSnapshotArr[i].Zone + " " + zoneSnapshotArr[i].Borough).toString();
      }
      if (shortest_distance.PULocationID == zoneSnapshotArr[i].LocationID) {
        zoneShortest_distance.PUaddress = (zoneSnapshotArr[i].Zone + " " + zoneSnapshotArr[i].Borough).toString();
      }
      if (shortest_distance.DOLocationID == zoneSnapshotArr[i].LocationID) {
        zoneShortest_distance.DOaddress = (zoneSnapshotArr[i].Zone + " " + zoneSnapshotArr[i].Borough).toString();
      }
    }


    // adresleri koordinata çevirme
    let zoneLongest_distanceCoordinate = {
      PUcoordinate: await fetch(`http://api.positionstack.com/v1/forward?access_key=${this.state.positionstack_key}`
        + '&query=' + zoneLongest_distance.PUaddress + '&output=json')
        .then(response => response.json())
        .then(result => {
          let data = result.data;
          let res = { latitude: data[0].latitude, longitude: data[0].longitude };
          return res;
        }),
      DOcoordinate: await fetch(`http://api.positionstack.com/v1/forward?access_key=${this.state.positionstack_key}`
        + '&query=' + zoneLongest_distance.DOaddress + '&output=json')
        .then(response => response.json())
        .then(result => {
          let data = result.data;
          let res = { latitude: data[0].latitude, longitude: data[0].longitude };
          return res;
        })
    }

    let zoneShortest_distanceCoordinate = {
      PUcoordinate: await fetch(`http://api.positionstack.com/v1/forward?access_key=${this.state.positionstack_key}`
        + '&query=' + zoneShortest_distance.PUaddress + '&output=json')
        .then(response => response.json())
        .then(result => {
          let data = result.data;
          let res = { latitude: data[0].latitude, longitude: data[0].longitude };
          return res;
        }),
      DOcoordinate: await fetch(`http://api.positionstack.com/v1/forward?access_key=${this.state.positionstack_key}`
        + '&query=' + zoneShortest_distance.DOaddress + '&output=json')
        .then(response => response.json())
        .then(result => {
          let data = result.data;
          let res = { latitude: data[0].latitude, longitude: data[0].longitude };
          return res;
        })
    }

    console.log("zoneShortest_distanceCoordinate PU (Lat- lon) : " + zoneShortest_distanceCoordinate.PUcoordinate.latitude + " , "
      + zoneShortest_distanceCoordinate.PUcoordinate.longitude);
    console.log("zoneShortest_distanceCoordinate DO (Lat- lon) : " + zoneShortest_distanceCoordinate.DOcoordinate.latitude + " , "
      + zoneShortest_distanceCoordinate.DOcoordinate.longitude);
    console.log("zoneLongest_distanceCoordinate PU  (Lat- lon) : " + zoneLongest_distanceCoordinate.PUcoordinate.latitude + " , "
      + zoneLongest_distanceCoordinate.PUcoordinate.longitude);
    console.log("zoneLongest_distanceCoordinate DO  (Lat- lon) : " + zoneLongest_distanceCoordinate.DOcoordinate.latitude + " , "
      + zoneLongest_distanceCoordinate.DOcoordinate.longitude);

    this.setState({ LPUaddress: zoneLongest_distance.PUaddress });
    this.setState({ LDOaddress: zoneLongest_distance.DOaddress });
    this.setState({ SPUaddress: zoneShortest_distance.PUaddress });
    this.setState({ SDOaddress: zoneShortest_distance.DOaddress });
    console.log('longest PU : ' + zoneLongest_distance.PUaddress);
    console.log('longest DO : ' + zoneLongest_distance.DOaddress);
    console.log('shortest PU : ' + zoneShortest_distance.PUaddress);
    console.log('shortest DO : ' + zoneShortest_distance.DOaddress);
  }

  componentDidMount = () => {
    const { id } = this.props.route.params;

    if (Platform.OS === 'android') {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    }

    if (id == "query1") {
      this.Query1();
    } else if (id == "query2") {
      this.Query2();
    } else if (id == "query3") {
      this.Query3();
    }
  }

  renderQuery1() {
    const arr = this.state.arr;
    const fields = [];
    for (let i = arr.length - 1; i > -1; i--) {
      // Try avoiding the use of index as a key, it has to be unique!
      fields.push(
        <View key={"guest_" + i} style={styles.border}>
          <Text style={styles.text}> Trip Distance: {arr[i].trip_distance} </Text>
          <Text style={styles.text}> TPEP Pickup Datetime: {arr[i].tpep_pickup_datetime} </Text>
          <Text style={styles.text}> TPEP Dropoff Datetime: {arr[i].tpep_dropoff_datetime} </Text>
        </View>
      );
    }
    return fields;
  }

  renderQuery2 = () => {
    const q2Arr = this.state.q2Arr;
    const fields = [];
    for (let i = 0; i < q2Arr.length; i++) {
      fields.push(
        <View key={"guest2_" + i} style={styles.border}>
          <Text style={styles.text}>Day: {q2Arr[i].day} - Avg Amount: {q2Arr[i].avg_amount}</Text>
        </View>
      );
    }

    return fields;
  }

  render() {
    const { id } = this.props.route.params;

    var tmp = [];
    if (id == 'query1') {
      tmp = this.renderQuery1();
    } else if (id == 'query2') {
      tmp = this.renderQuery2();
    } else if (id == 'query3') {
      //tmp = this.renderQuery3();
      const shortestPU = this.state.SPUaddress;
      const shortestDo = this.state.SDOaddress;
      const longestPU = this.state.LPUaddress;
      const longestDO = this.state.LDOaddress;
      if (shortestPU !== undefined || shortestPU !== null || shortestPU !== ''
      || shortestDo !== undefined || shortestDo !== null || shortestDo !== ''
      || longestPU !== undefined || longestPU !==null || longestPU !==''
      || longestDO !== undefined || longestDO !==null || longestDO !== ''){
        return(
          <View style={{ flex: 1, flexDirection: 'column' }} key={'query3'}>
          <MapView provider={PROVIDER_GOOGLE}
            style={{ flex: 10 }}
            initialRegion={{
              latitude: 40.777048,
              longitude: -73.967596,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}>
            <MapViewDirections
              provider={PROVIDER_GOOGLE} // remove if not using Google Maps
              origin={shortestPU} //string isim PU ismi 
              destination={shortestDo}
              apikey={this.state.GOOGLE_API_KEY}
              strokeWidth={3}
              strokeColor="red"
              onReady={result => {
                console.log(result.coordinates);
              }}
            />
            <MapViewDirections
              provider={PROVIDER_GOOGLE} // remove if not using Google Maps
              origin={longestPU} //string isim PU ismi 
              destination={longestDO}
              apikey={this.state.GOOGLE_API_KEY}
              strokeWidth={3}
              strokeColor="blue"
              onReady={result => {
                console.log(result.coordinates);
              }}
            />
          </MapView>
        </View>
        )
      }
    }

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {tmp}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#eaeaea"
  },
  text: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },
  border: {
    marginTop: 12,
    padding: 6,
    borderRadius: 8,
    color: "#666",
    backgroundColor: "coral"
  },
})