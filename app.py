from flask import Flask, render_template, session, redirect, url_for, request, jsonify,flash, Blueprint
from werkzeug.utils import secure_filename
from flask_bootstrap import Bootstrap
from functools import wraps
import pymongo
from pymongo import MongoClient
from flask_pymongo import PyMongo
import json
from google.cloud import storage 
import uuid
# from google.oauth2 import service_account
# from googleapiclient import discovery
# from google.cloud import storage as dns
import os
from flask_session import Session
import datetime
# from datetime import timedelta 
import base64
from PIL import Image
from io import BytesIO
# app.secret_key = 'A0AKR5TGD\ R~XHH!jmN]LWX/,?RT'

import re
from io import StringIO

from urllib.request import urlopen
from io import BytesIO
from zipfile import ZipFile
import os
import glob
import json
import time

from passlib.hash import pbkdf2_sha256
import nbformat as nbf

from python_amina_modules.colab_notebook_writer import *
import tempfile
import shutil
from urllib.request import urlopen


#===========================================================
# USER DIRECTORIES
#===========================================================
CURRENTLY_ACTIVE_FOLDER ="dog"
active_folder ="dogs"
ALLOWED_EXTENSIONS = '' # set(['png', 'jpg', 'jpeg'])
UPLOAD_FOLDER = 'static/uploads/'
IMAGES_FOLDER = 'static/images/'
USER_IMAGES_DIR = 'static/images/user_2/user_images'
USER_CROPPED_IMG_DIR = 'static/images/user_2/cropped-labels'
USER_CURRENT_IMG_WORKING_SUBDIR ='static/images/user_2/user_images/dog'
USER_CROPPED_IMG_WORKING_SUBDIR ='static/images/user_2/cropped-labels/dog'


cluster =''
app = Flask(__name__)
app.secret_key = b'\xcc^\x91\xea\x17-^\x91\xea\x17-\xd0W\x03\xa7\xf8J0\xac8\xc5'
app.config["SESSION_PERMANENT"] = True
app.config["SESSION_TYPE"] = "filesystem"
# app.config['SECRET_KEY'] = os.urandom(24)
# this is important or wont work
# app.config['SESSION_COOKIE_NAME'] = "my_session"
# app.permanent_session_lifetime = timedelta(minutes=5)
Session(app)

# Bootstrap
bootstrap = Bootstrap(app)

# blueprintObj = Blueprint("blueprintObject", __name__, template_folder='templates')

try:
  # cluster = MongoClient(os.environ["MONGODB_URL"])
  cluster = MongoClient(os.environ["MONGODB_URL"])
  # mongodb_client = PyMongo(app, uri=os.environ["MONGODB_URL"])
  # cluster = mongodb_client.db

except:
  pass


def get_key_value_arrays(my_canvas_data):
  results_keys = []
  results_values = []
  for index in range(len(my_canvas_data)):
      for key in my_canvas_data[index]:
        results_keys.append(key)
        results_values.append(my_canvas_data[index][key])

  return results_keys, results_values

def get_image_label_json(url):
  response = urlopen(url)
  data_json = json.loads(response.read())
  return data_json

# NOTES - Connecting Heroku to Google Cloud Storage
# 1) Setup bucket on gcp in project
# 2) Created service account and downloaded jsons credentials
# 3) Gave service account permissions: (a) Storage Admin and (b) Storage Legacy Bucket Reader permissions
# 3) See amina-google-cloud-storage.ipynb in GCP Colab for other steps
# 4) Uploaded credentials json to Heroku using buildpack and guidance from https://devdojo.com/bryanborge/adding-google-cloud-credentials-to-heroku

def start_session(_user):
    # passes the entire user object /dictionary to session. Then we delete password from the session object
    del _user['password']
    session["logged_in"] = True
    session["user"] = _user
    # return jsonify(_user), 200

def get_public_url_files_array_from_google_cloud_storage(bucket_name, bucket_sub_directory_path, target_file_types_array):
  # Example usage:
  #   bucket_name = '2021_tflite_glitch_models'
  #   sub_directory_path ='stack-plume-dust-classification/'
  #   target_file_types_array = ["tflite", "h5", "keras"]...another example: target_file_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]
  returned_public_urls =[]
  client = storage.Client()
  for blob in client.list_blobs(bucket_name, prefix=bucket_sub_directory_path):
    public_url = blob.public_url
    if public_url.endswith(tuple(target_file_types_array)):
      returned_public_urls.append(public_url)

  return returned_public_urls


def upload_file_to_bucket(bucket_name, bucket_sub_dir_path, path_of_file_to_upload, allowable_file_types_array):
    """ Upload data to a bucket"""
    # The blob in the bucket is given the filename of the file being uploaded. 
    # Example use:
    # bucket_name ="amina-files"
    # bucket_sub_dir_path ="user_id/user-images/dog"
    # path_of_file_to_upload = "/static/images/dog_01.png"
    # allowable_file_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]
    returned_public_urls =[]
    client = storage.Client()

    bucket = client.get_bucket(bucket_name)
    
    # filename_of_file_being_uploaded =  os.path.basename(path_of_file_to_upload)
    filepath, filename_of_file_being_uploaded = os.path.split(path_of_file_to_upload)

    blob_full_path = os.path.join(bucket_sub_dir_path, filename_of_file_being_uploaded)

    blob = bucket.blob(blob_full_path)
    if filename_of_file_being_uploaded.endswith(tuple(allowable_file_types_array)):
      blob.upload_from_filename(path_of_file_to_upload)
    
    #returns a public url
    return blob.public_url

def upload_multiple_local_files_to_gcp_return_public_urls(local_dir_images_dir, bucket_name, bucket_sub_dir_path, allowable_file_types_array):
  # Example arguments
  #  local_dir_images_dir='static/project-test-images/dust'
  #  bucket_name ="amina-files"
  #  bucket_sub_dir_path="dust/user2/"
  #  allowable_file_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]
  public_urls_array = []
  try:

    list_of_images = os.listdir(local_dir_images_dir)
    for image in list_of_images:
      filepath_of_file_to_upload = os.path.join(local_dir_images_dir,image)
      blob_public_url = upload_file_to_bucket(bucket_name, bucket_sub_dir_path, filepath_of_file_to_upload, allowable_file_types_array)
      public_urls_array.append(blob_public_url)
  
  except:
    pass  

  return public_urls_array

def allowed_file(filename):
	return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def getImageNameAndExtension(image_name):
    file_name, ext = os.path.splitext(image_name)
    return file_name, ext

def get_filename_and_extension(file_path):
  """ This function splits a filepath to a filename and extension
    It takes as an argument the file path and outputs the filename and the extension"""
  filename, ext = os.path.splitext(file_path)
  return filename, ext

def get_images_list(dir):
  images_list_raw = os.listdir(dir)
  images_list_filtered =[]
  for image in images_list_raw:
    if image.lower().endswith(tuple(["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"])):
      image_path = os.path.join(dir, image)
      images_list_filtered.append(image_path) 
  return images_list_filtered

def getLabelFileFromClassificationModel(path_to_zip_file, tmp_dir_to_extract_to):
  # Create a ZipFile Object and load sample.zip in it
  with ZipFile(path_to_zip_file, 'r') as zipObj:
    # Get a list of all archived file names from the zip
    listOfFileNames = zipObj.namelist()
    # Iterate over the file names
    for fileName in listOfFileNames:
      # Check filename endswith csv
      if fileName.endswith('.txt'):
        # Extract a single file from zip
        zipObj.extract(fileName, tmp_dir_to_extract_to)
        path_to_labelmap = os.path.join(tmp_dir_to_extract_to,fileName)
           #print(path_to_labelmap)
  return path_to_labelmap

def convertTxtLabelFileToLabels(path_to_labelmap):
  comma_seperated_labels =''
  a_file = open(path_to_labelmap)
  for line in a_file:
    comma_seperated_labels+=line
    # print(comma_seperated_labels)
    labels = comma_seperated_labels.replace('\n', ',').rstrip(',')
    # print(labels)
  return labels

def deleteFilesInTempDir(path_to_dir):
  files = glob.glob(path_to_dir + '/*')
  for f in files:
    os.remove(f)

def create_dir(dir):
  # If directory doe not exist, create it
  isExist = os.path.exists(dir)
  if not isExist:
    # Create a new directory because it does not exist 
    os.makedirs(dir)

#========================================================================
#              Get images array from user_projects     
#========================================================================    
def get_images_array_from_user_projects(user_id, xproject_id, xlabel, target_array_string):
  # target_array_string can be one of the following:
  # target_array_string ['original_image_urls','all_jpeg_image_urls', 'cropped_image_urls', 
  #                      'augmentation_image_urls', 'original_image_label_jsons', 'all_jpeg_image_label_jsons', 
  #                      'augmentation_image_label_jsons']
  label_info_in_user_projects = {'project_js_id': xproject_id,  'user_id': user_id, 'labels.label': xlabel}
  results = user_projects.find(label_info_in_user_projects)
  labels =results[0]["labels"]
  
  user_images_array = []
  for label in labels:
    if label["label"] == xlabel:
      user_images_array = label[target_array_string]
      
  return user_images_array  

#==========================================================================
#          Get ISODate
#===========================================================================
# Get ISODate for MongoDB date
def getISODate():
    ts = time.time()
    isodate = datetime.datetime.fromtimestamp(ts, None)
    print('ISODate : ', isodate)
    return isodate

#==========================================================================
#           Save Text to GCP Directory to Speed Up Future Uploads
#===========================================================================
def write_text_to_gcp(user_id, xproject_id, xlabel):

    bucket_name = session["user"]["gcp_bucket_dict"]["bucket_name"]
    gcp_subdirectory_path = os.path.join(session["user"]["gcp_bucket_dict"]["user_images_subdir"], xproject_id, xlabel)
    client = storage.Client()
    bucket = client.get_bucket(bucket_name)
    filename = xproject_id + ".txt" 
    blob_full_path = os.path.join(gcp_subdirectory_path, filename)
    blob = bucket.blob(blob_full_path)
    blob.upload_from_string("Created by : " + user_id + " Date : " + getISODate())


def write_text_to_gcp_v2(user_id, blob_full_path):
    bucket_name = session["user"]["gcp_bucket_dict"]["bucket_name"]
    client = storage.Client()
    bucket = client.get_bucket(bucket_name)
    blob = bucket.blob(blob_full_path)
    blob.upload_from_string("Created by : " + user_id)        
    return blob.public_url

def write_text_to_gcp_v3(user_id, blob_full_path):
    bucket_name = session["user"]["gcp_bucket_dict"]["bucket_name"]
    client = storage.Client()
    bucket = client.get_bucket(bucket_name)
    blob = bucket.blob(blob_full_path)
    # blob.upload_from_string("Created by : " + user_id)
    if not blob.exists():
        iso_date = datetime.datetime.now().isoformat()
        blob.upload_from_string("Created by : " + user_id + " Date : " + iso_date)       
    return blob.public_url


def write_text_to_gcp_for_user_dir_path(user_info_dir, user_id, xproject_id, xlabel):
    bucket_name = session["user"]["gcp_bucket_dict"]["bucket_name"]
    gcp_subdirectory_path = os.path.join(user_info_dir, xproject_id, xlabel)
    client = storage.Client()
    bucket = client.get_bucket(bucket_name)
    filename = xproject_id + ".txt" 
    blob_full_path = os.path.join(gcp_subdirectory_path, filename)
    blob = bucket.blob(blob_full_path)
    if not blob.exists():
        iso_date = datetime.datetime.now().isoformat()
        blob.upload_from_string("Created by : " + user_id + " Date : " + iso_date) 
        # blob.upload_from_string("Created by : " + user_id + " Date : " + getISODate())
    
def write_text_to_gcp_for_json_files(user_id, xproject_id, xlabel):

    bucket_name = session["user"]["gcp_bucket_dict"]["bucket_name"]
    gcp_subdirectory_path = os.path.join(session["user"]["gcp_bucket_dict"]["user_images_json_files_normalized"], xproject_id, xlabel)
    client = storage.Client()
    bucket = client.get_bucket(bucket_name)
    filename = xproject_id + ".txt" 
    blob_full_path = os.path.join(gcp_subdirectory_path, filename)
    blob = bucket.blob(blob_full_path)
    blob.upload_from_string("Created by : " + user_id)
    # blob.upload_from_string("Created by : " + user_id + " Date : " + getISODate())    
#==========================================================================
#           Save Text to GCP Directory to Speed Up Future Uploads
#===========================================================================
def save_json_to_gcp(subdirectory_path, user_id, xproject_id, xlabel,json_object_to_save): 
    # write_text_to_gcp_for_json_files(user_id, xproject_id, xlabel)  # save text file in the directory first
    bucket_name = session["user"]["gcp_bucket_dict"]["bucket_name"]
    gcp_subdirectory_path = os.path.join(subdirectory_path, xproject_id, xlabel)
    client = storage.Client()
    bucket = client.get_bucket(bucket_name)
    filename = xlabel + ".json" 
    blob_full_path = os.path.join(gcp_subdirectory_path, filename)
    blob = bucket.blob(blob_full_path)
    blob.upload_from_string(data=json.dumps(json_object_to_save),content_type='application/json')
    
