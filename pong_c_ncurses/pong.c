#include <ncursesw/ncurses.h>
#include <stdio.h>
#include <unistd.h>
#include <locale.h>
#include <wchar.h>

#define SLP 29
#define ROW 99
#define PADDLE_SIZE 5
#define WIN_SCORE 11

void init_field(char field[SLP][ROW]) {
    int i = 0;
    while (i < SLP) {
        int j = 0;
        while (j < ROW) {
            field[i][j] = (i == 0 || i == SLP - 1) ? '#' : (j == 0 || j == ROW - 1) ? '|' : (j == ROW / 2) ? '.' : ' ';
            j++;
        }
        i++;
    }
}

int update_paddle(char field[SLP][ROW], int *left_paddle, int *right_paddle) {
    int input = getch();
    if (input == 's' && *left_paddle > PADDLE_SIZE / 2 + 1) (*left_paddle)--;
    else if (input == 'x' && *left_paddle < SLP - PADDLE_SIZE / 2 - 2) (*left_paddle)++;
    else if (input == 'k' && *right_paddle > PADDLE_SIZE / 2 + 1) (*right_paddle)--;
    else if (input == 'm' && *right_paddle < SLP - PADDLE_SIZE / 2 - 2) (*right_paddle)++;

    int i = -PADDLE_SIZE / 2;
    while (i <= PADDLE_SIZE / 2) {
        field[*left_paddle + i][1] = '[';
        field[*right_paddle + i][ROW - 2] = ']';
        i++;
    }
    return input;
}

void update_ball(char field[SLP][ROW], int left_paddle, int right_paddle, int *ball_i, int *ball_j, int *dir_x, int *dir_y) {
    if (*ball_i == 1 || *ball_i == SLP - 2) *dir_y *= -1;
    
    int i = -PADDLE_SIZE / 2;
    bool hit_left = *ball_j == 2 && *dir_x == -1;
    bool hit_right = *ball_j == ROW - 3 && *dir_x == 1;
    while (i <= PADDLE_SIZE / 2) {
        if (hit_left && *ball_i == left_paddle + i) *dir_x *= -1;
        if (hit_right && *ball_i == right_paddle + i) *dir_x *= -1;
        i++;
    }

    *ball_i += *dir_y;
    *ball_j += *dir_x;
    field[*ball_i][*ball_j] = 'o';
}

void handle_goal(int *score, int *left_paddle, int *right_paddle, int *ball_i, int *ball_j, int *dir_x, int *dir_y) {
    (*score)++;
    *left_paddle = SLP / 2;
    *right_paddle = SLP / 2;
    *ball_i = SLP / 2;
    *ball_j = ROW / 2;
    *dir_x *= -1;
    *dir_y *= -1;
}

void draw_field(char field[SLP][ROW]) {
    int i = 0;
    while (i < SLP) {
        int j = 0;
        while (j < ROW) {
            printw("%c", field[i][j]);
            j++;
        }
        printw("\n");
        i++;
    }
}

int main() {
    setlocale(LC_ALL, "");
    char field[SLP][ROW];
    int left_paddle = SLP / 2, right_paddle = SLP / 2;
    int ball_i = SLP / 2, ball_j = ROW / 2;
    int dir_y = 1, dir_x = 1;
    int left_score = 0, right_score = 0;
    char winner = 'n', input = 'f';

    initscr();
    nodelay(stdscr, TRUE);
    cbreak();
    noecho();
    keypad(stdscr, TRUE);
    curs_set(0);

    while (input != 'q') {
        init_field(field);
        input = update_paddle(field, &left_paddle, &right_paddle);
        update_ball(field, left_paddle, right_paddle, &ball_i, &ball_j, &dir_x, &dir_y);

        if (ball_j == 1) {
            handle_goal(&right_score, &left_paddle, &right_paddle, &ball_i, &ball_j, &dir_x, &dir_y);
        } else if (ball_j == ROW - 2) {
            handle_goal(&left_score, &left_paddle, &right_paddle, &ball_i, &ball_j, &dir_x, &dir_y);
        }

        clear();
        mvprintw(0, 2, "🌳 LEFT PLAYER SCORE = %d 🌳", left_score);
        mvprintw(0, ROW - 30, "🌺 RIGHT PLAYER SCORE = %d 🌺\n", right_score);
        draw_field(field);
        refresh();

        if (left_score >= WIN_SCORE) {
            winner = 'l';
            break;
        } else if (right_score >= WIN_SCORE) {
            winner = 'r';
            break;
        }
        usleep(50000);
    }

    endwin();
    if (winner == 'l') printf("🌳 LEFT PLAYER WON! 🌳\n");
    else if (winner == 'r') printf("🌺 RIGHT PLAYER WON! 🌺\n");

    return 0;
}