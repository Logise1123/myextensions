
(function (Scratch) {
  'use strict';

  class OpenTTSExtension {
    getInfo() {
      return {
        id: 'OpenTTS',
        name: 'OpenTTS',
        color1: '#0074D9',
        blocks: [
          {
            opcode: 'playTTS',
            blockType: Scratch.BlockType.COMMAND,
            text: 'say [TEXT] with voice [VOICE]',
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Hello world'
              },
              VOICE: {
                type: Scratch.ArgumentType.STRING,
                menu: 'voices',
                defaultValue: 'onyx'
              }
            }
          },
          {
            opcode: 'playAndWaitTTS',
            blockType: Scratch.BlockType.COMMAND,
            text: 'say and wait [TEXT] with voice [VOICE]',
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Hello world'
              },
              VOICE: {
                type: Scratch.ArgumentType.STRING,
                menu: 'voices',
                defaultValue: 'onyx'
              }
            }
          },
          {
            opcode: 'getTTSDataURL',
            blockType: Scratch.BlockType.REPORTER,
            text: 'data URL of [TEXT] with voice [VOICE]',
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Hello world'
              },
              VOICE: {
                type: Scratch.ArgumentType.STRING,
                menu: 'voices',
                defaultValue: 'onyx'
              }
            }
          }
        ],
        menus: {
          voices: {
            acceptReporters: true,
            items: [
              'alloy',
              'ash',
              'bailad',
              'coral',
              'echo',
              'fable',
              'onyx',
              'nova',
              'sage',
              'shimmer',
              'verse'
            ]
          }
        }
      };
    }

    playTTS(args) {
      const text = encodeURIComponent(args.TEXT);
      const voice = encodeURIComponent(args.VOICE);
      const url = `https://tts.arielcapdevilagarcia.workers.dev/?text=${text}&voice=${voice}`;
      const audio = new Audio(url);
      audio.play();
    }

    playAndWaitTTS(args) {
      return new Promise(resolve => {
        const text = encodeURIComponent(args.TEXT);
        const voice = encodeURIComponent(args.VOICE);
        const url = `https://tts.arielcapdevilagarcia.workers.dev/?text=${text}&voice=${voice}`;
        const audio = new Audio(url);
        audio.onended = resolve;
        audio.play();
      });
    }

    async getTTSDataURL(args) {
      const text = encodeURIComponent(args.TEXT);
      const voice = encodeURIComponent(args.VOICE);
      const url = `https://tts.arielcapdevilagarcia.workers.dev/?text=${text}&voice=${voice}`;

      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      return `data:audio/mpeg;base64,${base64}`;
    }
  }

  Scratch.extensions.register(new OpenTTSExtension());
})(Scratch);
