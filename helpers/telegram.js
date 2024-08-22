const axios = require("axios");
const fs = require("fs");

const send = async function (message, reply_id) {
  const chat_id = "";
  const bot_id = "";

  const config = {
    chat_id: chat_id,
    text: message,
    // message_thread_id: thread_id,
    parse_mode: "html",
  };

  if (reply_id) {
    config.reply_to_message_id = reply_id;
  }

  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${bot_id}/sendmessage`,
      config
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error; // Optional: rethrow the error if needed
  }
};

const sendChat = async function (thread_id, message, reply_id) {
  const chat_id = "-1002129142477";
  const bot_id = "5747843121:AAF3vKqoWC18nsI7GUqPH_spqNNeJiW06LY";

  const config = {
    chat_id: chat_id,
    text: message,
    message_thread_id: thread_id,
  };

  if (reply_id) {
    config.reply_to_message_id = reply_id;
  }

  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${bot_id}/sendmessage`,
      config
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error; // Optional: rethrow the error if needed
  }
};

const sendImage = async function (imagePath, caption, reply_id) {
  const chat_id = "-1002129142477";
  const bot_id = "5747843121:AAF3vKqoWC18nsI7GUqPH_spqNNeJiW06LY";

  const formData = {
    chat_id: chat_id,
    caption: caption || "",
    photo: fs.createReadStream(imagePath),
  };

  if (reply_id) {
    formData.reply_to_message_id = reply_id;
  }

  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${bot_id}/sendPhoto`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error; // Optional: rethrow the error if needed
  }
};

module.exports = {
  send,
  sendChat,
  sendImage,
};
