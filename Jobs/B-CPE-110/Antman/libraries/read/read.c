/*
** EPITECH PROJECT, 2023
** read library
** File description:
** re-definition of read()
*/

#include <unistd.h>
#include <errno.h>

ssize_t read(int fd, void *buf, size_t count)
{
    errno = EIO;
    return (-1);
}
