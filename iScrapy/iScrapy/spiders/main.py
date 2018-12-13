import scrapy
from scrapy.spiders import Rule, CrawlSpider
from scrapy.linkextractors.lxmlhtml import LxmlLinkExtractor
from scrapy.loader import ItemLoader
from iScrapy.items import URLText
import os

class ScrapingSpider(scrapy.Spider):    
    name = 'scrapy_results'                

    def __init__(self, *args, **kwargs):
        self.url                = kwargs.get('url')
        self.domain             = kwargs.get('domain')
        self.selector           = kwargs.get('selector')
        self.pid                = kwargs.get('pid')
        self.start_urls         = [self.url]
        self.allowed_domains    = [self.domain]        

    rules = (Rule(LxmlLinkExtractor(allow=()), callback='parse', follow=True),)
    
    #custom_settings = {                    
    #        'FEED_URI' : 's3://ba-s3/scrapy_results/%(pid)s.json'
    #}

    def parse(self, response):                
        il = ItemLoader( item=URLText(), response=response )
        il.add_value( 'url', response.url )
        il.add_css( 'text', self.selector )        

        for link in LxmlLinkExtractor(allow=self.allowed_domains,deny = ()).extract_links(response):                    
            yield response.follow( link.url, callback=self.parse )                  

        yield il.load_item()