#!/bin/bash

# Binaries
rm=$(which rm)

# Preload the library passed as argument
export LD_PRELOAD=project-data/libraries/$1/lib$1.so

# Antman
./antman/antman project-data/files/lyrics/nw.lyr 1 > libloader-output.txt
ret=$?
echo "Antman exited with code $ret"

# Giantman
./giantman/giantman libloader-output.txt 1 #  > libloader-output.txt
ret=$?
echo "Giantman exited with code $ret"

# Cleanup
$rm libloader-output.txt
