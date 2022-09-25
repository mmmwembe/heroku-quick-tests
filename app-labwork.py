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


@app.route('/', methods=['POST'])
def upload_image():
	if 'files[]' not in request.files:
		flash('No file part')
		return redirect(request.url)
	files = request.files.getlist('files[]')
	file_names = []
	for file in files:
		if file and allowed_file(file.filename):
			filename = secure_filename(file.filename)
			file_names.append(filename)
			file.save(os.path.join(USER_CURRENT_IMG_WORKING_SUBDIR, filename))

	return render_template('classify-images.html', filenames=file_names, images_in_dir=get_images_list(USER_CURRENT_IMG_WORKING_SUBDIR))

@app.route('/', methods=['POST'])
def upload_image():
	if 'files[]' not in request.files:
		flash('No file part')
		return redirect(request.url)
	files = request.files.getlist('files[]')
	file_names = []
	for file in files:
		if file and allowed_file(file.filename):
			filename = secure_filename(file.filename)
			file_names.append(filename)
			file.save(os.path.join(USER_CURRENT_IMG_WORKING_SUBDIR, filename))

	return render_template('classify-images.html', filenames=file_names, images_in_dir=get_images_list(USER_CURRENT_IMG_WORKING_SUBDIR))