from channels.generic.websocket import WebsocketConsumer
from django.conf import settings as djangoSettings

from scrapyd_api import ScrapydAPI
from .models import ScrapyTask

import time
import json

class ScrapyConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()        

    def disconnect(self, close_code):
        pass
    
    def receive(self, text_data):
        self.pid    = text_data
        self.sto    = ScrapyTask.objects.get(pid=self.pid)
        self.status = djangoSettings.SCRAPYD.job_status('iScrapy', self.sto.task_id)

        #while(self.status != 'finished'):            
            self.status = djangoSettings.SCRAPYD.job_status('iScrapy', self.sto.task_id)
            self.send(self.status)
            time.sleep(60);

        if (self.status == 'finished'):
            print("Finished");
            #file = ScrapyTask.objects.get(pid=self.pid)
            #file.file_name = 'https://s3.eu-central-1.amazonaws.com/ba-s3/scrapy_results/{0}.json'.format(self.pid)                        
            #file.save(update_fields=['file_name'])            
            