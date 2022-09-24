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
  cluster = MongoClient('mongodb+srv://mmm111:Password123@3megacluster.cnmlv.mongodb.net/db?retryWrites=true&w=majority')
except:
  pass

gcp_type = os.environ["TYPE"]
gcp_project_id = os.environ["PROJECT_ID"] 
gcp_private_key_id = os.environ["PRIVATE_KEY_ID"]
gcp_private_key = os.environ["PRIVATE_KEY"]
gcp_client_email = os.environ["CLIENT_EMAIL"]
gcp_client_id =os.environ["CLIENT_ID"]
gcp_auth_uri = os.environ["AUTH_URI"]
gcp_token_uri = os.environ["TOKEN_URI"]
gcp_auth_provider_x509_cert_url = os.environ["AUTH_PROVIDER_X509_CERT_URL"]
gcp_client_x509_cert_url =os.environ["CLIENT_X509_CERT_URL"]

gcp_sa_credentials = {
  "type": os.environ["TYPE"],
  "project_id": os.environ["PROJECT_ID"],
  "private_key_id": os.environ["PRIVATE_KEY_ID"],
  "private_key": os.environ["PRIVATE_KEY"],
  "client_email": os.environ["CLIENT_EMAIL"],
  "client_id": os.environ["CLIENT_ID"],
  "auth_uri": os.environ["AUTH_URI"],
  "token_uri": os.environ["TOKEN_URI"],
  "auth_provider_x509_cert_url": os.environ["AUTH_PROVIDER_X509_CERT_URL"],
  "client_x509_cert_url": os.environ["CLIENT_X509_CERT_URL"]
}

creditials_json = json.dumps(gcp_sa_credentials)

# os.environ["GOOGLE_APPLICATION_CREDENTIALS"]=creditials_json # gcp_sa_credentials #'/content/amina-bucket-service-account.json'

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


  return render_template('classify-images.html', data=gcp_sa_credentials, models = model_urls, db = cluster["amina_db"])


if __name__ == '__main__':
    
    app.run()
