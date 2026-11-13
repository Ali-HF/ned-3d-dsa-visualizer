#include <iostream>
using namespace std;

char charStack[100];
int charTop = -1;

void pushChar(char ch)
{
    charTop++;
    charStack[charTop] = ch;
}

char popChar()
{
    return charStack[charTop--];
}

char peekChar()
{
    return charStack[charTop];
}

bool isEmpty()
{
    return charTop == -1;
}

// Check matching brackets
bool isMatching(char a, char b)
{
    if (a == '(' && b == ')')
        return true;

    if (a == '{' && b == '}')
        return true;

    if (a == '[' && b == ']')
        return true;

    return false;
}

bool balancedParentheses(char exp[])
{
    charTop = -1;

    for (int i = 0; exp[i] != '\0'; i++)
    {
        if (exp[i] == '(' || exp[i] == '{' || exp[i] == '[')
        {
            pushChar(exp[i]);
        }
        else if (exp[i] == ')' || exp[i] == '}' || exp[i] == ']')
        {
            if (isEmpty())
                return false;

            char opening = popChar();

            if (!isMatching(opening, exp[i]))
                return false;
        }
    }

    return isEmpty();
}

// Operator precedence
int precedence(char op)
{
    if (op == '^')
        return 3;

    if (op == '*' || op == '/')
        return 2;

    if (op == '+' || op == '-')
        return 1;

    return 0;
}

// Infix to Postfix
void infixToPostfix(char infix[], char postfix[])
{
    charTop = -1;
    int j = 0;

    for (int i = 0; infix[i] != '\0'; i++)
    {
        char ch = infix[i];

        // Operand
        if ((ch >= '0' && ch <= '9') ||
            (ch >= 'a' && ch <= 'z') ||
            (ch >= 'A' && ch <= 'Z'))
        {
            postfix[j] = ch;
            j++;
        }

        // Opening bracket
        else if (ch == '(')
        {
            pushChar(ch);
        }

        // Closing bracket
        else if (ch == ')')
        {
            while (!isEmpty() && peekChar() != '(')
            {
                postfix[j] = popChar();
                j++;
            }

            if (!isEmpty())
                popChar();
        }

        // Operator
        else
        {
            while (!isEmpty() && peekChar() != '(' &&
                   precedence(peekChar()) >= precedence(ch))
            {
                postfix[j] = popChar();
                j++;
            }

            pushChar(ch);
        }
    }

    // Pop remaining operators
    while (!isEmpty())
    {
        postfix[j] = popChar();
        j++;
    }

    postfix[j] = '\0';
}

// Postfix Evaluation (single-digit operands)
int evaluatePostfix(char postfix[])
{
    int numStack[100];
    int numTop = -1;

    for (int i = 0; postfix[i] != '\0'; i++)
    {
        char ch = postfix[i];

        if (ch >= '0' && ch <= '9')
        {
            numTop++;
            numStack[numTop] = ch - '0';
        }
        else
        {
            if (numTop < 1)
                return -999999;

            int b = numStack[numTop--];
            int a = numStack[numTop--];

            int result;

            if (ch == '+')
                result = a + b;
            else if (ch == '-')
                result = a - b;
            else if (ch == '*')
                result = a * b;
            else if (ch == '/')
            {
                if (b == 0)
                    return -999999;

                result = a / b;
            }
            else
                return -999999;

            numTop++;
            numStack[numTop] = result;
        }
    }

    if (numTop != 0)
        return -999999;

    return numStack[numTop];
}

int main()
{
    int choice;
    char expression[100];
    char postfix[100];

    do
    {
        cout << "\n--- Stack Applications ---\n";
        cout << "1. Check Balanced Parentheses\n";
        cout << "2. Infix to Postfix\n";
        cout << "3. Evaluate Postfix\n";
        cout << "4. Exit\n";

        cout << "Enter choice: ";
        cin >> choice;

        switch (choice)
        {
            case 1:
                cout << "Enter expression: ";
                cin >> expression;

                if (balancedParentheses(expression))
                    cout << "Parentheses are Balanced.\n";
                else
                    cout << "Parentheses are Not Balanced.\n";

                break;

            case 2:
                cout << "Enter infix expression: ";
                cin >> expression;

                infixToPostfix(expression, postfix);

                cout << "Postfix expression: " << postfix << endl;
                break;

            case 3:
                cout << "Enter postfix expression: ";
                cin >> expression;

                {
                    int answer = evaluatePostfix(expression);

                    if (answer == -999999)
                        cout << "Invalid expression or division by zero.\n";
                    else
                        cout << "Result: " << answer << endl;
                }

                break;

            case 4:
                cout << "Exiting...\n";
                break;

            default:
                cout << "Invalid choice!\n";
        }

    } while (choice != 4);

    return 0;
}