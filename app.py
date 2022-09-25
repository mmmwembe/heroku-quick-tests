from flask import Flask, render_template, session, redirect, url_for, request, jsonify,flash
from werkzeug.utils import secure_filename
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
from flask_session import Session
from datetime import timedelta 
# app.secret_key = 'A0AKR5TGD\ R~XHH!jmN]LWX/,?RT'

#===========================================================
# USER DIRECTORIES
#===========================================================
active_folder ="dogs"
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg'])
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

try:
  cluster = MongoClient(os.environ["MONGODB_URL"])
except:
  pass

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


def get_images_list(dir):
  images_list_raw = os.listdir(dir)
  images_list_filtered =[]
  for image in images_list_raw:
    if image.lower().endswith(tuple(["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"])):
      image_path = os.path.join(dir, image)
      images_list_filtered.append(image_path) 
  return images_list_filtered


def create_dir(dir):
  # If directory doe not exist, create it
  isExist = os.path.exists(dir)
  if not isExist:
    # Create a new directory because it does not exist 
    os.makedirs(dir)

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
email='mmm111@hotmail.com'

db = cluster["amina_db"]
users_collection = db["user_login_system"]
pre_approved_email_addresses = db["pre_approved_email_addresses"]

user_info = users_collection.find_one({"email": email})

GCP_BUCKET_DICT = user_info["gcp_bucket_dict"] # ["bucket_name"]
bucket_name = user_info["gcp_bucket_dict"]["bucket_name"]
sub_directory_path = user_info["gcp_bucket_dict"]["user_images_subdir"]
target_file_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]
CURRENTLY_ACTIVE_FOLDER ="dog"

# GCP_STORAGE_TARGET_PATH = os.path.join(path, "Downloads", "file.txt", "/home")


# print(user_info)
del user_info["password"]
# session['user'] = user_info
if user_info:
  try:
    start_session(user_info)
  except:
    pass

@app.route('/')
def home():

  # bucket_name ="amina-files"
  # sub_directory_path="dust/user2/"
  # target_file_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]

  gcp_active_directory_file_urls = get_public_url_files_array_from_google_cloud_storage(bucket_name, sub_directory_path, target_file_types_array)
  # model_urls =get_public_url_files_array_from_google_cloud_storage('2021_tflite_glitch_models', 'stack-plume-dust-classification/', ["tflite", "h5", "keras"])


  return render_template('classify-images.html', images_in_dir = gcp_active_directory_file_urls)
  # return render_template('classify-images.html',models = model_urls, db = cluster["amina_db"], image_list = PUBLIC_URLS_ARRAY, user_info = GCP_BUCKET_DICT )
  # return render_template('classify-images.html', images_in_dir=get_images_list(USER_CURRENT_IMG_WORKING_SUBDIR))

@app.route('/', methods=['POST'])
def upload_image():
	if 'files[]' not in request.files:
		flash('No file part')
		return redirect(request.url)
	files = request.files.getlist('files[]')
	file_names = []

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
			file.save(os.path.join(USER_CURRENT_IMG_WORKING_SUBDIR, filename))
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
      
	return render_template('classify-images.html', filenames=file_names, images_in_dir=returned_public_urls)
	#return render_template('classify-images.html', filenames=file_names, images_in_dir=get_images_list(USER_CURRENT_IMG_WORKING_SUBDIR))

if __name__ == '__main__':
    
    app.run()
