import sys
from pypasser import reCaptchaV3
from pypasser.structs import Proxy
from itertools import cycle

proxies = [
    {'HOST': '38.83.74.2', 'PORT': '443'},
    {'HOST': '38.83.74.2', 'PORT': '3128'},
    {'HOST': '20.241.236.196', 'PORT': '3128'},
    {'HOST': '149.102.243.172', 'PORT': '8080'},
    {'HOST': '65.108.230.239', 'PORT': '44605'},
    {'HOST': '65.108.230.239', 'PORT': '36675'},
    {'HOST': '65.108.230.239', 'PORT': '33822'},
    {'HOST': '65.108.230.239', 'PORT': '39383'},
    {'HOST': '65.108.230.239', 'PORT': '46019'},
    {'HOST': '65.108.230.239', 'PORT': '40617'}
]

sitekey = sys.argv[1]
action = sys.argv[2]
proxy = cycle(proxies)

reCaptcha_response = reCaptchaV3('''
https://www.google.com/recaptcha/api2/anchor?ar=1&k={sitekey}&co=aHR0cHM6Ly9zaWdhYS5pZnNjLmVkdS5icjo0NDM.&hl=en&v=6MY32oPwFCn9SUKWt8czDsDw&size=invisible&sa={action}
''', Proxy(Proxy.type.HTTPs, proxy['HOST'], proxy['PORT']))
sys.stdout.write(reCaptcha_response)