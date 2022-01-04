import {isNull} from "util";

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
        // todo баг з невідомим символами і неочікувані тектові вставки
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
    type ACC = Array<Array<string>>
    let lexeme_tab: ACC = []

    function type_of_number(str: string): ACC {
        /**
         * визначає int або float
         * */

        if (str.includes('.'))
            return [[/\d[.]\d/.exec(str)[0], "float_nam"]]
        else if (/\d/.test(str))
            return [[/\d/.exec(str)[0], "int_nam"]]
        return []
    }

    function str_analise(str: string): ACC {
        /**
         * знаходить строчки
         * */
        return [['"', "open_quote"], [/".*?"/.exec(str)[0].slice(1, -1), "str"], ['"', "close_quote"]]
    }

    function find_tokens(str: string): ACC | number {
        /**
         * знаходить токени
         * */
        for (let token of Object.keys(tokens)) {
            if (str.startsWith(token)) {
                return [[token, tokens[token]]]
            }
        }
        return NaN
    }


    let acc: ACC = []
    // допоміжна штука
    function cat_and_add (str: ACC, n = undefined) {
        text_pr = text_pr.slice(n | str[0][0].length)
        acc = acc.concat(str)
    }

    // ЯДРО
    while (text_pr.length != 0) {
        // якщо на вході мусор
        if (/^[\s ]/.test(text_pr)) {
            text_pr = text_pr.slice(/^[\s ]/.exec(text_pr)[0].length)
        }

        // якщо на вході "
        if (text_pr[0] === '"') {
            let str = str_analise(text_pr)
            cat_and_add(str, str[1][0].length + 2)
            continue
        }

        // якщо на вході число
        if (/\d/.test(text_pr[0])) {
            cat_and_add(type_of_number(text_pr))
            continue
        }

        // припустим на вході токен
        let token = find_tokens(text_pr)
        if (typeof token !== "number") {
            cat_and_add(token)
        }
    }

    return acc
}
