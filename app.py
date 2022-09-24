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


def get_public_url_files_array_from_google_cloud_storage(bucket_name, sub_directory_path, target_file_types_array):
  # Example usage:
  #   bucket_name = '2021_tflite_glitch_models'
  #   sub_directory_path ='stack-plume-dust-classification/'
  #   target_file_types_array = ["tflite", "h5", "keras"]...another example: target_file_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]
  returned_public_urls =[]
  client = storage.Client()
  for blob in client.list_blobs(bucket_name, prefix=sub_directory_path):
    public_url = blob.public_url
    if public_url.endswith(tuple(target_file_types_array)):
      returned_public_urls.append(public_url)

  return returned_public_urls




@app.route('/')
def home():

  model_urls =get_public_url_files_array_from_google_cloud_storage('2021_tflite_glitch_models', 'stack-plume-dust-classification/', ["tflite", "h5", "keras"])
  

  return render_template('classify-images.html',models = model_urls, db = cluster["amina_db"])


if __name__ == '__main__':
    
    app.run()
