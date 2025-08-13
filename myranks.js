// Name: MyBoards
// ID: logise1123MyBoards
// Description: An extension to interact with a leaderboard service.
// By: logise1123 <https://github.com/logise1123>
// License: MIT

(function (Scratch) {
  "use strict";

  if (!Scratch.extensions.unsandboxed) {
    throw new Error("MyBoards extension must be run unsandboxed!");
  }

  const API_BASE_URL = "https://leaderboards.logise1123.workers.dev";

  const menuIconURI =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAMAAABiM0N1AAAAq1BMVEVHcEz/zE3/zE3/zE3/zE3/zE3/zE3/zE3/zE3/zE3/rDP/rDP/rDP/rjX/vkL/rDP/rDP/rDP/tDr/xEf/rDP/vED/rDP/rDP/wEP/sDb/rDP/rDP/zE3/zE3/rDP/rDP/rDP/zE3/zE3/zE3/zE3/zE3/rDP/rDP/wkX/ykv/xkj/tjv/sjj/uD3BaU/BaU/BaU/BaU/BaU/BaU/BaU/BaU/BaU/BaU/BaU/Lbtl5AAAAOXRSTlMAIHCAj79g/zCvgN/////vEM///6//v0D//2CfQO8gcI9Qz5/fEDBQ////////MK//72BQv99AzyD2svjjAAACS0lEQVR4AdXWB5azOgwF4JvqDCgPMyEwkz6997r/jU0RKRbnkMjw2v8t4B5LyDIoQqPZ+tXulGs1G9ipa1Ta2KFnWP2kPaPVAIqCkFb6Ru0vWokCCwA2po19ozagjdgCSMgxNHrkSIGMXAdG75AcI4zJNTB6++SIEdUPYqClJLMAOkZvAtgsKAYlYH5Bv4JCUAZmvINsIQi5qXcQKIeYmK1aGohFGBPLqgbNiKWYEwu87izr4deI2ALZKpG1jB7Ygth8UyM7MmrHYPG6NSGxGX41jNoJGOUskBAbgZ0arS5+ZcTCzWguwE48N2RALN1kxp5NOgZLiAXujLMzz+UfOY0JxUjueU3RjHLnAJASC7zetVOwC8q5/Uq87m1TjGPspobItY3GGVhKLBF1WrCGxzSCRFsi0W109CvkXK7FVIwkJmanDnIjys3gdju06iNNkIspV8gda4/UQW5OYgfhXD5JQEdzIJuNiWRTEJG0r/99YCMsBVRwqX30WYQVG5N0eKX6MVq6wNp5RNLQlLrqlxTGbErStSlzQ0I0gpQl5Lo1JS7JFQYWO7RK1scZfHXK95mfs9PyNeSnNy3dHp56pmAPFXWNcHyGqiZXsq7qbjeDOUQNM+oP80MNbgk1ZETUvzsYDG/5EaxuLi95dWNyBKguJkeKyiwJqGxErH6TEhIW1SuTojofXxihmpAK0jqtFjJ4uX943OrpWZnz9LjLCzReH3d6g8ajwh8YdP/6qPT0jm0+HtWeFGXp/G1B99ji6VHvE1s865NeIXwDBvTA37rZqRcAAAAASUVORK5CYII=";
  const blockIconURI = menuIconURI;

  class MyBoards {
    getInfo() {
      return {
        id: "logise1123MyBoards",
        name: "MyBoards",
        color1: "#d9851c",
        color2: "#d9851c",
        color3: "#d9851c",
        menuIconURI,
        blockIconURI,
        blocks: [
          {
            opcode: "getMoney",
            blockType: Scratch.BlockType.REPORTER,
            text: "get money for player [ID] in game [GAME_ID]",
            arguments: {
              ID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "player1",
              },
              GAME_ID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "myCoolGame",
              },
            },
          },
          {
            opcode: "setMoney",
            blockType: Scratch.BlockType.COMMAND,
            text: "set money for player [ID] in game [GAME_ID] to [MONEY]",
            arguments: {
              ID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "player1",
              },
              GAME_ID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "myCoolGame",
              },
              MONEY: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 100,
              },
            },
          },
          {
            opcode: "getLeaderboard",
            blockType: Scratch.BlockType.REPORTER,
            text: "get leaderboard JSON for game [GAME_ID]",
            arguments: {
              GAME_ID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "myCoolGame",
              },
            },
          },
          {
            opcode: "createIframeURL",
            blockType: Scratch.BlockType.REPORTER,
            text: "Create Iframe URL for game [GAME_ID] and style [STYLE]",
            arguments: {
              GAME_ID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "myCoolGame",
              },
              STYLE: {
                type: Scratch.ArgumentType.STRING,
                menu: "styleMenu",
                defaultValue: "pixel",
              },
            },
          },
        ],
        menus: {
          styleMenu: {
            acceptReporters: true,
            items: ["cartoon", "minimalist", "pixel", "scifi", "realistic"],
          },
        },
      };
    }

    async getMoney(args) {
      const { ID, GAME_ID } = args;
      try {
        const url = `${API_BASE_URL}/money/${ID}/${GAME_ID}`;
        const response = await Scratch.fetch(url);
        if (!response.ok) {
          console.error(`Error fetching money: ${response.statusText}`);
          return 0;
        }
        const data = await response.json();
        return Scratch.Cast.toNumber(data.money || 0);
      } catch (error) {
        console.error("Failed to get money:", error);
        return 0;
      }
    }

    async setMoney(args) {
      const { ID, GAME_ID, MONEY } = args;
      try {
        const url = `${API_BASE_URL}/money/${ID}/${GAME_ID}`;
        await Scratch.fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ money: Scratch.Cast.toNumber(MONEY) }),
        });
      } catch (error) {
        console.error("Failed to set money:", error);
      }
    }

    async getLeaderboard(args) {
      const { GAME_ID } = args;
      try {
        const url = `${API_BASE_URL}/leaderboard/${GAME_ID}`;
        const response = await Scratch.fetch(url);
        if (!response.ok) {
          console.error(`Error fetching leaderboard: ${response.statusText}`);
          return "[]";
        }
        return await response.text();
      } catch (error) {
        console.error("Failed to get leaderboard:", error);
        return "[]";
      }
    }

    createIframeURL(args) {
      const game = encodeURIComponent(args.GAME_ID);
      const theme = encodeURIComponent(args.STYLE);
      return `https://myboards.netlify.app/?game=${game}&theme=${theme}`;
    }
  }

  Scratch.extensions.register(new MyBoards());
})(Scratch);
