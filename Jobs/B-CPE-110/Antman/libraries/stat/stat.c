/*
** EPITECH PROJECT, 2023
** stat library
** File description:
** re-definition of stat()
*/

#include <sys/stat.h>
#include <errno.h>

int stat(const char *path, struct stat *buf)
{
    errno = ENOENT;
    return (-1);
}
