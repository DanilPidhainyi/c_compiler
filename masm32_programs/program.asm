.386
.model flat, stdcall
option casemap: none
include \masm32\include\masm32rt.inc


data segment
tpt db '%d', 0
a DW 0
b DW 0
f DW 0

data ends

text segment
mov a, 1
mov f, 0
main:
mov b, 5
.repeat
mov AX, f
add AX, a
mov f, AX
mov AX, a
add AX, 1
mov a, AX
mov DX, a
mov CX, b
.until (DX == CX)
invoke  crt_printf, ADDR tpt, f
invoke  crt__getch
invoke  crt_exit,0
ret 0

end main

text ends