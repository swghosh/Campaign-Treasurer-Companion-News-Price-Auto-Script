#!/usr/bin/env python3

import csv
import json

''' CONSTANTS '''
CSV_FILE_PATH_1 = './news1.csv'
CSV_FILE_PATH_2 = './news2.csv'
JSON_FILE_PATH = './news.json'

''' ============================ '''

csvInFile1 = open(CSV_FILE_PATH_1, 'r', encoding = 'UTF-8')
csvInFile2 = open(CSV_FILE_PATH_2, 'r', encoding = 'UTF-8')
jsonOutFile = open(JSON_FILE_PATH, 'w', encoding = 'UTF-8')

newsList1 = []
newsList2 = []

for news in csv.DictReader(csvInFile1):
    newsList1.append(news)
for news in csv.DictReader(csvInFile2):
    newsList2.append(news)

csvInFile1.close()
csvInFile2.close()

mapNewsFn = lambda news: {
    'timeId': int(news['timeId']),
    'news': str(news['news']),
    'percentage': float(news['percentage']),
    'item': str(news['item'])
}

newsListFull = {
    "scriptA": list(map(mapNewsFn, newsList1)),
    "scriptB": list(map(mapNewsFn, newsList2))
}

dataAsJson = json.dumps(newsListFull)

print(dataAsJson, end = '', file = jsonOutFile)

jsonOutFile.close()