def save_json_to_gcp_return_url(subdirectory_path, user_id, xproject_id, xlabel,json_object_to_save): 
    # write_text_to_gcp_for_json_files(user_id, xproject_id, xlabel)  # save text file in the directory first
    bucket_name = session["user"]["gcp_bucket_dict"]["bucket_name"]
    gcp_subdirectory_path = os.path.join(subdirectory_path, xproject_id, xlabel)
    client = storage.Client()
    bucket = client.get_bucket(bucket_name)
    filename = xlabel + ".json" 
    blob_full_path = os.path.join(gcp_subdirectory_path, filename)
    blob = bucket.blob(blob_full_path)
    blob.upload_from_string(data=json.dumps(json_object_to_save),content_type='application/json')
    
    return blob.public_url

def save_json_to_gcp_return_url_v2(blob_full_path, json_object_to_save): 
    bucket_name = session["user"]["gcp_bucket_dict"]["bucket_name"]
    client = storage.Client()
    bucket = client.get_bucket(bucket_name)
    blob = bucket.blob(blob_full_path)
    blob.upload_from_string(data=json.dumps(json_object_to_save),content_type='application/json')
    return blob.public_url

# Check if element is in array
def isElementInArray(element, collection: iter):
    return element in collection

def does_pymongo_result_contain_label(mongo_result, label):

  output = False
  results_keys = []
  results_values = []

  for index in range(len(mongo_result)):
    for key in mongo_result[index]:
      results_keys.append(key)
      results_values.append(mongo_result[index][key])
  
  output = isElementInArray(label, results_keys)

  return output

def does_blob_exist_on_gcp(blob_full_path):

  output = False
  bucket_name = session["user"]["gcp_bucket_dict"]["bucket_name"]
  client = storage.Client()
  bucket = client.get_bucket(bucket_name)
  blob = bucket.blob(blob_full_path)
  output = blob.exists()

  return output

try:
  create_dir(UPLOAD_FOLDER)
  create_dir(IMAGES_FOLDER)
  create_dir(USER_IMAGES_DIR)
  create_dir(USER_CROPPED_IMG_DIR)
  create_dir(USER_CURRENT_IMG_WORKING_SUBDIR)
  create_dir(USER_CROPPED_IMG_WORKING_SUBDIR)
  
except:
  pass

#===========================================================
# LOGIN and START SESSION
#===========================================================


db = cluster["amina_db"]
users_collection = db["user_login_system"]
pre_approved_email_addresses = db["pre_approved_email_addresses"]
user_projects = db["user_projects"]
user_session_data = db["user_session_data"]
user_classification_model_session_data = db["user_classification_model_session_data"]
user_object_detection_session_data = db["user_object_detection_session_data"]
user_audio_classification_session_data = db["user_audio_classification_session_data"]


# "user_images_json_files_normalized": "users/d29fa1462a0e421d8ae59e6c71177002/user-images-json-files-normalized", 
# "user_images_json_files_raw": "users/d29fa1462a0e421d8ae59e6c71177002/user-images-json-files-raw", 
# "user_images_automated_labels_json_files_normalized": "users/d29fa1462a0e421d8ae59e6c71177002/user-images-automated-labels-json-files-normalized", 
# "user_images_json_files_normalized": "users/d29fa1462a0e421d8ae59e6c71177002/user-images-json-files-normalized", 
# "user_images_json_files_raw": "users/d29fa1462a0e421d8ae59e6c71177002/user-images-json-files-raw"

def update_user_info_variables():
    
    # Initialize global variables that will be used throughout the application
    # The user session variable is used to populate the variables
	global email 
	global user_info
	global user_id 

	global GCP_BUCKET_DICT 
	global bucket_name 
	global sub_directory_path 
	global target_file_types_array 

	global sub_dir_user_images_for_labeling
	global allowed_image_types_array 

	global cropped_images_subdir
	global cropped_canvas_jsons_subdir
	global cropped_images_csv_files

	global user_local_models_tmp_dir

	global user_images_json_files_normalized 
	global user_images_json_files_raw
	global user_images_automated_labels_json_files_normalized
 
	#user_info = users_collection.find_one({"email": email})
	# user_id = user_info["_id"]
  
	try: 
		user_info = session['user']
		user_id = user_info['_id'] 
		email = user_info['email']   
		GCP_BUCKET_DICT = session["user"]["gcp_bucket_dict"] # ["bucket_name"]
		bucket_name = session["user"]["gcp_bucket_dict"]["bucket_name"]
		sub_directory_path = session["user"]["gcp_bucket_dict"]["user_images_subdir"]
		# target_file_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]
    
		sub_dir_user_images_for_labeling = session["user"]["gcp_bucket_dict"]["user_images_subdir"]
		allowed_image_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]
    
		cropped_images_subdir = session["user"]["gcp_bucket_dict"]["cropped_images_subdir"]
		cropped_canvas_jsons_subdir = session["user"]["gcp_bucket_dict"]["cropped_canvas_jsons_subdir"]
		cropped_images_csv_files = session["user"]["gcp_bucket_dict"]["cropped_images_csv_files"]
    
		user_local_models_tmp_dir = session["user"]["gcp_bucket_dict"]["user_local_models_tmp_dir"]
		user_images_json_files_normalized = session["user"]["gcp_bucket_dict"]["user_images_json_files_normalized"]
		user_images_json_files_raw = session["user"]["gcp_bucket_dict"]["user_images_json_files_raw"]
		user_images_automated_labels_json_files_normalized = session["user"]["gcp_bucket_dict"]["user_images_automated_labels_json_files_normalized"]
 
		create_dir(user_local_models_tmp_dir) # This directory is used for processing tflite zipfiles to extract labels
	except:
		pass

	# print(user_info)
	# del user_info["password"]
	# session['user'] = user_info
	#if user_info:
	#	try:
	#		start_session(user_info)
	#	except:
	#		pass

# GCP_STORAGE_TARGET_PATH = os.path.join(path, "Downloads", "file.txt", "/home")

def download_file_from_gcp(filename, model_id):
  
  filename = "amina-train-image-classifier.ipynb"      
  dir_name = "{}-".format(session["user"]["_id"])  
  tmp_dir = tempfile.mkdtemp(prefix=dir_name) # create temp_directory
  filepath = os.path.join(tmp_dir, filename)
  
  bucket_name = session["user"]["gcp_bucket_dict"]["bucket_name"]
  user_colab_notebooks_dir = session["user"]["gcp_bucket_dict"]["user_colab_notebooks"]
  storage_client = storage.Client.from_service_account_json(os.environ["GOOGLE_APPLICATION_CREDENTIALS"])
  # storage_client = storage.Client()

  bucket = storage_client.bucket(bucket_name)
  sub_dir_path_with_active_folder = os.path.join(user_colab_notebooks_dir,model_id)
  blob_full_path = os.path.join(sub_dir_path_with_active_folder, filename)

  blob = bucket.blob(blob_full_path)
  # contents = blob.download_as_string()
  # save file in tmp directory
  blob.download_to_filename(filepath)
  
  return filepath,tmp_dir


def download_colab_notebook_into_memory(filename, model_id):
  bucket_name = session["user"]["gcp_bucket_dict"]["bucket_name"]
  user_colab_notebooks_dir = session["user"]["gcp_bucket_dict"]["user_colab_notebooks"]
  
  storage_client = storage.Client.from_service_account_json(os.environ["GOOGLE_APPLICATION_CREDENTIALS"])
  # storage_client = storage.Client()

  bucket = storage_client.bucket(bucket_name)
  sub_dir_path_with_active_folder = os.path.join(user_colab_notebooks_dir,model_id)
  blob_full_path = os.path.join(sub_dir_path_with_active_folder, filename)

  blob = bucket.blob(blob_full_path)
  contents = blob.download_as_string()
  
  return contents


def save_colab_notebook_to_gcp(nb, filename, model_id):
  
  bucket_name = session["user"]["gcp_bucket_dict"]["bucket_name"]
  user_colab_notebooks_dir = session["user"]["gcp_bucket_dict"]["user_colab_notebooks"]
  
  client = storage.Client()
  bucket = client.get_bucket(bucket_name)
  sub_dir_path_with_active_folder = os.path.join(user_colab_notebooks_dir,model_id)
  blob_full_path = os.path.join(sub_dir_path_with_active_folder, filename)
  blob = bucket.blob(blob_full_path) 
    
  notebook_data = nbf.writes(nb, version=nbf.NO_CONVERT)
  blob = bucket.blob(blob_full_path)
  blob.upload_from_string(notebook_data, "application/x-ipynb+json")
  blob_public_url = blob.public_url 
  gcs_url = "https://storage.googleapis.com/{}/{}".format(bucket_name,blob_full_path)
  
  return gcs_url 


def upload_colab_notebook_to_gcp(notebook_filepath, model_id):
	bucket_name = session["user"]["gcp_bucket_dict"]["bucket_name"]
	user_colab_notebooks_dir = session["user"]["gcp_bucket_dict"]["user_colab_notebooks"]
 
	client = storage.Client()
	bucket = client.get_bucket(bucket_name)
	sub_dir_path_with_active_folder = os.path.join(user_colab_notebooks_dir,model_id)

	with open(notebook_filepath) as file:
		# colab_notebook = nbf.read(file, as_version=4)
		filename = secure_filename(file.filename) 
		blob_full_path = os.path.join(sub_dir_path_with_active_folder, filename)
		blob = bucket.blob(blob_full_path)
		file.seek(0)
		blob.upload_from_string(file.read(), content_type=file.content_type)
		blob_public_url = blob.public_url 
		gcs_url = "https://storage.googleapis.com/{}/{}".format(bucket_name,blob_full_path)
   
	return gcs_url   

def base64ToString(b):
    return base64.b64decode(b).decode('utf-8')

def save_cropped_image_to_gcp(image_file_name, image_file_type, image_data_string, project,label):
  
  # image_file_type = "image/png"
  
  bucket_name = session["user"]["gcp_bucket_dict"]["bucket_name"]
  user_cropped_image_dir = session["user"]["gcp_bucket_dict"]["cropped_images_subdir"]
  
  client = storage.Client()
  bucket = client.get_bucket(bucket_name)
  sub_dir_path_with_active_folder = os.path.join(user_cropped_image_dir,project,label)
  blob_full_path = os.path.join(sub_dir_path_with_active_folder, image_file_name)
  blob = bucket.blob(blob_full_path) 
    
  blob = bucket.blob(blob_full_path)
  blob.upload_from_string(image_data_string, image_file_type)
  blob_public_url = blob.public_url 
  gcs_url = "https://storage.googleapis.com/{}/{}".format(bucket_name,blob_full_path)
  
  return gcs_url 


def upload_files_to_gcp(name_of_bucket, subdir_path, active_folder, files_to_upload, allowed_file_types):
	bucket_name = session["user"]["gcp_bucket_dict"]["bucket_name"]
	public_urls_returned =[]
	file_names =[]
	# ALLOWED_EXTENSIONS = set(allowed_file_types)
	client = storage.Client()
	bucket = client.get_bucket(name_of_bucket)
	sub_dir_path_with_active_folder = os.path.join(subdir_path,active_folder)

	for file in files_to_upload:
		#if file and allowed_file(file.filename):
		if file and (file.filename).lower().endswith(tuple(allowed_file_types)):    
			filename = secure_filename(file.filename)
			blob_full_path = os.path.join(sub_dir_path_with_active_folder, filename)
			file_names.append(filename)
			blob = bucket.blob(blob_full_path)
			file.seek(0)
			blob.upload_from_string(file.read(), content_type=file.content_type)
			blob_public_url = blob.public_url 
			# gcs_url = "https://storage.cloud.google.com/{}/{}".format(bucket_name,blob_full_path)
			gcs_url = "https://storage.googleapis.com/{}/{}".format(bucket_name,blob_full_path)
			# returned_public_urls.append(blob_public_url)   
			public_urls_returned.append(gcs_url)
   
	return public_urls_returned   
 
 
def delete_file_from_gcp_bucket(bucket_name, blob_name):
    """Deletes a blob from the bucket."""
    # bucket_name = "your-bucket-name"
    # blob_name = "your-object-name"
    storage_client = storage.Client()

    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_name)
    blob.delete()

    print(f"Blob {blob_name} deleted.") 
    
    
    

def delete_file_from_gcpbucket(bucket_name, model_url, bucket_url_path):
    """Deletes a blob from the bucket."""
    # bucket_name = "your-bucket-name"
    # model_url = "your-object-name"
    # blobname = model_url.split('https://storage.googleapis.com/amina-files/')
    
    blob_name = model_url.split(bucket_url_path)
    
    storage_client = storage.Client()

    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_name)
    blob.delete()

    print(f"Blob {blob_name} deleted.") 




# context processor for jinja2
# 
#@app.context_processor
#def context_file_name(url):
#  subdir, filename = os.path.split(url)
#  return filename

