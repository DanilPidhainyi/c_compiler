export default function code_generation (AST): string {

    let data: string = "tpt db '%d',0\n"

    function generation (AST) {
        function create(node) {
            let body: string = ""
            switch (node.type) {
                case 'function':
                    body += node.name + ':\n'
                    body += generation(node.body) + '\n'
                    body += 'end ' +  node.name + '\n'
                    return body
                case 'return':
                    return "invoke  crt__getch\n" +
                            "invoke  crt_exit,0\n" +
                            generation(node.body) + '\n' + "ret " + '\n'
                case 'number':
                    return node.name
                case 'add':
                    return 'mov AX, ' + create(node.body[0]) + '\n' +
                        'add AX, ' + create(node.body[1]) + '\n'
                case 'do_while':
                    //todo цикл
                case 'new_var':
                    const variable = node.body[0].name || '0'
                    data += node.name +
                        (node.returnType === 'int' ? ' DW ' : ' DQ ') +
                        variable + ';\n'
                    return ''
                case 'var':
                    return node.name
                case 'print':
                    return "invoke  crt_printf, ADDR tpt, " + generation(node.body) + "\n"

            }
        }
        return AST.map(create)
    }

    let body = generation(AST).join('')

    return '.386\n' +
        '.model flat, stdcall\n' +
        'option casemap: none\n' +
        'include \\masm32\\include\\masm32rt.inc\n' +
        '\n' +
        '\n' +
        'data segment\n' +
        data +
        'data ends\n' +
        '\n' +
        'text segment\n' +
         body +
        'text ends'

}