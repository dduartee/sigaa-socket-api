import sys
from pypasser import reCaptchaV3

sitekey = sys.argv[1]
action = sys.argv[2]

reCaptcha_response = reCaptchaV3('''
https://www.google.com/recaptcha/api2/anchor?ar=1&k={sitekey}&co=aHR0cHM6Ly9zaWdhYS5pZnNjLmVkdS5icjo0NDM.&hl=en&v=6MY32oPwFCn9SUKWt8czDsDw&size=invisible&sa={action}
''')
sys.stdout.write(reCaptcha_response)