def get_labels_from_tflite_model_zipfile(model_file_url):
  labels =''
  with urlopen(model_file_url) as f:
    with BytesIO(f.read()) as b, ZipFile(b) as myzipfile:
      labelmap_txt_file = myzipfile.open('labelmap.txt')
      labels = labelmap_txt_file.read().decode('utf-8').replace('\n', ',').rstrip(',')
      # print(labels)
  return labels

def get_filename_from_path(file_url):
  file_name = os.path.basename(file_url)
  return file_name

def model_info_array(models_urls, model_type):
  # model type is either 'object detection' or 'classification'
  new_models_array = []
  index = 0
  for _model_url in models_urls:
      
    try:
        labels = get_labels_from_tflite_model_zipfile(_model_url)
    except:
        labels=''
        pass
    #path_to_zip_file =_model_url
    #tmp_model_dir = user_local_models_tmp_dir
    #path_to_labelmap = getLabelFileFromClassificationModel(path_to_zip_file, tmp_model_dir)
    #labels = convertTxtLabelFileToLabels(path_to_labelmap)
    
    model_item ={
      'labels': labels, 
      'truncated_labels': truncate_labels(labels, 75),
      'model_url': _model_url,
      'model_name': get_filename_from_path(_model_url),
      'model_type' : model_type,
      'model_index': index
      }
    new_models_array.append(model_item)
    
    # Delete all contents of the temp model directory to prepare for the next tflite to be unzipped to this location
    #deleteFilesInTempDir(tmp_model_dir)
    
    index +=1

  return new_models_array


def truncate_labels(labels, x_value):
  # x_value = integer length for truncating labels
  # eg. x_value = 75
  truncated_labels = labels[:x_value] + (labels[x_value:] and '...')
  
  return truncated_labels


# Decorators
def login_required(f):
  @wraps(f)
  def wrap(*args, **kwargs):
    if 'logged_in' in session:
      return f(*args, **kwargs)
    else:
      return redirect('/')
  
  return wrap

@app.route('/')
def home():

  #   bucket_name ="amina-files"
  #   sub_directory_path="dust/user2/"
  #   target_file_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]
  #   sub_directory_path = session["user"]["gcp_bucket_dict"]["user_test_images_subdir"]
  #   target_file_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]
  #   sub_dir_path_with_active_folder = os.path.join(sub_directory_path,CURRENTLY_ACTIVE_FOLDER)
  #   gcp_active_directory_file_urls = get_public_url_files_array_from_google_cloud_storage(bucket_name, sub_dir_path_with_active_folder, target_file_types_array)
  return render_template('login.html') 

#@app.route('/create_account/', methods =["GET", "POST"])
#def create_user_account():
#  # return render_template('home.html')
#  return render_template('create_account.html')

@app.route('/create_account/', methods =["GET", "POST"])
def create_user_account():
    if request.method == "POST":
       # getting input with name = fname in HTML form
       first_name = request.form.get("first_name")
       last_name = request.form.get("last_name") 
       email = request.form.get("email")
       password = pbkdf2_sha256.encrypt(request.form.get("password")) # Encrypting password 
       # country = request.form.get("country") 
       isoDate = getISODate()

       # Create the user object
       my_user_id = uuid.uuid4().hex
       
       gcp_bucket_dict = {

			'bucket_name': 'amina-files',
			'users_subdir': 'users',
			'user_id': my_user_id,

			'user_images_subdir': 'users/{}/user-images'.format(my_user_id),
			'user_images_canvas_jsons_subdir': 'users/{}/user-images-canvas-jsons'.format(my_user_id),
			'user_images_automated_labels_subdir': 'users/{}/user-images-automated-labels'.format(my_user_id),
			'user_images_csv_files_normalized': 'users/{}/user-images-csv-files-normalized'.format(my_user_id),
			'user_images_csv_files_raw': 'users/{}/user-images-csv-files-raw'.format(my_user_id),
			'user_images_automated_labels_csv_files_normalized': 'users/{}/user-images-automated-labels-csv-files-normalized'.format(my_user_id),
			'user_images_automated_labels_csv_files_raw': 'users/{}/user-images-automated-labels-csv-files-raw'.format(my_user_id),
			'user_images_json_files_normalized': 'users/{}/user-images-json-files-normalized'.format(my_user_id),
			'user_images_json_files_raw': 'users/{}/user-images-json-files-raw'.format(my_user_id),
			'user_images_automated_labels_json_files_normalized': 'users/{}/user-images-automated-labels-json-files-normalized'.format(my_user_id),
			'user_images_automated_labels_json_files_raw': 'users/{}/user-images-automated-labels-json-files-raw'.format(my_user_id),
			'user_images_dynamic_table_records': 'users/{}/user-images-dynamic-table-records'.format(my_user_id),

			'user_test_images_subdir': 'users/{}/user-test-images'.format(my_user_id),

			'cropped_images_subdir': 'users/{}/cropped-images'.format(my_user_id),
			'cropped_canvas_jsons_subdir': 'users/{}/cropped-images-canvas-jsons'.format(my_user_id),
			'cropped_images_csv_files': 'users/{}/cropped_images-csv-files'.format(my_user_id),
			'cropped_images_csv_files': 'users/{}/cropped_images-csv-files'.format(my_user_id),
			'cropped_images_json_files_normalized': 'users/{}/cropped_images-json-files-normalized'.format(my_user_id),
			'cropped_images_json_files_raw': 'users/{}/cropped_images-json-files-raw'.format(my_user_id),

			'user_images_folder_dir_currently_active_subdir': '',
			'user_cropped_images_dir_currently_active_subdir': '',

			'user_models_classification_subdir': 'users/{}/user-models-classification'.format(my_user_id),
			'user_models_detection_subdir': 'users/{}/user-models-detection'.format(my_user_id),
			'user_all_images_explorer': '',
			'user_local_models_tmp_dir': 'users/{}/tmp_models'.format(my_user_id),
   		'user_colab_notebooks': 'users/{}/colab_notebooks'.format(my_user_id),

		}
       
       
       
       
       
       
       user = {
                "_id": my_user_id,
                "first_name": first_name,
                "last_name": last_name,
                "email": email,
                "password": password,
                "country" : "",
                "signup_date" : isoDate,
                "eth_public_address" : "",
                "eth_account_encrypted_keystore" : "",
                "mobile_phone" : '',
                "mobile_phone_is_verified": False, 
                "email_verification_date": '',     
                "mobile_phone_verification_date": '',
                "email_reg_token": "",
                "email_is_verified": False,     
                "country": '',                                                 
                "level" : 0,
                "test_score" : '',
                "test_date": '',
                "eth_infura_mainnet_is_connected": False, 
                "polygon_testnet_is_connected": False, 
                "binance_testnet_is_connected": False, 
                "cronos_testnet_is_connected": False,
                'gcp_bucket_dict': gcp_bucket_dict
                }

        # # Check that email is not already in use before inserting the record into the database
       if pre_approved_email_addresses.count_documents({"email": email}) > 0:
            pass
       else:
           return render_template("create_account.html", error ='Signup failed')

       # # Check that email is not already in use before inserting the record into the database
       if users_collection.find_one({"email": email}):
           # return jsonify({"error" : 'Email address already in use'}) , 400   
           return render_template("create_account.html", error ='Email address already in use')

       if users_collection.insert_one(user):     
          # insert record into the users_collection

           # start session
           start_session(user)
           
           # assign_values_to_variables(email)
           update_user_info_variables()
           
           # send_email_confirmation_link(email)

           # return render_template("dashboard.html")
           return render_template("mydashboard.html")
           # return jsonify(user), 200
        
    return render_template("create_account.html", error ='Signup failed')

@app.route('/login', methods =["GET", "POST"])
def login():
    
    # email = request.form.get('email')
    
    user = users_collection.find_one({

      "email": request.form.get('email')

    })
    

    print(request.form.get('password'))

    if user and pbkdf2_sha256.verify(request.form.get('password'), user['password']):
        
        start_session(user)
        
        update_user_info_variables()
        
        # email = email 
        # user_info = users_collection.find_one({"email": email})
        # user_id = user_info["_id"]
        # user_info = session['user']
        # user_id = session['user']['_id']
        # tmp = session['user']['gcp_bucket_dict']['user_local_models_tmp_dir']
        
        # assign_values_to_variables(email)
		 
        return render_template("mydashboard.html", tmp = email)
        #return redirect(url_for('mydashboard.html'))
    
    return render_template("login.html", error ='Invalid login credentials') 



@app.route('/dashboard/')
@login_required
def dashboard():
  # mydashboard.html
  return render_template('mydashboard.html')

@app.route('/signout/')
@login_required
def signout():
    # clear session at signout
    session.clear()
    return render_template('login.html')



@app.route('/classify_images/')
def classify_images():

  # bucket_name ="amina-files"
  # sub_directory_path="dust/user2/"
  # target_file_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]
  sub_directory_path = session["user"]["gcp_bucket_dict"]["user_test_images_subdir"]
  target_file_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]
  sub_dir_path_with_active_folder = os.path.join(sub_directory_path,CURRENTLY_ACTIVE_FOLDER)
  gcp_active_directory_file_urls = get_public_url_files_array_from_google_cloud_storage(session["user"]["gcp_bucket_dict"]["bucket_name"], sub_dir_path_with_active_folder, target_file_types_array)
  return render_template('classify-images.html', filenames=[], images_in_dir = gcp_active_directory_file_urls)     
  
  
  #gcp_active_directory_file_urls = get_public_url_files_array_from_google_cloud_storage(bucket_name, sub_directory_path, target_file_types_array)
  # model_urls =get_public_url_files_array_from_google_cloud_storage('2021_tflite_glitch_models', 'stack-plume-dust-classification/', ["tflite", "h5", "keras"])

	# return render_template('detection.html', images_in_dir = gcp_active_directory_file_urls)
  #return render_template('classify-images.html', images_in_dir = gcp_active_directory_file_urls)
  # return render_template('classify-images.html',models = model_urls, db = cluster["amina_db"], image_list = PUBLIC_URLS_ARRAY, user_info = GCP_BUCKET_DICT )
  # return render_template('classify-images.html', images_in_dir=get_images_list(USER_CURRENT_IMG_WORKING_SUBDIR))



@app.route('/', methods=['POST'])
def upload_image():
	if 'files[]' not in request.files:
		flash('No file part')
		return redirect(request.url)
	files = request.files.getlist('files[]')
	file_names = []
	# returned_public_urls =[]
	# models_urls =[]
	# client = storage.Client()
	# bucket = client.get_bucket(bucket_name)
 
	if request.form.get('which-form') == 'images-for-labeling':
		sub_directory_path = session["user"]["gcp_bucket_dict"]["user_images_subdir"]
		target_file_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]
		gcp_public_urls = upload_files_to_gcp(session["user"]["gcp_bucket_dict"]["bucket_name"], sub_directory_path, CURRENTLY_ACTIVE_FOLDER, files, target_file_types_array)
		sub_dir_path_with_active_folder = os.path.join(sub_directory_path,CURRENTLY_ACTIVE_FOLDER)
		gcp_active_directory_file_urls = get_public_url_files_array_from_google_cloud_storage(session["user"]["gcp_bucket_dict"]["bucket_name"], sub_dir_path_with_active_folder, target_file_types_array)
		return render_template('labeling.html', filenames=[], images_in_dir = gcp_active_directory_file_urls)   
  
	elif request.form.get('which-form') == 'images-for-testing-object-detection': 
		sub_directory_path = session["user"]["gcp_bucket_dict"]["user_test_images_subdir"]
		target_file_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]
		gcp_public_urls = upload_files_to_gcp(session["user"]["gcp_bucket_dict"]["bucket_name"], sub_directory_path, CURRENTLY_ACTIVE_FOLDER, files, target_file_types_array)
		sub_dir_path_with_active_folder = os.path.join(sub_directory_path,CURRENTLY_ACTIVE_FOLDER)
		gcp_active_directory_file_urls = get_public_url_files_array_from_google_cloud_storage(session["user"]["gcp_bucket_dict"]["bucket_name"], sub_dir_path_with_active_folder, target_file_types_array)
		return render_template('detection.html', filenames=[], images_in_dir = gcp_active_directory_file_urls)   
  
	elif request.form.get('which-form') == 'images-for-testing-classification': 
		sub_directory_path = session["user"]["gcp_bucket_dict"]["user_test_images_subdir"]
		target_file_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]
		gcp_public_urls = upload_files_to_gcp(session["user"]["gcp_bucket_dict"]["bucket_name"], sub_directory_path, CURRENTLY_ACTIVE_FOLDER, files, target_file_types_array)
		sub_dir_path_with_active_folder = os.path.join(sub_directory_path,CURRENTLY_ACTIVE_FOLDER)
		gcp_active_directory_file_urls = get_public_url_files_array_from_google_cloud_storage(session["user"]["gcp_bucket_dict"]["bucket_name"], sub_dir_path_with_active_folder, target_file_types_array)
		return render_template('classify-images.html', filenames=[], images_in_dir = gcp_active_directory_file_urls)  
   
	elif request.form.get('which-form') == 'models-object-detection': 
		sub_directory_path = session["user"]["gcp_bucket_dict"]["user_models_detection_subdir"]
		target_file_types_array = ["tflite"]  
		gcp_public_urls = upload_files_to_gcp(session["user"]["gcp_bucket_dict"]["bucket_name"], sub_directory_path, CURRENTLY_ACTIVE_FOLDER, files, target_file_types_array)
		sub_dir_path_with_active_folder = os.path.join(sub_directory_path,CURRENTLY_ACTIVE_FOLDER)
		gcp_active_directory_file_urls = get_public_url_files_array_from_google_cloud_storage(session["user"]["gcp_bucket_dict"]["bucket_name"], sub_dir_path_with_active_folder, target_file_types_array)
		return render_template('models.html', filenames=[], images_in_dir = gcp_active_directory_file_urls) 
  
	elif request.form.get('which-form') == 'models-classification': 
		sub_directory_path = session["user"]["gcp_bucket_dict"]["user_models_classification_subdir"]
		target_file_types_array = ["tflite"]  
		gcp_public_urls = upload_files_to_gcp(session["user"]["gcp_bucket_dict"]["bucket_name"], sub_directory_path, CURRENTLY_ACTIVE_FOLDER, files, target_file_types_array)
		sub_dir_path_with_active_folder = os.path.join(sub_directory_path,CURRENTLY_ACTIVE_FOLDER)
		gcp_active_directory_file_urls = get_public_url_files_array_from_google_cloud_storage(session["user"]["gcp_bucket_dict"]["bucket_name"], sub_dir_path_with_active_folder, target_file_types_array)
		return render_template('models.html', filenames=[], images_in_dir = gcp_active_directory_file_urls) 
   
	return redirect(request.url)
 # return render_template('classify-images.html', filenames=file_names, images_in_dir=returned_public_urls)
	#return render_template('classify-images.html', filenames=file_names, images_in_dir=get_images_list(USER_CURRENT_IMG_WORKING_SUBDIR))


