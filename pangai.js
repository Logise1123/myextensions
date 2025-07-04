(function(Scratch) {
    'use strict';
    if (!Scratch.extensions.unsandboxed) throw new Error("This extension must run unsandboxed");

    const API_URL = "https://text.pollinations.ai/openai?token=QjvQxjCJDr3-ZXfJ";
    const MODEL = "openai-large";

    class PangAI {
        constructor() {
            this.histories = {};
            // this.nextImage almacenará la URL de la imagen que se adjuntará.
            this.nextImage = null;
        }

        getInfo() {
            return {
                id: 'pangai',
                name: 'PangAI',
                color1: '#5588ff',
                menuIconURI: '',
                blocks: [
                    { blockType: Scratch.BlockType.LABEL, text: 'Message Management' },
                    { opcode: 'get_prompt', blockType: Scratch.BlockType.REPORTER, text: 'Get prompt [TYPE]', arguments: { TYPE: { type: Scratch.ArgumentType.STRING, menu: 'promptMenu' } } },
                    { opcode: 'generate_text_nocontext', blockType: Scratch.BlockType.REPORTER, text: 'Generate from text (No Context): [PROMPT]', arguments: { PROMPT: { type: Scratch.ArgumentType.STRING } } },
                    { opcode: 'send_text_to_chat', blockType: Scratch.BlockType.REPORTER, text: 'Send text [PROMPT] to [chatID]', arguments: { PROMPT: { type: Scratch.ArgumentType.STRING }, chatID: { type: Scratch.ArgumentType.STRING } } },
                    { opcode: 'attach_image', blockType: Scratch.BlockType.COMMAND, text: 'Attach Image [URL] to next message', arguments: { URL: { type: Scratch.ArgumentType.STRING } } },
                    { opcode: 'inform_chat', blockType: Scratch.BlockType.COMMAND, text: 'Inform [chatID] that [inform]', arguments: { chatID: { type: Scratch.ArgumentType.STRING }, inform: { type: Scratch.ArgumentType.STRING } } },
                    { opcode: 'generate_image', blockType: Scratch.BlockType.REPORTER, text: 'Generate Image [PROMPT]', arguments: { PROMPT: { type: Scratch.ArgumentType.STRING } } },
                    { blockType: Scratch.BlockType.LABEL, text: 'Chatbot Management' },
                    { opcode: 'create_chatbot', blockType: Scratch.BlockType.COMMAND, text: 'Create chatbot named [chatID]', arguments: { chatID: { type: Scratch.ArgumentType.STRING } } },
                    { opcode: 'delete_chatbot', blockType: Scratch.BlockType.COMMAND, text: 'Delete chatbot [chatID]', arguments: { chatID: { type: Scratch.ArgumentType.STRING } } },
                    { opcode: 'reset_chat', blockType: Scratch.BlockType.COMMAND, text: 'Reset chat history of [chatID]', arguments: { chatID: { type: Scratch.ArgumentType.STRING } } },
                    { opcode: 'get_chat_history', blockType: Scratch.BlockType.REPORTER, text: 'Chat history of [chatID] as Array', arguments: { chatID: { type: Scratch.ArgumentType.STRING } } },
                    { opcode: 'import_history', blockType: Scratch.BlockType.COMMAND, text: 'Import chat history from [json] as [chatID]', arguments: { json: { type: Scratch.ArgumentType.STRING }, chatID: { type: Scratch.ArgumentType.STRING } } },
                    { opcode: 'import_chats_merge', blockType: Scratch.BlockType.COMMAND, text: 'Import chats from [json] and [merge]', arguments: { json: { type: Scratch.ArgumentType.STRING }, merge: { type: Scratch.ArgumentType.STRING, menu: 'mergeTypes' } } },
                    { opcode: 'all_chats', blockType: Scratch.BlockType.REPORTER, text: 'All chats as Arrays' },
                    { opcode: 'active_chats', blockType: Scratch.BlockType.REPORTER, text: 'Currently Active chats' }
                ],
                menus: {
                    promptMenu: [
                        'Gibberish (probably does not work) By: u/Fkquaps',
                        'PenguinBot (Pre Circlelabs) By: JeremyGamer13',
                        'Stand Up Comedian (Character) By: devisasari',
                        'Lunatic (Character) By: devisasari',
                        'Lua Console From awesomegptprompts.com',
                        'Advertiser (Character) By: devisasari',
                        'Minecraft Commander (Idea from Greedy Allay)'
                    ],
                    mergeTypes: [
                        { text: 'Merge/Update existing chats', value: 'Merge/Update existing chats' },
                        { text: 'Remove all chatbots and import', value: 'Remove all chatbots and import' }
                    ]
                }
            };
        }

        /**
         * Función auxiliar para procesar la imagen adjunta.
         * Obtiene la imagen de la URL, la convierte a un Data URL base64 y
         * construye el objeto de mensaje en el formato multimodal correcto.
         * @param {string} promptText El texto del prompt del usuario.
         * @returns {object} El objeto de mensaje del usuario, formateado para la API.
         */
        async _processImage(promptText) {
            // Si no hay imagen para adjuntar, devuelve un mensaje de texto simple.
            if (!this.nextImage) {
                return { role: 'user', content: promptText };
            }

            try {
                // Obtiene la imagen de la URL proporcionada.
                const response = await fetch(this.nextImage);
                if (!response.ok) {
                    throw new Error(`Error al obtener la imagen: ${response.statusText}`);
                }
                const blob = await response.blob();

                // Convierte el blob de la imagen a un Data URL (base64).
                const base64Url = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });

                // Construye el mensaje con el formato de contenido multimodal.
                return {
                    role: 'user',
                    content: [
                        { type: 'text', text: promptText },
                        {
                            type: 'image_url',
                            image_url: { url: base64Url }
                        }
                    ]
                };
            } catch (e) {
                console.error("No se pudo procesar la imagen para la llamada a la API:", e);
                // Si falla, vuelve a un mensaje de solo texto.
                return { role: 'user', content: promptText };
            } finally {
                // Limpia nextImage después de intentar usarlo, para que no se use en la siguiente solicitud.
                this.nextImage = null;
            }
        }

        get_prompt({ TYPE }) {
            const prompts = {
                'Gibberish (probably does not work) By: u/Fkquaps': 'From now on you will respond everything replacing every letter of the alphabet with it rotated 13 places forward ...',
                'PenguinBot (Pre Circlelabs) By: JeremyGamer13': 'You are PenguinBot.\n\nYou live in Antarctica ...',
                'Stand Up Comedian (Character) By: devisasari': 'I want you to act as a stand-up comedian. I will provide you with some topics ...',
                'Lunatic (Character) By: devisasari': 'I want you to act as a lunatic. The lunatic\'s sentences are meaningless ...',
                'Lua Console From awesomegptprompts.com': 'I want you to act as a lua console. I will type code and you will reply with what the lua console should show ...',
                'Advertiser (Character) By: devisasari': 'I want you to act as an advertiser. You will create a campaign ...',
                'Minecraft Commander (Idea from Greedy Allay)': 'I want you to act as a Minecraft AI command creator ...'
            };
            return prompts[TYPE] || '';
        }

        async generate_text_nocontext({ PROMPT }) {
            // Crea el mensaje del usuario, procesando la imagen si está adjunta.
            const userMessage = await this._processImage(PROMPT);

            const body = {
                model: MODEL,
                messages: [userMessage]
            };

            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            const data = await response.json();
            return data?.choices?.[0]?.message?.content || "Error: no response";
        }

        async send_text_to_chat({ PROMPT, chatID }) {
            if (!this.histories[chatID]) this.histories[chatID] = [];

            // Crea el mensaje del usuario, procesando la imagen si está adjunta.
            const userMessage = await this._processImage(PROMPT);
            this.histories[chatID].push(userMessage);

            const body = {
                model: MODEL,
                messages: this.histories[chatID]
            };

            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            const data = await response.json();
            const reply = data?.choices?.[0]?.message?.content || "Error: no response";
            this.histories[chatID].push({ role: 'assistant', content: reply });
            return reply;
        }

        attach_image({ URL }) {
            // Simplemente almacena la URL. La conversión se hará en el momento del envío.
            this.nextImage = URL;
        }

        inform_chat({ chatID, inform }) {
            if (!this.histories[chatID]) this.histories[chatID] = [];
            this.histories[chatID].push({ role: 'system', content: inform });
        }

        create_chatbot({ chatID }) {
            if (!this.histories[chatID]) this.histories[chatID] = [];
        }

        delete_chatbot({ chatID }) {
            delete this.histories[chatID];
        }

        reset_chat({ chatID }) {
            this.histories[chatID] = [];
        }

        get_chat_history({ chatID }) {
            return JSON.stringify(this.histories[chatID] || []);
        }

        import_history({ json, chatID }) {
            try {
                this.histories[chatID] = JSON.parse(json);
            } catch (e) {
                console.error("JSON inválido para el historial del chat.");
            }
        }

        import_chats_merge({ json, merge }) {
            try {
                const newChats = JSON.parse(json);
                if (merge === 'Remove all chatbots and import') {
                    this.histories = newChats;
                } else {
                    for (const id in newChats) {
                        this.histories[id] = newChats[id];
                    }
                }
            } catch (e) {
                console.error("JSON inválido para los chats.");
            }
        }

        all_chats() {
            return JSON.stringify(this.histories);
        }

        active_chats() {
            return Object.keys(this.histories);
        }

        generate_image({ PROMPT }) {
            return `https://image.pollinations.ai/prompt/${encodeURIComponent(PROMPT)}?height=1000&width=1000&enhance=true&nologo=true`;
        }
    }

    Scratch.extensions.register(new PangAI());
})(Scratch);
