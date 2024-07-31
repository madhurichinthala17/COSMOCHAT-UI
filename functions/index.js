const admin=require("firebase-admin");
admin.initializeApp();

const {addMessage}=require("./api/addMessage");
exports.addMessage = addMessage;
