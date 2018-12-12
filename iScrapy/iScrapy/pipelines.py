# -*- coding: utf-8 -*-

# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://doc.scrapy.org/en/latest/topics/item-pipeline.html


from iScrapy.items import URLText

# from crawler.models import crawler

import uuid
import json

class URLTextPipeline(object):
    def open_spider(self, spider):
        self.file = open('{0}.json'.format(str(uuid.uuid4())), 'w+')

    def close_spider(self, spider):
        self.file.close()

    def process_item(self, item, spider):
        if ( 'text' not in item ):        
            item['text'] = "Empty"
        else:
            item['text'] = item['text'][0]
        item['url'] = item['url'][0]
        line = json.dumps(dict(item)) + "\n"
        self.file.write(line)
        return item