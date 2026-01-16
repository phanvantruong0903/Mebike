import { meiliClient } from './client';

export const addDocument = async (index: string, document: any) => {
  try {
    await meiliClient.index(index).addDocuments([document]);
  } catch (error) {
    console.error(error);
  }
};

export const updateDocument = async (index: string, document: any) => {
  try {
    await meiliClient.index(index).updateDocuments([document]);
  } catch (error) {
    console.error(error);
  }
};

export const deleteDocument = async (index: string, document: any) => {
  try {
    await meiliClient.index(index).deleteDocuments([document]);
  } catch (error) {
    console.error(error);
  }
};

export const deleteAllDocument = async (index: string) => {
  try {
    await meiliClient.index(index).deleteAllDocuments();
  } catch (error) {
    console.error(error);
  }
};

export const searchDocument = async (index: string, query: string) => {
  try {
    await meiliClient.index(index).search(query);
  } catch (error) {
    console.error(error);
  }
};
