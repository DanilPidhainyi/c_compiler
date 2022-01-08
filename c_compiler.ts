import * as fs from 'fs';
import * as path from "path";
import lexing from "./lexing";
import parsing from "./parsing";
import code_generation from "./code_generation";


// шлях до файлу з кодом с
const path_input_file: string = path.join(__dirname, "./c_programs/add.c")
// шлях до вихідного коду asm
const path_return_file: string = path.join(__dirname, "./masm32_programs/add.asm")

// синхронне читання данних з файлу
const data: string = fs.readFileSync(path_input_file, 'utf8')


console.log("Що лежить у файлі дата= \n\n", data);

const lex = lexing(data)
console.log(lex);

const par = parsing(lex)
console.log(par)

const cod = code_generation(par)
console.log(cod);

// синхронни запис у файл
fs.writeFileSync(path_return_file, cod)
