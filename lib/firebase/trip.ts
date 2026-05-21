import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { updateDoc, arrayUnion } from "firebase/firestore";

import { db } from "@/firebase/config";
import { type TripResponse } from "@/lib/api-client";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

export const saveTripToFirestore = async (
  tripData: NonNullable<TripResponse["trip"]>,
  userId: string,
) => {
  try {
    const docRef = await addDoc(collection(db, "trips"), {
      ...tripData,
      userId,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getTripFromFirestore = async (id: string) => {
  try {
    const docRef = doc(db, "trips", id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getUserTrips = async (userId: string) => {
  try {
    const q = query(
      collection(db, "trips"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteTripFromFirestore = async (tripId: string) => {
  try {
    await deleteDoc(doc(db, "trips", tripId));
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const saveChatMessage = async (tripId: string, message: ChatMessage) => {
  try {
    const docRef = doc(db, "trips", tripId);

    await updateDoc(docRef, {
      chatMessages: arrayUnion(message),
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateTripsInFirestore = async (
  tripId: string,
  updatedData: object,
) => {
  try {
    const docRef = doc(db, "trips", tripId);
    await updateDoc(docRef, updatedData);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
