import error from "./error";

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

    /**
     * PARSING
     *
     * @tokens - таблиця лексем
     *
     * @return Повертає AST з Node
     */

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

    function float_to_int(node:Node ):Node {
        /**
         * Cпробувати привести
         * float до int
         */
        node.name = /[0-9]+/.exec(node.name)[0]
        node.returnType = 'int'
        return node

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
        if (tokens.length === 0) return -1
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
        // --------- = -----------
        for (let i = 0; i < tokens.length; i += 1) {
            if (tokens[i][1] === "to assign") {
                thisNode.type = "to assign"
                thisNode.name = tokens[i-1][0]
                thisNode.body = [mat_analysis(tokens.slice(i + 1))]
                thisNode.returnType = thisNode.body[0].returnType
                return thisNode
            }
        }

        // --------- != -----------
        for (let i = 0; i < tokens.length; i += 1) {
            if (tokens[i][1] === "not =") {
                thisNode.type = "not ="
                thisNode.body = [mat_analysis(tokens.slice(i + 1))]
                thisNode.returnType = "bool"
                return thisNode
            }
        }

        // --------- + -----------
        for (let i = 0; i < tokens.length; i += 1) {
            if (tokens[i][1] === "add_keyword") {
                thisNode.type = "add"
                thisNode.name = "+"
                thisNode.body = [mat_analysis(tokens.slice(0, i)), mat_analysis(tokens.slice(i + 1))]
                if (thisNode.body[0].returnType === thisNode.body[1].returnType) {
                    thisNode.returnType = thisNode.body[1].returnType
                } else {
                    error("Типи не вірні", tokens.map(n => n[0]).join(' '))
                }
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

            let thisNode: Node = new Node()
            // -------------------- int .... ----------------------------
            if (tokens[0][1] === "int_keyword" || tokens[0][1] === "float_keyword") {
                // узнаєм тип
                thisNode.returnType = find_out_the_type(tokens[0][1])
                if (tokens[1][1] === "var_or_fun") {
                    // узнали ім'я
                    thisNode.name = tokens[1][0]
                    if (tokens.length < 3) {
                        tokens.push([';', "semicolon"]);
                    }
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

                    // ------------ int a -----------;
                    // визначення
                    } else if (tokens[2][1] === "to assign" || tokens[2][1] === "semicolon") {
                        thisNode.type = "new_var"
                        thisNode.name = tokens[1][0]
                        // todo проверку типів
                        if (tokens[0][1] === "int_keyword") {
                            thisNode.returnType = 'int'
                        } else {
                            thisNode.returnType = 'float'
                        }
                        const newNode = new Node()
                        newNode.type = thisNode.type
                        newNode.name = thisNode.name
                        newNode.returnType = thisNode.returnType
                        if (listVar.filter(n => n.name === newNode.name).length > 0) {
                            error("Спроба повторно визначення змінної", tokens.map(n => n[0]).join(' '))
                        }
                        listVar.push(newNode)
                        tokens = tokens.slice(1)
                        if (tokens[1][1] === "semicolon") {
                            tokens = tokens.slice(2)
                        }

                    } else {
                        error("Неочікуваний символ", tokens.map(n => n[0]).join(' '))
                    }
                } else {
                    error("Неочікуваний символ", tokens.map(n => n[0]).join(' '))
                }
                // -------------------- return .... ----------------------------
            } else if (tokens[0][1] === "return_keyword") {
                thisNode.type = "return"
                const end = find_tokens([...tokens], "semicolon")

                // тіло ретюрна
                const childNode: Node = mat_analysis(tokens.slice(1, end))

                if (parentNode.returnType === childNode.returnType) {
                    thisNode.body.push(childNode)
                } else {
                    error("функція повертає інший тип", tokens.map(n => n[0]).join(' '))
                }
                tokens = tokens.slice(end + 1)
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
                // якщо присвоєння
                if (tokens.length > 1 && tokens[1][1] === "to assign") {
                    for (let node of listVar) {
                        if (node.name === tokens[0][0]) {
                            const end = find_tokens([...tokens], "semicolon")
                            thisNode = mat_analysis(tokens.slice(0, end))
                            if (node.returnType !== thisNode.returnType) {
                                if (thisNode.body[0].type === "number") {
                                    // todo поганий ход
                                    thisNode.body[0] = float_to_int(thisNode.body[0])
                                    thisNode.returnType = node.returnType
                                } else {
                                    error("вираз має інший тип", tokens.map(n => n[0]).join(' '))
                                }
                            }
                            tokens = tokens.slice(end + 1)
                            break
                        }
                    }

                // якщо отримання
                } else {
                    for (let node of listVar) {
                        if (node.name === tokens[0][0]) {
                            thisNode.name = node.name
                            thisNode.body = node.body
                            thisNode.returnType = node.returnType
                            thisNode.type = "var"
                            break
                        }
                    }
                    tokens = tokens.slice(1)
                }

            //--------------printf();---------------------------
            } else if (tokens[0][1] === "print") {
                if (tokens[1][1] === "open parentheses") {
                    const end: number = find_tokens(tokens.slice(2), "close parentheses") + 2
                    if (tokens[1 + end][1] === "semicolon") {
                        thisNode.type = "print"
                        thisNode.body = [mat_analysis(tokens.slice(2, end))]
                        tokens = tokens.slice(end + 1)
                    } else {
                      error("очікується закривання строки", tokens.map(n => n[0]).join(' '))
                    }
                } else {
                    error("очікуться закривання дужок", tokens.map(n => n[0]).join(' '))
                }
            //----------------- do-while ---------
            } else if (tokens[0][1] === "do_keyword") {
                if (tokens[1][1] === "open brace") {
                    const end: number = find_tokens(tokens.slice(2), "close brace") + 2
                    thisNode.type = "do-while"
                    thisNode.body = analysis(thisNode, tokens.slice(2, end))
                    tokens = tokens.slice(end + 1)
                    if (tokens[1][1] === "open parentheses") {
                        const end: number = find_tokens(tokens.slice(1), "close parentheses") + 1
                        thisNode.params = analysis(new Node(), [tokens[2]]).concat(analysis(new Node(), [tokens[4]]))
                        thisNode.name = tokens[3][0].replace('!','=')
                        tokens = tokens.slice(end + 1)
                    } else {
                        error("очікуться закривання дужок", tokens.map(n => n[0]).join(' '))
                    }
                } else {
                    error("очікуться закривання дужок", tokens.map(n => n[0]).join(' '))
                }

            } else {
                error("Щось пішло не так", tokens.map(n => n[0]).join(' '))
            }

            arrNode.push(thisNode)

        }
        return arrNode
    }

    return analysis(new Node(), tokens)
}

