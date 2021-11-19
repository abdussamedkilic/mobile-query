  
import database, { firebase } from '@react-native-firebase/database';

const firebaseConfig = {
    // * Ur firebase config code
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export { firebase, database };