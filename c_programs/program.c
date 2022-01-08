int a = 5;
int b = 9;
int acc = 0;

int main() {
    do {
        acc = acc + a;
        a = a + 1;
    } while (b != a);


   return 0;
}