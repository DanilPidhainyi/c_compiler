export default function code_generation (AST): string {

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
                    return  "ret " + generation(node.body) + '\n'
                case 'number':
                    return node.name
                case 'do_while':
                    //todo цикл
                case 'var':
                    //todo змінні
            }
        }
        return AST.map(create)
    }



    return '.386\n' +
        '.model flat, stdcall\n' +
        'option casemap: none\n' +
        'include \\masm32\\include\\masm32rt.inc\n' +
        '\n' +
        '\n' +
        'data segment\n' +
        'data ends\n' +
        '\n' +
        'text segment\n' +
        '----------------------------\n'+
        generation(AST) +
        '----------------------------\n'+
        'text ends'

}