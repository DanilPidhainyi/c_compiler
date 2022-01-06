export default function parsing (tokens: Array<Array<string>>): any {

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
    function type_fun() {

    }

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

    function end_of_the_block(tokens: Array<Array<string>>, acc = 1, i = 0): number {
        /**
         * Знаходить межі блоку
         * Помилка, якщо блок не закритий
         * */

        if (tokens.length === 0) return -1 //todo помилка
        if (acc === 0) return i
        switch (tokens.shift()[1]) {
            case ("open brace"):
                return end_of_the_block(tokens, acc + 1, i + 1)
            case ("close brace"):
                return end_of_the_block(tokens, acc - 1, i + 1)
            default:
                return end_of_the_block(tokens, acc, i + 1)
        }
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
                        const i = find_tokens(tokens.slice(3), "open brace")
                        const end = end_of_the_block(tokens.slice(i))
                        thisNode.body.concat(analysis(thisNode, tokens.slice(i + 1, end)));
                        tokens = tokens.slice(end + 1)
                        continue
                        // todo тіло фунції

                    } else if (tokens[2][1] === "semicolon") {
                        thisNode.type = "var"
                        // todo об'явить і присвоїть змінну
                    } else if (tokens[2][1] === "to assign") { //;
                        thisNode.type = "var"
                        // todo об'явить змінну
                    }
                    // todo помилка невідомий символ

                }
                // todo помилка очікування
                // -------------------- return .... ----------------------------
            } else if (tokens[0][1] === "return_keyword") {
                const i = find_tokens(tokens, "semicolon")
                const childNode: Node = analysis(new Node(), tokens.slice(1, i))[0]
                if (find_out_the_type(tokens[1][1]) === childNode.returnType) {
                    thisNode.body.push(childNode)
                }
                tokens = tokens.slice(i + 1)
                continue

            // todo помилка невірного повернення типа
            // -------------------- 0 ----------------------------
            } else if (tokens[0][1] === "int_num") {
                thisNode.returnType = "int"
                thisNode.name = tokens[0][0]
                tokens = tokens.slice(1)
            // -------------------- 0.5 ----------------------------
            } else if (tokens[0][1] === "float_num") {
                thisNode.returnType = "float"
                thisNode.name = tokens[0][0]
                tokens = tokens.slice(1)
            // ------------- "Hello World" --------------------------
            } else if (tokens[0][1] === "open_quote") {
                thisNode.returnType = "string"
                thisNode.name = tokens[1][0]
                tokens = tokens.slice(3)
            }
            // todo поилка
            arrNode.push(thisNode)
        }
        return arrNode
    }

    //analysis(new Node(), tokens)
}

// ------------ Тестування --------------------
