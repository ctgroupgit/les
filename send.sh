#!/bin/bash
FILES=(./debug/*)
N=0
clear
echo    "    =============================="
echo    "    Please enter your choice:"
echo    "    ------------------------------"
for f in "${FILES[@]}" # iterate over the array.
do
    echo "    ($N) $f"
    ((N++))
done


echo    "    ------------------------------"

