import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

const COLLECTION_NAME = 'sucursales';

export const getSucursales = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const sucursales = [];
    querySnapshot.forEach((doc) => {
      sucursales.push({ id: doc.id, ...doc.data() });
    });
    return sucursales;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const getSucursalesByCliente = async (clienteId) => {
  try {
    const q = query(collection(db, COLLECTION_NAME), where('clienteId', '==', clienteId));
    const querySnapshot = await getDocs(q);
    const sucursales = [];
    querySnapshot.forEach((doc) => {
      sucursales.push({ id: doc.id, ...doc.data() });
    });
    return sucursales;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const createSucursal = async (sucursalData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...sucursalData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, ...sucursalData };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const updateSucursal = async (sucursalId, sucursalData) => {
  try {
    const sucursalRef = doc(db, COLLECTION_NAME, sucursalId);
    await updateDoc(sucursalRef, {
      ...sucursalData,
      updatedAt: new Date()
    });
    return { id: sucursalId, ...sucursalData };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const deleteSucursal = async (sucursalId) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, sucursalId));
    return sucursalId;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};