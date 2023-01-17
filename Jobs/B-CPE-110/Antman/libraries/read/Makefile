##
## EPITECH PROJECT, 2023
## read library
## File description:
## Makefile
##

CFLAGS = -fPIC -shared
SOURCES = read.c
OBJECTS = $(SOURCES:.c=.o)
NAME = libread.so

all: $(NAME)

$(NAME): $(OBJECTS)
	$(CC) $(CFLAGS) -o $(NAME) $(OBJECTS)

$(OBJECTS): $(SOURCES)
	$(CC) -c $(SOURCES)

clean:
	rm -f $(OBJECTS)

fclean: clean
	rm -f $(NAME)

re: fclean all

.PHONY: all clean fclean re
