

const mongodbSaveMessage = async (db ,message, username, room, __createdtime__) => {
    if (!db){
        console.log("nie ma polaczenie z baza danych")
    }
    try{
        const messagesCollection = db.collection('messages')
        await messagesCollection.insertOne({
            message,
            username,
            room,
            __createdtime__,
        });
        console.log("wiadomosc zapisana poprawnie");
    }catch (err){
        console.log("error" + err);
    }
}
module.exports = mongodbSaveMessage ;