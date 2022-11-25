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




####################################################################
@app.route('/upload_x_files/', methods=['POST','GET'])
def upload_x_files():
  
	if 'x-files[]' not in request.files:
		return redirect(request.url)

	files = request.files.getlist('x-files[]')
	xproject_id = request.form['project_id']
	xlabel = request.form['label']
	file_names = []
	bucket_name = user_info["gcp_bucket_dict"]["bucket_name"]
	gcp_subdirectory_path = os.path.join(user_info["gcp_bucket_dict"]["user_images_subdir"], xproject_id, xlabel)
	target_file_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]
	returned_public_urls =[]
	client = storage.Client()
	bucket = client.get_bucket(bucket_name)
	# sub_dir_path_with_active_folder = os.path.join(sub_directory_path,CURRENTLY_ACTIVE_FOLDER)
	# classification_sub_directory_path = user_info["gcp_bucket_dict"]["user_models_classification_subdir"] # user_models_detection_subdir user_images_subdir user_models_classification_subdir
	# detection_sub_directory_path = user_info["gcp_bucket_dict"]["user_models_detection_subdir"] # user_models_detection_subdir user_images_subdir user_models_classification_subdir 

	for file in files:
		if file and (file.filename).lower().endswith(tuple(target_file_types_array)):
			filename = secure_filename(file.filename)
			blob_full_path = os.path.join(gcp_subdirectory_path, filename)
			blob = bucket.blob(blob_full_path)
			file.seek(0)
			blob.upload_from_string(file.read(), content_type=file.content_type)
			blob_public_url = blob.public_url 
			# gcs_url = "https://storage.cloud.google.com/{}/{}".format(bucket_name,blob_full_path)
			gcs_url = "https://storage.googleapis.com/{}/{}".format(bucket_name,blob_full_path)
			# returned_public_urls.append(blob_public_url)   
			returned_public_urls.append(gcs_url) 
   
	label_image_urls =[]

	try:
		label_image_urls = get_public_url_files_array_from_google_cloud_storage(bucket_name, gcp_subdirectory_path, target_file_types_array)
  
	except:
		pass

	# return render_template('models.html',classification_models_info = classification_models_info, detection_models_info = detection_models_info )
	return jsonify(returned_public_urls = returned_public_urls,  label_image_urls = label_image_urls)






###################################################################







    my_query = {'project_js_id': active_project_id,  'user_id': user_id}
    all_results = user_projects.find(my_query)
    
    my_results =[]
    for x in all_results:
        my_results.append(x)



@app.route('/train_classification_model', methods=['POST','GET'])
def train_classification_model():

    if request.method =='POST':
        
        project_id = request.form['project_id']
        model_type = request.form['model_type']
        time_submitted = request.form['time_submitted']
        labels_for_training = request.form['labels_for_training']
        model_name = request.form['model_name']
        
        model_id = uuid.uuid4().hex

		# create project item
        model_item = {
			'_id':  model_id,   
			'project_js_id': project_id,
			'model_name': model_name,
			'user_id': session["user"]["_id"],
			'model_type': model_type,
            'time_submitted' : time_submitted,
			'time_training_started': '',
			'time_training_finished': '',
			'labels_for_training': labels_for_training,
   			'images_root_dir': session["user"]["user_images_subdir"],
   			'models_root_dir': session["user"]["user_models_classification_subdir"],
      		'model_url': '',

  		}
        
        
                    
    return jsonify(model="classification...from Flask mate!!!")
    # return redirect('labeling-new.html', user_id = user_id, project_name = project_name, project_id = project_id, labels_color_map = labels_color_map, ISODate = ISODate)













@app.route('/', methods=['POST'])
def upload_images_for_labeling():
	if 'files[]' not in request.files and request.form.get('images-for-labeling') == 'images-for-labeling':
		flash('No file part')
		return redirect(request.url)
	files = request.files.getlist('files[]')
	file_names = []

	returned_public_urls =[]
	client = storage.Client()
	bucket = client.get_bucket(bucket_name)
	sub_dir_path_with_active_folder = os.path.join(sub_directory_path,CURRENTLY_ACTIVE_FOLDER)
	for file in files:
		if file and allowed_file(file.filename):
			filename = secure_filename(file.filename)
			blob_full_path = os.path.join(sub_dir_path_with_active_folder, filename)
			file_names.append(filename)
			file.save(os.path.join(USER_CURRENT_IMG_WORKING_SUBDIR, filename))
			FILE_TO_UPLOAD = file.read()
			blob = bucket.blob(blob_full_path)
			file.seek(0)
			blob.upload_from_string(file.read(), content_type=file.content_type)
			blob_public_url = blob.public_url 
			gcs_url = "https://storage.googleapis.com/{}/{}".format(bucket_name,blob_full_path)
			returned_public_urls.append(gcs_url)      
      
	return render_template('labeling.html', filenames=file_names, images_in_dir=returned_public_urls)



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

