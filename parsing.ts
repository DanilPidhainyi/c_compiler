class Node {
    /**
     * Структура даннних AST
     * Складається з Node
     * type - відображає конструкцію (змінна функція цикл ...)
     * returnType - відображає (void int ...)
     * */
    name: string
    type: string = ""
    params: Array<Node>
    body: Array<Node> = []
    returnType: string = ""
}

export default function parsing (tokens: Array<Array<string>>): Array<Node> {

    const listVar: Array<Node> = []

    function find_out_the_type(token: string):string {
        /**
         * узнать int або float
         * */
        switch (token) {
            case "int_keyword":
                return "int"
            case "float_keyword":
                return "float"
            default:
                return "NaN"
        }
    }

    function find_tokens(tokens: Array<Array<string>>, token: string, i: number = 0): number {
        /**
         * знайти токен
         * -1 якщо токен не знайдено
         * */
        if (tokens.length === 0)
            return -1
        return tokens.shift()[1] === token ? i : find_tokens(tokens, token, i + 1)
    }

    function end_of_the_block(tokens: Array<Array<string>>, acc = 1, i = -1): number {
        /**
         * Знаходить межі блоку
         * Помилка, якщо блок не закритий
         * */
        if (acc === 0) return i
        if (tokens.length === 0) return -1 //todo помилка
        switch (tokens.shift()[1]) {
            case ("open brace"):
                return end_of_the_block(tokens, acc + 1, i + 1)
            case ("close brace"):
                return end_of_the_block(tokens, acc - 1, i + 1)
            default:
                return end_of_the_block(tokens, acc, i + 1)
        }
    }
    function mat_analysis(tokens: Array<Array<string>> ): Node {
        /**
         * Будує AST для математичних виразів
         */
        const thisNode = new Node()
        // --------- + -----------
        for (let i = 0; i < tokens.length; i += 1) {
            if (tokens[i][1] === "add_keyword") {
                thisNode.type = "add"
                thisNode.name = "+"
                thisNode.body = [mat_analysis(tokens.slice(0, i)), mat_analysis(tokens.slice(i + 1))]
                if (thisNode.body[0].returnType === thisNode.body[1].returnType) {
                    thisNode.returnType = thisNode.body[1].returnType
                    // todo помилка типів
                }
                return thisNode
            }
        }

        // --------- = -----------
        for (let i = 0; i < tokens.length; i += 1) {
            if (tokens[i][1] === "to assign") {
                thisNode.type = "to assign"
                thisNode.name = analysis(thisNode, [tokens[i - 1]])[0][0]
                thisNode.body = [mat_analysis(tokens.slice(i + 1))]
                thisNode.returnType = thisNode.body[0].returnType
                return thisNode
            }
        }

        return analysis(thisNode, [...tokens])[0]
    }

    function analysis(parentNode: Node, tokens: Array<Array<string>> ): Array<Node> {
        /**
         * Будує AST проходячить по tokens
         * Може обробити лише 1 рівень
         * Обробляє типові помилки
         * */
        // вихідний масив
        let arrNode: Array<Node> = []

        // Аналіз токенів

        while (tokens.length != 0) {

            const thisNode = new Node()
            // -------------------- int .... ----------------------------
            if (tokens[0][1] === "int_keyword" || tokens[0][1] === "float_keyword") {
                // узнаєм тип
                thisNode.returnType = find_out_the_type(tokens[0][1])
                if (tokens[1][1] === "var_or_fun") {
                    // узнали ім'я
                    thisNode.name = tokens[1][0]
                    if (tokens[2][1] === "open parentheses") {
                        thisNode.type = "function"
                        tokens = tokens.slice(3)
                        // todo заглушка для аналізу параметрів функції
                        // початок роботи з тілом функції
                        const start = find_tokens([...tokens], "open brace") + 1
                        tokens = tokens.slice(start)
                        // находимо кінець тіла
                        const end = end_of_the_block([...tokens])
                        // рекурсивно обробляємо тіло функції
                        thisNode.body = thisNode.body.concat(analysis(thisNode, tokens.slice(0, end)));
                        // видаляємо оброблені токени
                        tokens = tokens.slice(end + 1)

                    } else if (tokens[2][1] === "to assign") {
                        thisNode.type = "new_var"
                        thisNode.name = tokens[1][0]
                        const end = find_tokens([...tokens], "semicolon")
                        thisNode.body = [mat_analysis(tokens.slice(1, end))]
                        listVar.push(thisNode)
                        tokens = tokens.slice(end + 1)
                    }
                    // todo помилка невідомий символ

                }
                // todo помилка очікування
                // -------------------- return .... ----------------------------
            } else if (tokens[0][1] === "return_keyword") {
                thisNode.type = "return"
                const end = find_tokens([...tokens], "semicolon")

                // тіло ретюрна
                const childNode: Node = mat_analysis(tokens.slice(1, end))
                console.log("childNode= ", childNode);

                if (parentNode.returnType === childNode.returnType) {
                    thisNode.body.push(childNode)
                }
                tokens = tokens.slice(end + 1)
            // todo помилка невірного повернення типа
            // -------------------- 0 ----------------------------
            } else if (tokens[0][1] === "int_num") {
                thisNode.type = "number"
                thisNode.returnType = "int"
                thisNode.name = tokens[0][0]
                tokens = tokens.slice(1)
            // -------------------- 0.5 ----------------------------
            } else if (tokens[0][1] === "float_num") {
                thisNode.type = "number"
                thisNode.returnType = "float"
                thisNode.name = tokens[0][0]
                tokens = tokens.slice(1)
            // ------------- "Hello World" --------------------------
            } else if (tokens[0][1] === "open_quote") {
                thisNode.returnType = "string"
                thisNode.name = tokens[1][0]
                tokens = tokens.slice(3)
            // --------------- ; -------------------------
            } else if (tokens[0][1] === "semicolon") {
                tokens = tokens.slice(1)
            //--------------- a ------------------------
            } else if (tokens[0][1] === "var_or_fun") {
                thisNode.name = tokens[0][0]
                thisNode.type = "var"
                for (let node of listVar) {
                    if (node.name === thisNode.name) {
                        thisNode.returnType = node.returnType
                        thisNode.body = node.body
                        break
                    }
                }
                tokens = tokens.slice(1)
            }

            // todo поилка
            arrNode.push(thisNode)
        }
        return arrNode
    }

    return analysis(new Node(), tokens)
}

