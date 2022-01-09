import * as fs from 'fs';
import * as path from "path";
import lexing from "./lexing";
import parsing from "./parsing";
import code_generation from "./code_generation";

// список файлів у папці
// fs.readdirSync(path.join(__dirname, "./c_programs/"))

const name_file = "add"
// шлях до файлу з кодом с
const path_input_file: string = path.join(__dirname, "./c_programs/" + name_file + ".c")
// шлях до вихідного коду asm
const path_return_file: string = path.join(__dirname, "./masm32_programs/"+ name_file + ".asm")
// шлях до батніка
const path_asm_compile_file: string = path.join(__dirname, "./masm32_programs/masm_compile.bat")

// синхронне читання данних з файлу
const data: string = fs.readFileSync(path_input_file, 'utf8')


console.log("Що лежить у файлі дата= \n\n", data);

const lex = lexing(data)
console.log(lex);

const par = parsing(lex)
console.log(par)

const cod = code_generation(par)
console.log(cod);

const error = err => {
    if (err != null) {
        console.log("err= ",  err)
    }
}

// синхронни запис у файл
fs.writeFile(path_return_file, cod, error)

// запис у батнік
fs.writeFile(
    path_asm_compile_file,
    "ml /c /coff .\\" + name_file + ".asm\n" +
    "link /subsystem:console .\\" + name_file + ".obj\n" +
    "pause",
    error)