@app.route('/upload_model/', methods=['POST','GET'])
def upload_model():
	if 'file' not in request.files:
		flash('No model file part')
		return redirect(request.url)
	files = request.files.getlist('models[]')
	file_names = []
	bucket_name = session["user"]["gcp_bucket_dict"]["bucket_name"]
	sub_directory_path = session["user"]["gcp_bucket_dict"]["user_images_subdir"]
	target_file_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]
	returned_public_urls =[]
	client = storage.Client()
	bucket = client.get_bucket(bucket_name)
	sub_dir_path_with_active_folder = os.path.join(sub_directory_path,CURRENTLY_ACTIVE_FOLDER)
  # https://devdojo.com/bryanborge/adding-google-cloud-credentials-to-heroku
  # https://cloud.google.com/storage/docs/uploading-objects#storage-upload-object-python
  # https://buraksenol.medium.com/pass-images-to-html-without-saving-them-as-files-using-python-flask-b055f29908a
  # https://cloud.google.com/appengine/docs/flexible/python/using-cloud-storage
  # https://github.com/googleapis/google-cloud-python/issues/3655
  # https://stackoverflow.com/questions/20015550/read-file-data-without-saving-it-in-flask
  # https://github.com/GoogleCloudPlatform/python-docs-samples/blob/main/notebooks/rendered/cloud-storage-client-library.md
  # https://buraksenol.medium.com/pass-images-to-html-without-saving-them-as-files-using-python-flask-b055f29908a
  # https://cloud.google.com/storage/docs/samples/storage-file-upload-from-memory
  # https://buraksenol.medium.com/pass-images-to-html-without-saving-them-as-files-using-python-flask-b055f29908a
	for file in files:
		if file and allowed_file(file.filename):
			filename = secure_filename(file.filename)
			blob_full_path = os.path.join(sub_dir_path_with_active_folder, filename)
			file_names.append(filename)
			# file.save(os.path.join(USER_CURRENT_IMG_WORKING_SUBDIR, filename))
			FILE_TO_UPLOAD = file.read()
			blob = bucket.blob(blob_full_path)
			# blob = bucket.blob(filename)
			# blob.upload_from_filename(FILE_TO_UPLOAD)
			# blob.upload_from_string(file.read())
			file.seek(0)
			blob.upload_from_string(file.read(), content_type=file.content_type)
			# blob.upload_from_file(file.file, content_type=file.content_type, rewind=True)
			blob_public_url = blob.public_url 
			# gcs_url = "https://storage.cloud.google.com/{}/{}".format(bucket_name,blob_full_path)
			gcs_url = "https://storage.googleapis.com/{}/{}".format(bucket_name,blob_full_path)
			# returned_public_urls.append(blob_public_url)   
			returned_public_urls.append(gcs_url)      
   
	#if request.form.get('images-for-labeling') == 'images-for-labeling':
	#	return render_template('labeling.html', filenames=file_names, images_in_dir=returned_public_urls)

	#if request.form.get('images-for-testing-classification') == 'images-for-testing-classification':
	#	return render_template('classify-images.html', filenames=file_names, images_in_dir=returned_public_urls)

	return render_template('upload-test.html', filenames=file_names, images_in_dir=returned_public_urls)
	# return render_template('classify-images.html', filenames=file_names, images_in_dir=returned_public_urls)
	#return render_template('classify-images.html', filenames=file_names, images_in_dir=get_images_list(USER_CURRENT_IMG_WORKING_SUBDIR))

@app.route('/upload_model2/', methods=['POST','GET'])
def upload_model2():
  
	data = request.files
	if 'models[]' not in request.files:
		return redirect(request.url)

	files = request.files.getlist('models[]')
	file_names = []
	bucket_name = session["user"]["gcp_bucket_dict"]["bucket_name"]
	sub_directory_path = session["user"]["gcp_bucket_dict"]["user_models_detection_subdir"] # user_models_detection_subdir user_images_subdir user_models_classification_subdir
	# target_file_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]
	target_file_types_array = ["tflite"]
	returned_public_urls =[]
	client = storage.Client()
	bucket = client.get_bucket(bucket_name)
	sub_dir_path_with_active_folder = os.path.join(sub_directory_path,CURRENTLY_ACTIVE_FOLDER)

	for file in files:
		if file and (file.filename).lower().endswith(tuple(target_file_types_array)):
			filename = secure_filename(file.filename)
			blob_full_path = os.path.join(sub_dir_path_with_active_folder, filename)
			blob = bucket.blob(blob_full_path)
			file.seek(0)
			blob.upload_from_string(file.read(), content_type=file.content_type)
			blob_public_url = blob.public_url 
			# gcs_url = "https://storage.cloud.google.com/{}/{}".format(bucket_name,blob_full_path)
			gcs_url = "https://storage.googleapis.com/{}/{}".format(bucket_name,blob_full_path)
			# returned_public_urls.append(blob_public_url)   
			returned_public_urls.append(gcs_url) 
   
	#gcp_active_directory_file_urls = get_public_url_files_array_from_google_cloud_storage(bucket_name, sub_dir_path_with_active_folder, target_file_types_array)   
 
	return render_template('upload-test.html',data = returned_public_urls)

@app.route('/upload_detection_tflite_model/', methods=['POST','GET'])
def upload_detection_tflite_model():
  
	data = request.files
	if 'models_detection[]' not in request.files:
		return redirect(request.url)

	files = request.files.getlist('models_detection[]')
	file_names = []
	bucket_name = session["user"]["gcp_bucket_dict"]["bucket_name"]
	# sub_directory_path = session["user"]["gcp_bucket_dict"]["user_models_detection_subdir"] # user_models_detection_subdir user_images_subdir user_models_classification_subdir
	target_file_types_array = ["tflite"]
	returned_public_urls =[]
	client = storage.Client()
	bucket = client.get_bucket(bucket_name)
	# sub_dir_path_with_active_folder = os.path.join(sub_directory_path,CURRENTLY_ACTIVE_FOLDER)
	classification_sub_directory_path = session["user"]["gcp_bucket_dict"]["user_models_classification_subdir"] # user_models_detection_subdir user_images_subdir user_models_classification_subdir
	detection_sub_directory_path = session["user"]["gcp_bucket_dict"]["user_models_detection_subdir"] # user_models_detection_subdir user_images_subdir user_models_classification_subdir 

	for file in files:
		if file and (file.filename).lower().endswith(tuple(target_file_types_array)):
			filename = secure_filename(file.filename)
			blob_full_path = os.path.join(detection_sub_directory_path, filename)
			blob = bucket.blob(blob_full_path)
			file.seek(0)
			blob.upload_from_string(file.read(), content_type=file.content_type)
			blob_public_url = blob.public_url 
			# gcs_url = "https://storage.cloud.google.com/{}/{}".format(bucket_name,blob_full_path)
			gcs_url = "https://storage.googleapis.com/{}/{}".format(bucket_name,blob_full_path)
			# returned_public_urls.append(blob_public_url)   
			returned_public_urls.append(gcs_url) 
   
	detection_models_info =[]
	detection_models_info =[]
	try:
		detection_models_urls = get_public_url_files_array_from_google_cloud_storage(bucket_name, detection_sub_directory_path, target_file_types_array)
		detection_models_info = model_info_array(detection_models_urls, 'object detection')
	except:
		pass

	classification_models_urls =[]
	classification_models_info =[]
	try:
		classification_models_urls = get_public_url_files_array_from_google_cloud_storage(bucket_name, classification_sub_directory_path , target_file_types_array)
		classification_models_info = model_info_array(classification_models_urls, 'classification')
	except:
		pass 
 
	return render_template('models.html',classification_models_info = classification_models_info, detection_models_info = detection_models_info )

@app.route('/upload_classification_tflite_model/', methods=['POST','GET'])
def upload_classification_tflite_model():
  
	data = request.files
	if 'models_classification[]' not in request.files:
		return redirect(request.url)

	files = request.files.getlist('models_classification[]')
	file_names = []
	bucket_name = session["user"]["gcp_bucket_dict"]["bucket_name"]
	# sub_directory_path = session["user"]["gcp_bucket_dict"]["user_models_detection_subdir"] # user_models_detection_subdir user_images_subdir user_models_classification_subdir
	target_file_types_array = ["tflite"]
	returned_public_urls =[]
	client = storage.Client()
	bucket = client.get_bucket(bucket_name)
	# sub_dir_path_with_active_folder = os.path.join(sub_directory_path,CURRENTLY_ACTIVE_FOLDER)
	classification_sub_directory_path = session["user"]["gcp_bucket_dict"]["user_models_classification_subdir"] # user_models_detection_subdir user_images_subdir user_models_classification_subdir
	detection_sub_directory_path = session["user"]["gcp_bucket_dict"]["user_models_detection_subdir"] # user_models_detection_subdir user_images_subdir user_models_classification_subdir 

	for file in files:
		if file and (file.filename).lower().endswith(tuple(target_file_types_array)):
			filename = secure_filename(file.filename)
			blob_full_path = os.path.join(classification_sub_directory_path, filename)
			blob = bucket.blob(blob_full_path)
			file.seek(0)
			blob.upload_from_string(file.read(), content_type=file.content_type)
			blob_public_url = blob.public_url 
			# gcs_url = "https://storage.cloud.google.com/{}/{}".format(bucket_name,blob_full_path)
			gcs_url = "https://storage.googleapis.com/{}/{}".format(bucket_name,blob_full_path)
			# returned_public_urls.append(blob_public_url)   
			returned_public_urls.append(gcs_url) 
   
	detection_models_urls =[]
	detection_models_info =[]
	try:
		detection_models_urls = get_public_url_files_array_from_google_cloud_storage(bucket_name, detection_sub_directory_path, target_file_types_array)
		detection_models_info = model_info_array(detection_models_urls, 'object detection')
	except:
		pass

	classification_models_urls =[]
	classification_models_info =[]
	try:
		classification_models_urls = get_public_url_files_array_from_google_cloud_storage(bucket_name, classification_sub_directory_path , target_file_types_array)
		classification_models_info = model_info_array(classification_models_urls, 'classification')
	except:
		pass 
 
	return render_template('models.html',classification_models_info = classification_models_info, detection_models_info = detection_models_info )


@app.route('/upload_images_for_labeling/', methods=['POST','GET'])
def upload_images_for_labeling():
	if 'file' not in request.files:
		flash('No image file uploaded')
		return redirect(request.url)
	files = request.files.getlist('images_for_labeling[]')
	file_names = []
	bucket_name = session["user"]["gcp_bucket_dict"]["bucket_name"]
	sub_directory_path = session["user"]["gcp_bucket_dict"]["user_images_subdir"]
	target_file_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]
	returned_public_urls =[]
	client = storage.Client()
	bucket = client.get_bucket(bucket_name)
	sub_dir_path_with_active_folder = os.path.join(sub_directory_path,CURRENTLY_ACTIVE_FOLDER)

	for file in files:
		if file and allowed_file(file.filename):
			filename = secure_filename(file.filename)
			blob_full_path = os.path.join(sub_dir_path_with_active_folder, filename)
			file_names.append(filename)
			# file.save(os.path.join(USER_CURRENT_IMG_WORKING_SUBDIR, filename))
			FILE_TO_UPLOAD = file.read()
			blob = bucket.blob(blob_full_path)
			# blob = bucket.blob(filename)
			# blob.upload_from_filename(FILE_TO_UPLOAD)
			# blob.upload_from_string(file.read())
			file.seek(0)
			blob.upload_from_string(file.read(), content_type=file.content_type)
			# blob.upload_from_file(file.file, content_type=file.content_type, rewind=True)
			blob_public_url = blob.public_url 
			# gcs_url = "https://storage.cloud.google.com/{}/{}".format(bucket_name,blob_full_path)
			gcs_url = "https://storage.googleapis.com/{}/{}".format(bucket_name,blob_full_path)
			# returned_public_urls.append(blob_public_url)   
			returned_public_urls.append(gcs_url)      
   
	#if request.form.get('images-for-labeling') == 'images-for-labeling':
	#	return render_template('labeling.html', filenames=file_names, images_in_dir=returned_public_urls)

	#if request.form.get('images-for-testing-classification') == 'images-for-testing-classification':
	#	return render_template('classify-images.html', filenames=file_names, images_in_dir=returned_public_urls)

	return render_template('labeling_new.html', filenames=file_names, images_in_dir=returned_public_urls)


