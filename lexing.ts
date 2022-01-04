export default function lexing(text_pr: string): Array<Array<string>> {
    /**
     * LEXING
     * Лексичний аналізатор приймає:
     * @text_pr - текст програми на с
     * Повертає:
     * @return - список токенів
     *
     * Мова: C
     * Система числення що повертається : Decimal, Bin
     * Типи, що обробляються: int, float
     *
     *
      */

    const tokens: Object = {
        "int ": "int_keyword",
        "main": "іdentifier",
        "(": "open parentheses",
        ")": "close parentheses",
        "{": "open brace",
        "return ": "return_keyword",
        ";": "semicolon",
        "}": "close brace"
    }

    // вихідна структура даних
    let lexeme_tab: Array<Array<string>> = []

    function type_of_number(str: string): Array<Array<string>> {
        /**
         * визначає int або float
         * все інше ігнорується
         * */


        if (str.includes('.'))
            return [[/\d[.]\d/.exec(str)[0], "float_nam"]]
        else if (/\d/.test(str))
            return [[/\d/.exec(str)[0],"int_nam"]]
        return []
    }

    function find_tokens(str: string): Array<Array<string>> {
        /**
         * знаходить токени
         * */
        let acc: Array<Array<string>> = []

        while (str.length != 0) {
            if (/^[\s ]/.test(str)) {
                // todo оптимізація
                // якщо на вході мусор
                str = str.slice(1)
                continue
            }
            // якщо на вході токен
            for (let token of Object.keys(tokens)) {
                if (str.startsWith(token)) {
                    acc.push([token, tokens[token]])
                    str = str.slice(token.length)
                    break
                }
            }
            // якщо на вході число
            if (/\d/.test(str[0])) {
                let number = type_of_number(str)
                acc = acc.concat(number)
                str = str.slice(number[0][0].length)
            }
        }
        return acc
    }


    // на першому етапі визначається все типу string
    text_pr
        .split(/(".*?")/g)
        .map(str => {
            // якщо строчка знайшлась
            if (str[0] === '"') {
                lexeme_tab = lexeme_tab
                    .concat([['"', "open_quote"], [str.slice(1, -1), "str"], ['"', "close_quote"]])
            } else {
                lexeme_tab = lexeme_tab.concat(find_tokens(str))
            }
        })
    return lexeme_tab
}