def upload_files_to_gcp(sub_directory_path,active_folder,):
  images_list_raw = os.listdir(dir)
  images_list_filtered =[]
  for image in images_list_raw:
    if image.lower().endswith(tuple(["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"])):
      image_path = os.path.join(dir, image)
      images_list_filtered.append(image_path) 
  return images_list_filtered



@app.route('/', methods=['POST'])
def upload_image():
	if 'files[]' not in request.files:
		flash('No file part')
		return redirect(request.url)
	files = request.files.getlist('files[]')
	file_names = []
	returned_public_urls =[]
	models_urls =[]
	client = storage.Client()
	bucket = client.get_bucket(bucket_name)
	if request.form.get('which-form') == 'images-for-labeling':
		sub_directory_path = user_info["gcp_bucket_dict"]["user_images_subdir"]
		target_file_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]
	elif request.form.get('which-form') == 'images-for-testing-object-detection': 
		sub_directory_path = user_info["gcp_bucket_dict"]["user_test_images_subdir"]
		target_file_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]  
	elif request.form.get('which-form') == 'images-for-testing-classification': 
		sub_directory_path = user_info["gcp_bucket_dict"]["user_test_images_subdir"]
		target_file_types_array = ["JPG", "JPEG", "jpg", "jpeg", "png", "PNG"]
	elif request.form.get('which-form') == 'models-object-detection': 
		sub_directory_path = user_info["gcp_bucket_dict"]["user_models_detection_subdir"]
		target_file_types_array = ["tflite"]  
	elif request.form.get('which-form') == 'models-classification': 
		sub_directory_path = user_info["gcp_bucket_dict"]["user_models_classification_subdir"]
		target_file_types_array = ["tflite"]  
   
	sub_dir_path_with_active_folder = os.path.join(sub_directory_path,CURRENTLY_ACTIVE_FOLDER)

	for file in files:
		if file and allowed_file(file.filename):
			filename = secure_filename(file.filename)
			blob_full_path = os.path.join(sub_dir_path_with_active_folder, filename)
			file_names.append(filename)
			blob = bucket.blob(blob_full_path)
			file.seek(0)
			blob.upload_from_string(file.read(), content_type=file.content_type)
			blob_public_url = blob.public_url 
			gcs_url = "https://storage.googleapis.com/{}/{}".format(bucket_name,blob_full_path)
			# returned_public_urls.append(blob_public_url)   
			# returned_public_urls.append(gcs_url)      
	returned_public_urls = get_public_url_files_array_from_google_cloud_storage(bucket_name, sub_directory_path, target_file_types_array) 
	# gcp_active_directory_file_urls = get_public_url_files_array_from_google_cloud_storage(bucket_name, sub_directory_path, target_file_types_array)
 
 # TO DO - Update the images_in_dir below to point to gcp_active_directory_file_urls
	if request.form.get('which-form') == 'images-for-labeling':
			return render_template('labeling.html', filenames=file_names, images_in_dir=returned_public_urls)   

	elif request.form.get('which-form') == 'images-for-testing-object-detection': 
			return render_template('detection.html', filenames=file_names, images_in_dir=returned_public_urls)
 
	elif request.form.get('which-form') == 'images-for-testing-classification':    
			return render_template('classify-images.html', filenames=file_names, images_in_dir=returned_public_urls)
	elif request.form.get('which-form') == 'models-object-detection': 
			return render_template('models.html', filenames=file_names, images_in_dir=returned_public_urls) 
	elif request.form.get('which-form') == 'models-classification': 
			return render_template('models.html', filenames=file_names, images_in_dir=returned_public_urls)
 
	return jsonify({"which-form" : request.form.get('which-form') })
 # return render_template('classify-images.html', filenames=file_names, images_in_dir=returned_public_urls)
	#return render_template('classify-images.html', filenames=file_names, images_in_dir=get_images_list(USER_CURRENT_IMG_WORKING_SUBDIR))
 
 
 
 
 
@app.route('/', methods=['POST'])
def deleteModel():

 
	if request.form.get('which-form') == 'images-for-labeling':

 
  
   
	return jsonify(result="")



        for key in eval(labels_color_map_dict_from_json_string):
            label = key
            label_color = labels_color_map[key]
            label_dict ={
				'label_id': uuid.uuid4().hex,
				'label': label,
				'label_color': label_color,
				'original_image_urls': [],
				'all_jpeg_image_urls': [],
				'cropped_image_urls': [],
				'augmentation_image_urls': [],
				'original_image_label_jsons': [],
				'all_jpeg_image_label_jsons': [],
				'augmentation_image_label_jsons': [],
				'number_original_images': '',
				'number_all_jpeg_images': '',
				'number_cropped_images': '',
				'number_augmentation_images':'',
				'original_image_label_jsons': [],
				'all_jpeg_image_label_jsons': [],
				'augmentation_image_label_jsons': [],     
				'date_created': ISODate,
				'date_modified': '',
			}
            labels.append(label_dict)