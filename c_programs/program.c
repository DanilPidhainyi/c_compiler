int a = 1;
int b;
int f = 0;

int main() {
    b = 5;
    do {
        f = f + a;
        a = a + 1;
    } while (a != b);
    printf(f);
   return 0;
}