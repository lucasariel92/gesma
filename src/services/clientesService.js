import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { createSucursal, deleteSucursalesByCliente } from './sucursalesService';
import { getDoc } from 'firebase/firestore';


const COLLECTION_NAME = 'clientes';

export const getClientes = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const clientes = [];
    querySnapshot.forEach((doc) => {
      clientes.push({ id: doc.id, ...doc.data() });
    });
    return clientes;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const getClienteById = async (clienteId) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, clienteId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const createCliente = async (clienteData) => {
  try {
    // Crear cliente
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...clienteData,
      tieneSucursales: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const clienteId = docRef.id;

    // Auto-crear sucursal principal con los mismos datos del cliente
    await createSucursal({
      clienteId: clienteId,
      nombre: clienteData.nombre + ' - Sede Principal',
      direccion: clienteData.direccion || '',
      telefono: clienteData.telefono || '',
      esPrincipal: true
    });
    
    return { id: clienteId, ...clienteData };
  } catch (error) {
    console.error('Error:', error);
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
    console.error('Error:', error);
    throw error;
  }
};

export const deleteCliente = async (clienteId) => {
  try {
    // Eliminar sucursales asociadas
    await deleteSucursalesByCliente(clienteId);
    
    // Eliminar cliente
    await deleteDoc(doc(db, COLLECTION_NAME, clienteId));
    return clienteId;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};