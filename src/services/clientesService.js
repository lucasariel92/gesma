import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

const COLLECTION_NAME = 'clientes';

export const getClientes = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const clientes = [];
    
    querySnapshot.forEach((doc) => {
      clientes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return clientes;
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    throw error;
  }
};

export const createCliente = async (clienteData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...clienteData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return { id: docRef.id, ...clienteData };
  } catch (error) {
    console.error('Error al crear cliente:', error);
    throw error;
  }
};

export const updateCliente = async (clienteId, clienteData) => {
  try {
    const clienteRef = doc(db, COLLECTION_NAME, clienteId);
    await updateDoc(clienteRef, {
      ...clienteData,
      updatedAt: new Date()
    });
    
    return { id: clienteId, ...clienteData };
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    throw error;
  }
};

export const deleteCliente = async (clienteId) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, clienteId));
    return clienteId;
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    throw error;
  }
};