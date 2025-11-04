import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

const COLLECTION_NAME = 'equipos';

export const getEquipos = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const equipos = [];
    querySnapshot.forEach((doc) => {
      equipos.push({ id: doc.id, ...doc.data() });
    });
    return equipos;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const getEquiposBySucursal = async (sucursalId) => {
  try {
    const q = query(collection(db, COLLECTION_NAME), where('sucursalId', '==', sucursalId));
    const querySnapshot = await getDocs(q);
    const equipos = [];
    querySnapshot.forEach((doc) => {
      equipos.push({ id: doc.id, ...doc.data() });
    });
    return equipos;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const createEquipo = async (equipoData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...equipoData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, ...equipoData };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const updateEquipo = async (equipoId, equipoData) => {
  try {
    const equipoRef = doc(db, COLLECTION_NAME, equipoId);
    await updateDoc(equipoRef, {
      ...equipoData,
      updatedAt: new Date()
    });
    return { id: equipoId, ...equipoData };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const deleteEquipo = async (equipoId) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, equipoId));
    return equipoId;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};