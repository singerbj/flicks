import * as firebase from 'firebase';
import 'firebase/auth';
import 'firebase/firestore';
import Hashids from 'hashids';
import firebaseConfig from './firebaseConfig';

export const hashids = new Hashids('$altyp3pp3rflick$', 8, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789');

// Initialize Firebase App
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

export const auth = firebase.auth();

const updateNumber = async () => {
    return db.runTransaction(async (transaction) => {
        let ref = db.collection("incremented_id").doc("incremented_id");
        let doc = await transaction.get(ref);
        var newValue = doc.data().value + 1;
        await transaction.update(ref, { value: newValue });
        return newValue;
    });
};

const updateShortCode = async (tries = 0) => {
    try {
        return await updateNumber();
    } catch (error) {
        if(tries < 10){
            return await new Promise((resolve) => {
                setTimeout(async () => {
                    resolve(await updateNum(tries + 1));
                }, 100);
            });
        } else {
            console.log(error);
        }
    }
};

const createOrUpdateUserDoc = async (name) => {
    if(firebase.auth().currentUser){
        return db.runTransaction(async (transaction) => {
            let ref = db.collection("users").doc(firebase.auth().currentUser.uid);
            let doc = await transaction.get(ref);
            if(!doc.data()) {
                await transaction.set(ref, {
                    name,
                    lastLogin: Date.now(),
                    likes: [],
                    dislikes: [],
                    lastLike: 0,
                    lastDislike: 0,
                    shortCode: null
                });
            }
            if(!doc.data() || !doc.data().shortCode){
                let shortCode = await updateShortCode();
                await transaction.update(ref, { shortCode });
            }
        });
    }
};
createOrUpdateUserDoc();

export const loginWithEmail = async (email, password) => {
    try {
        await auth.signInWithEmailAndPassword(email, password);
        await createOrUpdateUserDoc();
    } catch(e) {
        console.log(e);
    }
};

export const registerWithEmail = async (name, email, password) => {
    try {
        await auth.createUserWithEmailAndPassword(email, password);
        await createOrUpdateUserDoc(name);
    } catch(e) {
        console.log(e);
    }
};

export const logout = () => auth.signOut();

export const passwordReset = email => auth.sendPasswordResetEmail(email);

export const getUser = async () => {
    return await db.collection("users").doc(firebase.auth().currentUser.uid).get();
};

export const likeMedia = (mediaId) => {
    return db.collection("users").doc(firebase.auth().currentUser.uid).update({
        lastLike: Date.now(),
        likes: firebase.firestore.FieldValue.arrayUnion(mediaId)
    });
};

export const dislikeMedia = (mediaId) => {
    return db.collection("users").doc(firebase.auth().currentUser.uid).update({
        lastDislike: Date.now(),
        dislikes: firebase.firestore.FieldValue.arrayUnion(mediaId)
    });
};

export const addPartner = async (shortCode) => {
    const querySnapshot = await db.collection("users").where("shortCode", "==", parseInt(hashids.decode(shortCode), 10)).limit(1).get();
    return db.runTransaction(async (transaction) => {
        if(querySnapshot.empty){
            throw "Error finding user with Shortcode: " + shortCode;
        } else {
            let otherUserRef = db.collection("users").doc(querySnapshot.docs[0].id);
            let currentUserRef = db.collection("users").doc(firebase.auth().currentUser.uid);
            let otherUserDoc = await transaction.get(otherUserRef);
            let currentUserDoc = await transaction.get(currentUserRef);
            if(!currentUserDoc.data().partner && !otherUserDoc.data().partner){
                await transaction.update(currentUserRef, {
                    partner: otherUserDoc.id
                });
            }
        }
    });
};