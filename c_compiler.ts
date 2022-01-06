import * as fs from 'fs';
import * as path from "path";
import lexing from "./lexing";
import parsing from "./parsing";
//
//
// // шлях до файлу з кодом с
// const path_file: string = path.join(__dirname, "./c_programs/empty.c")
// // синхронне читання данних з файлу
// const data: string = fs.readFileSync(path_file, 'utf8')
//
//
// console.log("Що лежить у файлі дата= \n\n", data);
// console.log(lexing(data));


const data = [
    [ 'int ', 'int_keyword' ],
    [ 'main', 'var_or_fun' ],
    [ '(', 'open parentheses' ],
    [ ')', 'close parentheses' ],
    [ '{', 'open brace' ],
    [ 'return ', 'return_keyword' ],
    [ '0', 'int_num' ],
    [ ';', 'semicolon' ],
    [ '}', 'close brace' ]
]

parsing(data)