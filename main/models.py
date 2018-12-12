from django.db import models

# Create your models here.
class ScrapyTask(models.Model):
    pid         = models.CharField(max_length=60, primary_key=True)
    task_id     = models.CharField(max_length=60)
    file_name   = models.CharField(max_length=60)

    def __str__(self):
        return self.pid
