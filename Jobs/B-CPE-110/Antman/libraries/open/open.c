/*
** EPITECH PROJECT, 2023
** open library
** File description:
** re-definition of open()
*/

#include <fcntl.h>
#include <errno.h>

int open(const char *pathname, int flags, ...)
{
    errno = ENOENT;
    return (-1);
}
