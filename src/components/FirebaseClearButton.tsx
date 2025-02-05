import React from 'react';
import { Button } from './ui/button';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { collection, deleteDoc, getDocs, writeBatch } from 'firebase/firestore';

const FirebaseClearButton = () => {
    const handleClearFirebase = async () => {
        if (!window.confirm("Tem certeza que deseja limpar todos os dados do Firebase?")) {
            return;
        }

        try {
            const collectionsToDelete = ["Pedidos", "statusdemesa"];

            for (const collectionName of collectionsToDelete) {
                const batch = writeBatch(db);
                const querySnapshot = await getDocs(collection(db, collectionName));

                querySnapshot.forEach(doc => {
                    batch.delete(doc.ref);
                });

                await batch.commit();
                console.log(`Collection ${collectionName} cleared using batch delete`);
            }

            alert("Dados do Firebase limpos com sucesso!");
            window.location.reload();

        } catch (error) {
            console.error("Erro geral ao limpar o Firebase:", error);
            alert("Erro geral ao limpar o Firebase. Veja o console para mais detalhes.");
        }
    };

    return (
        <Button variant="destructive" onClick={handleClearFirebase}>
            Limpar Dados Firebase
        </Button>
    );
};

export default FirebaseClearButton;
