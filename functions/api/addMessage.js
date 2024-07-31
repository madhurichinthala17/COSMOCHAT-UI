const functions=require("firebase-functions");
const admin=require("firebase-admin");
const {logger} = functions;


exports.addMessage = functions.https.onCall(async (data, context)=>{
  try {
    logger.log("Received message request data:", data);

    // validating the data
    if (!data.text || !data.userId) {
      logger.log("Required fields are missing");
      throw new functions.https.HttpsError(
          "invalid-argument",
          "Required fields are missing",
      );
    }

    const {text, userId}=data;

    const messageData={
      text,
      userId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    const messageref=await admin
        .firestore()
        .collection("chats")
        .doc(userId)
        .collection("messages")
        .add(messageData);

    logger.log("Message added successfully , messageID:", messageref.id);

    return {status: "success", messageId: messageref.id};
  } catch (error) {
    logger.error("Error adding messages :", error);
    throw new functions.https.HttpsError(
        "unknown",
        "An error occured while adding the messgae",
        error.message,
    );
  }
});
