#!/bin/bash
#echo "/cmd /home/andrea/Downloads/New folder/bgvabe052.txt" | nc 127.0.0.1 8010
while :
do
    clear
    cat<<EOF
    ==============================
    Working Directory /home/andrea/Developer/les
    ------------------------------
    Please enter your choice:

    (1) BESTELLUNG 1
    (2) MULTI
    (3) DELIVERY
    (4) INVOICE
    (5) gutshit
    (6) Inquiry
    (7) purchase order change
    (Q) Quit
    ------------------------------
EOF
  read -n1 -s
  case "$REPLY" in
  "1")  echo "/cmd /home/andrea/Developer/les/debug/bestellung1.txt" | nc 127.0.0.1 8010 ;;
  "2")  echo "/cmd /home/andrea/Developer/les/debug/dataMultiplo.txt" | nc 127.0.0.1 8010 ;;
  "3")  echo "/cmd /home/andrea/Developer/les/debug/delivery.txt" | nc 127.0.0.1 8010 ;;
  "4")  echo "/cmd /home/andrea/Developer/les/debug/invoice.txt" | nc 127.0.0.1 8010 ;;
  "5")  echo "/cmd /home/andrea/Developer/les/debug/gutshit.txt" | nc 127.0.0.1 8010 ;;
  "6")  echo "/cmd /home/andrea/Downloads/aa/inq.txt" | nc 127.0.0.1 8010 ;;
  "7")  echo "/cmd /home/andrea/Downloads/aa/inq1.txt" | nc 127.0.0.1 8010 ;;
  "q")  exit                      ;;
  "Q")  exit                      ;;
   * )  echo "invalid option"     ;;
  esac
  sleep 1
done