@app.route('/detection/', methods=['POST','GET'])
def detection():
	img_url =''
	post_img_url =''
	sub_directory_path = session["user"]["gcp_bucket_dict"]["user_test_images_subdir"]
	target_file_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]    
	gcp_active_directory_file_urls = get_public_url_files_array_from_google_cloud_storage(session["user"]["gcp_bucket_dict"]["bucket_name"], sub_directory_path, target_file_types_array)
 
	if request.method =='GET':
		img_url = request.args.get('image') 

	#if request.method =='POST':
	#	post_img_url = request.form.get('image_url') 
      
	return render_template('x-detection.html', images_in_dir=gcp_active_directory_file_urls, img_url = img_url)

@app.route('/classify/', methods=['POST','GET'])
def classify():
  
	sub_directory_path = session["user"]["gcp_bucket_dict"]["user_test_images_subdir"]  
	target_file_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]      
	gcp_active_directory_file_urls = get_public_url_files_array_from_google_cloud_storage(session["user"]["gcp_bucket_dict"]["bucket_name"], sub_directory_path, target_file_types_array)
      
	return render_template('classify-images.html', images_in_dir=gcp_active_directory_file_urls)

@app.route('/labeling/', methods=['POST','GET'])
def labeling(): 
    
	sub_directory_path = session["user"]["gcp_bucket_dict"]["user_images_subdir"]
	target_file_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]    
	sub_dir_path_with_active_folder = os.path.join(sub_directory_path,CURRENTLY_ACTIVE_FOLDER)
	gcp_active_directory_file_urls = get_public_url_files_array_from_google_cloud_storage(session["user"]["gcp_bucket_dict"]["bucket_name"], sub_dir_path_with_active_folder, target_file_types_array)
	# gcp_active_directory_file_urls = get_public_url_files_array_from_google_cloud_storage(bucket_name, sub_directory_path, target_file_types_array)
 
	post_info =""
 
 
	#return render_template('labeling.html', images_in_dir=gcp_active_directory_file_urls, user_id = user_id)
	return render_template('labeling-new.html', images_in_dir=gcp_active_directory_file_urls, user_id = session["user"]["_id"])


@app.route('/models/', methods=['POST','GET'])
def models():
     
	bucket_name = session["user"]["gcp_bucket_dict"]["bucket_name"]
	classification_sub_directory_path = session["user"]["gcp_bucket_dict"]["user_models_classification_subdir"] # user_models_detection_subdir user_images_subdir user_models_classification_subdir
	detection_sub_directory_path = session["user"]["gcp_bucket_dict"]["user_models_detection_subdir"] # user_models_detection_subdir user_images_subdir user_models_classification_subdir 
	target_file_types_array = ["tflite"]
 
	detection_models_urls=[]
	detection_models_info =[]
	try:
		detection_models_urls = get_public_url_files_array_from_google_cloud_storage(bucket_name, detection_sub_directory_path, target_file_types_array)
		detection_models_info = model_info_array(detection_models_urls, 'object detection')
	except:
		pass

	classification_models_urls =[]
	classification_models_info =[]
	try:
		classification_models_urls = get_public_url_files_array_from_google_cloud_storage(bucket_name, classification_sub_directory_path , target_file_types_array)
		classification_models_info = model_info_array(classification_models_urls, 'classification')
	except:
		pass 

  
	return render_template('models.html', classification_models_info = classification_models_info, detection_models_info = detection_models_info, classification_models_urls = classification_models_urls)


@app.route('/models_upload/', methods=['POST','GET'])
def models_upload():
  
	bucket_name = session["user"]["gcp_bucket_dict"]["bucket_name"]
	classification_sub_directory_path = session["user"]["gcp_bucket_dict"]["user_models_classification_subdir"] # user_models_detection_subdir user_images_subdir user_models_classification_subdir
	detection_sub_directory_path = session["user"]["gcp_bucket_dict"]["user_models_detection_subdir"] # user_models_detection_subdir user_images_subdir user_models_classification_subdir 
	target_file_types_array = ["tflite"]
 
	detection_models_urls =[]
	detection_models_info =[]
	try:
		detection_models_urls = get_public_url_files_array_from_google_cloud_storage(bucket_name, detection_sub_directory_path, target_file_types_array)
		detection_models_info = model_info_array(detection_models_urls, 'object detection')
	except:
		pass

	classification_models_urls =[]
	classification_models_info =[]
	try:
		classification_models_urls = get_public_url_files_array_from_google_cloud_storage(bucket_name, classification_sub_directory_path , target_file_types_array)
		classification_models_info = model_info_array(classification_models_urls, 'classification')
	except:
		pass 

  
	return render_template('models.html', classification_models_info = classification_models_info, detection_models_info = detection_models_info, classification_models_urls = classification_models_urls)


@app.route('/deleteModel/', methods=['POST'])
def deleteModel():

	task = request.form.get('which-task') 
	model_name = request.form.get('model_name')  
	model_url = request.form.get('model_url')  
	model_type = request.form.get('model_type')  
	_task2 = request.form.get('task')  


	bucket_name = session["user"]["gcp_bucket_dict"]["bucket_name"]
	classification_sub_directory_path = session["user"]["gcp_bucket_dict"]["user_models_classification_subdir"] # user_models_detection_subdir user_images_subdir user_models_classification_subdir
	detection_sub_directory_path = session["user"]["gcp_bucket_dict"]["user_models_detection_subdir"] # user_models_detection_subdir user_images_subdir user_models_classification_subdir 
	target_file_types_array = ["tflite"]
 
 
 # Delete Model
	if model_type == 'object detection':
		blob_name = os.path.join(detection_sub_directory_path, model_name)		
	elif model_type == 'classification':
		blob_name = os.path.join(classification_sub_directory_path, model_name)		   

	delete_file_from_gcp_bucket(bucket_name, blob_name)
	# bucket_url_path = 'https://storage.googleapis.com/amina-files/'
	# delete_file_from_gcpbucket(bucket_name, model_url, bucket_url_path)
  # Get updated lists of models in bucket subdirectories
 
	detection_models_info =[]
	detection_models_info =[]
	try:
		detection_models_urls = get_public_url_files_array_from_google_cloud_storage(bucket_name, detection_sub_directory_path, target_file_types_array)
		detection_models_info = model_info_array(detection_models_urls, 'object detection')
	except:
		pass

	classification_models_urls =[]
	classification_models_info =[]
	try:
		classification_models_urls = get_public_url_files_array_from_google_cloud_storage(bucket_name, classification_sub_directory_path , target_file_types_array)
		classification_models_info = model_info_array(classification_models_urls, 'classification')
	except:
		pass  

	return render_template('models.html', task=task, model_name=model_name, model_url=model_url, model_type = model_type, task2 = _task2, classification_models_info = classification_models_info, detection_models_info = detection_models_info)

@app.route('/updateTestImage/', methods=['POST'])
def updateTestImage():

	img_url = request.json['img_url'] # request.form.get('img_url')  request.json['data']
	# model_type = request.form.get('model_type') 
 
	return render_template('x-detection.html', img_url = img_url)
 

@app.route('/saveCroppedImage', methods=['POST','GET'])
def saveCroppedImage():

    if request.method =='POST':

        user_id = request.form['user_id']
        image_name= request.form['image_name']
        label_num= request.form['label_num']
        currentFolder= request.form['current_folder']
        file_name, extension = getImageNameAndExtension(image_name)

        cropped_image_dataURL = request.form['imgBase64']
        # print(cropped_image_dataURL)
        # save cropped imageBase64 string as PNG image
        cropped_image_file_path = 'static/images/' + session["user"]["_id"] + '/cropped-labels/'+ currentFolder + '/' + file_name +  extension.replace(".", "-") + '-' + label_num + '.png'
        # cropped_image_file_path = 'static/images/'  + file_name + extension.replace(".", "-") + '-' + label_num + '.png'

        img = Image.open(BytesIO(base64.decodebytes(bytes(cropped_image_dataURL, "utf-8"))))
        img.save(cropped_image_file_path)
        # saveImageBase42StringAsImage(cropped_image_dataURL)

        # static/images/user1/canvas_jsons
        
        # encoded_string = base64.b64encode(cropped_image_dataURL)
   
    return jsonify(result = 'success', url=cropped_image_file_path)


@app.route('/saveCroppedImage200', methods=['POST','GET'])
def saveCroppedImage200():

    if request.method =='POST':



        cropped_image_dataURL = request.form['imgBase64']
        rect_width = request.form['rect_width'] 
        rect_height = request.form['rect_height']   
        active_label_bucket = request.form['active_label_bucket'] 
        active_project_id = request.form['active_project_id']              
        
        cropped_image_file_path = 'static/images/' + session["user"]["_id"] + '/cropped-labels/'+ 'sample-image-001.png'
        # cropped_image_file_path = 'static/images/'  + file_name + extension.replace(".", "-") + '-' + label_num + '.png'
        # image_data = re.sub('^data:image/.+;base64,', '', cropped_image_dataURL).decode('base64')
        # image_data_string = StringIO.StringIO(cropped_image_dataURL)
  
        image_file_name = datetime.datetime.now().strftime("%Y_%m_%d-%I_%M_%S_%p") + ".png"
        
        #image_data_string = base64ToString(cropped_image_dataURL)
        image_data_bytes = BytesIO(base64.decodebytes(bytes(cropped_image_dataURL, "utf-8")))

        gcs_url = save_cropped_image_to_gcp(image_file_name, image_data_bytes, image_data_string, active_project_id,active_label_bucket)

        #img = Image.open(BytesIO(base64.decodebytes(bytes(cropped_image_dataURL, "utf-8"))))
        #img.save(cropped_image_file_path)
                
        # print(cropped_image_dataURL)

        # img = Image.open(BytesIO(base64.decodebytes(bytes(cropped_image_dataURL, "utf-8"))))
        
        # img.save(cropped_image_file_path)
        # saveImageBase42StringAsImage(cropped_image_dataURL)
        
        # img_bytes = img.tobytes("xbm", "rgb")
        # img_bytes = img.resize((int(rect_width), int(rect_height)), 2).tobytes()
        # static/images/user1/canvas_jsons
        # encoded_string = base64.b64encode(cropped_image_dataURL)
        # https://stackoverflow.com/questions/55941068/change-image-size-with-pil-in-a-google-cloud-storage-bucket-from-a-vm-in-gcloud
   
    return jsonify(result = 'success', url=gcs_url)


@app.route('/image_url/', methods=['POST','GET'])
def image_url():

    if request.method =='POST':

        image_url = request.form['image_url']
        user_id = request.form['user_id']
        request_url = request.url
        
        sub_directory_path = session["user"]["gcp_bucket_dict"]["user_images_subdir"]
        target_file_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]
        sub_dir_path_with_active_folder = os.path.join(sub_directory_path,CURRENTLY_ACTIVE_FOLDER)
        gcp_active_directory_file_urls = get_public_url_files_array_from_google_cloud_storage(session["user"]["gcp_bucket_dict"]["bucket_name"], sub_dir_path_with_active_folder, target_file_types_array)
 
    # return render_template('labeling.html', images_in_dir=gcp_active_directory_file_urls, user_id = user_id, image_url = image_url)
    return redirect('labeling.html', images_in_dir=gcp_active_directory_file_urls, user_id = session["user"]["_id"], image_url = image_url)   
    # return jsonify(result = 'success', image_url = image_url, request_url = request_url)


