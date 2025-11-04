    import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

const COLLECTION_NAME = 'mantenimientos';

export const getMantenimientos = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('fecha', 'desc'));
    const querySnapshot = await getDocs(q);
    const mantenimientos = [];
    querySnapshot.forEach((doc) => {
      mantenimientos.push({ id: doc.id, ...doc.data() });
    });
    return mantenimientos;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const getMantenimientosByEquipo = async (equipoId) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('equipoId', '==', equipoId),
      orderBy('fecha', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const mantenimientos = [];
    querySnapshot.forEach((doc) => {
      mantenimientos.push({ id: doc.id, ...doc.data() });
    });
    return mantenimientos;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const createMantenimiento = async (mantenimientoData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...mantenimientoData,
      fecha: new Date(mantenimientoData.fecha),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, ...mantenimientoData };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const updateMantenimiento = async (mantenimientoId, mantenimientoData) => {
  try {
    const mantenimientoRef = doc(db, COLLECTION_NAME, mantenimientoId);
    await updateDoc(mantenimientoRef, {
      ...mantenimientoData,
      fecha: new Date(mantenimientoData.fecha),
      updatedAt: new Date()
    });
    return { id: mantenimientoId, ...mantenimientoData };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const deleteMantenimiento = async (mantenimientoId) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, mantenimientoId));
    return mantenimientoId;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};