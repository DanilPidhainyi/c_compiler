export default function code_generation (AST): string {

    let data: string = "tpt db '%d', 0\n"

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
                            "ret " + generation(node.body) + '\n'
                case 'number':
                    return node.name
                case 'add':
                    if (node.body[0].type === "add" || node.body[1].type === "add") {
                        return 'add AX, ' + create(node.body[1]) + '\n'
                    } else {
                        return 'mov AX, ' + create(node.body[0]) + '\n' +
                            'add AX, ' + create(node.body[1]) + '\n'
                    }
                case 'do-while':

                    return ".repeat\n"+
                        generation(node.body) +
                        'mov DX, ' + create(node.params[0]) + '\n'+
                        'mov CX, ' + create(node.params[1]) + '\n'+
                        '.until (DX ' + node.name + ' CX)\n'
                case 'new_var':
                    const variable = '0'
                    data += node.name +
                        (node.returnType === 'int' ? ' DW ' : ' DQ ') +
                        variable + '\n'
                    return ''
                case 'var':
                    return node.name
                case 'to assign':
                    if (node.body[0].type === "number") {
                        return 'mov ' + node.name + ', ' + generation(node.body) + '\n'
                    } else {
                        return generation(node.body) + 'mov ' + node.name + ', AX' + '\n'
                    }

                case 'print':
                    // todo освободить регістр у ньому пощитать і отправить на прінт
                    return "invoke  crt_printf, ADDR tpt, " + generation(node.body) + "\n"

                case 'not =':
                    return create(node.body[0]) + ' != ' + create(node.body[1])

            }
        }
        return AST.map(create).join('')
    }

    let body = generation(AST)

    return '.386\n' +
        '.model flat, stdcall\n' +
        'option casemap: none\n' +
        'include \\masm32\\include\\masm32rt.inc\n' +
        '\n' +
        '\n' +
        'data segment\n' +
        data + '\n' +
        'data ends\n' +
        '\n' +
        'text segment\n' +
         body + '\n' +
        'text ends'

}