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
                defaultValue: "Hello!",
              },
              CHAT_ID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "CHAT_ID",
              },
            },
          },
          {
            opcode: "firstMessageContent",
            blockType: Scratch.BlockType.REPORTER,
            text: "First message content",
          },
          {
            opcode: "firstMessageChatId",
            blockType: Scratch.BlockType.REPORTER,
            text: "First message chat id",
          },
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
            text: "Forget first message from memory",
          },
        ],
      };
    }

    async initialize(args) {
      try {
        const validation = await fetch(`https://api.telegram.org/bot${args.BOT_TOKEN}/getMe`);
        console.log("API's answer:", validation);

        if (validation.ok) {
          this.BOT_TOKEN = args.BOT_TOKEN;
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

      console.log("Received DATA:", data);

      if (data.result && data.result.length > 0) {
        this.UPDATE.result.push(...data.result);
        this.lastUpdateId = data.result[data.result.length - 1].update_id;
      }
    }

    firstNewMessage() {
      if (!this.initialized) return "#SYSTEM#: Bot not initialized";
      return this.UPDATE.result.length > 0 ? this.UPDATE.result[0] : null;
    }

    firstMessageContent() {
      if (!this.initialized) return "#SYSTEM#: Bot not initialized";

      const message = this.firstNewMessage();
      return message?.message?.text ?? null;
    }

    firstMessageChatId() {
      if (!this.initialized) return "#SYSTEM#: Bot not initialized";

      const message = this.firstNewMessage();
      return message?.message?.chat?.id ?? null;
    }

    async sendMessage(args) {
      if (!this.initialized) return "#SYSTEM#: Bot not initialized";
      if (!args.MESSAGE || !args.CHAT_ID) return "#SYSTEM#: Invalid arguments";

      await fetch(`https://api.telegram.org/bot${this.BOT_TOKEN}/sendMessage?chat_id=${args.CHAT_ID}&text=${encodeURIComponent(args.MESSAGE)}`);
    }

    clearUpdates() {
      this.UPDATE.result = [];
    }

    forgetFirstMessage() {
      if (this.UPDATE.result.length > 0) this.UPDATE.result.shift();
    }
  }

  Scratch.extensions.register(new TgTurbowarp());
})(Scratch);
