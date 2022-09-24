from flask import Flask, render_template, session, redirect, url_for, request, jsonify
from flask_bootstrap import Bootstrap
from functools import wraps
from flask_pymongo import PyMongo
import pymongo
from pymongo import MongoClient
import json
from google.cloud import storage 
# from google.oauth2 import service_account
# from googleapiclient import discovery
# from google.cloud import storage as dns
import os

cluster =''
app = Flask(__name__)
app.secret_key = b'\xcc^\x91\xea\x17-\xd0W\x03\xa7\xf8J0\xac8\xc5'

# Bootstrap
bootstrap = Bootstrap(app)

try:
  cluster = MongoClient(os.environ["MONGODB_URL"])
except:
  pass






@app.route('/')
def home():

  model_urls =[]
  client = storage.Client()
  # for blob in client.list_blobs('2021_sign_language_detector_tfjs', prefix=''):
  for blob in client.list_blobs('2021_tflite_glitch_models', prefix='stack-plume-dust-classification/'):
    public_url = blob.public_url
    if public_url.endswith(tuple(["tflite", "h5", "keras"])):
      model_urls.append(public_url)
      # print('public url ', public_url) 


  return render_template('classify-images.html',models = model_urls, db = cluster["amina_db"])


if __name__ == '__main__':
    
    app.run()
