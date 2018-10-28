import requests
import re
import datetime
import json
import os
from bs4 import BeautifulSoup

def parsegupshik(schoolCode):
    a = requests.get("https://stu.goe.go.kr/sts_sci_md00_001.do?schulCode={}&schulCrseScCode=4&schulKndScCode=4".format(schoolCode))

    soup = BeautifulSoup(a.text, "html.parser")

    table = soup.select(".tbl_type3 > tbody")

    splited = table[0].text.split('\n')

    gupshiks = dict()

    for i in splited:
	    if i:
		    text = re.sub(" {1,}",' ',re.sub("\\d{1,2}\\.", ' ', i))
		    temp = re.search('^\\d{1,2}', text)
		    if temp:
			    _day = int(temp.group())
		    text = re.sub("^\\d{1,2}", '', text)
		    text = text.replace(" ", "\n")
		    text = text.replace("[중식]", "[중식]\n")
		    text = text.replace("[석식]", "\n[석식]\n")
		    #print(str(_day) + ' : ' + text)
		    if len(text) == 0:
			    gupshiks[_day] = ''
		    elif len(text) == 1:
			    pass
		    else:
			    gupshiks[_day] = text
    return gupshiks

def loadgupshikdata(schoolCode, _day):
    if not os.path.exists("./gupshikdata"):
	    os.makedirs("./gupshikdata")
    try:
        gupshikfile = open("./gupshikdata/{}_{}_{}".format(schoolCode, datetime.date.today().year, datetime.date.today().month), "r")
        data = json.loads(gupshikfile.read())
        gupshikfile.close()
        return datetime.date.today().replace(day = _day).__str__() + "\n" + data[str(_day)]
    except FileNotFoundError:
        gupshikfile = open("./gupshikdata/{}_{}_{}".format(schoolCode, datetime.date.today().year, datetime.date.today().month), "w+")
        data = parsegupshik(schoolCode)
        gupshikfile.write(json.dumps(data))
        gupshikfile.close()
        return datetime.date.today().replace(day = _day).__str__() + "\n" + data[_day]

#print(loadgupshikdata("J100000588", 15))
