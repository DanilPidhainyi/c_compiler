import parsing from "./parsing";
import lexing from "./lexing";

const lexin = lexing(
    "int a = 5;\n" +
    "int main() {\n" +
    "   return a + 6;\n" +
    "}")
console.log(lexin);
console.log(parsing(lexin));