const MongoGetMessages = async (db, room) => {
    if (!db) {
        console.log("Błąd połączenia z bazą danych");
        return [];
    }
    try {
        const messagesCollection = db.collection("messages");
        const messages = await messagesCollection.find({ room }).limit(10).toArray(); // Dodajemy `await`
        return messages;
    } catch (error) {
        console.log("Błąd pobierania wiadomości:", error);
        return [];
    }
};
