import os

from django.shortcuts import render
from django.contrib.staticfiles.templatetags.staticfiles import static
from django.conf import settings as djangoSettings
from django.http import HttpResponse
from django.template import RequestContext

from .models import ScrapyTask

from urllib.parse import urlparse, urljoin
from scrapyd_api import ScrapydAPI

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, WebDriverException

import tempfile
import time
import io
import boto3
import uuid
import datetime
import re

chrome_options = Options()
chrome_options.binary_location = os.environ.get('../drivers/chromedriver.exe')
chrome_options.add_argument('--disable-gpu')
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--headless')
driver = webdriver.Chrome(chrome_options=chrome_options, executable_path=os.environ.get('CHROMEDRIVER_PATH'))

injected_js     = (
    """        
        (function(d, script) {
            // set host url to body
            document.body.setAttribute('host', d.domain);
            document.body.setAttribute('path', d.location.pathname);

            // create a turn-on/turn-off crawl button
            var div = document.createElement('div');
            div.innerHTML = \"<button class='document-viewing' id='turnOffCrawlBtn'>Turn on scraping</button>\".trim();
            document.body.appendChild(div.firstChild); 

            // load stylesheet
            var style = document.createElement('style');
            style.innerHTML = \"#turnOffCrawlBtn { position: fixed;z-index:9999999999999999999999;top:50%;right:0;font-size:25px;color:#fff;background:#007bff;border-color:#007bff;border-radius:.3rem;line-height:1.5;cursor:pointer;padding:.5rem 1rem;display:block;font-weight:400;text-align:center;white-space:nowrap;vertical-align:middle;border:1px solid transparent;transition:color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;} #turnOffCrawlBtn:hover {background-color:#0062cc;border-color:#005cbf} \";
            d.head.appendChild(style);

            // load script with asset-logic
            scriptAsset = d.createElement('script');
            scriptAsset.type = 'text/javascript';
            scriptAsset.async = true;
            scriptAsset.onload = function(){
                // remote script has loaded
            };
            scriptAsset.src = '/static/main/js/asset_loader.js';
            d.head.appendChild(scriptAsset);                    

            // load font-awesome to target site
            var link = document.createElement('div');
            link.innerHTML = '<link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css\">';
            d.head.appendChild(link);                       

            // load script with crawling-logic
            scriptCrawl = d.createElement('script');
            scriptCrawl.type = 'text/javascript';
            scriptCrawl.async = true;
            scriptCrawl.onload = function(){
                // remote script has loaded
            };
            scriptCrawl.src = '/static/main/js/crawl.js';
            d.head.appendChild(scriptCrawl);    

        }(document));
    """
)

s3      = boto3.resource('s3')

# Create your views here.
def index(request):            

    pid = str(uuid.uuid4())    
    ScrapyTask.objects.create(pid=pid)
    
    url = request.POST.get('iframe-nav')
    if (url == None):
        url = ""        
    else:    
        domain = urlparse(url).netloc
        
        driver.get(url)
        driver.execute_script(injected_js)

        path=os.path.join(djangoSettings.MAIN_DIR_STATIC_TMP, 'default_iframe.html')
        defIframe=open(path, 'w',encoding='utf-8')    

        defIframe.write(driver.page_source)
        defIframe.close()   

    print(request.path)
    context={'default_page':static(os.path.join('main','tmp','default_iframe.html')), 'url': url, 'pid': pid}
    response = render(request, 'main/index.html', context)                        
    return response

def scrapy(request):
    url     = request.POST.get('url')
    domain  = request.POST.get('host')
    xpath   = request.POST.get('xpath')
    pid     = request.POST.get('pid')
    task    = djangoSettings.SCRAPYD.schedule('iScrapy', 'scrapy_results', pid=pid, url=url, domain=domain, selector=xpath)        
    
    tmp = ScrapyTask.objects.get(pid=pid)
    tmp.task_id = task
    tmp.save(update_fields=['task_id'])    

    #status  = djangoSettings.SCRAPYD.job_status('hScrapy', task)

    return render(request, 'main/index.html', context={})