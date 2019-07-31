#!/usr/bin/env python3

import socket

HOST = '127.0.0.1'  # The server's hostname or IP address
PORT = 8010        # The port used by the server

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.connect((HOST, PORT))
    # s.sendall(b'\x00\x00\x00\x8dRUN\x00C:\\Programme\\Microsoft Office\\OFFICE11\\msaccess.exe \\\\10.76.139.20\\Berichtsgenerator\\bgeeke.mdb /cmd /opt/nova/zz/data/bgeeke022.txt\x00')
    s.sendall(b'\x00\x00\x00\x8dRUN\x00C:\\Programme\\Microsoft Office\\OFFICE11\\msaccess.exe \\\\10.76.139.20\\Berichtsgenerator\\bgeeke.mdb /cmd /home/andrea/Downloads/New folder/bgvlse052.txt\x00')
    data = s.recv(1024)

print('Received', repr(data))
