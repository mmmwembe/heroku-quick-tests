from flask import Flask, render_template, session, redirect, url_for, request, jsonify,flash, Blueprint
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
import base64
from PIL import Image
from io import BytesIO
# app.secret_key = 'A0AKR5TGD\ R~XHH!jmN]LWX/,?RT'

from urllib.request import urlopen
from io import BytesIO
from zipfile import ZipFile



#===========================================================
# USER DIRECTORIES
#===========================================================
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

user_id = user_info["_id"]

GCP_BUCKET_DICT = user_info["gcp_bucket_dict"] # ["bucket_name"]
bucket_name = user_info["gcp_bucket_dict"]["bucket_name"]
sub_directory_path = user_info["gcp_bucket_dict"]["user_images_subdir"]
target_file_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]

sub_dir_user_images_for_labeling = user_info["gcp_bucket_dict"]["user_images_subdir"]
allowed_image_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]

cropped_images_subdir = user_info["gcp_bucket_dict"]["cropped_images_subdir"]
cropped_canvas_jsons_subdir = user_info["gcp_bucket_dict"]["cropped_canvas_jsons_subdir"]
cropped_images_csv_files = user_info["gcp_bucket_dict"]["cropped_images_csv_files"]

CURRENTLY_ACTIVE_FOLDER ="dog"

# GCP_STORAGE_TARGET_PATH = os.path.join(path, "Downloads", "file.txt", "/home")


def upload_files_to_gcp(name_of_bucket, subdir_path, active_folder, files_to_upload, allowed_file_types):
	bucket_name = user_info["gcp_bucket_dict"]["bucket_name"]
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

# print(user_info)
del user_info["password"]
# session['user'] = user_info
if user_info:
  try:
    start_session(user_info)
  except:
    pass

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
  for _model_url in models_urls:
    labels = get_labels_from_tflite_model_zipfile(_model_url)
    model_item ={
      'labels': labels, 
      'truncated_labels': truncate_labels(labels, 75),
      'model_url': _model_url,
      'model_name': get_filename_from_path(_model_url),
      'model_type' : model_type
      }
    new_models_array.append(model_item)

  return new_models_array


def truncate_labels(labels, x_value):
  # x_value = integer length for truncating labels
  # eg. x_value = 75
  truncated_labels = labels[:x_value] + (labels[x_value:] and '...')
  
  return truncated_labels



