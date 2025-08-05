(function(Scratch) {
    'use strict';
    if (!Scratch.extensions.unsandboxed) throw new Error("This extension must run unsandboxed");

    const API_URL = "https://freeai.logise1123.workers.dev/";

    class PangAI {
        constructor() {
            this.histories = {};
            // El modelo por defecto. Se puede cambiar con el nuevo bloque.
            this.model = 'llama-3.1-8b-instruct-fast';
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
                    { blockType: Scratch.BlockType.LABEL, text: 'Configuration' },
                    { 
                        opcode: 'set_model', 
                        blockType: Scratch.BlockType.COMMAND, 
                        text: 'Set model to [MODEL]', 
                        arguments: { 
                            MODEL: { 
                                type: Scratch.ArgumentType.STRING, 
                                menu: 'modelMenu',
                                defaultValue: 'llama-3.1-8b-instruct-fast'
                            } 
                        } 
                    },
                    { 
                        opcode: 'get_current_model', 
                        blockType: Scratch.BlockType.REPORTER, 
                        text: 'current model' 
                    },
                    { blockType: Scratch.BlockType.LABEL, text: 'Model Status:' },
                    { blockType: Scratch.BlockType.LABEL, text: 'https://pangaicheck.netlify.app/' },
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
                    modelMenu: [
                        { text: 'LLaMA 4 Scout 17B (Meta)', value: 'llama-4-scout-17b-16e-instruct' },
                        { text: 'LLaMA 3.3 70B FP8 (Meta)', value: 'llama-3.3-70b-instruct-fp8-fast' },
                        { text: 'LLaMA 3.1 8B Fast (Meta)', value: 'llama-3.1-8b-instruct-fast' },
                        { text: 'Gemma 3 12B (Google)', value: 'gemma-3-12b-it' },
                        { text: 'Mistral Small 3.1 24B (MistralAI)', value: 'mistral-small-3.1-24b-instruct' },
                        { text: 'QwQ 32B (Qwen)', value: 'qwq-32b' },
                        { text: 'Qwen2.5 Coder 32B (Qwen)', value: 'qwen2.5-coder-32b-instruct' },
                        { text: 'LLaMA Guard 3 8B (Meta)', value: 'llama-guard-3-8b' },
                        { text: 'DeepSeek R1 Distill Qwen 32B', value: 'deepseek-r1-distill-qwen-32b' },
                        { text: 'LLaMA 3.2 1B (Meta)', value: 'llama-3.2-1b-instruct' },
                        { text: 'LLaMA 3.2 3B (Meta)', value: 'llama-3.2-3b-instruct' },
                        { text: 'LLaMA 3.2 11B Vision (Meta)', value: 'llama-3.2-11b-vision-instruct' },
                        { text: 'LLaMA 3.1 8B AWQ (Meta)', value: 'llama-3.1-8b-instruct-awq' },
                        { text: 'LLaMA 3.1 8B FP8 (Meta)', value: 'llama-3.1-8b-instruct-fp8' },
                        { text: 'LLaMA 3.1 8B (Meta)', value: 'llama-3.1-8b-instruct' },
                        { text: 'Meta LLaMA 3 8B (Meta)', value: 'meta-llama-3-8b-instruct' },
                        { text: 'LLaMA 3 8B AWQ (Meta)', value: 'llama-3-8b-instruct-awq' },
                        { text: 'Cybertron 7B v2 (UNA)', value: 'una-cybertron-7b-v2-bf16' },
                        { text: 'LLaMA 3 8B (Meta)', value: 'llama-3-8b-instruct' },
                        { text: 'Mistral 7B Instruct v0.2', value: 'mistral-7b-instruct-v0.2' },
                        { text: 'Gemma 7B IT LoRA (Google)', value: 'gemma-7b-it-lora' },
                        { text: 'Gemma 2B IT LoRA (Google)', value: 'gemma-2b-it-lora' },
                        { text: 'LLaMA 2 7B Chat HF LoRA', value: 'llama-2-7b-chat-hf-lora' },
                        { text: 'Gemma 7B IT (Google)', value: 'gemma-7b-it' },
                        { text: 'Starling LM 7B Beta (Nexusflow)', value: 'starling-lm-7b-beta' },
                        { text: 'Hermes 2 Pro Mistral 7B', value: 'hermes-2-pro-mistral-7b' },
                        { text: 'Mistral 7B Instruct v0.2 LoRA', value: 'mistral-7b-instruct-v0.2-lora' },
                        { text: 'Qwen 1.5 1.8B Chat', value: 'qwen1.5-1.8b-chat' },
                        { text: 'Phi-2 (Microsoft)', value: 'phi-2' },
                        { text: 'TinyLLaMA 1.1B Chat v1.0', value: 'tinyllama-1.1b-chat-v1.0' },
                        { text: 'Qwen 1.5 14B Chat AWQ', value: 'qwen1.5-14b-chat-awq' },
                        { text: 'Qwen 1.5 7B Chat AWQ', value: 'qwen1.5-7b-chat-awq' },
                        { text: 'Qwen 1.5 0.5B Chat', value: 'qwen1.5-0.5b-chat' },
                        { text: 'DiscoLM German 7B v1 AWQ', value: 'discolm-german-7b-v1-awq' },
                        { text: 'Falcon 7B Instruct', value: 'falcon-7b-instruct' },
                        { text: 'OpenChat 3.5 0106', value: 'openchat-3.5-0106' },
                        { text: 'SQLCoder 7B 2', value: 'sqlcoder-7b-2' },
                        { text: 'DeepSeek Math 7B Instruct', value: 'deepseek-math-7b-instruct' },
                        { text: 'DeepSeek Coder 6.7B Instruct AWQ', value: 'deepseek-coder-6.7b-instruct-awq' },
                        { text: 'DeepSeek Coder 6.7B Base AWQ', value: 'deepseek-coder-6.7b-base-awq' },
                        { text: 'LLaMAGuard 7B AWQ', value: 'llamaguard-7b-awq' },
                        { text: 'Neural Chat 7B v3.1 AWQ', value: 'neural-chat-7b-v3-1-awq' },
                        { text: 'OpenHermes 2.5 Mistral 7B AWQ', value: 'openhermes-2.5-mistral-7b-awq' },
                        { text: 'LLaMA 2 13B Chat AWQ', value: 'llama-2-13b-chat-awq' },
                        { text: 'Mistral 7B Instruct v0.1 AWQ', value: 'mistral-7b-instruct-v0.1-awq' },
                        { text: 'Zephyr 7B Beta AWQ', value: 'zephyr-7b-beta-awq' },
                        { text: 'LLaMA 2 7B Chat FP16', value: 'llama-2-7b-chat-fp16' },
                        { text: 'Mistral 7B Instruct v0.1', value: 'mistral-7b-instruct-v0.1' },
                        { text: 'LLaMA 2 7B Chat INT8', value: 'llama-2-7b-chat-int8' },
                        { text: 'LLaMA 3.1 70B Instruct', value: 'llama-3.1-70b-instruct' }
                    ],
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

        // --- Nuevas funciones para gestionar el modelo ---
        set_model({ MODEL }) {
            this.model = MODEL;
        }

        get_current_model() {
            return this.model;
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
            const userMessage = await this._processImage(PROMPT);

            const body = {
                model: this.model, // Usa el modelo seleccionado
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

            const userMessage = await this._processImage(PROMPT);
            this.histories[chatID].push(userMessage);

            const body = {
                model: this.model, // Usa el modelo seleccionado
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
