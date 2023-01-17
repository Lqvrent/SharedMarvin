##
## EPITECH PROJECT, 2023
## open library
## File description:
## Makefile
##

CFLAGS = -fPIC -shared
SOURCES = open.c
OBJECTS = $(SOURCES:.c=.o)
NAME = libopen.so

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