@app.route('/')
def home():

  # bucket_name ="amina-files"
  # sub_directory_path="dust/user2/"
  # target_file_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]
  sub_directory_path = user_info["gcp_bucket_dict"]["user_test_images_subdir"]
  target_file_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]
  sub_dir_path_with_active_folder = os.path.join(sub_directory_path,CURRENTLY_ACTIVE_FOLDER)
  gcp_active_directory_file_urls = get_public_url_files_array_from_google_cloud_storage(bucket_name, sub_dir_path_with_active_folder, target_file_types_array)
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
		sub_directory_path = user_info["gcp_bucket_dict"]["user_images_subdir"]
		target_file_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]
		gcp_public_urls = upload_files_to_gcp(bucket_name, sub_directory_path, CURRENTLY_ACTIVE_FOLDER, files, target_file_types_array)
		sub_dir_path_with_active_folder = os.path.join(sub_directory_path,CURRENTLY_ACTIVE_FOLDER)
		gcp_active_directory_file_urls = get_public_url_files_array_from_google_cloud_storage(bucket_name, sub_dir_path_with_active_folder, target_file_types_array)
		return render_template('labeling.html', filenames=[], images_in_dir = gcp_active_directory_file_urls)   
  
	elif request.form.get('which-form') == 'images-for-testing-object-detection': 
		sub_directory_path = user_info["gcp_bucket_dict"]["user_test_images_subdir"]
		target_file_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]
		gcp_public_urls = upload_files_to_gcp(bucket_name, sub_directory_path, CURRENTLY_ACTIVE_FOLDER, files, target_file_types_array)
		sub_dir_path_with_active_folder = os.path.join(sub_directory_path,CURRENTLY_ACTIVE_FOLDER)
		gcp_active_directory_file_urls = get_public_url_files_array_from_google_cloud_storage(bucket_name, sub_dir_path_with_active_folder, target_file_types_array)
		return render_template('detection.html', filenames=[], images_in_dir = gcp_active_directory_file_urls)   
  
	elif request.form.get('which-form') == 'images-for-testing-classification': 
		sub_directory_path = user_info["gcp_bucket_dict"]["user_test_images_subdir"]
		target_file_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]
		gcp_public_urls = upload_files_to_gcp(bucket_name, sub_directory_path, CURRENTLY_ACTIVE_FOLDER, files, target_file_types_array)
		sub_dir_path_with_active_folder = os.path.join(sub_directory_path,CURRENTLY_ACTIVE_FOLDER)
		gcp_active_directory_file_urls = get_public_url_files_array_from_google_cloud_storage(bucket_name, sub_dir_path_with_active_folder, target_file_types_array)
		return render_template('classify-images.html', filenames=[], images_in_dir = gcp_active_directory_file_urls)  
   
	elif request.form.get('which-form') == 'models-object-detection': 
		sub_directory_path = user_info["gcp_bucket_dict"]["user_models_detection_subdir"]
		target_file_types_array = ["tflite"]  
		gcp_public_urls = upload_files_to_gcp(bucket_name, sub_directory_path, CURRENTLY_ACTIVE_FOLDER, files, target_file_types_array)
		sub_dir_path_with_active_folder = os.path.join(sub_directory_path,CURRENTLY_ACTIVE_FOLDER)
		gcp_active_directory_file_urls = get_public_url_files_array_from_google_cloud_storage(bucket_name, sub_dir_path_with_active_folder, target_file_types_array)
		return render_template('models.html', filenames=[], images_in_dir = gcp_active_directory_file_urls) 
  
	elif request.form.get('which-form') == 'models-classification': 
		sub_directory_path = user_info["gcp_bucket_dict"]["user_models_classification_subdir"]
		target_file_types_array = ["tflite"]  
		gcp_public_urls = upload_files_to_gcp(bucket_name, sub_directory_path, CURRENTLY_ACTIVE_FOLDER, files, target_file_types_array)
		sub_dir_path_with_active_folder = os.path.join(sub_directory_path,CURRENTLY_ACTIVE_FOLDER)
		gcp_active_directory_file_urls = get_public_url_files_array_from_google_cloud_storage(bucket_name, sub_dir_path_with_active_folder, target_file_types_array)
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
	bucket_name = user_info["gcp_bucket_dict"]["bucket_name"]
	sub_directory_path = user_info["gcp_bucket_dict"]["user_images_subdir"]
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
	bucket_name = user_info["gcp_bucket_dict"]["bucket_name"]
	sub_directory_path = user_info["gcp_bucket_dict"]["user_models_detection_subdir"] # user_models_detection_subdir user_images_subdir user_models_classification_subdir
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
	bucket_name = user_info["gcp_bucket_dict"]["bucket_name"]
	# sub_directory_path = user_info["gcp_bucket_dict"]["user_models_detection_subdir"] # user_models_detection_subdir user_images_subdir user_models_classification_subdir
	target_file_types_array = ["tflite"]
	returned_public_urls =[]
	client = storage.Client()
	bucket = client.get_bucket(bucket_name)
	# sub_dir_path_with_active_folder = os.path.join(sub_directory_path,CURRENTLY_ACTIVE_FOLDER)
	classification_sub_directory_path = user_info["gcp_bucket_dict"]["user_models_classification_subdir"] # user_models_detection_subdir user_images_subdir user_models_classification_subdir
	detection_sub_directory_path = user_info["gcp_bucket_dict"]["user_models_detection_subdir"] # user_models_detection_subdir user_images_subdir user_models_classification_subdir 

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
 
	return render_template('upload-test.html',classification_models_info = classification_models_info, detection_models_info = detection_models_info )

@app.route('/upload_classification_tflite_model/', methods=['POST','GET'])
def upload_classification_tflite_model():
  
	data = request.files
	if 'models_classification[]' not in request.files:
		return redirect(request.url)

	files = request.files.getlist('models_classification[]')
	file_names = []
	bucket_name = user_info["gcp_bucket_dict"]["bucket_name"]
	# sub_directory_path = user_info["gcp_bucket_dict"]["user_models_detection_subdir"] # user_models_detection_subdir user_images_subdir user_models_classification_subdir
	target_file_types_array = ["tflite"]
	returned_public_urls =[]
	client = storage.Client()
	bucket = client.get_bucket(bucket_name)
	# sub_dir_path_with_active_folder = os.path.join(sub_directory_path,CURRENTLY_ACTIVE_FOLDER)
	classification_sub_directory_path = user_info["gcp_bucket_dict"]["user_models_classification_subdir"] # user_models_detection_subdir user_images_subdir user_models_classification_subdir
	detection_sub_directory_path = user_info["gcp_bucket_dict"]["user_models_detection_subdir"] # user_models_detection_subdir user_images_subdir user_models_classification_subdir 

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
 
	return render_template('upload-test.html',classification_models_info = classification_models_info, detection_models_info = detection_models_info )

@app.route('/detection/', methods=['POST','GET'])
def detection():
  
	sub_directory_path = user_info["gcp_bucket_dict"]["user_test_images_subdir"]
	target_file_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]    
	gcp_active_directory_file_urls = get_public_url_files_array_from_google_cloud_storage(bucket_name, sub_directory_path, target_file_types_array)
      
	return render_template('detection.html', images_in_dir=gcp_active_directory_file_urls)


@app.route('/classify/', methods=['POST','GET'])
def classify():
  
	sub_directory_path = user_info["gcp_bucket_dict"]["user_test_images_subdir"]  
	target_file_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]      
	gcp_active_directory_file_urls = get_public_url_files_array_from_google_cloud_storage(bucket_name, sub_directory_path, target_file_types_array)
      
	return render_template('classify-images.html', images_in_dir=gcp_active_directory_file_urls)