@app.route('/create_new_project', methods=['POST','GET'])
def create_new_project():

    if request.method =='POST':
        
        user_id = request.form['user_id']
        project_name = request.form['project_name']
        project_id = request.form['project_id']
        labels_color_map = request.form['labels_color_map']
        ISODate = request.form['ISODate']
        num_images = request.form['num_images']
        labeled_images = request.form['labeled_images']
        labels_string  = request.form['labels_string']
        all_labeled_true_false = request.form['all_labeled_true_false']
      
       # Create label item dictionary
        labels = []
        labels_color_map_dict_from_json_string = eval("{0}".format(labels_color_map))
        
        proj_id = uuid.uuid4().hex

		# create project item
        project_item = {
        '_id':  proj_id,   
        'project_js_id': project_id,
        'project_name': project_name,
        'user_id': session["user"]["_id"],
        'labels_color_map': labels_color_map_dict_from_json_string,
        'labels_string' : labels_string,
        'date_created': ISODate,
        'date_modified': '',
        'labels': labels,
        'active_label': '',
        'active_project_id' : '',
        'models': {'user_id': session["user"]["_id"], 'classification_models': [], 'object_detection_models': [],'audio_classification_models': []},
        'labels_json_urls': {'norm_data': [], 'canvas_json': []},
        'labels_json_urls_norm_data': [],    
        'labels_json_urls_canvas': [],     
  		}
        
                    
            
        # If the user_id exists then submit and project name does not exist
        if users_collection.find_one({"_id": session["user"]["_id"]}) and not user_projects.find_one({"project_js_id": project_id}) and not user_projects.find_one({"_id": project_item["_id"]}) :
            user_projects.insert_one(project_item)
            
            time.sleep(1) # This gives the app 1 second to update the mongodb before the next line reads the inserted record...this is inefficient...need to do it above
            query ={'_id': proj_id}
            filters ={"labels_color_map": 1,"date_created": 1}
            
            
            results = user_projects.find(query, filters)
            labels =[]
            y = results[0]['labels_color_map']
            
            for key in y:
                label = key
                label_color = y[key]
                label_dict ={'label_id': uuid.uuid4().hex,
                'label': label,
                'label_color': label_color,
                'original_image_urls': [],
                'all_jpeg_image_urls': [],
                'cropped_image_urls': [],
                'augmentation_image_urls': [],
                'labelled_original_image_urls' : [],
                'labelled_all_jpeg_image_urls' : [],
                'labelled_cropped_image_urls' : [],
                'labelled_augmentation_image_urls' : [],
                'original_image_label_jsons': [],
                'all_jpeg_image_label_jsons': [],
                'augmentation_image_label_jsons': [],
                'number_original_images': '',
                'number_all_jpeg_images': '',
                'number_cropped_images': '',
                'number_augmentation_images':'',
                'original_images_normalized_dataset': '', 
                'cropped_image_normalized_dataset': '',    
                'all_jpeg_normalized_dataset': '',          
                'original_image_label_jsons': [],
                'all_jpeg_image_label_jsons': [],
                'augmentation_image_label_jsons': [],     
                'date_created': ISODate,
                'date_modified': '',
                }
                labels.append(label_dict)
            # update user_projects record
            results = user_projects.find_one_and_update({"_id" : proj_id}, {"$set":{'labels': labels}},upsert=True)
                 
        else:
            pass
        
        
        
        ###############################################################
        #  Save active project in user_session_data
        
        query = {'user_id': session["user"]["_id"] }
        
        # Delete existing user_session data for this user
        try:
            delete_result = user_session_data.delete_one(query)  
        except:
            pass
        
        time.sleep(1)
        # save new active project in users session data
        user_session_data.insert_one({ '_id': uuid.uuid4().hex, 'user_id': session["user"]["_id"], 'active_project': project_id, 'active_label': ''}) 
         
        # Get all of the user's projects
        active_project_query = {'project_js_id': project_id,  'user_id': session["user"]["_id"]}
        results = user_projects.find(active_project_query)
        
        active_project_result ={}
        try:
            active_project_result = results[0]
        except:
            pass
        
        #===========================================================================================
        #  Create GCP Folders for Each Label and A Simple Save Text File to Speed Up Future Transfers
        #===========================================================================================
        for key in y:
            label = key
            try:
                write_text_to_gcp(session["user"]["_id"], project_id, label)
            except:
                pass

          
    return jsonify(user_id = session["user"]["_id"], project_name = project_name, project_id = project_id, labels_color_map = labels_color_map, ISODate = ISODate,num_images = num_images, labeled_images = labeled_images, all_labeled_true_false = all_labeled_true_false, labels = labels_color_map_dict_from_json_string, active_project_result = active_project_result)
    # return redirect('labeling-new.html', user_id = user_id, project_name = project_name, project_id = project_id, labels_color_map = labels_color_map, ISODate = ISODate)



@app.route('/get_user_projects', methods=['POST','GET'])
def get_all_projects():

	query ={'user_id': session["user"]["_id"]}
	results = user_projects.find(query)
	all_projects =[]
	for result in results:
		all_projects.append(result) # 

	return jsonify(all_projects = all_projects)
	# return render_template('labeling-new.html', all_projects = all_projects)

@app.route('/choose_project/', methods=['POST','GET'])
def choose_project():

	query ={'user_id': session["user"]["_id"]}
	results = user_projects.find(query)
	all_projects =[]
	for result in results:
		all_projects.append(result)

	return render_template('projects.html', all_projects = all_projects)

@app.route('/start_new_project/', methods=['POST','GET'])
def start_new_project():

	return render_template('labeling-new-project.html')




@app.route('/set_active_project', methods=['POST','GET'])
def set_active_project():
    
    if request.method =='POST':
        
        project_id = request.form['project_id']
        query = {'user_id': session["user"]["_id"] }
        
        # Delete existing user_session data for this user
        try:
            delete_result = user_session_data.delete_one(query)  
        except:
            pass
        
        time.sleep(1)
        # save new active project in users session data
        user_session_data.insert_one({ '_id': uuid.uuid4().hex, 'user_id': session["user"]["_id"] , 'active_project': project_id, 'active_label': ''}) 
         
        # time.sleep(1)       
        #if user_session_data.find_one(query) :
        #    results = user_session_data.find_one_and_update({'user_id': user_id},{"$set":{'active_project': project_id, 'active_label': ''}},upsert=True)
        
        # Get all of the user's projects
        active_project_query = {'project_js_id': project_id,  'user_id': session["user"]["_id"]}
        results = user_projects.find(active_project_query)
        
        active_project_result =[]
        for result in results:
            active_project_result.append(result)
        
    return jsonify(active_project = project_id, active_label = '', active_project_result = active_project_result)
    #return render_template('labeling-new.html')

@app.route('/set_active_label', methods=['POST','GET'])
def set_active_label():
    
    if request.method =='POST':
        
        project_id = request.form['project_id']
        active_label = request.form['active_label'] 
               
        query = {'user_id': session["user"]["_id"] }
        
        previous_outputs = user_session_data.find(query)
        output = previous_outputs[0]
        previous_project_id =''
        previous_label=''

        try:
          previous_project_id = output['active_project']
          previous_label =  output['active_label']
        except:
            pass
        
        # Delete existing user_session data for this user
        try:
            # delete_result = user_session_data.delete_one(query)  
            delete_result = user_session_data.delete_many(query)              
        except:
            pass
        
        time.sleep(1)
        # save new active project in users session data
        user_session_data.insert_one({ '_id': uuid.uuid4().hex, 'user_id': session["user"]["_id"] , 'active_project': project_id, 'active_label': active_label,'previous_label': previous_label, 'previous_project_id': previous_project_id}) 
        
        # Get all of the user's projects
        active_project_query = {'project_js_id': project_id,  'user_id': session["user"]["_id"]}
        results = user_projects.find(active_project_query)
        
        active_project_result ={}
        original_image_urls = []
        all_jpeg_image_urls = []
        cropped_image_urls = []
        augmentation_image_urls = []
        labelled_original_image_urls = []
        labelled_all_jpeg_image_urls = []
        labelled_cropped_image_urls = []
        labelled_augmentation_image_urls = []
        original_image_label_jsons = []
        all_jpeg_image_label_jsons = []
        augmentation_image_label_jsons = []
        try:
            active_project_result = results[0]
            original_image_urls = get_images_array_from_user_projects(session["user"]["_id"], project_id, active_label, 'original_image_urls')
            all_jpeg_image_urls = get_images_array_from_user_projects(session["user"]["_id"], project_id, active_label, 'all_jpeg_image_urls')
            cropped_image_urls = get_images_array_from_user_projects(session["user"]["_id"], project_id, active_label, 'cropped_image_urls')
            augmentation_image_urls = get_images_array_from_user_projects(session["user"]["_id"], project_id, active_label, 'augmentation_image_urls')
            original_image_label_jsons = get_images_array_from_user_projects(session["user"]["_id"], project_id, active_label, 'original_image_label_jsons')
            all_jpeg_image_label_jsons = get_images_array_from_user_projects(session["user"]["_id"], project_id, active_label, 'all_jpeg_image_label_jsons')
            augmentation_image_label_jsons = get_images_array_from_user_projects(session["user"]["_id"], project_id, active_label, 'augmentation_image_label_jsons')       
        except:
            pass
        
    return jsonify(active_project = project_id, active_label = active_label , active_project_result = active_project_result, previous_label = previous_label, previous_project_id = previous_project_id, original_image_urls = original_image_urls, all_jpeg_image_urls = all_jpeg_image_urls, cropped_image_urls = cropped_image_urls,augmentation_image_urls = augmentation_image_urls,original_image_label_jsons = original_image_label_jsons,all_jpeg_image_label_jsons = all_jpeg_image_label_jsons,augmentation_image_label_jsons = augmentation_image_label_jsons)


@app.route('/delete_project', methods=['POST','GET'])
def delete_project():
    
    if request.method =='POST':
        
        project_id = request.form['project_id']
        
        # Delete selected project
        query ={'user_id': session["user"]["_id"], 'project_js_id': project_id}
        delete_result = user_projects.delete_one(query)
        
        # Get all remaining projects   
        query_remaining_projects ={'user_id': session["user"]["_id"]}
        results_remaining = user_projects.find(query_remaining_projects)
        all_projects =[]
        for result in results_remaining:
            all_projects.append(result)
              
    return render_template('labeling-choose-project.html', all_projects = all_projects)

@app.route('/get_active_project2', methods=['POST','GET'])
def get_active_project2():
    
    if request.method =='POST':
        
        query ={'user_id': session["user"]["_id"]}
        user_session_info = user_session_data.find(query)
        
        active_project_id = user_session_info[0]['active_project']
        active_label = user_session_info[0]['active_label']
        
        active_project_query = {'project_js_id': active_project_id,  'user_id': session["user"]["_id"]}
        
        results = user_projects.find(active_project_query)
        active_project_result = results[0]
        # active_project_id =''
        # active_label =''  
        # results = [] 
        # active_project_result = {}

            
    return jsonify(active_project_id = active_project_id, active_label = active_label, active_project_result = active_project_result)




@app.route('/get_active_project', methods=['POST','GET'])
def get_active_project():
    
    if request.method =='POST':
        
        query ={'user_id': session["user"]["_id"]}
        user_session_info = user_session_data.find(query)
        
        active_project_id = user_session_info[0]['active_project']
        active_label = user_session_info[0]['active_label']
        
        # Get all of the user's projects
        active_project_query = {'project_js_id': active_project_id,  'user_id': session["user"]["_id"]}
        results = user_projects.find(active_project_query)
        
        active_project_result =[]
        for result in results:
            active_project_result.append(result)
 
    return jsonify(active_project_id = active_project_id, active_label = active_label, active_project_result = active_project_result)

@app.route('/upload_images_project_label/', methods=['POST','GET'])
def upload_images_project_label():
	if 'upload_images_project_label[]' not in request.files:
		flash('No image file uploaded')
		return redirect(request.url)

	#if request.method =='POST':
	files = request.files.getlist('upload_images_project_label[]')
	file_names = []
	project_id = request.form['project_id']

 
	return jsonify(project_id = project_id)



@app.route('/xNewDeleteButton', methods=['POST','GET'])
def xNewDeleteButton():
    
    if request.method =='POST':
        
        project_id = request.form['project_id']
        current_folder = request.form['current_folder']        
        
      
    return jsonify(current_folder = current_folder)



@app.route('/atagDelete', methods=['GET']) 
def atagDelete(): 
    
    a = request.args.get('a')
    b = request.args.get('b')
    #active_project_id = request.args.get('project_id')
    active_label_in_project = request.args.get('label')
    
    query ={'user_id': user_id}
    user_session_info = user_session_data.find(query)
    active_project_id = user_session_info[0]['active_project']
    active_label = user_session_info[0]['active_label']
    
    active_project_query = {'project_js_id': active_project_id,  'user_id': session["user"]["_id"]}
    results = user_projects.find(active_project_query)
    
    active_project_result =[]
    for result in results:
        active_project_result.append(result)
        
    # return  'The value of a is: {} and b is  {}'.format(a,b)
    #return render_template('labeling-new.html', a=a, b=b, lat_lng ={a: a, b: b} , active_project_result = active_project_result, active_project_id = active_project_id, active_label = active_label_in_project)
    return jsonify(a=a, b=b, lat_lng ={a: a, b: b} , active_project_result = active_project_result, active_project_id = active_project_id, active_label = active_label_in_project)





