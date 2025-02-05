import React from 'react';
import { Button } from './ui/button';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { collection, deleteDoc, getDocs } from 'firebase/firestore';

const FirebaseClearButton = () => {
    const handleClearFirebase = async () => {
        if (!window.confirm("Tem certeza que deseja limpar todos os dados do Firebase?")) {
            return;
        }

        try {
            const collectionsToDelete = ["orders", "tables", "menu", "menu_items", "categories"];

            for (const collectionName of collectionsToDelete) {
                const querySnapshot = await getDocs(collection(db, collectionName));
                querySnapshot.forEach(doc => {
                    deleteDoc(doc.ref);
                });
                console.log(`Collection ${collectionName} cleared`);
            }

            alert("Dados do Firebase limpos com sucesso!");
            window.location.reload();

        } catch (error) {
            console.error("Erro ao limpar o Firebase:", error);
            alert("Erro ao limpar o Firebase.");
        }
    };

    return (
        <Button variant="destructive" onClick={handleClearFirebase}>
            Limpar Dados Firebase
        </Button>
    );
};

export default FirebaseClearButton;