@app.route('/labeling/', methods=['POST','GET'])
def labeling(): 
    
	sub_directory_path = user_info["gcp_bucket_dict"]["user_images_subdir"]
	target_file_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]    
	gcp_active_directory_file_urls = get_public_url_files_array_from_google_cloud_storage(bucket_name, sub_directory_path, target_file_types_array)
 
	return render_template('labeling.html', images_in_dir=gcp_active_directory_file_urls, user_id = user_id)


@app.route('/models/', methods=['POST','GET'])
def models():
     
	sub_directory_path = user_info["gcp_bucket_dict"]["user_test_images_subdir"]
	target_file_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]    
	gcp_active_directory_file_urls = get_public_url_files_array_from_google_cloud_storage(bucket_name, sub_directory_path, target_file_types_array)
      
	return render_template('models.html', images_in_dir=gcp_active_directory_file_urls)


@app.route('/models_upload/', methods=['POST','GET'])
def models_upload():
  
	bucket_name = user_info["gcp_bucket_dict"]["bucket_name"]
	classification_sub_directory_path = user_info["gcp_bucket_dict"]["user_models_classification_subdir"] # user_models_detection_subdir user_images_subdir user_models_classification_subdir
	detection_sub_directory_path = user_info["gcp_bucket_dict"]["user_models_detection_subdir"] # user_models_detection_subdir user_images_subdir user_models_classification_subdir 
	target_file_types_array = ["tflite"]
 
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

	if request.method == 'GET':
   
		if (request.args.get('submit_delete')):
			# return redirect(url_for('NewDeleteModel'))
			model_name = request.args.get('model_name')
			model_type = request.args.get('model_type')
			return redirect(url_for('NewDeleteModel', model_name=model_name, model_type=model_type))
   

  
	return render_template('upload-test.html', classification_models_info = classification_models_info, detection_models_info = detection_models_info)

@app.route('/delete_model/', methods=['POST','GET'])
def delete_model():
  
	if request.method == 'GET':
		pass

	bucket_name = user_info["gcp_bucket_dict"]["bucket_name"]
	classification_sub_directory_path = user_info["gcp_bucket_dict"]["user_models_classification_subdir"] # user_models_detection_subdir user_images_subdir user_models_classification_subdir
	detection_sub_directory_path = user_info["gcp_bucket_dict"]["user_models_detection_subdir"] # user_models_detection_subdir user_images_subdir user_models_classification_subdir 
	target_file_types_array = ["tflite"]
 
	try:
   # data = json.loads(request.data) 
		# data = json.loads(request.data)
		data = request.get_json(force=True)
		model_url = data.get("model_url",None)
		bucket_url_path='https://storage.googleapis.com/amina-files/'

		delete_file_from_gcpbucket(bucket_name, model_url, bucket_url_path)
  
	except:
		pass
 
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

 
      
	return render_template('upload-test.html', classification_models_info = classification_models_info, detection_models_info = detection_models_info)


@app.route('/NewDeleteModel/', methods=['POST','GET'])

def NewDeleteModel():
  
	model_name_from_post_form =''
	model_from_get_args=''
  
	try:
		model_name_from_post_form = request.form.get('model_name')                            
	except:
		pass  

	try:                            
		model_from_get_args = request.args.get('model_name')
	except:
		pass   
	#if request.method =='POST':
   
		# request_data = request.args.get('dataToPost', None, type=str) # request.get_json()
		#model_url = request_data['model_url']
		#model_name = request_data['model_name']
		#model_type = request_data['model_type']
		#task = request_data['task']
    
		#data = request.get()
		# form_id = request.form.get('id')
		#args =request.view_args
		# content = request.json
		# model_url = content['model_url']
		# model_url = request.form['data-model']
		#model_name = request.form['model_name']
		#model_type = request.form['model_type']
		#task = request.form['task']
	everything="POST data  :" + model_name_from_post_form +  "GET data  :" + model_from_get_args
		##everything = "INFORMATION FROM SERVER - " + "model_url: " + model_url + "model_name : " + model_name + " model_type: " + model_type + " task :" + task
   
	#else:
   
	# args =request.view_args
   
	everything="GET METHOD : "  + str(args)
		#pass

	return jsonify(everything=everything)


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
        cropped_image_file_path = 'static/images/' + user_id + '/cropped-labels/'+ currentFolder + '/' + file_name +  extension.replace(".", "-") + '-' + label_num + '.png'
        # cropped_image_file_path = 'static/images/'  + file_name + extension.replace(".", "-") + '-' + label_num + '.png'

        img = Image.open(BytesIO(base64.decodebytes(bytes(cropped_image_dataURL, "utf-8"))))
        img.save(cropped_image_file_path)
        # saveImageBase42StringAsImage(cropped_image_dataURL)

        # static/images/user1/canvas_jsons
        
        # encoded_string = base64.b64encode(cropped_image_dataURL)
   
    return jsonify(result = 'success', url=cropped_image_file_path)





if __name__ == '__main__':
    
    app.run()