@app.route('/upload_x_files/', methods=['POST','GET'])
def upload_x_files():
  
	if 'x-files[]' not in request.files:
		return redirect(request.url)

	file_names = []
	blob_full_path_array = []
 
	files = request.files.getlist('x-files[]')
	xproject_id = request.form['project_id']
	xlabel = request.form['label']
	file_names = []
	bucket_name = session["user"]["gcp_bucket_dict"]["bucket_name"]
	gcp_subdirectory_path = os.path.join(session["user"]["gcp_bucket_dict"]["user_images_subdir"], xproject_id, xlabel)
	target_file_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]
	returned_public_urls =[]
	client = storage.Client()
	bucket = client.get_bucket(bucket_name)

	for file in files:
		if file and (file.filename).lower().endswith(tuple(target_file_types_array)):
			filename = secure_filename(file.filename) 
			file_names.append(filename)
			blob_full_path = os.path.join(gcp_subdirectory_path, filename)
			blob_full_path_array.append(blob_full_path)
   
			blob = bucket.blob(blob_full_path)
			file.seek(0)
			blob.upload_from_string(file.read(), content_type=file.content_type)
			blob_public_url = blob.public_url 
			gcs_url = "https://storage.googleapis.com/{}/{}".format(bucket_name,blob_full_path) 
			returned_public_urls.append(gcs_url) 
      
	label_image_urls = []

	try:
		label_image_urls = get_public_url_files_array_from_google_cloud_storage(bucket_name, gcp_subdirectory_path, target_file_types_array)
  
	except:
		pass

    # Update the original_image_urls array for the label in the database
	user_projects.update_one({ "labels.label": xlabel, 'user_id': session["user"]["_id"],'project_js_id': xproject_id }, { "$set": { "labels.$.original_image_urls": label_image_urls } })

	# Pause for 1 second to allow the database to be updated before querying it
	time.sleep(1)

	# Get all of the user's projects
	active_project_query = {'project_js_id': xproject_id,  'user_id': session["user"]["_id"]}
	results = user_projects.find(active_project_query)
	
	active_project_result ={}
	original_image_urls = []
	all_jpeg_image_urls = []
	cropped_image_urls = []
	augmentation_image_urls = []
	labelled_original_image_urls = []
	labelled_all_jpeg_image_urls = []
	labelled_cropped_image_urls = []
	labelled_augmentation_image_urls = []
	original_image_label_jsons = []
	all_jpeg_image_label_jsons = []
	augmentation_image_label_jsons = []
	try:
		active_project_result = results[0]
		original_image_urls = get_images_array_from_user_projects(session["user"]["_id"], xproject_id, xlabel, 'original_image_urls')
		all_jpeg_image_urls = get_images_array_from_user_projects(session["user"]["_id"], xproject_id, xlabel, 'all_jpeg_image_urls')
		cropped_image_urls = get_images_array_from_user_projects(session["user"]["_id"], xproject_id, xlabel, 'cropped_image_urls')
  
		labelled_original_image_urls = get_images_array_from_user_projects(session["user"]["_id"], xproject_id, xlabel, 'labelled_original_image_urls')
		labelled_all_jpeg_image_urls = get_images_array_from_user_projects(session["user"]["_id"], xproject_id, xlabel, 'labelled_all_jpeg_image_urls')
		labelled_cropped_image_urls = get_images_array_from_user_projects(session["user"]["_id"], xproject_id, xlabel, 'labelled_cropped_image_urls')
		labelled_augmentation_image_urls = get_images_array_from_user_projects(session["user"]["_id"], xproject_id, xlabel, 'labelled_augmentation_image_urls')

		augmentation_image_urls = get_images_array_from_user_projects(session["user"]["_id"], xproject_id, xlabel, 'augmentation_image_urls')
		original_image_label_jsons = get_images_array_from_user_projects(session["user"]["_id"], xproject_id, xlabel, 'original_image_label_jsons')
		all_jpeg_image_label_jsons = get_images_array_from_user_projects(session["user"]["_id"], xproject_id, xlabel, 'all_jpeg_image_label_jsons')
		augmentation_image_label_jsons = get_images_array_from_user_projects(session["user"]["_id"], xproject_id, xlabel, 'augmentation_image_label_jsons')       
	except:
		pass

	query = {'user_id': session["user"]["_id"] }
	previous_outputs = user_session_data.find(query)
	output = previous_outputs[0]
	previous_project_id =''
	previous_label=''

	try:
		previous_project_id = output['active_project']
		previous_label =  output['active_label']
	except:
		pass
	
	# Delete existing user_session data for this user
	try:
		# delete_result = user_session_data.delete_one(query)  
		delete_result = user_session_data.delete_many(query)              
	except:
		pass
	
	time.sleep(1)
	# save new active project in users session data
	user_session_data.insert_one({ '_id': uuid.uuid4().hex, 'user_id': session["user"]["_id"] , 'active_project': xproject_id, 'active_label': xlabel,'previous_label': previous_label, 'previous_project_id': previous_project_id}) 
	

    
	# return render_template('models.html',classification_models_info = classification_models_info, detection_models_info = detection_models_info )
	return jsonify(xproject_id  = xproject_id ,  xlabel = xlabel, active_project = xproject_id, active_label = xlabel, previous_label = previous_label, previous_project_id = previous_project_id, bucket_name = bucket_name, gcp_subdirectory_path = gcp_subdirectory_path, file_names = file_names, blob_full_path_array = blob_full_path_array, returned_public_urls = returned_public_urls, label_image_urls = label_image_urls,active_project_result = active_project_result, original_image_urls = original_image_urls, all_jpeg_image_urls = all_jpeg_image_urls, cropped_image_urls = cropped_image_urls,augmentation_image_urls = augmentation_image_urls,original_image_label_jsons = original_image_label_jsons,all_jpeg_image_label_jsons = all_jpeg_image_label_jsons,augmentation_image_label_jsons = augmentation_image_label_jsons
				  ,labelled_original_image_urls = labelled_original_image_urls, labelled_all_jpeg_image_urls = labelled_all_jpeg_image_urls, labelled_cropped_image_urls = labelled_cropped_image_urls, labelled_augmentation_image_urls = labelled_augmentation_image_urls)


@app.route('/add_label_records', methods=['POST','GET'])
def add_label_records():

    if request.method =='POST':
        
        # user_id = request.form['user_id']
        project_id = request.form['project_id']
        active_label_bucket = request.form['active_label']        
        images_norm_data_label_map = request.form['images_norm_data_label_map']
        IMAGE_URL = request.form['IMAGE_URL']
        # original_image_label_jsons = request.form['original_image_label_jsons']
        labelled_images_string = request.form['labelled_images_array']
      
        images_norm_data_label_map_dict_from_json_string = eval("{0}".format(images_norm_data_label_map))
        labelled_images_array = labelled_images_string.split(",")
        
        original_image_label_jsons = json.loads(request.form['original_image_label_jsons'])
        # original_image_label_jsons = request.form['original_image_label_jsons']
        # original_image_label_jsons_dict_from_json_string = eval("{0}".format(original_image_label_jsons))        
        fabric_canvas_json = request.form['original_image_label_jsons'] 
             
        
        
          
              
        proj_id = uuid.uuid4().hex

		# create project item
        label_record_item = {
          '_id':  proj_id,   
          'project_js_id': project_id,
          'user_id': user_id,
          'labels_color_map': images_norm_data_label_map_dict_from_json_string,
          'active_label_bucket': active_label_bucket,
  		 }
        
        # 
        # sub_directory_path = user_images_json_files_normalized
        # target_file_types_array = ["json", "JSON"]
        # sub_dir_path_with_active_folder = os.path.join(sub_directory_path,project_id, active_label_bucket)
        # gcp_active_directory_file_urls = get_public_url_files_array_from_google_cloud_storage(bucket_name, sub_dir_path_with_active_folder, target_file_types_array)
        # client = storage.Client()
        # bucket = client.get_bucket(bucket_name)
        
        # write_text_to_gcp_for_user_dir_path(user_images_json_files_normalized, session["user"]["_id"], project_id, active_label_bucket)
        # write_text_to_gcp_for_user_dir_path(session["user"]["gcp_bucket_dict"]["user_images_json_files_normalized"], session["user"]["_id"], project_id, active_label_bucket)
                
        # Write Text to json folder to create it before upload of Json
        # write_text_to_gcp_for_json_files(user_id, project_id, active_label_bucket)
        # Save JSON to GCP
        # save_json_to_gcp(user_id, project_id, active_label_bucket,fabric_canvas_json)
        blob_full_path = os.path.join(session["user"]["gcp_bucket_dict"]["user_images_json_files_normalized"], project_id, active_label_bucket, active_label_bucket + ".txt" )
        blob_full_path_norm = os.path.join(session["user"]["gcp_bucket_dict"]["user_images_json_files_normalized"], project_id, active_label_bucket, active_label_bucket + ".json" )
        
        blob_full_path_canvas_txt = os.path.join(session["user"]["gcp_bucket_dict"]["user_images_canvas_jsons_subdir"], project_id, active_label_bucket, active_label_bucket + ".txt" )  
        blob_full_path_canvas = os.path.join(session["user"]["gcp_bucket_dict"]["user_images_canvas_jsons_subdir"], project_id, active_label_bucket, active_label_bucket + ".json" ) 
                     
        gcp_url1 = '' 
        gcp_url2 = ''
        gcp_url3 = ''
        gcp_url_json_norm_data =''
        gcp_url_json_canvas_data =''
        
        if not does_blob_exist_on_gcp(blob_full_path):
          try:
            gcp_url1 = write_text_to_gcp_v2(session["user"]["_id"],blob_full_path)
            time.sleep(0.1)
          except:
            pass    

        if not does_blob_exist_on_gcp(blob_full_path_canvas_txt):
          try:
            gcp_url2 = write_text_to_gcp_v2(session["user"]["_id"],blob_full_path_canvas_txt)
            time.sleep(0.1)
          except:
            pass              
                    
        try:   
          # gcp_url3 = write_text_to_gcp_v2(session["user"]["_id"],blob_full_path_canvas)
         # time.sleep(0.5)         
          gcp_url_json_norm_data = save_json_to_gcp_return_url_v2(blob_full_path_norm, images_norm_data_label_map)          
          time.sleep(0.1)                                        
        except:
          pass
        
        try:
           
          gcp_url_json_canvas_data = save_json_to_gcp_return_url_v2(blob_full_path_canvas, fabric_canvas_json)
          time.sleep(0.1) 
                     
        except:
          pass 
        # time.sleep(0.5) 
        
        # labels_json_urls_norm_data   
        # labels_json_urls_canvas
        
        myProject = user_projects.find_one({ 'user_id': session["user"]["_id"],'project_js_id': project_id  })
        my_norm_data = myProject["labels_json_urls"]["norm_data"] 
        my_canvas_data = myProject["labels_json_urls"]["canvas_json"]
        
        #if gcp_url_json_norm_data and gcp_url_json_canvas_data:     
          #user_projects.update_one({ 'user_id': session["user"]["_id"],'project_js_id': project_id }, { "$push": { "labels_json_urls_norm_data": { active_label_bucket : gcp_url_json_norm_data },  "labels_json_urls_canvas": { active_label_bucket : gcp_url_json_canvas_data } } })   
        
        if not does_pymongo_result_contain_label(my_norm_data, active_label_bucket):   
          query_norm_data = {'user_id': session["user"]["_id"],'project_js_id': project_id  }
          newvalues_norm_data = { "$push": { "labels_json_urls.norm_data": { active_label_bucket : gcp_url_json_norm_data } } }
          user_projects.update_one(query_norm_data, newvalues_norm_data)
          
        if not does_pymongo_result_contain_label(my_canvas_data, active_label_bucket):             
          query_canvas_json = {'user_id': session["user"]["_id"],'project_js_id': project_id }
          newvalues_canvas_json = { "$push": { "labels_json_urls.canvas_json": { active_label_bucket : gcp_url_json_canvas_data} } }
          user_projects.update_one(query_canvas_json, newvalues_canvas_json)
        # time.sleep(1)         
        # save_json_to_gcp(user_images_json_files_normalized, session["user"]["_id"], project_id, active_label_bucket,fabric_canvas_json)
        # session["user"]["gcp_bucket_dict"]["user_images_json_files_normalized"]
        # 
        # gcp_url ="it wrote the text at least..."
        # gcp_url = save_json_to_gcp_return_url(session["user"]["gcp_bucket_dict"]["user_images_json_files_normalized"], session["user"]["_id"], project_id, active_label_bucket,images_norm_data_label_map_dict_from_json_string)        
        
        #time.sleep(0.5)             
        labelled_original_image_urls = get_images_array_from_user_projects(session["user"]["_id"], project_id, active_label_bucket, 'labelled_original_image_urls')
        
        if isElementInArray(IMAGE_URL,labelled_original_image_urls):
          #print('element in array')
          pass
        else:
          #print('element not in array')
          user_projects.update_one({ "labels.label": active_label_bucket, 'user_id': session["user"]["_id"],'project_js_id': project_id}, { "$push": { "labels.$.labelled_original_image_urls": IMAGE_URL} })
        
        
        # query ={'user_id': session["user"]["_id"]}
        # results = user_projects.find(query)
        # all_projects =[]
        # for result in results:
        # all_projects.append(result) # 
        
        
        active_project_query = {'project_js_id': project_id,  'user_id': session["user"]["_id"]}
        results = user_projects.find(active_project_query)
        
        active_project_result =[]
        for result in results:
            active_project_result.append(result)
        # Update original_images_normalized_dataset for the label
        
 # user_projects.update_one({ "labels.label": active_label_bucket, 'user_id': session["user"]["_id"],'project_js_id': project_id }, { "$set": { "labels.$.labelled_original_image_urls": labelled_images_array } })          
        
  
    	# Update original_images_normalized_dataset for the label
     
  #user_projects.update_one({ "labels.label": active_label_bucket, 'user_id': session["user"]["_id"],'project_js_id': project_id }, { "$set": { "labels.$.original_images_normalized_dataset": label_record_item } })
        #time.sleep(1)
  #user_projects.update_one({ "labels.label": active_label_bucket, 'user_id': user_id,'project_js_id': project_id }, { "$set": { "labels.$.original_image_label_jsons": original_image_label_jsons_dict_from_json_string} })                  

    return jsonify(label_record_item = gcp_url_json_norm_data, gcp_url_json_canvas_data = gcp_url_json_canvas_data, IMAGE_URL = IMAGE_URL, active_project_id = project_id, active_label = active_label_bucket, active_project_result = active_project_result)          
    # return jsonify(label_record_item = label_record_item, labelled_images_array = labelled_images_array, original_image_label_jsons = original_image_label_jsons, sub_dir_path_with_active_folder = user_images_json_files_normalized)


