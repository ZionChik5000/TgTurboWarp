// @name TgTurboWarp
// @description This extention allows to use telergam API to control bots in TurboWarp
// @thumbnail
// @icon https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg
// @id TelegramBotAPI
// @authors ZionChik
// @version 1.2

(function (Scratch) {
  "use strict";

  if (!Scratch) throw new Error("Scratch API is unavaeble.");

  class TgTurbowarp {
    constructor() {
      this.BOT_TOKEN = "";
      this.UPDATE = { result: [] };
      this.initialized = false;
      this.lastUpdateId = 0;
    }

    getInfo() {
      return {
        id: "tgTurbowarp",
        name: "TgTurbowarp",
        color1: "#039dfc",
        color2: "#59bfff",
        color3: "#0479c2",
        menuIconURI: "https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg",
        blocks: [
          {
            opcode: "initialize",
            blockType: Scratch.BlockType.COMMAND,
            text: "Initialize bot with token [BOT_TOKEN]",
            arguments: {
              BOT_TOKEN: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "BOT_TOKEN",
              },
            },
          },
          {
            opcode: "isInitialized",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "Is initialized",
          },
          {
            opcode: "hasNewMessages",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "Has new messages",
          },
          {
            opcode: "sendMessage",
            blockType: Scratch.BlockType.COMMAND,
            text: "Send message [MESSAGE] to chat [CHAT_ID]",
            arguments: {
              MESSAGE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "MESSAGE",
              },
              CHAT_ID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "CHAT_ID",
              },
            },
          },
          {
            opcode: "replyMessage",
            blockType: Scratch.BlockType.COMMAND,
            text: "Reply to message [REPLY_TO_MESSAGE_ID] with [MESSAGE] to chat [CHAT_ID]",
            arguments: {
              MESSAGE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "MESSAGE",
              },
              CHAT_ID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "CHAT_ID",
              },
              REPLY_TO_MESSAGE_ID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "MESSAGE_ID",
              },
            },
          },
          {
            opcode: "editMessage",
            blockType: Scratch.BlockType.COMMAND,
            text: "Edit message [MESSAGE_ID] to [MESSAGE] to chat [CHAT_ID]",
            arguments: {
              MESSAGE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "MESSAGE",
              },
              CHAT_ID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "CHAT_ID",
              },
              MESSAGE_ID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "MESSAGE_ID",
              },
            },
          },
          {
            opcode: "deleteMessage",
            blockType: Scratch.BlockType.COMMAND,
            text: "Delete message [MESSAGE_ID] in chat [CHAT_ID]",
            arguments: {
              MESSAGE_ID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "MESSAGE_ID",
              },
              CHAT_ID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "CHAT_ID",
              },
            },
          },
          "---",
          {
            opcode: "getUpdates",
            blockType: Scratch.BlockType.COMMAND,
            text: "Get updates",
          },
          {
            opcode: "clearUpdates",
            blockType: Scratch.BlockType.COMMAND,
            text: "Clear updates",
          },
          {
            opcode: "forgetFirstMessage",
            blockType: Scratch.BlockType.COMMAND,
            text: "Forget first message",
          },
          "---",
          {
            opcode: "firstMessageContent",
            blockType: Scratch.BlockType.REPORTER,
            text: "first message content",
          },
          {
            opcode: "firstMessageId",
            blockType: Scratch.BlockType.REPORTER,
            text: "first message ID",
          },
          {
            opcode: "firstMessageChatId",
            blockType: Scratch.BlockType.REPORTER,
            text: "first message chat ID",
          },
          {
            opcode: "firstMessageSenderName",
            blockType: Scratch.BlockType.REPORTER,
            text: "first message sender name",
          },
          {
            opcode: "firstMessageSenderUsername",
            blockType: Scratch.BlockType.REPORTER,
            text: "first message sender username",
          },
          {
            opcode: "firstMessageDate",
            blockType: Scratch.BlockType.REPORTER,
            text: "first message date",
          },
          {
            opcode: "firstRepliedMessageId",
            blockType: Scratch.BlockType.REPORTER,
            text: "first replied message ID",
          },
          {
            opcode: "firstRepliedMessageSenderId",
            blockType: Scratch.BlockType.REPORTER,
            text: "first replied message sender ID",
          },
          "---",
        ],
      };
    }

    async initialize({ BOT_TOKEN }) {
      try {
        const validation = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
        console.log("API's answer:", validation);

        if (validation.ok) {
          this.BOT_TOKEN = BOT_TOKEN;
          this.initialized = true;
          console.log("Bot initialized");
        } else {
          console.error("API's error:", validation.status);
        }
      } catch (error) {
        console.error("Connection error:", error);
      }
    }

    isInitialized() {
      return this.initialized;
    }

    async hasNewMessages() {
      await this.getUpdates();
      return Array.isArray(this.UPDATE.result) && this.UPDATE.result.length > 0;
    }

    async getUpdates() {
      if (!this.initialized) return;

      if (this.UPDATE.result.length > 0) {
        this.lastUpdateId = this.UPDATE.result[this.UPDATE.result.length - 1].update_id;
      }

      const lastUpdateId = this.lastUpdateId || 0;
      const url = `https://api.telegram.org/bot${this.BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.result && data.result.length > 0) {
        this.UPDATE.result.push(...data.result);
        this.lastUpdateId = data.result[data.result.length - 1].update_id;
      }
    }

    firstNewMessage() {
      return this.UPDATE.result.length > 0 ? this.UPDATE.result[0] : null;
    }

    firstMessageContent() {
      const message = this.firstNewMessage();
      return message?.message?.text ?? null;
    }

    firstMessageChatId() {
      const message = this.firstNewMessage();
      return message?.message?.chat?.id ?? null;
    }

    firstMessageId() {
      const message = this.firstNewMessage();
      return message?.message?.message_id ?? null;
    }

    firstMessageSenderName() {
      const message = this.firstNewMessage();
      return message?.message?.from?.first_name ?? null;
    }

    firstMessageSenderUsername() {
      const message = this.firstNewMessage();
      return message?.message?.from?.username ?? null;
    }

    firstMessageDate() {
      const message = this.firstNewMessage();
      return message?.message?.date ?? null;
    }

    firstRepliedMessageId() {
      const message = this.firstNewMessage();
      return message?.message?.reply_to_message?.message_id;
    }

    firstRepliedMessageSenderId() {
      const message = this.firstNewMessage();
      return message?.message?.reply_to_message?.from?.id;
    }

    async sendMessage({ MESSAGE, CHAT_ID }) {
      await fetch(`https://api.telegram.org/bot${this.BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(MESSAGE)}`);
    }

    async replyMessage({ MESSAGE, CHAT_ID, REPLY_TO_MESSAGE_ID }) {
      await fetch(`https://api.telegram.org/bot${this.BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(MESSAGE)}&reply_to_message_id=${REPLY_TO_MESSAGE_ID}`);
    }

    async editMessage({ MESSAGE, CHAT_ID, MESSAGE_ID }) {
      await fetch(`https://api.telegram.org/bot${this.BOT_TOKEN}/editMessageText?chat_id=${CHAT_ID}&message_id=${MESSAGE_ID}&text=${encodeURIComponent(MESSAGE)}`);
    }

    async deleteMessage({ MESSAGE_ID, CHAT_ID }) {
      await fetch(`https://api.telegram.org/bot${this.BOT_TOKEN}/deleteMessage?chat_id=${CHAT_ID}&message_id=${MESSAGE_ID}`);
    }

    clearUpdates() {
      this.UPDATE.result = [];
    }

    forgetFirstMessage() {
      if (this.UPDATE.result.length > 0) this.UPDATE.result.shift();
    }

    findMessageById(messageId, chatId) {
      return this.UPDATE.result.find((update) => update.message?.message_id === messageId && update.message?.chat?.id === chatId) || null;
    }
  }

  Scratch.extensions.register(new TgTurbowarp());
})(Scratch);
