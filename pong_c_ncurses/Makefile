# Colors
DEF_COLOR   = "\033[0;39m"
GRAY        = "\033[0;90m"
YELLOW      = "\033[0;93m"
GREEN       = "\033[0;92m"
RED         = "\033[0;91m"
BLUE        = "\033[0;94m"
MAGENTA     = "\033[0;95m"
CYAN        = "\033[0;96m"
WHITE       = "\033[0;97m"
ORANGE      = "\033[38;5;222m"
GREEN_BR    = "\033[38;5;118m"
YELLOW_BR   = "\033[38;5;227m"
PINK_BR     = "\033[38;5;206m"
BLUE_BR     = "\033[38;5;051m"
PINK_BRR    = "\033[38;5;219m"

# Text styles
BOLD        = "\033[1m"
UNDERLINE   = "\033[4m"
BLINK       = "\033[5m"

NAME = pong

CXX = gcc
CXXFLAGS = -Wall -Wextra -Werror -I.
LDFLAGS = -lncursesw

SRCS = pong.c
OBJS = $(SRCS:.cpp=.o)

all: $(NAME)
	@printf $(DEF_COLOR)
	@printf $(BOLD)$(YELLOW)"	pong compiled!\n\n"
	@printf $(BOLD)$(GREEN_BR)
	@printf "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣀⠀⠀⠀⠀\n"
	@printf "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⣤⣴⣶⡿⠿⠿⠿⠿⠿⠿⠿⢷\n"
	@printf "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⣶⣿⡿⠛⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n"
	@printf "⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⣿⣿⡿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n"
	@printf "⠀⠀⠀⠀⠀⠀⢀⣾⣿⡿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n"
	@printf "⠀⠀⠀⠀⠀⣰⣿⣿⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n"
	@printf "⠀⠀⠀⢠⣾⣿⠿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n"
	@printf "⠀⠀⣴⣿⠿⠋⠀⠀⠀"$(BLUE)"Use ./pong\n"
	@printf "⠀⠈⠉    "$(BLUE)"Welcome\n\n"
	@printf $(BOLD)$(YELLOW)"	s/x left paddle\n"
	@printf $(BOLD)$(YELLOW)"	k/m right paddle\n"
	@printf $(BOLD)$(CYAN)"	q (quit)\n"

$(NAME): $(OBJS)
	$(CXX) $(CXXFLAGS) -o $(NAME) $(OBJS) $(LDFLAGS)

%.o: %.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@

clean:
	rm -f $(OBJS)

fclean: clean
	rm -f $(NAME)

re: fclean all

.PHONY: all clean fclean re