@app.route('/get_norm_data', methods=['POST','GET'])
def get_norm_data():
  # API for retrieving normalized data for a project

    if request.method =='POST':
      
        project_id = request.form['project_id']
        
        project_norm_data =  {}
        myProject = user_projects.find_one({'user_id': session["user"]["_id"], 'project_js_id': project_id })
        project_norm_data = myProject["labels_json_urls"]["norm_data"]
        
        
        key_arrays, results_values = get_key_value_arrays(project_norm_data)
        NORM_DATA = []
        for json_url in results_values:
          data_json = get_image_label_json(json_url)
          NORM_DATA.append(eval("{0}".format(data_json))) 
        
             
    return jsonify(norm_data = project_norm_data, new_norm_data = NORM_DATA)          

@app.route('/getdata', methods=['POST','GET'])
def getdata():
  # API for retrieving normalized data for a project fro object detection
  # In this example, the user_id and project_id are fixed. 

    # if request.method =='GET':
      
    project_id = 'lbehbisngqh71en6dv6' # request.form['project_id']
    user_id ='92520572d6ac46b98a61745b61c327e7' # session["user"]["_id"]
    
    project_norm_data =  {}
    myProject = user_projects.find_one({'user_id': user_id, 'project_js_id': project_id })
    project_norm_data = myProject["labels_json_urls"]["norm_data"]
    
    
    key_arrays, results_values = get_key_value_arrays(project_norm_data)
    NORM_DATA = []
    for json_url in results_values:
      data_json = get_image_label_json(json_url)
      NORM_DATA.append(eval("{0}".format(data_json))) 
    
    DATA_JSON_ARRAY = []
    for element in NORM_DATA:
      keys = element.keys()
      for k in keys:
        csv_row_dict = element[k]
        #print(csv_row_dict)
        DATA_JSON_ARRAY.append(csv_row_dict)
            
             
    return jsonify(DATA_JSON_ARRAY)    

@app.route('/train_model', methods=['POST','GET'])
def train_model():

    if request.method =='POST':
        
        # user_id = request.form['user_id']
        project_id = request.form['project_id']
        model_type = request.form['model_type']        
        time_submitted = request.form['time_submitted']
        labels_for_training = request.form['labels_for_training']
        model_name = request.form['model_name']              
        model_id = uuid.uuid4().hex
        
        if model_type=="classification":
          models_root_dir = session["user"]["gcp_bucket_dict"]["user_models_classification_subdir"]
        elif model_type=="object detection":
          models_root_dir = session["user"]["gcp_bucket_dict"]["user_models_detection_subdir"]     
        elif model_type=="audio classification":
          models_root_dir = session["user"]["gcp_bucket_dict"]["user_audio_classification_subdir"]                  
        else  :
          models_root_dir =''      
          
        
        array_labels_for_training = labels_for_training.split(",")
        
        
        labels_full_path_dict = {}
        for x in array_labels_for_training:
          project_label_path_array = x.split('/')
          label = project_label_path_array[1] 
          labels_full_path_dict[label] = os.path.join("gs://", session["user"]["gcp_bucket_dict"]["bucket_name"], session["user"]["gcp_bucket_dict"]["user_images_subdir"],x)
        

        
        # save colab python file and return URL
        
        # insert colab file path into model_item path
        # user_projects.update_one({ 'user_id': session["user"]["_id"],'project_js_id': project_id }, { "$push": { "models.$.classification_models": model_item } }, upsert = True)


        # dir_name = "{}-".format(session["user"]["_id"])  
        # tmp_dir = tempfile.mkdtemp(prefix=dir_name) # create temp_directory

        # filepath = os.path.join(tmp_dir, filename)  
        
        # sum = colab_add_two_numbers(100,100)
        filename = "amina-train-image-classifier.ipynb"       
        nb = create_colab_notebook(labels_full_path_dict, session["user"]["_id"])
        gcs_url = save_colab_notebook_to_gcp(nb, filename, model_id)
        
        # model_item["colab_python_file_url"] = gcs_url
        
        # Delete the temp file
        # shutil.rmtree(filepath)

		# create model item
        model_item = {
          '_id':  model_id,   
          'project_js_id': project_id,
          'user_id': session["user"]["_id"],
          'labels_for_training': array_labels_for_training,
          'string_labels_for_training': labels_for_training,
          'labels_full_path_dict': labels_full_path_dict,
          'training_images_hash_array':'',
          'model_name':  model_name,
          'model_type': model_type,
          'model_version': '',  
          'model_version_history':[],        
          'model_url': '',
          'date_submitted': time_submitted,
          'time_training_started':'',
          'time_training_finished':'',
          'training_status':'',
          'model_evaluations':[],
          'model_shared_with':[],
          'model_deployment_phase':'',
          'model_downloads':[],
          'images_root_dir': os.path.join("gs://", session["user"]["gcp_bucket_dict"]["bucket_name"] , session["user"]["gcp_bucket_dict"]["user_images_subdir"]), 
          'models_root_dir': models_root_dir, 
          'model_latest': '',
          'model_latest_meta_data': '',
          'colab_python_file_url': gcs_url,
  		  }        
        
        # nbf.write(nb, filepath)
        # Update the classification models in projects
        user_projects.update_one({ 'user_id': session["user"]["_id"],'project_js_id': project_id}, { "$push": { "models.classification_models": model_item } })
        
        # upload file to gcp
        #bucket_name = session["user"]["gcp_bucket_dict"]["bucket_name"]
        #user_colab_notebooks_dir = session["user"]["gcp_bucket_dict"]["user_colab_notebooks"]
        #client = storage.Client()
        #bucket = client.get_bucket(bucket_name)
        #sub_dir_path_with_active_folder = os.path.join(user_colab_notebooks_dir,model_id)
        #blob_full_path = os.path.join(sub_dir_path_with_active_folder, filename)
        #blob = bucket.blob(blob_full_path) 
        
              
        #notebook_data = nbf.writes(nb, version=nbf.NO_CONVERT)
        #blob = bucket.blob(blob_full_path)
        #blob.upload_from_string(notebook_data, "application/x-ipynb+json")
        #blob_public_url = blob.public_url 
        #gcs_url = "https://storage.googleapis.com/{}/{}".format(bucket_name,blob_full_path) 
        
        #colab_notebook=''
        
        #with open(filepath) as file:
          #colab_notebook = nbf.read(file, as_version=4) 
          #filename = secure_filename(file.filename) 
          #blob_full_path = os.path.join(sub_dir_path_with_active_folder, filename)
          #blob = bucket.blob(blob_full_path)
          # file.seek(0)
          # content_type=file.content_type
          # blob.upload_from_string(file.read(), content_type=file.content_type)
          #blob.upload_from_string(colab_notebook, "application/x-ipynb+json")
          #blob_public_url = blob.public_url 
          #gcs_url = "https://storage.googleapis.com/{}/{}".format(bucket_name,blob_full_path)     
        
        # gcp_url = upload_colab_notebook_to_gcp(filepath, model_id)
        
        #with open(colab_notebook_url) as f:
        #  colab_notebook = nbf.read(f, as_version=4)
        # nb = nbf.v4.new_notebook()
        # colab_notebook = nbf.read(open(colab_notebook_url),as_version=nbf.NO_CONVERT)
        

          
    return jsonify(model_item = model_item, labels_full_path_dict = labels_full_path_dict, sum = session["user"]["_id"],  colab_notebook =  gcs_url)

@app.route('/train_models/', methods=['POST','GET'])
def train_models():

	query ={'user_id': session["user"]["_id"]}
	results = user_projects.find(query)
	all_projects =[]
	for result in results:
		all_projects.append(result) # 
	# return jsonify(all_projects = all_projects)
	return render_template('training-models.html', all_projects = all_projects)


@app.route('/get_train_models/', methods=['POST','GET'])
def get_train_models():

	query ={'user_id': session["user"]["_id"]}
	results = user_projects.find(query)
	all_projects =[]
	for result in results:
		all_projects.append(result) # 

	return jsonify(all_projects = all_projects)


@app.route('/download_colab_notebook', methods=['POST','GET'])
def download_colab_notebook():

	model_id = request.form['model_id']
	filename = request.form['filename']


	#bucket_name = session["user"]["gcp_bucket_dict"]["bucket_name"]
	#user_colab_notebooks_dir = session["user"]["gcp_bucket_dict"]["user_colab_notebooks"]

	#storage_client = storage.Client()

	#bucket = storage_client.bucket(bucket_name)
	#sub_dir_path_with_active_folder = os.path.join(user_colab_notebooks_dir,model_id)
	#blob_full_path = os.path.join(sub_dir_path_with_active_folder, filename)

	#blob = bucket.blob(blob_full_path)
	#contents = blob.download_as_string()
 
	# notebook_contents = os.environ["GOOGLE_CREDENTIALS"]
 
	# notebook_contents = download_colab_notebook_into_memory(filename, model_id)
 
         # Delete the temp file
        # shutil.rmtree(filepath)
 
 
	filepath,tmp_dir = download_file_from_gcp(filename, model_id)      
 
	with open(filepath) as f:
		colab_notebook = nbf.read(f, as_version=4)
		#nb = nbf.v4.new_notebook()
		#colab_notebook = nbf.read(open(colab_notebook_url),as_version=nbf.NO_CONVERT)

	return jsonify(filepath = filepath, colab_notebook = colab_notebook, tmp_dir = tmp_dir)

@app.route('/delete_tmp_file', methods=['POST','GET'])
def delete_tmp_file():

	# filepath = request.form['filepath']
	tmp_dir = request.form['tmp_dir']
  # Delete temp directory and all files in it
	shutil.rmtree(tmp_dir)
 
	# shutil.rmtree(filepath)
	return jsonify(result="temp directory deleted")


@app.route('/delete_model_item/', methods=['POST','GET'])
def delete_model_item():
  
	colab_url = request.form['colab_url']
	model_name = request.form['model_name']
	model_id  = request.form['model_id']
	model_type  = request.form['model_type']
  
	url_segments = colab_url.rpartition('/')
	gcp_dir_to_delete = url_segments[0]
 
 	# Delete gcp cloud storage subdirectory with the colab file
	bucket_name = session["user"]["gcp_bucket_dict"]["bucket_name"]
	storage_client = storage.Client()
	bucket = storage_client.bucket(bucket_name)
	blob = bucket.blob(gcp_dir_to_delete)
	blob.delete()
 
 	# Delete the model_item for model_id retrieved
	if model_type=="classification":
		user_projects.update_one({'user_id': session["user"]["_id"],'models.classification_models._id': model_id},{ '$pull': { 'models.classification_models': {'_id': model_id } } })
	elif model_type=="object detection":
		user_projects.update_one({'user_id': session["user"]["_id"],'models.object_detection_models._id': model_id},{ '$pull': { 'models.object_detection_models': {'_id': model_id } } }) 
	elif model_type=="audio classification":
		user_projects.update_one({'user_id': session["user"]["_id"],'models.audio_classification_models._id': model_id},{ '$pull': { 'models.audio_classification_models': {'_id': model_id } } })             
	else:
		pass   

 	# Update query results for all projects to repopulate train-models table
	#query ={'user_id': session["user"]["_id"]}
	#results = user_projects.find(query)
	#all_projects =[]
	#for result in results:
	#	all_projects.append(result) # 
	return jsonify(gcp_dir = gcp_dir_to_delete, colab_url = colab_url)
	#return render_template('training-models.html', all_projects = all_projects)


@app.route('/save_trained_model/', methods=['POST'])
def save_trained_model():
  
	#if 'files' not in request.files:
		#flash('No file part')
		#return redirect(request.url)
	#files = request.files.getlist('files')
 
	#user_id = request.form.get('user_id')
	#project_id = request.form.get('project_id')
	#model_id = request.form.get('model_id')
	#model_type = request.form.get('model_type')
	pass
 
 
	return jsonify(result="success"),200




if __name__ == '__main__':
    
    app.run()
