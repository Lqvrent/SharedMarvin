##
## EPITECH PROJECT, 2023
## malloc library
## File description:
## Makefile
##

CFLAGS = -fPIC -shared
SOURCES = malloc.c
OBJECTS = $(SOURCES:.c=.o)
NAME = libmalloc.so

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
