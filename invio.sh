#!/bin/bash
#echo "/cmd /home/andrea/Downloads/New folder/bgvabe052.txt" | nc 127.0.0.1 8010
while :
do
    clear
    cat<<EOF
    ==============================
    Working Directory $(PWD)
    ------------------------------
    Please enter your choice:

    (1) LIEFERSCHEIN
    (2) ANFRAGE
    (3) BESTELLUNG
    (4) AUFTRAGSBESTESTIGUNG
    (5) RECHNUNG
    (6) ANFRAGE DOPPIO DOCUMENTO
    (7) BESTELLUNG 108151
    (8) AAAAAAA
    (9) BESTELLUNG 108141
    (a) LIEFERSCHEIN 105829
    (b) RECHNUNG 105829
    (c) AUFTRAGSBESTESTIGUNG 18065604
    (d) BESTELLUNG 108168
    (e) AUFTRAGSBESTESTIGUNG 190289
    (f) BESTELLUNG 108177
    (g) GUTSCHRIFT
    (h) CREDIT NOTE
    (i) INVOICE
    (l) DELIVERY NOTE
    (m) PURCHASE
    (n) BESTELLUNG 108205
    (o) LIEFERSCHEIN KOPIE
    (p) GUTSCHRIFT 700207
    (\) RECHNUNG ultima
    (r) LIEFERSCHEIN ultima
    (Q) Quit
    ------------------------------
EOF
  read -n1 -s
  case "$REPLY" in
  "1")  echo "/cmd $(PWD)/debug/bgvlse052.txt" | nc 127.0.0.1 8010 ;;
  "2")  echo "/cmd $(PWD)/debug/bgeane044.txt" | nc 127.0.0.1 8010 ;;
  "3")  echo "/cmd $(PWD)/debug/bgeeke021.txt" | nc 127.0.0.1 8010 ;;
  "4")  echo "/cmd $(PWD)/debug/bgvabe052.txt" | nc 127.0.0.1 8010 ;;
  "5")  echo "/cmd $(PWD)/debug/bgvrge049.txt" | nc 127.0.0.1 8010 ;;
  "6")  echo "/cmd $(PWD)/debug/bgvlse052.txt" | nc 127.0.0.1 8010 ;;
  "7")  echo "/cmd $(PWD)/debug/data108151.csv" | nc 127.0.0.1 8010 ;;
  "8")  echo "/cmd $(PWD)/debug/data18.csv" | nc 127.0.0.1 8010 ;;
  "9")  echo "/cmd $(PWD)/debug/data_ooo.csv" | nc 127.0.0.1 8010 ;;
  "a")  echo "/cmd $(PWD)/debug/105829liferchein.csv" | nc 127.0.0.1 8010 ;;
  "b")  echo "/cmd $(PWD)/debug/rechnug105829.csv" | nc 127.0.0.1 8010 ;;
  "c")  echo "/cmd $(PWD)/debug/auftra18065604.csv" | nc 127.0.0.1 8010 ;;
  "d")  echo "/cmd $(PWD)/debug/data_108168.csv" | nc 127.0.0.1 8010 ;;
  "e")  echo "/cmd $(PWD)/debug/nail.csv" | nc 127.0.0.1 8010 ;;
  "f")  echo "/cmd $(PWD)/debug/best108177.txt.csv" | nc 127.0.0.1 8010 ;;
  "g")  echo "/cmd $(PWD)/debug/creditnoteDE.csv" | nc 127.0.0.1 8010 ;;
  "h")  echo "/cmd $(PWD)/debug/creditnoteEN.csv" | nc 127.0.0.1 8010 ;;
  "i")  echo "/cmd $(PWD)/debug/invoice.txt" | nc 127.0.0.1 8010 ;;
  "l")  echo "/cmd $(PWD)/debug/delivery.txt" | nc 127.0.0.1 8010 ;;
  "m")  echo "/cmd $(PWD)/debug/purchase.txt" | nc 127.0.0.1 8010 ;;
  "n")  echo "/cmd $(PWD)/debug/108205.csv" | nc 127.0.0.1 8010 ;;
  "o")  echo "/cmd $(PWD)/debug/bgvlse040.csv" | nc 127.0.0.1 8010 ;;
  "p")  echo "/cmd $(PWD)/debug/bgvgse031.csv" | nc 127.0.0.1 8010 ;;
  "\\")  echo "/cmd $(PWD)/debug/bgvrge040.txt" | nc 127.0.0.1 8010 ;;
  "r")  echo "/cmd $(PWD)/debug/lieferschein.txt" | nc 127.0.0.1 8010 ;;
  "q")  exit                      ;;
  "Q")  exit                      ;;
   * )  echo "invalid option"     ;;
  esac
  sleep 1
done
